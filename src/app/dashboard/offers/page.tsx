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

// Types
interface OfferRow {
    id: string;
    status: string;
    form_data: {
        propertyId: string | null;
        propertyAddress: string;
        propertySuburb: string;
        propertyState: string;
        propertyPostcode: string;
        propertyBed: number | null;
        propertyBath: number | null;
        propertyGarages: number | null;
        propertyMainImage: string;
        purchaserStructure: string;
        purchaserCount: number;
        purchasers: { fullName: string; email: string }[];
        companyName?: string;
        trustName?: string;
        offerPrice: string;
        depositAmount: string;
        financeRequired: boolean;
        bankLender?: string;
        financeAmount?: string;
        settlementPeriod?: string;
        specialClauses?: string;
    };
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
}: {
    group: PropertyGroup;
    isExpanded: boolean;
    onToggle: () => void;
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
                                <div
                                    key={offer.id}
                                    className={`px-5 py-3 grid grid-cols-12 gap-2 items-center text-sm border-t border-gray-50 hover:bg-blue-50/30 transition-colors ${isHighest ? "bg-emerald-50/30" : ""
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
                                </div>
                            );
                        })}
                </div>
            )}
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
        </div>
    );
}
