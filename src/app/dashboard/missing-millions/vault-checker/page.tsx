"use client";

/**
 * Missing Millions — VaultRE Cross-Reference Checker
 * Checks property records against VaultRE to update GC fields.
 */

import { useState } from "react";
import { getDatabase, updateDatabaseRecord } from "@/lib/missing-millions/storage";
import type { PropertyRecord } from "@/lib/missing-millions/types";
import { CheckSquare, Loader2, RefreshCw } from "lucide-react";

interface CheckResult {
  property: PropertyRecord;
  propertyFound: boolean;
  appraisalStatus: string;
  contactFound: boolean;
  matchScore: number;
  vaultreStatus: string | null;
  vaultreId: number | null;
  checked: boolean;
}

export default function VaultCheckerPage() {
  const [results, setResults] = useState<CheckResult[]>([]);
  const [checking, setChecking] = useState(false);
  const [progress, setProgress] = useState(0);

  const startCheck = async () => {
    const properties = getDatabase().filter(
      (p) =>
        p.gcPropertyInVaultRE === "TBA" || p.gcContactInVaultRE === "TBA",
    );

    if (properties.length === 0) {
      setResults([]);
      return;
    }

    setChecking(true);
    setProgress(0);
    const newResults: CheckResult[] = [];

    for (let i = 0; i < properties.length; i++) {
      const prop = properties[i];
      try {
        const res = await fetch("/api/missing-millions/vaultre/lookup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            address: prop.address,
            suburb: prop.suburb,
            vendorName: prop.vendorName,
          }),
        });

        const data = await res.json();
        const result: CheckResult = {
          property: prop,
          propertyFound: data.propertyFound,
          appraisalStatus: data.appraisalStatus,
          contactFound: data.contactFound,
          matchScore: data.matchScore,
          vaultreStatus: data.vaultreStatus,
          vaultreId: data.vaultreId,
          checked: true,
        };
        newResults.push(result);

        // Auto-update localStorage record
        if (result.propertyFound) {
          updateDatabaseRecord(prop.id, {
            gcPropertyInVaultRE: "Yes",
            gcAppraised: result.appraisalStatus as PropertyRecord["gcAppraised"],
          });
        }
        if (result.contactFound) {
          updateDatabaseRecord(prop.id, {
            gcContactInVaultRE: "Yes",
          });
        }
      } catch {
        newResults.push({
          property: prop,
          propertyFound: false,
          appraisalStatus: "No",
          contactFound: false,
          matchScore: 0,
          vaultreStatus: null,
          vaultreId: null,
          checked: false,
        });
      }

      setProgress(i + 1);
      setResults([...newResults]);

      // Rate limit — 200ms between requests
      await new Promise((r) => setTimeout(r, 200));
    }

    setChecking(false);
  };

  const pendingCount = getDatabase().filter(
    (p) =>
      p.gcPropertyInVaultRE === "TBA" || p.gcContactInVaultRE === "TBA",
  ).length;

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-slate-900">
            VaultRE Cross-Reference Checker
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Check {pendingCount} properties with TBA status against VaultRE
            database.
          </p>
        </div>
        <button
          type="button"
          onClick={startCheck}
          disabled={checking || pendingCount === 0}
          className="bg-[#00ADEF] text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-[#0097D1] transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
        >
          {checking ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Checking... ({progress}/{pendingCount})
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              Start Check
            </>
          )}
        </button>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-4 py-3 text-left font-semibold text-slate-500">
                    Address
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-500">
                    Match
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-500">
                    Score
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-500">
                    VaultRE Status
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-500">
                    Appraisal
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {results.map((r) => (
                  <tr
                    key={r.property.id}
                    className="hover:bg-sky-50/50 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-slate-900 max-w-[250px] truncate">
                      {r.property.address}, {r.property.suburb}
                    </td>
                    <td className="px-4 py-3">
                      {r.propertyFound ? (
                        <CheckSquare className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <span className="text-xs text-slate-400">
                          Not found
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-bold ${r.matchScore >= 70 ? "text-emerald-600" : r.matchScore >= 40 ? "text-amber-600" : "text-red-600"}`}
                      >
                        {r.matchScore}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {r.vaultreStatus || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          r.appraisalStatus.includes("Listed")
                            ? "bg-emerald-50 text-emerald-700"
                            : r.appraisalStatus.includes("Not Listed")
                              ? "bg-amber-50 text-amber-700"
                              : "bg-slate-50 text-slate-500"
                        }`}
                      >
                        {r.appraisalStatus}
                      </span>
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
