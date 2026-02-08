"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { ChartView, TimeSeriesData, TimeRange } from "@/types";
import { cn } from "@/lib/utils";
import { useMorphTransition } from "@/hooks/useMorphTransition";
import { CHART_COLORS_LIGHT, CHART_COLORS_DARK } from "@/lib/constants";
import { staggerContainer } from "@/lib/animations";

interface MorphingChartProps {
  data: TimeSeriesData;
  currentView: ChartView;
  timeRange: TimeRange;
  theme?: "light" | "dark";
  className?: string;
}

/**
 * MorphingChart - The hero component with smooth view transitions
 * Morphs between revenue, users, and engagement rate visualizations
 */
export function MorphingChart({
  data,
  currentView,
  timeRange,
  theme = "light",
  className,
}: MorphingChartProps) {
  const [previousView, setPreviousView] = useState<ChartView | null>(null);

  // Use morph transition hook
  const { currentData, isAnimating } = useMorphTransition({
    data,
    currentView,
    previousView,
  });

  // Update previous view when current changes
  useMemo(() => {
    if (currentView !== previousView) {
      setPreviousView(currentView);
    }
  }, [currentView, previousView]);

  // Transform data for Recharts
  const chartData = useMemo(() => {
    return data.labels.map((label, index) => ({
      name: label,
      value: currentData[index] || 0,
      originalValue:
        currentView === "revenue"
          ? data.datasets.revenue[index]
          : currentView === "users"
          ? data.datasets.users[index]
          : data.datasets.engagement[index],
    }));
  }, [data.labels, currentData, currentView, data.datasets]);

  // Get colors based on theme and view
  const colors = theme === "dark" ? CHART_COLORS_DARK : CHART_COLORS_LIGHT;
  const chartColor =
    currentView === "revenue"
      ? colors.revenue
      : currentView === "users"
      ? colors.users
      : colors.engagement;

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: {
    active?: boolean; 
    payload?: Array<{
      value: number; 
      name: string;
      payload: {
        name: string;
      };
    }>
  }) => {
    if (!active || !payload || payload.length === 0) return null;

    const value = payload[0].value;
    const formattedValue =
      currentView === "engagement"
        ? `${value.toFixed(1)}%`
        : currentView === "revenue"
        ? `$${value.toLocaleString()}`
        : value.toLocaleString();

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3"
      >
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {formattedValue}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {payload[0].payload.name}
        </p>
      </motion.div>
    );
  };

  return (
    <div className={cn("relative w-full h-full", className)}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentView}
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          exit="exit"
          className="w-full h-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            {timeRange === "24h" || timeRange === "7d" ? (
              // Use line chart for short time ranges
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={colors.grid}
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  stroke={colors.text}
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke={colors.text}
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) =>
                    currentView === "engagement"
                      ? `${value}%`
                      : currentView === "revenue"
                      ? `$${(value / 1000).toFixed(0)}K`
                      : `${(value / 1000).toFixed(0)}K`
                  }
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={chartColor}
                  strokeWidth={3}
                  dot={{
                    r: 4,
                    fill: chartColor,
                    strokeWidth: 2,
                    stroke: colors.background,
                  }}
                  activeDot={{
                    r: 6,
                    fill: chartColor,
                    strokeWidth: 2,
                    stroke: colors.background,
                  }}
                  isAnimationActive={true}
                  animationDuration={1200}
                  animationEasing="ease-in-out"
                />
              </LineChart>
            ) : (
              // Use bar chart for longer time ranges
              <BarChart
                data={chartData}
                margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={colors.grid}
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  stroke={colors.text}
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke={colors.text}
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) =>
                    currentView === "engagement"
                      ? `${value}%`
                      : currentView === "revenue"
                      ? `$${(value / 1000).toFixed(0)}K`
                      : `${(value / 1000).toFixed(0)}K`
                  }
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="value"
                  fill={chartColor}
                  radius={[8, 8, 0, 0]}
                  isAnimationActive={true}
                  animationDuration={1200}
                  animationEasing="ease-in-out"
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </motion.div>
      </AnimatePresence>

      {/* Loading overlay during morph */}
      <AnimatePresence>
        {isAnimating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-white dark:bg-gray-900 pointer-events-none"
          />
        )}
      </AnimatePresence>
    </div>
  );
}
