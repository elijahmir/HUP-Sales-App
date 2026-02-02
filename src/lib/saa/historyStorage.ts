import type { FormData } from "./types";

const STORAGE_KEY = "soa_form_history";
const MAX_ENTRIES = 20;
const VERSION = 1;

export interface HistoryEntry {
  id: string;
  version: number;
  timestamp: number;
  vendorName: string;
  propertyAddress: string;
  listingPrice: string;
  formData: FormData;
}

// Get all history entries
export function getHistory(): HistoryEntry[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const history = JSON.parse(stored) as HistoryEntry[];

    // Filter by version (future-proofing for migrations)
    return history.filter((entry) => entry.version === VERSION);
  } catch (error) {
    console.error("Failed to load history:", error);
    return [];
  }
}

// Save submission to history
export function saveSubmission(formData: FormData): void {
  try {
    const history = getHistory();

    // Create new entry
    const entry: HistoryEntry = {
      id: Date.now().toString(),
      version: VERSION,
      timestamp: Date.now(),
      vendorName: formData.vendors[0]?.fullName || "Unknown Vendor",
      propertyAddress: `${formData.propertyStreet}, ${formData.propertySuburb} ${formData.propertyState} ${formData.propertyPostcode}`,
      listingPrice: formData.listingPrice,
      formData: formData,
    };

    // Add to beginning of array (newest first)
    history.unshift(entry);

    // Limit to MAX_ENTRIES
    if (history.length > MAX_ENTRIES) {
      history.splice(MAX_ENTRIES);
    }

    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (error) {
    console.error("Failed to save submission to history:", error);
  }
}

// Load specific submission
export function loadSubmission(id: string): FormData | null {
  try {
    const history = getHistory();
    const entry = history.find((e) => e.id === id);
    return entry ? entry.formData : null;
  } catch (error) {
    console.error("Failed to load submission:", error);
    return null;
  }
}

// Delete specific entry
export function deleteSubmission(id: string): void {
  try {
    const history = getHistory();
    const filtered = history.filter((e) => e.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("Failed to delete submission:", error);
  }
}

// Clear all history
export function clearAllHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear history:", error);
  }
}

// Get relative time string
export function getRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (days < 30) return `${days} day${days > 1 ? "s" : ""} ago`;

  return new Date(timestamp).toLocaleDateString();
}
