/**
 * Offer Form Validation
 * Step-based validation for property, purchaser, solicitor, and offer details
 */

import type { OfferFormData } from "./types";

export type ValidationErrors = Record<string, string>;

// ============================================
// Helpers
// ============================================
const isValidEmail = (email: string): boolean =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const isValidMobile = (number: string): boolean =>
    /^\d{6,15}$/.test(number.replace(/\s/g, ""));

const isValidACN = (acn: string): boolean =>
    /^\d{9}$/.test(acn.replace(/\s/g, ""));

export function formatCurrency(value: string): string {
    const num = value.replace(/[^0-9.]/g, "");
    if (!num) return "";
    const parsed = parseFloat(num);
    if (isNaN(parsed)) return num;
    return parsed.toLocaleString("en-AU", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    });
}

export function parseCurrencyToNumber(value: string): number {
    const num = value.replace(/[^0-9.]/g, "");
    return parseFloat(num) || 0;
}

// ============================================
// Step 1: Property Selection
// ============================================
export function validatePropertyStep(formData: OfferFormData): ValidationErrors {
    const errors: ValidationErrors = {};

    if (!formData.propertyId) {
        errors.propertyId = "Please select a property";
    }

    return errors;
}

// ============================================
// Step 2: Purchaser Details
// ============================================
export function validatePurchaserStep(formData: OfferFormData): ValidationErrors {
    const errors: ValidationErrors = {};

    // Trust-specific
    if (formData.purchaserStructure === "Trust") {
        if (!formData.trustName.trim()) {
            errors.trustName = "Trust name is required";
        }
    }

    // Company-specific (also applies to Trust with company trustee)
    if (
        formData.purchaserStructure === "Company" ||
        (formData.purchaserStructure === "Trust" && formData.trusteeType === "company")
    ) {
        if (!formData.companyName.trim()) {
            errors.companyName = "Company name is required";
        }
        if (!formData.companyACN.trim()) {
            errors.companyACN = "ACN is required";
        } else if (!isValidACN(formData.companyACN)) {
            errors.companyACN = "ACN must be 9 digits";
        }
    }

    // Validate each purchaser
    for (let i = 0; i < formData.purchaserCount; i++) {
        const p = formData.purchasers[i];
        if (!p) continue;

        const prefix = `purchaser_${i}`;

        if (!p.fullName.trim()) {
            errors[`${prefix}_fullName`] = "Full name is required";
        }
        if (!p.email.trim()) {
            errors[`${prefix}_email`] = "Email is required";
        } else if (!isValidEmail(p.email)) {
            errors[`${prefix}_email`] = "Invalid email address";
        }
        if (!p.mobileNumber.trim()) {
            errors[`${prefix}_mobileNumber`] = "Mobile number is required";
        } else if (!isValidMobile(p.mobileNumber)) {
            errors[`${prefix}_mobileNumber`] = "Invalid mobile number";
        }
        if (!p.street.trim()) {
            errors[`${prefix}_street`] = "Street address is required";
        }
        if (!p.suburb.trim()) {
            errors[`${prefix}_suburb`] = "Suburb is required";
        }
        if (!p.state.trim()) {
            errors[`${prefix}_state`] = "State is required";
        }
        if (!p.postcode.trim()) {
            errors[`${prefix}_postcode`] = "Postcode is required";
        }
    }

    return errors;
}

// ============================================
// Step 3: Solicitor Details
// ============================================
export function validateSolicitorStep(formData: OfferFormData): ValidationErrors {
    const errors: ValidationErrors = {};

    if (!formData.solicitorFirm.trim()) {
        errors.solicitorFirm = "Solicitor firm is required";
    }
    if (!formData.solicitorName.trim()) {
        errors.solicitorName = "Solicitor name is required";
    }
    if (!formData.solicitorEmail.trim()) {
        errors.solicitorEmail = "Solicitor email is required";
    } else if (!isValidEmail(formData.solicitorEmail)) {
        errors.solicitorEmail = "Invalid email address";
    }
    if (!formData.solicitorMobileNumber.trim()) {
        errors.solicitorMobileNumber = "Solicitor mobile is required";
    } else if (!isValidMobile(formData.solicitorMobileNumber)) {
        errors.solicitorMobileNumber = "Invalid mobile number";
    }

    return errors;
}

// ============================================
// Step 4: Offer Details & Conditions
// ============================================
export function validateOfferStep(formData: OfferFormData): ValidationErrors {
    const errors: ValidationErrors = {};

    if (!formData.offerPrice.trim()) {
        errors.offerPrice = "Offer price is required";
    }
    if (!formData.depositAmount.trim()) {
        errors.depositAmount = "Deposit amount is required";
    }

    if (formData.financeRequired) {
        if (!formData.bankLender.trim()) {
            errors.bankLender = "Bank/Lender is required when finance is needed";
        }
        if (!formData.financeAmount.trim()) {
            errors.financeAmount = "Finance amount is required";
        }
    }

    if (!formData.settlementPeriod.trim()) {
        errors.settlementPeriod = "Settlement period is required";
    }

    return errors;
}

// ============================================
// Validate by step index
// ============================================
export function validateStep(
    step: number,
    formData: OfferFormData
): ValidationErrors {
    switch (step) {
        case 0:
            return validatePropertyStep(formData);
        case 1:
            return validatePurchaserStep(formData);
        case 2:
            return validateSolicitorStep(formData);
        case 3:
            return validateOfferStep(formData);
        case 4:
            return {}; // Review step — no validation
        default:
            return {};
    }
}

export function isStepValid(step: number, formData: OfferFormData): boolean {
    return Object.keys(validateStep(step, formData)).length === 0;
}
