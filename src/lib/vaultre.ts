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
    cache: "no-store", // Prevent Next.js caching
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`VaultRE search failed: ${response.status} - ${text}`);
  }

  return response.json();
}

// Suffix Expansion Map
const SUFFIXES: Record<string, string> = {
  st: "street",
  rd: "road",
  pl: "place",
  ave: "avenue",
  dr: "drive",
  cl: "close",
  ct: "court",
  ln: "lane",
  cres: "crescent",
  pde: "parade",
  hwy: "highway",
  tce: "terrace",
};

/**
 * Normalize street name with suffix expansion
 * e.g. "Moonbeam Pl" -> "moonbeamplace"
 */
function normalizeAndExpand(name: string): string {
  if (!name) return "";
  const lower = name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .trim();
  const parts = lower.split(/\s+/);

  if (parts.length > 1) {
    const last = parts[parts.length - 1];
    if (SUFFIXES[last]) {
      parts[parts.length - 1] = SUFFIXES[last];
    }
  }

  return parts.join("").replace(/[^a-z0-9]/g, "");
}

/**
 * OPTIMIZED CHECK: Search by Expanded Street Name
 * Uses /search/properties/address API for O(1) performance
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
  property?: PropertySearchResult;
}> {
  console.log("Checking property exists (Fast):", addressComponents);

  const {
    unit: targetUnitRaw,
    street_number: targetNumberRaw,
    street_name: targetNameRaw,
    suburb: targetSuburbRaw,
  } = addressComponents;

  // 1. Normalize Inputs
  const targetStreetName = normalizeAndExpand(targetNameRaw);
  const targetStreetNo = (targetNumberRaw || "").toString().trim();
  const targetUnit = (targetUnitRaw || "").toString().trim();
  const targetSuburb = (targetSuburbRaw || "").toLowerCase().trim();

  // 2. Perform Targeted Search
  // We search for the street name (expanded) to get a list of candidates
  // e.g. "Moonbeam Pl" -> "moonbeamplace" -> Search "Moonbeam Place"
  // VaultRE search matches on partial address, so searching street name is safest
  const searchTerm = targetNameRaw
    .replace(" Pl", " Place")
    .replace(" St", " Street")
    .replace(" Rd", " Road"); // Simple pre-expansion for search term

  // Actually, let's use the raw street name first, but if it has known abbreviation, try expanded
  // Use the API search
  let candidates: PropertySearchResult[] = [];

  try {
    // Search 1: Exact Street Name provided
    const res1 = await searchPropertyByAddress(targetNameRaw);
    candidates = [...res1.items];

    // Search 2: If no matches, try Expanded Street Name (if different)
    const expandedName = normalizeAndExpand(targetNameRaw); // returns "moonbeamplace"
    // We need a human-readable expanded name for search?
    // normalizeAndExpand returns "moonbeamplace". API might need "Moonbeam Place".
    // Let's use the simple suffix map substitution for the SEARCH TERM
    let expandedSearchTerm = targetNameRaw;
    const parts = targetNameRaw.split(/\s+/);
    if (parts.length > 1) {
      const last = parts[parts.length - 1].toLowerCase();
      if (SUFFIXES[last]) {
        parts[parts.length - 1] = SUFFIXES[last]; // e.g. "place"
        // Capitalize? Vault search is case insensitive usually
        expandedSearchTerm = parts.join(" ");
      }
    }

    if (expandedSearchTerm.toLowerCase() !== targetNameRaw.toLowerCase()) {
      console.log(`Searching expanded term: "${expandedSearchTerm}"`);
      const res2 = await searchPropertyByAddress(expandedSearchTerm);
      // Merge unique candidates
      const existingIds = new Set(candidates.map((c) => c.id));
      for (const item of res2.items) {
        if (!existingIds.has(item.id)) {
          candidates.push(item);
        }
      }
    }

    console.log(`Found ${candidates.length} candidates. Filtering...`);

    const matches: PropertySearchResult[] = [];

    // 3. Filter Candidates Strictly
    for (const p of candidates) {
      if (!p.address) continue;

      const vaultStreetName = normalizeAndExpand(p.address.street || "");
      const vaultStreetNo = (p.address.streetNumber || "").toString().trim();
      const vaultUnit = (p.address.unitNumber || "").toString().trim();
      const vaultSuburb = (p.address.suburb?.name || "").toLowerCase().trim();

      // Debug log for potential matches
      if (vaultStreetNo === targetStreetNo) {
        console.log(
          `Candidate [${p.id}]: ${p.displayAddress} | Suburb: ${vaultSuburb} vs ${targetSuburb}`,
        );
      }

      // Check Suburb
      if (vaultSuburb !== targetSuburb) continue;

      // Check Street Name (Normalized)
      if (vaultStreetName !== targetStreetName) continue;

      // Check Street Number
      if (vaultStreetNo !== targetStreetNo) continue;

      // Check Unit (Allow exact match or both empty)
      if (vaultUnit !== targetUnit) continue;

      matches.push(p);
    }

    return {
      exists: matches.length > 0,
      matches,
      property: matches[0], // Frontend expects this for the modal
    };
  } catch (error) {
    console.error("Fast search failed:", error);
    // Fail safe? Or throw?
    throw error;
  }
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
    cache: "no-store",
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
