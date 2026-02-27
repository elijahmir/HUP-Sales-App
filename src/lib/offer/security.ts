/**
 * Security utilities for the public offer form
 * - Honeypot validation (bot trap)
 * - Input sanitization
 * - Server-side form validation
 */

import type { OfferFormData } from "./types";

/**
 * Validates honepot field.
 * The form includes a hidden field "_hp_field" that real users never see/fill.
 * Bots typically fill all fields, so if it's populated, reject the submission.
 */
export function validateHoneypot(honeypotValue: string | undefined | null): boolean {
    // Returns true if honeypot is empty (legitimate request)
    return !honeypotValue || honeypotValue.trim() === "";
}

/**
 * Sanitize string input: trim, strip HTML tags, enforce max length
 */
export function sanitizeString(input: string, maxLength = 500): string {
    if (typeof input !== "string") return "";
    return input
        .replace(/<[^>]*>/g, "") // Strip HTML tags
        .replace(/[<>]/g, "")   // Remove remaining angle brackets
        .trim()
        .slice(0, maxLength);
}

/**
 * Sanitize all string fields in form data
 */
export function sanitizeFormData(data: OfferFormData): OfferFormData {
    return {
        ...data,
        propertyAddress: sanitizeString(data.propertyAddress),
        propertyStreet: sanitizeString(data.propertyStreet),
        propertySuburb: sanitizeString(data.propertySuburb),
        propertyState: sanitizeString(data.propertyState, 10),
        propertyPostcode: sanitizeString(data.propertyPostcode, 10),
        companyName: sanitizeString(data.companyName),
        companyACN: sanitizeString(data.companyACN, 20),
        trustName: sanitizeString(data.trustName),
        solicitorFirm: sanitizeString(data.solicitorFirm),
        solicitorName: sanitizeString(data.solicitorName),
        solicitorEmail: sanitizeString(data.solicitorEmail),
        solicitorMobileNumber: sanitizeString(data.solicitorMobileNumber, 20),
        offerPrice: sanitizeString(data.offerPrice, 20),
        depositAmount: sanitizeString(data.depositAmount, 20),
        bankLender: sanitizeString(data.bankLender),
        financeAmount: sanitizeString(data.financeAmount, 20),
        settlementPeriod: sanitizeString(data.settlementPeriod, 100),
        specialClauses: sanitizeString(data.specialClauses, 2000),
        purchasers: data.purchasers.map((p) => ({
            ...p,
            fullName: sanitizeString(p.fullName),
            email: sanitizeString(p.email),
            mobileNumber: sanitizeString(p.mobileNumber, 20),
            street: sanitizeString(p.street),
            suburb: sanitizeString(p.suburb),
            state: sanitizeString(p.state, 10),
            postcode: sanitizeString(p.postcode, 10),
        })),
    };
}

/**
 * Validates minimum required fields exist for a submission to be accepted
 */
export function validateSubmission(data: OfferFormData): {
    valid: boolean;
    error?: string;
} {
    if (!data.propertyId) {
        return { valid: false, error: "Property selection is required" };
    }
    if (!data.purchasers[0]?.fullName?.trim()) {
        return { valid: false, error: "At least one purchaser name is required" };
    }
    if (!data.purchasers[0]?.email?.trim()) {
        return { valid: false, error: "Purchaser email is required" };
    }
    if (!data.offerPrice?.trim()) {
        return { valid: false, error: "Offer price is required" };
    }
    return { valid: true };
}
