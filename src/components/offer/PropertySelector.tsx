"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, MapPin, Bed, Bath, Car, Loader2, Home, AlertCircle } from "lucide-react";
import type { OfferProperty } from "@/lib/offer/types";
import type { OfferFormData } from "@/lib/offer/types";
import { CustomDropdown } from "@/components/offer/CustomDropdown";

interface PropertySelectorProps {
    formData: OfferFormData;
    updateFormData: (updates: Partial<OfferFormData>) => void;
    errors: Record<string, string>;
}

export function PropertySelector({
    formData,
    updateFormData,
    errors,
}: PropertySelectorProps) {
    const [properties, setProperties] = useState<OfferProperty[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [suburbFilter, setSuburbFilter] = useState("All Suburbs");

    const fetchProperties = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/offer/properties");
            if (!res.ok) throw new Error("Failed to load properties");
            const data = await res.json();
            setProperties(data.properties || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load properties");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProperties();
    }, [fetchProperties]);

    // Derive unique suburbs from loaded properties
    const suburbs = ["All Suburbs", ...Array.from(
        new Set(properties.map((p) => p.suburb).filter(Boolean))
    ).sort()];

    const filteredProperties = properties.filter((p) => {
        const matchSearch = p.displayAddress.toLowerCase().includes(searchTerm.toLowerCase());
        const matchSuburb = suburbFilter === "All Suburbs" || p.suburb === suburbFilter;
        return matchSearch && matchSuburb;
    });

    const handleSelect = (property: OfferProperty) => {
        updateFormData({
            propertyId: property.id,
            propertyAddress: property.displayAddress,
            propertyStreet: property.street,
            propertySuburb: property.suburb,
            propertyState: property.state,
            propertyPostcode: property.postcode,
            propertyStatus: property.status,
            propertyBed: property.bed || null,
            propertyBath: property.bath || null,
            propertyGarages: property.garages || null,
            propertyMainImage: property.mainImageUrl || "",
            propertyContactStaff: property.contactStaff?.toString() || "",
        });
    };

    const handleDeselect = () => {
        updateFormData({
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
        });
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "listing":
                return "bg-blue-50 text-blue-700 border-blue-200";
            case "conditional":
                return "bg-amber-50 text-amber-700 border-amber-200";
            default:
                return "bg-gray-50 text-gray-700 border-gray-200";
        }
    };

    // Selected property view
    if (formData.propertyId) {
        return (
            <div className="space-y-6 animate-fade-in">
                <div className="relative rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
                    {/* Hero Image */}
                    {formData.propertyMainImage ? (
                        <div className="relative h-48 md:h-64 bg-gradient-to-br from-slate-100 to-slate-200">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={formData.propertyMainImage}
                                alt={formData.propertyAddress}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        </div>
                    ) : (
                        <div className="relative h-48 md:h-64 bg-gradient-to-br from-harcourts-blue/5 to-harcourts-navy/5 flex items-center justify-center">
                            <Home className="w-16 h-16 text-harcourts-blue/20" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                        </div>
                    )}

                    {/* Status Badge */}
                    <div className="absolute top-4 right-4">
                        <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusColor(formData.propertyStatus)}`}
                        >
                            {formData.propertyStatus}
                        </span>
                    </div>

                    {/* Property Details */}
                    <div className="p-6">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h3 className="text-xl font-bold text-harcourts-navy mb-2">
                                    {formData.propertyAddress}
                                </h3>
                                <div className="flex items-center gap-1 text-sm text-gray-500 mb-4">
                                    <MapPin className="w-4 h-4" />
                                    <span>
                                        {formData.propertySuburb}, {formData.propertyState}{" "}
                                        {formData.propertyPostcode}
                                    </span>
                                </div>

                                {/* Property Features */}
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                    {formData.propertyBed != null && (
                                        <div className="flex items-center gap-1.5">
                                            <Bed className="w-4 h-4 text-gray-400" />
                                            <span className="font-medium">{formData.propertyBed}</span>
                                        </div>
                                    )}
                                    {formData.propertyBath != null && (
                                        <div className="flex items-center gap-1.5">
                                            <Bath className="w-4 h-4 text-gray-400" />
                                            <span className="font-medium">{formData.propertyBath}</span>
                                        </div>
                                    )}
                                    {formData.propertyGarages != null && (
                                        <div className="flex items-center gap-1.5">
                                            <Car className="w-4 h-4 text-gray-400" />
                                            <span className="font-medium">{formData.propertyGarages}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={handleDeselect}
                                className="text-sm text-gray-500 hover:text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-all font-medium"
                            >
                                Change
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Property selection view
    return (
        <div className="space-y-6 animate-fade-in">
            {/* Search + Suburb Filter */}
            <div className="flex gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search properties by address..."
                        className="input-field-normal pl-12"
                    />
                </div>
                <CustomDropdown
                    value={suburbFilter}
                    options={suburbs.map((s) => ({ value: s, label: s }))}
                    onChange={setSuburbFilter}
                    icon={<MapPin className="w-3.5 h-3.5" />}
                    width="w-44"
                    placeholder="All Suburbs"
                />
            </div>

            {errors.propertyId && (
                <div className="flex items-center gap-2 text-red-500 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.propertyId}</span>
                </div>
            )}

            {/* Loading */}
            {loading && (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-harcourts-blue" />
                    <span className="ml-2 text-gray-500">Loading properties from VaultRE...</span>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="text-center py-8">
                    <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                    <p className="text-red-500 text-sm">{error}</p>
                    <button
                        onClick={() => fetchProperties()}
                        className="mt-2 text-sm text-harcourts-blue hover:underline"
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* Property List */}
            {!loading && !error && (
                <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1 custom-scrollbar">
                    {filteredProperties.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                            <Home className="w-8 h-8 mx-auto mb-2 opacity-40" />
                            <p className="text-sm">
                                {searchTerm ? "No properties match your search" : "No available properties found"}
                            </p>
                        </div>
                    ) : (
                        filteredProperties.map((property) => (
                            <button
                                key={property.id}
                                onClick={() => handleSelect(property)}
                                className="w-full text-left p-4 rounded-xl bg-white border border-gray-200 hover:border-harcourts-blue hover:shadow-md transition-all duration-200 group"
                            >
                                <div className="flex items-start gap-4">
                                    {/* Thumbnail */}
                                    <div className="w-20 h-16 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 flex-shrink-0 overflow-hidden">
                                        {property.mainImageUrl ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={property.mainImageUrl}
                                                alt=""
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Home className="w-6 h-6 text-slate-300" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-harcourts-navy text-sm group-hover:text-harcourts-blue transition-colors truncate">
                                            {property.displayAddress}
                                        </h4>
                                        <div className="flex items-center gap-3 mt-1.5">
                                            <span
                                                className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(property.status)}`}
                                            >
                                                {property.status}
                                            </span>
                                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                                {property.bed != null && (
                                                    <span className="flex items-center gap-0.5">
                                                        <Bed className="w-3 h-3" /> {property.bed}
                                                    </span>
                                                )}
                                                {property.bath != null && (
                                                    <span className="flex items-center gap-0.5">
                                                        <Bath className="w-3 h-3" /> {property.bath}
                                                    </span>
                                                )}
                                                {property.garages != null && (
                                                    <span className="flex items-center gap-0.5">
                                                        <Car className="w-3 h-3" /> {property.garages}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
