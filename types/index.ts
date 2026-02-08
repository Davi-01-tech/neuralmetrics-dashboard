import { LucideIcon } from "lucide-react";

/**
 * Core metric data structure representing a single data point in time
 */
export interface Metric {
  id: string;
  timestamp: Date;
  revenue: number;
  activeUsers: number;
  engagementRate: number; // 0-100 percentage
}

/**
 * Time series data structure for chart rendering
 */
export interface TimeSeriesData {
  labels: string[]; // X-axis labels (dates/times)
  datasets: {
    revenue: number[];
    users: number[];
    engagement: number[];
  };
}

/**
 * Metric card display data
 */
export interface MetricCard {
  id: string;
  title: string;
  value: number | string;
  change: number; // Percentage change from previous period
  trend: "up" | "down" | "neutral";
  sparkline: number[]; // Mini chart data points
  icon: LucideIcon;
  color: string; // Tailwind color class
}

/**
 * Chart view modes for morphing transitions
 */
export type ChartView = "revenue" | "users" | "engagement";

/**
 * Time range options for data filtering
 */
export type TimeRange = "24h" | "7d" | "30d" | "90d" | "1y" | "all";

/**
 * Time range configuration
 */
export interface TimeRangeConfig {
  value: TimeRange;
  label: string;
  days: number; // Number of days to fetch
}

/**
 * Chart data point for morphing animations
 */
export interface ChartDataPoint {
  x: number; // Position in array
  y: number; // Value
  label: string; // Display label
  originalIndex: number; // Track for animation
}

/**
 * Animation state for morphing transitions
 */
export interface MorphAnimationState {
  isAnimating: boolean;
  progress: number; // 0-1
  from: ChartView;
  to: ChartView;
}

/**
 * Gesture state for drag interactions
 */
export interface GestureState {
  isDragging: boolean;
  startX: number;
  currentX: number;
  velocity: number;
}

/**
 * API response structure for metrics endpoint
 */
export interface MetricsResponse {
  data: Metric[];
  summary: {
    totalRevenue: number;
    totalUsers: number;
    avgEngagement: number;
    revenueChange: number;
    usersChange: number;
    engagementChange: number;
  };
  timeRange: {
    start: Date;
    end: Date;
  };
}

/**
 * Server-Sent Events message structure
 */
export interface SSEMessage {
  type: "metric" | "connection" | "error";
  data: Metric | { status: string } | { message: string };
  timestamp: number;
}

/**
 * Theme configuration
 */
export type Theme = "light" | "dark";

/**
 * Chart theme colors
 */
export interface ChartTheme {
  revenue: string;
  users: string;
  engagement: string;
  grid: string;
  text: string;
  background: string;
}

/**
 * Loading state types
 */
export type LoadingState = "idle" | "loading" | "success" | "error";

/**
 * Error state
 */
export interface ErrorState {
  hasError: boolean;
  message: string;
  code?: string;
}

/**
 * Viewport breakpoints
 */
export type Breakpoint = "mobile" | "tablet" | "desktop";

/**
 * Animation preferences
 */
export interface AnimationPreferences {
  prefersReducedMotion: boolean;
  enableMorphing: boolean;
  enableGestures: boolean;
  animationDuration: number;
}

/**
 * Date range for time-based filtering
 */
export interface DateRange {
  from: Date;
  to: Date;
}

/**
 * Chart configuration
 */
export interface ChartConfig {
  view: ChartView;
  timeRange: TimeRange;
  showGrid: boolean;
  showTooltip: boolean;
  animate: boolean;
}

/**
 * User preferences stored in localStorage
 */
export interface UserPreferences {
  theme: Theme;
  defaultView: ChartView;
  defaultTimeRange: TimeRange;
  animationsEnabled: boolean;
}

/**
 * Real-time connection status
 */
export type ConnectionStatus = "connected" | "disconnected" | "reconnecting" | "error";

/**
 * Tooltip data for chart interactions
 */
export interface TooltipData {
  label: string;
  value: number;
  formattedValue: string;
  color: string;
  x: number;
  y: number;
}
