import type { TimeRangeConfig, ChartTheme } from "@/types";

/**
 * Application metadata
 */
export const APP_NAME = "NeuralMetrics Dashboard";
export const APP_DESCRIPTION = "AI Analytics Platform with Real-Time Morphing Data Visualizations";
export const APP_URL = "https://neuralmetrics.vercel.app";

/**
 * Time range configurations
 */
export const TIME_RANGES: TimeRangeConfig[] = [
  { value: "24h", label: "24 Hours", days: 1 },
  { value: "7d", label: "7 Days", days: 7 },
  { value: "30d", label: "30 Days", days: 30 },
  { value: "90d", label: "90 Days", days: 90 },
  { value: "1y", label: "1 Year", days: 365 },
  { value: "all", label: "All Time", days: 730 },
];

/**
 * Chart view labels
 */
export const CHART_VIEW_LABELS = {
  revenue: "Revenue",
  users: "Active Users",
  engagement: "Engagement Rate",
} as const;

/**
 * Chart colors for light theme
 */
export const CHART_COLORS_LIGHT: ChartTheme = {
  revenue: "#8b5cf6",
  users: "#3b82f6",
  engagement: "#10b981",
  grid: "#e5e7eb",
  text: "#374151",
  background: "#ffffff",
};

/**
 * Chart colors for dark theme
 */
export const CHART_COLORS_DARK: ChartTheme = {
  revenue: "#a78bfa",
  users: "#60a5fa",
  engagement: "#34d399",
  grid: "#374151",
  text: "#d1d5db",
  background: "#1f2937",
};

/**
 * Animation durations (in milliseconds)
 */
export const ANIMATION_DURATION = {
  micro: 150,        // Button hover, icon transitions
  short: 300,        // Card flips, simple fades
  medium: 600,       // Modal open/close, page transitions
  long: 1200,        // Morphing animations
  extraLong: 1500,   // Complex chart transitions
} as const;

/**
 * Animation spring configurations
 */
export const SPRING_CONFIGS = {
  gentle: {
    type: "spring" as const,
    stiffness: 120,
    damping: 14,
  },
  snappy: {
    type: "spring" as const,
    stiffness: 400,
    damping: 25,
  },
  bouncy: {
    type: "spring" as const,
    stiffness: 300,
    damping: 20,
  },
  smooth: {
    type: "spring" as const,
    stiffness: 80,
    damping: 12,
  },
} as const;

/**
 * Stagger delays for list animations (in seconds)
 */
export const STAGGER_DELAY = {
  fast: 0.05,
  medium: 0.1,
  slow: 0.15,
} as const;

/**
 * API endpoints
 */
export const API_ENDPOINTS = {
  metrics: "/api/metrics",
  stream: "/api/stream",
} as const;

/**
 * Server-Sent Events configuration
 */
export const SSE_CONFIG = {
  reconnectInterval: 3000,   // 3 seconds
  maxReconnectAttempts: 5,
  heartbeatInterval: 30000,  // 30 seconds
  updateInterval: 5000,      // 5 seconds (new data point)
} as const;

/**
 * Local storage keys
 */
export const STORAGE_KEYS = {
  theme: "neuralmetrics-theme",
  preferences: "neuralmetrics-preferences",
  lastView: "neuralmetrics-last-view",
  timeRange: "neuralmetrics-time-range",
} as const;

/**
 * Chart configuration defaults
 */
export const CHART_DEFAULTS = {
  maxDataPoints: 50,         // Maximum points to show on chart
  minDataPoints: 10,         // Minimum points for smooth animation
  tooltipOffset: 10,         // Pixels from cursor
  gridLines: 5,              // Number of horizontal grid lines
  axisPadding: 20,           // Padding around chart axes
} as const;

/**
 * Metric card icons mapping
 */
export const METRIC_ICONS = {
  revenue: "DollarSign",
  users: "Users",
  accuracy: "Target",
  responseTime: "Zap",
} as const;

/**
 * Data generation parameters
 */
export const DATA_GENERATION = {
  baseRevenue: 50000,
  revenueGrowth: 0.15,       // 15% monthly growth
  revenueVolatility: 0.1,    // 10% random variation
  baseUsers: 10000,
  usersGrowth: 0.2,          // 20% monthly growth
  usersVolatility: 0.15,     // 15% random variation
  baseEngagement: 65,        // 65% base engagement rate
  engagementVolatility: 0.05, // 5% random variation
  weekendBoost: 1.2,         // 20% boost on weekends
  seasonalAmplitude: 0.3,    // 30% seasonal variation
} as const;

/**
 * Gesture thresholds
 */
export const GESTURE_THRESHOLDS = {
  dragDistance: 50,          // Minimum pixels to trigger drag
  swipeVelocity: 500,        // Minimum velocity for swipe (px/s)
  pinchThreshold: 0.1,       // Minimum scale change for pinch
  snapThreshold: 0.5,        // Threshold for snap-to-point (0-1)
} as const;

/**
 * Performance thresholds
 */
export const PERFORMANCE = {
  targetFPS: 60,
  budgetMS: 16.67,           // 1000ms / 60fps
  longTaskMS: 50,            // Tasks longer than this are logged
  debounceMS: 300,           // Default debounce delay
  throttleMS: 100,           // Default throttle delay
} as const;

/**
 * Breakpoint values (matches Tailwind)
 */
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

/**
 * Z-index layers
 */
export const Z_INDEX = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
} as const;

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
  FETCH_FAILED: "Failed to fetch data. Please try again.",
  NETWORK_ERROR: "Network error. Check your connection.",
  STREAM_DISCONNECTED: "Real-time connection lost. Reconnecting...",
  INVALID_DATA: "Received invalid data from server.",
  UNKNOWN_ERROR: "An unexpected error occurred.",
} as const;

/**
 * Success messages
 */
export const SUCCESS_MESSAGES = {
  CONNECTED: "Connected to real-time updates",
  DATA_LOADED: "Data loaded successfully",
  PREFERENCES_SAVED: "Preferences saved",
} as const;
