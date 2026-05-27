/**
 * Missing Millions — Fuzzy Address Matching Engine
 *
 * Uses Jaccard similarity on normalized address tokens
 * to match sold updates against existing property records.
 */

import { normalizeAddress } from "./normalize";
import { PropertyRecord } from "./types";

export interface MatchPairResult {
  sharepointRecord: PropertyRecord;
  reaRecord: PropertyRecord;
  score: number;
  fieldDiffs: FieldDiff[];
}

export interface FieldDiff {
  field: keyof PropertyRecord;
  label: string;
  sharepointValue: string;
  reaValue: string;
  changed: boolean;
}

// Fields to compare when a match is found
const DIFF_FIELDS: { field: keyof PropertyRecord; label: string }[] = [
  { field: "status", label: "Status" },
  { field: "listingPrice", label: "Listed for" },
  { field: "saleDate", label: "Sale Date" },
  { field: "salePrice", label: "Sold for" },
  { field: "daysOnMarket", label: "Days on Market" },
  { field: "agent", label: "Agent" },
  { field: "agency", label: "Agency" },
];

// --- Jaccard similarity ---

function tokenize(str: string): Set<string> {
  return new Set(str.split(/\s+/).filter(Boolean));
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 1;
  const intersection = new Set([...a].filter((x) => b.has(x)));
  const union = new Set([...a, ...b]);
  return intersection.size / union.size;
}

// --- Score a single address pair ---

export function scorePair(
  spRecord: PropertyRecord,
  reaRecord: PropertyRecord,
): number {
  const spAddr = normalizeAddress(spRecord.address);
  const reaAddr = normalizeAddress(reaRecord.address);

  // Exact match shortcut
  if (spAddr === reaAddr) {
    const suburbMatch =
      spRecord.suburb.toLowerCase().trim() ===
      reaRecord.suburb.toLowerCase().trim();
    return suburbMatch ? 1.0 : 0.95;
  }

  // Jaccard on address tokens
  const spTokens = tokenize(spAddr);
  const reaTokens = tokenize(reaAddr);
  let score = jaccard(spTokens, reaTokens);

  // Bonus for matching suburb
  if (
    spRecord.suburb &&
    reaRecord.suburb &&
    spRecord.suburb.toLowerCase().trim() ===
      reaRecord.suburb.toLowerCase().trim()
  ) {
    score = Math.min(1.0, score + 0.15);
  }

  // Bonus for matching postcode
  if (
    spRecord.postCode &&
    reaRecord.postCode &&
    spRecord.postCode.trim() === reaRecord.postCode.trim()
  ) {
    score = Math.min(1.0, score + 0.08);
  }

  return score;
}

// --- Build field diffs ---

function buildDiffs(
  spRecord: PropertyRecord,
  reaRecord: PropertyRecord,
): FieldDiff[] {
  return DIFF_FIELDS.map(({ field, label }) => {
    const spVal = String(spRecord[field] ?? "");
    const reaVal = String(reaRecord[field] ?? "");
    return {
      field,
      label,
      sharepointValue: spVal,
      reaValue: reaVal,
      changed: reaVal !== "" && reaVal !== spVal,
    };
  });
}

// --- Match all records ---

export interface MatchingResults {
  matches: MatchPairResult[];
  unmatchedREA: PropertyRecord[];
  unmatchedSP: PropertyRecord[];
}

export function runMatching(
  sharepointRecords: PropertyRecord[],
  reaRecords: PropertyRecord[],
  threshold: number,
): MatchingResults {
  const matches: MatchPairResult[] = [];
  const matchedSPIds = new Set<string>();
  const matchedREAIds = new Set<string>();

  for (const reaRec of reaRecords) {
    let bestScore = 0;
    let bestSP: PropertyRecord | null = null;

    for (const spRec of sharepointRecords) {
      const score = scorePair(spRec, reaRec);
      if (score > bestScore) {
        bestScore = score;
        bestSP = spRec;
      }
    }

    if (bestSP && bestScore >= threshold) {
      matches.push({
        sharepointRecord: bestSP,
        reaRecord: reaRec,
        score: bestScore,
        fieldDiffs: buildDiffs(bestSP, reaRec),
      });
      matchedSPIds.add(bestSP.id);
      matchedREAIds.add(reaRec.id);
    }
  }

  const unmatchedREA = reaRecords.filter((r) => !matchedREAIds.has(r.id));
  const unmatchedSP = sharepointRecords.filter(
    (r) => !matchedSPIds.has(r.id),
  );

  return { matches, unmatchedREA, unmatchedSP };
}
