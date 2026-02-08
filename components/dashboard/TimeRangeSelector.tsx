"use client";

import { motion } from "framer-motion";
import type { TimeRange } from "@/types";
import { cn } from "@/lib/utils";
import { TIME_RANGES } from "@/lib/constants";
import { buttonPress } from "@/lib/animations";

interface TimeRangeSelectorProps {
  value: TimeRange;
  onChange: (value: TimeRange) => void;
  className?: string;
}

/**
 * TimeRangeSelector - Allows users to switch between time ranges
 * Features smooth animation and gesture support
 */
export function TimeRangeSelector({
  value,
  onChange,
  className,
}: TimeRangeSelectorProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg",
        className
      )}
    >
      {TIME_RANGES.map((range) => {
        const isActive = value === range.value;

        return (
          <motion.button
            key={range.value}
            onClick={() => onChange(range.value)}
            className={cn(
              "relative px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
              isActive
                ? "text-white"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            )}
            variants={buttonPress}
            initial="rest"
            whileHover="hover"
            whileTap="tap"
          >
            {/* Active background */}
            {isActive && (
              <motion.div
                layoutId="time-range-active"
                className="absolute inset-0 bg-primary-600 rounded-md"
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 30,
                }}
              />
            )}

            {/* Label */}
            <span className="relative z-10">{range.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
