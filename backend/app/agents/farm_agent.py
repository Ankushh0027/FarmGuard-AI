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
            if "forecast_rainfall_mm" not in data:
                m = re.search(r"(?:forecast|rain|precipitation)\s*(?:depth|amount|of)?\s*(\d+(?:\.\d+)?)\s*mm", msg)
                if m:
                    data["forecast_rainfall_mm"] = float(m.group(1))
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
            "soil_moisture_percent",
        ]
        missing = [f for f in required_fields if f not in data or data[f] is None]
        if missing:
            return None, missing

        # Default rainfall probability to 0.0 if not provided
        if "rainfall_probability" not in data or data["rainfall_probability"] is None:
            data["rainfall_probability"] = 0.0

        try:
            farm_input = FarmInput(**data)
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
        num_res: Dict[str, Any]
    ) -> str:
        """Generate structured advisory adhering to exact architectural guidelines when offline/testing."""
        irrig = num_res["irrigation_recommendation"]
        water = num_res["water_analysis"]
        res = num_res["residue_estimate"]
        env = num_res["environmental_impact"]
        crop_req = num_res["crop_water_requirement"]
        weather = num_res.get("weather_forecast", {})

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

        explanation = f"""### RECOMMENDATION
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
                f"- Forecast Rainfall: {farm_input.forecast_rainfall_mm} mm\n"
                f"- Current Irrigation: {farm_input.current_irrigation_mm} mm\n\n"
                f"DETERMINISTIC TOOL RESULTS (DO NOT RECALCULATE NUMBERS):\n"
                f"{num_res}\n\n"
                f"USER QUERY: {user_message or 'Please provide comprehensive farming advice.'}\n\n"
                f"Please synthesize the response strictly adhering to the requested sections (RECOMMENDATION, WEATHER CONTEXT, WATER IMPACT, CROP RESIDUE, ENVIRONMENTAL IMPACT, WHY, ASSUMPTIONS)."
            )

            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,
                config={"system_instruction": SYSTEM_PROMPT, "temperature": 0.2},
            )
            if response and response.text:
                return response.text.strip()
            return self._generate_deterministic_explanation(farm_input, num_res)
        except Exception:
            return self._generate_deterministic_explanation(farm_input, num_res)

    def get_advice(self, request: AgentAdviceRequest) -> AgentAdviceResponse:
        """Main agent entrypoint to evaluate farm status and deliver safe, grounded advice."""
        # ====================================================================
        # 1. INPUT SECURITY & PROMPT INJECTION GUARDRAILS
        # ====================================================================
        msg_ok, msg_err = validate_user_message(request.message)
        if not msg_ok:
            is_inj = (msg_err == "potential_prompt_injection")
            return AgentAdviceResponse(
                answer="Your request was blocked by security guardrails. Please provide standard agricultural inquiries.",
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
        # 2. PARAMETER EXTRACTION & CLARIFICATION CHECK
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
        # 3. DETERMINISTIC TOOL EXECUTION & WEATHER INGESTION
        # ====================================================================
        numerical_results, tool_trace, active_farm_input = self._execute_tools(raw_farm_input)

        # ====================================================================
        # 4. LLM SYNTHESIS & OUTPUT SAFETY / NUMERICAL GROUNDING GUARDRAILS
        # ====================================================================
        candidate_answer = self._call_gemini_synthesis(
            farm_input=active_farm_input,
            num_res=numerical_results,
            user_message=request.message,
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
            final_answer = self._generate_deterministic_explanation(active_farm_input, numerical_results)
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
        # 5. DETERMINISTIC LLM EVALUATION
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
