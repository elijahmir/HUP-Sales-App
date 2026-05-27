"use client";

/**
 * Missing Millions — Sold Updates Reconciliation
 * Upload REA Sold CSV and match against existing property records.
 */

import { useState } from "react";
import { getDatabase, saveDatabase } from "@/lib/missing-millions/storage";
import { parseREABuyCSV } from "@/lib/missing-millions/csv";
import { runMatching } from "@/lib/missing-millions/matching";
import { getUserPrefs } from "@/lib/missing-millions/storage";
import type { MatchingResults } from "@/lib/missing-millions/matching";
import CSVUploader from "@/components/missing-millions/CSVUploader";
import { ArrowRightLeft, CheckCircle2, AlertTriangle, Plus } from "lucide-react";

export default function SoldUpdatesPage() {
  const [results, setResults] = useState<MatchingResults | null>(null);
  const [applied, setApplied] = useState(false);

  const handleCSVParsed = (raw: string) => {
    const reaRecords = parseREABuyCSV(raw);
    const existingRecords = getDatabase();
    const prefs = getUserPrefs();

    if (existingRecords.length === 0 || reaRecords.length === 0) {
      setResults({ matches: [], unmatchedREA: reaRecords, unmatchedSP: existingRecords });
      return;
    }

    const matchResults = runMatching(existingRecords, reaRecords, prefs.matchingThreshold);
    setResults(matchResults);
    setApplied(false);
  };

  const applyUpdates = () => {
    if (!results) return;
    const db = getDatabase();

    // Apply matched updates
    for (const match of results.matches) {
      const idx = db.findIndex((r) => r.id === match.sharepointRecord.id);
      if (idx >= 0) {
        for (const diff of match.fieldDiffs) {
          if (diff.changed && diff.reaValue) {
            (db[idx] as unknown as Record<string, unknown>)[diff.field] = diff.reaValue;
          }
        }
      }
    }

    // Add new unmatched REA records
    const updated = [...db, ...results.unmatchedREA];
    saveDatabase(updated);
    setApplied(true);
  };

  return (
    <div className="space-y-6">
      <CSVUploader
        onParsed={handleCSVParsed}
        label="Upload REA Sold CSV to match against existing records"
      />

      {results && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-semibold text-emerald-800">Matched</span>
              </div>
              <span className="text-2xl font-bold text-emerald-900">{results.matches.length}</span>
              <p className="text-xs text-emerald-700 mt-1">Records with updates</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
              <div className="flex items-center gap-2 mb-1">
                <Plus className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-semibold text-blue-800">New Records</span>
              </div>
              <span className="text-2xl font-bold text-blue-900">{results.unmatchedREA.length}</span>
              <p className="text-xs text-blue-700 mt-1">Not yet in database</p>
            </div>
            <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-semibold text-amber-800">Unmatched</span>
              </div>
              <span className="text-2xl font-bold text-amber-900">{results.unmatchedSP.length}</span>
              <p className="text-xs text-amber-700 mt-1">Existing records with no update</p>
            </div>
          </div>

          {/* Matched updates table */}
          {results.matches.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                  <ArrowRightLeft className="w-4 h-4 text-slate-400" />
                  Matched Updates ({results.matches.length})
                </h3>
                {!applied && (
                  <button
                    type="button"
                    onClick={applyUpdates}
                    className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
                  >
                    Apply All Updates
                  </button>
                )}
                {applied && (
                  <span className="text-sm text-emerald-600 font-medium">✓ Applied</span>
                )}
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500">Address</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500">Score</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500">Changes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {results.matches.slice(0, 50).map((m, i) => (
                      <tr key={i} className="hover:bg-sky-50/50">
                        <td className="px-4 py-2 font-medium text-slate-900 max-w-[250px] truncate">
                          {m.sharepointRecord.address}
                        </td>
                        <td className="px-4 py-2">
                          <span className={`text-xs font-bold ${m.score >= 0.9 ? "text-emerald-600" : m.score >= 0.7 ? "text-amber-600" : "text-red-600"}`}>
                            {Math.round(m.score * 100)}%
                          </span>
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex gap-2 flex-wrap">
                            {m.fieldDiffs.filter((d) => d.changed).map((d) => (
                              <span key={d.field} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-sky-50 text-sky-700">
                                {d.label}: {d.sharepointValue || "—"} → {d.reaValue}
                              </span>
                            ))}
                            {m.fieldDiffs.filter((d) => d.changed).length === 0 && (
                              <span className="text-xs text-slate-400 italic">No field changes</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
