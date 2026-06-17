import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/offer/properties
 * Fetches VaultRE properties filtered by Listing or Conditional status
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
        const stateFilter = searchParams.get("state") || "";

        // VaultRE caps pagesize at 100, so a single page silently drops any
        // listing beyond the first 100 (see Steph's "Property missing" report —
        // 73b Jones Road, Miena was at position ~112). Page through ALL results
        // so every active listing/conditional property reaches the offer form.
        const PAGE_SIZE = 100;
        const MAX_PAGES = 20; // safety cap (2000 properties) to prevent runaway loops

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const allItems: any[] = [];
        let page = 1;
        let totalPages = 1;

        do {
            const url = new URL(`${baseUrl}/properties/sale`);
            url.searchParams.set("status", "listing,conditional");
            url.searchParams.set("pagesize", String(PAGE_SIZE));
            url.searchParams.set("page", String(page));
            url.searchParams.set("sort", "modified");
            url.searchParams.set("sortOrder", "desc");

            const response = await fetch(url.toString(), {
                method: "GET",
                headers: getHeaders(),
                cache: "no-store",
            });

            if (!response.ok) {
                const text = await response.text();
                console.error(`VaultRE properties fetch failed (page ${page}): ${response.status} - ${text}`);
                // Fail loudly rather than returning a partial list that hides properties
                return NextResponse.json(
                    { error: `VaultRE API error: ${response.status}` },
                    { status: 502 }
                );
            }

            const data = await response.json();
            const pageItems = data.items || [];
            allItems.push(...pageItems);

            // Determine how many pages exist (VaultRE returns totalPages/totalItems)
            totalPages = data.totalPages || Math.ceil((data.totalItems || allItems.length) / PAGE_SIZE) || 1;

            // Stop early if a page comes back empty (defensive against bad totals)
            if (pageItems.length === 0) break;

            page += 1;
        } while (page <= totalPages && page <= MAX_PAGES);

        if (totalPages > MAX_PAGES) {
            console.warn(`VaultRE returned ${totalPages} pages; capped at ${MAX_PAGES}. Some properties may be omitted.`);
        }

        // Filter to SALE listings only — exclude commercial lease-only properties.
        // VaultRE's Property schema includes a `commercialListingType` field
        // (enum: "sale" | "lease" | "both") on commercial properties.
        // Residential/land properties don't set this field, so they always pass.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const items = allItems.filter((item: any) => {
            const listingType = (item.commercialListingType || "").toLowerCase();
            // Exclude lease-only commercial listings
            if (listingType === "lease") return false;
            return true;
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const properties = items.map((item: any) => {
            // Build display address
            const addr = item.address || {};
            const parts = [
                addr.unitNumber ? `${addr.unitNumber}/` : "",
                addr.streetNumber || "",
                addr.street ? ` ${addr.street}` : "",
            ].join("");
            const suburb = addr.suburb?.name || "";
            const state = addr.state?.abbreviation || "";
            const postcode = addr.postcode || "";

            // Try to get main image from photos array
            let mainImageUrl = "";
            if (item.photos && item.photos.length > 0) {
                mainImageUrl = item.photos[0]?.url || item.photos[0]?.thumbnailUrl || "";
            } else if (item.mainPhoto) {
                mainImageUrl = item.mainPhoto.url || item.mainPhoto.thumbnailUrl || "";
            }

            // Contact staff details
            const mappedStaff = (item.contactStaff || [])
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .map((s: any) => {
                    // Find a mobile number if it exists
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const mobileObj = s.phoneNumbers?.find((p: any) => p.typeCode === "M" || p.type === "Mobile");
                    return {
                        id: s.id,
                        firstName: s.firstName || "",
                        lastName: s.lastName || "",
                        position: s.position || s.role || "",
                        photoUrl: s.photo?.thumb_360 || s.photo?.original || "",
                        mobile: mobileObj?.number || "",
                        email: s.email || "",
                    };
                });

            return {
                id: item.id,
                displayAddress: item.displayAddress || `${parts}, ${suburb} ${state} ${postcode}`.trim(),
                street: `${parts}`.trim(),
                suburb,
                state,
                postcode,
                status: item.saleLife?.status || item.status || "unknown",
                propertyClass: item.class?.name || "Unknown",
                bed: item.bed || null,
                bath: item.bath || null,
                garages: item.garages || null,
                landArea: item.landArea ? `${item.landArea.amount} ${item.landArea.unit || ""}`.trim() : null,
                floorArea: item.floorArea ? `${item.floorArea.amount} ${item.floorArea.unit || ""}`.trim() : null,
                searchPrice: item.searchPrice || null,
                priceText: item.priceText || null,
                mainImageUrl,
                contactStaff: mappedStaff,
            };
        });

        // Optionally filter by state on server side
        const finalProperties = stateFilter
            ? properties.filter((p: { state: string }) => p.state.toLowerCase() === stateFilter.toLowerCase())
            : properties;

        return NextResponse.json({ properties: finalProperties, total: finalProperties.length });
    } catch (error) {
        console.error("Error fetching offer properties:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to fetch properties" },
            { status: 500 }
        );
    }
}
