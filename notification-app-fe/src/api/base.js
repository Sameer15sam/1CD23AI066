import { DEFAULT_STUDENT_ID, STUDENT_ID_HEADER } from "../utils/constants";

export const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export async function apiFetch(path, options = {}) {
  const studentId = localStorage.getItem("studentId") || DEFAULT_STUDENT_ID;
  const response  = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      [STUDENT_ID_HEADER]: studentId,
      ...(options.headers || {}),
    },
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(err.error || `HTTP ${response.status}`);
  }
  return response.json();
}
