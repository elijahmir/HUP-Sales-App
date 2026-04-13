/**
 * SAA Renewal Types
 * Data models for the renewal workflow.
 * All property/vendor/marketing data is read-only (sourced from VaultRE).
 * Only the agreement duration is editable by the agent.
 */

import type { MarketingItem } from "../marketing";

// ─── VaultRE Property Data (Read-Only) ──────────────────────────

export interface RenewalContactStaff {
  id: number;
  firstName: string;
  lastName: string;
  position: string;
  photoUrl: string;
  email: string;
  mobile: string;
}

export interface RenewalVendorData {
  fullName: string;
  email: string;
  mobile: string;
  mobileCountryCode: string;
  homePhone: string;
  street: string;
  suburb: string;
  state: string;
  postcode: string;
}

export interface RenewalPropertyData {
  // Core
  id: number;
  displayAddress: string;
  street: string;
  suburb: string;
  state: string;
  postcode: string;
  propertyClass: string;

  // Features
  bed: number | null;
  bath: number | null;
  garages: number | null;
  landArea: string | null;
  floorArea: string | null;

  // Listing Details
  status: string;
  searchPrice: number | null;
  displayPrice: string | null;
  mainImageUrl: string;

  // Title
  volumeNumber: string;
  folioNumber: string;
  certificateOfTitle: string;
  referenceID: string;
  listingNo: string;

  // Commission (from VaultRE SaleProperty fields)
  sellingFeePercent: number | null;
  sellingFeeFixed: number | null;
  vpa: number | null;

  // Authority dates
  authorityStart: string | null;
  authorityEnd: string | null;

  // Agents assigned to property
  contactStaff: RenewalContactStaff[];

  // Vendors (pulled from VaultRE contacts or previous SAA submission)
  vendors: RenewalVendorData[];

  // Marketing items currently active
  marketingItems: MarketingItem[];
}

// ─── Renewal Form State (Editable Fields Only) ──────────────────

export interface RenewalFormData {
  /** VaultRE property ID */
  propertyId: number | null;

  /** Loaded property data (read-only) */
  propertyData: RenewalPropertyData | null;

  /** Agent info — auto-filled from session */
  agentName: string;
  agentEmail: string;
  agentMobile: string;
  officeName: string;
  officeStreet: string;
  officeSuburb: string;
  officeState: string;
  officePostcode: string;
  officePhone: string;

  /** Editable: New agreement duration */
  soleAgencyPeriod: string;

  /** Editable: Agency period type */
  agencyPeriodType: "standard" | "development";

  /** Commission type for display */
  commissionType: "fixed" | "percentage" | "reit";
  commissionValue: string;
}

export const initialRenewalFormData: RenewalFormData = {
  propertyId: null,
  propertyData: null,

  agentName: "",
  agentEmail: "",
  agentMobile: "",
  officeName: "",
  officeStreet: "",
  officeSuburb: "",
  officeState: "",
  officePostcode: "",
  officePhone: "",

  soleAgencyPeriod: "",
  agencyPeriodType: "standard",
  commissionType: "percentage",
  commissionValue: "",
};

// ─── Step Definitions ───────────────────────────────────────────

export type RenewalStep = {
  id: number;
  title: string;
  subtitle: string;
};

export const RENEWAL_STEPS: RenewalStep[] = [
  { id: 1, title: "Select Property", subtitle: "Choose from VaultRE" },
  { id: 2, title: "Review Data", subtitle: "Verify current details" },
  { id: 3, title: "Duration & Submit", subtitle: "Set new agreement period" },
];
