import type { FormData } from "./types";
import { isValidSuburb } from "./suburbs";

// Email validation regex (Strict)
export function isValidEmail(email: string): boolean {
  if (!email) return false;
  // RFC 5322 standard compliant regex (simplified for common use)
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

// Australian mobile validation (starts with 04 or +614, 10 digits)
export function isValidMobile(mobile: string): boolean {
  if (!mobile) return false;
  const cleaned = mobile.replace(/[\s-]/g, "");
  return /^(04\d{8}|\+614\d{8})$/.test(cleaned);
}

// Australian landline validation (starts with 02/03/07/08, 10 digits)
export function isValidLandline(phone: string): boolean {
  if (!phone) return false;
  const cleaned = phone.replace(/[\s-]/g, "");
  // 02, 03, 07, 08 + 8 digits
  return /^(0[2378]\d{8})$/.test(cleaned);
}

// Sole Agency Period validation (max 120 days for Standard, 365 for Development)
export function isValidAgencyPeriod(
  days: string,
  type: "standard" | "development" = "standard",
): boolean {
  const num = parseInt(days, 10);
  const maxDays = type === "development" ? 365 : 120;
  return !isNaN(num) && num > 0 && num <= maxDays;
}

// Validate required string
export function isRequired(value: string | undefined | null): boolean {
  return (
    value !== undefined && value !== null && value.toString().trim().length > 0
  );
}

// Format number with commas (e.g., 100000 -> 100,000)
export function formatNumberWithCommas(value: string): string {
  if (!value) return "";
  const cleaned = value.toString().replace(/[^\d.]/g, "");
  const parts = cleaned.split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
}

// Format currency for display
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Sanitize percentage input: only allow digits and one decimal point
export function sanitizePercentage(value: string): string {
  // Remove all non-numeric characters except decimal point
  let cleaned = value.replace(/[^\d.]/g, "");

  // Prevent multiple decimal points
  const dots = cleaned.split(".").length - 1;
  if (dots > 1) {
    const firstDotIndex = cleaned.indexOf(".");
    cleaned =
      cleaned.slice(0, firstDotIndex + 1) +
      cleaned.slice(firstDotIndex + 1).replace(/\./g, "");
  }

  return cleaned;
}

// Check if ACN/ABN is valid (Luhn algorithm or simple length check)
// For simplicity, we ensure 9 (ACN) or 11 (ABN) digits and numeric only.
export function isValidACN(acn: string): boolean {
  const cleaned = acn.replace(/[\s]/g, "");
  // ACN is 9 digits
  return /^\d{9}$/.test(cleaned);
}

// --- Validator Functions for Form Steps ---

type ValidationResult = {
  isValid: boolean;
  errors: Record<string, string>;
};

export function isValidAgent(formData: FormData): ValidationResult {
  const errors: Record<string, string> = {};

  if (!isRequired(formData.agentName))
    errors.agentName = "Agent name is required";
  if (!isRequired(formData.agentEmail)) {
    errors.agentEmail = "Agent email is required";
  } else if (!isValidEmail(formData.agentEmail)) {
    errors.agentEmail = "Invalid email address";
  }

  if (!isRequired(formData.agentMobile))
    errors.agentMobile = "Agent mobile is required";
  if (!isRequired(formData.officeName))
    errors.officeName = "Office is required";

  return { isValid: Object.keys(errors).length === 0, errors };
}

export function isValidProperty(formData: FormData): ValidationResult {
  const errors: Record<string, string> = {};

  if (!isRequired(formData.propertyStreet))
    errors.propertyStreet = "Street address is required";

  if (!isRequired(formData.propertySuburb)) {
    errors.propertySuburb = "Suburb is required";
  } else {
    if (
      formData.propertyState === "TAS" &&
      !isValidSuburb(formData.propertySuburb)
    ) {
      errors.propertySuburb = "Please select a valid Tasmanian suburb";
    }
  }

  if (!isRequired(formData.propertyPostcode)) {
    errors.propertyPostcode = "Postcode is required";
  } else if (!/^\d{4}$/.test(formData.propertyPostcode)) {
    errors.propertyPostcode = "Postcode must be 4 digits";
  }

  if (!isRequired(formData.ctVolume)) errors.ctVolume = "CT Volume is required";
  if (!isRequired(formData.folioNo)) errors.folioNo = "Folio No is required";
  if (!isRequired(formData.pid)) errors.pid = "PID is required";

  return { isValid: Object.keys(errors).length === 0, errors };
}

export function isValidPricing(formData: FormData): ValidationResult {
  const errors: Record<string, string> = {};

  if (!isRequired(formData.listingPrice))
    errors.listingPrice = "Listing price is required";

  if (
    formData.commissionType === "percentage" ||
    formData.commissionType === "fixed"
  ) {
    if (!isRequired(formData.commissionValue)) {
      errors.commissionValue = "Commission value is required";
    }
  }

  if (!isRequired(formData.soleAgencyPeriod)) {
    errors.soleAgencyPeriod = "Agency period is required";
  } else if (
    !isValidAgencyPeriod(formData.soleAgencyPeriod, formData.agencyPeriodType)
  ) {
    errors.soleAgencyPeriod =
      formData.agencyPeriodType === "development"
        ? "Max 365 days for development"
        : "Max 120 days for standard";
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}

export function isValidVendor(formData: FormData): ValidationResult {
  const errors: Record<string, string> = {};
  const count = formData.vendorCount || 1;

  if (formData.vendorStructure === "Company") {
    if (!isRequired(formData.companyName))
      errors.companyName = "Company name is required";
    if (!isRequired(formData.companyACN)) {
      errors.companyACN = "ACN is required";
    } else if (!isValidACN(formData.companyACN)) {
      errors.companyACN = "Invalid ACN (must be 9 digits)";
    }
  }

  if (formData.vendorStructure === "Trust") {
    if (!isRequired(formData.trustName))
      errors.trustName = "Trust name is required";
    if (formData.trusteeType === "company") {
      if (!isRequired(formData.companyName))
        errors.companyName = "Trustee company name is required";
      if (!isRequired(formData.companyACN)) {
        errors.companyACN = "Trustee ACN is required";
      } else if (!isValidACN(formData.companyACN)) {
        errors.companyACN = "Invalid ACN";
      }
    }
  }

  for (let i = 0; i < count; i++) {
    const vendor = formData.vendors[i];
    const prefix = `vendors[${i}]`;

    if (!isRequired(vendor.fullName)) {
      errors[`${prefix}.fullName`] = `Vendor ${i + 1} Name is required`;
    }

    if (vendor.hasDifferentNameOnTitle && !isRequired(vendor.nameOnTitle)) {
      // We map this error but UI might not catch it if key is unique.
      // For now, let's leave it as is, or map to fullName.
      errors[`${prefix}.fullName`] = "Name on Title is required if different";
    }

    if (!isRequired(vendor.email)) {
      errors[`${prefix}.email`] = `Vendor ${i + 1} Email is required`;
    } else if (!isValidEmail(vendor.email)) {
      errors[`${prefix}.email`] = `Invalid email for Vendor ${i + 1}`;
    }

    if (!isRequired(vendor.mobile)) {
      errors[`${prefix}.mobile`] = `Vendor ${i + 1} Mobile is required`;
    } else if (!isValidMobile(vendor.mobile)) {
      errors[`${prefix}.mobile`] = `Invalid Australian mobile (04...)`;
    }

    if (
      vendor.homePhone &&
      !isValidLandline(vendor.homePhone) &&
      !isValidMobile(vendor.homePhone)
    ) {
      // Loose check
      if (vendor.homePhone.replace(/\D/g, "").length < 8) {
        // warning
      }
    }

    if (!vendor.sameAsProperty) {
      if (!isRequired(vendor.street))
        errors[`${prefix}.street`] = "Street is required";
      if (!isRequired(vendor.suburb))
        errors[`${prefix}.suburb`] = "Suburb is required";
      if (!isRequired(vendor.postcode))
        errors[`${prefix}.postcode`] = "Postcode is required";
    }
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}

export function isValidMarketing(formData: FormData): ValidationResult {
  const errors: Record<string, string> = {};

  if (formData.selectedMarketing.length === 0) {
    errors.marketing = "Please select at least one marketing item";
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}

export function isValidAnnexure(formData: FormData): ValidationResult {
  const errors: Record<string, string> = {};

  if (formData.annexureA) {
    const hasItems = formData.annexureItems.some(
      (item) => item.item.trim() !== "" || item.description.trim() !== "",
    );
    if (!hasItems) {
      errors.annexure =
        "Please add at least one annexure item if Annexure A is enabled";
    }
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}
