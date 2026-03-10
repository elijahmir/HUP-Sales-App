import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server-admin";

/**
 * GET /api/offer/[id]
 * Fetches an offer submission by ID using admin client (bypasses RLS).
 * Used by the public edit page to load existing offer data.
 */
export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        if (!id || typeof id !== "string") {
            return NextResponse.json(
                { error: "Missing or invalid offer ID" },
                { status: 400 }
            );
        }

        const supabase = createAdminClient();

        const { data, error } = await supabase
            .from("sales_offer_submissions")
            .select("id, form_data, status, created_at, purchaser_name, property_address, offer_price")
            .eq("id", id)
            .single();

        if (error || !data) {
            console.error("Error fetching offer:", error);
            return NextResponse.json(
                { error: "Offer not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ offer: data });
    } catch (err) {
        console.error("Fetch offer error:", err);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
