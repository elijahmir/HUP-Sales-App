"use client";

import React, { useState, useMemo, useRef } from "react";
import { FileText, Trophy, Clock, Trash2, ChevronUp, ChevronDown, Filter, Plus, X, CheckCircle2, Circle } from "lucide-react";
import type { ContactStaffInfo, OfferFormData } from "@/lib/offer/types";

export interface OfferRow {
    id: string;
    status: string;
    form_data: OfferFormData;
    purchaser_name: string;
    property_address: string;
    offer_price: string;
    created_at: string;
    updated_at: string;
    submitter_email: string | null;
    contract_drafted?: boolean;
    contract_drafted_by?: string | null;
    contract_drafted_at?: string | null;
    contract_signed?: boolean;
    contract_signed_by?: string | null;
    contract_signed_at?: string | null;
}
export interface PropertyGroup {
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
}

interface ExpandedOffersTableProps {
    group: PropertyGroup;
    onDownloadReport: (group: PropertyGroup) => void;
    onOfferClick: (offer: OfferRow) => void;
    onDeleteOffer: (offer: OfferRow) => void;
    onToggleContractDrafted: (offer: OfferRow, drafted: boolean) => void;
    onToggleContractSigned: (offer: OfferRow, signed: boolean) => void;
    currentUserEmail: string;
}

function parsePrice(price: any): number {
    if (!price) return 0;
    return Number(String(price).replace(/[^0-9.]/g, "")) || 0;
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

type SortKey = "purchaserName" | "structure" | "offerPrice" | "deposit" | "submitted";
type SortDirection = "asc" | "desc";

type FilterColumn = "purchaserName" | "structure" | "offerPrice" | "deposit" | "finance";
type FilterOperator = "equals" | "contains" | "gt" | "lt";

interface FilterRule {
    id: string;
    column: FilterColumn;
    operator: FilterOperator;
    value: string;
}

const COLUMN_LABELS: Record<FilterColumn, string> = {
    purchaserName: "Purchaser",
    structure: "Structure",
    offerPrice: "Offer Price",
    deposit: "Deposit",
    finance: "Finance",
};

const OPERATOR_LABELS: Record<FilterOperator, string> = {
    equals: "is equal to",
    contains: "contains",
    gt: "is greater than",
    lt: "is less than",
};

const getAvailableOperators = (column: FilterColumn): FilterOperator[] => {
    switch (column) {
        case "purchaserName":
        case "structure":
            return ["contains", "equals"];
        case "offerPrice":
        case "deposit":
            return ["equals", "gt", "lt"];
        case "finance":
            return ["equals"];
    }
};

// ─── Reusable date formatter ────────────────────────────────────
function formatStatusDate(dateStr: string | null | undefined): string {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" }) +
        " at " +
        d.toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit", hour12: true });
}

// ─── Contract Drafted Cell ──────────────────────────────────────
function ContractDraftedCell({ offer, onToggle }: { offer: OfferRow; onToggle: (drafted: boolean) => void }) {
    const [hovering, setHovering] = useState(false);
    const drafted = offer.contract_drafted ?? false;

    return (
        <div
            className="relative inline-flex items-center justify-center"
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
        >
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onToggle(!drafted);
                }}
                className="p-1 rounded-lg transition-all duration-200 cursor-pointer hover:scale-110"
                title={drafted ? "Unmark contract drafted" : "Mark as contract drafted"}
            >
                {drafted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 drop-shadow-sm" />
                ) : (
                    <Circle className="w-4 h-4 text-gray-300 hover:text-gray-400" />
                )}
            </button>

            {/* Hover tooltip */}
            {hovering && drafted && offer.contract_drafted_by && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-none">
                    <div className="bg-gray-900 text-white text-[10px] leading-relaxed rounded-lg px-3 py-2 shadow-xl whitespace-nowrap">
                        <p className="font-semibold">Drafted by {offer.contract_drafted_by}</p>
                        <p className="text-gray-300">{formatStatusDate(offer.contract_drafted_at)}</p>
                    </div>
                    <div className="w-2 h-2 bg-gray-900 rotate-45 absolute left-1/2 -translate-x-1/2 -bottom-1" />
                </div>
            )}
        </div>
    );
}

// ─── Contract Signed Cell ───────────────────────────────────────
function ContractSignedCell({ offer, onToggle }: { offer: OfferRow; onToggle: (signed: boolean) => void }) {
    const [hovering, setHovering] = useState(false);
    const signed = offer.contract_signed ?? false;

    return (
        <div
            className="relative inline-flex items-center justify-center"
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
        >
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onToggle(!signed);
                }}
                className="p-1 rounded-lg transition-all duration-200 cursor-pointer hover:scale-110"
                title={signed ? "Unmark contract signed" : "Mark as contract signed"}
            >
                {signed ? (
                    <CheckCircle2 className="w-4 h-4 text-blue-500 drop-shadow-sm" />
                ) : (
                    <Circle className="w-4 h-4 text-gray-300 hover:text-gray-400" />
                )}
            </button>

            {/* Hover tooltip */}
            {hovering && signed && offer.contract_signed_by && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-none">
                    <div className="bg-gray-900 text-white text-[10px] leading-relaxed rounded-lg px-3 py-2 shadow-xl whitespace-nowrap">
                        <p className="font-semibold">Signed by {offer.contract_signed_by}</p>
                        <p className="text-gray-300">{formatStatusDate(offer.contract_signed_at)}</p>
                    </div>
                    <div className="w-2 h-2 bg-gray-900 rotate-45 absolute left-1/2 -translate-x-1/2 -bottom-1" />
                </div>
            )}
        </div>
    );
}
export default function ExpandedOffersTable({
    group,
    onDownloadReport,
    onOfferClick,
    onDeleteOffer,
    onToggleContractDrafted,
    onToggleContractSigned,
    currentUserEmail,
}: ExpandedOffersTableProps) {
    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection } | null>(null);
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState<FilterRule[]>([]);

    const filteredAndSortedOffers = useMemo(() => {
        let items = [...group.offers];

        // 1. Apply Filters
        if (filters.length > 0) {
            items = items.filter(offer => {
                const fd = offer.form_data;
                return filters.every(rule => {
                    if (!rule.value) return true; // Ignore incomplete rules

                    let itemValue: any;
                    let compareValue: any = rule.value;

                    switch (rule.column) {
                        case "purchaserName":
                            itemValue = offer.purchaser_name;
                            break;
                        case "structure":
                            itemValue = fd.purchaserStructure || "";
                            break;
                        case "offerPrice":
                            itemValue = parsePrice(fd.offerPrice);
                            compareValue = parsePrice(rule.value);
                            break;
                        case "deposit":
                            itemValue = parsePrice(fd.depositAmount || "0");
                            compareValue = parsePrice(rule.value);
                            break;
                        case "finance":
                            itemValue = fd.financeRequired ? "yes" : "no";
                            compareValue = rule.value.toLowerCase();
                            break;
                    }

                    if (itemValue === undefined || itemValue === null) return false;

                    const a = String(itemValue).toLowerCase();
                    const b = String(compareValue).toLowerCase();

                    switch (rule.operator) {
                        case "contains": return a.includes(b);
                        case "equals":
                            if (typeof itemValue === 'number') return itemValue === Number(compareValue);
                            return a === b;
                        case "gt": return Number(itemValue) > Number(compareValue);
                        case "lt": return Number(itemValue) < Number(compareValue);
                        default: return true;
                    }
                });
            });
        }

        // 2. Apply Sorting
        if (sortConfig !== null) {
            items.sort((a, b) => {
                const fdA = a.form_data;
                const fdB = b.form_data;

                let valA: string | number = 0;
                let valB: string | number = 0;

                switch (sortConfig.key) {
                    case "purchaserName":
                        valA = a.purchaser_name.toLowerCase();
                        valB = b.purchaser_name.toLowerCase();
                        break;
                    case "structure":
                        valA = (fdA.purchaserStructure || "").toLowerCase();
                        valB = (fdB.purchaserStructure || "").toLowerCase();
                        break;
                    case "offerPrice":
                        valA = parsePrice(fdA.offerPrice);
                        valB = parsePrice(fdB.offerPrice);
                        break;
                    case "deposit":
                        valA = parsePrice(fdA.depositAmount || "0");
                        valB = parsePrice(fdB.depositAmount || "0");
                        break;
                    case "submitted":
                        valA = new Date(a.created_at).getTime();
                        valB = new Date(b.created_at).getTime();
                        break;
                }

                if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
                if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
                return 0;
            });
        } else {
            // Default sort: highest price first
            items.sort((a, b) => parsePrice(b.form_data.offerPrice) - parsePrice(a.form_data.offerPrice));
        }

        return items;
    }, [group.offers, sortConfig, filters]);

    const handleSort = (key: SortKey) => {
        if (filteredAndSortedOffers.length <= 1) return; // Disable sorting if <= 1 offer

        setSortConfig((current) => {
            // If already completely null, start with asc (since default is highest desc, clicking price should make it lowest asc)
            if (current === null) {
                if (key === "offerPrice") return { key, direction: "asc" };
                return { key, direction: "desc" };
            }

            if (current.key === key) {
                if (current.direction === "asc") return { key, direction: "desc" };
                if (current.direction === "desc") return null; // Toggle off to default
            }

            // New column clicked
            return { key, direction: "desc" };
        });
    };

    const addFilterRule = () => {
        setFilters([...filters, {
            id: Math.random().toString(36).substr(2, 9),
            column: "purchaserName",
            operator: "contains",
            value: ""
        }]);
        if (!showFilters) setShowFilters(true);
    };

    const updateFilterRule = (id: string, updates: Partial<FilterRule>) => {
        setFilters(filters.map(f => {
            if (f.id !== id) return f;
            const updated = { ...f, ...updates };
            // If column changed, ensure operator is valid for new column
            if (updates.column && updates.column !== f.column) {
                const availableOperators = getAvailableOperators(updates.column as FilterColumn);
                if (!availableOperators.includes(updated.operator)) {
                    updated.operator = availableOperators[0];
                }
            }
            return updated;
        }));
    };

    const removeFilterRule = (id: string) => {
        setFilters(filters.filter(f => f.id !== id));
        if (filters.length === 1) setShowFilters(false);
    };

    const isSortable = filteredAndSortedOffers.length > 1;

    const SortIcon = ({ columnKey }: { columnKey: SortKey }) => {
        if (!isSortable) return null;

        // Default sort indicator
        if (sortConfig === null && columnKey === "offerPrice") {
            return <ChevronDown className="w-3 h-3 ml-1 inline text-gray-400" />;
        }

        if (sortConfig?.key !== columnKey) return null;
        return sortConfig.direction === "asc" ? <ChevronUp className="w-3 h-3 ml-1 inline" /> : <ChevronDown className="w-3 h-3 ml-1 inline" />;
    };

    return (
        <div className="border-t border-gray-100">
            {/* Action Bar */}
            <div className="px-5 py-2.5 bg-white/80 flex items-center justify-between gap-2 border-b border-gray-100 mt-2">
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${showFilters || filters.length > 0 ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-200'}`}
                >
                    <Filter className="w-3.5 h-3.5" />
                    Filter {filters.length > 0 && `(${filters.length})`}
                </button>

                <button
                    onClick={() => onDownloadReport(group)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-semibold hover:bg-blue-100 transition-colors cursor-pointer mr-2"
                >
                    <FileText className="w-3.5 h-3.5" />
                    Download Report
                </button>
            </div>

            {/* Smart Filter Panel */}
            {showFilters && (
                <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex flex-col gap-2">
                    {filters.length === 0 && (
                        <p className="text-xs text-gray-500 italic pb-1">No filters applied.</p>
                    )}
                    {filters.map(filter => (
                        <div key={filter.id} className="flex flex-wrap items-center gap-2">
                            <select
                                value={filter.column}
                                onChange={e => updateFilterRule(filter.id, { column: e.target.value as FilterColumn })}
                                className="text-xs border border-gray-200 rounded px-2 py-1.5 bg-white text-gray-700 outline-none focus:border-indigo-300 focus:ring-1 focus:ring-indigo-100"
                            >
                                {(Object.entries(COLUMN_LABELS) as [FilterColumn, string][]).map(([val, label]) => (
                                    <option key={val} value={val}>{label}</option>
                                ))}
                            </select>

                            <select
                                value={filter.operator}
                                onChange={e => updateFilterRule(filter.id, { operator: e.target.value as FilterOperator })}
                                className="text-xs border border-gray-200 rounded px-2 py-1.5 bg-white text-gray-700 outline-none focus:border-indigo-300 focus:ring-1 focus:ring-indigo-100"
                            >
                                {getAvailableOperators(filter.column).map(op => (
                                    <option key={op} value={op}>{OPERATOR_LABELS[op]}</option>
                                ))}
                            </select>

                            {filter.column === "finance" ? (
                                <select
                                    value={filter.value}
                                    onChange={e => updateFilterRule(filter.id, { value: e.target.value })}
                                    className="text-xs border border-gray-200 rounded px-2 py-1.5 bg-white text-gray-700 outline-none focus:border-indigo-300 focus:ring-1 focus:ring-indigo-100"
                                >
                                    <option value="">Select...</option>
                                    <option value="yes">Yes</option>
                                    <option value="no">No</option>
                                </select>
                            ) : (
                                <input
                                    type={filter.column === "offerPrice" || filter.column === "deposit" ? "number" : "text"}
                                    placeholder="Value"
                                    value={filter.value}
                                    onChange={e => updateFilterRule(filter.id, { value: e.target.value })}
                                    className="text-xs border border-gray-200 rounded px-2 py-1.5 bg-white text-gray-700 outline-none focus:border-indigo-300 focus:ring-1 focus:ring-indigo-100 w-32"
                                />
                            )}

                            <button
                                onClick={() => removeFilterRule(filter.id)}
                                className="text-gray-400 hover:text-red-500 p-1 rounded transition-colors cursor-pointer"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    ))}

                    <div>
                        <button
                            onClick={addFilterRule}
                            className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-2 py-1 rounded transition-colors cursor-pointer mt-1"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            Add filter rule
                        </button>
                    </div>
                </div>
            )}

            {/* Headers */}
            <div className="px-5 py-3 bg-gray-50 text-xs font-semibold text-gray-500 grid grid-cols-12 gap-2 border-b border-gray-100">
                <button
                    onClick={() => handleSort("purchaserName")}
                    disabled={!isSortable}
                    className={`col-span-3 text-left flex items-center ${isSortable ? 'hover:text-gray-900 cursor-pointer transition-colors' : ''}`}
                >
                    Purchaser <SortIcon columnKey="purchaserName" />
                </button>
                <button
                    onClick={() => handleSort("structure")}
                    disabled={!isSortable}
                    className={`col-span-1 text-left flex items-center ${isSortable ? 'hover:text-gray-900 cursor-pointer transition-colors' : ''}`}
                >
                    Structure <SortIcon columnKey="structure" />
                </button>
                <button
                    onClick={() => handleSort("offerPrice")}
                    disabled={!isSortable}
                    className={`col-span-2 flex items-center justify-end ${isSortable ? 'hover:text-gray-900 cursor-pointer transition-colors' : ''}`}
                >
                    Offer Price <SortIcon columnKey="offerPrice" />
                </button>
                <button
                    onClick={() => handleSort("deposit")}
                    disabled={!isSortable}
                    className={`col-span-1 flex items-center justify-end ${isSortable ? 'hover:text-gray-900 cursor-pointer transition-colors' : ''}`}
                >
                    Deposit <SortIcon columnKey="deposit" />
                </button>
                <span className="col-span-1 text-center">Finance</span>
                <span className="col-span-1 text-center text-[10px] leading-tight">Contract<br />Drafted</span>
                <span className="col-span-1 text-center text-[10px] leading-tight">Contract<br />Signed</span>
                <button
                    onClick={() => handleSort("submitted")}
                    disabled={!isSortable}
                    className={`col-span-1 flex items-center justify-end ${isSortable ? 'hover:text-gray-900 cursor-pointer transition-colors' : ''}`}
                >
                    Submitted <SortIcon columnKey="submitted" />
                </button>
                <span className="col-span-1 text-right">Actions</span>
            </div>

            {/* Rows */}
            {filteredAndSortedOffers.length > 0 ? (
                filteredAndSortedOffers.map((offer) => {
                    const fd = offer.form_data;
                    // Determine highest overall (from current filtered view or all? usually all makes more sense for "highest", but let's do from filtered to be consistent with the view)
                    const allPrices = filteredAndSortedOffers.map(o => parsePrice(o.form_data.offerPrice));
                    const maxPrice = Math.max(...allPrices);
                    const isHighest = parsePrice(fd.offerPrice) === maxPrice;

                    const cTime = new Date(offer.created_at).getTime();
                    const uTime = offer.updated_at ? new Date(offer.updated_at).getTime() : 0;
                    const isEdited = uTime > 0 && (uTime - cTime) > 5000; // More than 5 seconds diff

                    return (
                        <div
                            key={offer.id}
                            className={`w-full text-left px-5 py-3 grid grid-cols-12 gap-2 items-center text-sm border-b border-gray-50 hover:bg-blue-50/50 transition-colors ${isHighest ? "bg-emerald-50/30" : ""}`}
                        >
                            <button
                                onClick={() => onOfferClick(offer)}
                                className="col-span-3 flex items-center gap-2 cursor-pointer text-left"
                            >
                                {isHighest && (
                                    <Trophy className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                                )}
                                <div className="min-w-0">
                                    <p className="font-semibold text-[#001F49] truncate text-xs capitalize">
                                        {offer.purchaser_name}
                                    </p>
                                    <p className="text-[10px] text-gray-400 truncate">
                                        {fd.purchasers?.[0]?.email || offer.submitter_email || "—"}
                                    </p>
                                </div>
                            </button>
                            <div className="col-span-1">
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold capitalize bg-gray-100 text-gray-600">
                                    {fd.purchaserStructure}
                                </span>
                            </div>
                            <div className="col-span-2 text-right">
                                <span className={`font-bold ${isHighest ? "text-emerald-600" : "text-gray-700"}`}>
                                    ${fd.offerPrice}
                                </span>
                            </div>
                            <div className="col-span-1 text-right text-gray-500">
                                ${fd.depositAmount || "—"}
                            </div>
                            <div className="col-span-1 text-center">
                                <span
                                    className={`inline-block w-2 h-2 rounded-full ${fd.financeRequired ? "bg-amber-400" : "bg-emerald-400"}`}
                                    title={fd.financeRequired ? "Finance required" : "No finance"}
                                />
                            </div>
                            {/* Contract Drafted */}
                            <div className="col-span-1 flex justify-center">
                                <ContractDraftedCell
                                    offer={offer}
                                    onToggle={(drafted) => onToggleContractDrafted(offer, drafted)}
                                />
                            </div>
                            {/* Contract Signed */}
                            <div className="col-span-1 flex justify-center">
                                <ContractSignedCell
                                    offer={offer}
                                    onToggle={(signed) => onToggleContractSigned(offer, signed)}
                                />
                            </div>
                            <div className="col-span-1 text-right flex flex-col items-end justify-center">
                                <span className="text-xs text-gray-500 flex items-center gap-1 font-medium">
                                    <Clock className="w-3 h-3" />
                                    {timeAgo(offer.created_at)}
                                </span>
                                {isEdited && offer.updated_at && (
                                    <span
                                        className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded flex items-center mt-1 font-medium border border-amber-100/50 cursor-default"
                                        title={`Edited: ${new Date(offer.updated_at).toLocaleString()}`}
                                    >
                                        Edited {timeAgo(offer.updated_at)}
                                    </span>
                                )}
                            </div>
                            <div className="col-span-1 text-right">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDeleteOffer(offer);
                                    }}
                                    className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                    title="Remove offer"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    );
                })
            ) : (
                <div className="px-5 py-8 text-center text-sm text-gray-500">
                    No offers match the current filters.
                </div>
            )}
        </div>
    );
}
