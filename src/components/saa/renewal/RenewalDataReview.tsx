"use client";

import { useState } from "react";
import {
  Home,
  MapPin,
  Bed,
  Bath,
  Car,
  Ruler,
  Tag,
  DollarSign,
  Calendar,
  Users,
  ShieldCheck,
  Lock,
  Megaphone,
} from "lucide-react";
import type { RenewalPropertyData } from "@/lib/saa/renewal/types";
import type { MarketingItem } from "@/lib/saa/marketing";
import { formatCurrency } from "@/lib/saa/validation";

interface RenewalDataReviewProps {
  propertyData: RenewalPropertyData;
  marketingItems: MarketingItem[];
  selectedMarketingIds: string[];
  onDeselectProperty: () => void;
}

export function RenewalDataReview({
  propertyData,
  marketingItems,
  selectedMarketingIds,
  onDeselectProperty,
}: RenewalDataReviewProps) {
  const selectedItems = selectedMarketingIds
    .map((id) => marketingItems.find((m) => m.id === id))
    .filter((item): item is NonNullable<typeof item> => item !== undefined);

  // Use lazy state initializer to avoid impure Date.now() calls during render
  const [twoWeeksFromNow] = useState(() => new Date(Date.now() + 14 * 24 * 60 * 60 * 1000));
  const [now] = useState(() => new Date());

  const marketingTotal = selectedItems.reduce((sum, item) => sum + item.price, 0);

  const formatPrice = (price: number | null) => {
    if (!price) return "—";
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-harcourts-navy">
            Review Renewal Data
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            All data below is pulled directly from VaultRE and is{" "}
            <strong className="text-harcourts-navy">read-only</strong>. Verify
            everything is correct before proceeding.
          </p>
        </div>
        <button
          onClick={onDeselectProperty}
          className="text-sm text-gray-500 hover:text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-all font-medium flex-shrink-0"
        >
          Change Property
        </button>
      </div>

      {/* Read-Only Badge */}
      <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
        <Lock className="w-4 h-4 text-amber-600 flex-shrink-0" />
        <p className="text-xs text-amber-700">
          <strong>Read-Only:</strong> This data cannot be edited here. To make
          changes, update the record in VaultRE and refresh.
        </p>
      </div>

      {/* ─── Property Section ─────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Property Hero */}
        <div className="relative">
          {propertyData.mainImageUrl ? (
            <div className="relative h-40 md:h-52 bg-gradient-to-br from-slate-100 to-slate-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={propertyData.mainImageUrl}
                alt={propertyData.displayAddress}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </div>
          ) : (
            <div className="relative h-40 bg-gradient-to-br from-harcourts-blue/5 to-harcourts-navy/5 flex items-center justify-center">
              <Home className="w-12 h-12 text-harcourts-blue/20" />
            </div>
          )}

          {/* Status + Class badges */}
          <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
              {propertyData.status}
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/90 text-harcourts-navy shadow-sm backdrop-blur-sm">
              {propertyData.propertyClass}
            </span>
          </div>
        </div>

        {/* Address + Features */}
        <div className="p-5 space-y-4">
          <div>
            <h3 className="text-xl font-bold text-harcourts-navy">
              {propertyData.displayAddress}
            </h3>
            <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
              <MapPin className="w-4 h-4" />
              <span>
                {propertyData.suburb}, {propertyData.state}{" "}
                {propertyData.postcode}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-5 text-sm text-gray-600">
            {propertyData.bed != null && (
              <div className="flex items-center gap-1.5">
                <Bed className="w-4 h-4 text-gray-400" />
                <span className="font-medium">{propertyData.bed}</span>
              </div>
            )}
            {propertyData.bath != null && (
              <div className="flex items-center gap-1.5">
                <Bath className="w-4 h-4 text-gray-400" />
                <span className="font-medium">{propertyData.bath}</span>
              </div>
            )}
            {propertyData.garages != null && (
              <div className="flex items-center gap-1.5">
                <Car className="w-4 h-4 text-gray-400" />
                <span className="font-medium">{propertyData.garages}</span>
              </div>
            )}
            {propertyData.landArea && (
              <div className="flex items-center gap-1.5">
                <Ruler className="w-4 h-4 text-gray-400" />
                <span className="font-medium">{propertyData.landArea}</span>
              </div>
            )}
          </div>

          {/* Contact Staff */}
          {propertyData.contactStaff.length > 0 && (
            <div className="pt-4 border-t border-gray-100">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Property Agents
              </h4>
              <div className="flex flex-wrap gap-3">
                {propertyData.contactStaff.map((staff, idx) => (
                  <div
                    key={staff.id}
                    className="flex items-center gap-3 bg-gray-50 rounded-xl p-2.5 pr-4 border border-gray-100"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-harcourts-blue/20 to-harcourts-navy/20 flex-shrink-0 overflow-hidden border border-gray-200">
                      {staff.photoUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={staff.photoUrl}
                          alt={`${staff.firstName} ${staff.lastName}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${staff.firstName}+${staff.lastName}&background=0B2A4A&color=fff`;
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-harcourts-navy font-bold text-sm">
                          {staff.firstName?.charAt(0)}
                          {staff.lastName?.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-gray-900">
                          {staff.firstName} {staff.lastName}
                        </p>
                        {idx === 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 text-[9px] font-bold uppercase tracking-wider">
                            Primary
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 truncate max-w-[140px]">
                        {staff.position || "Sales Consultant"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── Pricing & Commission ─────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h3 className="text-sm font-semibold text-harcourts-navy flex items-center gap-2">
          <DollarSign className="w-4 h-4" />
          Pricing & Commission
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <InfoBlock
            label="Listing Price"
            value={formatPrice(propertyData.searchPrice)}
          />
          <InfoBlock
            label="Display Price"
            value={propertyData.displayPrice || "—"}
          />
          <InfoBlock
            label="Commission %"
            value={
              propertyData.sellingFeePercent
                ? `${propertyData.sellingFeePercent}%`
                : "—"
            }
          />
          <InfoBlock
            label="Commission Fixed"
            value={
              propertyData.sellingFeeFixed
                ? formatCurrency(propertyData.sellingFeeFixed)
                : "—"
            }
          />
        </div>
      </div>

      {/* ─── Title Details ────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h3 className="text-sm font-semibold text-harcourts-navy flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" />
          Title & Reference Details
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <InfoBlock label="Volume" value={propertyData.volumeNumber || "—"} />
          <InfoBlock label="Folio" value={propertyData.folioNumber || "—"} />
          <InfoBlock
            label="Reference ID"
            value={propertyData.referenceID || "—"}
          />
          <InfoBlock label="Listing No" value={propertyData.listingNo || "—"} />
        </div>
      </div>

      {/* ─── Authority Dates ──────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h3 className="text-sm font-semibold text-harcourts-navy flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Current Authority Period
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <InfoBlock
            label="Authority Start"
            value={
              propertyData.authorityStart
                ? new Date(propertyData.authorityStart).toLocaleDateString(
                    "en-AU",
                    {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    },
                  )
                : "—"
            }
          />
          <InfoBlock
            label="Authority End"
            value={
              propertyData.authorityEnd
                ? new Date(propertyData.authorityEnd).toLocaleDateString(
                    "en-AU",
                    {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    },
                  )
                : "—"
            }
            highlight={
              propertyData.authorityEnd
                ? new Date(propertyData.authorityEnd) <= now
                  ? "expired"
                  : new Date(propertyData.authorityEnd) <= twoWeeksFromNow
                    ? "warning"
                    : undefined
                : undefined
            }
          />
        </div>
      </div>

      {/* ─── Vendor Section ───────────────────────────────────────── */}
      {propertyData.vendors.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h3 className="text-sm font-semibold text-harcourts-navy flex items-center gap-2">
            <Users className="w-4 h-4" />
            Vendors ({propertyData.vendors.length})
          </h3>
          <div className="space-y-3">
            {propertyData.vendors.map((vendor, idx) => (
              <div
                key={idx}
                className="p-4 bg-gray-50 rounded-lg border border-gray-100"
              >
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold text-harcourts-navy">
                    {vendor.fullName}
                  </h4>
                  <span className="px-1.5 py-0.5 rounded bg-gray-200 text-gray-600 text-[10px] font-bold uppercase tracking-wider">
                    Vendor {idx + 1}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-400 text-xs">Email</span>
                    <p className="text-gray-700">{vendor.email || "—"}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 text-xs">Mobile</span>
                    <p className="text-gray-700">{vendor.mobile || "—"}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-gray-400 text-xs">Address</span>
                    <p className="text-gray-700">
                      {[vendor.street, vendor.suburb, vendor.state, vendor.postcode]
                        .filter(Boolean)
                        .join(", ") || "—"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Marketing Section ────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h3 className="text-sm font-semibold text-harcourts-navy flex items-center gap-2">
          <Megaphone className="w-4 h-4" />
          Marketing Items ({selectedItems.length})
        </h3>
        {selectedItems.length > 0 ? (
          <>
            <div className="divide-y divide-gray-100">
              {selectedItems.map((item, idx) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-2.5 text-sm"
                >
                  <span className="text-gray-700">
                    {idx + 1}. {item.name}
                  </span>
                  <span className="font-medium text-harcourts-navy">
                    {formatCurrency(item.price)}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-gray-200">
              <span className="text-sm font-semibold text-harcourts-navy">
                Total Marketing Cost
              </span>
              <span className="text-lg font-bold text-harcourts-blue">
                {formatCurrency(marketingTotal)}
              </span>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg text-sm text-gray-500">
            <Tag className="w-4 h-4 text-gray-400" />
            No marketing items selected for this renewal.
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Reusable Info Block ────────────────────────────────────────

function InfoBlock({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: "warning" | "expired";
}) {
  let valueClass = "text-gray-900 font-medium";
  if (highlight === "expired")
    valueClass = "text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded";
  if (highlight === "warning")
    valueClass = "text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded";

  return (
    <div>
      <span className="text-xs text-gray-400 uppercase tracking-wider">
        {label}
      </span>
      <p className={`text-sm mt-0.5 ${valueClass}`}>{value}</p>
    </div>
  );
}
