export interface VendorInfo {
  fullName: string;
  email: string;
  mobile: string;
  homePhone: string;
  sameAsProperty: boolean;
  street: string;
  suburb: string;
  state: string;
  postcode: string;
  hasDifferentNameOnTitle: boolean;
  nameOnTitle: string;
}

export interface AnnexureItem {
  item: string;
  description: string;
}

export function createEmptyAnnexure(): AnnexureItem {
  return { item: "", description: "" };
}

export interface FormData {
  // Agent Section
  agentName: string;
  agentEmail: string;
  agentMobile: string;
  officeName: string;
  officeStreet: string;
  officeSuburb: string;
  officeState: string;
  officePostcode: string;
  officeAddress: string;
  officePhone: string;

  // Property Section
  propertyStreet: string;
  propertySuburb: string;
  propertyState: string;
  propertyPostcode: string;
  ctVolume: string;
  folioNo: string;
  pid: string;
  listingNo: string;
  annexureA: boolean;
  annexureCount: number;
  annexureItems: AnnexureItem[];
  listingPrice: string;
  commissionType: "fixed" | "percentage" | "reit";
  commissionValue: string;
  gstTaxable: boolean;
  agencyPeriodType: "standard" | "development";
  soleAgencyPeriod: string;

  // Vendor Section
  vendorStructure: "Individual" | "Company" | "Trust";
  trusteeType: "individual" | "company";
  trustName: string;
  companyName: string;
  companyACN: string;
  hasMultipleDirectors: boolean;
  vendorDocument: File | null;
  vendorCount: 1 | 2 | 3 | 4;
  vendors: VendorInfo[];

  // Marketing Section
  selectedMarketing: string[];
}

export const initialFormData: FormData = {
  agentName: "",
  agentEmail: "",
  agentMobile: "",
  officeName: "",
  officeStreet: "",
  officeSuburb: "",
  officeState: "",
  officePostcode: "",
  officeAddress: "",
  officePhone: "",

  propertyStreet: "",
  propertySuburb: "",
  propertyState: "TAS",
  propertyPostcode: "",
  ctVolume: "",
  folioNo: "",
  pid: "",
  listingNo: "",
  annexureA: false,
  annexureCount: 1,
  annexureItems: [
    createEmptyAnnexure(),
    createEmptyAnnexure(),
    createEmptyAnnexure(),
    createEmptyAnnexure(),
    createEmptyAnnexure(),
    createEmptyAnnexure(),
    createEmptyAnnexure(),
    createEmptyAnnexure(),
    createEmptyAnnexure(),
    createEmptyAnnexure(),
    createEmptyAnnexure(),
    createEmptyAnnexure(),
    createEmptyAnnexure(),
  ],
  listingPrice: "",
  commissionType: "percentage",
  commissionValue: "",
  gstTaxable: false,
  agencyPeriodType: "standard",
  soleAgencyPeriod: "",
  // continuingPeriod removed to match reference

  vendorStructure: "Individual",
  trusteeType: "individual",
  trustName: "",
  companyName: "",
  companyACN: "",
  hasMultipleDirectors: false,
  vendorDocument: null,
  vendorCount: 1,
  vendors: [
    createEmptyVendor(),
    createEmptyVendor(),
    createEmptyVendor(),
    createEmptyVendor(),
  ],

  selectedMarketing: [],
};

export function createEmptyVendor(): VendorInfo {
  return {
    fullName: "",
    email: "",
    mobile: "",
    homePhone: "",
    sameAsProperty: false,
    street: "",
    suburb: "",
    state: "TAS",
    postcode: "",
    hasDifferentNameOnTitle: false,
    nameOnTitle: "",
  };
}
