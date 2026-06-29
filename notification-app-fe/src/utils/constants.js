export const PRIORITY_WEIGHTS = {
  placement: 1,
  result:    2,
  event:     3,
  circular:  4,
  fee:       4,
  general:   5,
};

export const PRIORITY_LABELS = {
  1: "High",
  2: "High",
  3: "Medium",
  4: "Low",
  5: "Low",
};

export const PRIORITY_COLORS = {
  High:   "#ef4444",
  Medium: "#f59e0b",
  Low:    "#6b7280",
};

export const NOTIFICATION_TYPES = [
  { value: "",          label: "All Types" },
  { value: "placement", label: "Placement" },
  { value: "result",    label: "Results" },
  { value: "event",     label: "Events" },
  { value: "circular",  label: "Circulars" },
  { value: "fee",       label: "Fee" },
  { value: "general",   label: "General" },
];

export const STATUS_FILTERS = [
  { value: "",       label: "All" },
  { value: "unread", label: "Unread" },
  { value: "read",   label: "Read" },
];

export const SORT_OPTIONS = [
  { value: "newest",   label: "Newest First" },
  { value: "oldest",   label: "Oldest First" },
  { value: "priority", label: "By Priority" },
];

export const TOP_N = 10;
export const STUDENT_ID_HEADER  = "X-Student-ID";
export const DEFAULT_STUDENT_ID = "1";
