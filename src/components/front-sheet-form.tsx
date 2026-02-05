/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { ListingData } from "@/lib/gemini-ocr";
import { cn } from "@/lib/utils";
import { VAULTRE_AGENTS } from "@/data/vaultre-agents";
import { Image as ImageIcon } from "lucide-react";
import React, { createContext, useContext, useEffect, useState } from "react";

// ─────────────────────────────────────────────────────────────
// TYPES & CONTEXT
// ─────────────────────────────────────────────────────────────

interface FrontSheetFormProps {
  initialData: ListingData | null;
  onChange?: (data: ListingData) => void;
  readOnly?: boolean;
  onViewImage?: () => void;
}

interface FormContextType {
  formData: any;
  handleChange: (path: string, value: any) => void;
  readOnly: boolean;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

function useFormContext() {
  const ctx = useContext(FormContext);
  if (!ctx) throw new Error("useFormContext must be used within FormProvider");
  return ctx;
}

// Helper functions
function getNestedValue(obj: any, path: string): any {
  return path.split(".").reduce((acc, key) => acc?.[key], obj);
}

function setNestedValue(obj: any, path: string, value: any): any {
  const result = JSON.parse(JSON.stringify(obj || {}));
  const keys = path.split(".");
  let current = result;
  for (let i = 0; i < keys.length - 1; i++) {
    if (!current[keys[i]]) current[keys[i]] = {};
    current = current[keys[i]];
  }
  current[keys[keys.length - 1]] = value;
  return result;
}

// ─────────────────────────────────────────────────────────────
// FORM FIELD COMPONENTS (Harcourts Style)
// ─────────────────────────────────────────────────────────────

// Standard input cell
function Cell({
  label,
  path,
  className,
  labelWidth = "w-24",
  type = "text",
  placeholder = "",
}: {
  label?: string;
  path: string;
  className?: string;
  labelWidth?: string;
  type?: string;
  placeholder?: string;
}) {
  const { formData, handleChange, readOnly } = useFormContext();
  const value = getNestedValue(formData, path) ?? "";

  return (
    <div
      className={cn(
        "flex items-center border-r border-b border-slate-300",
        className,
      )}
    >
      {label && (
        <div
          className={cn(
            "bg-[#E8F4FC] px-2 py-1 text-[10px] font-bold text-[#001F49] uppercase border-r border-slate-300 h-full flex items-center",
            labelWidth,
          )}
        >
          {label}
        </div>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => handleChange(path, e.target.value)}
        disabled={readOnly}
        placeholder={placeholder}
        className="flex-1 px-2 py-1 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#00ADEF] min-w-0"
      />
    </div>
  );
}

// Yes/No toggle
function YesNo({
  label,
  path,
  className,
}: {
  label: string;
  path: string;
  className?: string;
}) {
  const { formData, handleChange, readOnly } = useFormContext();
  const value = getNestedValue(formData, path);

  return (
    <div
      className={cn(
        "flex items-center border-r border-b border-slate-300 text-xs",
        className,
      )}
    >
      <div className="bg-[#E8F4FC] px-2 py-1 text-[10px] font-bold text-[#001F49] border-r border-slate-300 flex-shrink-0 w-24">
        {label}
      </div>
      <div className="flex items-center gap-2 px-2">
        <label className="flex items-center gap-1 cursor-pointer">
          <input
            type="radio"
            checked={value === "Yes"}
            onChange={() => handleChange(path, "Yes")}
            disabled={readOnly}
            className="w-3 h-3 accent-[#00ADEF]"
          />
          <span>Yes</span>
        </label>
        <label className="flex items-center gap-1 cursor-pointer">
          <input
            type="radio"
            checked={value === "No"}
            onChange={() => handleChange(path, "No")}
            disabled={readOnly}
            className="w-3 h-3 accent-[#00ADEF]"
          />
          <span>No</span>
        </label>
      </div>
    </div>
  );
}

// Checkbox
function Check({
  label,
  path,
  className,
}: {
  label: string;
  path: string;
  className?: string;
}) {
  const { formData, handleChange, readOnly } = useFormContext();
  const checked = getNestedValue(formData, path) === true;

  return (
    <label
      className={cn(
        "flex items-center gap-2 px-2 py-1 cursor-pointer text-xs",
        className,
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => handleChange(path, e.target.checked)}
        disabled={readOnly}
        className="w-4 h-4 accent-[#00ADEF] rounded"
      />
      <span>{label}</span>
    </label>
  );
}

// Section header (navy blue bar)
function SectionHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "bg-[#001F49] text-white px-3 py-1.5 text-sm font-bold uppercase tracking-wide",
        className,
      )}
    >
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────

export default function FrontSheetForm({
  initialData,
  onChange,
  readOnly = false,
  onViewImage,
}: FrontSheetFormProps) {
  const formData = initialData || {};
  const [isSticky, setIsSticky] = useState(false);

  const handleChange = (path: string, value: any) => {
    if (readOnly) return;
    const newData = setNestedValue(formData, path, value);
    if (onChange) onChange(newData);
  };

  // Sync address components to full address
  useEffect(() => {
    if (readOnly) return;
    const c = formData.address_components || {};
    if (c.street_name || c.suburb) {
      const parts = [
        c.unit ? `${c.unit}/` : "",
        c.street_number,
        c.street_name,
        c.suburb,
        c.state,
        c.postcode,
      ].filter(Boolean);
      const fullAddr = parts.join(" ").replace("/ ", "/").trim();
      if (fullAddr !== formData.address) {
        handleChange("address", fullAddr);
      }
    }
  }, [
    formData.address_components?.unit,
    formData.address_components?.street_number,
    formData.address_components?.street_name,
    formData.address_components?.suburb,
    formData.address_components?.state,
    formData.address_components?.postcode,
  ]);

  // Sticky header behavior
  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <FormContext.Provider value={{ formData, handleChange, readOnly }}>
      <div className="w-full max-w-5xl mx-auto">
        {/* ══════════════════════════════════════════════════════════════
            STICKY HEADER BAR (No duplicate logo - just actions)
        ══════════════════════════════════════════════════════════════ */}
        <div
          className={cn(
            "bg-white border-b border-slate-200 z-50 transition-all duration-200 print:hidden",
            isSticky ? "fixed top-0 left-0 right-0 shadow-md" : "relative",
          )}
        >
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
            <span className="text-slate-500 text-sm font-medium">
              Front Sheet
            </span>
            <div className="flex items-center gap-2">
              {onViewImage && (
                <button
                  onClick={onViewImage}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded transition-colors"
                >
                  <ImageIcon className="w-4 h-4" />
                  View Original
                </button>
              )}
              
            </div>
          </div>
        </div>

        {/* Spacer when header is sticky */}
        {isSticky && <div className="h-14" />}

        {/* ══════════════════════════════════════════════════════════════
            FORM BODY
        ══════════════════════════════════════════════════════════════ */}
        <div
          
          className="bg-white shadow-lg border border-slate-300 print:shadow-none print:border-0"
        >
          {/* ─────────────────────────────────────────────────────────────
              SECTION 1: HEADER (Only ONE logo here)
          ───────────────────────────────────────────────────────────── */}
          <div className="flex border-b border-slate-300">
            {/* Left: Branding + Icons */}
            <div className="flex-1 p-4 border-r border-slate-300">
              <h2 className="font-display text-3xl font-black text-[#001F49] tracking-tight">
                <span className="border-b-4 border-[#00ADEF] pb-1">
                  Harcourts
                </span>
              </h2>
              {/* Bed/Bath/Parking Icons - EDITABLE */}
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1">
                  <span className="text-2xl">🛏️</span>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={formData.bedrooms_icon_count || ""}
                    onChange={(e) =>
                      handleChange(
                        "bedrooms_icon_count",
                        e.target.value ? parseInt(e.target.value) : "",
                      )
                    }
                    disabled={readOnly}
                    placeholder="–"
                    className="w-10 text-lg font-bold text-slate-700 text-center border-b border-slate-300 focus:outline-none focus:border-[#00ADEF] bg-transparent"
                  />
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-2xl">🚿</span>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={formData.bathrooms_icon_count || ""}
                    onChange={(e) =>
                      handleChange(
                        "bathrooms_icon_count",
                        e.target.value ? parseInt(e.target.value) : "",
                      )
                    }
                    disabled={readOnly}
                    placeholder="–"
                    className="w-10 text-lg font-bold text-slate-700 text-center border-b border-slate-300 focus:outline-none focus:border-[#00ADEF] bg-transparent"
                  />
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-2xl">🚗</span>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={formData.parking_icon_count || ""}
                    onChange={(e) =>
                      handleChange(
                        "parking_icon_count",
                        e.target.value ? parseInt(e.target.value) : "",
                      )
                    }
                    disabled={readOnly}
                    placeholder="–"
                    className="w-10 text-lg font-bold text-slate-700 text-center border-b border-slate-300 focus:outline-none focus:border-[#00ADEF] bg-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Right: Agent Info Table */}
            <div className="w-72">
              {/* Listing Agent */}
              <div className="flex border-b border-slate-300">
                <div className="bg-[#E8F4FC] px-3 py-2 text-[10px] font-bold text-[#001F49] uppercase w-28 border-r border-slate-300">
                  Listing Agent
                </div>
                <select
                  value={formData.listing_agent || ""}
                  onChange={(e) =>
                    handleChange("listing_agent", e.target.value)
                  }
                  disabled={readOnly}
                  className="flex-1 px-2 py-2 text-sm bg-white focus:outline-none appearance-none cursor-pointer"
                >
                  <option value="">Select Agent</option>
                  {VAULTRE_AGENTS.map((agent) => (
                    <option key={agent.id} value={agent.name}>
                      {agent.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Agency Type */}
              <div className="flex border-b border-slate-300">
                <div className="bg-[#E8F4FC] px-3 py-2 text-[10px] font-bold text-[#001F49] uppercase w-28 border-r border-slate-300">
                  Agency Type
                </div>
                <div className="flex-1 flex items-center gap-2 px-2 text-xs">
                  {["Sole", "Open", "Joint"].map((type) => (
                    <label
                      key={type}
                      className="flex items-center gap-1 cursor-pointer"
                    >
                      <input
                        type="radio"
                        checked={formData.agency_type === type}
                        onChange={() => handleChange("agency_type", type)}
                        disabled={readOnly}
                        className="w-3 h-3 accent-[#00ADEF]"
                      />
                      <span>{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Date Listed */}
              <div className="flex border-b border-slate-300">
                <div className="bg-[#E8F4FC] px-3 py-2 text-[10px] font-bold text-[#001F49] uppercase w-28 border-r border-slate-300">
                  Date Listed
                </div>
                <input
                  type="date"
                  value={formData.date_listed || ""}
                  onChange={(e) => handleChange("date_listed", e.target.value)}
                  disabled={readOnly}
                  className="flex-1 px-2 py-2 text-sm bg-white focus:outline-none"
                />
              </div>

              {/* Price */}
              <div className="flex items-center border-b border-slate-300">
                <div className="bg-[#E8F4FC] px-3 py-2 text-[10px] font-bold text-[#001F49] uppercase w-28 border-r border-slate-300 flex items-center">
                  Price
                </div>
                <input
                  type="text"
                  value={
                    formData.price?.display_text || formData.price?.amount || ""
                  }
                  onChange={(e) =>
                    handleChange("price.display_text", e.target.value)
                  }
                  disabled={readOnly}
                  placeholder="$"
                  className="flex-1 px-2 py-2 text-sm bg-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────────
              SECTION 2: ADDRESS (with separate component fields)
          ───────────────────────────────────────────────────────────── */}
          <SectionHeader>Address</SectionHeader>

          {/* Address Component Fields - for data binding */}
          <div className="flex border-b border-slate-300 text-xs">
            <Cell
              label="Unit"
              path="address_components.unit"
              labelWidth="w-10"
              placeholder="#"
              className="w-20"
            />
            <Cell
              label="St No"
              path="address_components.street_number"
              labelWidth="w-12"
              placeholder="123"
              className="w-24"
            />
            <Cell
              label="Street Name"
              path="address_components.street_name"
              labelWidth="w-20"
              placeholder="Street Name"
              className="flex-1"
            />
            <Cell
              label="Suburb"
              path="address_components.suburb"
              labelWidth="w-14"
              placeholder="Suburb"
              className="w-40"
            />
            <Cell
              label="State"
              path="address_components.state"
              labelWidth="w-12"
              placeholder="TAS"
              className="w-20"
            />
            <Cell
              label="Post"
              path="address_components.postcode"
              labelWidth="w-10"
              placeholder="7000"
              className="w-24 border-r-0"
            />
          </div>

          {/* Full Address (auto-generated from components) */}
          <div className="border-b border-slate-300 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">
            📍 {formData.address || "Address will appear here..."}
          </div>

          <div className="flex border-b border-slate-300">
            <Cell label="Title Ref." path="title_ref" className="flex-1" />
            <Cell label="PID" path="pid" className="flex-1 border-r-0" />
          </div>

          {/* ─────────────────────────────────────────────────────────────
              SECTION 3: PROPERTY DETAILS GRID
          ───────────────────────────────────────────────────────────── */}
          <div className="grid grid-cols-6 text-xs">
            {/* Row 1 */}
            <Cell label="Year Built" path="year_built" labelWidth="w-20" />
            <Cell
              label="Construction"
              path="construction.type"
              labelWidth="w-24"
            />
            <div className="flex items-center border-r border-b border-slate-300 bg-[#E8F4FC] px-2 text-[10px] font-bold text-[#001F49]">
              B/BV/WB/R
            </div>
            <Cell label="Zoning" path="zoning" labelWidth="w-16" />
            <Cell label="Rates" path="rates" labelWidth="w-14" />
            <div className="flex items-center border-b border-slate-300 px-2 text-xs font-semibold">
              $
            </div>

            {/* Row 2 */}
            <Cell label="Land Size" path="land_size" labelWidth="w-20" />
            <Cell label="Windows" path="windows.type" labelWidth="w-24" />
            <div className="flex items-center border-r border-b border-slate-300 bg-[#E8F4FC] px-2 text-[9px] font-bold text-[#001F49]">
              Timber/Alum/DBL/Single
            </div>
            <Cell label="Council" path="council" labelWidth="w-16" />
            <Cell
              label="Water Rates"
              path="water_rates"
              labelWidth="w-14"
              className="text-[10px]"
            />
            <div className="flex items-center border-b border-slate-300 px-2 text-xs font-semibold">
              $
            </div>

            {/* Row 3 */}
            <Cell
              label="Building Size"
              path="building_size"
              labelWidth="w-20"
              className="text-[10px]"
            />
            <Cell label="Roof" path="roof.type" labelWidth="w-24" />
            <div className="flex items-center border-r border-b border-slate-300 bg-[#E8F4FC] px-2 text-[10px] font-bold text-[#001F49]">
              Tile/CB/T
            </div>
            <Cell
              label="Capital Value"
              path="capital_value"
              labelWidth="w-16"
              className="text-[10px]"
            />
            <Cell
              label="Land Value"
              path="land_value"
              labelWidth="w-14"
              className="text-[10px]"
            />
            <div className="flex items-center border-b border-slate-300 px-2 text-xs font-semibold">
              $
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────────
              SECTION 4: VENDOR
          ───────────────────────────────────────────────────────────── */}
          <div className="grid grid-cols-2">
            <div>
              <SectionHeader>Vendor/s</SectionHeader>
              <input
                type="text"
                value={formData.vendors || ""}
                onChange={(e) => handleChange("vendors", e.target.value)}
                disabled={readOnly}
                className="w-full px-3 py-2 text-sm bg-white border-b border-r border-slate-300 focus:outline-none"
              />
            </div>
            <div>
              <SectionHeader>Phone Number/s</SectionHeader>
              <input
                type="text"
                value={formData.phone_numbers || ""}
                onChange={(e) => handleChange("phone_numbers", e.target.value)}
                disabled={readOnly}
                className="w-full px-3 py-2 text-sm bg-white border-b border-slate-300 focus:outline-none"
              />
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────────
              SECTION 5: CONTACT DETAILS
          ───────────────────────────────────────────────────────────── */}
          <SectionHeader>Postal Address</SectionHeader>
          <input
            type="text"
            value={formData.postal_address || ""}
            onChange={(e) => handleChange("postal_address", e.target.value)}
            disabled={readOnly}
            className="w-full px-3 py-2 text-sm bg-white border-b border-slate-300 focus:outline-none"
          />
          <div className="grid grid-cols-2">
            <div>
              <SectionHeader>Email</SectionHeader>
              <input
                type="email"
                value={formData.email || ""}
                onChange={(e) => handleChange("email", e.target.value)}
                disabled={readOnly}
                className="w-full px-3 py-2 text-sm bg-white border-b border-r border-slate-300 focus:outline-none"
              />
            </div>
            <div>
              <SectionHeader>Solicitor</SectionHeader>
              <input
                type="text"
                value={formData.solicitor || ""}
                onChange={(e) => handleChange("solicitor", e.target.value)}
                disabled={readOnly}
                className="w-full px-3 py-2 text-sm bg-white border-b border-slate-300 focus:outline-none"
              />
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────────
              SECTION 6: NOTES
          ───────────────────────────────────────────────────────────── */}
          <div className="border-b border-slate-300">
            <textarea
              value={formData.handwritten_notes_section || ""}
              onChange={(e) =>
                handleChange("handwritten_notes_section", e.target.value)
              }
              disabled={readOnly}
              placeholder="Property notes and description..."
              rows={6}
              className="w-full px-3 py-2 text-sm bg-white focus:outline-none resize-none"
            />
          </div>

          {/* ─────────────────────────────────────────────────────────────
              SECTION 7: PROPERTY FEATURES (3 Columns)
          ───────────────────────────────────────────────────────────── */}
          <div className="grid grid-cols-3 text-xs">
            {/* Column 1: Rooms */}
            <div className="border-r border-slate-300">
              {/* Bed 1 with BI/WI + dimensions */}
              <div className="flex border-b border-slate-300">
                <div className="bg-[#E8F4FC] px-2 py-1 w-14 text-[10px] font-bold text-[#001F49] border-r border-slate-300">
                  Bed 1:
                </div>
                <div className="flex items-center gap-1 px-2 flex-1">
                  {["BI", "WI"].map((type) => (
                    <label
                      key={type}
                      className="flex items-center gap-0.5 cursor-pointer text-[10px]"
                    >
                      <input
                        type="radio"
                        checked={
                          getNestedValue(formData, "bed_1.wardrobe_type") ===
                          type
                        }
                        onChange={() =>
                          handleChange("bed_1.wardrobe_type", type)
                        }
                        disabled={readOnly}
                        className="w-3 h-3 accent-[#00ADEF]"
                      />
                      <span>{type}</span>
                    </label>
                  ))}
                  {/* Dimension inputs: [width] x [height] */}
                  <div className="flex items-center gap-0.5 ml-auto">
                    <input
                      type="text"
                      value={getNestedValue(formData, "bed_1.size_width") || ""}
                      onChange={(e) =>
                        handleChange("bed_1.size_width", e.target.value)
                      }
                      disabled={readOnly}
                      placeholder="_"
                      className="w-6 h-5 text-center text-[10px] border border-slate-300 rounded focus:outline-none focus:border-[#00ADEF]"
                    />
                    <span className="text-[10px] font-bold">x</span>
                    <input
                      type="text"
                      value={
                        getNestedValue(formData, "bed_1.size_height") || ""
                      }
                      onChange={(e) =>
                        handleChange("bed_1.size_height", e.target.value)
                      }
                      disabled={readOnly}
                      placeholder="_"
                      className="w-6 h-5 text-center text-[10px] border border-slate-300 rounded focus:outline-none focus:border-[#00ADEF]"
                    />
                  </div>
                </div>
              </div>

              {/* Ensuite (only for Bed 1) with dimensions */}
              <div className="flex border-b border-slate-300">
                <div className="bg-[#E8F4FC] px-2 py-1 w-14 text-[10px] font-bold text-[#001F49] border-r border-slate-300">
                  Ensuite:
                </div>
                <div className="flex items-center gap-1 px-2 flex-1">
                  {/* Dimension inputs: [width] x [height] */}
                  <div className="flex items-center gap-0.5 ml-auto">
                    <input
                      type="text"
                      value={
                        getNestedValue(formData, "bed_1.ensuite.size_width") ||
                        ""
                      }
                      onChange={(e) =>
                        handleChange("bed_1.ensuite.size_width", e.target.value)
                      }
                      disabled={readOnly}
                      placeholder="_"
                      className="w-6 h-5 text-center text-[10px] border border-slate-300 rounded focus:outline-none focus:border-[#00ADEF]"
                    />
                    <span className="text-[10px] font-bold">x</span>
                    <input
                      type="text"
                      value={
                        getNestedValue(formData, "bed_1.ensuite.size_height") ||
                        ""
                      }
                      onChange={(e) =>
                        handleChange(
                          "bed_1.ensuite.size_height",
                          e.target.value,
                        )
                      }
                      disabled={readOnly}
                      placeholder="_"
                      className="w-6 h-5 text-center text-[10px] border border-slate-300 rounded focus:outline-none focus:border-[#00ADEF]"
                    />
                  </div>
                </div>
              </div>

              {/* SOB / Sep Shower / Bath row */}
              <div className="flex border-b border-slate-300 bg-slate-50">
                <div className="px-2 py-1 text-[9px] text-slate-500 flex items-center gap-2">
                  {["SOB", "Sep Shower", "Bath"].map((type) => (
                    <label
                      key={type}
                      className="flex items-center gap-0.5 cursor-pointer"
                    >
                      <input
                        type="radio"
                        checked={
                          getNestedValue(formData, "bed_1.ensuite.type") ===
                          type
                        }
                        onChange={() =>
                          handleChange("bed_1.ensuite.type", type)
                        }
                        disabled={readOnly}
                        className="w-3 h-3 accent-[#00ADEF]"
                      />
                      <span>{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Bed 2-5 with BI/WI + dimensions */}
              {[2, 3, 4, 5].map((n) => (
                <div key={n} className="flex border-b border-slate-300">
                  <div className="bg-[#E8F4FC] px-2 py-1 w-14 text-[10px] font-bold text-[#001F49] border-r border-slate-300">
                    Bed {n}:
                  </div>
                  <div className="flex items-center gap-1 px-2 flex-1">
                    {["BI", "WI"].map((type) => (
                      <label
                        key={type}
                        className="flex items-center gap-0.5 cursor-pointer text-[10px]"
                      >
                        <input
                          type="radio"
                          checked={
                            getNestedValue(
                              formData,
                              `bed_${n}.wardrobe_type`,
                            ) === type
                          }
                          onChange={() =>
                            handleChange(`bed_${n}.wardrobe_type`, type)
                          }
                          disabled={readOnly}
                          className="w-3 h-3 accent-[#00ADEF]"
                        />
                        <span>{type}</span>
                      </label>
                    ))}
                    {/* Dimension inputs: [width] x [height] */}
                    <div className="flex items-center gap-0.5 ml-auto">
                      <input
                        type="text"
                        value={
                          getNestedValue(formData, `bed_${n}.size_width`) || ""
                        }
                        onChange={(e) =>
                          handleChange(`bed_${n}.size_width`, e.target.value)
                        }
                        disabled={readOnly}
                        placeholder="_"
                        className="w-6 h-5 text-center text-[10px] border border-slate-300 rounded focus:outline-none focus:border-[#00ADEF]"
                      />
                      <span className="text-[10px] font-bold">x</span>
                      <input
                        type="text"
                        value={
                          getNestedValue(formData, `bed_${n}.size_height`) || ""
                        }
                        onChange={(e) =>
                          handleChange(`bed_${n}.size_height`, e.target.value)
                        }
                        disabled={readOnly}
                        placeholder="_"
                        className="w-6 h-5 text-center text-[10px] border border-slate-300 rounded focus:outline-none focus:border-[#00ADEF]"
                      />
                    </div>
                  </div>
                </div>
              ))}

              {/* Main Bathroom */}
              <div className="flex border-b border-slate-300">
                <div className="bg-[#E8F4FC] px-2 py-1 w-14 text-[10px] font-bold text-[#001F49] border-r border-slate-300">
                  Bathroom:
                </div>
                <div className="flex items-center px-2 flex-1">
                  <input
                    type="checkbox"
                    checked={
                      getNestedValue(formData, "bathroom.exists") === true
                    }
                    onChange={(e) =>
                      handleChange("bathroom.exists", e.target.checked)
                    }
                    disabled={readOnly}
                    className="w-4 h-4 accent-[#00ADEF]"
                  />
                </div>
              </div>

              {/* SOB / Sep Shower / Bath for main bathroom */}
              <div className="flex border-b border-slate-300 bg-slate-50">
                <div className="px-2 py-1 text-[9px] text-slate-500 flex items-center gap-2">
                  {["SOB", "Sep Shower", "Bath"].map((type) => (
                    <label
                      key={type}
                      className="flex items-center gap-0.5 cursor-pointer"
                    >
                      <input
                        type="radio"
                        checked={
                          getNestedValue(formData, "bathroom.type") === type
                        }
                        onChange={() => handleChange("bathroom.type", type)}
                        disabled={readOnly}
                        className="w-3 h-3 accent-[#00ADEF]"
                      />
                      <span>{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Toilets */}
              <div className="flex border-b border-slate-300">
                <div className="bg-[#E8F4FC] px-2 py-1 w-14 text-[10px] font-bold text-[#001F49] border-r border-slate-300">
                  Toilets:
                </div>
                <div className="flex items-center gap-2 px-2">
                  {[1, 2, 3, 4].map((n) => (
                    <label
                      key={n}
                      className="flex items-center gap-1 cursor-pointer"
                    >
                      <input
                        type="radio"
                        checked={
                          formData.toilets === n ||
                          formData.toilets === String(n)
                        }
                        onChange={() => handleChange("toilets", n)}
                        disabled={readOnly}
                        className="w-3 h-3 accent-[#00ADEF]"
                      />
                      <span>{n}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* All rooms: Kitchen to Laundry with X checkbox + dimensions */}
              {[
                "kitchen",
                "dining",
                "lounge",
                "family",
                "rumpus",
                "office",
                "laundry",
              ].map((room) => (
                <div key={room} className="flex border-b border-slate-300">
                  <div className="bg-[#E8F4FC] px-2 py-1 w-14 text-[10px] font-bold text-[#001F49] border-r border-slate-300 capitalize">
                    {room}:
                  </div>
                  <div className="flex items-center gap-1 px-2 flex-1">
                    {/* X checkbox */}
                    <input
                      type="checkbox"
                      checked={
                        getNestedValue(formData, `${room}.exists`) === true
                      }
                      onChange={(e) =>
                        handleChange(`${room}.exists`, e.target.checked)
                      }
                      disabled={readOnly}
                      className="w-4 h-4 accent-[#00ADEF]"
                    />
                    {/* Dimension inputs: [width] x [height] */}
                    <div className="flex items-center gap-0.5 ml-auto">
                      <input
                        type="text"
                        value={
                          getNestedValue(formData, `${room}.size_width`) || ""
                        }
                        onChange={(e) =>
                          handleChange(`${room}.size_width`, e.target.value)
                        }
                        disabled={readOnly}
                        placeholder="_"
                        className="w-6 h-5 text-center text-[10px] border border-slate-300 rounded focus:outline-none focus:border-[#00ADEF]"
                      />
                      <span className="text-[10px] font-bold">x</span>
                      <input
                        type="text"
                        value={
                          getNestedValue(formData, `${room}.size_height`) || ""
                        }
                        onChange={(e) =>
                          handleChange(`${room}.size_height`, e.target.value)
                        }
                        disabled={readOnly}
                        placeholder="_"
                        className="w-6 h-5 text-center text-[10px] border border-slate-300 rounded focus:outline-none focus:border-[#00ADEF]"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Column 2: Utilities */}
            <div className="border-r border-slate-300">
              <YesNo label="Gas Hot Water:" path="gas_hot_water" />
              <YesNo label="Town Gas:" path="town_gas" />
              <YesNo label="Bottled Gas:" path="bottled_gas" />
              <YesNo label="Solar Hot Water:" path="solar_hot_water" />
              <YesNo label="Insulation:" path="insulation" />
              <div className="flex border-b border-slate-300 px-2 py-1 text-[10px] bg-[#E8F4FC]">
                Ceiling / Walls / Floor
              </div>
              <Cell label="Garage:" path="garage" labelWidth="w-20" />
              <Cell label="Car Port:" path="car_port" labelWidth="w-20" />
              <YesNo label="Electric R/Door:" path="electric_r_door" />
              <Cell label="Septic Tank:" path="septic_tank" labelWidth="w-20" />
              <YesNo label="Town Water:" path="town_water" />
              <Cell
                label="Water Tank:"
                path="water_tank_capacity_liters"
                labelWidth="w-20"
              />
              <Cell label="Rewired:" path="rewired" labelWidth="w-20" />
              <Cell label="Replumbed:" path="replumbed" labelWidth="w-20" />
              <Cell label="Strata Fees:" path="strata_fees" labelWidth="w-20" />
              <Cell label="Commission:" path="commission" labelWidth="w-20" />
              <Cell
                label="Marketing Fee:"
                path="marketing_fee"
                labelWidth="w-24"
              />
              <Cell label="Price:" path="price_financial" labelWidth="w-20" />
            </div>

            {/* Column 3: Features/Chattels */}
            <div>
              {/* Checkboxes */}
              <div className="border-b border-slate-300 py-1 px-2 flex flex-wrap gap-x-4 gap-y-1">
                <Check label="Floor Coverings" path="floor_coverings" />
                <Check label="Insect Screens" path="insect_screens" />
                <Check label="Window Furnishings" path="window_furnishings" />
                <Check label="Clothesline" path="clothesline" />
                <Check label="Drapes/Blinds" path="drapes_blinds" />
                <Check label="TV Antenna" path="tv_antenna" />
              </div>

              {/* String fields */}
              <Cell label="Exhaust Fan:" path="exhaust_fan" labelWidth="w-24" />
              <Cell label="Rangehood:" path="rangehood" labelWidth="w-24" />
              <Cell label="Stove:" path="stove" labelWidth="w-24" />
              <Cell label="Wall Oven:" path="wall_oven" labelWidth="w-24" />
              <Cell label="Hot Plates:" path="hot_plates" labelWidth="w-24" />
              <Cell label="Microwave:" path="microwave" labelWidth="w-24" />
              <Cell label="Dishwasher:" path="dishwasher" labelWidth="w-24" />
              <Cell label="Heating:" path="heating" labelWidth="w-24" />
              <Cell label="Heat Pump:" path="heat_pump" labelWidth="w-24" />
              <Cell label="Wood Heater:" path="wood_heater" labelWidth="w-24" />
              <Cell
                label="Security System:"
                path="security_system"
                labelWidth="w-28"
              />
              <Cell
                label="Security Doors:"
                path="security_doors"
                labelWidth="w-28"
              />
              <Cell label="Shed:" path="shed" labelWidth="w-24" />
              <Cell
                label="Smoke Detector/s:"
                path="smoke_detectors"
                labelWidth="w-28"
              />
              <Cell
                label="Solar Panels:"
                path="solar_panels"
                labelWidth="w-24"
                className="border-b-0"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      
    </FormContext.Provider>
  );
}
