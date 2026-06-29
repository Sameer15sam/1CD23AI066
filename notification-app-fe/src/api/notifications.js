import { apiFetch } from "./base";

export async function fetchNotifications(params = {}) {
  const query = new URLSearchParams();
  if (params.type)     query.set("type",     params.type);
  if (params.status)   query.set("status",   params.status);
  if (params.sort)     query.set("sort",     params.sort);
  if (params.page)     query.set("page",     params.page);
  if (params.per_page) query.set("per_page", params.per_page);
  const qs = query.toString();
  return apiFetch(qs ? `/notifications/?${qs}` : "/notifications/");
}

export async function fetchNotificationById(id) {
  return apiFetch(`/notifications/${id}`);
}
export async function markNotificationRead(id) {
  return apiFetch(`/notifications/${id}/read`, { method: "PATCH" });
}
export async function markAllNotificationsRead() {
  return apiFetch("/notifications/read-all", { method: "PATCH" });
}
export async function deleteNotification(id) {
  return apiFetch(`/notifications/${id}`, { method: "DELETE" });
}
export async function fetchUnreadCount() {
  return apiFetch("/notifications/unread-count");
}
export async function fetchStatistics() {
  return apiFetch("/notifications/statistics");
}
