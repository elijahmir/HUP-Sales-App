import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server-admin";

/**
 * PATCH /api/offer/contract-drafted
 * Toggles the contract_drafted status for an offer submission.
 * Uses the service role key to bypass RLS.
 */
export async function PATCH(req: NextRequest) {
    try {
        const { id, drafted, draftedBy } = await req.json();

        if (!id || typeof id !== "string") {
            return NextResponse.json(
                { error: "Missing or invalid offer ID" },
                { status: 400 }
            );
        }

        if (typeof drafted !== "boolean") {
            return NextResponse.json(
                { error: "Missing or invalid drafted value" },
                { status: 400 }
            );
        }

        const supabase = createAdminClient();

        const updatePayload = drafted
            ? {
                contract_drafted: true,
                contract_drafted_by: draftedBy || "Unknown",
                contract_drafted_at: new Date().toISOString(),
            }
            : {
                contract_drafted: false,
                contract_drafted_by: null,
                contract_drafted_at: null,
            };

        const { error } = await supabase
            .from("sales_offer_submissions")
            .update(updatePayload)
            .eq("id", id);

        if (error) {
            console.error("Error updating contract drafted:", error);
            return NextResponse.json(
                { error: "Failed to update contract drafted status" },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, ...updatePayload });
    } catch (err) {
        console.error("Contract drafted error:", err);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
