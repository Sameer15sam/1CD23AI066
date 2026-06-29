import PriorityBadge from "./PriorityBadge";
import { timeAgo }   from "../utils/dateUtils";

const TYPE_ICONS = {
  placement: "💼", result: "📋", event: "🎉",
  circular:  "📢", fee:    "💳", general: "📌",
};

export default function NotificationCard({ notification, onMarkRead, onDelete }) {
  const { id, title, body, type, type_label, created_at, is_read } = notification;
  return (
    <article
      className={`notif-card ${is_read ? "notif-card--read" : "notif-card--unread"}`}
      onClick={() => !is_read && onMarkRead(id)}
      role="button" tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && !is_read && onMarkRead(id)}
    >
      <div className="notif-card-icon">{TYPE_ICONS[type] || "🔔"}</div>
      <div className="notif-card-body">
        <div className="notif-card-meta">
          <span className="notif-type-label">{type_label}</span>
          <PriorityBadge notification={notification} />
          {!is_read && <span className="unread-dot" />}
        </div>
        <h3 className="notif-card-title">{title}</h3>
        <p  className="notif-card-text">{body}</p>
        <span className="notif-card-time">{timeAgo(created_at)}</span>
      </div>
      <button
        className="notif-card-delete"
        onClick={(e) => { e.stopPropagation(); onDelete(id); }}
        title="Delete"
      >✕</button>
    </article>
  );
}
