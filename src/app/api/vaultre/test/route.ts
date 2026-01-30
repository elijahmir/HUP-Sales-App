/**
 * VaultRE API Test Endpoint
 * Tests the connection and returns property count
 */

import { testConnection, searchPropertyByAddress } from "@/lib/vaultre";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Test basic connection
    const connectionResult = await testConnection();

    if (!connectionResult.success) {
      return NextResponse.json(connectionResult, { status: 500 });
    }

    // Also try a sample search to verify search works
    const searchResult = await searchPropertyByAddress("Devonport", 1, 5);

    return NextResponse.json({
      ...connectionResult,
      sampleSearch: {
        term: "Devonport",
        resultsCount: searchResult.items.length,
        totalItems: searchResult.totalItems,
        firstResult: searchResult.items[0]
          ? {
              id: searchResult.items[0].id,
              displayAddress: searchResult.items[0].displayAddress,
              status: searchResult.items[0].saleLife?.status,
            }
          : null,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
