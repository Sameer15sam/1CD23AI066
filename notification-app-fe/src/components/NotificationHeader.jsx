export default function NotificationHeader({ unreadCount, onMarkAllRead, onRefresh }) {
  return (
    <div className="notif-header">
      <div className="notif-header-left">
        <h1 className="notif-title">Notifications</h1>
        {unreadCount > 0 && <span className="unread-badge">{unreadCount} unread</span>}
      </div>
      <div className="notif-header-actions">
        {unreadCount > 0 && (
          <button className="btn-ghost" onClick={onMarkAllRead}>Mark all read</button>
        )}
        <button className="btn-ghost" onClick={onRefresh}>↻ Refresh</button>
      </div>
    </div>
  );
}
