import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server-admin";

/**
 * DELETE /api/offer/delete
 * Deletes an offer submission by ID using the service role key
 * to bypass RLS (most offers have user_id=null from anonymous submission).
 */
export async function DELETE(req: NextRequest) {
    try {
        const { id } = await req.json();

        if (!id || typeof id !== "string") {
            return NextResponse.json(
                { error: "Missing or invalid offer ID" },
                { status: 400 }
            );
        }

        const supabase = createAdminClient();

        const { error, count } = await supabase
            .from("sales_offer_submissions")
            .delete({ count: "exact" })
            .eq("id", id);

        if (error) {
            console.error("Error deleting offer:", error);
            return NextResponse.json(
                { error: "Failed to delete offer" },
                { status: 500 }
            );
        }

        if (count === 0) {
            return NextResponse.json(
                { error: "Offer not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, deletedCount: count });
    } catch (err) {
        console.error("Delete offer error:", err);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
