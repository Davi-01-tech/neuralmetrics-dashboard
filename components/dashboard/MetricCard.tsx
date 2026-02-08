"use client";

import { useState, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { MetricCard as MetricCardType } from "@/types";
import { formatCurrency, formatNumber, cn } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { numberCount } from "@/lib/animations";

interface MetricCardProps {
  metric: MetricCardType;
  className?: string;
}

/**
 * MetricCard - Displays a single metric with sparkline and trend
 * Features 3D tilt effect that follows cursor
 */
export function MetricCard({ metric, className }: MetricCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Motion values for 3D tilt
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Spring physics for smooth movement
  const springX = useSpring(x, { stiffness: 400, damping: 30 });
  const springY = useSpring(y, { stiffness: 400, damping: 30 });

  // Transform motion values to rotation
  const rotateX = useTransform(springY, [-0.5, 0.5], [7.5, -7.5]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-7.5, 7.5]);

  /**
   * Handle mouse move for parallax effect
   */
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Calculate position relative to card center (-0.5 to 0.5)
    const xPos = (e.clientX - centerX) / (rect.width / 2);
    const yPos = (e.clientY - centerY) / (rect.height / 2);

    x.set(xPos);
    y.set(yPos);
  };

  /**
   * Reset card on mouse leave
   */
  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  // Format the value based on type
  const formattedValue =
    typeof metric.value === "number"
      ? metric.id === "revenue"
        ? formatCurrency(metric.value)
        : formatNumber(metric.value)
      : metric.value;

  // Trend indicator
  const TrendIcon =
    metric.trend === "up"
      ? TrendingUp
      : metric.trend === "down"
      ? TrendingDown
      : Minus;

  const trendColor =
    metric.trend === "up"
      ? "text-success"
      : metric.trend === "down"
      ? "text-danger"
      : "text-gray-400";

  const Icon = metric.icon;

  // Calculate sparkline path
  const sparklineMax = Math.max(...metric.sparkline);
  const sparklineMin = Math.min(...metric.sparkline);
  const sparklineRange = sparklineMax - sparklineMin;

  const sparklinePath = metric.sparkline
    .map((value, index) => {
      const x = (index / (metric.sparkline.length - 1)) * 100;
      const y =
        100 - ((value - sparklineMin) / sparklineRange) * 100 || 50;
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  return (
    <motion.div
      ref={cardRef}
      className={cn("perspective-1000", className)}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        transformStyle: "preserve-3d",
        perspective: 1000,
      }}
    >
      <motion.div
        style={{
          rotateX: isHovered ? rotateX : 0,
          rotateY: isHovered ? rotateY : 0,
          transformStyle: "preserve-3d",
        }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      >
        <Card className="p-6 hover:shadow-xl transition-shadow">
          {/* Header with title and icon */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {metric.title}
              </p>
            </div>
            <div
              className={cn(
                "p-2 rounded-lg",
                `bg-${metric.color}/10`,
                `text-${metric.color}`
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
          </div>

          {/* Value with animated counter */}
          <div className="mb-4">
            <motion.h2
              className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1 font-mono"
              key={formattedValue}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={numberCount}
            >
              {formattedValue}
            </motion.h2>

            {/* Trend indicator */}
            <div className={cn("flex items-center gap-1 text-sm", trendColor)}>
              <TrendIcon className="h-4 w-4" />
              <span className="font-medium">
                {Math.abs(metric.change).toFixed(1)}%
              </span>
              <span className="text-gray-500 dark:text-gray-400">
                vs last period
              </span>
            </div>
          </div>

          {/* Sparkline */}
          <div className="h-16">
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full"
              preserveAspectRatio="none"
            >
              {/* Background gradient */}
              <defs>
                <linearGradient id={`gradient-${metric.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={`var(--${metric.color})`} stopOpacity="0.3" />
                  <stop offset="100%" stopColor={`var(--${metric.color})`} stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Area fill */}
              <path
                d={`${sparklinePath} L 100 100 L 0 100 Z`}
                fill={`url(#gradient-${metric.id})`}
              />

              {/* Line */}
              <motion.path
                d={sparklinePath}
                fill="none"
                stroke={`var(--${metric.color})`}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, ease: "easeInOut" }}
              />
            </svg>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
