"""Security utilities for FarmGuard AI.

Provides multi-pattern heuristic prompt injection detection, sensitive data / secret
scanning, multilingual attack defense, and automated credential redaction.
"""

import re
import unicodedata
import base64
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
    re.compile(r"(?i)\b(?:bearer[_\s]*token|auth[_\s]*token)\b"),
    re.compile(r"(?i)\b(?:secret\s+tokens?|credentials\s+for\s+the\s+database)\b"),
]

# Heuristic prompt injection and abuse patterns (English, Multilingual, Obfuscation)
INJECTION_PATTERNS = [
    # 1. English Instruction overrides (Targeting system instructions/prompts/rules, NOT farming recommendations)
    re.compile(r"(?i)\b(?:ignore|disregard|forget|override|bypass)\s+(?:all\s+)?(?:previous|prior|above|system|existing|developer|core)\s+(?:instructions|prompts|rules|commands|constraints|directives|guidance)\b"),
    re.compile(r"(?i)\boverride\s+(?:all\s+)?(?:system|safety|ai)\s+(?:instructions|rules|constraints|filters)\b"),
    re.compile(r"(?i)\bprevious\s+developer\s+(?:told|said|instructed)\s+(?:you\s+to|that)\b"),

    # 2. System prompt and internal configuration extraction
    re.compile(r"(?i)\b(?:reveal|show|print|display|give|tell|leak|output|dump)\s+(?:me\s+)?(?:the\s+|your\s+)?(?:system\s+prompt|hidden\s+instructions|internal\s+prompt|developer\s+mode|initial\s+prompt|core\s+instructions)\b"),
    re.compile(r"(?i)\bwhat\s+(?:are|is)\s+your\s+(?:system\s+prompt|hidden\s+instructions|internal\s+instructions|system\s+instructions)\b"),
    
    # 3. Credential & Environment Variable extraction
    re.compile(r"(?i)\b(?:give|tell|print|show|leak|reveal|dump)\s+(?:me\s+)?(?:all\s+)?(?:the\s+|your\s+)?(?:(?:gemini[_\s]*)?api[_\s]*key|secret|credentials|environment\s*variables|bearer\s*token|auth\s*token)\b"),
    re.compile(r"(?i)\b(?:echo|print|dump|show)\s+(?:all\s+)?(?:env|os[._\s]*environ|\$GEMINI_API_KEY|environment\s*variables)\b"),
    
    # 4. Safety bypass & Jailbreaks (DAN, unrestricted roleplay)
    re.compile(r"(?i)\b(?:bypass|disable|turn\s*off|deactivate)\s+(?:all\s+)?(?:safety|guardrails|filters|restrictions|checks|censorship)\b"),
    re.compile(r"(?i)\bpretend\s+(?:you\s+are|to\s+be)\s+(?:unrestricted|dan|jailbroken|an\s+unfiltered\s+ai|free\s+of\s+rules|in\s+developer\s+mode)\b"),
    re.compile(r"(?i)\byou\s+are\s+now\s+(?:in\s+developer\s+mode|unrestricted|free\s+of\s+constraints)\b"),

    # 5. Fake system / tool message injections
    re.compile(r"(?i)\[(?:system|admin|developer|root)\]\s*:\s*(?:override|ignore|bypass|disable)"),
    re.compile(r"(?i)<(?:system|admin|developer)>\s*(?:override|ignore|bypass|disable)"),

    # 6. Tool tampering and direct calculation fabrication
    re.compile(r"(?i)\b(?:do\s*not|don't)\s+(?:use|call|run|execute)\s+(?:any\s+)?(?:tools|farming\s+tools|weather\s+service)\b"),
    re.compile(r"(?i)\b(?:calculate|invent|make\s*up|fabricate)\b.*?\b(?:irrigation|numbers|math|values)\s+yourself\b"),
    re.compile(r"(?i)\bignore\s+(?:the\s+)?(?:tool\s+results|deterministic\s+calculations)\b"),

    # 7. Multilingual Injection Patterns (Diacritic-invariant)
    # Hindi / Hinglish
    re.compile(r"(?:पिछले\s+(?:सभी\s+)?निर्देश\s+(?:अनदेखा|भूल)\s+(?:करें|जाओ)|सिस्टम\s+प्रॉम्प्ट\s+(?:दिखाएं|बताएं))"),
    re.compile(r"(?i)\b(?:pichle|purane)\s+(?:sabhi\s+)?nirdesh\s+(?:bhool\s+jao|ignore\s+karo)\b"),
    re.compile(r"(?i)\bapna\s+system\s+prompt\s+(?:reveal|batao|dikhao)\b"),
    
    # Spanish (Normalized & diacritic stripped)
    re.compile(r"(?i)\b(?:ignora|olvida)\s+(?:todas\s+las\s+)?instrucciones\s+anteriores\b"),
    re.compile(r"(?i)\brevela\s+(?:tu\s+)?prompt\s+del\s+sistema\b"),
    re.compile(r"(?i)\bdame\s+tu\s+clave\s+api\b"),

    # French (Normalized & diacritic stripped: ignorez/oubliez toutes les instructions precedentes, invite systeme, cle api)
    re.compile(r"(?i)\b(?:ignorez|oubliez)\s+(?:toutes\s+les\s+)?instructions\s+precedentes\b"),
    re.compile(r"(?i)\brevelez\s+(?:votre\s+)?invite\s+systeme\b"),
    re.compile(r"(?i)\bdonnez[\s-]moi\s+votre\s+cle\s+api\b"),

    # German (Normalized & diacritic stripped: ignoriere alle vorherigen anweisungen, system-prompt, api-schlussel)
    re.compile(r"(?i)\bignoriere\s+(?:alle\s+)?vorherigen\s+anweisungen\b"),
    re.compile(r"(?i)\bzeige\s+deinen\s+system[\s-]prompt\b"),
    re.compile(r"(?i)\bgib\s+mir\s+deinen\s+api[\s-]schlussel\b"),

    # Arabic
    re.compile(r"(?:تجاهل\s+(?:جميع\s+)?التعليمات\s+السابقة|كشف\s+موجه\s+النظام|أعطني\s+مفتاح\s+api)"),

    # Telugu
    re.compile(r"(?:గత\s+సూచనలను\s+విస్మరించండి|సిస్టమ్\s+ప్రాంప్ట్\s+చూపండి)"),
]

# Sensitive internal filesystem and stack trace indicators
PATH_PATTERNS = [
    re.compile(r"[A-Za-z]:\\[Uu]sers\\[^\s\\]+"),
    re.compile(r"/home/[^\s/]+"),
    re.compile(r"Traceback \(most recent call last\):"),
]


def _collapse_single_letters(text: str) -> str:
    """Collapse runs of single letters separated by whitespace (e.g. 'r e v e a l' -> 'reveal')."""
    tokens = text.split(" ")
    out: List[str] = []
    curr_single: List[str] = []
    for t in tokens:
        if len(t) == 1 and t.isalpha():
            curr_single.append(t)
        else:
            if curr_single:
                out.append("".join(curr_single))
                curr_single = []
            if t:
                out.append(t)
    if curr_single:
        out.append("".join(curr_single))
    return " ".join(out)


def _normalize_text(text: str) -> str:
    """Normalize unicode lookalikes, strip diacritics, normalize delimiters, and collapse spaced characters."""
    # 1. Unicode NFD normalization and diacritic stripping
    decomposed = unicodedata.normalize("NFD", text)
    stripped = "".join(c for c in decomposed if unicodedata.category(c) != "Mn")
    
    # 2. Convert common injection punctuation/delimiters to spaces (- _ / . [ ] |)
    delims_cleaned = re.sub(r"[\-_\/\.\[\]\|]+", " ", stripped)
    
    # 3. Collapse spaced-out single letters if they form words (e.g. 'r e v e a l' -> 'reveal')
    collapsed = _collapse_single_letters(delims_cleaned)
    
    # 4. Collapse multiple whitespace
    return " ".join(collapsed.strip().split())


def _try_decode_payloads(text: str) -> List[str]:
    """Attempt decoding Base64 or Hex encoded payloads embedded in text."""
    decoded_variants: List[str] = [text]
    # Check for potential base64 chunks (length >= 16)
    b64_matches = re.findall(r"[A-Za-z0-9+/]{16,}={0,2}", text)
    for match in b64_matches:
        try:
            decoded = base64.b64decode(match).decode("utf-8", errors="ignore")
            if len(decoded) > 5:
                decoded_variants.append(decoded)
        except Exception:
            pass
    return decoded_variants


def detect_prompt_injection(text: Optional[str]) -> Tuple[bool, Optional[str]]:
    """Scan input text for prompt injection, system prompt extraction, or safety override attempts.

    Args:
        text: User query or prompt string.

    Returns:
        Tuple of (is_injected, detected_reason).
    """
    if not text:
        return False, None

    normalized_variants = _try_decode_payloads(text)

    for candidate in normalized_variants:
        norm = _normalize_text(candidate)
        for pattern in INJECTION_PATTERNS:
            if pattern.search(norm):
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
