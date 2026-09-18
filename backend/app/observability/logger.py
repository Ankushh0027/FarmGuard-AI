"""Structured logging and security observability for FarmGuard AI.

Provides structured JSON audit logging with automated credential and path redaction.
"""

import json
import logging
import time
import uuid
from typing import Dict, Any, Optional
from app.guardrails.security import redact_secrets

# Configure base logger
_logger = logging.getLogger("farmguard.security")
if not _logger.handlers:
    handler = logging.StreamHandler()
    handler.setFormatter(logging.Formatter("%(message)s"))
    _logger.addHandler(handler)
    _logger.setLevel(logging.INFO)


def generate_request_id() -> str:
    """Generate a unique correlation ID for tracking request flows."""
    return f"fg-{uuid.uuid4().hex[:12]}"


def log_security_event(
    event_type: str,
    guardrail: str,
    result: str,
    reason: Optional[str] = None,
    tool_name: Optional[str] = None,
    fallback_used: bool = False,
    evaluation_status: Optional[str] = None,
    request_id: Optional[str] = None,
    extra: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """Emit a structured, sanitized security event.

    Args:
        event_type: Category of event (e.g. 'INPUT_GUARDRAIL', 'PROMPT_INJECTION', 'TOOL_AUTH').
        guardrail: Name of guardrail module executing the check.
        result: Outcome ('passed', 'blocked', 'warning', 'failed').
        reason: Optional human or machine reason string.
        tool_name: Name of tool if event relates to tool invocation.
        fallback_used: Whether deterministic fallback synthesis was engaged.
        evaluation_status: Overall evaluation status if evaluated.
        request_id: Correlation ID.
        extra: Additional non-sensitive metadata.

    Returns:
        The sanitized structured log dictionary.
    """
    event_data = {
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "request_id": request_id or generate_request_id(),
        "event_type": event_type,
        "guardrail": guardrail,
        "result": result,
        "fallback_used": fallback_used,
    }

    if reason:
        event_data["reason"] = redact_secrets(str(reason))
    if tool_name:
        event_data["tool_name"] = tool_name
    if evaluation_status:
        event_data["evaluation_status"] = evaluation_status
    if extra:
        event_data["extra"] = {k: redact_secrets(str(v)) for k, v in extra.items()}

    log_line = json.dumps(event_data)
    if result in ["blocked", "failed"]:
        _logger.warning(log_line)
    else:
        _logger.info(log_line)

    return event_data
