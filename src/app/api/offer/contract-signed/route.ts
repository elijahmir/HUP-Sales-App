import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server-admin";

/**
 * PATCH /api/offer/contract-signed
 * Toggles the contract_signed status for an offer submission.
 * Uses the service role key to bypass RLS.
 */
export async function PATCH(req: NextRequest) {
    try {
        const { id, signed, signedBy } = await req.json();

        if (!id || typeof id !== "string") {
            return NextResponse.json(
                { error: "Missing or invalid offer ID" },
                { status: 400 }
            );
        }

        if (typeof signed !== "boolean") {
            return NextResponse.json(
                { error: "Missing or invalid signed value" },
                { status: 400 }
            );
        }

        const supabase = createAdminClient();

        const updatePayload = signed
            ? {
                contract_signed: true,
                contract_signed_by: signedBy || "Unknown",
                contract_signed_at: new Date().toISOString(),
            }
            : {
                contract_signed: false,
                contract_signed_by: null,
                contract_signed_at: null,
            };

        const { error } = await supabase
            .from("sales_offer_submissions")
            .update(updatePayload)
            .eq("id", id);

        if (error) {
            console.error("Error updating contract signed:", error);
            return NextResponse.json(
                { error: "Failed to update contract signed status" },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, ...updatePayload });
    } catch (err) {
        console.error("Contract signed error:", err);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
