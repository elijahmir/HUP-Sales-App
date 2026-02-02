import {
  Home,
  FileText,
  DollarSign,
  Calendar,
  AlertCircle,
  Info,
} from "lucide-react";
import { useState } from "react";
import type { FormData } from "@/lib/saa/types";
import { SuburbAutocomplete } from "./SuburbAutocomplete";
import { isValidSuburb } from "@/lib/saa/suburbs";

interface PropertySectionProps {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
  errors: Record<string, string | undefined>;
  setErrors: (errors: Record<string, string | undefined>) => void;
}

export function PropertySection({
  formData,
  updateFormData,
  errors,
  setErrors,
}: PropertySectionProps) {
  const [periodError, setPeriodError] = useState<string>("");

  const handleChange = (field: keyof FormData, value: string) => {
    updateFormData({ [field]: value });
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  const handleCheckboxChange = (field: keyof FormData, checked: boolean) => {
    updateFormData({ [field]: checked });
  };

  const handlePeriodChange = (value: string) => {
    const num = parseInt(value, 10);
    updateFormData({ soleAgencyPeriod: value });

    if (value && (isNaN(num) || num < 1)) {
      setPeriodError("Must be a positive number");
    } else if (formData.agencyPeriodType === "standard" && num > 120) {
      setPeriodError("Maximum 120 days allowed");
    } else {
      setPeriodError("");
    }

    if (errors.soleAgencyPeriod) {
      const newErrors = { ...errors };
      delete newErrors.soleAgencyPeriod;
      setErrors(newErrors);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Property Address */}
      <div className="section-card">
        <h2 className="section-title">
          <Home className="text-harcourts-blue" />
          Property Details
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-8">
            <label htmlFor="propertyStreet" className="field-label">
              Street Address
            </label>
            <input
              type="text"
              id="propertyStreet"
              value={formData.propertyStreet}
              onChange={(e) => handleChange("propertyStreet", e.target.value)}
              className={`input-field ${
                errors.propertyStreet ? "border-red-500 focus:ring-red-500" : ""
              }`}
              placeholder="123 Example Street"
            />
            {errors.propertyStreet && (
              <p className="error-text">{errors.propertyStreet}</p>
            )}
          </div>

          <div className="md:col-span-4">
            <label className="field-label">Postcode</label>
            <input
              type="text"
              value={formData.propertyPostcode}
              onChange={(e) =>
                handleChange(
                  "propertyPostcode",
                  e.target.value.replace(/[^0-9]/g, ""),
                )
              }
              className={`input-field ${
                errors.propertyPostcode
                  ? "border-red-500 focus:ring-red-500"
                  : ""
              }`}
              placeholder="7315"
              maxLength={4}
            />
            {errors.propertyPostcode && (
              <p className="error-text">{errors.propertyPostcode}</p>
            )}
          </div>

          <div className="md:col-span-12">
            <label htmlFor="property-suburb" className="field-label">
              Suburb
            </label>
            <SuburbAutocomplete
              value={formData.propertySuburb}
              onChange={(value) => handleChange("propertySuburb", value)}
              onSelect={(suburb) => {
                updateFormData({
                  propertySuburb: suburb.suburb,
                  propertyPostcode: suburb.postcode,
                  propertyState: suburb.state,
                });
                const newErrors = { ...errors };
                delete newErrors.propertySuburb;
                delete newErrors.propertyPostcode;
                setErrors(newErrors);
              }}
              error={!!errors.propertySuburb}
            />
            {errors.propertySuburb && (
              <p className="error-text">{errors.propertySuburb}</p>
            )}
            {formData.propertySuburb &&
              !isValidSuburb(formData.propertySuburb) && (
                <p className="text-xs text-amber-600 mt-1">
                  Warning: Suburb not found in Tasmania database
                </p>
              )}
          </div>
        </div>
      </div>

      {/* Legal Description */}
      <div className="section-card">
        <h2 className="section-title">
          <FileText className="text-harcourts-blue" />
          Legal Description
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-4">
            <label className="field-label">CT Volume</label>
            <input
              type="text"
              value={formData.ctVolume}
              onChange={(e) =>
                handleChange("ctVolume", e.target.value.replace(/[^0-9]/g, ""))
              }
              className={`input-field ${
                errors.ctVolume ? "border-red-500 focus:ring-red-500" : ""
              }`}
            />
            {errors.ctVolume && <p className="error-text">{errors.ctVolume}</p>}
          </div>
          <div className="md:col-span-4">
            <label className="field-label">Folio No</label>
            <input
              type="text"
              value={formData.folioNo}
              onChange={(e) =>
                handleChange("folioNo", e.target.value.replace(/[^0-9]/g, ""))
              }
              className={`input-field ${
                errors.folioNo ? "border-red-500 focus:ring-red-500" : ""
              }`}
            />
            {errors.folioNo && <p className="error-text">{errors.folioNo}</p>}
          </div>
          <div className="md:col-span-4">
            <label className="field-label">PID</label>
            <input
              type="text"
              value={formData.pid}
              onChange={(e) =>
                handleChange("pid", e.target.value.replace(/[^0-9]/g, ""))
              }
              className={`input-field ${
                errors.pid ? "border-red-500 focus:ring-red-500" : ""
              }`}
            />
            {errors.pid && <p className="error-text">{errors.pid}</p>}
          </div>
          <div className="md:col-span-12">
            <label className="field-label">Listing No (Optional)</label>
            <input
              type="text"
              value={formData.listingNo || ""}
              onChange={(e) => handleChange("listingNo", e.target.value)}
              className="input-field"
              placeholder="e.g. L123456"
            />
          </div>

          {/* Annexure A Toggle */}
          <div className="md:col-span-12">
            <label htmlFor="annexureA" className="field-label">
              Include Annexure A?
            </label>
            <select
              id="annexureA"
              value={formData.annexureA ? "yes" : "no"}
              onChange={(e) =>
                updateFormData({ annexureA: e.target.value === "yes" })
              }
              className="select-field"
            >
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
          </div>
        </div>
      </div>

      {/* Financials */}
      <div className="section-card">
        <h2 className="section-title">
          <DollarSign className="text-harcourts-blue" />
          Pricing & Commission
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-1">
            <label htmlFor="listingPrice" className="field-label">
              Listing Price
            </label>
            <input
              type="text"
              id="listingPrice"
              value={formData.listingPrice}
              onChange={(e) => handleChange("listingPrice", e.target.value)}
              className={`input-field ${
                errors.listingPrice ? "border-red-500 focus:ring-red-500" : ""
              }`}
              placeholder="e.g. $550,000 or Offers over $500,000"
            />
            {errors.listingPrice && (
              <p className="error-text">{errors.listingPrice}</p>
            )}
          </div>
        </div>

        {/* Commission Type Toggle */}
        <div className="mt-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <label className="field-label mb-0">Commission Type:</label>
            <div className="flex rounded-lg overflow-hidden border border-gray-300">
              <button
                type="button"
                onClick={() => {
                  handleChange("commissionType", "percentage");
                  if (!formData.commissionValue)
                    handleChange("commissionValue", "2.5");
                }}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  formData.commissionType === "percentage"
                    ? "bg-harcourts-blue text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                Percentage
              </button>
              <button
                type="button"
                onClick={() => {
                  handleChange("commissionType", "fixed");
                  handleChange("commissionValue", "");
                }}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  formData.commissionType === "fixed"
                    ? "bg-harcourts-blue text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                Fixed
              </button>
              <button
                type="button"
                onClick={() => {
                  handleChange("commissionType", "reit");
                  handleChange(
                    "commissionValue",
                    "REIT Gross Scale of Commission",
                  );
                }}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  formData.commissionType === "reit"
                    ? "bg-harcourts-blue text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                REIT Scale
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="field-label">
                {formData.commissionType === "percentage"
                  ? "Commission % inc GST"
                  : formData.commissionType === "reit"
                    ? "Commission Scale"
                    : "Commission Amount"}
              </label>
              <div className="relative">
                {formData.commissionType !== "reit" && (
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {formData.commissionType === "percentage" ? "%" : "$"}
                  </span>
                )}
                <input
                  type="text"
                  value={formData.commissionValue}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9.]/g, "");
                    // Prevent multiple decimal points
                    if ((val.match(/\./g) || []).length <= 1) {
                      handleChange("commissionValue", val);
                    }
                  }}
                  disabled={formData.commissionType === "reit"}
                  className={`input-field ${
                    formData.commissionType !== "reit" ? "pl-8" : ""
                  } ${
                    formData.commissionType === "reit"
                      ? "bg-gray-100 cursor-not-allowed"
                      : ""
                  } ${
                    errors.commissionValue
                      ? "border-red-500 focus:ring-red-500"
                      : ""
                  }`}
                  placeholder={
                    formData.commissionType === "percentage" ? "2.5" : "15,000"
                  }
                />
              </div>
              {errors.commissionValue && (
                <p className="error-text">{errors.commissionValue}</p>
              )}
            </div>

            <div>
              <label className="field-label">GST</label>
              <div className="flex items-center gap-4 py-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={formData.gstTaxable}
                    onChange={() => updateFormData({ gstTaxable: true })}
                    className="w-4 h-4 text-harcourts-blue focus:ring-harcourts-blue"
                  />
                  <span className="text-sm">Taxable Supply</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={!formData.gstTaxable}
                    onChange={() => updateFormData({ gstTaxable: false })}
                    className="w-4 h-4 text-harcourts-blue focus:ring-harcourts-blue"
                  />
                  <span className="text-sm">Not Taxable</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sole Agency Period */}
      <div className="section-card">
        <h2 className="section-title">
          <Calendar className="text-harcourts-blue" />
          Sole Agency Period
        </h2>

        {/* Period Type Selection */}
        <div className="mb-6">
          <label className="field-label block mb-3">Period Type</label>
          <div className="flex rounded-lg overflow-hidden border border-gray-300 max-w-xs">
            <button
              type="button"
              onClick={() => {
                updateFormData({
                  agencyPeriodType: "standard",
                  soleAgencyPeriod: "",
                });
                setPeriodError("");
              }}
              className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                formData.agencyPeriodType === "standard"
                  ? "bg-harcourts-blue text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Standard
            </button>
            <button
              type="button"
              onClick={() => {
                updateFormData({
                  agencyPeriodType: "development",
                  soleAgencyPeriod: "365",
                });
                setPeriodError("");
              }}
              className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                formData.agencyPeriodType === "development"
                  ? "bg-harcourts-blue text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Development
            </button>
          </div>
        </div>

        {/* Days Input */}
        <div className="max-w-xs">
          <label htmlFor="agency-period" className="field-label">
            Number of Days
          </label>
          <input
            type="text"
            id="agency-period"
            value={formData.soleAgencyPeriod}
            onChange={(e) => {
              const val = e.target.value.replace(/[^0-9]/g, "");
              handlePeriodChange(val);
            }}
            disabled={formData.agencyPeriodType === "development"}
            className={`input-field ${
              (errors.soleAgencyPeriod || periodError) &&
              formData.agencyPeriodType !== "development"
                ? "border-red-500 focus:ring-red-500"
                : ""
            } ${
              formData.agencyPeriodType === "development" ? "bg-gray-100" : ""
            }`}
            placeholder="90"
          />
          <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
            <Info className="w-3 h-3" />
            {formData.agencyPeriodType === "development"
              ? "Fixed at 365 days for Development"
              : "Maximum 120 days"}
          </p>
          {(errors.soleAgencyPeriod || periodError) &&
            formData.agencyPeriodType !== "development" && (
              <p className="error-text">
                {errors.soleAgencyPeriod || periodError}
              </p>
            )}
        </div>
      </div>
    </div>
  );
}
