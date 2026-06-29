import NotificationCard from "./NotificationCard";
import EmptyState       from "./EmptyState";

export default function NotificationList({ notifications, onMarkRead, onDelete }) {
  if (!notifications.length) return <EmptyState message="No notifications match your filters." />;
  return (
    <ul className="notif-list" role="list">
      {notifications.map((n) => (
        <li key={n.id}>
          <NotificationCard notification={n} onMarkRead={onMarkRead} onDelete={onDelete} />
        </li>
      ))}
    </ul>
  );
}
