"use client";

import { useState } from "react";
import { Calendar, Info, AlertTriangle } from "lucide-react";

interface RenewalDurationFormProps {
  soleAgencyPeriod: string;
  agencyPeriodType: "standard" | "development";
  onUpdate: (updates: {
    soleAgencyPeriod?: string;
    agencyPeriodType?: "standard" | "development";
  }) => void;
  errors: Record<string, string | undefined>;
}

const DURATION_PRESETS = [
  { label: "60 days", value: "60" },
  { label: "90 days", value: "90" },
  { label: "120 days", value: "120" },
  { label: "180 days", value: "180" },
  { label: "Custom", value: "custom" },
];

export function RenewalDurationForm({
  soleAgencyPeriod,
  agencyPeriodType,
  onUpdate,
  errors,
}: RenewalDurationFormProps) {
  const [isCustom, setIsCustom] = useState(
    !DURATION_PRESETS.some(
      (p) => p.value === soleAgencyPeriod && p.value !== "custom",
    ),
  );

  const handlePresetClick = (value: string) => {
    if (value === "custom") {
      setIsCustom(true);
      onUpdate({ soleAgencyPeriod: "" });
    } else {
      setIsCustom(false);
      onUpdate({ soleAgencyPeriod: value });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-harcourts-navy">
          Set Renewal Duration
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Specify the new agreement period for this renewal. This is the only
          editable field.
        </p>
      </div>

      {/* Agency Period Type */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h3 className="text-sm font-semibold text-harcourts-navy flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Agency Period Type
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onUpdate({ agencyPeriodType: "standard" })}
            className={`
              p-4 rounded-xl border-2 transition-all text-left
              ${
                agencyPeriodType === "standard"
                  ? "border-harcourts-blue bg-blue-50/50 ring-2 ring-blue-100"
                  : "border-gray-200 hover:border-gray-300"
              }
            `}
          >
            <p className="font-semibold text-harcourts-navy">Standard</p>
            <p className="text-xs text-gray-500 mt-1">
              Standard sole agency agreement
            </p>
          </button>
          <button
            type="button"
            onClick={() => onUpdate({ agencyPeriodType: "development" })}
            className={`
              p-4 rounded-xl border-2 transition-all text-left
              ${
                agencyPeriodType === "development"
                  ? "border-harcourts-blue bg-blue-50/50 ring-2 ring-blue-100"
                  : "border-gray-200 hover:border-gray-300"
              }
            `}
          >
            <p className="font-semibold text-harcourts-navy">Development</p>
            <p className="text-xs text-gray-500 mt-1">
              Property development agreement
            </p>
          </button>
        </div>
      </div>

      {/* Duration */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h3 className="text-sm font-semibold text-harcourts-navy flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Sole Agency Period (Days)
        </h3>

        {/* Quick presets */}
        <div className="flex flex-wrap gap-2">
          {DURATION_PRESETS.map((preset) => (
            <button
              key={preset.value}
              type="button"
              onClick={() => handlePresetClick(preset.value)}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${
                  (!isCustom && soleAgencyPeriod === preset.value) ||
                  (isCustom && preset.value === "custom")
                    ? "bg-harcourts-blue text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }
              `}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Custom input */}
        {isCustom && (
          <div className="space-y-2">
            <label
              htmlFor="custom-duration"
              className="text-sm font-medium text-gray-700"
            >
              Enter custom duration (days)
            </label>
            <input
              id="custom-duration"
              type="number"
              min={1}
              max={365}
              placeholder="e.g. 45"
              value={soleAgencyPeriod}
              onChange={(e) =>
                onUpdate({ soleAgencyPeriod: e.target.value })
              }
              className={`
                w-full px-4 py-2.5 rounded-xl border text-sm transition-all
                ${
                  errors.soleAgencyPeriod
                    ? "border-red-300 ring-2 ring-red-100"
                    : "border-gray-200 focus:border-harcourts-blue focus:ring-2 focus:ring-blue-100"
                }
              `}
            />
          </div>
        )}

        {/* Error */}
        {errors.soleAgencyPeriod && (
          <div className="flex items-center gap-2 text-red-600 text-sm">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span className="error-text">{errors.soleAgencyPeriod}</span>
          </div>
        )}

        {/* Info */}
        <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-100 rounded-lg">
          <Info className="w-4 h-4 text-harcourts-blue mt-0.5 flex-shrink-0" />
          <p className="text-xs text-gray-600">
            The renewal period starts from the date the agreement is signed by
            all parties via DocuSign. Common periods are 60 or 90 days.
          </p>
        </div>
      </div>
    </div>
  );
}
