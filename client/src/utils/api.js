const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "";

export function apiUrl(path) {
  return `${API_BASE}${path}`;
}

export function getApiHint() {
  if (API_BASE) return `API: ${API_BASE}`;
  if (import.meta.env.DEV) return "Start the backend: uvicorn api:app --reload --port 8000";
  return "Set VITE_API_URL to your Render URL in Vercel, then redeploy.";
}

export async function readApiError(res) {
  try {
    const data = await res.json();
    if (data?.detail) return typeof data.detail === "string" ? data.detail : JSON.stringify(data.detail);
  } catch {
    // ignore non-JSON bodies
  }
  return `HTTP ${res.status}`;
}