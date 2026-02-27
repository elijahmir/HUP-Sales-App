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

        // Fetch properties with status: listing, conditional only
        const url = new URL(`${baseUrl}/properties/residential/sale`);
        url.searchParams.set("status", "listing,conditional");
        url.searchParams.set("pagesize", "100");
        url.searchParams.set("page", "1");
        url.searchParams.set("sort", "modified");
        url.searchParams.set("sortOrder", "desc");

        const response = await fetch(url.toString(), {
            method: "GET",
            headers: getHeaders(),
            cache: "no-store",
        });

        if (!response.ok) {
            const text = await response.text();
            console.error(`VaultRE properties fetch failed: ${response.status} - ${text}`);
            return NextResponse.json(
                { error: `VaultRE API error: ${response.status}` },
                { status: 502 }
            );
        }

        const data = await response.json();
        const items = data.items || [];

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

            // Contact staff names
            const contactStaffNames = (item.contactStaff || [])
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .map((s: any) => `${s.firstName || ""} ${s.lastName || ""}`.trim())
                .filter(Boolean)
                .join(", ");

            return {
                id: item.id,
                displayAddress: item.displayAddress || `${parts}, ${suburb} ${state} ${postcode}`.trim(),
                street: `${parts}`.trim(),
                suburb,
                state,
                postcode,
                status: item.saleLife?.status || item.status || "unknown",
                bed: item.bed || null,
                bath: item.bath || null,
                garages: item.garages || null,
                landArea: item.landArea ? `${item.landArea.amount} ${item.landArea.unit || ""}`.trim() : null,
                floorArea: item.floorArea ? `${item.floorArea.amount} ${item.floorArea.unit || ""}`.trim() : null,
                searchPrice: item.searchPrice || null,
                priceText: item.priceText || null,
                mainImageUrl,
                contactStaff: contactStaffNames,
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
