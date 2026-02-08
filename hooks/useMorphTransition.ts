"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useMotionValue, useSpring, useTransform } from "framer-motion";
import type { ChartView, ChartDataPoint, TimeSeriesData } from "@/types";
import { ANIMATION_DURATION, SPRING_CONFIGS } from "@/lib/constants";

interface UseMorphTransitionOptions {
  data: TimeSeriesData;
  currentView: ChartView;
  previousView: ChartView | null;
}

interface UseMorphTransitionReturn {
  currentData: number[];
  isAnimating: boolean;
  progress: number;
  dataPoints: ChartDataPoint[];
}

/**
 * Custom hook for managing smooth morphing transitions between chart views
 * Handles the complex animation logic for data point transformations
 */
export function useMorphTransition({
  data,
  currentView,
  previousView,
}: UseMorphTransitionOptions): UseMorphTransitionReturn {
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationStartTime, setAnimationStartTime] = useState<number | null>(
    null
  );

  // Motion value for animation progress (0 to 1)
  const progress = useMotionValue(0);

  // Spring animation for smooth transitions
  const springProgress = useSpring(progress, {
    ...SPRING_CONFIGS.smooth,
    duration: ANIMATION_DURATION.long / 1000,
  });

  /**
   * Get data array for a specific view
   */
  const getDataForView = useCallback(
    (view: ChartView): number[] => {
      switch (view) {
        case "revenue":
          return data.datasets.revenue;
        case "users":
          return data.datasets.users;
        case "engagement":
          return data.datasets.engagement;
        default:
          return [];
      }
    },
    [data]
  );

  /**
   * Previous data (for morphing from)
   */
  const previousData = useMemo(() => {
    return previousView ? getDataForView(previousView) : [];
  }, [previousView, getDataForView]);

  /**
   * Current data (for morphing to)
   */
  const targetData = useMemo(() => {
    return getDataForView(currentView);
  }, [currentView, getDataForView]);

  /**
   * Calculate interpolated data points during animation
   */
  const currentData = useTransform(springProgress, (p) => {
    if (previousData.length === 0 || !isAnimating) {
      return targetData;
    }

    // Interpolate between previous and target data
    return targetData.map((target, index) => {
      const previous = previousData[index] || target;
      return previous + (target - previous) * p;
    });
  });

  /**
   * Generate enhanced data points with animation metadata
   */
  const dataPoints = useMemo((): ChartDataPoint[] => {
    const values = isAnimating
      ? currentData.get()
      : targetData;

    return values.map((value, index) => ({
      x: index,
      y: value,
      label: data.labels[index] || "",
      originalIndex: index,
    }));
  }, [data.labels, targetData, currentData, isAnimating]);

  /**
   * Start morphing animation when view changes
   */
  useEffect(() => {
    if (previousView && previousView !== currentView) {
      setIsAnimating(true);
      setAnimationStartTime(Date.now());
      progress.set(0);

      // Animate to completion
      progress.set(1);

      // Mark animation as complete
      const timeoutId = setTimeout(() => {
        setIsAnimating(false);
        setAnimationStartTime(null);
      }, ANIMATION_DURATION.long);

      return () => {
        clearTimeout(timeoutId);
      };
    }
    
    return undefined;
  }, [currentView, previousView, progress]);

  /**
   * Calculate current progress percentage
   */
  const progressPercentage = useMemo(() => {
    if (!isAnimating || !animationStartTime) return 0;

    const elapsed = Date.now() - animationStartTime;
    return Math.min((elapsed / ANIMATION_DURATION.long) * 100, 100);
  }, [isAnimating, animationStartTime]);

  return {
    currentData: currentData.get(),
    isAnimating,
    progress: progressPercentage,
    dataPoints,
  };
}

/**
 * Helper hook for staggered animations in lists
 */
export function useStaggeredAnimation(
  itemCount: number,
  baseDelay: number = 50
) {
  return useMemo(() => {
    return Array.from({ length: itemCount }, (_, index) => ({
      delay: index * baseDelay,
      index,
    }));
  }, [itemCount, baseDelay]);
}

/**
 * Hook for managing chart scale transitions
 */
export function useChartScale(data: number[]) {
  const minValue = useMemo(() => Math.min(...data, 0), [data]);
  const maxValue = useMemo(() => Math.max(...data, 0), [data]);

  // Add padding to scale (10% on each side)
  const padding = (maxValue - minValue) * 0.1;
  const scale = useMemo(
    () => ({
      min: minValue - padding,
      max: maxValue + padding,
      range: maxValue - minValue + padding * 2,
    }),
    [minValue, maxValue, padding]
  );

  return scale;
}
