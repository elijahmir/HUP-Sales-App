/**
 * Missing Millions — CSV Parsing & Export
 *
 * Handles flexible column name mapping for REA and SharePoint exports.
 * Parses CSV with proper quoted-field handling.
 */

import { PropertyRecord } from "./types";
import { isOwnAgency } from "./agency";

// --- Column name aliases ---

const COLUMN_ALIASES: Record<string, string> = {
  status: "status",
  "listing status": "status",
  postcode: "postCode",
  "post code": "postCode",
  post_code: "postCode",
  zip: "postCode",
  suburb: "suburb",
  locality: "suburb",
  city: "suburb",
  address: "address",
  "street address": "address",
  "property address": "address",
  street: "address",
  vendor: "vendorName",
  "vendor name": "vendorName",
  vendor_name: "vendorName",
  "vendor name ": "vendorName",
  agency: "agency",
  "agency name": "agency",
  "listing agency": "agency",
  agent: "agent",
  "agent name": "agent",
  "agent names": "agent",
  agents: "agent",
  "listing agent": "agent",
  url: "url",
  "rea url": "url",
  link: "url",
  href: "url",
  "listing url": "url",
  "property url": "url",
  "listing date": "listingDate",
  "date listed": "listingDate",
  "list date": "listingDate",
  listing_date: "listingDate",
  "listing price": "listingPrice",
  "asking price": "listingPrice",
  price: "listingPrice",
  "list price": "listingPrice",
  listing_price: "listingPrice",
  dom: "daysOnMarket",
  "days on market": "daysOnMarket",
  days_on_market: "daysOnMarket",
  "sale date": "saleDate",
  "sold date": "saleDate",
  "date sold": "saleDate",
  sale_date: "saleDate",
  "gc - sale date": "saleDate",
  "sale price": "salePrice",
  "sold price": "salePrice",
  sale_price: "salePrice",
  "gc - sale price": "salePrice",
  "gc - property in vaultre?": "gcPropertyInVaultRE",
  "gc - contact in vaultre?": "gcContactInVaultRE",
  "gc - appraised?": "gcAppraised",
  "agent contact": "agentContact",
  "not listed reason": "notListedReason",
  "lost listing?": "lostListing",
  "loss reason": "lossReason",
  "feedback ": "feedback",
  feedback: "feedback",
};

function normalizeKey(key: string): string {
  return key.toLowerCase().trim().replace(/\s+/g, " ");
}

function mapHeader(raw: string): string {
  const normalized = normalizeKey(raw);
  return COLUMN_ALIASES[normalized] || normalized;
}

// --- CSV Parser ---

/**
 * Parse a raw CSV string into an array of row objects.
 * Handles quoted fields with embedded commas and newlines.
 */
export function parseCSV(raw: string): Record<string, string>[] {
  const lines = raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const records: Record<string, string>[] = [];
  let pos = 0;

  function parseField(): string {
    if (lines[pos] === '"') {
      pos++;
      let value = "";
      while (pos < lines.length) {
        if (lines[pos] === '"') {
          if (lines[pos + 1] === '"') {
            value += '"';
            pos += 2;
          } else {
            pos++;
            break;
          }
        } else {
          value += lines[pos];
          pos++;
        }
      }
      return value;
    } else {
      let value = "";
      while (
        pos < lines.length &&
        lines[pos] !== "," &&
        lines[pos] !== "\n"
      ) {
        value += lines[pos];
        pos++;
      }
      return value;
    }
  }

  function parseLine(): string[] | null {
    if (pos >= lines.length) return null;
    if (lines[pos] === "\n") {
      pos++;
      return [];
    }
    const fields: string[] = [];
    while (pos < lines.length && lines[pos] !== "\n") {
      fields.push(parseField());
      if (pos < lines.length && lines[pos] === ",") pos++;
      else break;
    }
    if (pos < lines.length && lines[pos] === "\n") pos++;
    return fields;
  }

  const headerFields = parseLine();
  if (!headerFields || headerFields.length === 0) return [];

  const headers = headerFields.map(mapHeader);

  while (pos < lines.length) {
    const fields = parseLine();
    if (!fields) break;
    if (fields.length === 0) continue;
    if (fields.every((f) => !f.trim())) continue;

    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h] = (fields[i] || "").trim();
    });
    records.push(row);
  }

  return records;
}

// --- Agent field parser ---

function parseAgent(raw: string): string {
  if (!raw) return "";
  return raw
    .replace(/^\[/, "")
    .replace(/\]$/, "")
    .replace(/"/g, "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .join(", ");
}

// --- Generate unique ID ---

function generateId(): string {
  return crypto.randomUUID();
}

/**
 * Convert a raw CSV row into a PropertyRecord.
 */
export function rowToPropertyRecord(
  row: Record<string, string>,
): PropertyRecord {
  const agency = row.agency || row.Agency || "";
  const harcourts = isOwnAgency(agency);
  const gcDefault = harcourts ? "Yes" : "TBA";

  return {
    id: generateId(),
    status: (row.status as PropertyRecord["status"]) || "For Sale",
    postCode: row.postCode || "",
    suburb: row.suburb || "",
    address: row.address || "",
    vendorName: row.vendorName || "",
    agency,
    agent: parseAgent(row.agent || ""),
    url: row.url || "",
    listingDate: row.listingDate || "",
    listingPrice: row.listingPrice || "",
    daysOnMarket: parseInt(row.daysOnMarket || "0", 10) || 0,
    gcPropertyInVaultRE:
      (row.gcPropertyInVaultRE as PropertyRecord["gcPropertyInVaultRE"]) ||
      gcDefault,
    gcContactInVaultRE:
      (row.gcContactInVaultRE as PropertyRecord["gcContactInVaultRE"]) ||
      gcDefault,
    gcAppraised:
      (row.gcAppraised as PropertyRecord["gcAppraised"]) ||
      (harcourts ? "Yes" : "TBA"),
    agentContact: row.agentContact || "",
    saleDate: row.saleDate || "",
    salePrice: row.salePrice || "",
    notListedReason: row.notListedReason,
    lostListing: row.lostListing,
    lossReason: row.lossReason,
    feedback: row.feedback,
  };
}

/**
 * Parse a full REA Buy CSV string into PropertyRecords.
 */
export function parseREABuyCSV(raw: string): PropertyRecord[] {
  return parseCSV(raw).map(rowToPropertyRecord);
}

/**
 * Parse a full SharePoint Missing Millions CSV export.
 */
export function parseSharePointCSV(raw: string): PropertyRecord[] {
  return parseCSV(raw).map(rowToPropertyRecord);
}

// --- CSV Export ---

const EXPORT_HEADERS: (keyof PropertyRecord)[] = [
  "status",
  "postCode",
  "suburb",
  "address",
  "vendorName",
  "agency",
  "agent",
  "url",
  "listingDate",
  "listingPrice",
  "daysOnMarket",
  "gcPropertyInVaultRE",
  "gcContactInVaultRE",
  "gcAppraised",
  "agentContact",
  "saleDate",
  "salePrice",
];

const DISPLAY_NAMES: Record<string, string> = {
  status: "Status",
  postCode: "Post Code",
  suburb: "Suburb",
  address: "Address",
  vendorName: "Vendor Name",
  agency: "Agency",
  agent: "Agent",
  url: "URL",
  listingDate: "Listing Date",
  listingPrice: "Listing Price",
  daysOnMarket: "DOM",
  gcPropertyInVaultRE: "GC - Property in VaultRE?",
  gcContactInVaultRE: "GC - Contact in VaultRE?",
  gcAppraised: "GC - Appraised?",
  agentContact: "Agent Contact",
  saleDate: "GC - Sale Date",
  salePrice: "GC - Sale Price",
};

function escapeCSVField(value: unknown): string {
  const str = value === null || value === undefined ? "" : String(value);
  if (str.includes(",") || str.includes("\n") || str.includes('"')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Export PropertyRecords to SharePoint-compatible CSV string.
 */
export function exportToSharePointCSV(records: PropertyRecord[]): string {
  const headerRow = EXPORT_HEADERS.map((k) =>
    escapeCSVField(DISPLAY_NAMES[k] || k),
  ).join(",");

  const dataRows = records.map((rec) =>
    EXPORT_HEADERS.map((k) => escapeCSVField(rec[k])).join(","),
  );

  return [headerRow, ...dataRows].join("\r\n");
}

/**
 * Trigger a CSV file download in the browser.
 */
export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
