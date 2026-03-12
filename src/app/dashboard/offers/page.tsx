"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
    DollarSign,
    Home,
    TrendingUp,
    Users,
    ChevronDown,
    ChevronUp,
    MapPin,
    Bed,
    Bath,
    Car,
    Clock,
    Filter,
    Search,
    Loader2,
    BarChart3,
    Trophy,
    Download,
    Trash2,
    FileText,
    Pencil,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { X, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";
import type { OfferFormData, ContactStaffInfo } from "@/lib/offer/types";
import { generateVendorOfferReport } from "@/lib/offer/VendorOfferReport";
import type { ReportData, OfferData, AgentInfo } from "@/lib/offer/VendorOfferReport";
import { getChanges } from "@/lib/offer/diff";
import ExpandedOffersTable from "@/components/dashboard/ExpandedOffersTable";

// Types
interface OfferRow {
    id: string;
    status: string;
    form_data: OfferFormData;
    purchaser_name: string;
    property_address: string;
    offer_price: string;
    created_at: string;
    updated_at: string;
    original_form_data?: OfferFormData;
    submitter_email: string | null;
    contract_drafted?: boolean;
    contract_drafted_by?: string | null;
    contract_drafted_at?: string | null;
    contract_signed?: boolean;
    contract_signed_by?: string | null;
    contract_signed_at?: string | null;
}

interface PropertyGroup {
    propertyAddress: string;
    propertyState: string;
    propertySuburb: string;
    propertyImage: string;
    bed: number | null;
    bath: number | null;
    garages: number | null;
    offers: OfferRow[];
    highestOffer: number;
    lowestOffer: number;
    avgOffer: number;
    totalOffers: number;
    latestDate: string;
    agents?: ContactStaffInfo[];
    isArchived?: boolean;
}



function parsePrice(price: string): number {
    return Number(price.replace(/[^0-9.]/g, "")) || 0;
}

function formatPrice(num: number): string {
    return num.toLocaleString("en-AU", { maximumFractionDigits: 0 });
}

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

// Stat Card
function StatCard({
    title,
    value,
    subtitle,
    icon: Icon,
    color,
}: {
    title: string;
    value: string;
    subtitle?: string;
    icon: React.ElementType;
    color: string;
}) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {title}
                    </p>
                    <p className="text-2xl font-bold text-[#001F49] mt-1">{value}</p>
                    {subtitle && (
                        <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
                    )}
                </div>
                <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}
                >
                    <Icon className="w-5 h-5" />
                </div>
            </div>
        </div>
    );
}

// Property Offer Card
function PropertyOfferCard({
    group,
    isExpanded,
    onToggle,
    onOfferClick,
    onDeleteOffer,
    onDownloadReport,
    onToggleContractDrafted,
    onToggleContractSigned,
    currentUserEmail,
}: {
    group: PropertyGroup;
    isExpanded: boolean;
    onToggle: () => void;
    onOfferClick: (offer: OfferRow) => void;
    onDeleteOffer: (offer: OfferRow) => void;
    onDownloadReport: (group: PropertyGroup) => void;
    onToggleContractDrafted: (offer: OfferRow, drafted: boolean) => void;
    onToggleContractSigned: (offer: OfferRow, signed: boolean) => void;
    currentUserEmail: string;
}) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            {/* Property Header */}
            <button
                onClick={onToggle}
                className="w-full text-left p-5 hover:bg-gray-50/50 transition-colors"
            >
                <div className="flex items-start gap-4">
                    {/* Thumbnail */}
                    <div className="w-16 h-12 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 flex-shrink-0 overflow-hidden">
                        {group.propertyImage ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={group.propertyImage}
                                alt=""
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <Home className="w-5 h-5 text-slate-300" />
                            </div>
                        )}
                    </div>

                    {/* Property Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-[#001F49] truncate text-sm capitalize">
                                {group.propertyAddress.replace(/,/g, "")}
                            </h3>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                            <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {group.propertySuburb} {group.propertyState}
                            </span>
                            {group.bed != null && (
                                <span className="flex items-center gap-0.5">
                                    <Bed className="w-3 h-3" /> {group.bed}
                                </span>
                            )}
                            {group.bath != null && (
                                <span className="flex items-center gap-0.5">
                                    <Bath className="w-3 h-3" /> {group.bath}
                                </span>
                            )}
                            {group.garages != null && (
                                <span className="flex items-center gap-0.5">
                                    <Car className="w-3 h-3" /> {group.garages}
                                </span>
                            )}
                        </div>

                        {/* Agent Avatars */}
                        {Array.isArray(group.agents) && group.agents.length > 0 && (
                            <div className="flex items-center gap-1.5 mt-2.5">
                                {group.agents.slice(0, 2).map((agent, i) => (
                                    agent?.photoUrl ? (
                                        <div key={i} className="w-6 h-6 rounded-full overflow-hidden border border-gray-200 bg-gray-50 flex-shrink-0">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={agent.photoUrl} alt="Agent" className="w-full h-full object-cover" />
                                        </div>
                                    ) : null
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-6 flex-shrink-0">
                        <div className="text-right">
                            <span className="text-xs text-gray-400">Offers</span>
                            <p className="font-bold text-[#001F49]">{group.totalOffers}</p>
                        </div>
                        <div className="text-right">
                            <span className="text-xs text-gray-400">Highest</span>
                            <p className="font-bold text-emerald-600">
                                ${formatPrice(group.highestOffer)}
                            </p>
                        </div>
                        <div className="text-right hidden sm:block">
                            <span className="text-xs text-gray-400">Avg</span>
                            <p className="font-bold text-gray-600">
                                ${formatPrice(group.avgOffer)}
                            </p>
                        </div>
                        {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-gray-400" />
                        ) : (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                        )}
                    </div>
                </div>
            </button>

            {/* Expanded Offers */}
            {isExpanded && (
                <ExpandedOffersTable
                    group={group as any}
                    onDownloadReport={onDownloadReport}
                    onOfferClick={onOfferClick}
                    onDeleteOffer={onDeleteOffer}
                    onToggleContractDrafted={onToggleContractDrafted}
                    onToggleContractSigned={onToggleContractSigned}
                    currentUserEmail={currentUserEmail}
                />
            )}
        </div>
    );
}

// Offer Details Modal
function OfferDetailsModal({ offer, onClose }: { offer: OfferRow | null; onClose: () => void }) {
    if (!offer) return null;
    const fd = offer.form_data;
    const isEdited = new Date(offer.updated_at).getTime() - new Date(offer.created_at).getTime() > 5000;
    const changes = isEdited && offer.original_form_data ? getChanges(offer.original_form_data, fd) : [];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-fade-in">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-xl font-bold text-[#001F49]">
                                Offer from {offer.purchaser_name}
                            </h2>
                            {isEdited && (
                                <span className="px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold rounded-full flex items-center gap-1.5" title={`Last edited: ${new Date(offer.updated_at).toLocaleString()}`}>
                                    Edited
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                            Submitted on {new Date(offer.created_at).toLocaleString()}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link
                            href={`/offer/edit/${offer.id}`}
                            className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-semibold"
                            onClick={onClose}
                        >
                            <Pencil className="w-4 h-4" />
                            Edit Offer
                        </Link>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto overflow-x-hidden space-y-8 flex-1">
                    {/* Diff Viewer */}
                    {changes.length > 0 && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 shadow-sm">
                            <h3 className="text-sm font-bold text-amber-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                Recent Changes
                            </h3>
                            <div className="space-y-2">
                                {changes.map((c, i) => (
                                    <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-3 rounded-lg border border-amber-100 shadow-sm gap-2">
                                        <div className="text-sm font-medium text-gray-900 min-w-[150px]">{c.label}</div>
                                        <div className="flex items-center gap-2 flex-1 text-sm">
                                            <span className="text-red-600 bg-red-50 px-2 py-1 rounded truncate flex-1 line-through" title={c.oldValue}>{c.oldValue}</span>
                                            <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                            <span className="text-emerald-700 bg-emerald-50 px-2 py-1 rounded font-medium truncate flex-1" title={c.newValue}>{c.newValue}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Left Column */}
                        <div className="space-y-8">
                            <section>
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Purchaser Structure</h3>
                                <div className="space-y-3 text-sm">
                                    {fd.isRepresentedByBuyersAgent && (
                                        <div className="mb-4 pb-4 border-b border-gray-100 bg-blue-50/30 -mx-2 px-2 rounded-lg pt-2">
                                            <p className="text-[11px] font-bold text-harcourts-blue uppercase tracking-wider mb-3">Represented by Buyer's Agent</p>
                                            <div className="grid grid-cols-3 text-gray-500 mb-2">
                                                <span className="col-span-1 border-r border-gray-100">Agency</span>
                                                <span className="col-span-2 pl-3 text-gray-900 font-medium">{fd.buyersAgency}</span>
                                            </div>
                                            <div className="grid grid-cols-3 text-gray-500 mb-2">
                                                <span className="col-span-1 border-r border-gray-100">Agent</span>
                                                <span className="col-span-2 pl-3 text-gray-900 font-medium">{fd.buyersAgentName}</span>
                                            </div>
                                            <div className="grid grid-cols-3 text-gray-500 mb-2 items-center">
                                                <span className="col-span-1 border-r border-gray-100">Contact</span>
                                                <span className="col-span-2 pl-3 text-gray-900 font-medium text-xs break-all leading-tight">
                                                    {fd.buyersAgentMobileCode} {fd.buyersAgentMobile}<br />
                                                    <a href={`mailto:${fd.buyersAgentEmail}`} className="text-harcourts-blue hover:underline">{fd.buyersAgentEmail}</a>
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                    <div className="grid grid-cols-3 text-gray-500">
                                        <span className="col-span-1 border-r border-gray-100">Structure</span>
                                        <span className="col-span-2 pl-3 text-gray-900 font-medium">{fd.purchaserStructure}</span>
                                    </div>
                                    {fd.companyName && (
                                        <div className="grid grid-cols-3 text-gray-500">
                                            <span className="col-span-1 border-r border-gray-100">Company</span>
                                            <span className="col-span-2 pl-3 text-gray-900 font-medium">{fd.companyName} {fd.companyACN && `ACN: ${fd.companyACN}`}</span>
                                        </div>
                                    )}
                                    {fd.trustName && (
                                        <div className="grid grid-cols-3 text-gray-500">
                                            <span className="col-span-1 border-r border-gray-100">Trust</span>
                                            <span className="col-span-2 pl-3 text-gray-900 font-medium">{fd.trustName}</span>
                                        </div>
                                    )}
                                    <div className="mt-4">
                                        <p className="text-xs text-gray-500 font-medium mb-2 uppercase">Individuals</p>
                                        <div className="space-y-2">
                                            {fd.purchasers.slice(0, fd.purchaserCount || 1).map((p, i) => (
                                                <div key={i} className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                                    <p className="font-semibold text-gray-900">{p.fullName || `Purchaser ${i + 1} (Name pending)`}</p>
                                                    <p className="text-xs text-gray-500">{p.email} • {p.mobileCountryCode || "+61"} {p.mobileNumber}</p>
                                                    <p className="text-xs text-gray-500 mt-1">{[p.street, p.suburb, p.state, p.postcode].filter(Boolean).join(" ").replace(/,/g, "")}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section>
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Solicitor Details</h3>
                                <div className="space-y-3 text-sm">
                                    <div className="grid grid-cols-3 text-gray-500">
                                        <span className="col-span-1 border-r border-gray-100">Firm</span>
                                        <span className="col-span-2 pl-3 text-gray-900 font-medium">{fd.solicitorFirm}</span>
                                    </div>
                                    <div className="grid grid-cols-3 text-gray-500">
                                        <span className="col-span-1 border-r border-gray-100">Name</span>
                                        <span className="col-span-2 pl-3 text-gray-900 font-medium">{fd.solicitorName}</span>
                                    </div>
                                    <div className="grid grid-cols-3 text-gray-500">
                                        <span className="col-span-1 border-r border-gray-100">Email</span>
                                        <span className="col-span-2 pl-3 text-gray-900 font-medium">{fd.solicitorEmail}</span>
                                    </div>
                                </div>
                            </section>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-8">
                            <section>
                                <h3 className="text-sm font-bold text-emerald-600 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Offer Details</h3>
                                <div className="space-y-3 text-sm bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                                    <div className="grid grid-cols-3 text-gray-600">
                                        <span className="col-span-1">Offer Price</span>
                                        <span className="col-span-2 font-bold text-emerald-700 text-lg">${fd.offerPrice}</span>
                                    </div>
                                    <div className="grid grid-cols-3 text-gray-600">
                                        <span className="col-span-1">Deposit</span>
                                        <span className="col-span-2 font-bold text-gray-900">${fd.depositAmount}</span>
                                    </div>
                                </div>
                            </section>

                            <section>
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Conditions</h3>
                                <div className="space-y-4 text-sm">
                                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                        <div className="flex items-center gap-2 mb-2">
                                            {fd.financeRequired ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <X className="w-4 h-4 text-gray-300" />}
                                            <span className="font-semibold text-gray-900">Finance Required</span>
                                        </div>
                                        {fd.financeRequired && (
                                            <div className="ml-6 space-y-1 text-xs text-gray-500">
                                                <p>Lender: <span className="font-medium text-gray-900">{fd.bankLender}</span></p>
                                                <p>Amount: <span className="font-medium text-gray-900">${fd.financeAmount}</span></p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex items-center gap-2">
                                            {fd.buildingInspection ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <X className="w-4 h-4 text-gray-300" />}
                                            <span className="text-gray-900">Building Inspection</span>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex items-center gap-2">
                                            {fd.coolingOffPeriod ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <X className="w-4 h-4 text-gray-300" />}
                                            <span className="text-gray-900">Cooling Off Period</span>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                        <p className="text-xs text-gray-500 mb-1">Settlement Period</p>
                                        <p className="font-medium text-gray-900">{fd.settlementPeriod}</p>
                                    </div>

                                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                        <div className="flex items-center gap-2 mb-2">
                                            {fd.subjectToSale ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <X className="w-4 h-4 text-gray-300" />}
                                            <span className="font-semibold text-gray-900">Subject to Sale</span>
                                        </div>
                                        {fd.subjectToSale && (
                                            <div className="ml-6 space-y-1 text-xs text-gray-500">
                                                <p>Address: <span className="font-medium text-gray-900">{fd.subjectToSaleAddress}</span></p>
                                                <p>Price: <span className="font-medium text-gray-900">${fd.subjectToSalePrice}</span></p>
                                                <p>Under Contract: <span className="font-medium text-gray-900">{fd.subjectToSaleUnderContract ? "Yes" : "No"}</span></p>
                                                {fd.subjectToSaleUnderContract && (
                                                    <p>Completion Date: <span className="font-medium text-gray-900">{fd.subjectToSaleCompletionDate}</span></p>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {fd.specialClauses && (
                                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                            <p className="text-xs text-gray-500 mb-1">Special Clauses</p>
                                            <p className="text-sm text-gray-900 whitespace-pre-wrap">{fd.specialClauses}</p>
                                        </div>
                                    )}

                                    {fd.appendixFileName && (
                                        <div className="bg-orange-50 p-3 rounded-lg border border-orange-100 flex items-center justify-between gap-3 overflow-hidden">
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs text-orange-600 mb-1">Appendix Document</p>
                                                <p className="font-medium text-orange-900 truncate">{fd.appendixFileName}</p>
                                            </div>
                                            {fd.appendixFileBase64 && (
                                                <a
                                                    href={fd.appendixFileBase64}
                                                    download={fd.appendixFileName}
                                                    className="px-3 py-1.5 bg-orange-100 text-orange-700 text-xs font-semibold rounded hover:bg-orange-200 transition-colors whitespace-nowrap flex-shrink-0"
                                                >
                                                    Download
                                                </a>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </section>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Close Details
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

// Main Page
export default function OffersDashboardPage() {
    const [loading, setLoading] = useState(true);
    const [groups, setGroups] = useState<PropertyGroup[]>([]);
    const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
    const [suburbFilter, setSuburbFilter] = useState("All");
    const [searchTerm, setSearchTerm] = useState("");
    const [showArchived, setShowArchived] = useState(false);
    const [selectedOffer, setSelectedOffer] = useState<OfferRow | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<OfferRow | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [currentUserEmail, setCurrentUserEmail] = useState("");

    const fetchOffers = useCallback(async () => {
        setLoading(true);
        const supabase = createClient();
        const { data, error } = await supabase
            .from("sales_offer_submissions")
            .select("*")
            .eq("status", "completed")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching offers:", error);
            setLoading(false);
            return;
        }

        // Fetch active properties from VaultRE to determine archiving
        let activePropertiesSet = new Set<string>();
        try {
            const activeRes = await fetch("/api/offer/properties", {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });
            if (activeRes.ok) {
                const activeData = await activeRes.json();
                if (activeData.properties && Array.isArray(activeData.properties)) {
                    // Create a normalized set of active addresses for robust matching
                    activeData.properties.forEach((p: any) => {
                        const normalizedAddr = p.displayAddress?.toLowerCase().replace(/,/g, "").trim();
                        if (normalizedAddr) activePropertiesSet.add(normalizedAddr);
                    });
                }
            }
        } catch (vaultErr) {
            console.error("Failed to fetch active properties for archive filtering:", vaultErr);
        }

        // Group by property address
        const groupMap = new Map<string, PropertyGroup>();
        for (const row of data as OfferRow[]) {
            const key = row.property_address;
            const fd = row.form_data;
            const price = parsePrice(row.offer_price);

            if (!groupMap.has(key)) {
                groupMap.set(key, {
                    propertyAddress: row.property_address,
                    propertyState: fd.propertyState || "",
                    propertySuburb: fd.propertySuburb || "",
                    propertyImage: fd.propertyMainImage || "",
                    bed: fd.propertyBed,
                    bath: fd.propertyBath,
                    garages: fd.propertyGarages,
                    offers: [],
                    highestOffer: 0,
                    lowestOffer: Infinity,
                    avgOffer: 0,
                    totalOffers: 0,
                    latestDate: row.created_at,
                    agents: Array.isArray(fd.propertyContactStaff) ? fd.propertyContactStaff : [],
                    isArchived: false, // Default, will compute below
                });
            }

            const g = groupMap.get(key)!;
            g.offers.push(row);
            g.totalOffers++;
            if (price > g.highestOffer) g.highestOffer = price;
            if (price < g.lowestOffer) g.lowestOffer = price;
            if (new Date(row.created_at) > new Date(g.latestDate)) {
                g.latestDate = row.created_at;
            }
        }

        // Calculate averages
        for (const g of groupMap.values()) {
            const totalPrices = g.offers.reduce(
                (sum, o) => sum + parsePrice(o.offer_price),
                0
            );
            if (g.lowestOffer === Infinity) g.lowestOffer = 0;

            // Check archive status against VaultRE active set
            const normalizedGroupAddr = g.propertyAddress.toLowerCase().replace(/,/g, "").trim();
            g.isArchived = !activePropertiesSet.has(normalizedGroupAddr);
        }

        const sorted = Array.from(groupMap.values()).sort(
            (a, b) => new Date(b.latestDate).getTime() - new Date(a.latestDate).getTime()
        );
        setGroups(sorted);
        setLoading(false);
    }, []);

    useEffect(() => {
        const load = async () => {
            await fetchOffers();
            // Get current user email for contract drafted tracking
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user?.email) setCurrentUserEmail(user.email);
        };
        load();
    }, [fetchOffers]);

    // Delete handler — uses server-side API to bypass RLS
    const handleDeleteOffer = async () => {
        if (!deleteTarget) return;
        const targetId = deleteTarget.id;
        const targetAddress = deleteTarget.property_address;
        setDeleting(true);

        try {
            const res = await fetch("/api/offer/delete", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: targetId }),
            });
            if (!res.ok) {
                const data = await res.json();
                console.error("Error deleting offer:", data.error);
                setDeleteTarget(null);
                setDeleting(false);
                return;
            }
        } catch (err) {
            console.error("Error deleting offer:", err);
            setDeleteTarget(null);
            setDeleting(false);
            return;
        }

        // Optimistically remove the offer from local state (no full re-fetch)
        setGroups((prev) => {
            const updated: PropertyGroup[] = [];
            for (const group of prev) {
                if (group.propertyAddress !== targetAddress) {
                    updated.push(group);
                    continue;
                }
                // Remove the deleted offer from this group
                const remaining = group.offers.filter((o) => o.id !== targetId);
                if (remaining.length === 0) continue; // Remove entire group if empty
                const prices = remaining.map((o) => parsePrice(o.offer_price));
                updated.push({
                    ...group,
                    offers: remaining,
                    totalOffers: remaining.length,
                    highestOffer: Math.max(...prices),
                    lowestOffer: Math.min(...prices),
                    avgOffer: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
                });
            }
            return updated;
        });

        setDeleteTarget(null);
        setDeleting(false);
    };

    // Download Report handler
    const handleDownloadReport = async (group: PropertyGroup) => {
        const fd = group.offers[0]?.form_data;
        const agents: AgentInfo[] = (fd?.propertyContactStaff || []).slice(0, 2).map((s) => ({
            firstName: s.firstName,
            lastName: s.lastName,
            position: s.position,
            photoUrl: s.photoUrl,
            mobile: s.mobile,
        }));

        const offers: OfferData[] = group.offers.map((o) => {
            const fd = o.form_data || {};
            const firstPurchaser = fd.purchasers?.[0] || {};
            return {
                purchaserName: o.purchaser_name,
                purchaserEmail: firstPurchaser.email || "",
                structure: fd.purchaserStructure || "Individual",
                offerPrice: parsePrice(o.offer_price),
                deposit: parsePrice(fd.depositAmount || "0"),
                financeRequired: fd.financeRequired,
                settlementPeriod: fd.settlementPeriod,
                coolingOffPeriod: fd.coolingOffPeriod,
                buildingInspection: fd.buildingInspection,
                subjectToSale: fd.subjectToSale,
                specialClauses: fd.specialClauses,
                bankLender: fd.bankLender,
                financeAmount: fd.financeAmount,
                createdAt: o.created_at,
                contractSigned: o.contract_signed ?? false,
            };
        });

        const reportData: ReportData = {
            propertyAddress: group.propertyAddress.replace(/,/g, ""),
            propertySuburb: group.propertySuburb,
            propertyState: group.propertyState,
            propertyImage: group.propertyImage,
            bed: group.bed,
            bath: group.bath,
            garages: group.garages,
            totalOffers: group.totalOffers,
            highestOffer: group.highestOffer,
            avgOffer: group.avgOffer,
            agents,
            offers,
        };

        await generateVendorOfferReport(reportData);
    };

    // Toggle Contract Drafted handler
    const handleToggleContractDrafted = async (offer: OfferRow, drafted: boolean) => {
        // Optimistic UI update
        setGroups((prev) =>
            prev.map((g) => ({
                ...g,
                offers: g.offers.map((o) =>
                    o.id === offer.id
                        ? {
                            ...o,
                            contract_drafted: drafted,
                            contract_drafted_by: drafted ? currentUserEmail : null,
                            contract_drafted_at: drafted ? new Date().toISOString() : null,
                        }
                        : o
                ),
            }))
        );

        try {
            const res = await fetch("/api/offer/contract-drafted", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: offer.id,
                    drafted,
                    draftedBy: currentUserEmail,
                }),
            });

            if (!res.ok) {
                console.error("Failed to toggle contract drafted");
                // Revert on failure
                setGroups((prev) =>
                    prev.map((g) => ({
                        ...g,
                        offers: g.offers.map((o) =>
                            o.id === offer.id
                                ? {
                                    ...o,
                                    contract_drafted: offer.contract_drafted,
                                    contract_drafted_by: offer.contract_drafted_by,
                                    contract_drafted_at: offer.contract_drafted_at,
                                }
                                : o
                        ),
                    }))
                );
            }
        } catch (err) {
            console.error("Error toggling contract drafted:", err);
        }
    };

    // Toggle Contract Signed handler
    const handleToggleContractSigned = async (offer: OfferRow, signed: boolean) => {
        // Optimistic UI update
        setGroups((prev) =>
            prev.map((g) => ({
                ...g,
                offers: g.offers.map((o) =>
                    o.id === offer.id
                        ? {
                            ...o,
                            contract_signed: signed,
                            contract_signed_by: signed ? currentUserEmail : null,
                            contract_signed_at: signed ? new Date().toISOString() : null,
                        }
                        : o
                ),
            }))
        );

        try {
            const res = await fetch("/api/offer/contract-signed", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: offer.id,
                    signed,
                    signedBy: currentUserEmail,
                }),
            });

            if (!res.ok) {
                console.error("Failed to toggle contract signed");
                // Revert on failure
                setGroups((prev) =>
                    prev.map((g) => ({
                        ...g,
                        offers: g.offers.map((o) =>
                            o.id === offer.id
                                ? {
                                    ...o,
                                    contract_signed: offer.contract_signed,
                                    contract_signed_by: offer.contract_signed_by,
                                    contract_signed_at: offer.contract_signed_at,
                                }
                                : o
                        ),
                    }))
                );
            }
        } catch (err) {
            console.error("Error toggling contract signed:", err);
        }
    };

    // Filter
    const filtered = groups.filter((g) => {
        const matchSuburb = suburbFilter === "All" || g.propertySuburb === suburbFilter;
        // Search should match by property address or property status/class optionally
        const matchSearch = !searchTerm || g.propertyAddress.toLowerCase().includes(searchTerm.toLowerCase());

        // Archiving Logic:
        // If there's an active search term, bypass the archive filter so historicals can be found
        // Otherwise, if showArchived is false, filter out archived groups.
        const matchArchive = searchTerm ? true : (showArchived || !g.isArchived);

        return matchSuburb && matchSearch && matchArchive;
    });

    const uniqueSuburbs = ["All", ...Array.from(new Set(groups.map((g) => g.propertySuburb).filter(Boolean)))].sort();

    // Export to Excel (CSV)
    const handleExport = () => {
        const headers = [
            "Property Address",
            "Suburb",
            "State",
            "Purchaser Name",
            "Email",
            "Structure",
            "Offer Price",
            "Deposit Amount",
            "Finance Required",
            "Submitted At",
        ];

        const rows = filtered.flatMap((g) =>
            g.offers.map((o) => {
                const fd = o.form_data;
                const email = fd.purchasers?.[0]?.email || o.submitter_email || "";
                return [
                    `"${o.property_address}"`,
                    `"${g.propertySuburb}"`,
                    `"${g.propertyState}"`,
                    `"${o.purchaser_name}"`,
                    `"${email}"`,
                    `"${fd.purchaserStructure}"`,
                    `"${parsePrice(o.offer_price)}"`,
                    `"${parsePrice(fd.depositAmount || "0")}"`,
                    fd.financeRequired ? "Yes" : "No",
                    `"${new Date(o.created_at).toLocaleString()}"`,
                ];
            })
        );

        const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.setAttribute("download", `offers_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Stats
    const totalOffers = filtered.reduce((s, g) => s + g.totalOffers, 0);
    const totalProperties = filtered.length;
    const globalHighest =
        filtered.length > 0 ? Math.max(...filtered.map((g) => g.highestOffer)) : 0;
    const globalAvg =
        totalOffers > 0
            ? Math.round(
                filtered.reduce((s, g) => s + g.avgOffer * g.totalOffers, 0) / totalOffers
            )
            : 0;

    return (
        <div className="max-w-6xl mx-auto pb-12 w-full">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="font-display text-3xl md:text-4xl font-bold text-[#001F49] tracking-tight">
                    Offers Dashboard
                </h1>
                <div className="flex items-center justify-between mt-2">
                    <p className="text-gray-500 text-base">
                        View and analyze all property offers submitted by purchasers.
                    </p>
                    <button
                        onClick={handleExport}
                        disabled={filtered.length === 0}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-lg text-sm font-semibold hover:bg-emerald-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Download className="w-4 h-4" />
                        Export to Excel
                    </button>
                </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <StatCard
                    title="Total Offers"
                    value={String(totalOffers)}
                    icon={BarChart3}
                    color="bg-blue-50 text-blue-600"
                />
                <StatCard
                    title="Properties"
                    value={String(totalProperties)}
                    subtitle="with offers"
                    icon={Home}
                    color="bg-violet-50 text-violet-600"
                />
                <StatCard
                    title="Highest Offer"
                    value={globalHighest > 0 ? `$${formatPrice(globalHighest)}` : "—"}
                    icon={Trophy}
                    color="bg-amber-50 text-amber-600"
                />
                <StatCard
                    title="Avg Offer"
                    value={globalAvg > 0 ? `$${formatPrice(globalAvg)}` : "—"}
                    icon={TrendingUp}
                    color="bg-emerald-50 text-emerald-600"
                />
            </div>

            {/* Filters */}
            <div className="flex gap-3 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search properties..."
                        className="input-field-normal pl-10 text-sm"
                    />
                </div>
                <div className="relative flex-shrink-0">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <select
                        value={suburbFilter}
                        onChange={(e) => setSuburbFilter(e.target.value)}
                        className="select-field pl-9 w-40 text-sm"
                    >
                        {uniqueSuburbs.map((s) => (
                            <option key={s} value={s}>
                                {s}
                            </option>
                        ))}
                    </select>
                </div>
                {/* Archive Toggle */}
                <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg shrink-0 shadow-sm transition-all hover:border-gray-300">
                    <button
                        onClick={() => setShowArchived(!showArchived)}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-harcourts-blue focus-visible:ring-offset-2 ${showArchived ? 'bg-harcourts-blue' : 'bg-gray-200'}`}
                        role="switch"
                        aria-checked={showArchived}
                    >
                        <span className="sr-only">Include archived</span>
                        <span
                            aria-hidden="true"
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${showArchived ? 'translate-x-4' : 'translate-x-0'}`}
                        />
                    </button>
                    <span className="text-sm text-gray-600 font-medium select-none">Include archived</span>
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-6 h-6 animate-spin text-harcourts-blue" />
                    <span className="ml-2 text-gray-500">Loading offers...</span>
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-16">
                    <Users className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm">
                        {searchTerm || suburbFilter !== "All"
                            ? "No offers match your filters"
                            : "No offers submitted yet"}
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map((group, idx) => (
                        <PropertyOfferCard
                            key={group.propertyAddress}
                            group={group}
                            isExpanded={expandedIdx === idx}
                            onToggle={() =>
                                setExpandedIdx(expandedIdx === idx ? null : idx)
                            }
                            onOfferClick={setSelectedOffer}
                            onDeleteOffer={setDeleteTarget}
                            onDownloadReport={handleDownloadReport}
                            onToggleContractDrafted={handleToggleContractDrafted}
                            onToggleContractSigned={handleToggleContractSigned}
                            currentUserEmail={currentUserEmail}
                        />
                    ))}
                </div>
            )}

            {/* Legend */}
            <div className="mt-6 flex items-center gap-6 text-xs text-gray-400">
                <span className="flex items-center gap-1.5">
                    <Trophy className="w-3 h-3 text-amber-500" /> Highest offer
                </span>
                <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" /> Cash (no finance)
                </span>
                <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400" /> Finance required
                </span>
                <span className="flex items-center gap-1.5">
                    <DollarSign className="w-3 h-3" /> Prices in AUD
                </span>
            </div>

            <OfferDetailsModal offer={selectedOffer} onClose={() => setSelectedOffer(null)} />

            {/* Delete Confirmation Modal */}
            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-fade-in">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                                <Trash2 className="w-5 h-5 text-red-500" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">Remove Offer</h3>
                                <p className="text-sm text-gray-500">This action cannot be undone.</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-6">
                            Are you sure you want to remove the offer from <strong>{deleteTarget.purchaser_name}</strong> for <strong>${deleteTarget.offer_price}</strong>?
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setDeleteTarget(null)}
                                disabled={deleting}
                                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteOffer}
                                disabled={deleting}
                                className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors text-sm disabled:opacity-50 flex items-center gap-2"
                            >
                                {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                                Remove
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
