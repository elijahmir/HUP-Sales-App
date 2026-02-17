export interface MarketingItem {
  id: string;
  name: string;
  price: number;
  group: string;
  supplierId?: number; // Added for VaultRE integration
}

// All Marketing Items - Hardcoded exactly as specified

// Group items by category
export function getMarketingGroups(
  items: MarketingItem[],
): Record<string, MarketingItem[]> {
  return items.reduce(
    (acc, item) => {
      if (!acc[item.group]) {
        acc[item.group] = [];
      }
      acc[item.group].push(item);
      return acc;
    },
    {} as Record<string, MarketingItem[]>,
  );
}

// Calculate total from selected item IDs
export function calculateMarketingTotal(
  selectedIds: string[],
  items: MarketingItem[],
): number {
  return items
    .filter((item) => selectedIds.includes(item.id))
    .reduce((sum, item) => sum + item.price, 0);
}

// Generate comma-separated string of selected item names
export function getMarketingListString(
  selectedIds: string[],
  items: MarketingItem[],
): string {
  return items
    .filter((item) => selectedIds.includes(item.id))
    .map((item) => item.name)
    .join(", ");
}
