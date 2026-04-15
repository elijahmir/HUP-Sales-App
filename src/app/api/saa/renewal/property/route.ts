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

/**
 * Parse a VaultRE phone number into country code + local number.
 * VaultRE formats: "0438330792", "+61438330792", "+639665971704"
 *
 * Returns: { countryCode: "61", localNumber: "438330792" }
 */
function parsePhoneNumber(raw: string): {
  countryCode: string;
  localNumber: string;
} {
  // Strip all whitespace and dashes
  const cleaned = raw.replace(/[\s-()]/g, "");

  // International format: +XX... or +XXX...
  // Match +{1-3 digit country code}{rest}
  const intlMatch = cleaned.match(/^\+(\d{1,3})(\d+)$/);
  if (intlMatch) {
    // Common country codes: 61 (AU), 63 (PH), 64 (NZ), 1 (US/CA), 44 (UK)
    // VaultRE is AU-based, so prioritise 2-digit codes for AU region
    const digits = intlMatch[1] + intlMatch[2];

    // Try known 1-digit codes first
    if (digits.startsWith("1") && digits.length >= 11) {
      return { countryCode: "1", localNumber: digits.slice(1) };
    }
    // 2-digit codes (most common: 61 AU, 63 PH, 64 NZ, 44 UK)
    if (digits.length >= 10) {
      const cc2 = digits.slice(0, 2);
      if (["61", "63", "64", "44", "49", "33", "39", "81", "86", "91"].includes(cc2)) {
        let local = digits.slice(2);
        // Strip leading 0 from local part if present (some formats include it)
        local = local.replace(/^0/, "");
        return { countryCode: cc2, localNumber: local };
      }
    }
    // 3-digit codes (e.g., 353 Ireland, 852 HK)
    if (digits.length >= 10) {
      const cc3 = digits.slice(0, 3);
      let local = digits.slice(3);
      local = local.replace(/^0/, "");
      return { countryCode: cc3, localNumber: local };
    }

    // Fallback: treat first 2 digits as country code
    return { countryCode: intlMatch[1], localNumber: intlMatch[2].replace(/^0/, "") };
  }

  // Australian local format: starts with 0
  if (cleaned.startsWith("0")) {
    return { countryCode: "61", localNumber: cleaned.slice(1) };
  }

  // Bare number (no prefix) — assume Australian
  return { countryCode: "61", localNumber: cleaned };
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

    // ── Fetch owners/vendors from VaultRE ────────────────────────
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let vendors: any[] = [];
    const saleLifeId = data.saleLifeId;

    if (saleLifeId) {
      try {
        const ownersRes = await fetch(
          `${baseUrl}/properties/${propertyId}/sale/${saleLifeId}/owners`,
          {
            method: "GET",
            headers: getHeaders(),
            cache: "no-store",
          },
        );

        if (ownersRes.ok) {
          const ownersData = await ownersRes.json();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          vendors = (ownersData.items || []).slice(0, 4).map((owner: any) => {
            // Extract mobile number (typeCode "M")
            const mobileObj = owner.phoneNumbers?.find(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (p: any) => p.typeCode === "M" || p.type === "Mobile",
            );
            // Extract home phone (typeCode "H")
            const homePhoneObj = owner.phoneNumbers?.find(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (p: any) => p.typeCode === "H" || p.type === "Home",
            );

            const ownerAddr = owner.address || {};
            const ownerSuburb = ownerAddr.suburb || {};
            const ownerState = ownerAddr.state || {};

            // Build street from unitNumber + streetNumber + street
            const ownerStreetParts = [
              ownerAddr.unitNumber ? `${ownerAddr.unitNumber}/` : "",
              ownerAddr.streetNumber || "",
              ownerAddr.street ? ` ${ownerAddr.street}` : "",
            ].join("");

            // Parse phone number to extract country code and local number
            const parsedMobile = parsePhoneNumber(mobileObj?.number || "");

            return {
              fullName: owner.displayName || `${owner.firstName || ""} ${owner.lastName || ""}`.trim(),
              email: owner.emails?.[0] || "",
              mobile: parsedMobile.localNumber,
              mobileCountryCode: parsedMobile.countryCode,
              homePhone: homePhoneObj?.number || "",
              street: ownerStreetParts.trim(),
              suburb: ownerSuburb.name || "",
              state: ownerState.abbreviation || "",
              postcode: ownerSuburb.postcode || "",
            };
          });

          console.log(
            `[Renewal] Fetched ${vendors.length} owner(s) from VaultRE for property ${propertyId}`,
          );
        } else {
          console.warn(
            `[Renewal] Failed to fetch owners: ${ownersRes.status}`,
          );
        }
      } catch (ownerError) {
        console.error("[Renewal] Error fetching owners:", ownerError);
      }
    } else {
      console.warn(
        `[Renewal] No saleLifeId for property ${propertyId}, cannot fetch owners`,
      );
    }

    // ── Fetch advertising schedule (property-specific marketing) ──
    let marketingScheduleIds: string[] = [];
    if (saleLifeId) {
      try {
        const scheduleRes = await fetch(
          `${baseUrl}/properties/${propertyId}/sale/${saleLifeId}/advertising/schedule`,
          {
            method: "GET",
            headers: getHeaders(),
            cache: "no-store",
          },
        );

        if (scheduleRes.ok) {
          const scheduleData = await scheduleRes.json();
          // Check for NO_ADVERTISING_SCHEDULE response
          if (scheduleData.schedule && Array.isArray(scheduleData.schedule)) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            marketingScheduleIds = scheduleData.schedule
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              .filter((item: any) => item.expenseType?.id)
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              .map((item: any) => String(item.expenseType.id));

            console.log(
              `[Renewal] Found ${marketingScheduleIds.length} marketing item(s) in advertising schedule for property ${propertyId}`,
            );
          }
        } else {
          console.log(
            `[Renewal] No advertising schedule for property ${propertyId} (${scheduleRes.status})`,
          );
        }
      } catch (scheduleErr) {
        console.warn("[Renewal] Advertising schedule fetch failed (non-critical):", scheduleErr);
      }
    }

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

      // Vendors — fetched live from VaultRE owners endpoint
      vendors,

      // Marketing items — populated client-side from expense types
      marketingItems: [],

      // Property-specific marketing IDs from VaultRE advertising schedule
      marketingScheduleIds,
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
