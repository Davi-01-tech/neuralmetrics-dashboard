"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import type { ChartView, TimeRange } from "@/types";
import { useMetrics } from "@/hooks/useMetrics";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { MetricCardSkeleton, ChartSkeleton } from "@/components/ui/Skeleton";
import { MorphingChart } from "@/components/dashboard/MorphingChart";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { TimeRangeSelector } from "@/components/dashboard/TimeRangeSelector";
import { LiveIndicator } from "@/components/dashboard/LiveIndicator";
import {
  generateMetricCards,
  metricsToTimeSeriesData,
} from "@/lib/data-generator";
import { CHART_VIEW_LABELS } from "@/lib/constants";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { RefreshCw } from "lucide-react";

export default function DashboardPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");
  const [chartView, setChartView] = useState<ChartView>("revenue");
  const [enableRealTime, setEnableRealTime] = useState(false);

  // Fetch metrics data
  const { metrics, loading, error, connectionStatus, refetch } = useMetrics({
    timeRange,
    enableRealTime,
  });

  // Generate metric cards
  const metricCards = useMemo(() => {
    return generateMetricCards(metrics);
  }, [metrics]);

  // Convert to time series data for chart
  const timeSeriesData = useMemo(() => {
    return metricsToTimeSeriesData(metrics, timeRange);
  }, [metrics, timeRange]);

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <motion.div variants={staggerItem}>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              AI analytics and performance metrics
            </p>
          </motion.div>

          <motion.div variants={staggerItem} className="flex items-center gap-3">
            <LiveIndicator status={connectionStatus} />
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={loading === "loading"}
              icon={<RefreshCw className={loading === "loading" ? "animate-spin" : ""} />}
            >
              Refresh
            </Button>

            <Button
              variant={enableRealTime ? "primary" : "outline"}
              size="sm"
              onClick={() => setEnableRealTime(!enableRealTime)}
            >
              {enableRealTime ? "Live" : "Static"}
            </Button>
          </motion.div>
        </motion.div>

        {/* Error state */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-danger/10 border border-danger/20 text-danger rounded-lg p-4"
          >
            <p className="font-medium">Error loading data</p>
            <p className="text-sm mt-1">{error.message}</p>
          </motion.div>
        )}

        {/* Metric Cards */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {loading === "loading" && metrics.length === 0 ? (
            // Loading skeletons
            <>
              {[1, 2, 3, 4].map((i) => (
                <motion.div key={i} variants={staggerItem}>
                  <Card>
                    <MetricCardSkeleton />
                  </Card>
                </motion.div>
              ))}
            </>
          ) : (
            // Actual metric cards
            metricCards.map((metric) => (
              <motion.div key={metric.id} variants={staggerItem}>
                <MetricCard metric={metric} />
              </motion.div>
            ))
          )}
        </motion.div>

        {/* Main Chart */}
        <motion.div
          variants={staggerItem}
          initial="initial"
          animate="animate"
        >
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle>Performance Metrics</CardTitle>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  {/* Time Range Selector */}
                  <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
                </div>
              </div>

              {/* Chart View Tabs */}
              <div className="flex gap-2 mt-4">
                {(Object.keys(CHART_VIEW_LABELS) as ChartView[]).map((view) => (
                  <Button
                    key={view}
                    variant={chartView === view ? "primary" : "ghost"}
                    size="sm"
                    onClick={() => setChartView(view)}
                  >
                    {CHART_VIEW_LABELS[view]}
                  </Button>
                ))}
              </div>
            </CardHeader>

            <CardContent>
              {loading === "loading" && metrics.length === 0 ? (
                <ChartSkeleton />
              ) : (
                <div className="h-[400px] w-full">
                  <MorphingChart
                    data={timeSeriesData}
                    currentView={chartView}
                    timeRange={timeRange}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          variants={staggerItem}
          initial="initial"
          animate="animate"
        >
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total Data Points
                  </p>
                  <p className="text-2xl font-bold mt-1 font-mono">
                    {metrics.length}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Time Range
                  </p>
                  <p className="text-2xl font-bold mt-1">
                    {timeRange.toUpperCase()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Current View
                  </p>
                  <p className="text-2xl font-bold mt-1">
                    {CHART_VIEW_LABELS[chartView]}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Status
                  </p>
                  <p className="text-2xl font-bold mt-1">
                    {connectionStatus === "connected" ? "🟢 Live" : "⚪ Static"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
