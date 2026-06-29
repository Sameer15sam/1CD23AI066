export default function EmptyState({ message = "No notifications found." }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">🔔</div>
      <p className="empty-title">All clear</p>
      <p className="empty-msg">{message}</p>
    </div>
  );
}
