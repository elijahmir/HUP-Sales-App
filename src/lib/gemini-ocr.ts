import { googleGenAI } from "@/lib/gemini";

export interface ListingData {
  handwritten_notes_top: {
    hash_number: string | null;
    amount_year: string | null;
    shed_note: string | null;
  };
  listing_agent: string | null;
  agency_type:
    | { type: "select"; options: string[]; value: string | null }
    | string
    | null;
  date_listed: string | null;
  address: string | null;
  price: string | null;
  bedrooms_icon_count: number | null;
  bathrooms_icon_count: number | null;
  parking_icon_count: number | null;
  title_ref: string | null;
  pid: string | null;
  year_built: string | null;
  construction:
    | { type: string; options: string[]; value: string | null }
    | string
    | null;
  zoning: string | null;
  rates: string | null;
  land_size: string | null;
  windows: string[] | null;
  council: string | null;
  council_water_rates: string | null;
  building_size: string | null;
  roof:
    | { type: string; options: string[]; value: string | null }
    | string
    | null;
  capital_value: string | null;
  land_value: string | null;
  vendors: string | null;
  phone_numbers: string | null;
  postal_address: string | null;
  email: string | null;
  solicitor: string | null;
  handwritten_notes_section: string | null;

  bed_1: {
    wardrobe_type: string | null;
    has_checkbox: boolean;
    measurements: string | null;
    ensuite: {
      measurements: string | null;
      type: string | null;
    };
  };
  bed_2: {
    wardrobe_type: string | null;
    has_checkbox: boolean;
    measurements: string | null;
  };
  bed_3: {
    wardrobe_type: string | null;
    has_checkbox: boolean;
    measurements: string | null;
  };
  bed_4: {
    wardrobe_type: string | null;
    has_checkbox: boolean;
    measurements: string | null;
  };
  bed_5: {
    wardrobe_type: string | null;
    has_checkbox: boolean;
    measurements: string | null;
  };

  bathroom: {
    has_checkbox: boolean;
    measurements: string | null;
    type: string | null;
  };
  toilets: number | null;

  kitchen: { has_checkbox: boolean; measurements: string | null };
  dining: { has_checkbox: boolean; measurements: string | null };
  lounge: { has_checkbox: boolean; measurements: string | null };
  family: { has_checkbox: boolean; measurements: string | null };
  rumpus: { has_checkbox: boolean; measurements: string | null };
  office: { has_checkbox: boolean; measurements: string | null };
  laundry: { has_checkbox: boolean; measurements: string | null };

  gas_hot_water: string | null;
  town_gas: string | null;
  bottled_gas: string | null;
  solar_hot_water: string | null;
  insulation: string | null;
  insulation_locations: { ceiling: boolean; walls: boolean; floor: boolean };

  garage: string | null;
  car_port: string | null;
  electric_r_door: string | null;
  septic_tank: string | null;
  town_water: string | null;
  water_tank: string | null;

  rewired: string | null;
  replumbed: string | null;
  strata_fees: string | null;
  commission: string | null;
  marketing_fee: string | null;
  price_financial: string | null;

  floor_coverings: boolean;
  window_furnishings: boolean;
  drapes_blinds: boolean;
  insect_screens: boolean;
  clothesline: boolean;
  tv_antenna: boolean;
  exhaust_fan: string | null;
  rangehood: string | null;
  stove: string | null;
  wall_oven: string | null;
  hot_plates: string | null;
  microwave: string | null;
  dishwasher: string | null;
  heating: string | null;
  heat_pump: string | null;
  wood_heater: string | null;
  security_system: string | null;
  security_doors: string | null;
  shed: string | null;
  smoke_detectors: string | null;
  solar_panels: string | null;

  notes_page_content: string | null;
  bottom_handwritten_note: string | null;
}

const listingSchema = {
  type: "OBJECT",
  properties: {
    handwritten_notes_top: {
      type: "OBJECT",
      properties: {
        hash_number: { type: "STRING", nullable: true },
        amount_year: { type: "STRING", nullable: true },
        shed_note: { type: "STRING", nullable: true },
      },
      nullable: true,
    },
    listing_agent: { type: "STRING", nullable: true },
    agency_type: {
      type: "STRING",
      enum: ["Sole", "Open", "Joint"],
      nullable: true,
    },
    date_listed: { type: "STRING", nullable: true },
    address: { type: "STRING", nullable: true },
    price: { type: "STRING", nullable: true },
    bedrooms_icon_count: { type: "NUMBER", nullable: true },
    bathrooms_icon_count: { type: "NUMBER", nullable: true },
    parking_icon_count: { type: "NUMBER", nullable: true },
    title_ref: { type: "STRING", nullable: true },
    pid: { type: "STRING", nullable: true },
    year_built: { type: "STRING", nullable: true },
    construction: {
      type: "STRING",
      enum: ["B", "BV", "WB", "R"],
      nullable: true,
    },
    zoning: { type: "STRING", nullable: true },
    rates: { type: "STRING", nullable: true },
    land_size: { type: "STRING", nullable: true },
    windows: { type: "ARRAY", items: { type: "STRING" }, nullable: true },
    council: { type: "STRING", nullable: true },
    council_water_rates: { type: "STRING", nullable: true },
    building_size: { type: "STRING", nullable: true },
    roof: { type: "STRING", enum: ["Tile", "CB", "T"], nullable: true },
    capital_value: { type: "STRING", nullable: true },
    land_value: { type: "STRING", nullable: true },
    vendors: { type: "STRING", nullable: true },
    phone_numbers: { type: "STRING", nullable: true },
    postal_address: { type: "STRING", nullable: true },
    email: { type: "STRING", nullable: true },
    solicitor: { type: "STRING", nullable: true },
    handwritten_notes_section: { type: "STRING", nullable: true },

    bed_1: {
      type: "OBJECT",
      properties: {
        wardrobe_type: {
          type: "STRING",
          enum: ["BI", "WI", "BI/WI", "None"],
          nullable: true,
        },
        has_checkbox: { type: "BOOLEAN" },
        measurements: { type: "STRING", nullable: true },
        ensuite: {
          type: "OBJECT",
          properties: {
            measurements: { type: "STRING", nullable: true },
            type: {
              type: "STRING",
              enum: ["SOB", "Sep Shower", "Bath"],
              nullable: true,
            },
          },
        },
      },
    },
    bed_2: {
      type: "OBJECT",
      properties: {
        wardrobe_type: {
          type: "STRING",
          enum: ["BI", "WI", "BI/WI", "None"],
          nullable: true,
        },
        has_checkbox: { type: "BOOLEAN" },
        measurements: { type: "STRING", nullable: true },
      },
    },
    bed_3: {
      type: "OBJECT",
      properties: {
        wardrobe_type: {
          type: "STRING",
          enum: ["BI", "WI", "BI/WI", "None"],
          nullable: true,
        },
        has_checkbox: { type: "BOOLEAN" },
        measurements: { type: "STRING", nullable: true },
      },
    },
    bed_4: {
      type: "OBJECT",
      properties: {
        wardrobe_type: {
          type: "STRING",
          enum: ["BI", "WI", "BI/WI", "None"],
          nullable: true,
        },
        has_checkbox: { type: "BOOLEAN" },
        measurements: { type: "STRING", nullable: true },
      },
    },
    bed_5: {
      type: "OBJECT",
      properties: {
        wardrobe_type: {
          type: "STRING",
          enum: ["BI", "WI", "BI/WI", "None"],
          nullable: true,
        },
        has_checkbox: { type: "BOOLEAN" },
        measurements: { type: "STRING", nullable: true },
      },
    },

    bathroom: {
      type: "OBJECT",
      properties: {
        has_checkbox: { type: "BOOLEAN" },
        measurements: { type: "STRING", nullable: true },
        type: {
          type: "STRING",
          enum: ["SOB", "Sep Shower", "Bath"],
          nullable: true,
        },
      },
    },
    toilets: { type: "NUMBER", nullable: true },

    kitchen: {
      type: "OBJECT",
      properties: {
        has_checkbox: { type: "BOOLEAN" },
        measurements: { type: "STRING", nullable: true },
      },
    },
    dining: {
      type: "OBJECT",
      properties: {
        has_checkbox: { type: "BOOLEAN" },
        measurements: { type: "STRING", nullable: true },
      },
    },
    lounge: {
      type: "OBJECT",
      properties: {
        has_checkbox: { type: "BOOLEAN" },
        measurements: { type: "STRING", nullable: true },
      },
    },
    family: {
      type: "OBJECT",
      properties: {
        has_checkbox: { type: "BOOLEAN" },
        measurements: { type: "STRING", nullable: true },
      },
    },
    rumpus: {
      type: "OBJECT",
      properties: {
        has_checkbox: { type: "BOOLEAN" },
        measurements: { type: "STRING", nullable: true },
      },
    },
    office: {
      type: "OBJECT",
      properties: {
        has_checkbox: { type: "BOOLEAN" },
        measurements: { type: "STRING", nullable: true },
      },
    },
    laundry: {
      type: "OBJECT",
      properties: {
        has_checkbox: { type: "BOOLEAN" },
        measurements: { type: "STRING", nullable: true },
      },
    },

    gas_hot_water: { type: "STRING", enum: ["Yes", "No"], nullable: true },
    town_gas: { type: "STRING", enum: ["Yes", "No"], nullable: true },
    bottled_gas: { type: "STRING", enum: ["Yes", "No"], nullable: true },
    solar_hot_water: { type: "STRING", enum: ["Yes", "No"], nullable: true },
    insulation: { type: "STRING", enum: ["Yes", "No"], nullable: true },
    insulation_locations: {
      type: "OBJECT",
      properties: {
        ceiling: { type: "BOOLEAN" },
        walls: { type: "BOOLEAN" },
        floor: { type: "BOOLEAN" },
      },
    },

    garage: { type: "STRING", nullable: true },
    car_port: { type: "STRING", nullable: true },
    electric_r_door: { type: "STRING", enum: ["Yes", "No"], nullable: true },
    septic_tank: { type: "STRING", nullable: true },
    town_water: { type: "STRING", enum: ["Yes", "No"], nullable: true },
    water_tank: { type: "STRING", nullable: true },

    rewired: { type: "STRING", nullable: true },
    replumbed: { type: "STRING", nullable: true },
    strata_fees: { type: "STRING", nullable: true },
    commission: { type: "STRING", nullable: true },
    marketing_fee: { type: "STRING", nullable: true },
    price_financial: { type: "STRING", nullable: true },

    floor_coverings: { type: "BOOLEAN" },
    window_furnishings: { type: "BOOLEAN" },
    drapes_blinds: { type: "BOOLEAN" },
    insect_screens: { type: "BOOLEAN" },
    clothesline: { type: "BOOLEAN" },
    tv_antenna: { type: "BOOLEAN" },
    exhaust_fan: { type: "STRING", nullable: true },
    rangehood: { type: "STRING", nullable: true },
    stove: { type: "STRING", nullable: true },
    wall_oven: { type: "STRING", nullable: true },
    hot_plates: { type: "STRING", nullable: true },
    microwave: { type: "STRING", nullable: true },
    dishwasher: { type: "STRING", nullable: true },
    heating: { type: "STRING", nullable: true },
    heat_pump: { type: "STRING", nullable: true },
    wood_heater: { type: "STRING", nullable: true },
    security_system: { type: "STRING", nullable: true },
    security_doors: { type: "STRING", nullable: true },
    shed: { type: "STRING", nullable: true },
    smoke_detectors: { type: "STRING", nullable: true },
    solar_panels: { type: "STRING", nullable: true },

    notes_page_content: { type: "STRING", nullable: true },
    bottom_handwritten_note: { type: "STRING", nullable: true },
  },
  required: ["address"],
};

export async function* extractListingDataStream(
  images: { base64: string; mimeType: string }[],
  modelId: string = "gemini-3-flash-preview",
): AsyncGenerator<
  { type: "thought" | "data"; content: string },
  void,
  unknown
> {
  const imageParts = images.map((img) => ({
    inlineData: { mimeType: img.mimeType, data: img.base64 },
  }));

  const prompt =
    "Extract all listing data from these documents. Use the provided schema. Handle handwritten text accurately. Combine info from all pages.";

  try {
    const result = await googleGenAI.models.generateContentStream({
      model: modelId,
      contents: [
        {
          role: "user",
          parts: [...imageParts, { text: prompt }],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: listingSchema,
        thinkingConfig: {
          includeThoughts: true,
        },
      },
    });

    for await (const chunk of result) {
      if (chunk.candidates?.[0]?.content?.parts) {
        for (const part of chunk.candidates[0].content.parts) {
          if (part.thought) {
            // It's a thought chunk
            yield { type: "thought", content: part.text || "" };
          } else if (part.text) {
            // It's a data chunk (JSON)
            yield { type: "data", content: part.text };
          }
        }
      }
    }
  } catch (error) {
    console.error("Gemini Extraction Error:", error);
    throw new Error("Failed to extract data via Gemini API");
  }
}
