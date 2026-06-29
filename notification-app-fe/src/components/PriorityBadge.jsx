import { getPriorityLabel } from "../utils/priorityCalculator";
import { PRIORITY_COLORS }  from "../utils/constants";

export default function PriorityBadge({ notification }) {
  const label = getPriorityLabel(notification);
  const color = PRIORITY_COLORS[label];
  return (
    <span style={{
      backgroundColor: `${color}18`, color, border: `1px solid ${color}40`,
      borderRadius: "4px", padding: "2px 8px", fontSize: "11px",
      fontWeight: "600", letterSpacing: "0.04em", textTransform: "uppercase",
    }}>
      {label}
    </span>
  );
}
