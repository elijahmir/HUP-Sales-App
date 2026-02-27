/**
 * Offer Form History Storage
 * Supabase CRUD for sales_offer_submissions table
 * Mirrors SAA historyStorage.ts pattern
 */

import { createClient } from "@/lib/supabase/client";
import type { OfferFormData } from "./types";

export interface OfferHistoryEntry {
    id: string;
    status: "draft" | "completed";
    purchaserName: string;
    propertyAddress: string;
    offerPrice: string;
    createdAt: string;
    updatedAt: string;
    isOwn: boolean;
}

/**
 * Relative time display
 */
export function getRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString("en-AU");
}

/**
 * Fetch submission history
 */
export async function getHistory(): Promise<OfferHistoryEntry[]> {
    const supabase = createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return [];

    const { data, error } = await supabase
        .from("sales_offer_submissions")
        .select("id, status, purchaser_name, property_address, offer_price, created_at, updated_at, user_id")
        .order("updated_at", { ascending: false });

    if (error) {
        console.error("Error fetching offer history:", error);
        return [];
    }

    return (data || []).map((entry) => ({
        id: entry.id,
        status: entry.status as "draft" | "completed",
        purchaserName: entry.purchaser_name || "Untitled",
        propertyAddress: entry.property_address || "No address",
        offerPrice: entry.offer_price || "",
        createdAt: entry.created_at,
        updatedAt: entry.updated_at,
        isOwn: entry.user_id === user.id,
    }));
}

/**
 * Save or update a submission
 */
export async function saveSubmission(
    formData: OfferFormData,
    status: "draft" | "completed" = "completed",
    existingId?: string
): Promise<string | null> {
    const supabase = createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    // Build summary fields for the table columns
    const purchaserName =
        formData.purchasers[0]?.fullName ||
        formData.companyName ||
        formData.trustName ||
        "Untitled";
    const propertyAddress = formData.propertyAddress || "No address";
    const offerPrice = formData.offerPrice || "";

    if (existingId) {
        // Update existing
        const { error } = await supabase
            .from("sales_offer_submissions")
            .update({
                status,
                form_data: formData,
                updated_at: new Date().toISOString(),
                purchaser_name: purchaserName,
                property_address: propertyAddress,
                offer_price: offerPrice,
            })
            .eq("id", existingId)
            .eq("user_id", user.id);

        if (error) {
            console.error("Error updating offer submission:", error);
            return null;
        }
        return existingId;
    } else {
        // Insert new
        const { data, error } = await supabase
            .from("sales_offer_submissions")
            .insert({
                user_id: user.id,
                status,
                form_data: formData,
                purchaser_name: purchaserName,
                property_address: propertyAddress,
                offer_price: offerPrice,
            })
            .select("id")
            .single();

        if (error) {
            console.error("Error saving offer submission:", error);
            return null;
        }
        return data?.id || null;
    }
}

/**
 * Load a specific submission's form data
 */
export async function loadSubmission(
    submissionId: string
): Promise<OfferFormData | null> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from("sales_offer_submissions")
        .select("form_data")
        .eq("id", submissionId)
        .single();

    if (error) {
        console.error("Error loading offer submission:", error);
        return null;
    }

    return (data?.form_data as OfferFormData) || null;
}

/**
 * Delete a submission (own only — enforced by RLS)
 */
export async function deleteSubmission(submissionId: string): Promise<boolean> {
    const supabase = createClient();

    const { error } = await supabase
        .from("sales_offer_submissions")
        .delete()
        .eq("id", submissionId);

    if (error) {
        console.error("Error deleting offer submission:", error);
        return false;
    }
    return true;
}
