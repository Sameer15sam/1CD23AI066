import { useMemo }           from "react";
import { topNByPriority }    from "../utils/heap";
import { calcPriorityScore } from "../utils/priorityCalculator";
import { TOP_N }             from "../utils/constants";

export function usePriorityInbox(notifications) {
  return useMemo(() => {
    if (!notifications.length) return [];
    return topNByPriority(notifications, TOP_N, calcPriorityScore);
  }, [notifications]);
}
