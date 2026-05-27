/**
 * GET /api/missing-millions/vaultre/search?term=...&pagesize=20&page=1
 *
 * VaultRE address search proxy. Reuses existing VaultRE client.
 */

import { type NextRequest, NextResponse } from "next/server";
import { searchPropertyByAddress } from "@/lib/vaultre";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const term = searchParams.get("term") ?? "";
  const pageSize = parseInt(searchParams.get("pagesize") ?? "20", 10);
  const page = parseInt(searchParams.get("page") ?? "1", 10);

  if (!term || term.length < 2) {
    return NextResponse.json(
      { error: "Search term must be at least 2 characters" },
      { status: 400 },
    );
  }

  try {
    const data = await searchPropertyByAddress(term, page, pageSize);

    const items = data.items.map((p) => ({
      id: p.id,
      displayAddress: p.displayAddress || "",
      streetNumber: p.address?.streetNumber ?? "",
      street: p.address?.street ?? "",
      suburb: p.address?.suburb?.name ?? "",
      saleStatus: p.saleLife?.status ?? null,
      portalStatus: p.saleLife?.portalStatus ?? null,
    }));

    return NextResponse.json({
      items,
      totalItems: data.totalItems,
      totalPages: data.totalPages,
      page,
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
