export function timeAgo(isoString) {
  const diffSecs = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
  if (diffSecs < 60)     return "just now";
  if (diffSecs < 3600)   return `${Math.floor(diffSecs / 60)}m ago`;
  if (diffSecs < 86400)  return `${Math.floor(diffSecs / 3600)}h ago`;
  if (diffSecs < 604800) return `${Math.floor(diffSecs / 86400)}d ago`;
  return new Date(isoString).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
}

export function formatDateTime(isoString) {
  return new Date(isoString).toLocaleString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export function isWithinDays(isoString, days) {
  return new Date(isoString).getTime() >= Date.now() - days * 86400000;
}
