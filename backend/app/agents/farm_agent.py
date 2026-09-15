"""FarmGuard AI Gemini Agent Coordinator.

Orchestrates deterministic farming calculation tools and uses Google Gemini
to provide empathetic, transparent, and structured advisory to Indian farmers.
All numerical calculations originate strictly from the deterministic tool layer.
"""

import os
import re
from typing import Dict, Any, List, Optional, Tuple
from app.models.farm import (
    FarmInput,
    AgentAdviceRequest,
    AgentAdviceResponse,
    ToolTraceItem,
)
from app.tools.farm_tools import (
    get_crop_water_requirement,
    calculate_irrigation,
    calculate_water_savings,
    calculate_crop_residue,
    calculate_environmental_impact,
)

SYSTEM_PROMPT = """You are FarmGuard AI, an India-specific sustainable farming assistant.

CRITICAL ARCHITECTURE RULES:
1. You MUST NEVER calculate, alter, or hallucinate numerical estimates (e.g. irrigation mm, liters saved, stubble tonnage, CO2e). Use ONLY the provided tool outputs.
2. Clearly distinguish between:
   - Calculated tool results
   - Prototype model assumptions
   - External weather data inputs
   - Estimated environmental impact
3. Do NOT claim 'ICAR/PAU guidelines' as authoritative evidence; treat current agricultural constants as prototype assumptions.
4. If the recommended irrigation is 0 mm, DO NOT say 'You definitely do not need irrigation.' Instead state:
   'The current prototype model recommends postponing irrigation under the provided rainfall and soil-moisture assumptions.'
   Never convert an estimate into absolute certainty.

REQUIRED OUTPUT STRUCTURE:
RECOMMENDATION
- Irrigation recommendation (depth and status)
- Tactical timing and field action

WATER IMPACT
- Current water usage (in Liters)
- Recommended water usage (in Liters)
- Potential water savings (in Liters and percentage)

CROP RESIDUE
- Estimated crop residue (tonnes)
- Recommended sustainable management practices (e.g. Super SMS, mulching, bio-decomposer)

ENVIRONMENTAL IMPACT
- Estimated CO2e avoided (kg)
- Estimated PM2.5 avoided (kg)
- Water saved (m3 / Liters)

WHY
- 2 to 4 concise reasons directly citing the tool outputs (moisture level, rain forecast offset, soil retention factor)

ASSUMPTIONS
- Explicitly list prototype assumptions (e.g. 1 acre-mm = 4,046.86 L, standard 5 HP tubewell rate, model retention factors, single-cycle depth)
"""


class FarmGuardAgent:
    """Agent that extracts parameters, invokes deterministic tools, and generates structured advisory."""

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")

    def _extract_farm_input_from_dict_or_text(
        self,
        farm_dict: Optional[Dict[str, Any]],
        message: Optional[str]
    ) -> Tuple[Optional[FarmInput], List[str]]:
        """Extract and validate farm input parameters from structured payload or natural language text."""
        data: Dict[str, Any] = {}
        if farm_dict:
            data.update(farm_dict)

        # If some fields missing, attempt basic extraction from natural language message
        if message:
            msg = message.lower()
            if "crop" not in data:
                for c in ["wheat", "rice", "maize", "sugarcane"]:
                    if c in msg:
                        data["crop"] = c
                        break
            if "area_acres" not in data:
                m = re.search(r"(\d+(?:\.\d+)?)\s*(?:acre|acres|ekad)", msg)
                if m:
                    data["area_acres"] = float(m.group(1))
            if "soil_type" not in data:
                for s in ["sandy loam", "clay loam", "alluvial", "loamy", "clayey", "sandy", "black", "red"]:
                    if s in msg:
                        data["soil_type"] = s
                        break
            if "current_irrigation_mm" not in data:
                m = re.search(r"(\d+(?:\.\d+)?)\s*(?:mm|millimeters)", msg)
                if m:
                    data["current_irrigation_mm"] = float(m.group(1))
            if "soil_moisture_percent" not in data:
                m = re.search(r"(?:moisture|soil moisture)(?:\s+is|\s*[:=])?\s*(\d+(?:\.\d+)?)\s*%", msg)
                if m:
                    data["soil_moisture_percent"] = float(m.group(1))
            if "rainfall_probability" not in data:
                m = re.search(r"(?:rain|rainfall|precipitation)(?:\s+probability|\s+chance)?(?:\s+is|\s*[:=])?\s*(\d+(?:\.\d+)?)\s*%", msg)
                if m:
                    data["rainfall_probability"] = float(m.group(1))
            if "location" not in data:
                for loc in ["uttar pradesh", "punjab", "haryana", "bihar", "madhya pradesh", "rajasthan", "gujarat", "maharashtra"]:
                    if loc in msg:
                        data["location"] = loc.title()
                        break

        # Check required fields
        required_fields = [
            "crop",
            "area_acres",
            "soil_type",
            "current_irrigation_mm",
            "location",
            "rainfall_probability",
            "soil_moisture_percent",
        ]
        missing = [f for f in required_fields if f not in data or data[f] is None]
        if missing:
            return None, missing

        try:
            farm_input = FarmInput(**data)
            return farm_input, []
        except Exception:
            return None, missing

    def _execute_tools(self, farm_input: FarmInput) -> Tuple[Dict[str, Any], List[ToolTraceItem]]:
        """Execute deterministic farm calculation tools and track execution trace."""
        tool_trace: List[ToolTraceItem] = []

        # 1. get_crop_water_requirement
        water_req = get_crop_water_requirement(
            crop=farm_input.crop,
            soil_type=farm_input.soil_type,
        )
        tool_trace.append(ToolTraceItem(tool="get_crop_water_requirement", status="completed"))

        # 2. calculate_irrigation
        irrigation_rec = calculate_irrigation(
            crop=farm_input.crop,
            area_acres=farm_input.area_acres,
            soil_type=farm_input.soil_type,
            current_irrigation_mm=farm_input.current_irrigation_mm,
            location=farm_input.location,
            rainfall_probability=farm_input.rainfall_probability,
            soil_moisture_percent=farm_input.soil_moisture_percent,
        )
        tool_trace.append(ToolTraceItem(tool="calculate_irrigation", status="completed"))

        # 3. calculate_water_savings
        water_savings = calculate_water_savings(
            crop=farm_input.crop,
            area_acres=farm_input.area_acres,
            soil_type=farm_input.soil_type,
            current_irrigation_mm=farm_input.current_irrigation_mm,
            recommended_irrigation_mm=irrigation_rec["recommended_irrigation_mm"],
            location=farm_input.location,
            rainfall_probability=farm_input.rainfall_probability,
            soil_moisture_percent=farm_input.soil_moisture_percent,
        )
        tool_trace.append(ToolTraceItem(tool="calculate_water_savings", status="completed"))

        # 4. calculate_crop_residue
        crop_residue = calculate_crop_residue(
            crop=farm_input.crop,
            area_acres=farm_input.area_acres,
            soil_type=farm_input.soil_type,
            current_irrigation_mm=farm_input.current_irrigation_mm,
            location=farm_input.location,
            rainfall_probability=farm_input.rainfall_probability,
            soil_moisture_percent=farm_input.soil_moisture_percent,
        )
        tool_trace.append(ToolTraceItem(tool="calculate_crop_residue", status="completed"))

        # 5. calculate_environmental_impact
        env_impact = calculate_environmental_impact(
            crop=farm_input.crop,
            area_acres=farm_input.area_acres,
            current_irrigation_mm=farm_input.current_irrigation_mm,
            recommended_irrigation_mm=irrigation_rec["recommended_irrigation_mm"],
            soil_type=farm_input.soil_type,
            location=farm_input.location,
            rainfall_probability=farm_input.rainfall_probability,
            soil_moisture_percent=farm_input.soil_moisture_percent,
        )
        tool_trace.append(ToolTraceItem(tool="calculate_environmental_impact", status="completed"))

        numerical_results = {
            "crop_water_requirement": water_req,
            "irrigation_recommendation": irrigation_rec,
            "water_analysis": water_savings,
            "residue_estimate": crop_residue,
            "environmental_impact": env_impact,
        }

        return numerical_results, tool_trace

    def _generate_deterministic_explanation(
        self,
        farm_input: FarmInput,
        num_res: Dict[str, Any]
    ) -> str:
        """Generate structured advisory adhering to exact architectural guidelines when offline/testing."""
        irrig = num_res["irrigation_recommendation"]
        water = num_res["water_analysis"]
        res = num_res["residue_estimate"]
        env = num_res["environmental_impact"]
        crop_req = num_res["crop_water_requirement"]

        if irrig["recommended_irrigation_mm"] == 0.0:
            rec_text = (
                f"- Recommendation: 0.0 mm (The current prototype model recommends postponing irrigation "
                f"under the provided rainfall and soil-moisture assumptions).\n"
                f"- Status: {irrig['status']}\n"
                f"- Timing & Field Action: {irrig['action']}"
            )
        else:
            rec_text = (
                f"- Recommendation: Apply {irrig['recommended_irrigation_mm']} mm depth across {farm_input.area_acres} acres.\n"
                f"- Status: {irrig['status']} (Urgency: {irrig['urgency']})\n"
                f"- Timing & Field Action: {irrig['action']}"
            )

        practices_list = "\n".join([f"  * {p}" for p in res["recommended_practices"]])

        reasons = [
            f"Current soil moisture is at {farm_input.soil_moisture_percent:.1f}% against a target threshold of {crop_req['target_moisture_percent']:.1f}% (deficit of {irrig['soil_depletion_percent']:.1f}%).",
            f"Forecasted rainfall probability of {farm_input.rainfall_probability * 100:.0f}% provides an estimated natural precipitation credit of ~{irrig['expected_rain_offset_mm']:.1f} mm.",
            f"Soil retention factor for {farm_input.soil_type} is {crop_req['soil_retention_factor']}x, adjusting water percolation losses.",
        ]
        why_text = "\n".join([f"- {r}" for r in reasons])

        explanation = f"""### RECOMMENDATION
{rec_text}

### WATER IMPACT
- Current planned water: {water['current_water_liters']:,.1f} Liters
- Recommended water: {water['recommended_water_liters']:,.1f} Liters
- Potential water savings: {water['water_savings_liters']:,.1f} Liters ({water['water_savings_percent']:.1f}% reduction)
- Estimated pump hours saved: ~{water['diesel_or_electricity_savings_hours']:.1f} hours

### CROP RESIDUE
- Estimated {farm_input.crop.capitalize()} residue: {res['estimated_residue_tonnes']:.2f} Tonnes
- Stubble burning propensity: {res['stubble_burning_risk']}
- Recommended sustainable practices:
{practices_list}
- Estimated valorization value: ₹{res['economic_potential_inr']:,.1f} INR

### ENVIRONMENTAL IMPACT
- Estimated CO2e avoided: {env['co2e_avoided_kg']:,.1f} kg (by preventing open stubble burning)
- Estimated PM2.5 emissions avoided: {env['pm25_avoided_kg']:.2f} kg
- Water volume saved: {env['water_saved_cubic_meters']:,.2f} m³ ({env['water_saved_liters']:,.1f} Liters)
- Soil Health Benefit: {env['soil_health_benefit']}

### WHY
{why_text}

### ASSUMPTIONS
- Prototype volumetric baseline: 1 acre-mm = 4,046.86 Liters of water.
- Tubewell pump discharge estimated at 28,000 Liters/hour (standard 5 HP centrifugal pump).
- Water savings and emissions figures reflect prototype mathematical models rather than verified sensor ground truth.
- Natural rain discount is estimated from probability thresholds and should be cross-verified with local weather updates.
"""
        return explanation.strip()

    def _call_gemini_synthesis(
        self,
        farm_input: FarmInput,
        num_res: Dict[str, Any],
        user_message: Optional[str] = None
    ) -> str:
        """Invoke Google Gemini SDK with verified tool outputs to generate natural language advisory."""
        if not self.api_key:
            return self._generate_deterministic_explanation(farm_input, num_res)

        try:
            from google import genai
            client = genai.Client(api_key=self.api_key)

            prompt = (
                f"FARM DATA:\n"
                f"- Crop: {farm_input.crop}\n"
                f"- Area: {farm_input.area_acres} acres\n"
                f"- Soil Type: {farm_input.soil_type}\n"
                f"- Location: {farm_input.location}\n"
                f"- Soil Moisture: {farm_input.soil_moisture_percent}%\n"
                f"- Rain Probability: {farm_input.rainfall_probability * 100}%\n"
                f"- Current Irrigation: {farm_input.current_irrigation_mm} mm\n\n"
                f"DETERMINISTIC TOOL RESULTS (DO NOT RECALCULATE NUMBERS):\n"
                f"{num_res}\n\n"
                f"USER QUERY: {user_message or 'Please provide comprehensive farming advice.'}\n\n"
                f"Please synthesize the response strictly adhering to the requested sections (RECOMMENDATION, WATER IMPACT, CROP RESIDUE, ENVIRONMENTAL IMPACT, WHY, ASSUMPTIONS)."
            )

            # Standard flash model call via google-genai SDK
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,
                config={"system_instruction": SYSTEM_PROMPT, "temperature": 0.2},
            )
            if response and response.text:
                return response.text.strip()
            return self._generate_deterministic_explanation(farm_input, num_res)
        except Exception:
            # Safe fallback if API call fails or key is invalid
            return self._generate_deterministic_explanation(farm_input, num_res)

    def get_advice(self, request: AgentAdviceRequest) -> AgentAdviceResponse:
        """Main agent entrypoint to evaluate farm status and deliver structured advice."""
        farm_input, missing_fields = self._extract_farm_input_from_dict_or_text(
            farm_dict=request.farm,
            message=request.message,
        )

        if not farm_input:
            field_name_map = {
                "crop": "crop type (e.g. wheat, rice, maize, sugarcane)",
                "area_acres": "farm area (in acres)",
                "soil_type": "soil type (e.g. sandy loam, clayey, alluvial, loamy, black)",
                "current_irrigation_mm": "recent / planned irrigation depth (in mm)",
                "location": "farm location / state (e.g. Uttar Pradesh, Punjab)",
                "rainfall_probability": "rainfall forecast probability (e.g. 70% or 0.7)",
                "soil_moisture_percent": "current soil moisture level (e.g. 64%)",
            }
            human_fields = [field_name_map.get(f, f.replace("_", " ")) for f in missing_fields]
            bullet_points = "\n".join([f"{i+1}. {name}" for i, name in enumerate(human_fields)])
            clarification_answer = (
                f"Please provide:\n"
                f"{bullet_points}"
            )
            return AgentAdviceResponse(
                answer=clarification_answer,
                recommendation={
                    "status": "Incomplete Farm Data",
                    "action": "Please provide missing farm parameters to proceed with analysis."
                },
                tool_trace=[],
                numerical_results=None,
                assumptions=["Analysis requires baseline farm parameters."],
                missing_fields=missing_fields,
            )

        # 1. Execute deterministic tools
        numerical_results, tool_trace = self._execute_tools(farm_input)

        # 2. Synthesize explanation via Gemini (or safe deterministic synthesis)
        answer = self._call_gemini_synthesis(
            farm_input=farm_input,
            num_res=numerical_results,
            user_message=request.message,
        )

        irrig = numerical_results["irrigation_recommendation"]
        recommendation_summary = {
            "recommended_irrigation_mm": irrig["recommended_irrigation_mm"],
            "status": irrig["status"],
            "urgency": irrig["urgency"],
            "action": irrig["action"],
        }

        assumptions_list = [
            "Calculations reflect prototype agronomic models and are not guaranteed real-world outcomes.",
            "Water volume conversion assumes 1 acre-mm = 4,046.86 Liters.",
            "Tubewell pumping estimates assume a standard 5 HP pump rate (~28,000 L/hr).",
            "Avoided emissions assume prevention of open field stubble combustion.",
            "Weather rainfall discount is based on probabilistic forecast credit.",
        ]

        return AgentAdviceResponse(
            answer=answer,
            recommendation=recommendation_summary,
            tool_trace=tool_trace,
            numerical_results=numerical_results,
            assumptions=assumptions_list,
            missing_fields=None,
        )
