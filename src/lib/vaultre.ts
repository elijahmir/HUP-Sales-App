/**
 * VaultRE API Client
 * Handles property search and appraisal creation
 *
 * CRITICAL: This client has NO delete methods.
 * Deletion from VaultRE is strictly prohibited.
 */

import { getAgentByName, VAULTRE_AGENTS } from "@/data/vaultre-agents";

// Types
export interface VaultREAddress {
  unitNumber?: string;
  streetNumber?: string;
  street?: string;
  suburb?: { id: number; name: string };
  state?: { id: number; name: string; abbreviation: string };
  country?: { id: number; name: string };
}

export interface PropertySearchResult {
  id: number;
  displayAddress: string;
  address: VaultREAddress;
  saleLife?: {
    id: number;
    status: string;
    portalStatus: string;
  };
  leaseLife?: {
    id: number;
    status: string;
    portalStatus: string;
  };
}

export interface VaultRESearchResponse {
  items: PropertySearchResult[];
  totalItems: number;
  totalPages: number;
}

export interface CreateAppraisalData {
  address: {
    unitNumber?: string;
    streetNumber: string;
    street: string;
    suburb: { id: number };
  };
  status: "appraisal";
  contactStaff: { id: number }[];
  bed?: number;
  bath?: number;
  garages?: number;
  appraisalPriceLower?: number;
  appraisalPriceUpper?: number;
  landArea?: { amount: number; unit: string };
  floorArea?: { amount: number; unit: string };
  yearBuilt?: number;
  description?: string;
  appraisal?: string; // ISO 8601 date string
  editableBy?: { id: number }[];
  accessBy?: { id: number }[];
  type: { id: number }; // Required by VaultRE
}

// API Configuration
function getConfig() {
  const apiKey = process.env.VAULTRE_API_KEY;
  const bearerToken = process.env.VAULTRE_BEARER_TOKEN;
  const baseUrl = process.env.VAULTRE_BASE_URL;

  if (!apiKey || !bearerToken || !baseUrl) {
    throw new Error("VaultRE API credentials not configured");
  }

  return { apiKey, bearerToken, baseUrl };
}

function getHeaders() {
  const { apiKey, bearerToken } = getConfig();
  return {
    "Content-Type": "application/json",
    "X-Api-Key": apiKey,
    Authorization: `Bearer ${bearerToken}`,
  };
}

/**
 * Test API connection by fetching first page of properties
 */
export async function testConnection(): Promise<{
  success: boolean;
  message: string;
  totalProperties?: number;
}> {
  try {
    const { baseUrl } = getConfig();
    const response = await fetch(
      `${baseUrl}/properties/residential/sale?pagesize=1`,
      {
        method: "GET",
        headers: getHeaders(),
      },
    );

    if (!response.ok) {
      const text = await response.text();
      return {
        success: false,
        message: `API Error: ${response.status} - ${text}`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      message: "VaultRE API connection successful",
      totalProperties: data.totalItems,
    };
  } catch (error) {
    return {
      success: false,
      message: `Connection failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

/**
 * Search for properties by address term
 * Uses structured address matching for precise duplicate detection
 */
export async function searchPropertyByAddress(
  searchTerm: string,
  page: number = 1,
  pageSize: number = 50,
): Promise<VaultRESearchResponse> {
  const { baseUrl } = getConfig();

  const url = new URL(`${baseUrl}/search/properties/address`);
  url.searchParams.set("term", searchTerm);
  url.searchParams.set("page", page.toString());
  url.searchParams.set("pagesize", pageSize.toString());

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: getHeaders(),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`VaultRE search failed: ${response.status} - ${text}`);
  }

  return response.json();
}

/**
 * EXHAUSTIVE CHECK: Search by Suburb ID + Pagination
 * Matches n8n workflow logic to ensure no duplicates are missed.
 */
export async function checkPropertyExists(addressComponents: {
  unit?: string;
  street_number: string;
  street_name: string;
  suburb: string;
  postcode?: string;
}): Promise<{
  exists: boolean;
  matches: PropertySearchResult[];
}> {
  console.log("Checking property exists (Exhaustive):", addressComponents);

  // 1. Get Suburb ID
  const suburbs = await searchSuburbs(addressComponents.suburb);
  const targetSuburb = suburbs.find(
    (s) =>
      s.name.toLowerCase() === addressComponents.suburb.toLowerCase() &&
      (addressComponents.postcode
        ? s.postcode === addressComponents.postcode
        : true),
  );

  if (!targetSuburb) {
    console.log("Suburb not found, falling back to basic search");
    // Fallback? Or just return false?
    // If suburb doesn't exist in Vault, property likely doesn't either.
    return { exists: false, matches: [] };
  }

  // 2. Fetch ALL properties in suburb using generic /properties endpoint
  const { baseUrl } = getConfig();
  const matches: PropertySearchResult[] = [];
  let page = 1;
  const pageSize = 100;
  let hasMore = true;
  const MAX_PAGES = 50; // Check up to 5000 properties - should cover any suburb

  // --- 1. Extract & Parse Target Address (n8n Logic) ---
  const rawStreet = [
    addressComponents.street_number,
    addressComponents.street_name,
  ]
    .filter(Boolean)
    .join(" ");

  // Regex to capture the full number part (e.g. "1/60" or "24") and the street name
  const streetMatch = rawStreet.match(/^([\d/]+)\s*(.*)$/);

  let targetUnit = "";
  let targetStreetNo = "";
  let targetStreetName = rawStreet; // Default fallback

  if (streetMatch) {
    const fullNumber = streetMatch[1].trim(); // "1/60" or "24"
    // n8n logic: toLowerCase().replace(/[^a-z0-9]/g, '').trim()
    targetStreetName = streetMatch[2]
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .trim();

    if (fullNumber.includes("/")) {
      // Split "1/60" -> Unit 1, Number 60
      const parts = fullNumber.split("/");
      targetUnit = parts[0];
      targetStreetNo = parts[1];
    } else {
      // Just "24" -> Unit Empty, Number 24
      targetStreetNo = fullNumber;
    }
  } else {
    // Fallback if regex fails (unlikely given join space)
    targetStreetName = rawStreet
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .trim();
  }

  // Debug logging for n8n Logic
  console.log("n8n Logic Target:", {
    targetUnit,
    targetStreetNo,
    targetStreetName,
  });

  while (hasMore) {
    // UPDATED: Use generic /properties endpoint to cover all property types
    const url = new URL(`${baseUrl}/properties`);
    url.searchParams.set("suburbs", targetSuburb.id.toString());
    url.searchParams.set("page", page.toString());
    url.searchParams.set("pagesize", pageSize.toString());
    url.searchParams.set("sort", "modified");
    url.searchParams.set("sortOrder", "desc");

    try {
      const res = await fetch(url.toString(), {
        method: "GET",
        headers: getHeaders(),
      });

      if (!res.ok) break;

      const data = await res.json();
      const items = data.items || [];

      if (items.length === 0) {
        hasMore = false;
        break;
      }

      for (const p of items) {
        if (!p.address) continue;

        // n8n Logic: Parsing Vault Address directly
        const vaultStreetName = (p.address.street || "")
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "")
          .trim();
        const vaultStreetNo = (p.address.streetNumber || "").toString().trim();
        const vaultUnit = (p.address.unitNumber || "").toString().trim();

        // CHECK 2: Street Name
        if (vaultStreetName !== targetStreetName) continue;

        // CHECK 3: Unit & Street Number
        // Explicit comparison
        if (vaultStreetNo === targetStreetNo && vaultUnit === targetUnit) {
          matches.push(p);
        }
      }

      if (page >= data.totalPages) hasMore = false;
      page++;

      if (page > MAX_PAGES) hasMore = false;
    } catch (e) {
      console.error("Exhaustive search error:", e);
      break;
    }
  }

  return { exists: matches.length > 0, matches: matches };
}

// REMOVED: normalizeStreetType (Incompatible with n8n logic)

/**
 * Create a new appraisal in VaultRE
 * NOTE: No delete functionality - must be deleted manually in VaultRE
 */
export async function createAppraisal(
  data: CreateAppraisalData,
): Promise<{ success: boolean; propertyId?: number; error?: string }> {
  const { baseUrl } = getConfig();

  const response = await fetch(`${baseUrl}/properties/residential/sale`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const text = await response.text();
    return {
      success: false,
      error: `Failed to create appraisal: ${response.status} - ${text}`,
    };
  }

  const result = await response.json();
  return {
    success: true,
    propertyId: result.id,
  };
}

/**
 * Search for suburbs to get their ID
 * VaultRE requires suburb ID for property creation
 */
export async function searchSuburbs(
  term: string,
): Promise<{ id: number; name: string; postcode: string; state: string }[]> {
  const { baseUrl } = getConfig();

  // Endpoint from OpenApi spec: GET /suggest/suburb (Matches n8n flow)
  const url = new URL(`${baseUrl}/suggest/suburb`);
  url.searchParams.set("term", term);
  url.searchParams.set("pagesize", "10");

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: getHeaders(),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error(`Suburb search failed: ${response.status} - ${text}`);
    return [];
  }

  const data = await response.json();

  // Map response to simplified format
  return (data.items || []).map((item: any) => ({
    id: item.id,
    name: item.name,
    postcode: item.postcode,
    state: item.state?.abbreviation || "",
  }));
}
