/**
 * Offer Form Types
 * Mirrors SAA types pattern for purchaser offers
 */

// ============================================
// Country Code List (AU & PH prioritized)
// ============================================
export interface CountryCode {
    code: string;
    dial: string;
    name: string;
}

export const COUNTRY_CODES: CountryCode[] = [
    // Priority countries
    { code: "AU", dial: "+61", name: "Australia" },
    { code: "PH", dial: "+63", name: "Philippines" },
    // Alphabetical
    { code: "AF", dial: "+93", name: "Afghanistan" },
    { code: "AL", dial: "+355", name: "Albania" },
    { code: "DZ", dial: "+213", name: "Algeria" },
    { code: "AR", dial: "+54", name: "Argentina" },
    { code: "AT", dial: "+43", name: "Austria" },
    { code: "BD", dial: "+880", name: "Bangladesh" },
    { code: "BE", dial: "+32", name: "Belgium" },
    { code: "BR", dial: "+55", name: "Brazil" },
    { code: "KH", dial: "+855", name: "Cambodia" },
    { code: "CA", dial: "+1", name: "Canada" },
    { code: "CN", dial: "+86", name: "China" },
    { code: "CO", dial: "+57", name: "Colombia" },
    { code: "HR", dial: "+385", name: "Croatia" },
    { code: "CZ", dial: "+420", name: "Czech Republic" },
    { code: "DK", dial: "+45", name: "Denmark" },
    { code: "EG", dial: "+20", name: "Egypt" },
    { code: "FJ", dial: "+679", name: "Fiji" },
    { code: "FI", dial: "+358", name: "Finland" },
    { code: "FR", dial: "+33", name: "France" },
    { code: "DE", dial: "+49", name: "Germany" },
    { code: "GR", dial: "+30", name: "Greece" },
    { code: "HK", dial: "+852", name: "Hong Kong" },
    { code: "IN", dial: "+91", name: "India" },
    { code: "ID", dial: "+62", name: "Indonesia" },
    { code: "IE", dial: "+353", name: "Ireland" },
    { code: "IL", dial: "+972", name: "Israel" },
    { code: "IT", dial: "+39", name: "Italy" },
    { code: "JP", dial: "+81", name: "Japan" },
    { code: "KR", dial: "+82", name: "South Korea" },
    { code: "MY", dial: "+60", name: "Malaysia" },
    { code: "MX", dial: "+52", name: "Mexico" },
    { code: "NL", dial: "+31", name: "Netherlands" },
    { code: "NZ", dial: "+64", name: "New Zealand" },
    { code: "NG", dial: "+234", name: "Nigeria" },
    { code: "NO", dial: "+47", name: "Norway" },
    { code: "PK", dial: "+92", name: "Pakistan" },
    { code: "PG", dial: "+675", name: "Papua New Guinea" },
    { code: "PE", dial: "+51", name: "Peru" },
    { code: "PL", dial: "+48", name: "Poland" },
    { code: "PT", dial: "+351", name: "Portugal" },
    { code: "RO", dial: "+40", name: "Romania" },
    { code: "RU", dial: "+7", name: "Russia" },
    { code: "SA", dial: "+966", name: "Saudi Arabia" },
    { code: "SG", dial: "+65", name: "Singapore" },
    { code: "ZA", dial: "+27", name: "South Africa" },
    { code: "ES", dial: "+34", name: "Spain" },
    { code: "LK", dial: "+94", name: "Sri Lanka" },
    { code: "SE", dial: "+46", name: "Sweden" },
    { code: "CH", dial: "+41", name: "Switzerland" },
    { code: "TW", dial: "+886", name: "Taiwan" },
    { code: "TH", dial: "+66", name: "Thailand" },
    { code: "TR", dial: "+90", name: "Turkey" },
    { code: "AE", dial: "+971", name: "UAE" },
    { code: "GB", dial: "+44", name: "United Kingdom" },
    { code: "US", dial: "+1", name: "United States" },
    { code: "VN", dial: "+84", name: "Vietnam" },
];

// ============================================
// Property from VaultRE
// ============================================
export interface OfferProperty {
    id: number;
    displayAddress: string;
    street: string;
    suburb: string;
    state: string;
    postcode: string;
    status: string;
    bed?: number;
    bath?: number;
    garages?: number;
    landArea?: string;
    floorArea?: string;
    searchPrice?: number;
    priceText?: string;
    mainImageUrl?: string;
    contactStaff?: { id: number; firstName?: string; lastName?: string }[];
}

// ============================================
// Purchaser Info (mirrors VendorInfo pattern)
// ============================================
export interface PurchaserInfo {
    fullName: string;
    email: string;
    mobileCountryCode: string;
    mobileNumber: string;
    street: string;
    suburb: string;
    state: string;
    postcode: string;
}

// ============================================
// Main Form Data
// ============================================
export interface OfferFormData {
    // Property Selection
    propertyId: number | null;
    propertyAddress: string;
    propertyStreet: string;
    propertySuburb: string;
    propertyState: string;
    propertyPostcode: string;
    propertyStatus: string;
    propertyBed: number | null;
    propertyBath: number | null;
    propertyGarages: number | null;
    propertyMainImage: string;
    propertyContactStaff: string;

    // Purchaser Section
    purchaserStructure: "Individual" | "Company" | "Trust";
    trusteeType: "individual" | "company";
    trustName: string;
    companyName: string;
    companyACN: string;
    purchaserCount: 1 | 2 | 3 | 4;
    purchasers: PurchaserInfo[];

    // Solicitor Section
    solicitorFirm: string;
    solicitorName: string;
    solicitorEmail: string;
    solicitorMobileCountryCode: string;
    solicitorMobileNumber: string;

    // Offer Details
    offerPrice: string;
    depositAmount: string;

    // Offer Conditions
    financeRequired: boolean;
    bankLender: string;
    financeAmount: string;
    buildingInspection: boolean;
    coolingOffPeriod: boolean;
    settlementPeriod: string;
    specialClauses: string;
}

// ============================================
// Factory Functions
// ============================================
export function createEmptyPurchaser(): PurchaserInfo {
    return {
        fullName: "",
        email: "",
        mobileCountryCode: "+61",
        mobileNumber: "",
        street: "",
        suburb: "",
        state: "",
        postcode: "",
    };
}

export const initialOfferFormData: OfferFormData = {
    // Property
    propertyId: null,
    propertyAddress: "",
    propertyStreet: "",
    propertySuburb: "",
    propertyState: "",
    propertyPostcode: "",
    propertyStatus: "",
    propertyBed: null,
    propertyBath: null,
    propertyGarages: null,
    propertyMainImage: "",
    propertyContactStaff: "",

    // Purchaser
    purchaserStructure: "Individual",
    trusteeType: "individual",
    trustName: "",
    companyName: "",
    companyACN: "",
    purchaserCount: 1,
    purchasers: [createEmptyPurchaser()],

    // Solicitor
    solicitorFirm: "",
    solicitorName: "",
    solicitorEmail: "",
    solicitorMobileCountryCode: "+61",
    solicitorMobileNumber: "",

    // Offer Details
    offerPrice: "",
    depositAmount: "",

    // Conditions
    financeRequired: false,
    bankLender: "",
    financeAmount: "",
    buildingInspection: false,
    coolingOffPeriod: false,
    settlementPeriod: "",
    specialClauses: "",
};
