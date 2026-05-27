/**
 * Missing Millions CRM — Type Definitions
 *
 * Types for property tracking, contacts CRM, pipeline stages,
 * notes, tasks, and navigation.
 */

// --- Property Tracking Types ---

export type PropertyStatus = "For Sale" | "Sold" | "Under Offer" | "Withdrawn";

export type GCChoice = "Yes" | "No" | "TBA";

export type AppraisedChoice =
  | "Yes"
  | "No"
  | "Appraised - Listed"
  | "Appraised - Not Listed"
  | "Yes - Listed"
  | "Yes - Not Listed"
  | "TBA";

export interface PropertyRecord {
  id: string;
  status: PropertyStatus;
  postCode: string;
  suburb: string;
  address: string;
  vendorName: string;
  agency: string;
  agent: string;
  url: string;
  listingDate: string;
  listingPrice: string;
  daysOnMarket: number;
  gcPropertyInVaultRE: GCChoice;
  gcContactInVaultRE: GCChoice;
  gcAppraised: AppraisedChoice;
  agentContact: string;
  saleDate: string;
  salePrice: string;
  notListedReason?: string;
  lostListing?: string;
  lossReason?: string;
  feedback?: string;
}

export interface ImportRecord {
  date: string;
  source: "REA Buy" | "REA Sold" | "REA Scanner" | "SharePoint";
  count: number;
}

export interface MatchResult {
  match: boolean;
  score: number;
  matchedRecord?: PropertyRecord;
}

// --- CRM Supabase Types ---

export interface PipelineStage {
  id: string;
  name: string;
  order_num: number;
  created_at?: string;
}

export interface Contact {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  assigned_agent?: string | null;
  last_contacted_at?: string | null;
  next_follow_up_at?: string | null;
  pipeline_stage_id?: string | null;
  provenance?: string | null;
  created_at?: string;
  updated_at?: string;

  // Joined fields
  pipeline_stage?: PipelineStage;
}

export interface ContactPropertyLink {
  id: string;
  contact_id: string;
  property_id: string;
  created_at?: string;
}

export type NoteType =
  | "call"
  | "sms"
  | "email"
  | "meeting"
  | "appraisal"
  | "general";

export interface Note {
  id: string;
  contact_id: string;
  type: NoteType;
  content: string;
  author: string;
  created_at?: string;
}

export interface Task {
  id: string;
  contact_id: string;
  description: string;
  due_date?: string | null;
  status: "pending" | "completed";
  created_at?: string;
  completed_at?: string | null;
}

// --- Navigation ---

export interface MMNavTab {
  name: string;
  href: string;
  icon: string;
  badge?: number;
}

export const MM_NAV_TABS: MMNavTab[] = [
  { name: "Dashboard", href: "/dashboard/missing-millions", icon: "layout-dashboard" },
  { name: "Customers", href: "/dashboard/missing-millions/customers", icon: "users" },
  { name: "Contacts", href: "/dashboard/missing-millions/contacts", icon: "contact" },
  { name: "Pipeline", href: "/dashboard/missing-millions/pipeline", icon: "kanban" },
  { name: "Sold Updates", href: "/dashboard/missing-millions/sold-updates", icon: "refresh-cw" },
  { name: "VaultRE Checker", href: "/dashboard/missing-millions/vault-checker", icon: "check-square" },
  { name: "Vendor Lookup", href: "/dashboard/missing-millions/vendor-lookup", icon: "search" },
  { name: "Export", href: "/dashboard/missing-millions/export", icon: "download" },
];

// --- Constants ---

export const COVERED_POSTCODES = [
  "7305",
  "7306",
  "7307",
  "7310",
  "7315",
  "7316",
];
