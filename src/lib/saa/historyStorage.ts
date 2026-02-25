import { createClient } from "@/lib/supabase/client";
import type { FormData } from "./types";

export interface HistoryEntry {
  id: string; // The UUID from db
  timestamp: number;
  status: 'draft' | 'completed';
  userId: string;
  isOwner: boolean;
  vendorName: string;
  propertyAddress: string;
  listingPrice: string;
  formData: FormData;
}

export async function getHistory(): Promise<HistoryEntry[]> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from("saa_submissions")
      .select("*")
      .or(`status.eq.completed,and(status.eq.draft,user_id.eq.${user.id})`)
      .order("updated_at", { ascending: false });

    if (error) throw error;

    return data.map((row) => ({
      id: row.id,
      timestamp: new Date(row.updated_at).getTime(),
      status: row.status as 'draft' | 'completed',
      userId: row.user_id,
      isOwner: row.user_id === user.id,
      vendorName: row.vendor_name || "Unknown Vendor",
      propertyAddress: row.property_address || "Unknown Address",
      listingPrice: row.listing_price || "",
      formData: row.form_data as unknown as FormData,
    }));
  } catch (error) {
    console.error("Failed to load history:", (error as { message?: string })?.message || JSON.stringify(error, null, 2) || error);
    return [];
  }
}

export async function saveSubmission(
  formData: FormData,
  status: 'draft' | 'completed' = 'completed',
  existingId?: string
): Promise<string | null> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error("No user found");
      return null;
    }

    const vendorName = formData.vendors[0]?.fullName || "Unknown Vendor";
    const propertyAddress = `${formData.propertyStreet}, ${formData.propertySuburb} ${formData.propertyState} ${formData.propertyPostcode}`;

    // Validate empty or undefined properties so it doesn't fail checking if required
    const listingPrice = formData.listingPrice || "TBD";

    const payload = {
      user_id: user.id,
      status,
      form_data: formData as unknown as Record<string, unknown>, // Supabase jsonb
      vendor_name: vendorName,
      property_address: propertyAddress,
      listing_price: listingPrice,
      updated_at: new Date().toISOString(),
    };

    if (existingId) {
      // Update existing record
      const { error } = await supabase
        .from("saa_submissions")
        .update(payload)
        .eq("id", existingId);

      if (error) throw error;
      return existingId;
    } else {
      // Insert new record
      const { data, error } = await supabase
        .from("saa_submissions")
        .insert(payload)
        .select("id")
        .single();

      if (error) throw error;
      return data.id;
    }
  } catch (error) {
    console.error("Failed to save submission to history:", (error as { message?: string })?.message || JSON.stringify(error, null, 2) || error);
    return null;
  }
}

export async function loadSubmission(id: string): Promise<FormData | null> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("saa_submissions")
      .select("form_data")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data.form_data as unknown as FormData;
  } catch (error) {
    console.error("Failed to load submission:", error);
    return null;
  }
}

export async function deleteSubmission(id: string): Promise<void> {
  try {
    const supabase = createClient();
    const { error } = await supabase
      .from("saa_submissions")
      .delete()
      .eq("id", id);

    if (error) throw error;
  } catch (error) {
    console.error("Failed to delete submission:", error);
  }
}

export async function clearAllHistory(): Promise<void> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("saa_submissions")
      .delete()
      .eq("user_id", user.id);

    if (error) throw error;
  } catch (error) {
    console.error("Failed to clear history:", (error as { message?: string })?.message || JSON.stringify(error, null, 2) || error);
  }
}

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
