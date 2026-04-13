"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  MapPin,
  Bed,
  Bath,
  Car,
  Loader2,
  Home,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

export interface RenewalPropertyOption {
  id: number;
  displayAddress: string;
  street: string;
  suburb: string;
  state: string;
  postcode: string;
  status: string;
  propertyClass: string;
  bed: number | null;
  bath: number | null;
  garages: number | null;
  landArea: string | null;
  searchPrice: number | null;
  mainImageUrl: string;
  contactStaff: {
    id: number;
    firstName: string;
    lastName: string;
    position: string;
    photoUrl: string;
    email: string;
    mobile: string;
  }[];
}

interface RenewalPropertySelectorProps {
  selectedPropertyId: number | null;
  onSelect: (property: RenewalPropertyOption) => void;
  isLoadingDetails: boolean;
}

export function RenewalPropertySelector({
  selectedPropertyId,
  onSelect,
  isLoadingDetails,
}: RenewalPropertySelectorProps) {
  const [properties, setProperties] = useState<RenewalPropertyOption[]>([]);
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
      setError(
        err instanceof Error ? err.message : "Failed to load properties",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  // Derive unique suburbs
  const suburbs = [
    "All Suburbs",
    ...Array.from(
      new Set(properties.map((p) => p.suburb).filter(Boolean)),
    ).sort(),
  ];

  const filteredProperties = properties.filter((p) => {
    const matchSearch = p.displayAddress
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchSuburb =
      suburbFilter === "All Suburbs" || p.suburb === suburbFilter;
    return matchSearch && matchSuburb;
  });

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

  const formatPrice = (price: number | null) => {
    if (!price) return null;
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Loading details overlay after selecting a property
  if (isLoadingDetails) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-harcourts-blue/10 to-harcourts-navy/10 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-harcourts-blue animate-spin" />
            </div>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-harcourts-navy">
              Loading property data from VaultRE
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Fetching current details, vendors, and marketing data...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Selection list
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Title */}
      <div>
        <h2 className="text-lg font-semibold text-harcourts-navy">
          Select Property for Renewal
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Choose the property whose Sole Agency Agreement you need to renew.
          Current data will be pulled live from VaultRE.
        </p>
      </div>

      {/* Search + Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-harcourts-blue focus:ring-2 focus:ring-blue-100 transition-all text-sm"
          />
        </div>
        <select
          value={suburbFilter}
          onChange={(e) => setSuburbFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-gray-200 focus:border-harcourts-blue focus:ring-2 focus:ring-blue-100 transition-all text-sm bg-white min-w-[160px]"
        >
          {suburbs.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium">{error}</p>
            <button
              onClick={fetchProperties}
              className="text-xs text-red-600 hover:text-red-800 underline mt-1 flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Retry
            </button>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-12 gap-3">
          <Loader2 className="w-5 h-5 text-harcourts-blue animate-spin" />
          <span className="text-sm text-gray-500">
            Loading properties from VaultRE...
          </span>
        </div>
      ) : filteredProperties.length === 0 ? (
        <div className="text-center py-12">
          <Home className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No properties found</p>
          <p className="text-sm text-gray-400 mt-1">
            {searchTerm || suburbFilter !== "All Suburbs"
              ? "Try adjusting your filters"
              : "No active listings available"}
          </p>
        </div>
      ) : (
        /* Property Grid */
        <div className="grid gap-3 max-h-[500px] overflow-y-auto pr-1">
          {filteredProperties.map((property) => (
            <button
              key={property.id}
              onClick={() => onSelect(property)}
              disabled={selectedPropertyId === property.id}
              className={`
                group w-full text-left rounded-xl border transition-all duration-200
                ${
                  selectedPropertyId === property.id
                    ? "border-harcourts-blue bg-blue-50/50 ring-2 ring-blue-100"
                    : "border-gray-200 hover:border-harcourts-blue/50 hover:shadow-md hover:bg-gray-50/50"
                }
              `}
            >
              <div className="flex items-center gap-4 p-4">
                {/* Property Image Thumbnail */}
                <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-slate-100 to-slate-200">
                  {property.mainImageUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={property.mainImageUrl}
                      alt={property.displayAddress}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Home className="w-8 h-8 text-gray-300" />
                    </div>
                  )}
                </div>

                {/* Property Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-harcourts-navy text-sm truncate">
                      {property.displayAddress}
                    </h3>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border flex-shrink-0 ${getStatusColor(property.status)}`}
                    >
                      {property.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                    <MapPin className="w-3 h-3" />
                    <span>
                      {property.suburb}, {property.state}
                    </span>
                    {property.propertyClass && (
                      <span className="ml-2 px-1.5 py-0.5 bg-gray-100 rounded text-[10px] font-medium">
                        {property.propertyClass}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-600">
                    {property.bed != null && (
                      <div className="flex items-center gap-1">
                        <Bed className="w-3.5 h-3.5 text-gray-400" />
                        <span>{property.bed}</span>
                      </div>
                    )}
                    {property.bath != null && (
                      <div className="flex items-center gap-1">
                        <Bath className="w-3.5 h-3.5 text-gray-400" />
                        <span>{property.bath}</span>
                      </div>
                    )}
                    {property.garages != null && (
                      <div className="flex items-center gap-1">
                        <Car className="w-3.5 h-3.5 text-gray-400" />
                        <span>{property.garages}</span>
                      </div>
                    )}
                    {property.searchPrice && (
                      <span className="ml-auto font-semibold text-harcourts-navy">
                        {formatPrice(property.searchPrice)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Properties count */}
      {!loading && filteredProperties.length > 0 && (
        <p className="text-xs text-gray-400 text-center">
          Showing {filteredProperties.length} of {properties.length} properties
        </p>
      )}
    </div>
  );
}
