import { apiFetch } from "./base";

export async function login(studentCode) {
  return apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ student_id: studentCode }),
  });
}
export async function fetchCurrentStudent() {
  return apiFetch("/auth/me");
}
