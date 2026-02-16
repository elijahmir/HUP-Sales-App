export interface MarketingItem {
  id: string;
  name: string;
  price: number;
  group: string;
}

// All Marketing Items - Hardcoded exactly as specified
export const marketingItems: MarketingItem[] = [
  // Group: Allie J Photography
  {
    id: "aj-drone",
    name: "Drone Photography",
    price: 100,
    group: "Allie J Photography",
  },
  {
    id: "aj-photo12",
    name: "Professional photography x 12 and floorplan",
    price: 270,
    group: "Allie J Photography",
  },
  {
    id: "aj-photo20",
    name: "Professional photography x 20 and floorplan",
    price: 300,
    group: "Allie J Photography",
  },
  {
    id: "aj-photo8",
    name: "Professional photography x 8 and floorplan",
    price: 235,
    group: "Allie J Photography",
  },

  // Group: Marketing Campaign
  {
    id: "mc-corflute",
    name: "Corflute Signboard",
    price: 88,
    group: "Marketing Campaign",
  },
  {
    id: "mc-domain-gold",
    name: "Domain Gold",
    price: 199,
    group: "Marketing Campaign",
  },
  {
    id: "mc-extra-photo",
    name: "Extra Photography",
    price: 150,
    group: "Marketing Campaign",
  },

  {
    id: "mc-lakes",
    name: "Lakes Photography",
    price: 50,
    group: "Marketing Campaign",
  },
  {
    id: "mc-base-fy26",
    name: "Marketing Base Package FY26",
    price: 1675,
    group: "Marketing Campaign",
  },
  {
    id: "mc-base-fy26-raymond",
    name: "Marketing Base Package FY26 Raymond",
    price: 1538,
    group: "Marketing Campaign",
  },
  {
    id: "mc-metal-sign",
    name: "Metal Signboard",
    price: 195,
    group: "Marketing Campaign",
  },
  {
    id: "mc-photo-sign",
    name: "Photo Signboard",
    price: 350,
    group: "Marketing Campaign",
  },
  {
    id: "mc-video",
    name: "Property Video",
    price: 500,
    group: "Marketing Campaign",
  },
  {
    id: "mc-rea-maximiser",
    name: "REA Audience Maximiser",
    price: 149,
    group: "Marketing Campaign",
  },
  {
    id: "mc-rea-premiere",
    name: "Realestate.com Premiere+",
    price: 949,
    group: "Marketing Campaign",
  },
  {
    id: "mc-rea-premiere-land",
    name: "Realestate.com Premiere+ Land",
    price: 939,
    group: "Marketing Campaign",
  },
  {
    id: "mc-styling",
    name: "Styling",
    price: 500,
    group: "Marketing Campaign",
  },
  {
    id: "mc-title-search",
    name: "Title Search Fee",
    price: 38,
    group: "Marketing Campaign",
  },
  {
    id: "mc-voi",
    name: "Verification of Identity",
    price: 30,
    group: "Marketing Campaign",
  },

  // Group: Open2View
  {
    id: "o2v-drone",
    name: "Drone Photography",
    price: 100,
    group: "Open2View",
  },
  {
    id: "o2v-land",
    name: "Land photography package",
    price: 160,
    group: "Open2View",
  },
  {
    id: "o2v-photo12",
    name: "Professional photography x 12 photos and floorplan",
    price: 260,
    group: "Open2View",
  },
  {
    id: "o2v-photo20",
    name: "Professional photography x 20 photos and floorplan",
    price: 290,
    group: "Open2View",
  },
  {
    id: "o2v-photo8",
    name: "Professional photography x 8 photos and floorplan",
    price: 225,
    group: "Open2View",
  },

  // Group: RIX Images
  {
    id: "rix-refresh",
    name: "Property Refresh Package (5-8 standard images)",
    price: 132,
    group: "RIX Images",
  },
  {
    id: "rix-rental",
    name: "Rental Package (Max. 10 standard images)",
    price: 176,
    group: "RIX Images",
  },
  {
    id: "rix-land",
    name: "Land Block Package (Max. 8-10 standard images + aerial)",
    price: 176,
    group: "RIX Images",
  },
  {
    id: "rix-home",
    name: "Home Sales Package (Max 15 standard + aerial + floorplan)",
    price: 363,
    group: "RIX Images",
  },
  {
    id: "rix-premium",
    name: "Premium Package (Max 30 standard/lifestyle + aerial + plans)",
    price: 572,
    group: "RIX Images",
  },
  {
    id: "rix-premium-plus",
    name: "Premium Plus Package (Max 30 standard/lifestyle/sunset + aerial + plans)",
    price: 792,
    group: "RIX Images",
  },
  {
    id: "rix-extra",
    name: "Extra Images Pack (5-8 images)",
    price: 71.5,
    group: "RIX Images",
  },
  {
    id: "rix-removal",
    name: "Clear room/multiple object removal (per room)",
    price: 35.2,
    group: "RIX Images",
  },
  {
    id: "rix-staging",
    name: "Virtual Staging (per room)",
    price: 55,
    group: "RIX Images",
  },

  // Group: Jess Bonde Photography
  {
    id: "jb-photo8",
    name: "8 photos & floorplan",
    price: 225,
    group: "Jess Bonde Photography",
  },
  {
    id: "jb-photo12",
    name: "12 photos & floorplan",
    price: 260,
    group: "Jess Bonde Photography",
  },
  {
    id: "jb-photo20",
    name: "20 photos & floorplan",
    price: 290,
    group: "Jess Bonde Photography",
  },
  {
    id: "jb-drone",
    name: "Drone Photography",
    price: 100,
    group: "Jess Bonde Photography",
  },
  {
    id: "jb-video",
    name: "Full Video Package",
    price: 1200,
    group: "Jess Bonde Photography",
  },
];

// Group items by category
export function getMarketingGroups(): Record<string, MarketingItem[]> {
  return marketingItems.reduce(
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
export function calculateMarketingTotal(selectedIds: string[]): number {
  return marketingItems
    .filter((item) => selectedIds.includes(item.id))
    .reduce((sum, item) => sum + item.price, 0);
}

// Generate comma-separated string of selected item names
export function getMarketingListString(selectedIds: string[]): string {
  return marketingItems
    .filter((item) => selectedIds.includes(item.id))
    .map((item) => item.name)
    .join(", ");
}
