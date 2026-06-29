import { PRIORITY_WEIGHTS, PRIORITY_LABELS } from "./constants";

export function calcPriorityScore(notification) {
  const typeWeight     = PRIORITY_WEIGHTS[notification.type] ?? 5;
  const ageSeconds     = (Date.now() - new Date(notification.created_at).getTime()) / 1000;
  const recencyPenalty = ageSeconds * 0.000001;
  return typeWeight + recencyPenalty;
}

export function getPriorityLabel(notification) {
  const weight = PRIORITY_WEIGHTS[notification.type] ?? 5;
  return PRIORITY_LABELS[weight] ?? "Low";
}
