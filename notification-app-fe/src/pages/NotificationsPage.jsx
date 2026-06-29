import { useState }         from "react";
import { useNotifications } from "../hooks/useNotifications";
import { usePriorityInbox } from "../hooks/usePriorityInbox";
import NotificationHeader   from "../components/NotificationHeader";
import NotificationFilter   from "../components/NotificationFilter";
import NotificationList     from "../components/NotificationList";
import StatisticsPanel      from "../components/StatisticsPanel";
import LoadingSpinner       from "../components/LoadingSpinner";

const TABS = [
  { key: "all",      label: "All" },
  { key: "priority", label: "Priority Inbox" },
];

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [filters,   setFilters]   = useState({ sort: "newest" });

  const { notifications, unreadCount, statistics, loading, error, refresh, markRead, markAllRead, remove }
    = useNotifications(filters);

  const priorityInbox = usePriorityInbox(notifications);
  const displayList   = activeTab === "priority" ? priorityInbox : notifications;

  return (
    <div className="page-wrap">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="brand-icon">🎓</span>
          <span className="brand-name">Campus Portal</span>
        </div>
        <nav className="sidebar-nav">
          {TABS.map((tab) => (
            <button key={tab.key}
              className={`nav-item ${activeTab === tab.key ? "nav-item--active" : ""}`}
              onClick={() => setActiveTab(tab.key)}>
              {tab.label}
              {tab.key === "all" && unreadCount > 0 && <span className="nav-badge">{unreadCount}</span>}
              {tab.key === "priority" && <span className="nav-badge nav-badge--muted">Top 10</span>}
            </button>
          ))}
        </nav>
        <StatisticsPanel statistics={statistics} />
      </aside>
      <main className="main-content">
        <NotificationHeader unreadCount={unreadCount} onMarkAllRead={markAllRead} onRefresh={refresh} />
        {activeTab === "all" && <NotificationFilter filters={filters} onChange={setFilters} />}
        {activeTab === "priority" && (
          <p className="priority-desc">Your top 10 highest-priority notifications.</p>
        )}
        {loading && <LoadingSpinner />}
        {!loading && error && (
          <div className="error-banner" role="alert">
            ⚠ Could not load: {error}
            <button className="btn-ghost" onClick={refresh}>Retry</button>
          </div>
        )}
        {!loading && !error && (
          <NotificationList notifications={displayList} onMarkRead={markRead} onDelete={remove} />
        )}
      </main>
    </div>
  );
}
