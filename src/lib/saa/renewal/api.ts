/**
 * SAA Renewal API
 * Builds the submission payload from VaultRE property data and submits
 * to the n8n webhook for DocuSign generation.
 *
 * Reuses the same SubmissionPayload shape as the original SAA form
 * to maintain full compatibility with the n8n/DocuSign pipeline.
 */

import type { RenewalPropertyData, RenewalFormData } from "./types";
import type { SubmissionPayload, VendorPayload } from "../api";
import {
  dollarAmountToWords,
  calculateCommissionValue,
} from "../api";
import {
  formatCurrency,
  formatNumberWithCommas,
} from "../validation";
import {
  MarketingItem,
  calculateMarketingTotal,
  getMarketingListString,
} from "../marketing";
import { createClient } from "@/lib/supabase/client";

// Renewal-specific webhook endpoint
const RENEWAL_WEBHOOK_URL =
  process.env.NEXT_PUBLIC_SAA_RENEWAL_WEBHOOK_URL ||
  "https://hup.app.n8n.cloud/webhook/saa-renewal";

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

// Title Case helper
function toProperCase(str: string): string {
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Build vendor payload from VaultRE vendor data
 */
function buildVendorPayload(
  vendor: RenewalPropertyData["vendors"][number],
  _index: number,
): VendorPayload {
  const fullName = vendor.fullName.toUpperCase();
  const cleaned = vendor.mobile.replace(/[\s-]/g, "").replace(/^0/, "");

  return {
    full_name: fullName,
    full_name_id: fullName,
    full_name_trustee: null,
    full_name_val: fullName,
    email: vendor.email.toLowerCase(),
    email_val: vendor.email.toLowerCase(),
    mobile: `${vendor.mobileCountryCode || "61"} ${cleaned}`,
    mobile_countrycode: vendor.mobileCountryCode || "61",
    mobile_number: cleaned,
    home_phone: vendor.homePhone || null,
    street: vendor.street.toUpperCase(),
    suburb: vendor.suburb.toUpperCase(),
    state: vendor.state.toUpperCase(),
    postcode: vendor.postcode,
    address_full: [
      vendor.street.toUpperCase(),
      vendor.suburb.toUpperCase(),
      vendor.state.toUpperCase(),
      vendor.postcode,
    ]
      .filter(Boolean)
      .join(", "),
  };
}

/** Annexure item shape (from DB lookup) */
export interface RenewalAnnexureItem {
  item: string;
  description: string;
}

/**
 * Build the SubmissionPayload from renewal data.
 * Maps VaultRE property data + form inputs into the payload shape
 * expected by the n8n/DocuSign pipeline.
 *
 * If annexureItems are provided and includeAnnexure is true,
 * they are mapped into the annex_item_N / annex_des_N fields
 * with full parity to the original SAA submission format.
 */
export function buildRenewalPayload(
  formData: RenewalFormData,
  propertyData: RenewalPropertyData,
  selectedMarketingIds: string[],
  availableMarketingItems: MarketingItem[],
  annexureItems?: RenewalAnnexureItem[] | null,
  includeAnnexure?: boolean,
): SubmissionPayload {
  const vendors = propertyData.vendors;
  const vendorCount = vendors.length;

  // Build vendor payloads (max 4)
  const vendorPayloads: VendorPayload[] = [
    createNullVendor(),
    createNullVendor(),
    createNullVendor(),
    createNullVendor(),
  ];

  for (let i = 0; i < Math.min(vendorCount, 4); i++) {
    vendorPayloads[i] = buildVendorPayload(vendors[i], i);
  }

  // All vendor names
  const allVendorNames = vendors
    .slice(0, 4)
    .map((v) => v.fullName.toUpperCase())
    .join(" AND ");

  const allVendorFirstNames = vendors
    .slice(0, 4)
    .map((v) => {
      const parts = v.fullName.trim().split(" ");
      return parts[0] ? toProperCase(parts[0]) : "";
    })
    .filter(Boolean)
    .join(" & ");

  const allVendorsEmail = vendors
    .slice(0, 4)
    .map((v) => v.email.toLowerCase())
    .filter(Boolean)
    .join(", ");

  // Listing price
  const listingPrice = propertyData.searchPrice
    ? formatNumberWithCommas(propertyData.searchPrice.toString())
    : "0";

  // Commission
  let commissionFixed: string | null = null;
  let commissionPercentage: string | null = null;

  if (formData.commissionType === "fixed" && propertyData.sellingFeeFixed) {
    commissionFixed = formatCurrency(propertyData.sellingFeeFixed);
  } else if (
    formData.commissionType === "percentage" &&
    propertyData.sellingFeePercent
  ) {
    commissionPercentage = propertyData.sellingFeePercent.toString();
  }

  const commissionValue = calculateCommissionValue(
    formData.commissionType,
    formData.commissionValue || "0",
    listingPrice,
  );

  const commissionValueFormatted = commissionValue
    ? formatCurrency(commissionValue)
    : null;
  const commissionValueWords = commissionValue
    ? dollarAmountToWords(commissionValue)
    : null;
  const commissionValueWordsWithCurrency = commissionValue
    ? dollarAmountToWords(commissionValue, true)
    : null;

  // Marketing
  const selectedMarketingItems = selectedMarketingIds
    .map((id) => availableMarketingItems.find((m) => m.id === id))
    .filter(
      (item): item is NonNullable<typeof item> => item !== undefined,
    );

  const marketingTotal = calculateMarketingTotal(
    selectedMarketingIds,
    availableMarketingItems,
  );

  const marketingFields: Record<string, string | null> = {};
  for (let i = 1; i <= 20; i++) {
    const item = selectedMarketingItems[i - 1];
    marketingFields[`marketing_item_${i}`] = item
      ? `${i}. ${item.name}`
      : null;
    marketingFields[`marketing_price_${i}`] = item
      ? formatCurrency(item.price)
      : null;
  }

  // Build payload
  const payload = {
    // Agent
    agent_name: formData.agentName.toUpperCase(),
    agent_email: formData.agentEmail.toLowerCase(),
    agent_mobile: formData.agentMobile,
    agent_mobile_countrycode: "+61",
    agent_mobile_number: formData.agentMobile.replace(/[\s-]/g, ""),
    office_name: formData.officeName.toUpperCase(),
    office_street: formData.officeStreet.toUpperCase(),
    office_suburb: formData.officeSuburb.toUpperCase(),
    office_state: formData.officeState.toUpperCase(),
    office_postcode: formData.officePostcode,
    office_address_full: [
      formData.officeStreet.toUpperCase(),
      formData.officeSuburb.toUpperCase(),
      formData.officeState.toUpperCase(),
      formData.officePostcode,
    ]
      .filter(Boolean)
      .join(", "),
    office_phone: formData.officePhone,

    // Property
    property_class: propertyData.propertyClass.toUpperCase(),
    property_street: propertyData.street.toUpperCase(),
    property_suburb: propertyData.suburb.toUpperCase(),
    property_state: propertyData.state.toUpperCase(),
    property_postcode: propertyData.postcode,
    property_address_full: [
      propertyData.street.toUpperCase(),
      propertyData.suburb.toUpperCase(),
      propertyData.state.toUpperCase(),
      propertyData.postcode,
    ]
      .filter(Boolean)
      .join(", "),
    ct_volume: propertyData.volumeNumber,
    folio_no: propertyData.folioNumber,
    pid: propertyData.referenceID,
    listing_no: propertyData.listingNo,

    // Annexure A — mapped from previous SAA submission if available
    annexure_a: !!(includeAnnexure && annexureItems && annexureItems.length > 0),
    annexure_count:
      includeAnnexure && annexureItems
        ? annexureItems.filter((a) => a.item?.trim()).length
        : 0,
    ...(() => {
      const fields: Record<string, string | null> = {};
      for (let i = 1; i <= 13; i++) {
        const entry =
          includeAnnexure && annexureItems ? annexureItems[i - 1] : undefined;
        if (entry && entry.item?.trim()) {
          fields[`annex_item_${i}`] = `${i}. ${entry.item}`;
          fields[`annex_des_${i}`] = entry.description || null;
        } else {
          fields[`annex_item_${i}`] = null;
          fields[`annex_des_${i}`] = null;
        }
      }
      return fields;
    })(),

    // Pricing
    listing_price: listingPrice,
    listing_price_in_words: dollarAmountToWords(listingPrice),
    listing_price_in_words_with_currency: dollarAmountToWords(
      listingPrice,
      true,
    ),
    commission_fixed: commissionFixed,
    commission_percentage: commissionPercentage,
    commission_value: commissionValueFormatted,
    commission_value_in_words: commissionValueWords,
    commission_value_in_words_with_currency: commissionValueWordsWithCurrency,
    gst_taxable: null,
    gst_non_taxable: null,
    agency_period_type: formData.agencyPeriodType,
    sole_agency_period: formData.soleAgencyPeriod,

    // Vendors
    vendor_structure: "Individual",
    vendor_type: "Individual",
    vendor_subtype: null,
    vendor_count: vendorCount,
    trust_name: null,
    deceased_name: null,
    family_of_late: null,
    company_name: null,
    company_acn: null,
    company_name_acn: null,
    all_vendors_names: allVendorNames,
    all_vendors_names_trust: null,
    all_vendors_first_names: allVendorFirstNames,
    all_vendors_email: allVendorsEmail,
    vendor_1: vendorPayloads[0],
    vendor_2: vendorPayloads[1],
    vendor_3: vendorPayloads[2],
    vendor_4: vendorPayloads[3],

    // Marketing
    marketing_total_cost: formatCurrency(marketingTotal),
    marketing_total_cost_in_words: dollarAmountToWords(marketingTotal),
    marketing_total_cost_in_words_with_currency: dollarAmountToWords(
      marketingTotal,
      true,
    ),
    marketing_list_string: getMarketingListString(
      selectedMarketingIds,
      availableMarketingItems,
    ),
    marketing_list_id: selectedMarketingItems.map((item) => item.id).join(", "),
    marketing_supplier_id: selectedMarketingItems
      .map((item) => item.supplierId || "")
      .filter(Boolean)
      .join(", "),
    selected_marketing_ids: selectedMarketingIds,
    ...marketingFields,

    // Metadata
    is_renewal: true,
    file_name: (() => {
      let street = propertyData.street;
      street = street.replace(/(\d+)[_\/](\d+)/g, "$1-$2");
      return `${toProperCase(street)} - SAA Renewal`;
    })(),
    file_name_folder: (() => {
      const street = propertyData.street;
      const match = street.match(/^(\d[\d_/\-]*)\s+(.+)$/);
      const formattedStreet = match
        ? `${toProperCase(match[2])} ${match[1]}`
        : toProperCase(street);
      return `${formattedStreet}, ${toProperCase(propertyData.suburb)}`;
    })(),
    file_name_main: (() => {
      let street = propertyData.street;
      street = street.replace(/(\d+)[_\/](\d+)/g, "$1-$2");
      return `${toProperCase(street)} - Sole Agency Agreement (Renewal)`;
    })(),
  } as unknown as SubmissionPayload;

  return payload;
}

/**
 * Submit a renewal to Supabase and the n8n webhook.
 */
export async function submitRenewal(
  formData: RenewalFormData,
  propertyData: RenewalPropertyData,
  selectedMarketingIds: string[],
  availableMarketingItems: MarketingItem[],
  annexureItems?: RenewalAnnexureItem[] | null,
  includeAnnexure?: boolean,
) {
  const payload = buildRenewalPayload(
    formData,
    propertyData,
    selectedMarketingIds,
    availableMarketingItems,
    annexureItems,
    includeAnnexure,
  );

  const supabase = createClient();

  // 1. Authenticate
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  // 2. Save to Supabase (same table as regular SAA, with renewal status)
  const { data: submission, error } = await supabase
    .from("sales_listings")
    .insert({
      user_id: user.id,
      address: `${payload.property_street}, ${payload.property_suburb}`,
      suburb: payload.property_suburb,
      state: payload.property_state,
      postcode: payload.property_postcode,
      status: "renewal",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      payload: payload as any,
      agent_name: payload.agent_name,
      vendor_name: payload.all_vendors_names,
    })
    .select("id, seq_id")
    .single();

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("Failed to save renewal to database: " + error.message);
  }

  console.log(
    "✅ Renewal saved to Supabase. ID:",
    submission.id,
    "Seq:",
    submission.seq_id,
  );

  // 3. Append sequential ID to file_name
  payload.file_name = `${payload.file_name}[${submission.seq_id}]`;

  console.log("📤 Submitting renewal to webhook:", RENEWAL_WEBHOOK_URL);
  console.log("📦 Renewal Payload:", JSON.stringify(payload, null, 2));

  // 4. Send to Webhook (n8n)
  try {
    const response = await fetch(RENEWAL_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(
        `Renewal webhook submission failed: ${response.statusText}`,
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = await response.json();
    return {
      success: true,
      vendorName: payload.all_vendors_names,
      docusignUrl: result.docusign_url,
    };
  } catch (error) {
    console.error("Renewal webhook error:", error);
    throw error;
  }
}
