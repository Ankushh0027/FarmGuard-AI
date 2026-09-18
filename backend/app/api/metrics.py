"""Application metrics registry and Prometheus exposition for FarmGuard AI.

Provides thread-safe counters, latency tracking, and Prometheus-compatible metrics export
without requiring heavy external dependencies.
"""

import threading
import time
from typing import Dict, Tuple, List, Optional


class MetricsRegistry:
    """In-memory metrics collector with Prometheus text exposition."""

    def __init__(self):
        self._lock = threading.Lock()
        # Key: (method, endpoint, status_code) -> count
        self.http_requests: Dict[Tuple[str, str, int], int] = {}
        # Key: (method, endpoint) -> (total_duration_seconds, count)
        self.http_duration: Dict[Tuple[str, str], Tuple[float, int]] = {}
        # Key: (guardrail, reason) -> count
        self.security_blocks: Dict[Tuple[str, str], int] = {}
        # Simple counters
        self.rate_limit_exceeded: int = 0
        self.auth_failures: int = 0
        # Key: tool_name -> count
        self.tool_invocations: Dict[str, int] = {}
        # Key: reason -> count
        self.fallback_activations: Dict[str, int] = {}

    def record_request(self, method: str, endpoint: str, status_code: int, duration_sec: float) -> None:
        with self._lock:
            key = (method.upper(), endpoint, status_code)
            self.http_requests[key] = self.http_requests.get(key, 0) + 1

            dur_key = (method.upper(), endpoint)
            prev_sum, prev_count = self.http_duration.get(dur_key, (0.0, 0))
            self.http_duration[dur_key] = (prev_sum + duration_sec, prev_count + 1)

    def record_security_block(self, guardrail: str, reason: str = "blocked") -> None:
        with self._lock:
            key = (guardrail, reason)
            self.security_blocks[key] = self.security_blocks.get(key, 0) + 1

    def record_rate_limit(self) -> None:
        with self._lock:
            self.rate_limit_exceeded += 1

    def record_auth_failure(self) -> None:
        with self._lock:
            self.auth_failures += 1

    def record_tool_invocation(self, tool_name: str) -> None:
        with self._lock:
            self.tool_invocations[tool_name] = self.tool_invocations.get(tool_name, 0) + 1

    def record_fallback(self, reason: str = "llm_unavailable") -> None:
        with self._lock:
            self.fallback_activations[reason] = self.fallback_activations.get(reason, 0) + 1

    def reset(self) -> None:
        with self._lock:
            self.http_requests.clear()
            self.http_duration.clear()
            self.security_blocks.clear()
            self.rate_limit_exceeded = 0
            self.auth_failures = 0
            self.tool_invocations.clear()
            self.fallback_activations.clear()

    def generate_prometheus_text(self) -> str:
        """Render metrics in Prometheus exposition format (text/plain)."""
        lines: List[str] = []

        with self._lock:
            # HTTP Requests Total
            lines.append("# HELP farmguard_http_requests_total Total number of HTTP requests.")
            lines.append("# TYPE farmguard_http_requests_total counter")
            if not self.http_requests:
                lines.append('farmguard_http_requests_total{method="GET",endpoint="/health",status="200"} 0')
            for (method, endpoint, status_code), count in sorted(self.http_requests.items()):
                lines.append(
                    f'farmguard_http_requests_total{{method="{method}",endpoint="{endpoint}",status="{status_code}"}} {count}'
                )

            # HTTP Duration Summary
            lines.append("# HELP farmguard_http_request_duration_seconds_total Total duration of HTTP requests in seconds.")
            lines.append("# TYPE farmguard_http_request_duration_seconds_total counter")
            for (method, endpoint), (dur_sum, count) in sorted(self.http_duration.items()):
                lines.append(
                    f'farmguard_http_request_duration_seconds_total{{method="{method}",endpoint="{endpoint}"}} {dur_sum:.6f}'
                )
                lines.append(
                    f'farmguard_http_request_duration_seconds_count{{method="{method}",endpoint="{endpoint}"}} {count}'
                )

            # Security Blocks Total
            lines.append("# HELP farmguard_security_blocks_total Total security guardrail triggers.")
            lines.append("# TYPE farmguard_security_blocks_total counter")
            for (guardrail, reason), count in sorted(self.security_blocks.items()):
                safe_reason = reason.replace('"', '\\"').replace("\n", " ")[:50]
                lines.append(
                    f'farmguard_security_blocks_total{{guardrail="{guardrail}",reason="{safe_reason}"}} {count}'
                )

            # Rate Limit & Auth Failures
            lines.append("# HELP farmguard_rate_limit_exceeded_total Total rate limit exceeded events.")
            lines.append("# TYPE farmguard_rate_limit_exceeded_total counter")
            lines.append(f"farmguard_rate_limit_exceeded_total {self.rate_limit_exceeded}")

            lines.append("# HELP farmguard_auth_failures_total Total authentication failures.")
            lines.append("# TYPE farmguard_auth_failures_total counter")
            lines.append(f"farmguard_auth_failures_total {self.auth_failures}")

            # Tool Invocations Total
            lines.append("# HELP farmguard_tool_invocations_total Total deterministic farm tool executions.")
            lines.append("# TYPE farmguard_tool_invocations_total counter")
            for tool_name, count in sorted(self.tool_invocations.items()):
                lines.append(f'farmguard_tool_invocations_total{{tool="{tool_name}"}} {count}')

            # Fallback Activations Total
            lines.append("# HELP farmguard_fallback_activations_total Total fallback deterministic synthesis events.")
            lines.append("# TYPE farmguard_fallback_activations_total counter")
            for reason, count in sorted(self.fallback_activations.items()):
                lines.append(f'farmguard_fallback_activations_total{{reason="{reason}"}} {count}')

        return "\n".join(lines) + "\n"


_global_metrics = MetricsRegistry()


def get_metrics_registry() -> MetricsRegistry:
    return _global_metrics
