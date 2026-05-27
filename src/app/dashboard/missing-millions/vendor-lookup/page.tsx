"use client";

/**
 * Missing Millions — Vendor Lookup
 * Search VaultRE contacts by name to find existing vendor records.
 */

import { useState } from "react";
import { Search, Loader2 } from "lucide-react";

interface SearchResult {
  id: number;
  displayAddress: string;
  suburb: string;
  saleStatus: string | null;
  portalStatus: string | null;
}

export default function VendorLookupPage() {
  const [term, setTerm] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (term.trim().length < 2) return;
    setSearching(true);
    setSearched(false);

    try {
      const res = await fetch(
        `/api/missing-millions/vaultre/search?term=${encodeURIComponent(term.trim())}&pagesize=20`,
      );
      const data = await res.json();
      setResults(data.items || []);
    } catch {
      setResults([]);
    }

    setSearching(false);
    setSearched(true);
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h3 className="font-semibold text-slate-900 mb-4">
          Search VaultRE Properties
        </h3>
        <div className="flex gap-3">
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search by address, suburb, vendor name..."
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#00ADEF]/20 focus:border-[#00ADEF]"
            />
          </div>
          <button
            type="button"
            onClick={handleSearch}
            disabled={searching || term.trim().length < 2}
            className="bg-[#00ADEF] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#0097D1] transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
          >
            {searching ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            Search
          </button>
        </div>
      </div>

      {/* Results */}
      {searched && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {results.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-sm text-slate-500">
                No properties found for &ldquo;{term}&rdquo;
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-4 py-3 text-left font-semibold text-slate-500">
                      ID
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-500">
                      Address
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-500">
                      Suburb
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-500">
                      Sale Status
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-500">
                      Portal Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {results.map((r) => (
                    <tr
                      key={r.id}
                      className="hover:bg-sky-50/50 transition-colors"
                    >
                      <td className="px-4 py-3 text-slate-400 text-xs font-mono">
                        {r.id}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {r.displayAddress || "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {r.suburb || "—"}
                      </td>
                      <td className="px-4 py-3">
                        {r.saleStatus ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-sky-50 text-sky-700">
                            {r.saleStatus}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">
                            —
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-600 text-xs">
                        {r.portalStatus || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
