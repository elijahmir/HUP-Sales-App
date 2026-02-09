import {
  GoogleGenerativeAI,
  SchemaType,
  type ResponseSchema,
} from "@google/generative-ai";

export interface ListingData {
  handwritten_notes_top?: {
    financial_note?: string;
    property_note?: string;
    other_notes?: string;
  };
  listing_agent?: string;
  agency_type?: "Sole" | "Open" | "Joint";
  date_listed?: string;
  appraisal_date?: string; // YYYY-MM-DD
  vendor_first_name?: string;
  vendor_last_name?: string;
  vendor_email?: string;
  vendor_phone?: string;
  address?: string;
  address_components?: {
    unit?: string;
    street_number?: string;
    street_name?: string;
    suburb?: string;
    state?: "NSW" | "VIC" | "QLD" | "SA" | "WA" | "TAS" | "NT" | "ACT";
    postcode?: string;
  };
  title_ref?: string;
  pid?: string;
  price?: {
    display_text?: string;
    method?:
      | "OTO"
      | "Offers To"
      | "Tender"
      | "Auction"
      | "By Negotiation"
      | "Fixed"
      | "";
    amount?: string;
    range_from?: string;
    range_to?: string;
  };
  bedrooms_icon_count?: number;
  bathrooms_icon_count?: number;
  parking_icon_count?: number;
  year_built?: string;
  construction?: {
    type?: "B" | "BV" | "WB" | "R";
    description?: string;
  };
  zoning?: string;
  rates?: string;
  land_size?: string;
  windows?: {
    type?: string[]; // Multiselect
  };
  council?: string;
  water_rates?: string;
  building_size?: string;
  roof?: {
    type?: "Tile" | "CB" | "T";
  };
  capital_value?: string;
  land_value?: string;
  vendors?: string;
  phone_numbers?: string;
  postal_address?: string;
  email?: string;
  solicitor?: string;
  handwritten_notes_section?: string;

  // Rooms
  bed_1?: {
    exists?: boolean;
    wardrobe_type?: "BI" | "WI" | "None";
    measurements?: string;
    size_width?: string;
    size_height?: string;
    ensuite?: {
      exists?: boolean;
      measurements?: string;
      size_width?: string;
      size_height?: string;
      type?: "SOB" | "Sep Shower" | "Bath";
    };
  };
  bed_2?: {
    exists?: boolean;
    wardrobe_type?: "BI" | "WI" | "None";
    measurements?: string;
    size_width?: string;
    size_height?: string;
  };
  bed_3?: {
    exists?: boolean;
    wardrobe_type?: "BI" | "WI" | "None";
    measurements?: string;
    size_width?: string;
    size_height?: string;
  };
  bed_4?: {
    exists?: boolean;
    wardrobe_type?: "BI" | "WI" | "None";
    measurements?: string;
    size_width?: string;
    size_height?: string;
  };
  bed_5?: {
    exists?: boolean;
    wardrobe_type?: "BI" | "WI" | "None";
    measurements?: string;
    size_width?: string;
    size_height?: string;
  };

  bathroom?: {
    exists: boolean;
    measurements?: string;
    type?: "SOB" | "Sep Shower" | "Bath";
  };
  toilets?: number | string; // 1, 2, 3, 4

  kitchen?: {
    exists?: boolean;
    measurements?: string;
    size_width?: string;
    size_height?: string;
    connected_to?: string;
  };
  dining?: {
    exists?: boolean;
    measurements?: string;
    size_width?: string;
    size_height?: string;
    connected_to?: string;
  };
  lounge?: {
    exists?: boolean;
    measurements?: string;
    size_width?: string;
    size_height?: string;
    connected_to?: string;
  };
  family?: {
    exists?: boolean;
    measurements?: string;
    size_width?: string;
    size_height?: string;
    connected_to?: string;
  };
  rumpus?: {
    exists?: boolean;
    measurements?: string;
    size_width?: string;
    size_height?: string;
    connected_to?: string;
  };
  office?: {
    exists?: boolean;
    measurements?: string;
    size_width?: string;
    size_height?: string;
    connected_to?: string;
  };
  laundry?: {
    exists?: boolean;
    measurements?: string;
    size_width?: string;
    size_height?: string;
  };

  // Utilities & Features
  gas_hot_water?: "Yes" | "No";
  town_gas?: "Yes" | "No";
  bottled_gas?: "Yes" | "No";
  solar_hot_water?: "Yes" | "No";
  insulation?: "Yes" | "No";
  insulation_locations?: {
    ceiling?: boolean;
    walls?: boolean;
    floor?: boolean;
  };

  garage?: string;
  car_port?: string;
  electric_r_door?: "Yes" | "No";
  septic_tank?: string;
  town_water?: "Yes" | "No";
  water_tank_capacity_liters?: string;
  rewired?: string;
  replumbed?: string;
  strata_fees?: string;

  // Financials
  commission?: string;
  marketing_fee?: string;
  price_financial?: string;

  // Chattels (Booleans)
  floor_coverings?: boolean;
  window_furnishings?: boolean;
  drapes_blinds?: boolean;
  insect_screens?: boolean;
  clothesline?: boolean;
  tv_antenna?: boolean;

  // Chattels (Strings)
  exhaust_fan?: string;
  rangehood?: string;
  stove?: string;
  wall_oven?: string;
  hot_plates?: string;
  microwave?: string;
  dishwasher?: string;
  heating?: string;
  heat_pump?: string;
  wood_heater?: string;
  security_system?: string;
  security_doors?: string;
  shed?: string;
  smoke_detectors?: string;
  solar_panels?: string;

  unit_number?: string;
  bottom_handwritten_note?: string;
  notes_page_content?: string;
}

const listingSchema: ResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    handwritten_notes_top: {
      type: SchemaType.OBJECT,
      properties: {
        financial_note: { type: SchemaType.STRING, nullable: true },
        property_note: { type: SchemaType.STRING, nullable: true },
        other_notes: { type: SchemaType.STRING, nullable: true },
      },
      nullable: true,
    },
    listing_agent: { type: SchemaType.STRING, nullable: true },
    agency_type: {
      type: SchemaType.STRING,
      format: "enum",
      nullable: true,
      enum: ["Sole", "Open", "Joint"],
    },
    date_listed: { type: SchemaType.STRING, nullable: true },
    appraisal_date: { type: SchemaType.STRING, nullable: true },
    vendor_first_name: { type: SchemaType.STRING, nullable: true },
    vendor_last_name: { type: SchemaType.STRING, nullable: true },
    vendor_email: { type: SchemaType.STRING, nullable: true },
    vendor_phone: { type: SchemaType.STRING, nullable: true },
    address: { type: SchemaType.STRING, nullable: true },
    address_components: {
      type: SchemaType.OBJECT,
      properties: {
        unit: { type: SchemaType.STRING, nullable: true },
        street_number: { type: SchemaType.STRING, nullable: true },
        street_name: { type: SchemaType.STRING, nullable: true },
        suburb: { type: SchemaType.STRING, nullable: true },
        state: {
          type: SchemaType.STRING,
          format: "enum",
          nullable: true,
          enum: ["NSW", "VIC", "QLD", "SA", "WA", "TAS", "NT", "ACT"],
        },
        postcode: { type: SchemaType.STRING, nullable: true },
      },
      nullable: true,
    },
    title_ref: { type: SchemaType.STRING, nullable: true },
    pid: { type: SchemaType.STRING, nullable: true },
    price: {
      type: SchemaType.OBJECT,
      properties: {
        display_text: { type: SchemaType.STRING, nullable: true },
        method: {
          type: SchemaType.STRING,
          format: "enum",
          nullable: true,
          enum: [
            "OTO",
            "Offers To",
            "Tender",
            "Auction",
            "By Negotiation",
            "Fixed",
          ],
        },
        amount: { type: SchemaType.STRING, nullable: true },
        range_from: { type: SchemaType.STRING, nullable: true },
        range_to: { type: SchemaType.STRING, nullable: true },
      },
      nullable: true,
    },
    bedrooms_icon_count: { type: SchemaType.NUMBER, nullable: true },
    bathrooms_icon_count: { type: SchemaType.NUMBER, nullable: true },
    parking_icon_count: { type: SchemaType.NUMBER, nullable: true },
    year_built: { type: SchemaType.STRING, nullable: true },
    construction: {
      type: SchemaType.OBJECT,
      properties: {
        type: {
          type: SchemaType.STRING,
          format: "enum",
          nullable: true,
          enum: ["B", "BV", "WB", "R"],
        },
        description: { type: SchemaType.STRING, nullable: true },
      },
      nullable: true,
    },
    zoning: { type: SchemaType.STRING, nullable: true },
    rates: { type: SchemaType.STRING, nullable: true },
    land_size: { type: SchemaType.STRING, nullable: true },
    windows: {
      type: SchemaType.OBJECT,
      properties: {
        type: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
          nullable: true,
        },
      },
      nullable: true,
    },
    council: { type: SchemaType.STRING, nullable: true },
    water_rates: { type: SchemaType.STRING, nullable: true },
    building_size: { type: SchemaType.STRING, nullable: true },
    roof: {
      type: SchemaType.OBJECT,
      properties: {
        type: {
          type: SchemaType.STRING,
          format: "enum",
          nullable: true,
          enum: ["Tile", "CB", "T"],
        },
      },
      nullable: true,
    },
    capital_value: { type: SchemaType.STRING, nullable: true },
    land_value: { type: SchemaType.STRING, nullable: true },
    vendors: { type: SchemaType.STRING, nullable: true },
    phone_numbers: { type: SchemaType.STRING, nullable: true },
    postal_address: { type: SchemaType.STRING, nullable: true },
    email: { type: SchemaType.STRING, nullable: true },
    solicitor: { type: SchemaType.STRING, nullable: true },
    handwritten_notes_section: { type: SchemaType.STRING, nullable: true },

    // Rooms
    bed_1: {
      type: SchemaType.OBJECT,
      properties: {
        exists: { type: SchemaType.BOOLEAN, nullable: true },
        wardrobe_type: { type: SchemaType.STRING, nullable: true },
        measurements: { type: SchemaType.STRING, nullable: true },
        size_width: { type: SchemaType.STRING, nullable: true },
        size_height: { type: SchemaType.STRING, nullable: true },
        ensuite: {
          type: SchemaType.OBJECT,
          properties: {
            exists: { type: SchemaType.BOOLEAN, nullable: true },
            measurements: { type: SchemaType.STRING, nullable: true },
            size_width: { type: SchemaType.STRING, nullable: true },
            size_height: { type: SchemaType.STRING, nullable: true },
            type: { type: SchemaType.STRING, nullable: true },
          },
          nullable: true,
        },
      },
      nullable: true,
    },
    bed_2: {
      type: SchemaType.OBJECT,
      properties: {
        exists: { type: SchemaType.BOOLEAN, nullable: true },
        wardrobe_type: { type: SchemaType.STRING, nullable: true },
        measurements: { type: SchemaType.STRING, nullable: true },
        size_width: { type: SchemaType.STRING, nullable: true },
        size_height: { type: SchemaType.STRING, nullable: true },
      },
      nullable: true,
    },
    bed_3: {
      type: SchemaType.OBJECT,
      properties: {
        exists: { type: SchemaType.BOOLEAN, nullable: true },
        wardrobe_type: { type: SchemaType.STRING, nullable: true },
        measurements: { type: SchemaType.STRING, nullable: true },
        size_width: { type: SchemaType.STRING, nullable: true },
        size_height: { type: SchemaType.STRING, nullable: true },
      },
      nullable: true,
    },
    bed_4: {
      type: SchemaType.OBJECT,
      properties: {
        exists: { type: SchemaType.BOOLEAN, nullable: true },
        wardrobe_type: { type: SchemaType.STRING, nullable: true },
        measurements: { type: SchemaType.STRING, nullable: true },
        size_width: { type: SchemaType.STRING, nullable: true },
        size_height: { type: SchemaType.STRING, nullable: true },
      },
      nullable: true,
    },
    bed_5: {
      type: SchemaType.OBJECT,
      properties: {
        exists: { type: SchemaType.BOOLEAN, nullable: true },
        wardrobe_type: { type: SchemaType.STRING, nullable: true },
        measurements: { type: SchemaType.STRING, nullable: true },
        size_width: { type: SchemaType.STRING, nullable: true },
        size_height: { type: SchemaType.STRING, nullable: true },
      },
      nullable: true,
    },

    bathroom: {
      type: SchemaType.OBJECT,
      properties: {
        exists: { type: SchemaType.BOOLEAN },
        measurements: { type: SchemaType.STRING, nullable: true },
        type: { type: SchemaType.STRING, nullable: true },
      },
      nullable: true,
    },
    toilets: { type: SchemaType.STRING, nullable: true },

    kitchen: {
      type: SchemaType.OBJECT,
      properties: {
        exists: { type: SchemaType.BOOLEAN, nullable: true },
        measurements: { type: SchemaType.STRING, nullable: true },
        size_width: { type: SchemaType.STRING, nullable: true },
        size_height: { type: SchemaType.STRING, nullable: true },
        connected_to: { type: SchemaType.STRING, nullable: true },
      },
      nullable: true,
    },
    dining: {
      type: SchemaType.OBJECT,
      properties: {
        exists: { type: SchemaType.BOOLEAN, nullable: true },
        measurements: { type: SchemaType.STRING, nullable: true },
        size_width: { type: SchemaType.STRING, nullable: true },
        size_height: { type: SchemaType.STRING, nullable: true },
        connected_to: { type: SchemaType.STRING, nullable: true },
      },
      nullable: true,
    },
    lounge: {
      type: SchemaType.OBJECT,
      properties: {
        exists: { type: SchemaType.BOOLEAN, nullable: true },
        measurements: { type: SchemaType.STRING, nullable: true },
        size_width: { type: SchemaType.STRING, nullable: true },
        size_height: { type: SchemaType.STRING, nullable: true },
        connected_to: { type: SchemaType.STRING, nullable: true },
      },
      nullable: true,
    },
    family: {
      type: SchemaType.OBJECT,
      properties: {
        exists: { type: SchemaType.BOOLEAN, nullable: true },
        measurements: { type: SchemaType.STRING, nullable: true },
        size_width: { type: SchemaType.STRING, nullable: true },
        size_height: { type: SchemaType.STRING, nullable: true },
        connected_to: { type: SchemaType.STRING, nullable: true },
      },
      nullable: true,
    },
    rumpus: {
      type: SchemaType.OBJECT,
      properties: {
        exists: { type: SchemaType.BOOLEAN, nullable: true },
        measurements: { type: SchemaType.STRING, nullable: true },
        size_width: { type: SchemaType.STRING, nullable: true },
        size_height: { type: SchemaType.STRING, nullable: true },
        connected_to: { type: SchemaType.STRING, nullable: true },
      },
      nullable: true,
    },
    office: {
      type: SchemaType.OBJECT,
      properties: {
        exists: { type: SchemaType.BOOLEAN, nullable: true },
        measurements: { type: SchemaType.STRING, nullable: true },
        size_width: { type: SchemaType.STRING, nullable: true },
        size_height: { type: SchemaType.STRING, nullable: true },
        connected_to: { type: SchemaType.STRING, nullable: true },
      },
      nullable: true,
    },
    laundry: {
      type: SchemaType.OBJECT,
      properties: {
        exists: { type: SchemaType.BOOLEAN, nullable: true },
        measurements: { type: SchemaType.STRING, nullable: true },
        size_width: { type: SchemaType.STRING, nullable: true },
        size_height: { type: SchemaType.STRING, nullable: true },
      },
      nullable: true,
    },

    gas_hot_water: { type: SchemaType.STRING, nullable: true },
    town_gas: { type: SchemaType.STRING, nullable: true },
    bottled_gas: { type: SchemaType.STRING, nullable: true },
    solar_hot_water: { type: SchemaType.STRING, nullable: true },
    insulation: { type: SchemaType.STRING, nullable: true },
    insulation_locations: {
      type: SchemaType.OBJECT,
      properties: {
        ceiling: { type: SchemaType.BOOLEAN, nullable: true },
        walls: { type: SchemaType.BOOLEAN, nullable: true },
        floor: { type: SchemaType.BOOLEAN, nullable: true },
      },
      nullable: true,
    },

    garage: { type: SchemaType.STRING, nullable: true },
    car_port: { type: SchemaType.STRING, nullable: true },
    electric_r_door: { type: SchemaType.STRING, nullable: true },
    septic_tank: { type: SchemaType.STRING, nullable: true },
    town_water: { type: SchemaType.STRING, nullable: true },
    water_tank_capacity_liters: { type: SchemaType.STRING, nullable: true },
    rewired: { type: SchemaType.STRING, nullable: true },
    replumbed: { type: SchemaType.STRING, nullable: true },
    strata_fees: { type: SchemaType.STRING, nullable: true },

    commission: { type: SchemaType.STRING, nullable: true },
    marketing_fee: { type: SchemaType.STRING, nullable: true },
    price_financial: { type: SchemaType.STRING, nullable: true },

    floor_coverings: { type: SchemaType.BOOLEAN, nullable: true },
    window_furnishings: { type: SchemaType.BOOLEAN, nullable: true },
    drapes_blinds: { type: SchemaType.BOOLEAN, nullable: true },
    insect_screens: { type: SchemaType.BOOLEAN, nullable: true },
    clothesline: { type: SchemaType.BOOLEAN, nullable: true },
    tv_antenna: { type: SchemaType.BOOLEAN, nullable: true },

    exhaust_fan: { type: SchemaType.STRING, nullable: true },
    rangehood: { type: SchemaType.STRING, nullable: true },
    stove: { type: SchemaType.STRING, nullable: true },
    wall_oven: { type: SchemaType.STRING, nullable: true },
    hot_plates: { type: SchemaType.STRING, nullable: true },
    microwave: { type: SchemaType.STRING, nullable: true },
    dishwasher: { type: SchemaType.STRING, nullable: true },
    heating: { type: SchemaType.STRING, nullable: true },
    heat_pump: { type: SchemaType.STRING, nullable: true },
    wood_heater: { type: SchemaType.STRING, nullable: true },
    security_system: { type: SchemaType.STRING, nullable: true },
    security_doors: { type: SchemaType.STRING, nullable: true },
    shed: { type: SchemaType.STRING, nullable: true },
    smoke_detectors: { type: SchemaType.STRING, nullable: true },
    solar_panels: { type: SchemaType.STRING, nullable: true },

    unit_number: { type: SchemaType.STRING, nullable: true },
    bottom_handwritten_note: { type: SchemaType.STRING, nullable: true },
    notes_page_content: { type: SchemaType.STRING, nullable: true },
  },
};

export async function* extractListingDataStream(
  images: { base64: string; mimeType: string }[],
  modelId: string = "gemini-2.0-flash-thinking-exp-01-21",
): AsyncGenerator<{ type: "thought" | "data"; content: any }, void, unknown> {
  // Use server-side key first, fallback to public
  const apiKey =
    process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
  const genAI = new GoogleGenerativeAI(apiKey);

  const isThinkingModel =
    modelId.includes("thinking") || modelId.includes("gemini-3");

  // Configure model with thinkingConfig enabled only if supported
  const generationConfig: any = {
    responseMimeType: "application/json",
    responseSchema: listingSchema,
  };

  if (isThinkingModel) {
    // @ts-ignore - thinkingConfig is experimental
    generationConfig.thinkingConfig = {
      includeThoughts: true,
    };
  }

  const model = genAI.getGenerativeModel({
    model: modelId,
    generationConfig,
  });

  yield { type: "thought", content: "Initializing Gemini AI models..." };

  try {
    const prompt = `Analyze this real estate listing form. 
    Review all attached pages including the notes page.
    Extract all handwritten and printed data into the structured JSON format.
    Pay close attention to checkboxes, circled options, and handwritten notes.
    For 'exists' fields in rooms, set to true if the room has data or is checked.
    If a field is empty, return null or empty string.
    
    CRITICAL - HANDWRITTEN NOTES EXTRACTION (DO NOT SKIP):
    - Scan the ENTIRE document for ANY handwritten text - margins, blank spaces, between sections
    - The "Property notes and description" section (usually a blank area for notes) is VERY IMPORTANT
    - Even if handwriting is messy, abbreviated, or uses shorthand, transcribe it as best as possible
    - Capture ALL property features, conditions, renovations, and observations mentioned in handwriting
    - Look for notes about: flooring, roofing, heating, renovations, council info, rates, outdoor areas, appliances
    - Use these fields to capture notes:
      - handwritten_notes_section: Main notes/description area content (CRITICAL - transcribe everything here)
      - bottom_handwritten_note: Any notes at the bottom of any page
      - notes_page_content: Dedicated notes page content
      - handwritten_notes_top.property_note: Property feature notes at top
      - handwritten_notes_top.financial_note: Price/financial notes at top
      - handwritten_notes_top.other_notes: Any other handwritten content
    - Example notes to look for: "vinyl floors", "new roof", "HWC", "solar panels", "council rates", "patio", etc.
    
    IMPORTANT: For the address field, also parse it into address_components following Australian address standards:
    - unit: Unit/Apartment number if present (e.g., "Unit 5", "3", or from format "3/123 Main St" extract "3")
    - street_number: Street number including any suffix (e.g., "123", "45A")
    - street_name: Full street name WITH street type (e.g., "Main Street", "Oak Avenue", "Victoria Road")
    - suburb: Suburb/locality name (e.g., "Surry Hills", "South Melbourne")
    - state: Australian state code - MUST be one of: NSW, VIC, QLD, SA, WA, TAS, NT, ACT
    - postcode: 4-digit Australian postcode (e.g., "2000", "3000")
    
    CRITICAL: For ROOM DIMENSIONS (Bed 1-5, Ensuite, Kitchen, Dining, Lounge, Family, Rumpus, Office, Laundry):
    - If you see dimensions like "4x5", "3x4", or similar patterns, parse them into SEPARATE fields:
      - size_width: the first number (e.g., "4" from "4x5")
      - size_height: the second number (e.g., "5" from "4x5")
    - Also store the full measurement string in the 'measurements' field (e.g., "4x5")
    - If only an X or checkmark is present, set exists=true but leave size_width/size_height empty
    
    Return ONLY the structured JSON.
    
    Also extract:
    - appraisal_date: Date of the appraisal appointment (YYYY-MM-DD)
    - vendor_first_name: First name of the vendor (primary)
    - vendor_last_name: Last name of the vendor (primary)
    - vendor_email: Email address of the vendor
    - vendor_phone: Phone number of the vendor`;

    yield {
      type: "thought",
      content: `Processing ${images.length} page(s) with ${modelId}...`,
    };

    // Convert images to Gemini format
    const imageParts = images.map((img) => ({
      inlineData: {
        data: img.base64,
        mimeType: img.mimeType,
      },
    }));

    yield {
      type: "thought",
      content: "Analyzing document structure and layout...",
    };

    const result = await model.generateContentStream([prompt, ...imageParts]);

    let fullText = "";

    for await (const chunk of result.stream) {
      const candidates = chunk.candidates || [];
      if (candidates.length > 0) {
        const parts = candidates[0].content?.parts || [];
        for (const part of parts) {
          // Check for thought property (experimental)
          if ((part as any).thought) {
            yield { type: "thought", content: part.text };
          }
          // Accumulate standard text (the JSON)
          else if (part.text) {
            fullText += part.text;
          }
        }
      }
    }

    if (!fullText) {
      throw new Error("No data received from Gemini.");
    }

    yield { type: "data", content: fullText };
  } catch (error) {
    console.error("Gemini OCR Error:", error);
    yield { type: "thought", content: "Error occurred during analysis." };
    throw error;
  }
}
