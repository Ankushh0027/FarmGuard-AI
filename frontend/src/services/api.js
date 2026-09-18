/**
 * FarmGuard AI — Frontend API Client
 * Interacts with FastAPI backend endpoints with fallback handling.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export async function checkHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/health`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    return { status: 'offline', error: err.message };
  }
}

export async function checkReady() {
  try {
    const res = await fetch(`${API_BASE_URL}/ready`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    return { status: 'offline', error: err.message };
  }
}

export async function getMetrics() {
  try {
    const res = await fetch(`${API_BASE_URL}/metrics`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } catch (err) {
    return null;
  }
}

export async function analyzeFarm(payload) {
  const res = await fetch(`${API_BASE_URL}/api/v1/farm/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    const errorMsg = data.message || (data.details ? JSON.stringify(data.details) : 'Farm analysis failed');
    throw new Error(errorMsg);
  }
  return data;
}

export async function getAgentAdvice(payload) {
  const res = await fetch(`${API_BASE_URL}/api/v1/agent/advice`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    const errorMsg = data.message || 'Agent consultation failed';
    throw new Error(errorMsg);
  }
  return data;
}
