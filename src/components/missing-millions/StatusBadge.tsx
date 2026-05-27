"use client";

/**
 * StatusBadge — Pipeline stage badge for Missing Millions CRM.
 * Color-coded based on stage name.
 */

const STAGE_COLORS: Record<string, string> = {
  "Not Ready": "bg-gray-100 text-gray-600 border-gray-200",
  Nurturing: "bg-blue-50 text-blue-700 border-blue-200",
  Considering: "bg-amber-50 text-amber-700 border-amber-200",
  Appraisal: "bg-purple-50 text-purple-700 border-purple-200",
  Listing: "bg-cyan-50 text-cyan-700 border-cyan-200",
  Sold: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Lost: "bg-red-50 text-red-700 border-red-200",
};

const DEFAULT_STYLE = "bg-gray-50 text-gray-500 border-gray-200";

export default function StatusBadge({ value }: { value: string }) {
  const style = STAGE_COLORS[value] || DEFAULT_STYLE;
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${style}`}
    >
      {value}
    </span>
  );
}
