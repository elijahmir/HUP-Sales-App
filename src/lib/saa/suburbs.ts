// Australian Suburb/Postcode data for autocomplete
// Source: Matthew Proctor's Australian Postcodes (Free dataset)
// https://github.com/matthewproctor/australianpostcodes
// Generated via: node scripts/convert-postcodes.mjs

import australianSuburbsData from "@/data/australian-suburbs.json";

export interface SuburbData {
  suburb: string;
  postcode: string;
  state: string;
}

// Full Australian suburb dataset (18,000+ entries covering all states)
export const allSuburbs: SuburbData[] = australianSuburbsData as SuburbData[];

// Helper to check if a suburb exists (case-insensitive)
export function isValidSuburb(suburbName: string): boolean {
  if (!suburbName) return false;
  const normalizedInput = suburbName.trim().toLowerCase();
  return allSuburbs.some((s) => s.suburb.toLowerCase() === normalizedInput);
}

// Helper to check if a suburb exists in a specific state (case-insensitive)
export function isValidSuburbInState(
  suburbName: string,
  state: string,
): boolean {
  if (!suburbName || !state) return false;
  const normalizedInput = suburbName.trim().toLowerCase();
  const normalizedState = state.trim().toUpperCase();
  return allSuburbs.some(
    (s) =>
      s.suburb.toLowerCase() === normalizedInput && s.state === normalizedState,
  );
}

// Helper to find a suburb's state (returns first match)
export function findSuburbState(suburbName: string): string | null {
  if (!suburbName) return null;
  const normalizedInput = suburbName.trim().toLowerCase();
  const match = allSuburbs.find(
    (s) => s.suburb.toLowerCase() === normalizedInput,
  );
  return match?.state ?? null;
}
