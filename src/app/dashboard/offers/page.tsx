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
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { X, CheckCircle2 } from "lucide-react";
import type { OfferFormData } from "@/lib/offer/types";

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
    submitter_email: string | null;
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
}: {
    group: PropertyGroup;
    isExpanded: boolean;
    onToggle: () => void;
    onOfferClick: (offer: OfferRow) => void;
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
                            <h3 className="font-bold text-[#001F49] truncate text-sm uppercase">
                                {group.propertyAddress}
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
                <div className="border-t border-gray-100">
                    <div className="px-5 py-3 bg-gray-50 text-xs font-semibold text-gray-500 grid grid-cols-12 gap-2">
                        <span className="col-span-3">Purchaser</span>
                        <span className="col-span-2">Structure</span>
                        <span className="col-span-2 text-right">Offer Price</span>
                        <span className="col-span-2 text-right">Deposit</span>
                        <span className="col-span-1 text-center">Finance</span>
                        <span className="col-span-2 text-right">Submitted</span>
                    </div>
                    {group.offers
                        .sort((a, b) => parsePrice(b.offer_price) - parsePrice(a.offer_price))
                        .map((offer, idx) => {
                            const isHighest = idx === 0;
                            const fd = offer.form_data;
                            return (
                                <button
                                    key={offer.id}
                                    onClick={() => onOfferClick(offer)}
                                    className={`w-full text-left px-5 py-3 grid grid-cols-12 gap-2 items-center text-sm border-t border-gray-50 hover:bg-blue-50/50 transition-colors cursor-pointer ${isHighest ? "bg-emerald-50/30" : ""
                                        }`}
                                >
                                    <div className="col-span-3 flex items-center gap-2">
                                        {isHighest && (
                                            <Trophy className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                                        )}
                                        <div className="min-w-0">
                                            <p className="font-semibold text-[#001F49] truncate text-xs uppercase">
                                                {offer.purchaser_name}
                                            </p>
                                            <p className="text-[10px] text-gray-400 truncate">
                                                {fd.purchasers[0]?.email || offer.submitter_email || "—"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-gray-100 text-gray-600">
                                            {fd.purchaserStructure}
                                        </span>
                                    </div>
                                    <div className="col-span-2 text-right">
                                        <span
                                            className={`font-bold ${isHighest ? "text-emerald-600" : "text-gray-700"
                                                }`}
                                        >
                                            ${fd.offerPrice}
                                        </span>
                                    </div>
                                    <div className="col-span-2 text-right text-gray-500">
                                        ${fd.depositAmount || "—"}
                                    </div>
                                    <div className="col-span-1 text-center">
                                        <span
                                            className={`inline-block w-2 h-2 rounded-full ${fd.financeRequired
                                                ? "bg-amber-400"
                                                : "bg-emerald-400"
                                                }`}
                                            title={fd.financeRequired ? "Finance required" : "No finance"}
                                        />
                                    </div>
                                    <div className="col-span-2 text-right">
                                        <span className="text-xs text-gray-400 flex items-center justify-end gap-1">
                                            <Clock className="w-3 h-3" />
                                            {timeAgo(offer.created_at)}
                                        </span>
                                    </div>
                                </button>
                            );
                        })}
                </div>
            )}
        </div>
    );
}

// Offer Details Modal
function OfferDetailsModal({ offer, onClose }: { offer: OfferRow | null; onClose: () => void }) {
    if (!offer) return null;
    const fd = offer.form_data;

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
                        <h2 className="text-xl font-bold text-[#001F49]">
                            Offer from {offer.purchaser_name}
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Submitted on {new Date(offer.created_at).toLocaleString()}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto overflow-x-hidden space-y-8 flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Left Column */}
                        <div className="space-y-8">
                            {/* Property Details */}
                            <section>
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Purchaser Structure</h3>
                                <div className="space-y-3 text-sm">
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
                                            {fd.purchasers.map((p, i) => (
                                                <div key={i} className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                                    <p className="font-semibold text-gray-900">{p.fullName}</p>
                                                    <p className="text-xs text-gray-500">{p.email} • {p.mobileCountryCode} {p.mobileNumber}</p>
                                                    <p className="text-xs text-gray-500 mt-1">{[p.street, p.suburb, p.state, p.postcode].filter(Boolean).join(", ")}</p>
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
    const [selectedOffer, setSelectedOffer] = useState<OfferRow | null>(null);

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
            g.avgOffer = g.totalOffers > 0 ? Math.round(totalPrices / g.totalOffers) : 0;
            if (g.lowestOffer === Infinity) g.lowestOffer = 0;
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
        };
        load();
    }, [fetchOffers]);

    // Filter
    const filtered = groups.filter((g) => {
        const matchSuburb = suburbFilter === "All" || g.propertySuburb === suburbFilter;
        const matchSearch = !searchTerm || g.propertyAddress.toLowerCase().includes(searchTerm.toLowerCase());
        return matchSuburb && matchSearch;
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
        </div>
    );
}
