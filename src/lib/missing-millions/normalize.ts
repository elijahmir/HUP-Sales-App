/**
 * Missing Millions — Address Normalization
 *
 * Normalizes street addresses for fuzzy matching,
 * and builds deep-link URLs for The LIST and CoreLogic.
 */

const ABBREVIATIONS: Record<string, string> = {
  st: "street",
  rd: "road",
  dr: "drive",
  ave: "avenue",
  ct: "court",
  crt: "court",
  cres: "crescent",
  tce: "terrace",
  pl: "place",
  hwy: "highway",
  bvd: "boulevard",
  cl: "close",
  ln: "lane",
  pde: "parade",
  gr: "grove",
  cir: "circuit",
  cct: "circuit",
};

/**
 * Normalize an address string for comparison.
 * Strips punctuation, expands abbreviations, collapses whitespace.
 */
export function normalizeAddress(addr: string): string {
  return addr
    .toLowerCase()
    .replace(/[,./\\-]/g, " ")
    .replace(/\bunit\b/g, "")
    .replace(/\b(\w+)\b/g, (match) => ABBREVIATIONS[match] || match)
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Encode address for The LIST URL deep link
 */
export function encodeForTheList(address: string, suburb: string): string {
  const combined = `${address}, ${suburb}`.trim();
  return encodeURIComponent(combined);
}

/**
 * Build The LIST (Tasmania) deep link URL
 */
export function buildTheListUrl(address: string, suburb: string): string {
  return `https://www.thelist.tas.gov.au/app/content/property/property-search?searchType=address&searchText=${encodeForTheList(address, suburb)}`;
}

/**
 * Build CoreLogic RP Data search URL
 */
export function buildCoreLogicUrl(address: string, suburb: string): string {
  const q = encodeURIComponent(`${address} ${suburb} TAS`);
  return `https://rp.com.au/search?q=${q}`;
}

/**
 * Calculate days on market from listing date to sale date.
 * Expects dates in DD/MM/YYYY format.
 */
export function calcDOM(
  listingDate: string,
  saleDate: string,
): number | null {
  if (!listingDate || !saleDate) return null;
  const parse = (s: string) => {
    const [d, m, y] = s.split("/").map(Number);
    if (!d || !m || !y) return null;
    return new Date(y, m - 1, d).getTime();
  };
  const lt = parse(listingDate);
  const st = parse(saleDate);
  if (lt === null || st === null) return null;
  const diff = Math.round((st - lt) / 86400000);
  return diff >= 0 ? diff : null;
}
