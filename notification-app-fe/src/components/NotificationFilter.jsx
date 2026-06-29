import { NOTIFICATION_TYPES, STATUS_FILTERS, SORT_OPTIONS } from "../utils/constants";

export default function NotificationFilter({ filters, onChange }) {
  const set = (key, value) => onChange({ ...filters, [key]: value, page: 1 });
  return (
    <div className="filter-bar">
      <select className="filter-select" value={filters.type || ""} onChange={(e) => set("type", e.target.value)}>
        {NOTIFICATION_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
      </select>
      <select className="filter-select" value={filters.status || ""} onChange={(e) => set("status", e.target.value)}>
        {STATUS_FILTERS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
      </select>
      <select className="filter-select" value={filters.sort || "newest"} onChange={(e) => set("sort", e.target.value)}>
        {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}
