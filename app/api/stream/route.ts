import { NextRequest } from "next/server";
import type { SSEMessage } from "@/types";
import { generateNewMetric } from "@/lib/data-generator";
import { SSE_CONFIG } from "@/lib/constants";

/**
 * GET /api/stream
 * Server-Sent Events endpoint for real-time metric updates
 * 
 * Sends new data points every 5 seconds
 * Includes heartbeat every 30 seconds to keep connection alive
 */
export async function GET(request: NextRequest) {
  // Create a readable stream for SSE
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      // Send initial connection message
      const connectionMessage: SSEMessage = {
        type: "connection",
        data: { status: "connected" },
        timestamp: Date.now(),
      };
      
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify(connectionMessage)}\n\n`)
      );

      // Set up intervals for data updates and heartbeats
      const dataInterval = setInterval(() => {
        try {
          // Generate new metric
          const metric = generateNewMetric();
          
          const message: SSEMessage = {
            type: "metric",
            data: metric,
            timestamp: Date.now(),
          };

          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(message)}\n\n`)
          );
        } catch (error) {
          console.error("Error generating metric:", error);
        }
      }, SSE_CONFIG.updateInterval);

      // Heartbeat to keep connection alive
      const heartbeatInterval = setInterval(() => {
        controller.enqueue(encoder.encode(`:heartbeat\n\n`));
      }, SSE_CONFIG.heartbeatInterval);

      // Cleanup function
      request.signal.addEventListener("abort", () => {
        clearInterval(dataInterval);
        clearInterval(heartbeatInterval);
        controller.close();
      });
    },
  });

  // Return the stream with appropriate headers
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no", // Disable nginx buffering
    },
  });
}

/**
 * Disable static optimization for this route
 * SSE must run on the server
 */
export const dynamic = "force-dynamic";
