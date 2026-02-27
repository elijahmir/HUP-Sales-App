/**
 * Offer Form API — Payload Builder & Submit
 * Builds the n8n webhook payload and handles submission
 */

import type { OfferFormData } from "./types";

const OFFER_WEBHOOK_URL = process.env.N8N_OFFER_WEBHOOK_URL || "https://hup.app.n8n.cloud/webhook/hup-offer-form";

// ============================================
// Purchaser Payload Shape
// ============================================
interface PurchaserPayload {
    full_name: string;
    email: string;
    mobile_countrycode: string;
    mobile_number: string;
    mobile_full: string;
    street: string;
    suburb: string;
    state: string;
    postcode: string;
    address_full: string;
}

// ============================================
// Submission Payload
// ============================================
export interface OfferSubmissionPayload {
    // Property
    property_id: number | null;
    property_address_full: string;
    property_street: string;
    property_suburb: string;
    property_state: string;
    property_postcode: string;
    property_status: string;
    property_bed: number | null;
    property_bath: number | null;
    property_garages: number | null;
    property_main_image: string;
    property_contact_staff: string;

    // Purchaser structure
    purchaser_structure: string;
    purchaser_type: string;
    purchaser_subtype: string | null;
    purchaser_count: number;
    trust_name: string | null;
    company_name: string | null;
    company_acn: string | null;
    company_name_acn: string | null;
    all_purchasers_names: string;
    all_purchasers_names_trust: string | null;
    all_purchasers_email: string;
    purchaser_1: PurchaserPayload;
    purchaser_2: PurchaserPayload;
    purchaser_3: PurchaserPayload;
    purchaser_4: PurchaserPayload;

    // Solicitor
    solicitor_firm: string;
    solicitor_name: string;
    solicitor_email: string;
    solicitor_mobile_countrycode: string;
    solicitor_mobile_number: string;
    solicitor_mobile_full: string;

    // Offer details
    offer_price: string;
    deposit_amount: string;

    // Conditions
    finance_required: boolean;
    finance_required_text: string;
    bank_lender: string;
    finance_amount: string;
    building_inspection: boolean;
    building_inspection_text: string;
    cooling_off_period: boolean;
    cooling_off_period_text: string;
    settlement_period: string;
    special_clauses: string;
}

// ============================================
// Helper: Build empty purchaser payload
// ============================================
function emptyPurchaserPayload(): PurchaserPayload {
    return {
        full_name: "",
        email: "",
        mobile_countrycode: "",
        mobile_number: "",
        mobile_full: "",
        street: "",
        suburb: "",
        state: "",
        postcode: "",
        address_full: "",
    };
}

// ============================================
// Build Payload
// ============================================
export function buildOfferPayload(formData: OfferFormData): OfferSubmissionPayload {
    // Build purchaser payloads
    const purchaserPayloads: PurchaserPayload[] = [];
    for (let i = 0; i < 4; i++) {
        const p = formData.purchasers[i];
        if (p && i < formData.purchaserCount) {
            purchaserPayloads.push({
                full_name: p.fullName.trim(),
                email: p.email.trim(),
                mobile_countrycode: p.mobileCountryCode,
                mobile_number: p.mobileNumber.trim(),
                mobile_full: `${p.mobileCountryCode}${p.mobileNumber.trim()}`,
                street: p.street.trim(),
                suburb: p.suburb.trim(),
                state: p.state.trim(),
                postcode: p.postcode.trim(),
                address_full: [p.street, p.suburb, p.state, p.postcode]
                    .map((s) => s.trim())
                    .filter(Boolean)
                    .join(", "),
            });
        } else {
            purchaserPayloads.push(emptyPurchaserPayload());
        }
    }

    // All purchaser names
    const allNames = purchaserPayloads
        .filter((p) => p.full_name)
        .map((p) => p.full_name)
        .join(" & ");

    const allEmails = purchaserPayloads
        .filter((p) => p.email)
        .map((p) => p.email)
        .join(", ");

    // Purchaser type/subtype logic
    const purchaserType = formData.purchaserStructure;
    let purchaserSubtype: string | null = null;
    if (formData.purchaserStructure === "Trust") {
        purchaserSubtype = formData.trusteeType;
    }

    // Company name + ACN formatted
    let companyNameAcn: string | null = null;
    if (formData.companyName && formData.companyACN) {
        companyNameAcn = `${formData.companyName} (ACN ${formData.companyACN})`;
    } else if (formData.companyName) {
        companyNameAcn = formData.companyName;
    }

    // Trust names
    let allPurchasersNamesTrust: string | null = null;
    if (formData.purchaserStructure === "Trust") {
        const names = purchaserPayloads
            .filter((p) => p.full_name)
            .map((p) => p.full_name)
            .join(" & ");
        if (formData.trusteeType === "company") {
            allPurchasersNamesTrust = `${companyNameAcn || formData.companyName} as Trustee for the ${formData.trustName}`;
        } else {
            allPurchasersNamesTrust = `${names} as Trustee(s) for the ${formData.trustName}`;
        }
    }

    return {
        // Property
        property_id: formData.propertyId,
        property_address_full: formData.propertyAddress,
        property_street: formData.propertyStreet,
        property_suburb: formData.propertySuburb,
        property_state: formData.propertyState,
        property_postcode: formData.propertyPostcode,
        property_status: formData.propertyStatus,
        property_bed: formData.propertyBed,
        property_bath: formData.propertyBath,
        property_garages: formData.propertyGarages,
        property_main_image: formData.propertyMainImage,
        property_contact_staff: formData.propertyContactStaff,

        // Purchaser
        purchaser_structure: formData.purchaserStructure,
        purchaser_type: purchaserType,
        purchaser_subtype: purchaserSubtype,
        purchaser_count: formData.purchaserCount,
        trust_name: formData.purchaserStructure === "Trust" ? formData.trustName : null,
        company_name:
            formData.purchaserStructure === "Company" ||
                (formData.purchaserStructure === "Trust" && formData.trusteeType === "company")
                ? formData.companyName
                : null,
        company_acn:
            formData.purchaserStructure === "Company" ||
                (formData.purchaserStructure === "Trust" && formData.trusteeType === "company")
                ? formData.companyACN
                : null,
        company_name_acn: companyNameAcn,
        all_purchasers_names: allNames,
        all_purchasers_names_trust: allPurchasersNamesTrust,
        all_purchasers_email: allEmails,
        purchaser_1: purchaserPayloads[0],
        purchaser_2: purchaserPayloads[1],
        purchaser_3: purchaserPayloads[2],
        purchaser_4: purchaserPayloads[3],

        // Solicitor
        solicitor_firm: formData.solicitorFirm.trim(),
        solicitor_name: formData.solicitorName.trim(),
        solicitor_email: formData.solicitorEmail.trim(),
        solicitor_mobile_countrycode: formData.solicitorMobileCountryCode,
        solicitor_mobile_number: formData.solicitorMobileNumber.trim(),
        solicitor_mobile_full: `${formData.solicitorMobileCountryCode}${formData.solicitorMobileNumber.trim()}`,

        // Offer
        offer_price: formData.offerPrice.trim(),
        deposit_amount: formData.depositAmount.trim(),

        // Conditions
        finance_required: formData.financeRequired,
        finance_required_text: formData.financeRequired ? "Yes" : "No",
        bank_lender: formData.bankLender.trim(),
        finance_amount: formData.financeAmount.trim(),
        building_inspection: formData.buildingInspection,
        building_inspection_text: formData.buildingInspection ? "Yes" : "No",
        cooling_off_period: formData.coolingOffPeriod,
        cooling_off_period_text: formData.coolingOffPeriod ? "Yes" : "No",
        settlement_period: formData.settlementPeriod.trim(),
        special_clauses: formData.specialClauses.trim(),
    };
}

// ============================================
// Submit to n8n (client-side via API route)
// ============================================
export async function submitOffer(
    formData: OfferFormData
): Promise<{ success: boolean; error?: string }> {
    try {
        const payload = buildOfferPayload(formData);

        const response = await fetch("/api/offer/submit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ formData, payload }),
        });

        if (!response.ok) {
            const text = await response.text();
            return { success: false, error: text };
        }

        return { success: true };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Submission failed",
        };
    }
}

// ============================================
// Direct webhook submission (server-side)
// ============================================
export async function sendToWebhook(
    payload: OfferSubmissionPayload
): Promise<{ success: boolean; error?: string }> {
    try {
        const response = await fetch(OFFER_WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const text = await response.text();
            console.warn("Offer webhook failed:", text);
            return { success: false, error: text };
        }

        return { success: true };
    } catch (error) {
        console.warn("Offer webhook error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Webhook failed",
        };
    }
}
