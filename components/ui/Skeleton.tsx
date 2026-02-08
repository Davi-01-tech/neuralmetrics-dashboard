"use client";

import { HTMLAttributes } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SkeletonProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onAnimationStart' | 'onAnimationEnd'> {
  variant?: "rectangular" | "circular" | "text";
  width?: string | number;
  height?: string | number;
  count?: number;
}

/**
 * Skeleton component for loading states
 * Displays an animated placeholder while content loads
 */
export function Skeleton({
  className,
  variant = "rectangular",
  width,
  height,
  count = 1,
}: SkeletonProps) {
  const baseStyles =
    "bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700";

  const variantStyles = {
    rectangular: "rounded-md",
    circular: "rounded-full",
    text: "rounded h-4",
  };

  const style = {
    width: typeof width === "number" ? `${width}px` : width,
    height: typeof height === "number" ? `${height}px` : height,
  };

  if (count > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: count }).map((_, i) => (
          <motion.div
            key={i}
            className={cn(
              baseStyles,
              variantStyles[variant],
              className
            )}
            style={style}
            animate={{
              backgroundPosition: ["0% 0%", "100% 0%"],
            }}
            transition={{
              duration: 2,
              ease: "linear",
              repeat: Infinity,
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <motion.div
      className={cn(baseStyles, variantStyles[variant], className)}
      style={style}
      animate={{
        backgroundPosition: ["0% 0%", "100% 0%"],
      }}
      transition={{
        duration: 2,
        ease: "linear",
        repeat: Infinity,
      }}
    />
  );
}

/**
 * Predefined skeleton layouts for common components
 */

export function ChartSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton width={120} height={24} />
        <Skeleton width={80} height={32} variant="rectangular" />
      </div>
      <Skeleton width="100%" height={300} />
      <div className="flex gap-4">
        <Skeleton width={60} height={20} />
        <Skeleton width={60} height={20} />
        <Skeleton width={60} height={20} />
      </div>
    </div>
  );
}

export function MetricCardSkeleton() {
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-start justify-between">
        <Skeleton width={100} height={20} variant="text" />
        <Skeleton width={32} height={32} variant="circular" />
      </div>
      <div className="space-y-2">
        <Skeleton width={140} height={36} />
        <Skeleton width={80} height={20} variant="text" />
      </div>
      <Skeleton width="100%" height={60} />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      <div className="flex gap-4">
        <Skeleton width="25%" height={20} />
        <Skeleton width="25%" height={20} />
        <Skeleton width="25%" height={20} />
        <Skeleton width="25%" height={20} />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <Skeleton width="25%" height={16} />
          <Skeleton width="25%" height={16} />
          <Skeleton width="25%" height={16} />
          <Skeleton width="25%" height={16} />
        </div>
      ))}
    </div>
  );
}
