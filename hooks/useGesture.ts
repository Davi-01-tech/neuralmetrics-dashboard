"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useMotionValue, useVelocity, animate } from "framer-motion";
import type { GestureState } from "@/types";
import { GESTURE_THRESHOLDS, SPRING_CONFIGS } from "@/lib/constants";
import { clamp } from "@/lib/utils";

interface UseGestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onDragEnd?: (velocity: number, distance: number) => void;
  enabled?: boolean;
  dragConstraints?: { left: number; right: number };
  snapPoints?: number[];
}

interface UseGestureReturn {
  gestureState: GestureState;
  dragX: ReturnType<typeof useMotionValue<number>>;
  dragHandlers: {
    onDragStart: (event: MouseEvent | TouchEvent | PointerEvent) => void;
    onDrag: (event: MouseEvent | TouchEvent | PointerEvent, info: { offset: { x: number } }) => void;
    onDragEnd: (event: MouseEvent | TouchEvent | PointerEvent, info: { velocity: { x: number }; offset: { x: number } }) => void;
  };
  reset: () => void;
}

/**
 * Custom hook for handling gesture interactions (drag, swipe, momentum)
 * Provides smooth physics-based animations with snap points
 */
export function useGesture({
  onSwipeLeft,
  onSwipeRight,
  onDragEnd,
  enabled = true,
  dragConstraints,
  snapPoints = [],
}: UseGestureOptions = {}): UseGestureReturn {
  const [gestureState, setGestureState] = useState<GestureState>({
    isDragging: false,
    startX: 0,
    currentX: 0,
    velocity: 0,
  });

  const dragX = useMotionValue(0);
  const dragVelocity = useVelocity(dragX);
  const animationRef = useRef<ReturnType<typeof animate> | null>(null);

  /**
   * Find nearest snap point
   */
  const findNearestSnapPoint = useCallback(
    (position: number): number => {
      if (snapPoints.length === 0) return 0;

      return snapPoints.reduce((nearest, point) => {
        return Math.abs(point - position) < Math.abs(nearest - position)
          ? point
          : nearest;
      }, snapPoints[0]);
    },
    [snapPoints]
  );

  /**
   * Handle drag start
   */
  const handleDragStart = useCallback(
    (_event: MouseEvent | TouchEvent | PointerEvent) => {
      if (!enabled) return;

      // Cancel any ongoing animation
      if (animationRef.current) {
        animationRef.current.stop();
      }

      const clientX = "touches" in _event ? _event.touches[0].clientX : _event.clientX;

      setGestureState({
        isDragging: true,
        startX: clientX,
        currentX: clientX,
        velocity: 0,
      });
    },
    [enabled]
  );

  /**
   * Handle drag motion
   */
  const handleDrag = useCallback(
    (
      _event: MouseEvent | TouchEvent | PointerEvent,
      info: { offset: { x: number } }
    ) => {
      if (!enabled || !gestureState.isDragging) return;

      const clientX = "touches" in _event ? _event.touches[0].clientX : _event.clientX;

      // Apply constraints if provided
      let newX = info.offset.x;
      if (dragConstraints) {
        newX = clamp(newX, dragConstraints.left, dragConstraints.right);
      }

      dragX.set(newX);

      setGestureState((prev) => ({
        ...prev,
        currentX: clientX,
        velocity: dragVelocity.get(),
      }));
    },
    [enabled, gestureState.isDragging, dragConstraints, dragX, dragVelocity]
  );

  /**
   * Handle drag end with momentum and snap
   */
  const handleDragEnd = useCallback(
    (
      _event: MouseEvent | TouchEvent | PointerEvent,
      info: { velocity: { x: number }; offset: { x: number } }
    ) => {
      if (!enabled || !gestureState.isDragging) return;

      const velocity = info.velocity.x;
      const distance = info.offset.x;
      const absVelocity = Math.abs(velocity);

      // Detect swipe gestures
      if (absVelocity > GESTURE_THRESHOLDS.swipeVelocity) {
        if (velocity < 0 && onSwipeLeft) {
          onSwipeLeft();
        } else if (velocity > 0 && onSwipeRight) {
          onSwipeRight();
        }
      }

      // Calculate final position with momentum
      const momentumDistance = (velocity * 0.3); // Momentum factor
      const projectedPosition = distance + momentumDistance;

      // Find snap point
      const targetPosition = findNearestSnapPoint(projectedPosition);

      // Animate to snap point
      animationRef.current = animate(dragX, targetPosition, {
        ...SPRING_CONFIGS.gentle,
        onComplete: () => {
          onDragEnd?.(velocity, distance);
        },
      });

      setGestureState({
        isDragging: false,
        startX: 0,
        currentX: 0,
        velocity,
      });
    },
    [
      enabled,
      gestureState.isDragging,
      onSwipeLeft,
      onSwipeRight,
      onDragEnd,
      findNearestSnapPoint,
      dragX,
    ]
  );

  /**
   * Reset gesture state
   */
  const reset = useCallback(() => {
    if (animationRef.current) {
      animationRef.current.stop();
    }

    animate(dragX, 0, SPRING_CONFIGS.snappy);

    setGestureState({
      isDragging: false,
      startX: 0,
      currentX: 0,
      velocity: 0,
    });
  }, [dragX]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        animationRef.current.stop();
      }
    };
  }, []);

  return {
    gestureState,
    dragX,
    dragHandlers: {
      onDragStart: handleDragStart,
      onDrag: handleDrag,
      onDragEnd: handleDragEnd,
    },
    reset,
  };
}

/**
 * Hook for detecting pinch gestures (zoom)
 */
export function usePinchGesture(
  onPinch?: (scale: number) => void,
  enabled: boolean = true
) {
  const [isPinching, setIsPinching] = useState(false);
  const [scale, setScale] = useState(1);
  const initialDistanceRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        setIsPinching(true);
        const distance = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        initialDistanceRef.current = distance;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && initialDistanceRef.current) {
        e.preventDefault();

        const distance = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );

        const newScale = distance / initialDistanceRef.current;
        setScale(newScale);

        // Only trigger callback if change is significant
        if (Math.abs(newScale - 1) > GESTURE_THRESHOLDS.pinchThreshold) {
          onPinch?.(newScale);
        }
      }
    };

    const handleTouchEnd = () => {
      setIsPinching(false);
      setScale(1);
      initialDistanceRef.current = null;
    };

    document.addEventListener("touchstart", handleTouchStart, { passive: false });
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd);

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [enabled, onPinch]);

  return { isPinching, scale };
}
