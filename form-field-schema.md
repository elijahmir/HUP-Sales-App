{
"handwritten_notes_top": {
"financial_note": "string",
"property_note": "string",
"other_notes": "string"
},

"listing_agent": "string",
"appraisal_date": "string (YYYY-MM-DD)",
"vendor_first_name": "string",
"vendor_last_name": "string",
"vendor_email": "string",
"vendor_phone": "string",
"agency_type": {
"type": "select",
"options": ["Sole", "Open", "Joint"]
},
"date_listed": "date",

"address": "string",
"address_components": {
"unit": "string",
"street_number": "string",
"street_name": "string",
"suburb": "string",
"state": {
"type": "select",
"options": ["NSW", "VIC", "QLD", "SA", "WA", "TAS", "NT", "ACT"]
},
"postcode": "string"
},
"title_ref": "string",
"pid": "string",

"price": {
"display_text": "string",
"method": {
"type": "select",
"options": ["OTO", "Offers To", "Tender", "Auction", "By Negotiation", "Fixed", ""]
},
"amount": "string",
"range_from": "string",
"range_to": "string"
},

"bedrooms_icon_count": "number",
"bathrooms_icon_count": "number",
"parking_icon_count": "number",

"year_built": "string",
"construction": {
"type": {
"type": "select",
"options": ["B", "BV", "WB", "R"]
},
"description": "string"
},
"zoning": "string",
"rates": "currency",

"land_size": "string",
"windows": {
"type": "multiselect",
"options": ["Timber", "Alum", "DBL", "Single"]
},
"council": "string",
"water_rates": "currency",

"building_size": "string",
"roof": {
"type": "select",
"options": ["Tile", "CB", "T"]
},
"capital_value": "currency",
"land_value": "currency",

"vendors": "string",
"phone_numbers": "string",
"postal_address": "string",
"email": "string",
"solicitor": "string",

"handwritten_notes_section": "text",

"bed_1": {
"exists": "boolean",
"wardrobe_type": {
"type": "select",
"options": ["BI", "WI", "None"]
},
"measurements": "string",
"ensuite": {
"measurements": "string",
"type": {
"type": "select",
"options": ["SOB", "Sep Shower", "Bath"]
}
}
},

"bed_2": {
"exists": "boolean",
"wardrobe_type": {
"type": "select",
"options": ["BI", "WI", "None"]
},
"measurements": "string"
},

"bed_3": {
"exists": "boolean",
"wardrobe_type": {
"type": "select",
"options": ["BI", "WI", "None"]
},
"measurements": "string"
},

"bed_4": {
"exists": "boolean",
"wardrobe_type": {
"type": "select",
"options": ["BI", "WI", "None"]
},
"measurements": "string"
},

"bed_5": {
"exists": "boolean",
"wardrobe_type": {
"type": "select",
"options": ["BI", "WI", "None"]
},
"measurements": "string"
},

"bathroom": {
"exists": "boolean",
"measurements": "string",
"type": {
"type": "select",
"options": ["SOB", "Sep Shower", "Bath"]
}
},

"toilets": {
"type": "select",
"options": [1, 2, 3, 4]
},

"kitchen": {
"exists": "boolean",
"measurements": "string",
"connected_to": "string"
},

"dining": {
"exists": "boolean",
"measurements": "string",
"connected_to": "string"
},

"lounge": {
"exists": "boolean",
"measurements": "string",
"connected_to": "string"
},

"family": {
"exists": "boolean",
"measurements": "string",
"connected_to": "string"
},

"rumpus": {
"exists": "boolean",
"measurements": "string",
"connected_to": "string"
},

"office": {
"exists": "boolean",
"measurements": "string",
"connected_to": "string"
},

"laundry": {
"exists": "boolean",
"measurements": "string"
},

"gas_hot_water": {
"type": "select",
"options": ["Yes", "No"]
},
"town_gas": {
"type": "select",
"options": ["Yes", "No"]
},
"bottled_gas": {
"type": "select",
"options": ["Yes", "No"]
},
"solar_hot_water": {
"type": "select",
"options": ["Yes", "No"]
},
"insulation": {
"type": "select",
"options": ["Yes", "No"]
},
"insulation_locations": {
"ceiling": "boolean",
"walls": "boolean",
"floor": "boolean"
},

"garage": "string",
"car_port": "string",
"electric_r_door": {
"type": "select",
"options": ["Yes", "No"]
},
"septic_tank": "string",
"town_water": {
"type": "select",
"options": ["Yes", "No"]
},
"water_tank_capacity_liters": "string",
"rewired": "string",
"replumbed": "string",
"strata_fees": "currency",

"commission": "string",
"marketing_fee": "currency",
"price_financial": "currency",

"floor_coverings": "boolean",
"window_furnishings": "boolean",
"drapes_blinds": "boolean",
"insect_screens": "boolean",
"clothesline": "boolean",
"tv_antenna": "boolean",

"exhaust_fan": "string",
"rangehood": "string",
"stove": "string",
"wall_oven": "string",
"hot_plates": "string",
"microwave": "string",
"dishwasher": "string",
"heating": "string",
"heat_pump": "string",
"wood_heater": "string",
"security_system": "string",
"security_doors": "string",
"shed": "string",
"smoke_detectors": "string",
"solar_panels": "string",

"unit_number": "string",
"bottom_handwritten_note": "string",

"notes_page_content": "text"
}
