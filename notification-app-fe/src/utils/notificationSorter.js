import { calcPriorityScore } from "./priorityCalculator";

export function sortByPriority(notifications) {
  return [...notifications].sort((a, b) => calcPriorityScore(a) - calcPriorityScore(b));
}
export function sortByNewest(notifications) {
  return [...notifications].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}
export function sortByOldest(notifications) {
  return [...notifications].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
}
