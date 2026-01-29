"use client";

import { ListingData } from "@/lib/gemini-ocr";
import { cn } from "@/lib/utils";
import {
  Check,
  ChevronDown,
  Bed,
  Bath,
  Car,
  Image as ImageIcon,
} from "lucide-react";
import React, { useEffect, createContext, useContext } from "react";

interface SmartListingFormProps {
  initialData: ListingData | null;
  onChange?: (data: ListingData) => void;
  readOnly?: boolean;
  onViewImage?: () => void;
}

// ─────────────────────────────────────────────────────────────
// CONTEXT DEFINITION
// ─────────────────────────────────────────────────────────────
interface SmartFormContextType {
  formData: any;
  handleChange: (path: string, value: any) => void;
  readOnly: boolean;
}

const SmartFormContext = createContext<SmartFormContextType | undefined>(
  undefined,
);

const useSmartForm = () => {
  const context = useContext(SmartFormContext);
  if (!context) {
    throw new Error("useSmartForm must be used within a SmartFormProvider");
  }
  return context;
};

// Helper to safely get nested values (e.g., "construction.type")
const getNestedValue = (obj: any, path: string) => {
  return path
    .split(".")
    .reduce((prev, curr) => (prev ? prev[curr] : undefined), obj);
};

// Helper to safely set nested values
const setNestedValue = (obj: any, path: string, value: any) => {
  const newObj = JSON.parse(JSON.stringify(obj)); // Deep clone
  const keys = path.split(".");
  let current = newObj;
  for (let i = 0; i < keys.length - 1; i++) {
    if (!current[keys[i]]) current[keys[i]] = {};
    current = current[keys[i]];
  }
  current[keys[keys.length - 1]] = value;
  return newObj;
};

// ─────────────────────────────────────────────────────────────
// EXTERNAL FIELD COMPONENTS
// ─────────────────────────────────────────────────────────────

const InputField = ({
  label,
  path,
  type = "text",
  placeholder = "",
  className = "",
  labelClassName = "",
  inputClassName = "",
}: {
  label?: string;
  path: string;
  type?: string;
  placeholder?: string;
  className?: string;
  labelClassName?: string;
  inputClassName?: string;
}) => {
  const { formData, handleChange, readOnly } = useSmartForm();
  const value = getNestedValue(formData, path) || "";

  return (
    <div className={cn("flex flex-col", className)}>
      {label && (
        <label
          className={cn(
            "text-[10px] font-bold text-[#001F49] uppercase tracking-wider mb-0.5",
            labelClassName,
          )}
        >
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => handleChange(path, e.target.value)}
        disabled={readOnly}
        placeholder={placeholder}
        className={cn(
          "w-full bg-white border border-slate-300 px-2 py-1.5 text-sm text-slate-800 focus:outline-none focus:border-[#00ADEF] focus:ring-1 focus:ring-[#00ADEF]/20 transition-colors placeholder:text-slate-400",
          readOnly && "cursor-default bg-slate-50 text-slate-600",
          inputClassName,
        )}
      />
    </div>
  );
};

const SelectField = ({
  label,
  path,
  options,
  className = "",
}: {
  label?: string;
  path: string;
  options: (string | number)[];
  className?: string;
}) => {
  const { formData, handleChange, readOnly } = useSmartForm();
  let value = getNestedValue(formData, path) || "";
  if (Array.isArray(value)) value = value.length > 0 ? value[0] : "";

  return (
    <div className={cn("flex flex-col", className)}>
      {label && (
        <label className="text-[10px] font-bold text-[#001F49] uppercase tracking-wider mb-0.5">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          value={value}
          onChange={(e) => handleChange(path, e.target.value)}
          disabled={readOnly}
          className="w-full bg-white border border-slate-300 px-2 py-1.5 text-sm text-slate-800 focus:outline-none focus:border-[#00ADEF] appearance-none cursor-pointer pr-6"
        >
          <option value="">–</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
      </div>
    </div>
  );
};

const CheckboxField = ({
  label,
  path,
  className = "",
}: {
  label: string;
  path: string;
  className?: string;
}) => {
  const { formData, handleChange, readOnly } = useSmartForm();
  const checked = getNestedValue(formData, path) === true;

  return (
    <label
      className={cn(
        "flex items-center gap-2 cursor-pointer select-none",
        className,
      )}
    >
      <div
        className={cn(
          "w-4 h-4 border rounded flex items-center justify-center transition-colors",
          checked
            ? "bg-[#00ADEF] border-[#00ADEF]"
            : "bg-white border-slate-300",
          readOnly && "opacity-70 cursor-default",
        )}
      >
        {checked && <Check className="w-3 h-3 text-white" />}
      </div>
      <input
        type="checkbox"
        className="hidden"
        checked={checked}
        onChange={(e) => handleChange(path, e.target.checked)}
        disabled={readOnly}
      />
      <span className="text-xs text-slate-700 font-medium">{label}</span>
    </label>
  );
};

const YesNoField = ({
  label,
  path,
  className = "",
}: {
  label: string;
  path: string;
  className?: string;
}) => {
  const { formData, handleChange, readOnly } = useSmartForm();
  const value = getNestedValue(formData, path);

  return (
    <div className={cn("flex flex-col", className)}>
      <span className="text-[10px] font-bold text-[#001F49] uppercase tracking-wider mb-1">
        {label}
      </span>
      <div className="flex bg-white border border-slate-300 rounded overflow-hidden w-fit">
        {["Yes", "No"].map((option) => (
          <button
            key={option}
            onClick={() => handleChange(path, option)}
            disabled={readOnly}
            className={cn(
              "px-3 py-1 text-xs font-medium transition-colors border-r last:border-r-0 cursor-pointer",
              value === option
                ? "bg-[#00ADEF] text-white"
                : "bg-white text-slate-600 hover:bg-slate-50",
            )}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};

const BlueHeader = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={cn(
      "bg-[#001F49] text-white px-3 py-1.5 text-xs font-bold uppercase tracking-wider",
      className,
    )}
  >
    {children}
  </div>
);

export default function SmartListingForm({
  initialData,
  onChange,
  readOnly = false,
  onViewImage,
}: SmartListingFormProps) {
  const formData = initialData || {};

  const handleChange = (path: string, value: any) => {
    if (readOnly) return;
    const newData = setNestedValue(formData, path, value);
    if (onChange) onChange(newData);
  };

  // Sync address components to full address string
  useEffect(() => {
    if (readOnly) return;
    const c = formData.address_components || {};

    // Only update if we have at least a street name or suburb to avoid empty updates wiping existing data on init
    // But we should also respect clearing fields.
    // Better check: if address_components exists and differs from what expected address string is.
    if (c.street_name || c.suburb) {
      const parts = [
        c.unit ? `${c.unit}/` : "",
        c.street_number,
        c.street_name,
        c.suburb,
        c.state,
        c.postcode,
      ].filter(Boolean);

      // Fix "Unit 5/" space issue if exists
      let fullAddr = parts.join(" ").replace("/ ", "/").trim();

      // Update if different
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

  return (
    <SmartFormContext.Provider value={{ formData, handleChange, readOnly }}>
      <div className="w-full max-w-5xl mx-auto bg-white shadow-xl rounded-none print:shadow-none p-8 md:p-12 font-sans">
        {/* ══════════════════════════════════════════════════════════
            HEADER & TOP INFO
            ══════════════════════════════════════════════════════════ */}
        <div className="flex items-stretch border-b border-slate-300">
          {/* Left: Harcourts Branding */}
          <div className="flex-1 p-4 border-r border-slate-300">
            <h1 className="font-display text-3xl font-black text-[#001F49] tracking-tight">
              <span className="border-b-4 border-[#00ADEF] pb-1">
                Harcourts
              </span>
            </h1>
            {/* Bed/Bath/Parking Icons */}
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1.5 text-slate-600">
                <Bed className="w-5 h-5" />
                <span className="text-lg font-bold">
                  {formData.bedrooms_icon_count || "–"}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-600">
                <Bath className="w-5 h-5" />
                <span className="text-lg font-bold">
                  {formData.bathrooms_icon_count || "–"}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-600">
                <Car className="w-5 h-5" />
                <span className="text-lg font-bold">
                  {formData.parking_icon_count || "–"}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Agent Info Grid */}
          <div className="grid grid-cols-2 text-sm">
            <div className="px-3 py-2 border-b border-r border-slate-300 bg-slate-50">
              <span className="text-[10px] font-bold text-[#001F49] uppercase">
                Listing Agent
              </span>
            </div>
            <div className="px-3 py-2 border-b border-slate-300">
              <input
                value={formData.listing_agent || ""}
                onChange={(e) => handleChange("listing_agent", e.target.value)}
                disabled={readOnly}
                className="w-full bg-transparent text-sm font-medium focus:outline-none"
                placeholder="Agent name"
              />
            </div>

            <div className="px-3 py-2 border-b border-r border-slate-300 bg-slate-50">
              <span className="text-[10px] font-bold text-[#001F49] uppercase">
                Agency Type
              </span>
            </div>
            <div className="px-3 py-2 border-b border-slate-300 flex gap-2">
              {["Sole", "Open", "Joint"].map((type) => (
                <label
                  key={type}
                  className="flex items-center gap-1 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="agency_type"
                    value={type}
                    checked={formData.agency_type === type}
                    onChange={(e) =>
                      handleChange("agency_type", e.target.value)
                    }
                    disabled={readOnly}
                    className="w-3 h-3 accent-[#00ADEF]"
                  />
                  <span className="text-xs">{type}</span>
                </label>
              ))}
            </div>

            <div className="px-3 py-2 border-b border-r border-slate-300 bg-slate-50">
              <span className="text-[10px] font-bold text-[#001F49] uppercase">
                Date Listed
              </span>
            </div>
            <div className="px-3 py-2 border-b border-slate-300">
              <input
                type="date"
                value={formData.date_listed || ""}
                onChange={(e) => handleChange("date_listed", e.target.value)}
                disabled={readOnly}
                className="w-full bg-transparent text-sm focus:outline-none cursor-pointer"
              />
            </div>

            <div className="px-3 py-2 border-r border-slate-300 bg-slate-50">
              <span className="text-[10px] font-bold text-[#001F49] uppercase">
                Price
              </span>
            </div>
            <div className="px-3 py-2">
              <input
                value={formData.price?.display_text || ""}
                onChange={(e) =>
                  handleChange("price.display_text", e.target.value)
                }
                disabled={readOnly}
                className="w-full bg-transparent text-sm font-semibold text-[#001F49] focus:outline-none"
                placeholder="$000,000"
              />
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════
          HANDWRITTEN NOTES (Yellow Section)
          ══════════════════════════════════════════════════════════ */}
        <div className="bg-[#FFFEF0] border-b border-yellow-200 p-3">
          <div className="grid grid-cols-3 gap-3">
            <InputField
              label="Financial Notes"
              path="handwritten_notes_top.financial_note"
              inputClassName="bg-transparent border-dashed border-yellow-300 italic"
            />
            <InputField
              label="Property Notes"
              path="handwritten_notes_top.property_note"
              inputClassName="bg-transparent border-dashed border-yellow-300 italic"
            />
            <InputField
              label="Other Notes"
              path="handwritten_notes_top.other_notes"
              inputClassName="bg-transparent border-dashed border-yellow-300 italic"
            />
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════
          ADDRESS SECTION
          ══════════════════════════════════════════════════════════ */}
        <BlueHeader className="flex items-center justify-between">
          <span>Address</span>
          {onViewImage && (
            <button
              onClick={onViewImage}
              className="flex items-center gap-1.5 px-2 py-0.5 bg-white/20 hover:bg-white/30 rounded text-white text-[10px] font-semibold uppercase transition-colors cursor-pointer"
            >
              <ImageIcon className="w-3 h-3" />
              See Image
            </button>
          )}
        </BlueHeader>
        <div className="border-b border-slate-300">
          {/* Row 1: Unit | Street # | Street Name */}
          <div className="flex border-b border-slate-100">
            <div className="w-20 border-r border-slate-100 p-2">
              <InputField
                label="Unit"
                path="address_components.unit"
                placeholder="Unit"
                className="w-full"
              />
            </div>
            <div className="w-24 border-r border-slate-100 p-2">
              <InputField
                label="Street No"
                path="address_components.street_number"
                placeholder="No."
                className="w-full"
              />
            </div>
            <div className="flex-1 p-2">
              <InputField
                label="Street Name"
                path="address_components.street_name"
                placeholder="Street Name"
                className="w-full"
              />
            </div>
          </div>

          {/* Row 2: Suburb | State | Postcode */}
          <div className="flex border-b border-slate-300">
            <div className="flex-1 border-r border-slate-100 p-2">
              <InputField
                label="Suburb"
                path="address_components.suburb"
                placeholder="Suburb"
                className="w-full"
              />
            </div>
            <div className="w-24 border-r border-slate-100 p-2">
              <SelectField
                label="State"
                path="address_components.state"
                options={["NSW", "VIC", "QLD", "SA", "WA", "TAS", "NT", "ACT"]}
                className="w-full"
              />
            </div>
            <div className="w-24 p-2">
              <InputField
                label="Postcode"
                path="address_components.postcode"
                placeholder="PC"
                className="w-full"
              />
            </div>
          </div>

          {/* Sync full address when components change */}
          {
            useEffect(() => {
              if (readOnly) return;
              const c = formData.address_components || {};
              // Only update if we have at least some address data
              if (c.street_name || c.suburb) {
                const parts = [
                  c.unit ? `${c.unit}/` : "",
                  c.street_number,
                  c.street_name,
                  c.suburb,
                  c.state,
                  c.postcode,
                ].filter(Boolean);

                // Handle unit format logic: "Unit 5" vs "5/"
                let fullAddr = parts.join(" ").replace("/ ", "/").trim();

                // Avoid infinite loop by checking if different
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
            ]) as any
          }

          <div className="grid grid-cols-2">
            <div className="flex items-center px-2 py-1.5 border-r border-slate-300">
              <span className="text-[10px] font-bold text-[#001F49] uppercase mr-2">
                Title Ref.
              </span>
              <input
                value={formData.title_ref || ""}
                onChange={(e) => handleChange("title_ref", e.target.value)}
                disabled={readOnly}
                className="flex-1 bg-transparent text-sm focus:outline-none"
              />
            </div>
            <div className="flex items-center px-2 py-1.5">
              <span className="text-[10px] font-bold text-[#001F49] uppercase mr-2">
                PID
              </span>
              <input
                value={formData.pid || ""}
                onChange={(e) => handleChange("pid", e.target.value)}
                disabled={readOnly}
                className="flex-1 bg-transparent text-sm focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════
          PROPERTY DETAILS GRID (4 columns like paper form)
          ══════════════════════════════════════════════════════════ */}
        <div className="border-b border-slate-300">
          {/* Row 1 */}
          <div className="grid grid-cols-4 border-b border-slate-200">
            <div className="p-2 border-r border-slate-200">
              <InputField label="Year Built" path="year_built" />
            </div>
            <div className="p-2 border-r border-slate-200">
              <label className="text-[10px] font-bold text-[#001F49] uppercase tracking-wider mb-0.5 block">
                Construction
              </label>
              <div className="flex gap-1 mt-1">
                {["B", "BV", "WB", "R"].map((type) => (
                  <label
                    key={type}
                    className="flex items-center gap-0.5 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="construction_type"
                      value={type}
                      checked={formData.construction?.type === type}
                      onChange={(e) =>
                        handleChange("construction.type", e.target.value)
                      }
                      disabled={readOnly}
                      className="w-3 h-3 accent-[#00ADEF]"
                    />
                    <span className="text-xs font-medium">{type}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="p-2 border-r border-slate-200">
              <InputField label="Zoning" path="zoning" />
            </div>
            <div className="p-2 flex items-end gap-1">
              <InputField label="Rates" path="rates" className="flex-1" />
              <span className="text-xs text-slate-500 pb-2">$</span>
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-4 border-b border-slate-200">
            <div className="p-2 border-r border-slate-200">
              <InputField label="Land Size" path="land_size" />
            </div>
            <div className="p-2 border-r border-slate-200">
              <label className="text-[10px] font-bold text-[#001F49] uppercase tracking-wider mb-0.5 block">
                Windows
              </label>
              <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-1">
                {["Timber", "Alum", "DBL", "Single"].map((type) => (
                  <label
                    key={type}
                    className="flex items-center gap-0.5 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={
                        Array.isArray(formData.windows?.type)
                          ? formData.windows.type.includes(type)
                          : formData.windows?.type === type
                      }
                      onChange={(e) => {
                        if (readOnly) return;
                        const current = Array.isArray(formData.windows?.type)
                          ? formData.windows.type
                          : formData.windows?.type
                            ? [formData.windows.type]
                            : [];
                        const updated = e.target.checked
                          ? [...current, type]
                          : current.filter((t: string) => t !== type);
                        handleChange("windows.type", updated);
                      }}
                      disabled={readOnly}
                      className="w-3 h-3 accent-[#00ADEF]"
                    />
                    <span className="text-[10px]">{type}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="p-2 border-r border-slate-200">
              <InputField label="Council" path="council" />
            </div>
            <div className="p-2 flex items-end gap-1">
              <InputField
                label="Water Rates"
                path="water_rates"
                className="flex-1"
              />
              <span className="text-xs text-slate-500 pb-2">$</span>
            </div>
          </div>

          {/* Row 3 */}
          <div className="grid grid-cols-4">
            <div className="p-2 border-r border-slate-200">
              <InputField label="Building Size" path="building_size" />
            </div>
            <div className="p-2 border-r border-slate-200">
              <label className="text-[10px] font-bold text-[#001F49] uppercase tracking-wider mb-0.5 block">
                Roof
              </label>
              <div className="flex gap-2 mt-1">
                {["Tile", "CB", "T"].map((type) => (
                  <label
                    key={type}
                    className="flex items-center gap-0.5 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="roof_type"
                      value={type}
                      checked={formData.roof?.type === type}
                      onChange={(e) =>
                        handleChange("roof.type", e.target.value)
                      }
                      disabled={readOnly}
                      className="w-3 h-3 accent-[#00ADEF]"
                    />
                    <span className="text-xs font-medium">{type}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="p-2 border-r border-slate-200 flex items-end gap-1">
              <InputField
                label="Capital Value"
                path="capital_value"
                className="flex-1"
              />
              <span className="text-xs text-slate-500 pb-2">$</span>
            </div>
            <div className="p-2 flex items-end gap-1">
              <InputField
                label="Land Value"
                path="land_value"
                className="flex-1"
              />
              <span className="text-xs text-slate-500 pb-2">$</span>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════
          VENDOR SECTION
          ══════════════════════════════════════════════════════════ */}
        <BlueHeader className="grid grid-cols-2">
          <span>Vendor/s</span>
          <span className="text-right">Phone Number/s</span>
        </BlueHeader>
        <div className="grid grid-cols-2 border-b border-slate-300">
          <div className="p-2 border-r border-slate-300">
            <input
              value={formData.vendors || ""}
              onChange={(e) => handleChange("vendors", e.target.value)}
              disabled={readOnly}
              className="w-full bg-transparent text-sm focus:outline-none"
              placeholder="Vendor name(s)"
            />
          </div>
          <div className="p-2">
            <input
              value={formData.phone_numbers || ""}
              onChange={(e) => handleChange("phone_numbers", e.target.value)}
              disabled={readOnly}
              className="w-full bg-transparent text-sm focus:outline-none"
              placeholder="Phone number(s)"
            />
          </div>
        </div>

        {/* Postal Address */}
        <BlueHeader>Postal Address</BlueHeader>
        <div className="border-b border-slate-300 p-2">
          <input
            value={formData.postal_address || ""}
            onChange={(e) => handleChange("postal_address", e.target.value)}
            disabled={readOnly}
            className="w-full bg-transparent text-sm focus:outline-none"
            placeholder="Postal address"
          />
        </div>

        {/* Email / Solicitor */}
        <div className="grid grid-cols-2 border-b border-slate-300">
          <div className="p-2 border-r border-slate-300">
            <label className="text-[10px] font-bold text-[#001F49] uppercase">
              Email
            </label>
            <input
              value={formData.email || ""}
              onChange={(e) => handleChange("email", e.target.value)}
              disabled={readOnly}
              className="w-full bg-transparent text-sm focus:outline-none mt-0.5"
              placeholder="Email address"
            />
          </div>
          <div className="p-2">
            <label className="text-[10px] font-bold text-[#001F49] uppercase">
              Solicitor
            </label>
            <input
              value={formData.solicitor || ""}
              onChange={(e) => handleChange("solicitor", e.target.value)}
              disabled={readOnly}
              className="w-full bg-transparent text-sm focus:outline-none mt-0.5"
              placeholder="Solicitor details"
            />
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════
          TWO COLUMN LAYOUT: ROOMS + UTILITIES
          ══════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-2 border-b border-slate-300">
          {/* LEFT COLUMN: Rooms */}
          <div className="border-r border-slate-300">
            {/* Bed 1 with Ensuite */}
            <div className="grid grid-cols-[auto,1fr,1fr,1fr] items-center gap-1 p-1.5 border-b border-slate-200 text-xs">
              <CheckboxField label="Bed 1:" path="bed_1.exists" />
              <SelectField
                path="bed_1.wardrobe_type"
                options={["BI", "WI", ""]}
                className="text-xs"
              />
              <InputField path="bed_1.measurements" placeholder="Size" />
              <div className="text-[10px] text-slate-500">
                <span className="font-bold">Ensuite:</span>
                <div className="flex gap-1 mt-0.5">
                  <SelectField
                    path="bed_1.ensuite.type"
                    options={["SOB", "Sep Shower", "Bath"]}
                  />
                </div>
              </div>
            </div>

            {/* Beds 2-5 */}
            {[2, 3, 4, 5].map((num) => (
              <div
                key={num}
                className="grid grid-cols-[auto,1fr,1fr,1fr] items-center gap-1 p-1.5 border-b border-slate-200 text-xs"
              >
                <CheckboxField
                  label={`Bed ${num}:`}
                  path={`bed_${num}.exists`}
                />
                <SelectField
                  path={`bed_${num}.wardrobe_type`}
                  options={["BI", "WI", ""]}
                />
                <InputField
                  path={`bed_${num}.measurements`}
                  placeholder="Size"
                />
                <div />
              </div>
            ))}

            {/* Bathroom */}
            <div className="grid grid-cols-[auto,1fr,1fr] items-center gap-1 p-1.5 border-b border-slate-200 text-xs">
              <CheckboxField label="Bathroom:" path="bathroom.exists" />
              <SelectField
                path="bathroom.type"
                options={["SOB", "Sep Shower", "Bath"]}
              />
              <InputField path="bathroom.measurements" placeholder="Size" />
            </div>

            {/* Toilets */}
            <div className="flex items-center gap-2 p-1.5 border-b border-slate-200 text-xs">
              <span className="font-bold text-slate-700">Toilets:</span>
              <div className="flex gap-2">
                {[1, 2, 3, 4].map((n) => (
                  <label
                    key={n}
                    className="flex items-center gap-0.5 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="toilets"
                      value={n}
                      checked={
                        formData.toilets === n || formData.toilets === String(n)
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

            {/* Living Areas */}
            {[
              "Kitchen",
              "Dining",
              "Lounge",
              "Family",
              "Rumpus",
              "Office",
              "Laundry",
            ].map((room) => {
              const key = room.toLowerCase();
              return (
                <div
                  key={key}
                  className="grid grid-cols-[auto,1fr,1fr] items-center gap-1 p-1.5 border-b border-slate-200 text-xs"
                >
                  <CheckboxField label={`${room}:`} path={`${key}.exists`} />
                  <InputField path={`${key}.measurements`} placeholder="Size" />
                  {key !== "laundry" && (
                    <InputField
                      path={`${key}.connected_to`}
                      placeholder="Connected to"
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* RIGHT COLUMN: Utilities & Features */}
          <div className="text-xs">
            {/* Utilities */}
            <div className="p-2 border-b border-slate-200 space-y-1.5">
              <YesNoField label="Gas Hot Water" path="gas_hot_water" />
              <YesNoField label="Town Gas" path="town_gas" />
              <YesNoField label="Bottled Gas" path="bottled_gas" />
              <YesNoField label="Solar Hot Water" path="solar_hot_water" />
              <YesNoField label="Insulation" path="insulation" />
              <div className="flex items-center gap-3 pl-24">
                <CheckboxField
                  label="Ceiling"
                  path="insulation_locations.ceiling"
                />
                <CheckboxField
                  label="Walls"
                  path="insulation_locations.walls"
                />
                <CheckboxField
                  label="Floor"
                  path="insulation_locations.floor"
                />
              </div>
            </div>

            {/* Garage / Carport */}
            <div className="grid grid-cols-2 gap-2 p-2 border-b border-slate-200">
              <InputField label="Garage" path="garage" />
              <InputField label="Car Port" path="car_port" />
            </div>

            {/* Electric Door / Septic */}
            <div className="p-2 border-b border-slate-200 space-y-1.5">
              <YesNoField label="Electric R/Door" path="electric_r_door" />
              <InputField label="Septic Tank" path="septic_tank" />
              <YesNoField label="Town Water" path="town_water" />
              <InputField
                label="Water Tank (L)"
                path="water_tank_capacity_liters"
              />
            </div>

            {/* Rewired / Replumbed / Strata */}
            <div className="grid grid-cols-2 gap-2 p-2 border-b border-slate-200">
              <InputField label="Rewired" path="rewired" />
              <InputField label="Replumbed" path="replumbed" />
            </div>
            <div className="p-2 border-b border-slate-200">
              <InputField label="Strata Fees" path="strata_fees" />
            </div>

            {/* Commission / Marketing */}
            <div className="grid grid-cols-2 gap-2 p-2 border-b border-slate-200">
              <InputField label="Commission" path="commission" />
              <InputField label="Marketing Fee" path="marketing_fee" />
            </div>

            {/* Chattels (Checkboxes) */}
            <div className="p-2 border-b border-slate-200">
              <div className="grid grid-cols-2 gap-y-1 gap-x-4">
                <CheckboxField label="Floor Coverings" path="floor_coverings" />
                <CheckboxField label="Insect Screens" path="insect_screens" />
                <CheckboxField
                  label="Window Furnishings"
                  path="window_furnishings"
                />
                <CheckboxField label="Clothesline" path="clothesline" />
                <CheckboxField label="Drapes/Blinds" path="drapes_blinds" />
                <CheckboxField label="TV Antenna" path="tv_antenna" />
              </div>
            </div>

            {/* Appliances */}
            <div className="p-2 space-y-1">
              <div className="grid grid-cols-2 gap-2">
                <InputField label="Exhaust Fan" path="exhaust_fan" />
                <InputField label="Rangehood" path="rangehood" />
                <InputField label="Stove" path="stove" />
                <InputField label="Wall Oven" path="wall_oven" />
                <InputField label="Hot Plates" path="hot_plates" />
                <InputField label="Microwave" path="microwave" />
                <InputField label="Dishwasher" path="dishwasher" />
                <InputField label="Heating" path="heating" />
                <InputField label="Heat Pump" path="heat_pump" />
                <InputField label="Wood Heater" path="wood_heater" />
                <InputField label="Security System" path="security_system" />
                <InputField label="Security Doors" path="security_doors" />
                <InputField label="Shed" path="shed" />
                <InputField label="Smoke Detectors" path="smoke_detectors" />
                <InputField label="Solar Panels" path="solar_panels" />
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════
          BOTTOM NOTES SECTION
          ══════════════════════════════════════════════════════════ */}
        <div className="p-3">
          <label className="text-[10px] font-bold text-[#001F49] uppercase tracking-wider mb-1 block">
            Additional Notes
          </label>
          <textarea
            value={formData.handwritten_notes_section || ""}
            onChange={(e) =>
              handleChange("handwritten_notes_section", e.target.value)
            }
            disabled={readOnly}
            rows={4}
            className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-sm text-slate-800 focus:outline-none focus:border-[#00ADEF] resize-none"
            placeholder="Additional notes..."
          />
        </div>

        {/* Notes Page Content */}
        {(formData.notes_page_content || !readOnly) && (
          <div className="p-3 border-t border-slate-200 bg-slate-50">
            <label className="text-[10px] font-bold text-[#001F49] uppercase tracking-wider mb-1 block">
              Notes Page Content
            </label>
            <textarea
              value={formData.notes_page_content || ""}
              onChange={(e) =>
                handleChange("notes_page_content", e.target.value)
              }
              disabled={readOnly}
              rows={4}
              className="w-full bg-white border border-slate-200 rounded p-2 text-sm text-slate-800 focus:outline-none focus:border-[#00ADEF] resize-none"
              placeholder="Content from notes page..."
            />
          </div>
        )}
      </div>
    </SmartFormContext.Provider>
  );
}
