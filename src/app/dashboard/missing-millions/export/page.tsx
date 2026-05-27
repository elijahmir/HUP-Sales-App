"use client";

/**
 * Missing Millions — CSV Export
 * Download property records in SharePoint-compatible format.
 */

import { useState } from "react";
import { getDatabase } from "@/lib/missing-millions/storage";
import {
  exportToSharePointCSV,
  downloadCSV,
} from "@/lib/missing-millions/csv";
import type { PropertyRecord } from "@/lib/missing-millions/types";
import { Download, Filter } from "lucide-react";

export default function ExportPage() {
  const [properties] = useState<PropertyRecord[]>(() => getDatabase());
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered =
    statusFilter === "all"
      ? properties
      : properties.filter((p) => p.status === statusFilter);

  const handleExport = () => {
    const csvContent = exportToSharePointCSV(filtered);
    const dateStr = new Date().toISOString().split("T")[0];
    downloadCSV(
      csvContent,
      `missing-millions-export-${dateStr}.csv`,
    );
  };

  const statuses = [
    ...new Set(properties.map((p) => p.status)),
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h3 className="font-semibold text-slate-900 mb-2">
          Export Property Records
        </h3>
        <p className="text-sm text-slate-500 mb-6">
          Download a SharePoint-compatible CSV of your tracked
          properties.
        </p>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white"
            >
              <option value="all">All Status</option>
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="text-sm text-slate-500">
            {filtered.length} records
          </div>

          <button
            type="button"
            onClick={handleExport}
            disabled={filtered.length === 0}
            className="bg-[#00ADEF] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#0097D1] transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2 ml-auto"
          >
            <Download className="w-4 h-4" />
            Download CSV ({filtered.length})
          </button>
        </div>
      </div>

      {/* Preview */}
      {filtered.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase">
            Preview (first 10 rows)
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-3 py-2 text-left text-slate-500">
                    Status
                  </th>
                  <th className="px-3 py-2 text-left text-slate-500">
                    Address
                  </th>
                  <th className="px-3 py-2 text-left text-slate-500">
                    Suburb
                  </th>
                  <th className="px-3 py-2 text-left text-slate-500">
                    Vendor
                  </th>
                  <th className="px-3 py-2 text-left text-slate-500">
                    Agency
                  </th>
                  <th className="px-3 py-2 text-left text-slate-500">
                    Price
                  </th>
                  <th className="px-3 py-2 text-left text-slate-500">
                    GC Property
                  </th>
                  <th className="px-3 py-2 text-left text-slate-500">
                    GC Contact
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.slice(0, 10).map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-3 py-2 text-slate-600">
                      {p.status}
                    </td>
                    <td className="px-3 py-2 text-slate-900 max-w-[150px] truncate">
                      {p.address}
                    </td>
                    <td className="px-3 py-2 text-slate-600">
                      {p.suburb}
                    </td>
                    <td className="px-3 py-2 text-slate-600 max-w-[100px] truncate">
                      {p.vendorName || "—"}
                    </td>
                    <td className="px-3 py-2 text-slate-500 max-w-[100px] truncate">
                      {p.agency}
                    </td>
                    <td className="px-3 py-2 text-slate-600">
                      {p.listingPrice || "—"}
                    </td>
                    <td className="px-3 py-2 text-slate-600">
                      {p.gcPropertyInVaultRE}
                    </td>
                    <td className="px-3 py-2 text-slate-600">
                      {p.gcContactInVaultRE}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
