/**
 * VaultRE Agent ID Mapping
 * Maps agent names to their VaultRE system IDs
 * Source: agent_id.md in Appraisal Process folder
 */

export interface VaultREAgent {
  name: string;
  id: number;
  searchTerms: string[]; // For fuzzy matching from OCR
}

export const VAULTRE_AGENTS: VaultREAgent[] = [
  { name: "STEPH BARKER", id: 321997, searchTerms: ["steph", "barker"] },
  { name: "JODI CAMERON", id: 322057, searchTerms: ["jodi", "cameron"] },
  { name: "WENDY SQUIB", id: 322017, searchTerms: ["wendy", "squib"] },
  { name: "BRAD REEVES", id: 322052, searchTerms: ["brad", "reeves"] },
  { name: "BEN WAKEFIELD", id: 322022, searchTerms: ["ben", "wakefield"] },
  { name: "JORDAN BOCK", id: 317562, searchTerms: ["jordan", "bock"] },
  { name: "HAYLEY GOULD", id: 322027, searchTerms: ["hayley", "gould"] },
  { name: "LYNDA MCDONALD", id: 351177, searchTerms: ["lynda", "mcdonald"] },
  { name: "NAOMI CAMERON", id: 322055, searchTerms: ["naomi", "cameron"] },
  { name: "DANNI GARNER", id: 322042, searchTerms: ["danni", "garner"] },
  { name: "STUART JONES", id: 322047, searchTerms: ["stuart", "jones"] },
  { name: "TAYLA JONES", id: 403782, searchTerms: ["tayla", "jones"] },
  { name: "BROOKE BARKER", id: 429152, searchTerms: ["brooke", "barker"] },
  { name: "PAIGE HODGES", id: 395202, searchTerms: ["paige", "hodges"] },
  { name: "HOLLY JONES", id: 401877, searchTerms: ["holly", "jones"] },
  { name: "BIANCA JAMES", id: 418327, searchTerms: ["bianca", "james"] },
  {
    name: "ALLI GOLDSWORTHY",
    id: 401847,
    searchTerms: ["alli", "goldsworthy"],
  },
  {
    name: "REBECCA DONALDSON",
    id: 401922,
    searchTerms: ["rebecca", "donaldson", "bec"],
  },
  { name: "TAYLAH MORRISON", id: 406917, searchTerms: ["taylah", "morrison"] },
  { name: "KRYSTAL STACEY", id: 407122, searchTerms: ["krystal", "stacey"] },
  { name: "LORI WHITELEY", id: 401597, searchTerms: ["lori", "whiteley"] },
  { name: "MONIQUE CLARKE", id: 407377, searchTerms: ["monique", "clarke"] },
  { name: "TAYLOR REEVES", id: 403142, searchTerms: ["taylor", "reeves"] },
  { name: "MADISON TOLOMEI", id: 406552, searchTerms: ["madison", "tolomei"] },
  { name: "CLAIRE REES", id: 410217, searchTerms: ["claire", "rees"] },
  { name: "LANI STRACHAN", id: 410587, searchTerms: ["lani", "strachan"] },
  { name: "RILEY LEAHY", id: 418112, searchTerms: ["riley", "leahy"] },
  { name: "ASHLEE BRAGA", id: 433177, searchTerms: ["ashlee", "braga"] },
  { name: "INDIA MCGREGOR", id: 447907, searchTerms: ["india", "mcgregor"] },
  { name: "ABBEY SQUIB", id: 464457, searchTerms: ["abbey", "squib"] },
  { name: "AMY GOLDSWORTHY", id: 480432, searchTerms: ["amy", "goldsworthy"] },
  {
    name: "ELIJAH MIRANDILLA",
    id: 491423,
    searchTerms: ["elijah", "mirandilla"],
  },
];

/**
 * Find best matching agent from OCR-extracted name
 * @param ocrText - Raw text from OCR (could be partial like "Wendy" or "W. Squib")
 * @returns Best matching agent or null if no match
 */
export function findAgentByOCR(ocrText: string): VaultREAgent | null {
  if (!ocrText) return null;

  const searchLower = ocrText.toLowerCase().trim();

  // Exact match on full name first
  const exactMatch = VAULTRE_AGENTS.find(
    (agent) => agent.name.toLowerCase() === searchLower,
  );
  if (exactMatch) return exactMatch;

  // Check if search text contains any agent's search terms
  const partialMatches = VAULTRE_AGENTS.filter((agent) =>
    agent.searchTerms.some((term) => searchLower.includes(term)),
  );

  if (partialMatches.length === 1) {
    return partialMatches[0];
  }

  // If multiple partial matches, try to find best one
  if (partialMatches.length > 1) {
    // Prefer matches where more terms match
    const scored = partialMatches.map((agent) => ({
      agent,
      score: agent.searchTerms.filter((term) => searchLower.includes(term))
        .length,
    }));
    scored.sort((a, b) => b.score - a.score);
    return scored[0].agent;
  }

  return null;
}

/**
 * Get agent by exact name
 */
export function getAgentByName(name: string): VaultREAgent | undefined {
  return VAULTRE_AGENTS.find(
    (agent) => agent.name.toLowerCase() === name.toLowerCase(),
  );
}

/**
 * Get agent by VaultRE ID
 */
export function getAgentById(id: number): VaultREAgent | undefined {
  return VAULTRE_AGENTS.find((agent) => agent.id === id);
}

/**
 * Get all agent names for dropdown
 */
export function getAgentNames(): string[] {
  return VAULTRE_AGENTS.map((agent) => agent.name);
}
