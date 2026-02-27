import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server-admin";
import { buildOfferPayload, sendToWebhook } from "@/lib/offer/api";
import { checkRateLimit } from "@/lib/offer/rateLimit";
import { validateHoneypot, sanitizeFormData, validateSubmission } from "@/lib/offer/security";
import type { OfferFormData } from "@/lib/offer/types";

/**
 * POST /api/offer/submit
 * Saves offer to Supabase and sends payload to n8n webhook.
 * Supports both authenticated (agent) and anonymous (public form) submissions.
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const rawFormData: OfferFormData = body.formData;
        const existingId: string | undefined = body.existingId;
        const honeypot: string | undefined = body._hp_field;
        const isPublic: boolean = body.isPublic === true;

        if (!rawFormData) {
            return NextResponse.json({ error: "Missing form data" }, { status: 400 });
        }

        // === Security: Honeypot Check ===
        if (!validateHoneypot(honeypot)) {
            // Silently reject — don't reveal it's a bot trap
            return NextResponse.json({ success: true, submissionId: "ok" });
        }

        // === Security: Rate Limiting for public submissions ===
        if (isPublic) {
            const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
                || request.headers.get("x-real-ip")
                || "unknown";

            const rateLimitResult = checkRateLimit(ip);
            if (!rateLimitResult.success) {
                return NextResponse.json(
                    {
                        error: "Too many submissions. Please try again later.",
                        resetAt: rateLimitResult.resetAt,
                    },
                    {
                        status: 429,
                        headers: {
                            "Retry-After": String(Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000)),
                            "X-RateLimit-Remaining": "0",
                        },
                    }
                );
            }
        }

        // === Security: Sanitize + Validate ===
        const formData = sanitizeFormData(rawFormData);
        const validation = validateSubmission(formData);
        if (!validation.valid) {
            return NextResponse.json({ error: validation.error }, { status: 400 });
        }

        // Build payload for n8n
        const payload = buildOfferPayload(formData);

        // Summary fields
        const purchaserName =
            formData.purchasers[0]?.fullName ||
            formData.companyName ||
            formData.trustName ||
            "Untitled";
        const propertyAddress = formData.propertyAddress || "No address";
        const offerPrice = formData.offerPrice || "";

        // Get IP for audit trail
        const submitterIp = isPublic
            ? (request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
                || request.headers.get("x-real-ip")
                || "unknown")
            : null;
        const submitterEmail = isPublic
            ? formData.purchasers[0]?.email || null
            : null;

        // === Choose Supabase client based on auth status ===
        let savedId: string;

        if (isPublic) {
            // Anonymous submission — use admin client (bypasses RLS)
            const adminSupabase = createAdminClient();

            const { data: insertData, error: insertError } = await adminSupabase
                .from("sales_offer_submissions")
                .insert({
                    user_id: null, // No auth user
                    status: "completed",
                    form_data: formData,
                    purchaser_name: purchaserName,
                    property_address: propertyAddress,
                    offer_price: offerPrice,
                    submitter_email: submitterEmail,
                    submitter_ip: submitterIp,
                })
                .select("id")
                .single();

            if (insertError) {
                console.error("Supabase anonymous insert error:", insertError);
                return NextResponse.json(
                    { error: "Failed to save submission" },
                    { status: 500 }
                );
            }
            savedId = insertData.id;
        } else {
            // Authenticated submission — use normal client
            const supabase = await createClient();
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }

            if (existingId) {
                const { error: updateError } = await supabase
                    .from("sales_offer_submissions")
                    .update({
                        status: "completed",
                        form_data: formData,
                        updated_at: new Date().toISOString(),
                        purchaser_name: purchaserName,
                        property_address: propertyAddress,
                        offer_price: offerPrice,
                    })
                    .eq("id", existingId)
                    .eq("user_id", user.id);

                if (updateError) {
                    console.error("Supabase update error:", updateError);
                    return NextResponse.json(
                        { error: "Failed to update submission" },
                        { status: 500 }
                    );
                }
                savedId = existingId;
            } else {
                const { data: insertData, error: insertError } = await supabase
                    .from("sales_offer_submissions")
                    .insert({
                        user_id: user.id,
                        status: "completed",
                        form_data: formData,
                        purchaser_name: purchaserName,
                        property_address: propertyAddress,
                        offer_price: offerPrice,
                    })
                    .select("id")
                    .single();

                if (insertError) {
                    console.error("Supabase insert error:", insertError);
                    return NextResponse.json(
                        { error: "Failed to save submission" },
                        { status: 500 }
                    );
                }
                savedId = insertData.id;
            }
        }

        // Send to n8n webhook (don't fail the request if webhook fails)
        const webhookResult = await sendToWebhook({ ...payload });

        if (!webhookResult.success) {
            console.warn("Webhook failed but submission saved:", webhookResult.error);
        }

        return NextResponse.json({
            success: true,
            submissionId: savedId,
            webhookSent: webhookResult.success,
        });
    } catch (error) {
        console.error("Offer submit error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Submission failed" },
            { status: 500 }
        );
    }
}
