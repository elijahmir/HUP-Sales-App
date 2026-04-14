"use client";

import { FileText, ToggleLeft, ToggleRight, Info, Clock } from "lucide-react";

interface AnnexureItem {
  item: string;
  description: string;
}

interface RenewalAnnexureSectionProps {
  items: AnnexureItem[];
  includeAnnexure: boolean;
  onToggle: (include: boolean) => void;
  sourceDate?: string;
}

export function RenewalAnnexureSection({
  items,
  includeAnnexure,
  onToggle,
  sourceDate,
}: RenewalAnnexureSectionProps) {
  if (!items || items.length === 0) return null;

  // Only show items that have actual content
  const validItems = items.filter((item) => item.item && item.item.trim());

  if (validItems.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header with Toggle */}
      <div className="p-5 pb-0">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-sm font-semibold text-harcourts-navy flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Annexure A ({validItems.length} item{validItems.length !== 1 ? "s" : ""})
          </h3>

          {/* Toggle Switch */}
          <button
            type="button"
            onClick={() => onToggle(!includeAnnexure)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              includeAnnexure
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                : "bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100"
            }`}
          >
            {includeAnnexure ? (
              <>
                <ToggleRight className="w-5 h-5" />
                <span>Included</span>
              </>
            ) : (
              <>
                <ToggleLeft className="w-5 h-5" />
                <span>Excluded</span>
              </>
            )}
          </button>
        </div>

        {/* Source Info */}
        <div className="flex items-center gap-2 mt-3 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
          <Info className="w-4 h-4 text-blue-500 flex-shrink-0" />
          <p className="text-xs text-blue-700">
            <strong>Source:</strong> These items were carried over from the most
            recent SAA submission for this property.
            {sourceDate && (
              <span className="inline-flex items-center gap-1 ml-1">
                <Clock className="w-3 h-3" />
                {new Date(sourceDate).toLocaleDateString("en-AU", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Items List */}
      <div
        className={`p-5 transition-opacity duration-200 ${
          includeAnnexure ? "opacity-100" : "opacity-40"
        }`}
      >
        <div className="space-y-3">
          {validItems.map((annexItem, idx) => (
            <div
              key={idx}
              className="p-4 bg-gray-50 rounded-lg border border-gray-100"
            >
              <div className="flex items-start gap-3">
                {/* Number Badge */}
                <div className="w-6 h-6 rounded-full bg-harcourts-blue text-white flex items-center justify-center text-xs font-bold shadow-sm flex-shrink-0 mt-0.5">
                  {idx + 1}
                </div>

                <div className="flex-1 min-w-0">
                  {/* Item Name */}
                  <h4 className="text-sm font-semibold text-harcourts-navy">
                    {annexItem.item}
                  </h4>

                  {/* Description */}
                  {annexItem.description && (
                    <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap break-words">
                      {annexItem.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Exclusion Notice */}
        {!includeAnnexure && (
          <div className="mt-4 flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
            <Info className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <p className="text-xs text-amber-700">
              Annexure A items will <strong>not</strong> be included in this
              renewal agreement.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
