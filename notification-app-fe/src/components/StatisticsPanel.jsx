const TYPE_COLORS = {
  placement: "#6366f1", result: "#10b981", event: "#f59e0b",
  circular:  "#3b82f6", fee:    "#ef4444", general: "#8b5cf6",
};

export default function StatisticsPanel({ statistics }) {
  if (!statistics.length) return null;
  return (
    <section className="stats-panel">
      <h2 className="stats-title">Overview</h2>
      <div className="stats-grid">
        {statistics.map((stat) => (
          <div key={stat.type} className="stat-card"
            style={{ borderTop: `3px solid ${TYPE_COLORS[stat.type] || "#6b7280"}` }}>
            <p className="stat-label">{stat.type_label}</p>
            <p className="stat-total">{stat.total}</p>
            {stat.unread > 0 && <p className="stat-unread">{stat.unread} unread</p>}
          </div>
        ))}
      </div>
    </section>
  );
}
