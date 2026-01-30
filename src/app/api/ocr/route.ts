import { NextRequest, NextResponse } from "next/server";
import { extractListingDataStream } from "@/lib/gemini-ocr";
import { getActiveModelId } from "@/lib/model-helper";

export const runtime = "nodejs"; // Or 'edge' if preferred, but nodejs is safer for now due to gemini deps

export async function POST(req: NextRequest) {
  try {
    const { images } = await req.json();

    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json(
        { error: "No images provided" },
        { status: 400 },
      );
    }

    // Get active model from Admin Settings
    const modelId = await getActiveModelId();
    console.log(`[OCR API] Using model: ${modelId}`);

    // Create a ReadableStream for SSE
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        try {
          // Send initial metadata about the model
          const metaEvent = `event: info\ndata: ${JSON.stringify({ modelId })}\n\n`;
          controller.enqueue(encoder.encode(metaEvent));

          const generator = extractListingDataStream(images, modelId);
          let jsonBuffer = "";
          let finalJsonFound = false;

          for await (const chunk of generator) {
            if (chunk.type === "thought") {
              const event = `event: thought\ndata: ${JSON.stringify(chunk.content)}\n\n`;
              controller.enqueue(encoder.encode(event));
            } else if (chunk.type === "data") {
              // Check if we should stream generic 'processing' events or just buffer
              // For "Real AI" feel, sending updates is good
              const event = `event: progress\ndata: "Analyzing data..."\n\n`;
              controller.enqueue(encoder.encode(event));
              jsonBuffer += chunk.content;
            }
          }

          // At the end, try to parse the buffer and send a final event
          try {
            // Find the outermost braces
            const firstBrace = jsonBuffer.indexOf("{");
            const lastBrace = jsonBuffer.lastIndexOf("}");
            if (firstBrace !== -1 && lastBrace !== -1) {
              const cleanedJson = jsonBuffer.substring(
                firstBrace,
                lastBrace + 1,
              );
              // Verify generic JSON parsing just to be safe
              const parsed = JSON.parse(cleanedJson);

              // ─────────────────────────────────────────────────────────────
              // POST-PROCESSING: Fuzzy match agent name
              // ─────────────────────────────────────────────────────────────
              if (parsed.listing_agent) {
                const { findAgentByOCR } =
                  await import("@/data/vaultre-agents");
                const matchedAgent = findAgentByOCR(parsed.listing_agent);
                if (matchedAgent) {
                  parsed.listing_agent = matchedAgent.name;
                  parsed.vaultre_agent_id = matchedAgent.id; // Optional: pass ID if needed
                }
              }

              const event = `event: complete\ndata: ${JSON.stringify(parsed)}\n\n`;
              controller.enqueue(encoder.encode(event));
              finalJsonFound = true;
            }
          } catch (e) {
            console.warn("Could not parse final JSON from stream buffer", e);
          }

          if (!finalJsonFound) {
            // Fallback: send error
            const event = `event: error\ndata: ${JSON.stringify({ error: "Failed to parse JSON response" })}\n\n`;
            controller.enqueue(encoder.encode(event));
          }

          controller.close();
        } catch (error) {
          console.error("Streaming Error:", error);
          const event = `event: error\ndata: ${JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" })}\n\n`;
          controller.enqueue(encoder.encode(event));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("OCR API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
