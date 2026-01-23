import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL!;

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const listingData = body.listing;

    // Save to Supabase
    const { data: savedListing, error: dbError } = await supabase
      .from("sales_listings")
      .insert({
        ...listingData,
        uploaded_by: user.id,
        raw_ocr_response: body.rawOcr || null,
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json(
        { error: "Failed to save listing" },
        { status: 500 },
      );
    }

    // Send to n8n webhook
    try {
      const webhookPayload = {
        listing_id: savedListing.id,
        ...listingData,
        uploaded_by_email: user.email,
        created_at: savedListing.created_at,
      };

      const webhookResponse = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(webhookPayload),
      });

      if (!webhookResponse.ok) {
        console.warn("n8n webhook failed:", await webhookResponse.text());
      }
    } catch (webhookError) {
      console.warn("n8n webhook error:", webhookError);
      // Don't fail the request if webhook fails - data is already saved
    }

    return NextResponse.json({
      success: true,
      listing: savedListing,
    });
  } catch (error) {
    console.error("Save error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Save failed" },
      { status: 500 },
    );
  }
}
