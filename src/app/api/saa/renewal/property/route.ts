import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/saa/renewal/property?id={propertyId}
 * Fetches detailed property data from VaultRE for a single property.
 * Returns property details, sale info, contact staff, and pricing data
 * needed to pre-populate the SAA renewal form (read-only).
 */

function getVaultREConfig() {
  const apiKey = process.env.VAULTRE_API_KEY;
  const bearerToken = process.env.VAULTRE_BEARER_TOKEN;
  const baseUrl = process.env.VAULTRE_BASE_URL;

  if (!apiKey || !bearerToken || !baseUrl) {
    throw new Error("VaultRE API credentials not configured");
  }

  return { apiKey, bearerToken, baseUrl };
}

function getHeaders() {
  const { apiKey, bearerToken } = getVaultREConfig();
  return {
    "Content-Type": "application/json",
    "X-Api-Key": apiKey,
    Authorization: `Bearer ${bearerToken}`,
  };
}

export async function GET(request: NextRequest) {
  try {
    const { baseUrl } = getVaultREConfig();
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get("id");

    if (!propertyId) {
      return NextResponse.json(
        { error: "Property ID is required" },
        { status: 400 },
      );
    }

    // Fetch extended property details from VaultRE
    const response = await fetch(
      `${baseUrl}/properties/residential/sale/${propertyId}`,
      {
        method: "GET",
        headers: getHeaders(),
        cache: "no-store",
      },
    );

    if (!response.ok) {
      const text = await response.text();
      console.error(
        `VaultRE property detail fetch failed: ${response.status} - ${text}`,
      );
      return NextResponse.json(
        { error: `VaultRE API error: ${response.status}` },
        { status: 502 },
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = await response.json();

    // ── Map address ──────────────────────────────────────────────
    const addr = data.address || {};
    const streetParts = [
      addr.unitNumber ? `${addr.unitNumber}/` : "",
      addr.streetNumber || "",
      addr.street ? ` ${addr.street}` : "",
    ].join("");
    const suburb = addr.suburb?.name || "";
    const state = addr.state?.abbreviation || "";
    const postcode = addr.postcode || "";

    // ── Map main image ──────────────────────────────────────────
    let mainImageUrl = "";
    if (data.photos && data.photos.length > 0) {
      mainImageUrl =
        data.photos[0]?.url || data.photos[0]?.thumbnailUrl || "";
    }

    // ── Map contact staff (agents) ──────────────────────────────
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const contactStaff = (data.contactStaff || []).map((s: any) => {
      // Find mobile number
      const mobileObj = s.phoneNumbers?.find(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (p: any) => p.typeCode === "M" || p.type === "Mobile",
      );
      return {
        id: s.id,
        firstName: s.firstName || "",
        lastName: s.lastName || "",
        position: s.position || s.role || "",
        photoUrl: s.photo?.thumb_360 || s.photo?.original || "",
        email: s.email || "",
        mobile: mobileObj?.number || "",
      };
    });

    // ── Build response ──────────────────────────────────────────
    const propertyDetail = {
      id: data.id,
      displayAddress:
        data.displayAddress ||
        `${streetParts}, ${suburb} ${state} ${postcode}`.trim(),
      street: streetParts.trim(),
      suburb,
      state,
      postcode,
      propertyClass: data.class?.name || "Unknown",

      // Features
      bed: data.bed || null,
      bath: data.bath || null,
      garages: data.garages || null,
      landArea: data.landArea
        ? `${data.landArea.amount} ${data.landArea.unit || ""}`.trim()
        : null,
      floorArea: data.floorArea
        ? `${data.floorArea.amount} ${data.floorArea.unit || ""}`.trim()
        : null,

      // Listing
      status: data.saleLife?.status || data.status || "unknown",
      searchPrice: data.searchPrice || null,
      displayPrice: data.displayPrice || null,
      mainImageUrl,

      // Title details
      volumeNumber: data.volumeNumber || "",
      folioNumber: data.folioNumber || "",
      certificateOfTitle: data.certificateOfTitle || "",
      referenceID: data.referenceID || "",
      listingNo: data.referenceID || "",

      // Commission
      sellingFeePercent: data.sellingFeePercent || null,
      sellingFeeFixed: data.sellingFeeFixed || null,
      vpa: data.vpa || null,

      // Authority dates
      authorityStart: data.authorityStart || null,
      authorityEnd: data.authorityEnd || null,

      // Staff
      contactStaff,

      // Vendors — will be populated from previous SAA submissions
      // or from VaultRE account contacts (future enhancement)
      vendors: [],

      // Marketing items — populated client-side from expense types
      marketingItems: [],
    };

    return NextResponse.json({ property: propertyDetail });
  } catch (error) {
    console.error("Error fetching renewal property details:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch property details",
      },
      { status: 500 },
    );
  }
}
