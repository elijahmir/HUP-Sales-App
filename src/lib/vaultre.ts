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
 * Full property details for display in duplicate modal
 */
export interface PropertyDetails {
  id: number;
  displayAddress: string;
  unitNumber?: string;
  status?: string;
  bed?: number;
  bath?: number;
  garages?: number;
  contactStaff?: { id: number; firstName?: string; lastName?: string }[];
  appraisalPriceLower?: number;
  appraisalPriceUpper?: number;
  created?: string;
  modified?: string;
}

/**
 * Fetch full property details by ID
 */
export async function getPropertyDetails(
  propertyId: number,
): Promise<PropertyDetails | null> {
  try {
    const { baseUrl } = getConfig();

    const response = await fetch(
      `${baseUrl}/properties/residential/sale/${propertyId}`,
      {
        method: "GET",
        headers: getHeaders(),
        cache: "no-store",
      },
    );

    if (!response.ok) {
      console.error(
        `Failed to fetch property ${propertyId}: ${response.status}`,
      );
      return null;
    }

    const data = await response.json();

    // Log raw address for debugging
    console.log(`  [${propertyId}] Raw address:`, JSON.stringify(data.address));

    return {
      id: data.id,
      displayAddress: data.displayAddress || "",
      unitNumber: data.address?.unitNumber || "",
      status: data.saleLife?.status || data.status,
      bed: data.bed,
      bath: data.bath,
      garages: data.garages,
      contactStaff: data.contactStaff,
      appraisalPriceLower: data.appraisalPriceLower,
      appraisalPriceUpper: data.appraisalPriceUpper,
      created: data.created,
      modified: data.modified,
    };
  } catch (error) {
    console.error("Failed to get property details:", error);
    return null;
  }
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

  try {
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
    // STRATEGY UPDATE: Search for "StreetNo StreetName" first to avoid pagination limits
    // e.g. "568 Preston Road" instead of just "Preston Road"
    let candidates: PropertySearchResult[] = [];

    try {
      // Search 1: Specific "Number Street" (Most accurate)
      if (targetStreetNo) {
        const specificSearch = `${targetStreetNo} ${targetNameRaw}`;
        console.log(
          `VaultRE Search: searching for specific "${specificSearch}"`,
        );
        const resSpecific = await searchPropertyByAddress(specificSearch);
        console.log(
          `VaultRE Search: returned ${resSpecific.items.length} results from "${specificSearch}"`,
        );
        candidates = [...resSpecific.items];
      }

      // Search 2: If specific search failed/empty, fallback to Street Name only
      if (candidates.length === 0) {
        console.log(
          `VaultRE Search: specific search empty, falling back to "${targetNameRaw}"`,
        );
        const resBroad = await searchPropertyByAddress(targetNameRaw);
        console.log(
          `VaultRE Search: returned ${resBroad.items.length} results from "${targetNameRaw}"`,
        );
        candidates = [...resBroad.items];
      }
    } catch (error) {
      console.error("Search failed, trying fallback:", error);
      // Fallback if specific search errors out
      try {
        const resBroader = await searchPropertyByAddress(targetNameRaw);
        candidates = [...resBroader.items];
      } catch (e) {
        console.error("Broad search also failed", e);
      }
    }

    console.log(`Found ${candidates.length} candidates. Filtering...`);
    console.log(
      `Target: unit="${targetUnit}" streetNo="${targetStreetNo}" street="${targetStreetName}" suburb="${targetSuburb}"`,
    );

    const exactMatches: PropertySearchResult[] = [];
    const addressMatchCandidates: PropertySearchResult[] = [];

    // 3. First pass: Filter by street/suburb/number (ignore unit from search - it's unreliable)
    for (const p of candidates) {
      if (!p.address) continue;

      const vaultStreetName = normalizeAndExpand(p.address.street || "");
      const vaultStreetNo = (p.address.streetNumber || "").toString().trim();
      const vaultSuburb = (p.address.suburb?.name || "").toLowerCase().trim();

      // Check Suburb
      if (vaultSuburb !== targetSuburb) continue;
      // Check Street Name
      if (vaultStreetName !== targetStreetName) continue;
      // Check Street Number
      if (vaultStreetNo !== targetStreetNo) continue;

      // Address matches! Add to candidates for unit check
      console.log(`  [${p.id}]: Address match - need to verify unit`);
      addressMatchCandidates.push(p);
    }

    // 4. Second pass: Fetch full details to get actual unit from displayAddress
    console.log(
      `Verifying unit for ${addressMatchCandidates.length} address matches...`,
    );

    for (const p of addressMatchCandidates) {
      const details = await getPropertyDetails(p.id);
      if (!details) {
        console.log(`  [${p.id}]: Failed to fetch details, skipping`);
        continue;
      }

      // Use address.unitNumber from full API response (not displayAddress which is unreliable)
      const actualUnit = (details.unitNumber || "").toString().trim();

      console.log(
        `  [${p.id}]: address="${details.displayAddress}" unitNumber="${actualUnit}" target="${targetUnit}"`,
      );

      // Check Unit - STRICT EXACT MATCHING
      if (actualUnit !== targetUnit) {
        console.log(`    SKIP: unit mismatch`);
        continue;
      }

      console.log(`    EXACT MATCH FOUND!`);
      exactMatches.push(p);
    }

    return {
      exists: exactMatches.length > 0,
      matches: exactMatches,
      property: exactMatches[0],
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
 * Update an existing property in VaultRE
 * Uses PUT /properties/residential/sale/{id}
 */
export async function updateProperty(
  propertyId: number,
  data: CreateAppraisalData,
): Promise<{ success: boolean; propertyId?: number; error?: string }> {
  const { baseUrl } = getConfig();

  const response = await fetch(
    `${baseUrl}/properties/residential/sale/${propertyId}`,
    {
      method: "PUT",
      headers: getHeaders(),
      cache: "no-store",
      body: JSON.stringify(data),
    },
  );

  if (!response.ok) {
    const text = await response.text();
    return {
      success: false,
      error: `Failed to update property: ${response.status} - ${text}`,
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
