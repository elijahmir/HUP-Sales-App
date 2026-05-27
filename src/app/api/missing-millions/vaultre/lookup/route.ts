/**
 * POST /api/missing-millions/vaultre/lookup
 *
 * Server-side proxy for VaultRE property + contact lookup.
 * Reuses existing VaultRE client from src/lib/vaultre.ts.
 *
 * Request: { address: string, suburb: string, vendorName?: string }
 * Response: { propertyFound, appraisalStatus, contactFound, agentContact, matchScore, vaultreStatus, vaultreId }
 */

import { type NextRequest, NextResponse } from "next/server";
import { searchPropertyByAddress } from "@/lib/vaultre";

function normalise(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function addressScore(a: string, b: string): number {
  const ta = new Set(normalise(a).split(" "));
  const tb = new Set(normalise(b).split(" "));
  const intersection = [...ta].filter((t) => tb.has(t)).length;
  const union = new Set([...ta, ...tb]).size;
  return union === 0 ? 0 : intersection / union;
}

export async function POST(request: NextRequest) {
  let body: { address?: string; suburb?: string; vendorName?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const { address, suburb, vendorName } = body;
  if (!address) {
    return NextResponse.json(
      { error: "address is required" },
      { status: 400 },
    );
  }

  // Step 1: Search properties by address via existing VaultRE client
  const searchTerm = suburb ? `${address} ${suburb}` : address;
  let bestProperty: {
    id: number;
    displayAddress: string;
    saleLife?: { status?: string };
  } | null = null;
  let bestScore = 0;

  try {
    const searchRes = await searchPropertyByAddress(searchTerm, 1, 20);
    for (const prop of searchRes.items) {
      const vaultAddr = prop.displayAddress || "";
      const score = addressScore(address, vaultAddr);
      if (score > bestScore) {
        bestScore = score;
        bestProperty = {
          id: prop.id,
          displayAddress: vaultAddr,
          saleLife: prop.saleLife,
        };
      }
    }
  } catch {
    // Search failed — continue with no match
  }

  const PROPERTY_THRESHOLD = 0.4;
  const propertyFound = bestScore >= PROPERTY_THRESHOLD;

  // Determine appraisal status
  let appraisalStatus = "No";
  let vaultreStatus: string | null = null;

  if (propertyFound && bestProperty) {
    vaultreStatus = bestProperty.saleLife?.status ?? null;
    const status = (vaultreStatus ?? "").toLowerCase();
    if (
      ["listing", "conditional", "unconditional", "settled"].includes(status)
    ) {
      appraisalStatus = "Appraised - Listed";
    } else if (["appraisal", "prospect"].includes(status)) {
      appraisalStatus = "Appraised - Not Listed";
    }
  }

  return NextResponse.json({
    propertyFound,
    appraisalStatus,
    contactFound: false,
    agentContact: vendorName || "",
    matchScore: Math.round(bestScore * 100),
    vaultreStatus,
    vaultreId: bestProperty?.id ?? null,
  });
}
