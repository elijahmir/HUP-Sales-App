/**
 * Offer Form API — Payload Builder & Submit
 * Builds the n8n webhook payload and handles submission
 */

import type { OfferFormData } from "./types";

const OFFER_WEBHOOK_URL = process.env.N8N_OFFER_WEBHOOK_URL || "https://hup.app.n8n.cloud/webhook/hup-offer-form";

// ============================================
// Purchaser Payload Shape (matches VendorPayload)
// ============================================
interface PurchaserPayload {
    full_name: string | null;
    full_name_id: string | null;
    full_name_trustee: string | null;
    full_name_val: string | null;
    email: string | null;
    email_val: string | null;
    mobile: string | null;
    mobile_countrycode: string | null;
    mobile_number: string | null;
    home_phone: string | null;
    street: string | null;
    suburb: string | null;
    state: string | null;
    postcode: string | null;
    address_full: string | null;
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
    property_contact_staff: string | null;

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
    all_purchasers_first_names: string;
    all_purchasers_email: string;
    purchaser_1: PurchaserPayload;
    purchaser_2: PurchaserPayload;
    purchaser_3: PurchaserPayload;
    purchaser_4: PurchaserPayload;

    // Solicitor
    solicitor_firm: string;
    solicitor_name: string;
    solicitor_email: string;

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
    subject_to_sale: boolean;
    subject_to_sale_text: string;
    subject_to_sale_address: string;
    subject_to_sale_price: string;
    subject_to_sale_under_contract: boolean;
    subject_to_sale_under_contract_text: string;
    subject_to_sale_completion_date: string;

    // Appendices
    appendix_file_name: string;
    appendix_file_base64: string;
}

// ============================================
// Helper: Build empty purchaser payload
// ============================================
function createNullPurchaser(): PurchaserPayload {
    return {
        full_name: null,
        full_name_id: null,
        full_name_trustee: null,
        full_name_val: null,
        email: null,
        email_val: null,
        mobile: null,
        mobile_countrycode: null,
        mobile_number: null,
        home_phone: null,
        street: null,
        suburb: null,
        state: null,
        postcode: null,
        address_full: null,
    };
}

// ============================================
// Build Payload
// ============================================
export function buildOfferPayload(formData: OfferFormData): OfferSubmissionPayload {
    const toUpper = (value: string): string => value.toUpperCase();

    const formatPurchaserMobile = (index: number): string | null => {
        const p = formData.purchasers[index];
        if (!p || !p.mobileNumber) return null;
        const cleaned = p.mobileNumber.replace(/[\s-]/g, "");
        return `${p.mobileCountryCode || ""} ${cleaned}`.trim();
    };

    // Trust Name Logic
    let effectiveTrustName: string | null = null;
    if (formData.purchaserStructure === "Trust") {
        let rawTrustName = formData.trustName.trim();
        if (!rawTrustName.toUpperCase().endsWith("TRUST")) {
            rawTrustName = `${rawTrustName} TRUST`;
        }
        effectiveTrustName = rawTrustName;
    }
    const trustNameUpper = effectiveTrustName ? toUpper(effectiveTrustName) : null;

    // Company Name ACN Computed
    const companyNameAcnComputed: string | null =
        formData.companyName && formData.companyACN
            ? (() => {
                const acn = formData.companyACN.replace(/[^0-9]/g, "");
                const formattedAcn = acn.replace(/(\d{3})(\d{3})(\d{3})/, "$1 $2 $3");
                const baseStr = `${toUpper(formData.companyName)} (ACN ${formattedAcn})`;
                return trustNameUpper
                    ? `${baseStr} AS TRUSTEE FOR ${trustNameUpper}`
                    : baseStr;
            })()
            : null;

    // All Purchasers Names Trust Computed
    const allPurchasersNamesTrustComputed: string | null = trustNameUpper
        ? (() => {
            const names = formData.purchasers
                .slice(0, formData.purchaserCount)
                .map((p) => toUpper(p.fullName))
                .filter(Boolean);

            if (names.length === 0) return null;

            let joinedNames = "";
            if (names.length === 1) {
                joinedNames = names[0];
            } else if (names.length === 2) {
                joinedNames = `${names[0]} AND ${names[1]}`;
            } else {
                const last = names.pop();
                joinedNames = `${names.join(", ")} AND ${last}`;
            }

            const suffixText = formData.purchaserCount > 1 ? "AS TRUSTEES FOR" : "AS TRUSTEE FOR";
            return `${joinedNames} ${suffixText} ${trustNameUpper}`;
        })()
        : null;

    // Get Full Name Val
    const getFullNameVal = (index: number): string | null => {
        if (formData.purchaserStructure === "Individual") {
            const p = formData.purchasers[index];
            return p ? toUpper(p.fullName) : null;
        } else if (index === 0) {
            if (formData.purchaserStructure === "Trust" && formData.trusteeType === "individual") {
                return allPurchasersNamesTrustComputed;
            } else {
                return companyNameAcnComputed;
            }
        }
        return null;
    };

    // Purchaser Payloads
    const getPurchaserPayload = (index: number): PurchaserPayload => {
        if (index >= formData.purchaserCount) return createNullPurchaser();
        const p = formData.purchasers[index];
        return {
            full_name: toUpper(p.fullName),
            full_name_id: toUpper(p.fullName),
            full_name_trustee: trustNameUpper
                ? `${toUpper(p.fullName)} AS TRUSTEE FOR ${trustNameUpper}`
                : null,
            full_name_val: getFullNameVal(index),
            email: p.email.toLowerCase(),
            email_val: p.email.toLowerCase(),
            mobile: formatPurchaserMobile(index),
            mobile_countrycode: p.mobileCountryCode.replace("+", ""),
            mobile_number: p.mobileNumber.replace(/[\s-]/g, "") || null,
            home_phone: null, // Purchaser form doesn't have home_phone yet
            street: toUpper(p.street),
            suburb: toUpper(p.suburb),
            state: toUpper(p.state),
            postcode: toUpper(p.postcode),
            address_full: toUpper(
                [p.street, p.suburb, p.state, p.postcode]
                    .map((s) => s.trim())
                    .filter(Boolean)
                    .join(", ")
            ),
        };
    };

    return {
        // Property
        property_id: formData.propertyId,
        property_address_full: toUpper(formData.propertyAddress),
        property_street: toUpper(formData.propertyStreet),
        property_suburb: toUpper(formData.propertySuburb),
        property_state: toUpper(formData.propertyState),
        property_postcode: toUpper(formData.propertyPostcode),
        property_status: toUpper(formData.propertyStatus),
        property_bed: formData.propertyBed,
        property_bath: formData.propertyBath,
        property_garages: formData.propertyGarages,
        property_main_image: formData.propertyMainImage,
        property_contact_staff: formData.propertyContactStaff?.length > 0
            ? `${formData.propertyContactStaff[0].firstName} ${formData.propertyContactStaff[0].lastName}`.trim()
            : null,

        // Purchaser
        purchaser_structure: toUpper(formData.purchaserStructure),
        purchaser_type: toUpper(formData.purchaserStructure),
        purchaser_subtype: formData.purchaserStructure === "Trust" ? toUpper(formData.trusteeType) : null,
        purchaser_count: formData.purchaserCount,
        trust_name: formData.purchaserStructure === "Trust" ? trustNameUpper : null,
        company_name:
            formData.purchaserStructure === "Company" ||
                (formData.purchaserStructure === "Trust" && formData.trusteeType === "company")
                ? formData.companyName
                    ? toUpper(formData.companyName)
                    : null
                : null,
        company_acn:
            formData.purchaserStructure === "Company" ||
                (formData.purchaserStructure === "Trust" && formData.trusteeType === "company")
                ? formData.companyACN || null
                : null,
        company_name_acn:
            (formData.purchaserStructure === "Company" ||
                (formData.purchaserStructure === "Trust" && formData.trusteeType === "company")) &&
                formData.companyName &&
                formData.companyACN
                ? (() => {
                    const acn = formData.companyACN.replace(/[^0-9]/g, "");
                    const formattedAcn = acn.replace(/(\d{3})(\d{3})(\d{3})/, "$1 $2 $3");
                    const baseStr = `${toUpper(formData.companyName)} (ACN ${formattedAcn})`;
                    return trustNameUpper
                        ? `${baseStr} AS TRUSTEE FOR ${trustNameUpper}`
                        : baseStr;
                })()
                : null,
        all_purchasers_names: formData.purchasers
            .slice(0, formData.purchaserCount)
            .map((p) => toUpper(p.fullName))
            .filter(Boolean)
            .join(", "),
        all_purchasers_names_trust: (() => {
            const names = formData.purchasers
                .slice(0, formData.purchaserCount)
                .map((p) => toUpper(p.fullName))
                .filter(Boolean);

            if (names.length === 0) return null;

            if (formData.purchaserStructure === "Individual") {
                return names.join(", ");
            }

            if (formData.purchaserStructure === "Trust" && trustNameUpper) {
                let joinedNames = "";
                if (names.length === 1) {
                    joinedNames = names[0];
                } else if (names.length === 2) {
                    joinedNames = `${names[0]} AND ${names[1]}`;
                } else {
                    const namesCopy = [...names];
                    const last = namesCopy.pop();
                    joinedNames = `${namesCopy.join(", ")} AND ${last}`;
                }
                const suffixText = formData.purchaserCount > 1 ? "AS TRUSTEES FOR" : "AS TRUSTEE FOR";
                return `${joinedNames} ${suffixText} ${trustNameUpper}`;
            }

            if (formData.purchaserStructure === "Company") {
                if (!formData.hasMultipleDirectors) {
                    return `DIRECTOR/SECRETARY: ${names[0] || ""}`;
                } else {
                    const director = names[0] || "";
                    const secretary = names[1] || "";
                    return `DIRECTOR: ${director}     SECRETARY: ${secretary}`;
                }
            }

            return names.join(", ");
        })(),
        all_purchasers_first_names: (() => {
            const toTitleCase = (str: string) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
            const firstNames = formData.purchasers
                .slice(0, formData.purchaserCount)
                .map((p) => {
                    const firstWord = p.fullName.trim().split(" ")[0];
                    return toTitleCase(firstWord);
                })
                .filter(Boolean);

            if (firstNames.length === 0) return "";
            if (firstNames.length === 1) return firstNames[0];
            if (firstNames.length === 2) return `${firstNames[0]} and ${firstNames[1]}`;
            const last = firstNames.pop();
            return `${firstNames.join(", ")}, and ${last}`;
        })(),
        all_purchasers_email: formData.purchasers
            .slice(0, formData.purchaserCount)
            .map((p) => p.email.toLowerCase())
            .filter(Boolean)
            .join(";"),
        purchaser_1: getPurchaserPayload(0),
        purchaser_2: getPurchaserPayload(1),
        purchaser_3: getPurchaserPayload(2),
        purchaser_4: getPurchaserPayload(3),

        // Solicitor
        solicitor_firm: toUpper(formData.solicitorFirm.trim()),
        solicitor_name: toUpper(formData.solicitorName.trim()),
        solicitor_email: formData.solicitorEmail.trim().toLowerCase(),

        // Offer
        offer_price: formData.offerPrice.trim(),
        deposit_amount: formData.depositAmount.trim(),

        // Conditions
        finance_required: formData.financeRequired,
        finance_required_text: formData.financeRequired ? "Yes" : "No",
        bank_lender: toUpper(formData.bankLender.trim()),
        finance_amount: formData.financeAmount.trim(),
        building_inspection: formData.buildingInspection,
        building_inspection_text: formData.buildingInspection ? "Yes" : "No",
        cooling_off_period: formData.coolingOffPeriod,
        cooling_off_period_text: formData.coolingOffPeriod ? "Yes" : "No",
        settlement_period: toUpper(formData.settlementPeriod.trim()),
        special_clauses: formData.specialClauses.trim(),
        subject_to_sale: formData.subjectToSale,
        subject_to_sale_text: formData.subjectToSale ? "Yes" : "No",
        subject_to_sale_address: toUpper(formData.subjectToSaleAddress.trim()),
        subject_to_sale_price: formData.subjectToSalePrice.trim(),
        subject_to_sale_under_contract: formData.subjectToSaleUnderContract,
        subject_to_sale_under_contract_text: formData.subjectToSaleUnderContract ? "Yes" : "No",
        subject_to_sale_completion_date: toUpper(formData.subjectToSaleCompletionDate.trim()),
        appendix_file_name: formData.appendixFileName,
        appendix_file_base64: formData.appendixFileBase64,
    };
}

// ============================================
// Submit to n8n (client-side via API route)
// ============================================
export async function submitOffer(
    formData: OfferFormData,
    existingId?: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const payload = buildOfferPayload(formData);

        const response = await fetch("/api/offer/submit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ formData, payload, existingId }),
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
