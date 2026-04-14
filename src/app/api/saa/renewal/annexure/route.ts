import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/saa/renewal/annexure?street={street}&suburb={suburb}
 *
 * Looks up the most recent SAA submission for a given property address
 * that includes Annexure A data. Returns the parsed annexure items
 * for potential inclusion in a renewal agreement.
 *
 * This is the "hybrid" data source: VaultRE supplies property/vendor data,
 * while the Supabase database supplies historical annexure data.
 */

interface AnnexureItem {
  item: string;
  description: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const street = searchParams.get("street");
    const suburb = searchParams.get("suburb");

    if (!street || !suburb) {
      return NextResponse.json(
        { error: "Both 'street' and 'suburb' query parameters are required" },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    // Find the most recent SAA submission with annexure data for this property
    const { data, error } = await supabase
      .from("sales_listings")
      .select("id, payload, created_at")
      .eq("status", "draft")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[Renewal Annexure] Supabase query error:", error);
      return NextResponse.json(
        { error: "Failed to query annexure data" },
        { status: 500 },
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json({
        found: false,
        items: [],
        count: 0,
      });
    }

    // Filter in JS for case-insensitive match + annexure_a = true
    const streetUpper = street.toUpperCase().trim();
    const suburbUpper = suburb.toUpperCase().trim();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const match = data.find((row: any) => {
      const payload = row.payload;
      if (!payload) return false;
      const payloadStreet = (payload.property_street || "").toUpperCase().trim();
      const payloadSuburb = (payload.property_suburb || "").toUpperCase().trim();
      const hasAnnexure = payload.annexure_a === true || payload.annexure_a === "true";
      return payloadStreet === streetUpper && payloadSuburb === suburbUpper && hasAnnexure;
    });

    if (!match) {
      return NextResponse.json({
        found: false,
        items: [],
        count: 0,
      });
    }

    const payload = match.payload;

    // Extract annexure items from the payload (max 13)
    const items: AnnexureItem[] = [];
    const annexureCount = parseInt(payload.annexure_count || "0", 10);

    for (let i = 1; i <= 13; i++) {
      const rawItem = payload[`annex_item_${i}`];
      const rawDes = payload[`annex_des_${i}`];

      if (rawItem && rawItem.trim()) {
        // Strip the leading "N. " prefix for clean display
        const cleanItem = rawItem.replace(/^\d+\.\s*/, "").trim();
        items.push({
          item: cleanItem || rawItem,
          description: rawDes || "",
        });
      }
    }

    console.log(
      `[Renewal Annexure] Found ${items.length} annexure item(s) for ${streetUpper}, ${suburbUpper} (from submission ${match.id})`,
    );

    return NextResponse.json({
      found: true,
      items,
      count: Math.max(items.length, annexureCount),
      sourceSubmissionId: match.id,
      sourceDate: match.created_at,
    });
  } catch (error) {
    console.error("[Renewal Annexure] Unexpected error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch annexure data",
      },
      { status: 500 },
    );
  }
}
