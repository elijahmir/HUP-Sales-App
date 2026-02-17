import { getExpenseTypes } from "@/lib/vaultre";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const data = await getExpenseTypes();
    return NextResponse.json(data);
  } catch (error) {
    console.error("VaultRE expense types API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch expense types" },
      { status: 500 },
    );
  }
}
