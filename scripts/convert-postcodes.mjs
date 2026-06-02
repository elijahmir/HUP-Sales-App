#!/usr/bin/env node
/**
 * Convert Matthew Proctor's Australian Postcodes CSV to a minimal JSON file.
 * Only extracts: suburb (locality), postcode, state
 * Deduplicates entries and sorts by state then suburb.
 * 
 * Usage: node scripts/convert-postcodes.mjs
 * Input: /tmp/australian_postcodes.csv
 * Output: src/data/australian-suburbs.json
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

const csvPath = '/tmp/australian_postcodes.csv';
const outputPath = join(projectRoot, 'src', 'data', 'australian-suburbs.json');

/**
 * Parse a single CSV line handling quoted fields
 */
function parseCSVLine(line) {
  const fields = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      fields.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  fields.push(current.trim());
  return fields;
}

// Read CSV
const csv = readFileSync(csvPath, 'utf-8');
const lines = csv.split(/\r?\n/).filter(line => line.trim());

// Parse header
const headers = parseCSVLine(lines[0]);
const localityIdx = headers.indexOf('locality');
const postcodeIdx = headers.indexOf('postcode');
const stateIdx = headers.indexOf('state');

console.log(`Headers found: locality@${localityIdx}, postcode@${postcodeIdx}, state@${stateIdx}`);

if (localityIdx === -1 || postcodeIdx === -1 || stateIdx === -1) {
  console.error('Required columns not found. Headers:', headers);
  process.exit(1);
}

// Valid Australian states
const validStates = new Set(['TAS', 'NSW', 'VIC', 'QLD', 'SA', 'WA', 'NT', 'ACT']);

/**
 * Convert "ULVERSTONE" → "Ulverstone", "ST HELENS" → "St Helens"
 * Handles apostrophes, hyphens, and multi-word names.
 */
function toTitleCase(str) {
  return str
    .toLowerCase()
    .replace(/(?:^|\s|[-'/])\w/g, (match) => match.toUpperCase());
}

// Parse rows
const seen = new Set();
const suburbs = [];

for (let i = 1; i < lines.length; i++) {
  const fields = parseCSVLine(lines[i]);
  const locality = fields[localityIdx];
  const postcode = fields[postcodeIdx];
  const state = fields[stateIdx];

  // Skip empty/invalid rows
  if (!locality || !postcode || !state) continue;
  if (!validStates.has(state)) continue;

  // Convert to title case to match existing app convention
  const suburbName = toTitleCase(locality);

  // Deduplicate by suburb+postcode+state (case-insensitive)
  const key = `${suburbName}|${postcode}|${state}`;
  if (seen.has(key)) continue;
  seen.add(key);

  suburbs.push({
    suburb: suburbName,
    postcode: postcode.padStart(4, '0'),
    state,
  });
}

// Sort: TAS first, then alphabetically by state, then by suburb within each state
const stateOrder = ['TAS', 'NSW', 'VIC', 'QLD', 'SA', 'WA', 'NT', 'ACT'];
suburbs.sort((a, b) => {
  const stateA = stateOrder.indexOf(a.state);
  const stateB = stateOrder.indexOf(b.state);
  if (stateA !== stateB) return stateA - stateB;
  return a.suburb.localeCompare(b.suburb);
});

// Write JSON (minified)
mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, JSON.stringify(suburbs));

const fileSizeKB = Math.round(readFileSync(outputPath).length / 1024);

console.log(`\n✅ Generated ${suburbs.length} suburb entries (${fileSizeKB} KB)`);
console.log(`   States: ${[...new Set(suburbs.map(s => s.state))].join(', ')}`);
console.log(`   Output: ${outputPath}`);

// Show stats per state
const stateCounts = {};
for (const s of suburbs) {
  stateCounts[s.state] = (stateCounts[s.state] || 0) + 1;
}
console.log('\n   Per state:');
for (const [state, count] of Object.entries(stateCounts)) {
  console.log(`     ${state}: ${count}`);
}
