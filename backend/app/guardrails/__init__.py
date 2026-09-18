"""FarmGuard AI Security & Guardrails Package.

Provides input validation, prompt injection defense, secret leak prevention, tool authorization,
and output numerical grounding.
"""

from app.guardrails.security import (
    detect_prompt_injection,
    scan_for_secrets,
    redact_secrets,
)
from app.guardrails.input_guardrails import (
    validate_farm_input_dict,
    validate_user_message,
)
from app.guardrails.tool_guardrails import (
    authorize_tool,
    validate_tool_inputs,
    validate_tool_outputs,
    AUTHORIZED_TOOLS,
)
from app.guardrails.output_guardrails import (
    validate_agent_output,
    check_numerical_grounding,
    check_unsupported_certainty,
)

__all__ = [
    "detect_prompt_injection",
    "scan_for_secrets",
    "redact_secrets",
    "validate_farm_input_dict",
    "validate_user_message",
    "authorize_tool",
    "validate_tool_inputs",
    "validate_tool_outputs",
    "AUTHORIZED_TOOLS",
    "validate_agent_output",
    "check_numerical_grounding",
    "check_unsupported_certainty",
]
