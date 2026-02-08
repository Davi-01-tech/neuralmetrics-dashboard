"use client";

import { motion } from "framer-motion";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";
import type { ConnectionStatus } from "@/types";
import { cn } from "@/lib/utils";
import { pulse } from "@/lib/animations";

interface LiveIndicatorProps {
  status: ConnectionStatus;
  showLabel?: boolean;
  className?: string;
}

/**
 * LiveIndicator - Shows real-time connection status with pulsing animation
 */
export function LiveIndicator({
  status,
  showLabel = true,
  className,
}: LiveIndicatorProps) {
  const statusConfig = {
    connected: {
      color: "bg-success",
      label: "Live",
      icon: Wifi,
      animate: true,
    },
    disconnected: {
      color: "bg-gray-400",
      label: "Offline",
      icon: WifiOff,
      animate: false,
    },
    reconnecting: {
      color: "bg-warning",
      label: "Reconnecting",
      icon: RefreshCw,
      animate: true,
    },
    error: {
      color: "bg-danger",
      label: "Error",
      icon: WifiOff,
      animate: false,
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative flex items-center justify-center">
        {/* Pulsing ring for active states */}
        {config.animate && (
          <motion.div
            className={cn("absolute h-3 w-3 rounded-full", config.color)}
            variants={pulse}
            animate="animate"
            style={{ opacity: 0.4 }}
          />
        )}
        
        {/* Main dot */}
        <div
          className={cn(
            "h-2 w-2 rounded-full",
            config.color
          )}
        />
      </div>

      {showLabel && (
        <div className="flex items-center gap-1.5">
          <Icon className="h-3.5 w-3.5 text-gray-600 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {config.label}
          </span>
        </div>
      )}

      {status === "reconnecting" && (
        <RefreshCw className="h-3.5 w-3.5 animate-spin text-warning" />
      )}
    </div>
  );
}
