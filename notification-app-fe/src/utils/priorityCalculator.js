import { PRIORITY_WEIGHTS, PRIORITY_LABELS } from "./constants";

export function calcPriorityScore(notification) {
  const typeWeight = PRIORITY_WEIGHTS[notification.type] ?? 5;
  const ageSeconds = (Date.now() - new Date(notification.created_at).getTime()) / 1000;
  // Type is primary (placement=1 beats general=5). Recency is secondary within the same type.
  return typeWeight * 1e6 + ageSeconds;
}

export function getPriorityLabel(notification) {
  const weight = PRIORITY_WEIGHTS[notification.type] ?? 5;
  return PRIORITY_LABELS[weight] ?? "Low";
}
