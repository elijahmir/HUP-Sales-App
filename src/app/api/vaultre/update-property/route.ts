import {
  updateProperty,
  CreateAppraisalData,
  searchSuburbs,
} from "@/lib/vaultre";
import { getAgentByName } from "@/data/vaultre-agents";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { propertyId, formData } = body;

    if (!propertyId) {
      return NextResponse.json(
        { error: "Property ID is required" },
        { status: 400 },
      );
    }

    // Validate required fields
    if (!formData.listing_agent) {
      return NextResponse.json(
        { error: "Listing agent is required" },
        { status: 400 },
      );
    }

    if (
      !formData.address_components ||
      !formData.address_components.street_name
    ) {
      return NextResponse.json(
        { error: "Valid address is required" },
        { status: 400 },
      );
    }

    // Get agent ID
    const agent = getAgentByName(formData.listing_agent);
    if (!agent) {
      return NextResponse.json(
        {
          error: `Agent '${formData.listing_agent}' not found in VaultRE mapping`,
        },
        { status: 400 },
      );
    }

    // Map form data to VaultRE schema
    const addr = formData.address_components;

    // Lookup Suburb ID
    const suburbs = await searchSuburbs(addr.suburb);

    let suburbId: number | undefined;

    if (suburbs.length === 0) {
      return NextResponse.json(
        { error: `Suburb '${addr.suburb}' not found in VaultRE` },
        { status: 400 },
      );
    }

    // Try to match with postcode if available
    if (addr.postcode) {
      const match = suburbs.find((s) => s.postcode === addr.postcode);
      if (match) suburbId = match.id;
    }

    // If no postcode match or no postcode provided, use the first result
    if (!suburbId) {
      suburbId = suburbs[0].id;
    }

    const updateData: CreateAppraisalData = {
      address: {
        unitNumber: addr.unit || undefined,
        streetNumber: addr.street_number,
        street: addr.street_name,
        suburb: { id: suburbId },
      },
      status: "appraisal",
      contactStaff: [{ id: agent.id }],
      bed: formData.bedrooms_icon_count ?? 0,
      bath: formData.bathrooms_icon_count ?? 0,
      garages: formData.parking_icon_count ?? 0,
      appraisalPriceLower: formData.price?.range_from
        ? parseInt(formData.price.range_from)
        : undefined,
      appraisalPriceUpper: formData.price?.range_to
        ? parseInt(formData.price.range_to)
        : undefined,
      landArea: formData.land_size
        ? { amount: parseFloat(formData.land_size), unit: "sqm" }
        : undefined,
      floorArea: formData.building_size
        ? { amount: parseFloat(formData.building_size), unit: "sqm" }
        : undefined,
      yearBuilt: formData.year_built
        ? parseInt(formData.year_built)
        : undefined,
      description: formData.handwritten_notes_section || undefined,
      appraisal: formData.appraisal_date
        ? new Date(formData.appraisal_date).toISOString()
        : undefined,
      type: { id: 1 }, // Default to House/Residential
    };

    const result = await updateProperty(propertyId, updateData);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      id: result.propertyId,
    });
  } catch (error) {
    console.error("Property update error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
