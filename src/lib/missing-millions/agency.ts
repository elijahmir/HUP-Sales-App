/**
 * Missing Millions — Agency Detection
 *
 * Identifies whether a listing agency belongs to
 * Harcourts Ulverstone & Penguin.
 */

const OWN_PATTERNS = [
  "harcourts ulverstone",
  "harcourts penguin",
  "harcourts ulverstone & penguin",
  "harcourts ulverstone and penguin",
];

/**
 * Check if the given agency string belongs to Harcourts U&P.
 * Case-insensitive fuzzy match against known patterns.
 */
export function isOwnAgency(agency: string): boolean {
  if (!agency) return false;
  const lower = agency.toLowerCase().trim();
  return OWN_PATTERNS.some((p) => lower.includes(p));
}
