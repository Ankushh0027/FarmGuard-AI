"""Security utilities for FarmGuard AI.

Provides multi-pattern heuristic prompt injection detection, sensitive data / secret
scanning, and automated credential redaction.
"""

import re
from typing import Dict, Any, Tuple, Optional, List

# Regex patterns for detecting API keys, tokens, and credentials
SECRET_PATTERNS = [
    # Google AI API Key format: AIzaSy...
    re.compile(r"AIzaSy[A-Za-z0-9_\-]{33}"),
    # Generic API Key / Token assignments
    re.compile(r"(?i)(?:api_key|gemini_api_key|secret_key|auth_token|bearer)\s*[:=]\s*['\"]?([A-Za-z0-9_\-]{16,})['\"]?"),
    # Environment variable extraction or dumps
    re.compile(r"(?i)\bGEMINI_API_KEY\b"),
    re.compile(r"(?i)\$GEMINI_API_KEY"),
    re.compile(r"(?i)\bos\.environ\b"),
    re.compile(r"(?i)\bprocess\.env\b"),
]

# Heuristic prompt injection and abuse patterns
INJECTION_PATTERNS = [
    # Instruction override / ignore directives
    re.compile(r"(?i)\bignore\s+(?:all\s+)?(?:previous|prior|above|existing)\s+(?:instructions|prompts|rules|commands|constraints)"),
    re.compile(r"(?i)\bdisregard\s+(?:all\s+)?(?:previous|prior|above|system)\s+(?:instructions|prompts|rules)"),
    re.compile(r"(?i)\bforget\s+(?:all\s+)?(?:previous|prior|above)\s+(?:instructions|prompts|rules)"),
    re.compile(r"(?i)\boverride\s+(?:all\s+)?(?:system|safety|previous)\s+(?:instructions|rules|constraints)"),
    
    # System prompt extraction / revelation
    re.compile(r"(?i)\b(?:reveal|show|print|display|give|tell|leak|output)\s+(?:me\s+)?(?:the\s+|your\s+)?(?:system\s+prompt|hidden\s+instructions|internal\s+prompt|developer\s+mode|initial\s+prompt)"),
    re.compile(r"(?i)\bwhat\s+(?:are|is)\s+your\s+(?:system\s+prompt|hidden\s+instructions|internal\s+instructions)"),
    
    # Credential / Environment variable extraction
    re.compile(r"(?i)\b(?:give|tell|print|show|leak|reveal)\s+(?:me\s+)?(?:the\s+|your\s+)?(?:(?:gemini[_\s]*)?api[_\s]*key|secret|credentials|environment\s*variables)"),
    re.compile(r"(?i)\b(?:echo|print|dump|show)\s+(?:all\s+)?(?:env|os\.environ|\$GEMINI_API_KEY|environment\s*variables)"),
    re.compile(r"(?i)\bGEMINI_API_KEY\b"),
    
    # Safety / Guardrail bypass
    re.compile(r"(?i)\b(?:bypass|disable|turn\s*off|ignore)\s+(?:all\s+)?(?:safety|guardrails|filters|restrictions|checks)"),
    re.compile(r"(?i)\bpretend\s+(?:you\s+are|to\s+be)\s+(?:unrestricted|dan|jailbroken|an\s+unfiltered\s+ai|free\s+of\s+rules)"),
    
    # Tool tampering and fabrication demands
    re.compile(r"(?i)\b(?:do\s*not|don't)\s+(?:use|call|run|execute)\s+(?:any\s+)?(?:tools|farming\s+tools|weather\s+service)"),
    re.compile(r"(?i)\b(?:calculate|invent|make\s*up|fabricate)\s+(?:the\s+)?(?:irrigation|numbers|math|values)\s+yourself"),
    re.compile(r"(?i)\bignore\s+(?:the\s+)?(?:tool\s+results|deterministic\s+calculations)"),
]

# Sensitive internal filesystem and stack trace indicators
PATH_PATTERNS = [
    re.compile(r"[A-Za-z]:\\[Uu]sers\\[^\s\\]+"),
    re.compile(r"/home/[^\s/]+"),
    re.compile(r"Traceback \(most recent call last\):"),
]


def detect_prompt_injection(text: Optional[str]) -> Tuple[bool, Optional[str]]:
    """Scan input text for prompt injection, system prompt extraction, or safety override attempts.

    Args:
        text: User query or prompt string.

    Returns:
        Tuple of (is_injected, detected_reason).
    """
    if not text:
        return False, None

    # Normalize whitespace
    normalized = " ".join(text.strip().split())

    for pattern in INJECTION_PATTERNS:
        if pattern.search(normalized):
            return True, "potential_prompt_injection"

    return False, None


def scan_for_secrets(text: Optional[str]) -> Tuple[bool, Optional[str]]:
    """Scan string for API keys, environment variables, or private paths.

    Args:
        text: Text string to scan.

    Returns:
        Tuple of (has_secret, secret_type).
    """
    if not text:
        return False, None

    for pattern in SECRET_PATTERNS:
        if pattern.search(text):
            return True, "sensitive_credential_detected"

    for pattern in PATH_PATTERNS:
        if pattern.search(text):
            return True, "internal_path_detected"

    return False, None


def redact_secrets(text: str) -> str:
    """Redact sensitive API keys, tokens, or paths from text before returning to client."""
    redacted = text
    for pattern in SECRET_PATTERNS:
        redacted = pattern.sub("[REDACTED_SECRET]", redacted)
    for pattern in PATH_PATTERNS:
        redacted = pattern.sub("[REDACTED_PATH]", redacted)
    return redacted
