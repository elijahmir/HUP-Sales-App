/**
 * VaultRE Staff ID Mapping
 * Maps staff names to their VaultRE system IDs
 * Source: VaultRE website property access dropdown (verified 2026-02-03)
 */

export interface VaultREAgent {
  name: string;
  id: number;
  searchTerms: string[]; // For fuzzy matching from OCR
}

// IDs verified from VaultRE website property access dropdown
export const VAULTRE_AGENTS: VaultREAgent[] = [
  // Sales Team - Primary Agents
  { name: "STEPH BARKER", id: 321997, searchTerms: ["steph", "barker"] },
  {
    name: "WENDY SQUIBB",
    id: 201056,
    searchTerms: ["wendy", "squibb", "squib"],
  },
  { name: "BRAD REEVES", id: 261128, searchTerms: ["brad", "reeves"] },
  { name: "COLIN TUNN", id: 201027, searchTerms: ["colin", "tunn"] },
  { name: "JODI TUNN", id: 201028, searchTerms: ["jodi", "tunn"] },

  // Additional Sales Staff
  { name: "ANNALEE BIDWELL", id: 428636, searchTerms: ["annalee", "bidwell"] },
  { name: "JAYDEN BROWN", id: 353372, searchTerms: ["jayden", "brown"] },
  {
    name: "RAYMOND BUITENHUIS",
    id: 201035,
    searchTerms: ["raymond", "buitenhuis"],
  },
  { name: "JARROD BURR", id: 441209, searchTerms: ["jarrod", "burr"] },
  { name: "GRACE CEREZO", id: 381157, searchTerms: ["grace", "cerezo"] },
  { name: "ZARLEE CUSICK", id: 201058, searchTerms: ["zarlee", "cusick"] },
  {
    name: "ANDREW DE BOMFORD",
    id: 242598,
    searchTerms: ["andrew", "bomford", "de bomford"],
  },
  {
    name: "REBECCA DONALDSON",
    id: 257389,
    searchTerms: ["rebecca", "donaldson", "bec"],
  },
  { name: "MADDISON DUNCAN", id: 384455, searchTerms: ["maddison", "duncan"] },
  { name: "MEL EATON", id: 282368, searchTerms: ["mel", "eaton"] },
  {
    name: "SARAH ELPHINSTONE",
    id: 230515,
    searchTerms: ["sarah", "elphinstone"],
  },
  {
    name: "SELENA ELPHINSTONE",
    id: 332827,
    searchTerms: ["selena", "elphinstone"],
  },
  { name: "MARLEE GARWOOD", id: 201031, searchTerms: ["marlee", "garwood"] },
  { name: "RICHARD JACKSON", id: 201051, searchTerms: ["richard", "jackson"] },
  { name: "LEAH KETTLE", id: 340706, searchTerms: ["leah", "kettle"] },
  { name: "KURT KNOWLES", id: 201043, searchTerms: ["kurt", "knowles"] },
  { name: "JAKUB LEHMAN", id: 201053, searchTerms: ["jakub", "lehman"] },
  {
    name: "ELIJAH MIRANDILLA",
    id: 491423,
    searchTerms: ["elijah", "mirandilla"],
  },
  { name: "JASMIN PALMER", id: 354337, searchTerms: ["jasmin", "palmer"] },
  { name: "NICOLA QUINN", id: 419661, searchTerms: ["nicola", "quinn"] },
  { name: "ANISSA ROUSE", id: 470180, searchTerms: ["anissa", "rouse"] },
  { name: "ALLIE STOKES", id: 497054, searchTerms: ["allie", "stokes"] },
  { name: "JULIE SUTCLIFFE", id: 252070, searchTerms: ["julie", "sutcliffe"] },
  { name: "OLIVIA VENN", id: 463593, searchTerms: ["olivia", "venn"] },
  { name: "NATHAN WHITE", id: 407442, searchTerms: ["nathan", "white"] },
  {
    name: "GEORGIA WHITEHEAD",
    id: 441214,
    searchTerms: ["georgia", "whitehead"],
  },
  {
    name: "DANIELLE WINKLER",
    id: 343747,
    searchTerms: ["danielle", "winkler"],
  },
];

/**
 * Find best matching agent from OCR-extracted name
 * @param ocrText - Raw text from OCR (could be partial like "Wendy" or "W. Squibb")
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
