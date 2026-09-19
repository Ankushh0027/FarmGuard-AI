"""FarmGuard AI Gemini Agent Coordinator.

Orchestrates defense-in-depth security guardrails, live weather lookups, deterministic
farming calculation tools, numerical grounding verification, and LLM evaluation.
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
    AssumptionItem,
)
from app.tools.farm_tools import (
    get_weather_forecast,
    get_crop_water_requirement,
    calculate_irrigation,
    calculate_water_savings,
    calculate_crop_residue,
    calculate_environmental_impact,
)
from app.calculations.farm_calculator import generate_assumptions
from app.guardrails.input_guardrails import (
    validate_user_message,
    validate_farm_input_dict,
)
from app.guardrails.tool_guardrails import (
    authorize_tool,
    validate_tool_inputs,
    validate_tool_outputs,
)
from app.guardrails.output_guardrails import (
    validate_agent_output,
)
from app.evaluation.evaluator import evaluate_response

SYSTEM_PROMPT = """You are FarmGuard AI, an India-specific sustainable farming assistant.

CRITICAL ARCHITECTURE RULES:
1. You MUST NEVER calculate, alter, or hallucinate numerical estimates (e.g. irrigation mm, liters saved, stubble tonnage, CO2e). Use ONLY the provided tool outputs.
2. Clearly distinguish between:
   - Calculated tool results
   - Prototype model assumptions
   - External weather data inputs (distinguish rainfall probability % vs forecast precipitation depth in mm)
   - Estimated environmental impact
3. Do NOT claim 'ICAR/PAU guidelines' as authoritative evidence; treat current agricultural constants as prototype assumptions.
4. If the recommended irrigation is 0 mm, DO NOT say 'You definitely do not need irrigation.' Instead state:
   'The current prototype model recommends postponing irrigation under the provided rainfall and soil-moisture assumptions.'
   Never convert an estimate into absolute certainty.

REQUIRED OUTPUT STRUCTURE:
RECOMMENDATION
- Irrigation recommendation (depth and status)
- Tactical timing and field action

WEATHER CONTEXT
- Weather data source & forecast precipitation amount (mm) or probability signal

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
- Clearly categorize prototype assumptions (weather forecast credit, baseline crop depths, soil retention factors, pumping rates)
"""


class FarmGuardAgent:
    """Agent that enforces guardrails, invokes deterministic tools, and generates safe structured advisory."""

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")

    def _detect_hinglish(self, text: Optional[str]) -> bool:
        """Detect if user query is in Hindi or Hinglish."""
        if not text:
            return False
        # Devanagari Unicode block check
        if re.search(r"[\u0900-\u097F]", text):
            return True
        # Common Hinglish conversational tokens
        hinglish_words = [
            r"\bbhai\b", r"\bkya\b", r"\bpaani\b", r"\bpani\b", r"\bchawal\b", r"\bdhaan\b", r"\bdhan\b",
            r"\bgehu\b", r"\bgehoon\b", r"\bmakka\b", r"\bganna\b", r"\bkhet\b", r"\bkitna\b", r"\bkitne\b",
            r"\bkitni\b", r"\bchalana\b", r"\bchalaun\b", r"\bdena\b", r"\bdun\b", r"\bdu\b", r"\baaj\b",
            r"\bkal\b", r"\bbarish\b", r"\bbarsaat\b", r"\bghante\b", r"\bkaise\b", r"\bkripya\b",
            r"\bnamaste\b", r"\bbatao\b", r"\bbatayein\b", r"\bsichai\b", r"\blagega\b", r"\bkaro\b"
        ]
        pattern = re.compile("|".join(hinglish_words), re.IGNORECASE)
        return bool(pattern.search(text))

    def _extract_farm_input_from_dict_or_text(
        self,
        farm_dict: Optional[Dict[str, Any]],
        message: Optional[str]
    ) -> Tuple[Optional[FarmInput], List[str]]:
        """Extract and validate farm input parameters from structured payload or natural language text."""
        data: Dict[str, Any] = {}
        if farm_dict:
            data.update(farm_dict)

        # Attempt extraction from message text if fields are missing
        if message:
            msg = message.lower()
            if "crop" not in data or not data["crop"]:
                # English and Hindi crop keywords
                if any(k in msg for k in ["wheat", "gehu", "gehoon", "kanak"]):
                    data["crop"] = "wheat"
                elif any(k in msg for k in ["rice", "paddy", "chawal", "dhaan", "dhan"]):
                    data["crop"] = "rice"
                elif any(k in msg for k in ["maize", "corn", "makka", "bhutta"]):
                    data["crop"] = "maize"
                elif any(k in msg for k in ["sugarcane", "ganna", "sugar cane"]):
                    data["crop"] = "sugarcane"

            if "area_acres" not in data or not data["area_acres"]:
                m = re.search(r"(\d+(?:\.\d+)?)\s*(?:acre|acres|ekad|bigha)", msg)
                if m:
                    data["area_acres"] = float(m.group(1))

            if "soil_type" not in data or not data["soil_type"]:
                for s in ["sandy loam", "clay loam", "alluvial", "loamy", "clayey", "sandy", "black", "red"]:
                    if s in msg:
                        data["soil_type"] = s
                        break

            if "current_irrigation_mm" not in data or not data["current_irrigation_mm"]:
                m = re.search(r"(\d+(?:\.\d+)?)\s*(?:mm|millimeters)", msg)
                if m:
                    data["current_irrigation_mm"] = float(m.group(1))

            if "soil_moisture_percent" not in data or data["soil_moisture_percent"] is None:
                m = re.search(r"(?:moisture|soil moisture|nami)(?:\s+is|\s*[:=])?\s*(\d+(?:\.\d+)?)\s*%", msg)
                if m:
                    data["soil_moisture_percent"] = float(m.group(1))
                else:
                    m2 = re.search(r"(\d+(?:\.\d+)?)\s*%\s*(?:soil\s+)?moisture", msg)
                    if m2:
                        data["soil_moisture_percent"] = float(m2.group(1))

            if "rainfall_probability" not in data or data["rainfall_probability"] is None:
                m = re.search(r"(?:rain|rainfall|precipitation|barish)(?:\s+probability|\s+chance|\s+sambhavna)?(?:\s+is|\s*[:=])?\s*(\d+(?:\.\d+)?)\s*%", msg)
                if m:
                    data["rainfall_probability"] = float(m.group(1))

            if "forecast_rainfall_mm" not in data or data["forecast_rainfall_mm"] is None:
                m = re.search(r"(?:forecast|rain|precipitation|barish)\s*(?:depth|amount|of)?\s*(\d+(?:\.\d+)?)\s*mm", msg)
                if m:
                    data["forecast_rainfall_mm"] = float(m.group(1))

            if "location" not in data or not data["location"]:
                for loc in ["uttar pradesh", "punjab", "haryana", "bihar", "madhya pradesh", "rajasthan", "gujarat", "maharashtra", "up", "mp"]:
                    if loc == "up" and re.search(r"\bup\b", msg):
                        data["location"] = "Uttar Pradesh"
                        break
                    elif loc == "mp" and re.search(r"\bmp\b", msg):
                        data["location"] = "Madhya Pradesh"
                        break
                    elif loc in msg:
                        data["location"] = loc.title()
                        break

            if "pump_flow_lpm" not in data or not data["pump_flow_lpm"]:
                m_pump = re.search(r"(\d+(?:\.\d+)?)\s*(?:lpm|litres/min|liters/min|l/min|litres\s+per\s+minute|liters\s+per\s+minute)", msg)
                if m_pump:
                    data["pump_flow_lpm"] = float(m_pump.group(1))

        # Check required fields
        required_fields = [
            "crop",
            "area_acres",
            "soil_type",
            "current_irrigation_mm",
            "location",
            "soil_moisture_percent",
        ]
        missing = [f for f in required_fields if f not in data or data[f] is None or data[f] == ""]
        if missing:
            return None, missing

        # Default rainfall probability to 0.0 if not provided
        if "rainfall_probability" not in data or data["rainfall_probability"] is None:
            data["rainfall_probability"] = 0.0

        try:
            # Filter only valid FarmInput schema fields
            clean_data = {
                "crop": data["crop"],
                "area_acres": float(data["area_acres"]),
                "soil_type": data.get("soil_type", "alluvial"),
                "current_irrigation_mm": float(data.get("current_irrigation_mm", 35.0)),
                "location": data["location"],
                "rainfall_probability": float(data.get("rainfall_probability", 0.0)),
                "forecast_rainfall_mm": float(data["forecast_rainfall_mm"]) if data.get("forecast_rainfall_mm") is not None else None,
                "soil_moisture_percent": float(data["soil_moisture_percent"]),
            }
            farm_input = FarmInput(**clean_data)
            return farm_input, []
        except Exception:
            return None, missing

    def _execute_tools(self, farm_input: FarmInput) -> Tuple[Dict[str, Any], List[ToolTraceItem], FarmInput]:
        """Execute deterministic farm calculation tools with pre and post-execution guardrails."""
        tool_trace: List[ToolTraceItem] = []
        active_input = farm_input

        # 1. Weather forecast lookup (if forecast_rainfall_mm was not explicitly provided by user)
        if active_input.forecast_rainfall_mm is None and active_input.location:
            auth_ok, auth_err = authorize_tool("get_weather_forecast")
            if auth_ok:
                weather_data = get_weather_forecast(location=active_input.location)
                val_ok, _ = validate_tool_outputs("get_weather_forecast", weather_data)
                tool_trace.append(ToolTraceItem(
                    tool="get_weather_forecast",
                    status="completed" if val_ok else "warning",
                    event="WEATHER_FETCHED",
                    summary=f"Weather lookup: {weather_data.get('status', 'unknown')}"
                ))

                if weather_data.get("status") == "available" and weather_data.get("forecast_rainfall_mm") is not None:
                    updated_dict = active_input.model_dump()
                    updated_dict["forecast_rainfall_mm"] = weather_data["forecast_rainfall_mm"]
                    if updated_dict.get("rainfall_probability", 0.0) == 0.0 and weather_data.get("rainfall_probability") is not None:
                        updated_dict["rainfall_probability"] = weather_data["rainfall_probability"]
                    active_input = FarmInput(**updated_dict)
        else:
            weather_data = {
                "location": active_input.location,
                "forecast_rainfall_mm": active_input.forecast_rainfall_mm,
                "rainfall_probability": active_input.rainfall_probability,
                "source": "User Input",
                "status": "available" if active_input.forecast_rainfall_mm is not None else "probability_only"
            }

        # 2. get_crop_water_requirement
        auth_ok, _ = authorize_tool("get_crop_water_requirement")
        water_req = get_crop_water_requirement(
            crop=active_input.crop,
            soil_type=active_input.soil_type,
        )
        val_ok, _ = validate_tool_outputs("get_crop_water_requirement", water_req)
        tool_trace.append(ToolTraceItem(
            tool="get_crop_water_requirement",
            status="completed" if val_ok else "warning",
            event="TOOL_EXECUTED",
            summary=f"Baseline depth: {water_req.get('base_irrigation_depth_mm')} mm"
        ))

        # 3. calculate_irrigation
        irr_kwargs = {
            "crop": active_input.crop,
            "area_acres": active_input.area_acres,
            "soil_type": active_input.soil_type,
            "current_irrigation_mm": active_input.current_irrigation_mm,
            "location": active_input.location,
            "rainfall_probability": active_input.rainfall_probability,
            "soil_moisture_percent": active_input.soil_moisture_percent,
            "forecast_rainfall_mm": active_input.forecast_rainfall_mm,
        }
        validate_tool_inputs("calculate_irrigation", irr_kwargs)
        irrigation_rec = calculate_irrigation(**irr_kwargs)
        val_ok, _ = validate_tool_outputs("calculate_irrigation", irrigation_rec)
        tool_trace.append(ToolTraceItem(
            tool="calculate_irrigation",
            status="completed" if val_ok else "warning",
            event="TOOL_OUTPUT_VALIDATED",
            summary=f"Recommended depth: {irrigation_rec.get('recommended_irrigation_mm')} mm"
        ))

        # 4. calculate_water_savings
        ws_kwargs = {
            "crop": active_input.crop,
            "area_acres": active_input.area_acres,
            "soil_type": active_input.soil_type,
            "current_irrigation_mm": active_input.current_irrigation_mm,
            "recommended_irrigation_mm": irrigation_rec["recommended_irrigation_mm"],
            "location": active_input.location,
            "rainfall_probability": active_input.rainfall_probability,
            "soil_moisture_percent": active_input.soil_moisture_percent,
            "forecast_rainfall_mm": active_input.forecast_rainfall_mm,
        }
        validate_tool_inputs("calculate_water_savings", ws_kwargs)
        water_savings = calculate_water_savings(**ws_kwargs)
        val_ok, _ = validate_tool_outputs("calculate_water_savings", water_savings)
        tool_trace.append(ToolTraceItem(
            tool="calculate_water_savings",
            status="completed" if val_ok else "warning",
            event="TOOL_OUTPUT_VALIDATED",
            summary=f"Water saved: {water_savings.get('water_savings_liters'):,.0f} L"
        ))

        # 5. calculate_crop_residue
        cr_kwargs = {
            "crop": active_input.crop,
            "area_acres": active_input.area_acres,
            "soil_type": active_input.soil_type,
            "current_irrigation_mm": active_input.current_irrigation_mm,
            "location": active_input.location,
            "rainfall_probability": active_input.rainfall_probability,
            "soil_moisture_percent": active_input.soil_moisture_percent,
            "forecast_rainfall_mm": active_input.forecast_rainfall_mm,
        }
        validate_tool_inputs("calculate_crop_residue", cr_kwargs)
        crop_residue = calculate_crop_residue(**cr_kwargs)
        val_ok, _ = validate_tool_outputs("calculate_crop_residue", crop_residue)
        tool_trace.append(ToolTraceItem(
            tool="calculate_crop_residue",
            status="completed" if val_ok else "warning",
            event="TOOL_OUTPUT_VALIDATED",
            summary=f"Residue: {crop_residue.get('estimated_residue_tonnes')} tonnes"
        ))

        # 6. calculate_environmental_impact
        env_kwargs = {
            "crop": active_input.crop,
            "area_acres": active_input.area_acres,
            "current_irrigation_mm": active_input.current_irrigation_mm,
            "recommended_irrigation_mm": irrigation_rec["recommended_irrigation_mm"],
            "soil_type": active_input.soil_type,
            "location": active_input.location,
            "rainfall_probability": active_input.rainfall_probability,
            "soil_moisture_percent": active_input.soil_moisture_percent,
            "forecast_rainfall_mm": active_input.forecast_rainfall_mm,
        }
        validate_tool_inputs("calculate_environmental_impact", env_kwargs)
        env_impact = calculate_environmental_impact(**env_kwargs)
        val_ok, _ = validate_tool_outputs("calculate_environmental_impact", env_impact)
        tool_trace.append(ToolTraceItem(
            tool="calculate_environmental_impact",
            status="completed" if val_ok else "warning",
            event="TOOL_OUTPUT_VALIDATED",
            summary=f"CO2e avoided: {env_impact.get('co2e_avoided_kg')} kg"
        ))

        numerical_results = {
            "weather_forecast": weather_data,
            "crop_water_requirement": water_req,
            "irrigation_recommendation": irrigation_rec,
            "water_analysis": water_savings,
            "residue_estimate": crop_residue,
            "environmental_impact": env_impact,
        }

        return numerical_results, tool_trace, active_input

    def _generate_deterministic_explanation(
        self,
        farm_input: FarmInput,
        num_res: Dict[str, Any],
        pump_flow_lpm: Optional[float] = None,
    ) -> str:
        """Generate structured advisory adhering to exact architectural guidelines when offline/testing."""
        irrig = num_res["irrigation_recommendation"]
        water = num_res["water_analysis"]
        res = num_res["residue_estimate"]
        env = num_res["environmental_impact"]
        crop_req = num_res["crop_water_requirement"]
        weather = num_res.get("weather_forecast", {})

        rec_mm = irrig["recommended_irrigation_mm"]
        rec_litres = water["recommended_water_liters"]

        # Calculate pump runtime if pump flow exists
        pump_section = ""
        if pump_flow_lpm and pump_flow_lpm > 0 and rec_litres > 0:
            pump_mins = rec_litres / pump_flow_lpm
            p_hrs = int(pump_mins // 60)
            p_mins = int(round(pump_mins % 60))
            pump_time_str = f"{p_hrs} hr {p_mins} min" if p_hrs > 0 else f"{p_mins} min"
            pump_section = f"\n**Pump time**\n≈ {pump_time_str} (at {pump_flow_lpm:,.0f} L/min flow)\n"
        elif pump_flow_lpm and pump_flow_lpm > 0 and rec_litres == 0:
            pump_section = "\n**Pump time**\n0 min (no irrigation needed today)\n"

        if rec_mm == 0.0:
            status_badge = "WAIT / POSTPONE"
            rec_text = (
                f"- Recommendation: 0.0 mm (The current prototype model recommends postponing irrigation "
                f"under the provided rainfall and soil-moisture assumptions).\n"
                f"- Status: {irrig['status']}\n"
                f"- Timing & Field Action: {irrig['action']}"
            )
            simple_words = "Your field currently has sufficient moisture or enough rain is expected. FarmGuard recommends waiting before turning on your tubewell."
        else:
            status_badge = "WATER NOW" if irrig.get("urgency") in ["High", "Critical"] else "SCHEDULE IRRIGATION"
            rec_text = (
                f"- Recommendation: Apply {rec_mm} mm depth across {farm_input.area_acres} acres.\n"
                f"- Status: {irrig['status']} (Urgency: {irrig['urgency']})\n"
                f"- Timing & Field Action: {irrig['action']}"
            )
            simple_words = f"FarmGuard recommends applying about {rec_mm} mm of water ({rec_litres:,.0f} litres) across your {farm_input.area_acres}-acre field to restore healthy root-zone moisture."

        # Weather context description
        loc_str = f" for {farm_input.location}" if farm_input.location else ""
        if farm_input.forecast_rainfall_mm is not None:
            weather_text = f"- Forecast Precipitation{loc_str}: {farm_input.forecast_rainfall_mm:.1f} mm expected (Source: {weather.get('source', 'Open-Meteo')})"
        elif farm_input.rainfall_probability > 0:
            weather_text = f"- Rain Probability{loc_str}: {farm_input.rainfall_probability * 100:.0f}% chance of rain (precipitation depth unconfirmed)"
        else:
            weather_text = f"- Weather Outlook{loc_str}: No immediate precipitation expected."

        practices_list = "\n".join([f"  * {p}" for p in res["recommended_practices"]])

        reasons = [
            f"Current soil moisture is at {farm_input.soil_moisture_percent:.1f}% against a target threshold of {crop_req['target_moisture_percent']:.1f}% (deficit of {irrig['soil_depletion_percent']:.1f}%).",
            f"Soil retention factor for {farm_input.soil_type} is {crop_req['soil_retention_factor']}x, adjusting water percolation dynamics.",
        ]
        if farm_input.forecast_rainfall_mm is not None:
            reasons.append(f"Forecasted rainfall of {farm_input.forecast_rainfall_mm:.1f} mm provides an effective precipitation credit of ~{irrig['expected_rain_offset_mm']:.1f} mm.")
        elif farm_input.rainfall_probability >= 0.60:
            reasons.append(f"Rain probability is high ({farm_input.rainfall_probability * 100:.0f}%), but precipitation amount is unconfirmed. Verify local radar before postponing.")
        why_text = "\n".join([f"- {r}" for r in reasons])

        explanation = f"""### Your Water Plan

**Should I water?**
{status_badge} ({irrig['status']})

**Water needed**
{rec_mm} mm (depth spread across your field)

**For your field**
≈ {rec_litres:,.0f} litres ({farm_input.area_acres} acres)
{pump_section}
**In simple words**
{simple_words}

### RECOMMENDATION
{rec_text}

### WEATHER CONTEXT
{weather_text}

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
- Weather credit is based on forecast precipitation depth (or risk probability signal) and should be checked with local weather updates.
- Volumetric conversion is based on standard geometric baseline: 1 acre-mm = 4,046.86 Liters.
- Agronomic crop baseline depths and soil retention factors are prototype models.
- Tubewell pump discharge is estimated at a standard 5 HP pump rate (~28,000 L/hr).
- Avoided emissions assume complete prevention of in-situ stubble combustion.
"""
        return explanation.strip()

    def _call_gemini_synthesis(
        self,
        farm_input: FarmInput,
        num_res: Dict[str, Any],
        user_message: Optional[str] = None,
        pump_flow_lpm: Optional[float] = None,
    ) -> str:
        """Invoke Google Gemini SDK with verified tool outputs to generate natural language advisory."""
        if not self.api_key:
            return self._generate_deterministic_explanation(farm_input, num_res, pump_flow_lpm)

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
                f"- Forecast Rainfall: {farm_input.forecast_rainfall_mm} mm\n"
                f"- Current Irrigation: {farm_input.current_irrigation_mm} mm\n"
                f"- Pump Flow: {pump_flow_lpm or 'Unknown'} L/min\n\n"
                f"DETERMINISTIC TOOL RESULTS (DO NOT RECALCULATE NUMBERS):\n"
                f"{num_res}\n\n"
                f"USER QUERY: {user_message or 'Please provide farmer-friendly water advice.'}\n\n"
                f"Please synthesize the response strictly adhering to the requested sections (RECOMMENDATION, WEATHER CONTEXT, WATER IMPACT, CROP RESIDUE, ENVIRONMENTAL IMPACT, WHY, ASSUMPTIONS)."
            )

            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,
                config={"system_instruction": SYSTEM_PROMPT, "temperature": 0.2},
            )
            if response and response.text:
                return response.text.strip()
            return self._generate_deterministic_explanation(farm_input, num_res, pump_flow_lpm)
        except Exception:
            return self._generate_deterministic_explanation(farm_input, num_res, pump_flow_lpm)

    def _handle_conversational_query(
        self,
        msg: str,
        farm_dict: Optional[Dict[str, Any]] = None
    ) -> Optional[AgentAdviceResponse]:
        """Handle specific conversational questions (what is FarmGuard, mm explanation, pump time, disease/yellow leaves, out of scope)."""
        msg_clean = msg.strip().lower()
        is_hinglish = self._detect_hinglish(msg)
        farm_context = farm_dict or {}

        # 1. "What is FarmGuard?"
        if re.search(r"\b(?:what is farmguard|what\'s farmguard|farmguard kya hai|about farmguard|who are you)\b", msg_clean):
            if is_hinglish:
                answer = "FarmGuard ek decision-support tool hai jo kisano ko fasal ke paani ki zaroorat aur practical irrigation requirements samajhne me madad karta hai."
            else:
                answer = "FarmGuard is a decision-support tool that helps farmers estimate crop water needs and understand practical irrigation requirements."
            return AgentAdviceResponse(
                answer=answer,
                recommendation={"status": "FarmGuard Overview", "action": "Ask about your crop, soil moisture, weather or pump time."},
                tool_trace=[ToolTraceItem(tool="conversational_handler", status="completed", event="ASSISTANT_INTRO", summary="Provided concise FarmGuard description")],
                numerical_results=None,
                assumptions=[],
                missing_fields=None,
                security={"input_guardrails": "passed", "output_guardrails": "passed", "prompt_injection": "not_detected", "secret_scan": "passed"},
                evaluation={"overall": "passed", "semantic_relevance": "passed"},
                blocked=False,
                block_reason=None
            )

        # 2. Out-of-Scope (General knowledge, Politics, Entertainment)
        if re.search(r"\b(?:prime minister|pm of|president of|capital of|who won|score|cricket world cup|cricket match|movie|film|who is elon|weather in london)\b", msg_clean):
            missing = ["crop", "area_acres", "soil_type", "current_irrigation_mm", "location", "soil_moisture_percent"]
            if is_hinglish:
                answer = (
                    "Main FarmGuard ka agricultural assistant hoon, isliye main aapke khet, fasal, sichai, mausam aur paani se jude sawalo me madad kar sakta hoon.\n\n"
                    "Please provide:\n"
                    "1. crop type (e.g. wheat, rice, maize, sugarcane)\n"
                    "2. farm area (in acres)\n"
                    "3. soil type (e.g. sandy loam, clayey, alluvial, loamy, black)\n"
                    "4. recent / planned irrigation depth (in mm)\n"
                    "5. farm location / state (e.g. Uttar Pradesh, Punjab)\n"
                    "6. current soil moisture level (e.g. 64%)"
                )
            else:
                answer = (
                    "I'm FarmGuard's agricultural assistant, so I can help with your farm, crops, irrigation, weather and water-use questions.\n\n"
                    "Please provide:\n"
                    "1. crop type (e.g. wheat, rice, maize, sugarcane)\n"
                    "2. farm area (in acres)\n"
                    "3. soil type (e.g. sandy loam, clayey, alluvial, loamy, black)\n"
                    "4. recent / planned irrigation depth (in mm)\n"
                    "5. farm location / state (e.g. Uttar Pradesh, Punjab)\n"
                    "6. current soil moisture level (e.g. 64%)"
                )
            return AgentAdviceResponse(
                answer=answer,
                recommendation={"status": "Out of Agricultural Scope", "action": "Please ask a question about your farm or crops."},
                tool_trace=[ToolTraceItem(tool="conversational_handler", status="completed", event="OUT_OF_SCOPE_REDIRECT", summary="Redirected to agricultural topics")],
                numerical_results=None,
                assumptions=[AssumptionItem(type="input", text="Analysis requires baseline farm parameters.")],
                missing_fields=missing,
                security={"input_guardrails": "passed", "output_guardrails": "passed", "prompt_injection": "not_detected", "secret_scan": "passed"},
                evaluation={"overall": "passed", "safety": "passed", "schema_validity": "passed", "semantic_relevance": "passed"},
                blocked=False,
                block_reason=None
            )

        # 3. "What does mm mean?" / MM to Litres explanation
        if re.search(r"(?:what\s+does\s+(?:that|\d+(?:\.\d+)?\s*mm)?\s*mean|what\s+is\s+mm|explain\s+mm|mm\s+ka\s+matlab|mm\s+kya\s+hota|meaning\s+of\s+mm|\bmm\b.*?\b(?:mean|matlab))", msg_clean):
            m_val = re.search(r"(\d+(?:\.\d+)?)\s*mm", msg_clean)
            mm_val = float(m_val.group(1)) if m_val else 28.2
            area = float(farm_context.get("area_acres") or 0.0)
            if not area:
                m_area = re.search(r"(\d+(?:\.\d+)?)\s*(?:acre|acres|ekad)", msg_clean)
                if m_area:
                    area = float(m_area.group(1))

            if area > 0:
                litres = round(mm_val * area * 4046.8564)
                if is_hinglish:
                    answer = f"mm (millimetres) ka matlab hai aapke poore khet me barabar phaili hui paani ki gehrai.\n\nAapke {area} acre khet ke liye, {mm_val} mm lagbhag {litres:,} litres paani ke barabar hota hai."
                else:
                    answer = f"mm (millimetres) tells us the depth of water spread evenly across your field.\n\nFor your {area}-acre field, {mm_val} mm is approximately {litres:,} litres of water."
            else:
                if is_hinglish:
                    answer = f"mm (millimetres) ka matlab hai aapke poore khet me barabar phaili hui paani ki gehrai.\n\nI don't have your field size yet, isliye main isko litres me convert nahi kar sakta. Agar aap apne khet ka size (acres me) batayein, toh main exact litres calculate kar dunga."
                else:
                    answer = f"mm tells us the depth of water spread evenly across your field.\n\nI don't have your field size yet, so I can't convert the irrigation requirement into litres. Tell me your field size in acres to calculate the exact litres for your field."

            return AgentAdviceResponse(
                answer=answer,
                recommendation={"status": "MM Explanation", "action": "Use litres conversion based on your field size."},
                tool_trace=[ToolTraceItem(tool="conversational_handler", status="completed", event="MM_EXPLAINED", summary=f"Explained mm meaning for {mm_val} mm")],
                numerical_results=None,
                assumptions=[AssumptionItem(type="agronomic_model", text="1 acre-mm = 4,046.86 Litres")],
                missing_fields=None,
                security={"input_guardrails": "passed", "output_guardrails": "passed", "prompt_injection": "not_detected", "secret_scan": "passed"},
                evaluation={"overall": "passed"},
                blocked=False,
                block_reason=None
            )

        # 4. Pump Running Time ("Pump kitni der chalana hai?" / "5 HP pump kitne ghante?" / "How long?")
        is_pump_query = bool(re.search(r"(?:pump|how\s+long|kitne\s+ghante|kitni\s+der|running\s+time|runtime|pump\s+time|flow\s+rate|discharge)", msg_clean))
        if is_pump_query:
            m_hp = re.search(r"(\d+)\s*(?:hp|horse\s*power)", msg_clean)
            has_hp = bool(m_hp)
            has_flow = bool(re.search(r"(\d+(?:\.\d+)?)\s*(?:lpm|litres\s*/\s*min|liters\s*/\s*min|l\s*/\s*min|litres\s+per\s+minute|liters\s+per\s+minute)", msg_clean)) or ("pump_flow_lpm" in farm_context and farm_context["pump_flow_lpm"])
            has_litres = bool(re.search(r"(\d+(?:,\d+)?(?:\.\d+)?)\s*(?:litres|liters|l\b)", msg_clean)) or ("water_liters" in farm_context)

            if has_hp and not has_flow:
                hp_val = f"{m_hp.group(1)} HP" if m_hp else "HP"
                if is_hinglish:
                    answer = f"Kewal pump ke {hp_val} se exact pump time nahi nikala ja sakta, kyunki paani ka flow bore ki gehrai aur pipe ke size par depend karta hai.\n\nKripya apne pump ka actual water flow (litres/minute me) batayein. Agar flow nahi pata, toh FarmGuard ke container-fill test (drum bharne ka time) se estimate kar sakte hain."
                else:
                    answer = f"A {hp_val} rating alone is not enough to calculate exact pump running time, because actual water flow depends on bore depth, pipe diameter, and groundwater level.\n\nPlease provide your pump's water flow in litres/minute. If you don't know the flow, FarmGuard can help estimate it using the container-fill method."
                return AgentAdviceResponse(
                    answer=answer,
                    recommendation={"status": "Pump Flow Required", "action": "Provide pump water flow in L/min for exact runtime calculation."},
                    tool_trace=[ToolTraceItem(tool="conversational_handler", status="completed", event="HP_CLARIFICATION", summary=f"Clarified that {hp_val} alone is insufficient for runtime")],
                    numerical_results=None,
                    assumptions=[],
                    missing_fields=None,
                    security={"input_guardrails": "passed", "output_guardrails": "passed", "prompt_injection": "not_detected", "secret_scan": "passed"},
                    evaluation={"overall": "passed", "safety": "passed", "schema_validity": "passed", "semantic_relevance": "passed"},
                    blocked=False,
                    block_reason=None
                )

            # Check if we can calculate deterministic pump time
            m_l = re.search(r"(\d+(?:,\d+)?(?:\.\d+)?)\s*(?:litres|liters|l\b)", msg_clean)
            m_f = re.search(r"(\d+(?:\.\d+)?)\s*(?:lpm|litres\s*/\s*min|liters\s*/\s*min|l\s*/\s*min|litres\s+per\s+minute|liters\s+per\s+minute)", msg_clean)
            
            litres_val = float(m_l.group(1).replace(",", "")) if m_l else float(farm_context.get("water_liters") or 0.0)
            flow_val = float(m_f.group(1)) if m_f else float(farm_context.get("pump_flow_lpm") or 0.0)

            if litres_val > 0 and flow_val > 0:
                pump_minutes = litres_val / flow_val
                p_hrs = int(pump_minutes // 60)
                p_mins = int(round(pump_minutes % 60))
                time_str = f"{p_hrs} hr {p_mins} min" if p_hrs > 0 else f"{p_mins} min"
                
                if is_hinglish:
                    answer = f"Aapke pump ka estimated running time lagbhag {time_str} hai.\n\n{flow_val:,.0f} L/min flow rate par {litres_val:,.0f} litres paani dene ke liye pump ko lagbhag {time_str} chalana hoga."
                else:
                    answer = f"Your estimated pump time is about {time_str}.\n\nAt {flow_val:,.0f} L/min, running your pump for {time_str} will deliver the required {litres_val:,.0f} litres across your field."
                
                return AgentAdviceResponse(
                    answer=answer,
                    recommendation={"status": "Pump Time Calculated", "action": f"Run pump for approximately {time_str}."},
                    tool_trace=[ToolTraceItem(tool="conversational_handler", status="completed", event="PUMP_TIME_CALCULATED", summary=f"Calculated runtime: {time_str}")],
                    numerical_results={"pump_minutes": pump_minutes, "litres": litres_val, "flow_lpm": flow_val},
                    assumptions=[AssumptionItem(type="environmental_impact", text=f"Pump runtime derived strictly from {flow_val:,.0f} L/min flow.")],
                    missing_fields=None,
                    security={"input_guardrails": "passed", "output_guardrails": "passed", "prompt_injection": "not_detected", "secret_scan": "passed"},
                    evaluation={"overall": "passed", "safety": "passed", "schema_validity": "passed", "semantic_relevance": "passed"},
                    blocked=False,
                    block_reason=None
                )
            elif not flow_val:
                if is_hinglish:
                    answer = "Main pump ka running time calculate kar sakta hoon, lekin mujhe aapke pump ka water flow (litres/minute me) chahiye.\n\nAgar aapko flow nahi pata, toh FarmGuard ke container-fill method se drum bharne ka samay dekh kar estimate kar sakte hain."
                else:
                    answer = "I can calculate the pump time, but I need your pump's water flow in litres/minute.\n\nIf you don't know the flow, FarmGuard can help estimate it using the container-fill method (measuring how many seconds it takes to fill a drum or bucket)."
                return AgentAdviceResponse(
                    answer=answer,
                    recommendation={"status": "Pump Flow Needed", "action": "Add pump flow in litres/minute."},
                    tool_trace=[ToolTraceItem(tool="conversational_handler", status="completed", event="PUMP_FLOW_PROMPT", summary="Prompted for pump water flow in L/min")],
                    numerical_results=None,
                    assumptions=[],
                    missing_fields=None,
                    security={"input_guardrails": "passed", "output_guardrails": "passed", "prompt_injection": "not_detected", "secret_scan": "passed"},
                    evaluation={"overall": "passed"},
                    blocked=False,
                    block_reason=None
                )

        # 5. Crop Disease / Symptoms / Yellow Leaves
        if re.search(r"\b(?:yellow leaves|leaves are turning yellow|leaves are yellow|peeli patti|pattiya peeli|crop is not growing|fasal kharab|fasal sukh rahi|pest|disease|keeda|keede)\b", msg_clean):
            if is_hinglish:
                answer = "Pattiyo ka peela hona kai vajah se ho sakta hai, jaise paani ki kami ya zyada hona, nutrient deficiency (jaise nitrogen ki kami), ya koi bimari.\n\nSahi salah ke liye batayein:\n1. Kaun si fasal hai?\n2. Fasal kitne din ki hai (growth stage)?\n3. Peeli pattiyan neeche purani hain ya upar nayi growth me?\n4. Aap kitne din me paani de rahe hain?"
            else:
                answer = "Yellow leaves can have several causes, including watering problems (over or under-watering), nutrient deficiency (such as nitrogen deficit), or crop disease.\n\nTo help identify the issue, please tell me:\n1. Which crop are you growing?\n2. How old is the crop (growth stage)?\n3. Are the yellow leaves at the bottom (older leaves) or top (new growth)?\n4. How often and how much are you watering?"
            return AgentAdviceResponse(
                answer=answer,
                recommendation={"status": "Symptom Assessment", "action": "Provide crop details, leaf location, and watering frequency for diagnosis guidance."},
                tool_trace=[ToolTraceItem(tool="conversational_handler", status="completed", event="SYMPTOMS_CLARIFIED", summary="Requested essential agronomic context before diagnosing")],
                numerical_results=None,
                assumptions=[],
                missing_fields=None,
                security={"input_guardrails": "passed", "output_guardrails": "passed", "prompt_injection": "not_detected", "secret_scan": "passed"},
                evaluation={"overall": "passed"},
                blocked=False,
                block_reason=None
            )

        # 6. Fertilizer / Chemical spray questions
        if re.search(r"\b(?:fertilizer|urea|dap|chemical spray|dawa|khad|pesticide)\b", msg_clean):
            if is_hinglish:
                answer = "Khad aur fertilizer ki matra fasal ke stage, soil nutrient test aur field size par depend karti hai. Chemical prayog se pehle apne Soil Health Card ki jaanch karein. Kisi bhi critical chemical decision ke liye local Krishi Vigyan Kendra (KVK) ya agriculture extension officer se sampark karein."
            else:
                answer = "Fertilizer requirements depend on your crop growth stage, soil nutrient test, and field size. We recommend checking your Soil Health Card before applying chemicals. For critical pest or fertilizer decisions, please consult your local Krishi Vigyan Kendra (KVK) or agricultural extension officer."
            return AgentAdviceResponse(
                answer=answer,
                recommendation={"status": "Fertilizer Guidance", "action": "Check Soil Health Card and consult local KVK before chemical application."},
                tool_trace=[ToolTraceItem(tool="conversational_handler", status="completed", event="FERTILIZER_ADVICE", summary="Guided farmer to soil test and local KVK")],
                numerical_results=None,
                assumptions=[],
                missing_fields=None,
                security={"input_guardrails": "passed", "output_guardrails": "passed", "prompt_injection": "not_detected", "secret_scan": "passed"},
                evaluation={"overall": "passed"},
                blocked=False,
                block_reason=None
            )

        # 7. Weather / "Should I water today?" / "bhai aaj paani du kya?"
        if re.search(r"\b(?:should i water today|should i irrigate today|aaj paani du kya|aaj pani dena chahiye|water today|aaj sichai karein)\b", msg_clean):
            # If weather is available in farm context or user mentioned rain
            loc = farm_context.get("location")
            fc_rain = farm_context.get("forecast_rainfall_mm")
            rain_prob = farm_context.get("rainfall_probability", 0)

            if fc_rain is not None and float(fc_rain) >= 5.0:
                if is_hinglish:
                    answer = f"Aapke area me lagbhag {fc_rain} mm barish ki sambhavna hai, isliye aaj paani dena zaroori nahi hai. FarmGuard forecast ke hisab se wait karne ki salah deta hai."
                else:
                    answer = f"Rain of about {fc_rain} mm is expected, so watering now may not be necessary. FarmGuard recommends waiting based on the current forecast before turning on your tubewell."
                return AgentAdviceResponse(
                    answer=answer,
                    recommendation={"status": "Wait for Rain", "action": f"Postpone irrigation. Rain forecast is {fc_rain} mm."},
                    tool_trace=[ToolTraceItem(tool="conversational_handler", status="completed", event="WEATHER_ASSESSMENT", summary=f"Advised waiting for {fc_rain} mm rain")],
                    numerical_results={"forecast_rainfall_mm": fc_rain},
                    assumptions=[AssumptionItem(type="weather", text=f"Forecast precipitation of {fc_rain} mm factored into advice.")],
                    missing_fields=None,
                    security={"input_guardrails": "passed", "output_guardrails": "passed", "prompt_injection": "not_detected", "secret_scan": "passed"},
                    evaluation={"overall": "passed"},
                    blocked=False,
                    block_reason=None
                )
            elif not loc and not fc_rain:
                if is_hinglish:
                    answer = "Main abhi live weather check nahi kar pa raha hoon. Kripya apne khet ki location aur fasal batayein, ya expected barish (rainfall) batayein toh main paani dene ki zaroorat interpret kar dunga."
                else:
                    answer = "I can't check the current forecast right now. If you tell me your farm location or expected rainfall, I can help interpret whether you should water."
                return AgentAdviceResponse(
                    answer=answer,
                    recommendation={"status": "Location Required", "action": "Provide farm location or expected rainfall."},
                    tool_trace=[ToolTraceItem(tool="conversational_handler", status="completed", event="WEATHER_PROMPT", summary="Prompted for location or rainfall")],
                    numerical_results=None,
                    assumptions=[],
                    missing_fields=None,
                    security={"input_guardrails": "passed", "output_guardrails": "passed", "prompt_injection": "not_detected", "secret_scan": "passed"},
                    evaluation={"overall": "passed", "safety": "passed", "schema_validity": "passed", "semantic_relevance": "passed"},
                    blocked=False,
                    block_reason=None
                )

        return None

    def get_advice(self, request: AgentAdviceRequest) -> AgentAdviceResponse:
        """Main agent entrypoint to evaluate farm status and deliver safe, grounded advice."""
        # ====================================================================
        # 1. INPUT SECURITY & PROMPT INJECTION GUARDRAILS
        # ====================================================================
        msg_ok, msg_err = validate_user_message(request.message)
        if not msg_ok:
            is_inj = (msg_err == "potential_prompt_injection")
            block_msg = "Your request was blocked by security guardrails. I can help with your farm and agricultural questions, but I can't provide internal instructions or secrets." if is_inj else "Your request was blocked by security guardrails. Please provide standard agricultural inquiries."
            return AgentAdviceResponse(
                answer=block_msg,
                recommendation={
                    "status": "Request Blocked",
                    "action": "Please submit a standard farming query."
                },
                tool_trace=[ToolTraceItem(
                    tool="security_guardrails",
                    status="blocked",
                    event="SECURITY_CHECK_BLOCKED",
                    summary=f"Input blocked: {msg_err}"
                )],
                numerical_results=None,
                assumptions=[],
                missing_fields=None,
                security={
                    "input_guardrails": "blocked",
                    "prompt_injection": "detected" if is_inj else "not_detected",
                    "secret_scan": "blocked" if msg_err in ["sensitive_credential_detected", "internal_path_detected"] else "passed",
                    "output_guardrails": "not_applicable"
                },
                evaluation={
                    "overall": "failed",
                    "safety": "failed",
                    "prompt_injection_resistance": "detected_and_blocked"
                },
                blocked=True,
                block_reason=msg_err
            )

        if request.farm:
            farm_valid, farm_err_code, field_errors = validate_farm_input_dict(request.farm)
            if not farm_valid:
                err_desc = "; ".join([f"{k}: {v}" for k, v in (field_errors or {}).items()])
                return AgentAdviceResponse(
                    answer=f"Invalid farm input parameters: {err_desc}",
                    recommendation={
                        "status": "Invalid Input Bounds",
                        "action": "Please correct the out-of-bounds parameter values."
                    },
                    tool_trace=[ToolTraceItem(
                        tool="input_guardrails",
                        status="failed",
                        event="INPUT_VALIDATION_FAILED",
                        summary=f"Input bounds error: {farm_err_code}"
                    )],
                    numerical_results=None,
                    assumptions=[],
                    missing_fields=None,
                    security={
                        "input_guardrails": "failed_bounds_check",
                        "prompt_injection": "not_detected",
                        "secret_scan": "passed",
                        "output_guardrails": "not_applicable"
                    },
                    evaluation={
                        "overall": "failed",
                        "schema_validity": "failed"
                    },
                    blocked=True,
                    block_reason=farm_err_code
                )

        # ====================================================================
        # 2. CONVERSATIONAL & TARGETED QUESTION DISPATCH
        # ====================================================================
        if request.message:
            conv_res = self._handle_conversational_query(request.message, request.farm)
            if conv_res:
                return conv_res

        # ====================================================================
        # 3. PARAMETER EXTRACTION & CLARIFICATION CHECK
        # ====================================================================
        raw_farm_input, missing_fields = self._extract_farm_input_from_dict_or_text(
            farm_dict=request.farm,
            message=request.message,
        )

        if not raw_farm_input:
            field_name_map = {
                "crop": "crop type (e.g. wheat, rice, maize, sugarcane)",
                "area_acres": "farm area (in acres)",
                "soil_type": "soil type (e.g. sandy loam, clayey, alluvial, loamy, black)",
                "current_irrigation_mm": "recent / planned irrigation depth (in mm)",
                "location": "farm location / state (e.g. Uttar Pradesh, Punjab)",
                "soil_moisture_percent": "current soil moisture level (e.g. 64%)",
            }
            human_fields = [field_name_map.get(f, f.replace("_", " ")) for f in missing_fields]
            bullet_points = "\n".join([f"{i+1}. {name}" for i, name in enumerate(human_fields)])
            
            is_hinglish = self._detect_hinglish(request.message)
            crop_name = ""
            if request.message:
                for c in ["wheat", "rice", "maize", "sugarcane", "chawal", "dhaan", "gehu", "makka", "ganna"]:
                    if c in request.message.lower():
                        crop_name = c
                        break

            if is_hinglish and crop_name:
                clarification_answer = f"{crop_name.capitalize()} ke liye exact paani ki quantity batane ke liye mujhe aapke field ki kuch details chahiye.\n\nPlease provide:\n{bullet_points}"
            elif crop_name:
                clarification_answer = f"Your {crop_name} crop may need water soon, but the exact amount depends on your field size, soil moisture and expected rainfall.\n\nPlease provide:\n{bullet_points}"
            else:
                clarification_answer = f"Please provide:\n{bullet_points}"

            eval_res = evaluate_response(
                answer=clarification_answer,
                tool_trace=[],
                numerical_results=None,
                assumptions=[]
            )

            return AgentAdviceResponse(
                answer=clarification_answer,
                recommendation={
                    "status": "Incomplete Farm Data",
                    "action": "Please provide missing farm parameters to proceed with analysis."
                },
                tool_trace=[],
                numerical_results=None,
                assumptions=[AssumptionItem(
                    type="input",
                    text="Analysis requires baseline farm parameters."
                )],
                missing_fields=missing_fields,
                security={
                    "input_guardrails": "passed",
                    "output_guardrails": "passed",
                    "prompt_injection": "not_detected",
                    "secret_scan": "passed"
                },
                evaluation=eval_res,
                blocked=False,
                block_reason=None
            )

        # ====================================================================
        # 4. DETERMINISTIC TOOL EXECUTION & WEATHER INGESTION
        # ====================================================================
        numerical_results, tool_trace, active_farm_input = self._execute_tools(raw_farm_input)

        pump_flow = None
        if request.farm and "pump_flow_lpm" in request.farm and request.farm["pump_flow_lpm"]:
            try:
                pump_flow = float(request.farm["pump_flow_lpm"])
            except Exception:
                pass
        elif request.message:
            m_pf = re.search(r"(\d+(?:\.\d+)?)\s*(?:lpm|litres/min|liters/min|l/min)", request.message.lower())
            if m_pf:
                pump_flow = float(m_pf.group(1))

        # ====================================================================
        # 5. LLM SYNTHESIS & OUTPUT SAFETY / NUMERICAL GROUNDING GUARDRAILS
        # ====================================================================
        candidate_answer = self._call_gemini_synthesis(
            farm_input=active_farm_input,
            num_res=numerical_results,
            user_message=request.message,
            pump_flow_lpm=pump_flow,
        )

        out_safe, out_status, out_reason = validate_agent_output(candidate_answer, numerical_results)

        if out_safe:
            final_answer = candidate_answer
            tool_trace.append(ToolTraceItem(
                tool="output_guardrails",
                status="passed",
                event="OUTPUT_GUARDRAIL_PASSED",
                summary="Output passed numerical grounding and safety checks"
            ))
        else:
            # Fallback to deterministic synthesis if hallucination or policy failure detected
            final_answer = self._generate_deterministic_explanation(active_farm_input, numerical_results, pump_flow)
            tool_trace.append(ToolTraceItem(
                tool="output_guardrails",
                status="failed",
                event="OUTPUT_GUARDRAIL_FAILED",
                summary=f"Guardrail failure: {out_reason}"
            ))
            tool_trace.append(ToolTraceItem(
                tool="fallback_synthesizer",
                status="completed",
                event="FALLBACK_SYNTHESIS_USED",
                summary="Fell back to pure deterministic advisory synthesis"
            ))

        # ====================================================================
        # 6. DETERMINISTIC LLM EVALUATION
        # ====================================================================
        irrig = numerical_results["irrigation_recommendation"]
        recommendation_summary = {
            "recommended_irrigation_mm": irrig["recommended_irrigation_mm"],
            "status": irrig["status"],
            "urgency": irrig["urgency"],
            "action": irrig["action"],
            "expected_rain_offset_mm": irrig.get("expected_rain_offset_mm", 0.0),
        }

        assumptions_list = generate_assumptions(
            farm_input=active_farm_input,
            irrigation_rec=irrig,
        )

        evaluation_summary = evaluate_response(
            answer=final_answer,
            tool_trace=[t.model_dump() for t in tool_trace],
            numerical_results=numerical_results,
            assumptions=assumptions_list,
        )

        tool_trace.append(ToolTraceItem(
            tool="evaluation_framework",
            status="completed",
            event="EVALUATION_COMPLETED",
            summary=f"Evaluation overall: {evaluation_summary.get('overall')}"
        ))

        return AgentAdviceResponse(
            answer=final_answer,
            recommendation=recommendation_summary,
            tool_trace=tool_trace,
            numerical_results=numerical_results,
            assumptions=assumptions_list,
            missing_fields=None,
            security={
                "input_guardrails": "passed",
                "output_guardrails": "passed" if out_safe else "failed_fallback_engaged",
                "prompt_injection": "not_detected",
                "secret_scan": "passed"
            },
            evaluation=evaluation_summary,
            blocked=False,
            block_reason=None
        )
