import { checkPropertyExists } from "@/lib/vaultre";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { street_number, street_name, suburb, unit, postcode } = body;

    if (!street_number || !street_name || !suburb) {
      return NextResponse.json(
        { error: "Missing required address fields" },
        { status: 400 },
      );
    }

    const result = await checkPropertyExists({
      unit,
      street_number,
      street_name,
      suburb,
      postcode,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Property search error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
