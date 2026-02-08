import { NextRequest, NextResponse } from "next/server";
import type { TimeRange, MetricsResponse } from "@/types";
import {
  generateMetrics,
  calculateSummary,
} from "@/lib/data-generator";

/**
 * GET /api/metrics
 * Returns metrics data for the specified time range
 * 
 * Query params:
 * - timeRange: "24h" | "7d" | "30d" | "90d" | "1y" | "all"
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const timeRange = (searchParams.get("timeRange") || "30d") as TimeRange;

    // Validate time range
    const validRanges: TimeRange[] = ["24h", "7d", "30d", "90d", "1y", "all"];
    if (!validRanges.includes(timeRange)) {
      return NextResponse.json(
        { error: "Invalid time range parameter" },
        { status: 400 }
      );
    }

    // Generate mock data
    const metrics = generateMetrics(timeRange);

    // Calculate summary statistics
    const summary = calculateSummary(metrics);

    // Get time range bounds
    const timeRangeBounds = {
      start: metrics[0]?.timestamp || new Date(),
      end: metrics[metrics.length - 1]?.timestamp || new Date(),
    };

    // Construct response
    const response: MetricsResponse = {
      data: metrics,
      summary,
      timeRange: timeRangeBounds,
    };

    // Return with cache headers for optimal performance
    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
      },
    });
  } catch (error) {
    console.error("Error in metrics API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Enable ISR (Incremental Static Regeneration)
 * Regenerate this route every 60 seconds
 */
export const revalidate = 60;
