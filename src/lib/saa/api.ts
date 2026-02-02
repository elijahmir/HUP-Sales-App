import type { FormData } from "./types";
import { formatCurrency, formatNumberWithCommas } from "./validation";
import { createClient } from "@/lib/supabase/client";

// --- INLINED numberToWords.ts ---
// Convert number to words (Australian English)
export function numberToWords(num: number): string {
  if (num === 0) return "zero";

  const ones = [
    "",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
    "ten",
    "eleven",
    "twelve",
    "thirteen",
    "fourteen",
    "fifteen",
    "sixteen",
    "seventeen",
    "eighteen",
    "nineteen",
  ];

  const tens = [
    "",
    "",
    "twenty",
    "thirty",
    "forty",
    "fifty",
    "sixty",
    "seventy",
    "eighty",
    "ninety",
  ];

  const scales = ["", "thousand", "million", "billion"];

  function convertChunk(n: number): string {
    if (n === 0) return "";
    if (n < 20) return ones[n];
    if (n < 100) {
      const ten = Math.floor(n / 10);
      const one = n % 10;
      return tens[ten] + (one > 0 ? "-" + ones[one] : "");
    }
    const hundred = Math.floor(n / 100);
    const rest = n % 100;
    return (
      ones[hundred] +
      " hundred" +
      (rest > 0 ? " and " + convertChunk(rest) : "")
    );
  }

  // Split into groups of three digits
  const groups: number[] = [];
  let tempNum = Math.floor(num);
  while (tempNum > 0) {
    groups.push(tempNum % 1000);
    tempNum = Math.floor(tempNum / 1000);
  }

  const parts: string[] = [];
  for (let i = groups.length - 1; i >= 0; i--) {
    if (groups[i] > 0) {
      const chunk = convertChunk(groups[i]);
      const scale = scales[i];
      parts.push(chunk + (scale ? " " + scale : ""));
    }
  }

  return parts.join(", ").trim();
}

// Convert dollar amount to words
export function dollarAmountToWords(
  amount: string | number,
  includeCurrency: boolean = false,
): string {
  // Parse the amount (could be string like "100,000" or number)
  const cleaned =
    typeof amount === "string"
      ? amount.replace(/[,$]/g, "")
      : amount.toString();

  const numValue = parseFloat(cleaned);

  if (isNaN(numValue)) return "";

  const dollars = Math.floor(numValue);
  const cents = Math.round((numValue - dollars) * 100);

  let result = numberToWords(dollars);

  if (cents > 0) {
    result += " and " + numberToWords(cents) + " cents";
  }

  if (includeCurrency) {
    result += " dollars";
  }

  return result;
}

// Calculate commission value based on type
export function calculateCommissionValue(
  commissionType: "fixed" | "percentage" | "reit",
  commissionValue: string,
  listingPrice: string,
): number | null {
  if (commissionType === "reit") return null;

  if (commissionType === "fixed") {
    const cleaned = commissionValue.replace(/[,$]/g, "");
    return parseFloat(cleaned) || 0;
  }

  // Percentage calculation
  const price = parseFloat(listingPrice.replace(/[,$]/g, "")) || 0;
  const percentage = parseFloat(commissionValue) || 0;
  return (price * percentage) / 100;
}

// --- INLINED marketing.ts ---
export interface MarketingItem {
  id: string;
  name: string;
  price: number;
  group: string;
}

// All Marketing Items - Hardcoded exactly as specified
export const marketingItems: MarketingItem[] = [
  // Group: Allie J Photography
  {
    id: "aj-drone",
    name: "Drone Photography",
    price: 100,
    group: "Allie J Photography",
  },
  {
    id: "aj-photo12",
    name: "Professional photography x 12 and floorplan",
    price: 270,
    group: "Allie J Photography",
  },
  {
    id: "aj-photo20",
    name: "Professional photography x 20 and floorplan",
    price: 300,
    group: "Allie J Photography",
  },
  {
    id: "aj-photo8",
    name: "Professional photography x 8 and floorplan",
    price: 235,
    group: "Allie J Photography",
  },

  // Group: Marketing Campaign
  {
    id: "mc-corflute",
    name: "Corflute Signboard",
    price: 88,
    group: "Marketing Campaign",
  },
  {
    id: "mc-domain-gold",
    name: "Domain Gold",
    price: 199,
    group: "Marketing Campaign",
  },
  {
    id: "mc-extra-photo",
    name: "Extra Photography",
    price: 150,
    group: "Marketing Campaign",
  },

  {
    id: "mc-lakes",
    name: "Lakes Photography",
    price: 50,
    group: "Marketing Campaign",
  },
  {
    id: "mc-base-fy26",
    name: "Marketing Base Package FY26",
    price: 1675,
    group: "Marketing Campaign",
  },
  {
    id: "mc-base-fy26-raymond",
    name: "Marketing Base Package FY26 Raymond",
    price: 1538,
    group: "Marketing Campaign",
  },
  {
    id: "mc-metal-sign",
    name: "Metal Signboard",
    price: 195,
    group: "Marketing Campaign",
  },
  {
    id: "mc-photo-sign",
    name: "Photo Signboard",
    price: 350,
    group: "Marketing Campaign",
  },
  {
    id: "mc-video",
    name: "Property Video",
    price: 500,
    group: "Marketing Campaign",
  },
  {
    id: "mc-rea-maximiser",
    name: "REA Audience Maximiser",
    price: 149,
    group: "Marketing Campaign",
  },
  {
    id: "mc-rea-premiere",
    name: "Realestate.com Premiere+",
    price: 949,
    group: "Marketing Campaign",
  },
  {
    id: "mc-rea-premiere-land",
    name: "Realestate.com Premiere+ Land",
    price: 939,
    group: "Marketing Campaign",
  },
  {
    id: "mc-styling",
    name: "Styling",
    price: 500,
    group: "Marketing Campaign",
  },
  {
    id: "mc-title-search",
    name: "Title Search Fee",
    price: 38,
    group: "Marketing Campaign",
  },
  {
    id: "mc-voi",
    name: "Verification of Identity",
    price: 30,
    group: "Marketing Campaign",
  },

  // Group: Open2View
  {
    id: "o2v-drone",
    name: "Drone Photography",
    price: 100,
    group: "Open2View",
  },
  {
    id: "o2v-land",
    name: "Land photography package",
    price: 160,
    group: "Open2View",
  },
  {
    id: "o2v-photo12",
    name: "Professional photography x 12 photos and floorplan",
    price: 260,
    group: "Open2View",
  },
  {
    id: "o2v-photo20",
    name: "Professional photography x 20 photos and floorplan",
    price: 290,
    group: "Open2View",
  },
  {
    id: "o2v-photo8",
    name: "Professional photography x 8 photos and floorplan",
    price: 225,
    group: "Open2View",
  },

  // Group: RIX Images
  { id: "rix-home", name: "Home Package", price: 352, group: "RIX Images" },
  { id: "rix-land", name: "Land Package", price: 165, group: "RIX Images" },
  {
    id: "rix-premium",
    name: "Premium Package",
    price: 550,
    group: "RIX Images",
  },
  {
    id: "rix-premium-plus",
    name: "Premium Plus Package",
    price: 990,
    group: "RIX Images",
  },

  // Group: Jess Bonde Photography
  {
    id: "jb-photo8",
    name: "8 photos & floorplan",
    price: 225,
    group: "Jess Bonde Photography",
  },
  {
    id: "jb-photo12",
    name: "12 photos & floorplan",
    price: 260,
    group: "Jess Bonde Photography",
  },
  {
    id: "jb-photo20",
    name: "20 photos & floorplan",
    price: 290,
    group: "Jess Bonde Photography",
  },
  {
    id: "jb-drone",
    name: "Drone Photography",
    price: 100,
    group: "Jess Bonde Photography",
  },
  {
    id: "jb-video",
    name: "Full Video Package",
    price: 1200,
    group: "Jess Bonde Photography",
  },
];

// Group items by category
export function getMarketingGroups(): Record<string, MarketingItem[]> {
  return marketingItems.reduce(
    (acc, item) => {
      if (!acc[item.group]) {
        acc[item.group] = [];
      }
      acc[item.group].push(item);
      return acc;
    },
    {} as Record<string, MarketingItem[]>,
  );
}

// Calculate total from selected item IDs
export function calculateMarketingTotal(selectedIds: string[]): number {
  return marketingItems
    .filter((item) => selectedIds.includes(item.id))
    .reduce((sum, item) => sum + item.price, 0);
}

// Generate comma-separated string of selected item names
export function getMarketingListString(selectedIds: string[]): string {
  return marketingItems
    .filter((item) => selectedIds.includes(item.id))
    .map((item) => item.name)
    .join(", ");
}
// --- END INLINED ---

const WEBHOOK_URL =
  "https://hup.app.n8n.cloud/webhook/796be5aa-d13c-4bfb-9c2e-6b35973ed68d";

// Vendor structure for payload - always 4 vendors, null for unused
export interface VendorPayload {
  full_name: string | null;
  full_name_id: string | null;
  full_name_trustee: string | null;
  full_name_val: string | null; // NEW: Dynamic based on entity type
  email: string | null;
  email_val: string | null; // NEW: Always has vendor email
  mobile: string | null;
  home_phone: string | null;
  street: string | null;
  suburb: string | null;
  state: string | null;
  postcode: string | null;
  address_full: string | null;
}

export interface SubmissionPayload {
  // Agent
  agent_name: string;
  agent_email: string;
  agent_mobile: string;
  office_name: string;
  office_street: string;
  office_suburb: string;
  office_state: string;
  office_postcode: string;
  office_address_full: string;
  office_phone: string;

  // Property
  property_street: string;
  property_suburb: string;
  property_state: string;
  property_postcode: string;
  property_address_full: string;
  ct_volume: string;
  folio_no: string;
  pid: string;
  listing_no: string;
  annexure_a: boolean;
  annexure_count: number;
  annex_item_1: string | null;
  annex_des_1: string | null;
  annex_item_2: string | null;
  annex_des_2: string | null;
  annex_item_3: string | null;
  annex_des_3: string | null;
  annex_item_4: string | null;
  annex_des_4: string | null;
  annex_item_5: string | null;
  annex_des_5: string | null;
  annex_item_6: string | null;
  annex_des_6: string | null;
  annex_item_7: string | null;
  annex_des_7: string | null;
  annex_item_8: string | null;
  annex_des_8: string | null;
  annex_item_9: string | null;
  annex_des_9: string | null;
  annex_item_10: string | null;
  annex_des_10: string | null;
  annex_item_11: string | null;
  annex_des_11: string | null;
  annex_item_12: string | null;
  annex_des_12: string | null;
  annex_item_13: string | null;
  annex_des_13: string | null;
  listing_price: string;
  listing_price_in_words: string;
  listing_price_in_words_with_currency: string;
  commission_fixed: string | null;
  commission_percentage: string | null;
  commission_value: string | null;
  commission_value_in_words: string | null;
  commission_value_in_words_with_currency: string | null;
  gst_taxable: string | null;
  gst_non_taxable: string | null;
  agency_period_type: string;
  sole_agency_period: string;

  // Vendor
  vendor_structure: string;
  vendor_type: string;
  vendor_subtype: string | null;
  vendor_count: number;
  trust_name: string | null; // NEW FIELD
  company_name: string | null;
  company_acn: string | null; // NEW
  company_name_acn: string | null; // NEW: Name + (ACN ...)
  all_vendors_names: string;
  all_vendors_names_trust: string | null; // NEW: All trustees formatted
  all_vendors_first_names: string;
  all_vendors_email: string;
  vendor_1: VendorPayload;
  vendor_2: VendorPayload;
  vendor_3: VendorPayload;
  vendor_4: VendorPayload;

  // Marketing
  marketing_total_cost: string;
  marketing_total_cost_in_words: string;
  marketing_total_cost_in_words_with_currency: string;
  marketing_list_string: string;
  selected_marketing_ids: string[];
  // Individual marketing items (1-20)
  marketing_item_1: string | null;
  marketing_price_1: string | null;
  marketing_item_2: string | null;
  marketing_price_2: string | null;
  marketing_item_3: string | null;
  marketing_price_3: string | null;
  marketing_item_4: string | null;
  marketing_price_4: string | null;
  marketing_item_5: string | null;
  marketing_price_5: string | null;
  marketing_item_6: string | null;
  marketing_price_6: string | null;
  marketing_item_7: string | null;
  marketing_price_7: string | null;
  marketing_item_8: string | null;
  marketing_price_8: string | null;
  marketing_item_9: string | null;
  marketing_price_9: string | null;
  marketing_item_10: string | null;
  marketing_price_10: string | null;
  marketing_item_11: string | null;
  marketing_price_11: string | null;
  marketing_item_12: string | null;
  marketing_price_12: string | null;
  marketing_item_13: string | null;
  marketing_price_13: string | null;
  marketing_item_14: string | null;
  marketing_price_14: string | null;
  marketing_item_15: string | null;
  marketing_price_15: string | null;
  marketing_item_16: string | null;
  marketing_price_16: string | null;
  marketing_item_17: string | null;
  marketing_price_17: string | null;
  marketing_item_18: string | null;
  marketing_price_18: string | null;
  marketing_item_19: string | null;
  marketing_price_19: string | null;
  marketing_item_20: string | null;
  marketing_price_20: string | null;

  // Metadata (backend only)
  file_name: string;
  file_name_folder: string;
  file_name_main: string;
}

// Create null vendor object
function createNullVendor(): VendorPayload {
  return {
    full_name: null,
    full_name_id: null,
    full_name_trustee: null,
    full_name_val: null,
    email: null,
    email_val: null,
    mobile: null,
    home_phone: null,
    street: null,
    suburb: null,
    state: null,
    postcode: null,
    address_full: null,
  };
}

export function buildPayload(formData: FormData): SubmissionPayload {
  // Helper to uppercase string fields except emails
  const toUpper = (value: string): string => value.toUpperCase();

  // Get selected marketing items with full details for individual fields
  const selectedMarketingItems = formData.selectedMarketing
    .map((id) => marketingItems.find((m) => m.id === id))
    .filter((item): item is NonNullable<typeof item> => item !== undefined);

  // Build marketing individual fields (1-20)
  const marketingFields: Record<string, string | null> = {};
  for (let i = 1; i <= 20; i++) {
    const item = selectedMarketingItems[i - 1];
    marketingFields[`marketing_item_${i}`] = item ? `${i}. ${item.name}` : null;
    marketingFields[`marketing_price_${i}`] = item
      ? formatCurrency(item.price)
      : null;
  }

  // Trust Name Logic - Auto-append "TRUST" if missing
  let effectiveTrustName: string | null = null;
  if (formData.vendorStructure === "Trust") {
    // Always use the explicit Trust Name field for all trusts
    let rawTrustName = formData.trustName.trim();
    // Auto-append "TRUST" if not present (case-insensitive check)
    if (!rawTrustName.toUpperCase().endsWith("TRUST")) {
      rawTrustName = `${rawTrustName} TRUST`;
    }
    effectiveTrustName = rawTrustName;
  }
  const trustNameUpper = effectiveTrustName
    ? toUpper(effectiveTrustName)
    : null;

  // Determine if this is a non-individual entity (Trust or Company)
  const isNonIndividual =
    formData.vendorStructure === "Trust" ||
    formData.vendorStructure === "Company";

  // Helper to compute company_name_acn value for reuse
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

  // Helper to compute all_vendors_names_trust value for reuse
  const allVendorsNamesTrustComputed: string | null = trustNameUpper
    ? (() => {
        const names = formData.vendors
          .slice(0, formData.vendorCount)
          .map((v) =>
            toUpper(v.hasDifferentNameOnTitle ? v.nameOnTitle : v.fullName),
          )
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

        const suffixText =
          formData.vendorCount > 1 ? "AS TRUSTEES FOR" : "AS TRUSTEE FOR";
        return `${joinedNames} ${suffixText} ${trustNameUpper}`;
      })()
    : null;

  // Helper to determine full_name_val for a given vendor index
  const getFullNameVal = (vendorIndex: number): string | null => {
    // Only Vendor 1 (index 0) gets a value for non-Individual types
    if (formData.vendorStructure === "Individual") {
      // For individuals, each vendor gets their own full_name as val
      const v = formData.vendors[vendorIndex];
      return v.hasDifferentNameOnTitle
        ? toUpper(v.nameOnTitle)
        : toUpper(v.fullName);
    } else if (vendorIndex === 0) {
      // Only vendor_1 gets full_name_val for Trust/Company
      if (
        formData.vendorStructure === "Trust" &&
        formData.trusteeType === "individual"
      ) {
        return allVendorsNamesTrustComputed;
      } else {
        // Trust + Company or Company
        return companyNameAcnComputed;
      }
    }
    return null;
  };

  const payload: SubmissionPayload = {
    // Agent - all uppercase except email
    agent_name: toUpper(formData.agentName),
    agent_email: formData.agentEmail.toLowerCase(),
    agent_mobile: toUpper(formData.agentMobile),
    office_name: toUpper(formData.officeName),
    office_street: toUpper(formData.officeStreet),
    office_suburb: toUpper(formData.officeSuburb),
    office_state: toUpper(formData.officeState),
    office_postcode: toUpper(formData.officePostcode),
    office_address_full: toUpper(formData.officeAddress),
    office_phone: toUpper(formData.officePhone),

    // Property - all uppercase
    property_street: toUpper(formData.propertyStreet),
    property_suburb: toUpper(formData.propertySuburb),
    property_state: toUpper(formData.propertyState),
    property_postcode: toUpper(formData.propertyPostcode),
    property_address_full: toUpper(
      `${formData.propertyStreet}, ${formData.propertySuburb}, ${formData.propertyState} ${formData.propertyPostcode}`,
    ),
    ct_volume: toUpper(formData.ctVolume),
    folio_no: toUpper(formData.folioNo),
    pid: toUpper(formData.pid),
    listing_no: toUpper(formData.listingNo),
    annexure_a: formData.annexureA,
    annexure_count: formData.annexureA ? formData.annexureCount : 0,
    annex_item_1:
      formData.annexureA && formData.annexureCount >= 1
        ? `1. ${formData.annexureItems[0].item}`
        : null,
    annex_des_1:
      formData.annexureA && formData.annexureCount >= 1
        ? formData.annexureItems[0].description
        : null,
    annex_item_2:
      formData.annexureA && formData.annexureCount >= 2
        ? `2. ${formData.annexureItems[1].item}`
        : null,
    annex_des_2:
      formData.annexureA && formData.annexureCount >= 2
        ? formData.annexureItems[1].description
        : null,
    annex_item_3:
      formData.annexureA && formData.annexureCount >= 3
        ? `3. ${formData.annexureItems[2].item}`
        : null,
    annex_des_3:
      formData.annexureA && formData.annexureCount >= 3
        ? formData.annexureItems[2].description
        : null,
    annex_item_4:
      formData.annexureA && formData.annexureCount >= 4
        ? `4. ${formData.annexureItems[3].item}`
        : null,
    annex_des_4:
      formData.annexureA && formData.annexureCount >= 4
        ? formData.annexureItems[3].description
        : null,
    annex_item_5:
      formData.annexureA && formData.annexureCount >= 5
        ? `5. ${formData.annexureItems[4].item}`
        : null,
    annex_des_5:
      formData.annexureA && formData.annexureCount >= 5
        ? formData.annexureItems[4].description
        : null,
    annex_item_6:
      formData.annexureA && formData.annexureCount >= 6
        ? `6. ${formData.annexureItems[5].item}`
        : null,
    annex_des_6:
      formData.annexureA && formData.annexureCount >= 6
        ? formData.annexureItems[5].description
        : null,
    annex_item_7:
      formData.annexureA && formData.annexureCount >= 7
        ? `7. ${formData.annexureItems[6].item}`
        : null,
    annex_des_7:
      formData.annexureA && formData.annexureCount >= 7
        ? formData.annexureItems[6].description
        : null,
    annex_item_8:
      formData.annexureA && formData.annexureCount >= 8
        ? `8. ${formData.annexureItems[7].item}`
        : null,
    annex_des_8:
      formData.annexureA && formData.annexureCount >= 8
        ? formData.annexureItems[7].description
        : null,
    annex_item_9:
      formData.annexureA && formData.annexureCount >= 9
        ? `9. ${formData.annexureItems[8].item}`
        : null,
    annex_des_9:
      formData.annexureA && formData.annexureCount >= 9
        ? formData.annexureItems[8].description
        : null,
    annex_item_10:
      formData.annexureA && formData.annexureCount >= 10
        ? `10. ${formData.annexureItems[9].item}`
        : null,
    annex_des_10:
      formData.annexureA && formData.annexureCount >= 10
        ? formData.annexureItems[9].description
        : null,
    annex_item_11:
      formData.annexureA && formData.annexureCount >= 11
        ? `11. ${formData.annexureItems[10].item}`
        : null,
    annex_des_11:
      formData.annexureA && formData.annexureCount >= 11
        ? formData.annexureItems[10].description
        : null,
    annex_item_12:
      formData.annexureA && formData.annexureCount >= 12
        ? `12. ${formData.annexureItems[11].item}`
        : null,
    annex_des_12:
      formData.annexureA && formData.annexureCount >= 12
        ? formData.annexureItems[11].description
        : null,
    annex_item_13:
      formData.annexureA && formData.annexureCount >= 13
        ? `13. ${formData.annexureItems[12].item}`
        : null,
    annex_des_13:
      formData.annexureA && formData.annexureCount >= 13
        ? formData.annexureItems[12].description
        : null,
    listing_price: toUpper(formData.listingPrice),
    listing_price_in_words: (() => {
      const numericValue = parseFloat(
        formData.listingPrice.replace(/[^0-9.]/g, ""),
      );
      return isNaN(numericValue)
        ? toUpper(formData.listingPrice)
        : dollarAmountToWords(numericValue, false).toUpperCase();
    })(),
    listing_price_in_words_with_currency: (() => {
      const numericValue = parseFloat(
        formData.listingPrice.replace(/[^0-9.]/g, ""),
      );
      return isNaN(numericValue)
        ? toUpper(formData.listingPrice)
        : dollarAmountToWords(numericValue, true).toUpperCase();
    })(),
    commission_fixed:
      formData.commissionType === "fixed"
        ? formData.commissionValue
        : formData.commissionType === "reit"
          ? "REIT Gross Scale of Commission"
          : null,
    commission_percentage:
      formData.commissionType === "percentage"
        ? formData.commissionValue
        : null,
    commission_value:
      formData.commissionType === "reit"
        ? null
        : formData.commissionType === "percentage"
          ? formatNumberWithCommas(
              String(
                calculateCommissionValue(
                  formData.commissionType,
                  formData.commissionValue,
                  formData.listingPrice,
                ) || 0,
              ),
            )
          : formData.commissionValue,
    commission_value_in_words:
      formData.commissionType === "reit"
        ? null
        : dollarAmountToWords(
            calculateCommissionValue(
              formData.commissionType,
              formData.commissionValue,
              formData.listingPrice,
            ) || 0,
            false,
          ),
    commission_value_in_words_with_currency:
      formData.commissionType === "reit"
        ? null
        : dollarAmountToWords(
            calculateCommissionValue(
              formData.commissionType,
              formData.commissionValue,
              formData.listingPrice,
            ) || 0,
            true,
          ),
    gst_taxable: formData.gstTaxable ? "✔" : null,
    gst_non_taxable: !formData.gstTaxable ? "✔" : null,
    agency_period_type: formData.agencyPeriodType,
    sole_agency_period: formData.soleAgencyPeriod,

    // Vendor - always 4 vendors, null for unused
    vendor_structure: toUpper(formData.vendorStructure),
    vendor_type: toUpper(formData.vendorStructure), // Alias as requested
    vendor_subtype:
      formData.vendorStructure === "Trust"
        ? toUpper(formData.trusteeType)
        : null,
    vendor_count: formData.vendorCount,
    // Trust fields - only for Trust entity type
    trust_name: formData.vendorStructure === "Trust" ? trustNameUpper : null,
    // Company fields - only for Company or Trust+Company
    company_name:
      formData.vendorStructure === "Company" ||
      (formData.vendorStructure === "Trust" &&
        formData.trusteeType === "company")
        ? formData.companyName
          ? toUpper(formData.companyName)
          : null
        : null,
    company_acn:
      formData.vendorStructure === "Company" ||
      (formData.vendorStructure === "Trust" &&
        formData.trusteeType === "company")
        ? formData.companyACN || null
        : null,
    company_name_acn:
      (formData.vendorStructure === "Company" ||
        (formData.vendorStructure === "Trust" &&
          formData.trusteeType === "company")) &&
      formData.companyName &&
      formData.companyACN
        ? (() => {
            // Format ACN as "123 456 789"
            const acn = formData.companyACN.replace(/[^0-9]/g, "");
            const formattedAcn = acn.replace(
              /(\d{3})(\d{3})(\d{3})/,
              "$1 $2 $3",
            );
            const baseStr = `${toUpper(formData.companyName)} (ACN ${formattedAcn})`;
            return trustNameUpper
              ? `${baseStr} AS TRUSTEE FOR ${trustNameUpper}`
              : baseStr;
          })()
        : null,
    all_vendors_names: formData.vendors
      .slice(0, formData.vendorCount)
      .map((v) =>
        toUpper(v.hasDifferentNameOnTitle ? v.nameOnTitle : v.fullName),
      )
      .filter(Boolean)
      .join(", "),
    all_vendors_names_trust: (() => {
      const names = formData.vendors
        .slice(0, formData.vendorCount)
        .map((v) =>
          toUpper(v.hasDifferentNameOnTitle ? v.nameOnTitle : v.fullName),
        )
        .filter(Boolean);

      if (names.length === 0) return null;

      // Individual: Same as all_vendors_names
      if (formData.vendorStructure === "Individual") {
        return names.join(", ");
      }

      // Trust (Individual or Company trustee): Names + AS TRUSTEE(S) FOR trust_name
      if (formData.vendorStructure === "Trust" && trustNameUpper) {
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
        const suffixText =
          formData.vendorCount > 1 ? "AS TRUSTEES FOR" : "AS TRUSTEE FOR";
        return `${joinedNames} ${suffixText} ${trustNameUpper}`;
      }

      // Company: Director/Secretary format
      if (formData.vendorStructure === "Company") {
        if (!formData.hasMultipleDirectors) {
          // Sole Director/Secretary: DIRECTOR/SECRETARY: [name]
          return `DIRECTOR/SECRETARY: ${names[0] || ""}`;
        } else {
          // Separate Director and Secretary: DIRECTOR: [vendor1]     SECRETARY: [vendor2]
          const director = names[0] || "";
          const secretary = names[1] || "";
          return `DIRECTOR: ${director}     SECRETARY: ${secretary}`;
        }
      }

      // Fallback
      return names.join(", ");
    })(),
    all_vendors_first_names: (() => {
      // Helper for Title Case
      const toTitleCase = (str: string) =>
        str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

      const firstNames = formData.vendors
        .slice(0, formData.vendorCount)
        .map((v) => {
          // Use name on title if different, otherwise full name
          const nameToUse = v.hasDifferentNameOnTitle
            ? v.nameOnTitle
            : v.fullName;
          const firstWord = nameToUse.trim().split(" ")[0];
          return toTitleCase(firstWord);
        })
        .filter(Boolean);

      if (firstNames.length === 0) return "";
      if (firstNames.length === 1) return firstNames[0];
      if (firstNames.length === 2)
        return `${firstNames[0]} and ${firstNames[1]}`;
      // For 3 or more: "Name, Name, and Name"
      const last = firstNames.pop();
      return `${firstNames.join(", ")}, and ${last}`;
    })(),
    all_vendors_email: formData.vendors
      .slice(0, formData.vendorCount)
      .map((v) => v.email.toLowerCase())
      .filter(Boolean)
      .join(";"),

    // Individual vendor payloads with conditional nullification
    vendor_1:
      formData.vendorCount >= 1
        ? {
            full_name: formData.vendors[0].hasDifferentNameOnTitle
              ? toUpper(formData.vendors[0].nameOnTitle)
              : toUpper(formData.vendors[0].fullName),
            full_name_id: toUpper(formData.vendors[0].fullName),
            full_name_trustee: trustNameUpper
              ? `${
                  formData.vendors[0].hasDifferentNameOnTitle
                    ? toUpper(formData.vendors[0].nameOnTitle)
                    : toUpper(formData.vendors[0].fullName)
                } AS TRUSTEE FOR ${trustNameUpper}`
              : null,
            full_name_val: getFullNameVal(0),
            email: isNonIndividual
              ? null
              : formData.vendors[0].email.toLowerCase(),
            email_val: formData.vendors[0].email.toLowerCase(),
            mobile: isNonIndividual
              ? null
              : toUpper(formData.vendors[0].mobile),
            home_phone: isNonIndividual
              ? null
              : formData.vendors[0].homePhone
                ? toUpper(formData.vendors[0].homePhone)
                : null,
            street: isNonIndividual
              ? null
              : toUpper(formData.vendors[0].street),
            suburb: isNonIndividual
              ? null
              : toUpper(formData.vendors[0].suburb),
            state: isNonIndividual ? null : toUpper(formData.vendors[0].state),
            postcode: isNonIndividual
              ? null
              : toUpper(formData.vendors[0].postcode),
            address_full: isNonIndividual
              ? null
              : toUpper(
                  `${formData.vendors[0].street}, ${formData.vendors[0].suburb}, ${formData.vendors[0].state} ${formData.vendors[0].postcode}`,
                ),
          }
        : createNullVendor(),
    vendor_2:
      formData.vendorCount >= 2
        ? {
            full_name: formData.vendors[1].hasDifferentNameOnTitle
              ? toUpper(formData.vendors[1].nameOnTitle)
              : toUpper(formData.vendors[1].fullName),
            full_name_id: toUpper(formData.vendors[1].fullName),
            full_name_trustee: trustNameUpper
              ? `${
                  formData.vendors[1].hasDifferentNameOnTitle
                    ? toUpper(formData.vendors[1].nameOnTitle)
                    : toUpper(formData.vendors[1].fullName)
                } AS TRUSTEE FOR ${trustNameUpper}`
              : null,
            full_name_val: getFullNameVal(1),
            email: isNonIndividual
              ? null
              : formData.vendors[1].email.toLowerCase(),
            email_val: formData.vendors[1].email.toLowerCase(),
            mobile: isNonIndividual
              ? null
              : toUpper(formData.vendors[1].mobile),
            home_phone: isNonIndividual
              ? null
              : formData.vendors[1].homePhone
                ? toUpper(formData.vendors[1].homePhone)
                : null,
            street: isNonIndividual
              ? null
              : toUpper(formData.vendors[1].street),
            suburb: isNonIndividual
              ? null
              : toUpper(formData.vendors[1].suburb),
            state: isNonIndividual ? null : toUpper(formData.vendors[1].state),
            postcode: isNonIndividual
              ? null
              : toUpper(formData.vendors[1].postcode),
            address_full: isNonIndividual
              ? null
              : toUpper(
                  `${formData.vendors[1].street}, ${formData.vendors[1].suburb}, ${formData.vendors[1].state} ${formData.vendors[1].postcode}`,
                ),
          }
        : createNullVendor(),
    vendor_3:
      formData.vendorCount >= 3
        ? {
            full_name: formData.vendors[2].hasDifferentNameOnTitle
              ? toUpper(formData.vendors[2].nameOnTitle)
              : toUpper(formData.vendors[2].fullName),
            full_name_id: toUpper(formData.vendors[2].fullName),
            full_name_trustee: trustNameUpper
              ? `${
                  formData.vendors[2].hasDifferentNameOnTitle
                    ? toUpper(formData.vendors[2].nameOnTitle)
                    : toUpper(formData.vendors[2].fullName)
                } AS TRUSTEE FOR ${trustNameUpper}`
              : null,
            full_name_val: getFullNameVal(2),
            email: isNonIndividual
              ? null
              : formData.vendors[2].email.toLowerCase(),
            email_val: formData.vendors[2].email.toLowerCase(),
            mobile: isNonIndividual
              ? null
              : toUpper(formData.vendors[2].mobile),
            home_phone: isNonIndividual
              ? null
              : formData.vendors[2].homePhone
                ? toUpper(formData.vendors[2].homePhone)
                : null,
            street: isNonIndividual
              ? null
              : toUpper(formData.vendors[2].street),
            suburb: isNonIndividual
              ? null
              : toUpper(formData.vendors[2].suburb),
            state: isNonIndividual ? null : toUpper(formData.vendors[2].state),
            postcode: isNonIndividual
              ? null
              : toUpper(formData.vendors[2].postcode),
            address_full: isNonIndividual
              ? null
              : toUpper(
                  `${formData.vendors[2].street}, ${formData.vendors[2].suburb}, ${formData.vendors[2].state} ${formData.vendors[2].postcode}`,
                ),
          }
        : createNullVendor(),
    vendor_4:
      formData.vendorCount >= 4
        ? {
            full_name: formData.vendors[3].hasDifferentNameOnTitle
              ? toUpper(formData.vendors[3].nameOnTitle)
              : toUpper(formData.vendors[3].fullName),
            full_name_id: toUpper(formData.vendors[3].fullName),
            full_name_trustee: trustNameUpper
              ? `${
                  formData.vendors[3].hasDifferentNameOnTitle
                    ? toUpper(formData.vendors[3].nameOnTitle)
                    : toUpper(formData.vendors[3].fullName)
                } AS TRUSTEE FOR ${trustNameUpper}`
              : null,
            full_name_val: getFullNameVal(3),
            email: isNonIndividual
              ? null
              : formData.vendors[3].email.toLowerCase(),
            email_val: formData.vendors[3].email.toLowerCase(),
            mobile: isNonIndividual
              ? null
              : toUpper(formData.vendors[3].mobile),
            home_phone: isNonIndividual
              ? null
              : formData.vendors[3].homePhone
                ? toUpper(formData.vendors[3].homePhone)
                : null,
            street: isNonIndividual
              ? null
              : toUpper(formData.vendors[3].street),
            suburb: isNonIndividual
              ? null
              : toUpper(formData.vendors[3].suburb),
            state: isNonIndividual ? null : toUpper(formData.vendors[3].state),
            postcode: isNonIndividual
              ? null
              : toUpper(formData.vendors[3].postcode),
            address_full: isNonIndividual
              ? null
              : toUpper(
                  `${formData.vendors[3].street}, ${formData.vendors[3].suburb}, ${formData.vendors[3].state} ${formData.vendors[3].postcode}`,
                ),
          }
        : createNullVendor(),

    // Marketing
    marketing_total_cost: formatNumberWithCommas(
      String(calculateMarketingTotal(formData.selectedMarketing)),
    ),
    marketing_total_cost_in_words: dollarAmountToWords(
      calculateMarketingTotal(formData.selectedMarketing),
      false,
    ),
    marketing_total_cost_in_words_with_currency: dollarAmountToWords(
      calculateMarketingTotal(formData.selectedMarketing),
      true,
    ),
    marketing_list_string: getMarketingListString(
      formData.selectedMarketing,
    ).toUpperCase(),
    selected_marketing_ids: formData.selectedMarketing,

    ...marketingFields,

    // Metadata - file_name with square bracket delimiters
    // Format: [property][vendors_names][vendors_first_names][vendors_emails][agent_name][agent_mobile][agent_email]
    // To parse later: split by '][' and remove first '[' and last ']'
    file_name: [
      toUpper(
        `${formData.propertyStreet}, ${formData.propertySuburb}, ${formData.propertyState} ${formData.propertyPostcode}`,
      ),
      formData.vendors
        .slice(0, formData.vendorCount)
        .map((v) => toUpper(v.fullName))
        .join(", "),
      (() => {
        // Re-calculate first names logic for file_name
        const toTitleCase = (str: string) =>
          str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
        const firstNames = formData.vendors
          .slice(0, formData.vendorCount)
          .map((v) => {
            const firstWord = v.fullName.trim().split(" ")[0];
            return toTitleCase(firstWord);
          })
          .filter(Boolean);
        if (firstNames.length === 0) return "";
        if (firstNames.length === 1) return firstNames[0];
        if (firstNames.length === 2)
          return `${firstNames[0]} and ${firstNames[1]}`;
        const last = firstNames.pop();
        return `${firstNames.join(", ")}, and ${last}`;
      })(),
      formData.vendors
        .slice(0, formData.vendorCount)
        .map((v) => v.email.toLowerCase())
        .filter(Boolean)
        .join(";"),
      toUpper(formData.agentName),
      toUpper(formData.agentMobile),
      formData.agentEmail.toLowerCase(),
    ]
      .map((value) => `[${value}]`)
      .join(""),

    // Folder Name: [Street Name] [Number], [Suburb] (Number always behind)
    // Logic: If street starts with number (e.g. "123 TEST"), flip to "TEST 123"
    file_name_folder: (() => {
      const street = toUpper(formData.propertyStreet);
      const suburb = toUpper(formData.propertySuburb);
      // Match number at start (digits optionally followed by letter)
      const match = street.match(/^(\d+[A-Za-z]?)\s+(.*)$/);
      // If match, flip: group 2 (name) + group 1 (number). Else keep as is.
      const formattedStreet = match ? `${match[2]} ${match[1]}` : street;
      return `${formattedStreet}, ${suburb}`;
    })(),

    // Main File Name: [Street] - Sole Agency & Neighbourhood Disputes
    file_name_main: `${toUpper(
      formData.propertyStreet,
    )} - Sole Agency & Neighbourhood Disputes`,
  } as SubmissionPayload; // Casting to avoid strict excess property checks on ...marketingFields

  return payload;
}

export async function submitForm(formData: FormData) {
  const payload = buildPayload(formData);
  const supabase = createClient();

  // 1. Save to Supabase
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const { error } = await supabase.from("sales_listings").insert({
    user_id: user.id,
    address: `${payload.property_street}, ${payload.property_suburb}`,
    suburb: payload.property_suburb,
    state: payload.property_state,
    postcode: payload.property_postcode,
    status: "draft",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    form_data: payload as any, // Storing the full payload or formData
    agent_name: payload.agent_name,
    vendor_name: payload.all_vendors_names,
  });

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("Failed to save to database: " + error.message);
  }

  // 2. Send to Webhook (n8n)
  try {
    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Webhook submission failed: ${response.statusText}`);
    }

    const result = await response.json();
    return {
      success: true,
      vendorName: payload.all_vendors_names,
      docusignUrl: result.docusignUrl, // Assuming n8n returns this
    };
  } catch (error) {
    console.error("Webhook error:", error);
    // Even if webhook fails, we saved to DB, but for user feedback we might want to show error
    // For now, let's treat it as a failure because the main goal is generation
    throw error;
  }
}
