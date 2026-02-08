"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type {
  Metric,
  TimeRange,
  MetricsResponse,
  ConnectionStatus,
  LoadingState,
  SSEMessage,
} from "@/types";
import { API_ENDPOINTS, SSE_CONFIG, ERROR_MESSAGES } from "@/lib/constants";

interface UseMetricsOptions {
  timeRange: TimeRange;
  enableRealTime?: boolean;
  onError?: (error: Error) => void;
  onConnectionChange?: (status: ConnectionStatus) => void;
}

interface UseMetricsReturn {
  metrics: Metric[];
  summary: MetricsResponse["summary"] | null;
  loading: LoadingState;
  error: Error | null;
  connectionStatus: ConnectionStatus;
  refetch: () => Promise<void>;
  disconnect: () => void;
}

/**
 * Custom hook for fetching and managing metrics data
 * Supports both initial fetch and real-time SSE updates
 */
export function useMetrics({
  timeRange,
  enableRealTime = false,
  onError,
  onConnectionChange,
}: UseMetricsOptions): UseMetricsReturn {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [summary, setSummary] = useState<MetricsResponse["summary"] | null>(
    null
  );
  const [loading, setLoading] = useState<LoadingState>("idle");
  const [error, setError] = useState<Error | null>(null);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("disconnected");

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const isMountedRef = useRef(true);

  /**
   * Update connection status and notify callback
   */
  const updateConnectionStatus = useCallback(
    (status: ConnectionStatus) => {
      setConnectionStatus(status);
      onConnectionChange?.(status);
    },
    [onConnectionChange]
  );

  /**
   * Fetch initial metrics data
   */
  const fetchMetrics = useCallback(async () => {
    try {
      setLoading("loading");
      setError(null);

      const response = await fetch(
        `${API_ENDPOINTS.metrics}?timeRange=${timeRange}`
      );

      if (!response.ok) {
        throw new Error(ERROR_MESSAGES.FETCH_FAILED);
      }

      const data: MetricsResponse = await response.json();

      if (!isMountedRef.current) return;

      // Convert timestamp strings to Date objects
      const metricsWithDates = data.data.map((metric) => ({
        ...metric,
        timestamp: new Date(metric.timestamp),
      }));

      setMetrics(metricsWithDates);
      setSummary(data.summary);
      setLoading("success");
    } catch (err) {
      if (!isMountedRef.current) return;

      const error =
        err instanceof Error ? err : new Error(ERROR_MESSAGES.UNKNOWN_ERROR);
      setError(error);
      setLoading("error");
      onError?.(error);
    }
  }, [timeRange, onError]);

  /**
   * Connect to Server-Sent Events for real-time updates
   */
  const connectSSE = useCallback(() => {
    // Clean up existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    try {
      const eventSource = new EventSource(API_ENDPOINTS.stream);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        if (!isMountedRef.current) return;
        updateConnectionStatus("connected");
        reconnectAttemptsRef.current = 0;
      };

      eventSource.onmessage = (event) => {
        if (!isMountedRef.current) return;

        try {
          const message: SSEMessage = JSON.parse(event.data);

          if (message.type === "metric") {
            const newMetric = message.data as Metric;
            setMetrics((prev) => {
              // Add new metric and keep last 50 points
              const updated = [
                ...prev,
                { ...newMetric, timestamp: new Date(newMetric.timestamp) },
              ].slice(-50);
              return updated;
            });
          }
        } catch (err) {
          console.error("Failed to parse SSE message:", err);
        }
      };

      eventSource.onerror = () => {
        if (!isMountedRef.current) return;

        eventSourceRef.current?.close();
        updateConnectionStatus("disconnected");

        // Attempt reconnection with exponential backoff
        if (
          reconnectAttemptsRef.current < SSE_CONFIG.maxReconnectAttempts
        ) {
          const delay =
            SSE_CONFIG.reconnectInterval *
            Math.pow(2, reconnectAttemptsRef.current);

          updateConnectionStatus("reconnecting");

          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            connectSSE();
          }, delay);
        } else {
          updateConnectionStatus("error");
          const error = new Error(ERROR_MESSAGES.STREAM_DISCONNECTED);
          setError(error);
          onError?.(error);
        }
      };
    } catch (err) {
      updateConnectionStatus("error");
      const error =
        err instanceof Error ? err : new Error(ERROR_MESSAGES.NETWORK_ERROR);
      setError(error);
      onError?.(error);
    }
  }, [updateConnectionStatus, onError]);

  /**
   * Disconnect from SSE
   */
  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    updateConnectionStatus("disconnected");
    reconnectAttemptsRef.current = 0;
  }, [updateConnectionStatus]);

  /**
   * Refetch data manually
   */
  const refetch = useCallback(async () => {
    await fetchMetrics();
  }, [fetchMetrics]);

  // Initial fetch
  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  // Real-time connection management
  useEffect(() => {
    if (enableRealTime) {
      connectSSE();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [enableRealTime, connectSSE, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      disconnect();
    };
  }, [disconnect]);

  return {
    metrics,
    summary,
    loading,
    error,
    connectionStatus,
    refetch,
    disconnect,
  };
}
