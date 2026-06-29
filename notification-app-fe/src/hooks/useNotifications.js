import { useState, useEffect, useCallback } from "react";
import {
  fetchNotifications, fetchUnreadCount, fetchStatistics,
  markNotificationRead, markAllNotificationsRead, deleteNotification,
} from "../api/notifications";

const REFRESH_INTERVAL_MS = 30_000;

function filterKey(filters) {
  return [
    filters.type ?? "",
    filters.status ?? "",
    filters.sort ?? "newest",
    filters.page ?? 1,
    filters.per_page ?? 20,
  ].join("|");
}

export function useNotifications(filters = {}) {
  const [notifications, setNotifications] = useState([]);
  const [meta,          setMeta]          = useState(null);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const [statistics,    setStatistics]    = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);

  const key = filterKey(filters);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [notifRes, countRes, statsRes] = await Promise.all([
        fetchNotifications(filters),
        fetchUnreadCount(),
        fetchStatistics(),
      ]);
      setNotifications(notifRes.data);
      setMeta(notifRes.meta);
      setUnreadCount(countRes.unread_count);
      setStatistics(statsRes.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    load();
    const interval = setInterval(load, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [load]);

  const markRead = useCallback(async (id) => {
    await markNotificationRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    setUnreadCount((c) => Math.max(0, c - 1));
  }, []);

  const markAllRead = useCallback(async () => {
    await markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  }, []);

  const remove = useCallback(async (id) => {
    await deleteNotification(id);
    setNotifications((prev) => {
      const target = prev.find((n) => n.id === id);
      if (target && !target.is_read) {
        setUnreadCount((c) => Math.max(0, c - 1));
      }
      return prev.filter((n) => n.id !== id);
    });
  }, []);

  return { notifications, meta, unreadCount, statistics, loading, error, refresh: load, markRead, markAllRead, remove };
}
