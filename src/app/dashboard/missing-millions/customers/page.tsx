"use client";

/**
 * Missing Millions — Customers (Property Records)
 * Table of tracked properties from CSV imports + localStorage.
 */

import { useState, useCallback } from "react";
import {
  getDatabase,
  addToDatabase,
  addImportRecord,
  clearDatabase,
} from "@/lib/missing-millions/storage";
import { parseREABuyCSV } from "@/lib/missing-millions/csv";
import type { PropertyRecord, ImportRecord } from "@/lib/missing-millions/types";
import CSVUploader from "@/components/missing-millions/CSVUploader";
import { Search, Trash2, ExternalLink } from "lucide-react";

export default function CustomersPage() {
  const [properties, setProperties] = useState<PropertyRecord[]>(() => getDatabase());
  const [filter, setFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showUploader, setShowUploader] = useState(false);
  const [importCount, setImportCount] = useState<number | null>(null);

  const handleCSVParsed = useCallback(
    (raw: string, filename: string) => {
      const records = parseREABuyCSV(raw);
      if (records.length === 0) return;

      const updated = addToDatabase(records);
      setProperties(updated);
      setImportCount(records.length);
      setShowUploader(false);

      const importRec: ImportRecord = {
        date: new Date().toISOString(),
        source: filename.toLowerCase().includes("sold")
          ? "REA Sold"
          : "REA Buy",
        count: records.length,
      };
      addImportRecord(importRec);

      setTimeout(() => setImportCount(null), 5000);
    },
    [],
  );

  const handleClear = () => {
    if (
      !window.confirm(
        "Clear all property records? This cannot be undone.",
      )
    )
      return;
    clearDatabase();
    setProperties([]);
  };

  const filtered = properties.filter((p) => {
    const term = filter.toLowerCase();
    const matchesSearch =
      !filter ||
      p.address.toLowerCase().includes(term) ||
      p.suburb.toLowerCase().includes(term) ||
      p.vendorName.toLowerCase().includes(term) ||
      p.agent.toLowerCase().includes(term) ||
      p.agency.toLowerCase().includes(term);

    const matchesStatus =
      statusFilter === "all" || p.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const statusCounts = properties.reduce(
    (acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <div className="space-y-6">
      {/* Import Success Banner */}
      {importCount !== null && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-sm">
            ✓
          </div>
          <p className="text-sm text-emerald-800">
            Successfully imported{" "}
            <strong>{importCount} properties</strong> from CSV.
          </p>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 w-full sm:w-auto">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search address, vendor, agent..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#00ADEF]/20 focus:border-[#00ADEF]"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#00ADEF]/20"
          >
            <option value="all">All Status ({properties.length})</option>
            {Object.entries(statusCounts).map(([status, count]) => (
              <option key={status} value={status}>
                {status} ({count})
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowUploader(!showUploader)}
            className="bg-[#00ADEF] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#0097D1] transition-colors shadow-sm"
          >
            + Import CSV
          </button>
          {properties.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              className="text-red-500 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors"
              title="Clear all records"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* CSV Uploader */}
      {showUploader && (
        <CSVUploader
          onParsed={handleCSVParsed}
          label="Upload REA Buy / REA Sold / SharePoint CSV"
        />
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-sky-50 text-sky-500 flex items-center justify-center mx-auto mb-3">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-medium text-slate-900 mb-1">
              {properties.length === 0
                ? "No properties yet"
                : "No matching results"}
            </h3>
            <p className="text-sm text-slate-500">
              {properties.length === 0
                ? "Import a CSV to start tracking properties."
                : "Try adjusting your search or status filter."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-4 py-3 text-left font-semibold text-slate-500">
                    Address
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-500">
                    Suburb
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-500">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-500">
                    Vendor
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-500">
                    Agency
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-500">
                    Agent
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-500">
                    Price
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-500">
                    Link
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.slice(0, 100).map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-sky-50/50 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-slate-900 max-w-[200px] truncate">
                      {p.address || "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {p.suburb || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          p.status === "Sold"
                            ? "bg-emerald-50 text-emerald-700"
                            : p.status === "Under Offer"
                              ? "bg-amber-50 text-amber-700"
                              : p.status === "Withdrawn"
                                ? "bg-red-50 text-red-700"
                                : "bg-blue-50 text-blue-700"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 max-w-[150px] truncate">
                      {p.vendorName || (
                        <span className="text-amber-500 italic">
                          Missing
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs max-w-[120px] truncate">
                      {p.agency || "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs max-w-[120px] truncate">
                      {p.agent || "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                      {p.listingPrice || p.salePrice || "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {p.url && (
                        <a
                          href={p.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#00ADEF] hover:text-[#0097D1]"
                        >
                          <ExternalLink className="w-4 h-4 inline" />
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length > 100 && (
              <div className="px-4 py-3 text-center text-xs text-slate-400 border-t border-slate-100">
                Showing first 100 of {filtered.length} results
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
