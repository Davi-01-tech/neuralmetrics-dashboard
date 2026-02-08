import {
  startOfDay,
  addDays,
  addHours,
  format,
  isWeekend,
  getMonth,
} from "date-fns";
import type { Metric, TimeSeriesData, MetricCard, TimeRange } from "@/types";
import { generateId, getDateRangeFromTimeRange } from "./utils";
import { DATA_GENERATION } from "./constants";
import {
  DollarSign,
  Users,
  Target,
  Zap,
} from "lucide-react";

/**
 * Generate a single metric data point with realistic variations
 */
function generateMetricPoint(
  baseDate: Date,
  index: number,
  totalPoints: number
): Metric {
  const date = new Date(baseDate);
  
  // Time-based factors
  const dayProgress = index / totalPoints; // 0 to 1
  const isWeekendDay = isWeekend(date);
  const month = getMonth(date);
  
  // Seasonal factor (peaks in Q4, dips in summer)
  const seasonalFactor =
    1 +
    Math.sin(((month - 5) / 12) * Math.PI * 2) *
    DATA_GENERATION.seasonalAmplitude;
  
  // Weekend boost factor
  const weekendFactor = isWeekendDay ? DATA_GENERATION.weekendBoost : 1;
  
  // Growth trend (exponential)
  const growthFactor = Math.pow(
    1 + DATA_GENERATION.revenueGrowth / 30,
    index
  );
  
  // Random volatility
  const revenueVolatility =
    1 + (Math.random() - 0.5) * 2 * DATA_GENERATION.revenueVolatility;
  const usersVolatility =
    1 + (Math.random() - 0.5) * 2 * DATA_GENERATION.usersVolatility;
  const engagementVolatility =
    1 + (Math.random() - 0.5) * 2 * DATA_GENERATION.engagementVolatility;
  
  // Calculate metrics
  const revenue = Math.round(
    DATA_GENERATION.baseRevenue *
    growthFactor *
    seasonalFactor *
    weekendFactor *
    revenueVolatility
  );
  
  const activeUsers = Math.round(
    DATA_GENERATION.baseUsers *
    Math.pow(1 + DATA_GENERATION.usersGrowth / 30, index) *
    seasonalFactor *
    weekendFactor *
    usersVolatility
  );
  
  // Engagement rate (clamped between 40% and 90%)
  const engagement = Math.max(
    40,
    Math.min(
      90,
      DATA_GENERATION.baseEngagement *
      (1 + Math.sin(dayProgress * Math.PI * 4) * 0.1) *
      engagementVolatility
    )
  );
  
  return {
    id: generateId(),
    timestamp: date,
    revenue,
    activeUsers,
    engagementRate: Number(engagement.toFixed(2)),
  };
}

/**
 * Generate an array of metrics for a given time range
 */
export function generateMetrics(timeRange: TimeRange): Metric[] {
  const { from, to } = getDateRangeFromTimeRange(timeRange);
  const metrics: Metric[] = [];
  
  // Determine interval based on time range
  let interval: number;
  let totalPoints: number;
  
  switch (timeRange) {
    case "24h":
      interval = 1; // 1 hour
      totalPoints = 24;
      break;
    case "7d":
      interval = 24; // 1 day
      totalPoints = 7;
      break;
    case "30d":
      interval = 24; // 1 day
      totalPoints = 30;
      break;
    case "90d":
      interval = 24 * 3; // 3 days
      totalPoints = 30;
      break;
    case "1y":
      interval = 24 * 7; // 1 week
      totalPoints = 52;
      break;
    case "all":
      interval = 24 * 14; // 2 weeks
      totalPoints = 52;
      break;
    default:
      interval = 24;
      totalPoints = 30;
  }
  
  let currentDate = startOfDay(from);
  let index = 0;
  
  while (currentDate <= to && index < totalPoints) {
    metrics.push(generateMetricPoint(currentDate, index, totalPoints));
    currentDate = addHours(currentDate, interval);
    index++;
  }
  
  return metrics;
}

/**
 * Generate a single new metric (for real-time updates)
 */
export function generateNewMetric(): Metric {
  return generateMetricPoint(new Date(), 0, 1);
}

/**
 * Convert metrics array to time series data for charts
 */
export function metricsToTimeSeriesData(
  metrics: Metric[],
  timeRange: TimeRange
): TimeSeriesData {
  return {
    labels: metrics.map((m) =>
      format(m.timestamp, timeRange === "24h" ? "HH:mm" : "MMM dd")
    ),
    datasets: {
      revenue: metrics.map((m) => m.revenue),
      users: metrics.map((m) => m.activeUsers),
      engagement: metrics.map((m) => m.engagementRate),
    },
  };
}

/**
 * Calculate summary statistics from metrics
 */
export function calculateSummary(metrics: Metric[]) {
  if (metrics.length === 0) {
    return {
      totalRevenue: 0,
      totalUsers: 0,
      avgEngagement: 0,
      revenueChange: 0,
      usersChange: 0,
      engagementChange: 0,
    };
  }
  
  const totalRevenue = metrics.reduce((sum, m) => sum + m.revenue, 0);
  const totalUsers = metrics[metrics.length - 1].activeUsers;
  const avgEngagement =
    metrics.reduce((sum, m) => sum + m.engagementRate, 0) / metrics.length;
  
  // Calculate changes (comparing last 20% vs first 20%)
  const splitIndex = Math.floor(metrics.length * 0.2);
  const firstSegment = metrics.slice(0, splitIndex);
  const lastSegment = metrics.slice(-splitIndex);
  
  const avgFirstRevenue =
    firstSegment.reduce((sum, m) => sum + m.revenue, 0) / firstSegment.length;
  const avgLastRevenue =
    lastSegment.reduce((sum, m) => sum + m.revenue, 0) / lastSegment.length;
  
  const avgFirstUsers =
    firstSegment.reduce((sum, m) => sum + m.activeUsers, 0) /
    firstSegment.length;
  const avgLastUsers =
    lastSegment.reduce((sum, m) => sum + m.activeUsers, 0) /
    lastSegment.length;
  
  const avgFirstEngagement =
    firstSegment.reduce((sum, m) => sum + m.engagementRate, 0) /
    firstSegment.length;
  const avgLastEngagement =
    lastSegment.reduce((sum, m) => sum + m.engagementRate, 0) /
    lastSegment.length;
  
  const revenueChange =
    ((avgLastRevenue - avgFirstRevenue) / avgFirstRevenue) * 100;
  const usersChange = ((avgLastUsers - avgFirstUsers) / avgFirstUsers) * 100;
  const engagementChange =
    ((avgLastEngagement - avgFirstEngagement) / avgFirstEngagement) * 100;
  
  return {
    totalRevenue,
    totalUsers,
    avgEngagement,
    revenueChange,
    usersChange,
    engagementChange,
  };
}

/**
 * Generate metric cards data
 */
export function generateMetricCards(metrics: Metric[]): MetricCard[] {
  const summary = calculateSummary(metrics);
  
  // Generate sparkline data (last 10 points)
  const sparklineCount = Math.min(10, metrics.length);
  const recentMetrics = metrics.slice(-sparklineCount);
  
  return [
    {
      id: "revenue",
      title: "Total Revenue",
      value: summary.totalRevenue,
      change: summary.revenueChange,
      trend:
        summary.revenueChange > 0
          ? "up"
          : summary.revenueChange < 0
          ? "down"
          : "neutral",
      sparkline: recentMetrics.map((m) => m.revenue),
      icon: DollarSign,
      color: "chart-revenue",
    },
    {
      id: "users",
      title: "Active Users",
      value: summary.totalUsers,
      change: summary.usersChange,
      trend:
        summary.usersChange > 0
          ? "up"
          : summary.usersChange < 0
          ? "down"
          : "neutral",
      sparkline: recentMetrics.map((m) => m.activeUsers),
      icon: Users,
      color: "chart-users",
    },
    {
      id: "engagement",
      title: "Engagement Rate",
      value: `${summary.avgEngagement.toFixed(1)}%`,
      change: summary.engagementChange,
      trend:
        summary.engagementChange > 0
          ? "up"
          : summary.engagementChange < 0
          ? "down"
          : "neutral",
      sparkline: recentMetrics.map((m) => m.engagementRate),
      icon: Target,
      color: "chart-engagement",
    },
    {
      id: "response",
      title: "Avg Response Time",
      value: "124ms",
      change: -8.3,
      trend: "up", // Lower response time is better
      sparkline: [150, 145, 138, 142, 135, 128, 125, 122, 126, 124],
      icon: Zap,
      color: "primary-500",
    },
  ];
}

/**
 * Generate edge case scenarios for testing
 */
export function generateEdgeCases(): {
  name: string;
  metrics: Metric[];
}[] {
  const now = new Date();
  
  return [
    {
      name: "All zeros",
      metrics: [
        {
          id: generateId(),
          timestamp: now,
          revenue: 0,
          activeUsers: 0,
          engagementRate: 0,
        },
      ],
    },
    {
      name: "Single data point",
      metrics: [generateMetricPoint(now, 0, 1)],
    },
    {
      name: "Extreme volatility",
      metrics: Array.from({ length: 10 }, (_, i) => ({
        id: generateId(),
        timestamp: addDays(now, i),
        revenue: Math.random() > 0.5 ? 100000 : 10000,
        activeUsers: Math.random() > 0.5 ? 50000 : 5000,
        engagementRate: Math.random() * 100,
      })),
    },
    {
      name: "Negative growth",
      metrics: Array.from({ length: 30 }, (_, i) => ({
        id: generateId(),
        timestamp: addDays(now, i),
        revenue: 100000 * Math.pow(0.95, i),
        activeUsers: 50000 * Math.pow(0.97, i),
        engagementRate: 80 * Math.pow(0.98, i),
      })),
    },
    {
      name: "Missing data gaps",
      metrics: Array.from({ length: 30 }, (_, i) => {
        // Skip every 5th day
        if (i % 5 === 0) {
          return null;
        }
        return generateMetricPoint(addDays(now, i), i, 30);
      }).filter((m): m is Metric => m !== null),
    },
  ];
}

/**
 * Simulate streaming data with delays
 */
export async function* streamMetrics(
  count: number,
  delayMs: number = 1000
): AsyncGenerator<Metric> {
  for (let i = 0; i < count; i++) {
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    yield generateNewMetric();
  }
}
