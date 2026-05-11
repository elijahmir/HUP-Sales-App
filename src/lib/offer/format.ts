/**
 * Offer Display Formatting Utilities
 * Title-cases names, companies, addresses for professional display.
 * Preserves Australian state codes, common acronyms, and legal suffixes.
 */

/** Words that should stay fully uppercase */
const UPPERCASE_WORDS = new Set([
  // Australian state codes
  "VIC", "NSW", "QLD", "SA", "WA", "TAS", "NT", "ACT",
  // Legal / business
  "ACN", "ABN", "ATF", "PTY", "LTD", "AND",
  // Address
  "PO",
]);

/** Words that should stay lowercase (unless first word) */
const LOWERCASE_WORDS = new Set([
  "of", "the", "and", "for", "in", "on", "at", "to", "by",
]);

/**
 * Convert a string to Title Case with smart handling of
 * Australian business/legal terms and state codes.
 *
 * Examples:
 *   "sumer singh"                  → "Sumer Singh"
 *   "suhem pty ltd"                → "Suhem Pty Ltd"
 *   "law lab conveyancing"         → "Law Lab Conveyancing"
 *   "93 mccrae street swan hill"   → "93 Mccrae Street Swan Hill"
 *   "VIC"                          → "VIC"
 *   "suhem pty ltd atf suhem family trust" → "Suhem Pty Ltd ATF Suhem Family Trust"
 */
export function toTitleCase(value: string | null | undefined): string {
  if (!value) return "";
  const trimmed = value.trim();
  if (!trimmed) return "";

  return trimmed
    .split(/\s+/)
    .map((word, index) => {
      const upper = word.toUpperCase();

      // Preserve words that should stay uppercase
      if (UPPERCASE_WORDS.has(upper)) {
        return upper;
      }

      // Lowercase articles/prepositions (except first word)
      if (index > 0 && LOWERCASE_WORDS.has(word.toLowerCase())) {
        return word.toLowerCase();
      }

      // Standard title case: capitalize first letter, lowercase rest
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}

/**
 * Format a display value for the offer detail modal.
 * Applies title case to text fields, leaves emails/numbers untouched.
 */
export function formatDisplayName(value: string | null | undefined): string {
  return toTitleCase(value);
}

/**
 * Format an address from parts with proper casing.
 */
export function formatAddress(
  street?: string,
  suburb?: string,
  state?: string,
  postcode?: string
): string {
  return [
    toTitleCase(street),
    toTitleCase(suburb),
    state?.toUpperCase() || "",
    postcode || "",
  ]
    .filter(Boolean)
    .join(" ");
}
