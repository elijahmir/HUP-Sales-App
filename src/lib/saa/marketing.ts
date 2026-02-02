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
  { id: "rix-home", name: "Home Package", price: 352, group: "RIX Images" },
  { id: "rix-land", name: "Land Package", price: 165, group: "RIX Images" },
  {
    id: "rix-premium",
    name: "Premium Package",
    price: 550,
    group: "RIX Images",
  },
  {
    id: "rix-premium-plus",
    name: "Premium Plus Package",
    price: 990,
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
