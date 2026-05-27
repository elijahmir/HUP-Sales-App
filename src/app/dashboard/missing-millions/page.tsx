"use client";

/**
 * Missing Millions — Executive Dashboard
 * KPIs, top agents, top suburbs, and CRM pipeline funnel.
 */

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getDatabase } from "@/lib/missing-millions/storage";
import type {
  PropertyRecord,
  Contact,
  PipelineStage,
} from "@/lib/missing-millions/types";
import Link from "next/link";

export default function MissingMillionsDashboard() {
  const [properties, setProperties] = useState<PropertyRecord[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadData() {
      // 1. Local Properties
      const localProps = getDatabase();
      setProperties(localProps);

      // 2. Supabase CRM
      const { data: sData } = await supabase
        .from("sales_pipeline_stages")
        .select("*")
        .order("order_num");
      if (sData) setStages(sData);

      const { data: cData } = await supabase
        .from("sales_contacts")
        .select("*");
      if (cData) setContacts(cData);

      setLoading(false);
    }
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00ADEF]" />
      </div>
    );
  }

  // -- Aggregations --
  const missingVendorsCount = properties.filter(
    (p) => !p.vendorName || p.vendorName === "TBA",
  ).length;
  const soldCount = properties.filter((p) => p.status === "Sold").length;

  // Top Agents
  const agentTally: Record<string, number> = {};
  properties.forEach((p) => {
    if (!p.agent || p.agent.toLowerCase() === "tba") return;
    agentTally[p.agent] = (agentTally[p.agent] || 0) + 1;
  });
  const topAgents = Object.entries(agentTally)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const maxAgentCount = topAgents.length > 0 ? topAgents[0][1] : 1;

  // Top Suburbs
  const suburbTally: Record<string, number> = {};
  properties.forEach((p) => {
    if (!p.suburb) return;
    const sub =
      p.suburb.charAt(0).toUpperCase() + p.suburb.slice(1).toLowerCase();
    suburbTally[sub] = (suburbTally[sub] || 0) + 1;
  });
  const topSuburbs = Object.entries(suburbTally)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const maxSuburbCount = topSuburbs.length > 0 ? topSuburbs[0][1] : 1;

  // Pipeline Flow
  const pipelineTally: Record<string, number> = {};
  contacts.forEach((c) => {
    const stageId = c.pipeline_stage_id || "unassigned";
    pipelineTally[stageId] = (pipelineTally[stageId] || 0) + 1;
  });
  const maxPipelineCount = Math.max(...Object.values(pipelineTally), 1);

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">
            Total Properties
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">
              {properties.length}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Tracked
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">
            Active CRM Contacts
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">
              {contacts.length}
            </span>
            <Link
              href="/dashboard/missing-millions/contacts"
              className="text-xs text-[#00ADEF] hover:underline font-medium"
            >
              View CRM ↗
            </Link>
          </div>
        </div>

        <div className="bg-amber-50 p-5 rounded-xl border border-amber-200 shadow-sm">
          <div className="flex gap-2 items-center">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
            </span>
            <p className="text-sm font-medium text-amber-800 uppercase tracking-wider">
              Missing Vendors
            </p>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-amber-900">
              {missingVendorsCount}
            </span>
            <span className="text-xs text-amber-700/80 font-medium">
              Opportunities
            </span>
          </div>
        </div>

        <div className="bg-emerald-50 p-5 rounded-xl border border-emerald-200 shadow-sm">
          <p className="text-sm font-medium text-emerald-800 uppercase tracking-wider">
            Total Sold
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-emerald-900">
              {soldCount}
            </span>
            <span className="text-xs text-emerald-700/80 font-medium">
              Recorded
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Agents */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="font-bold text-slate-900 mb-6">Top Agents</h3>
          {topAgents.length === 0 ? (
            <p className="text-sm text-slate-500 italic text-center py-4">
              No agent data yet. Import a CSV to get started.
            </p>
          ) : (
            <div className="space-y-5">
              {topAgents.map(([name, count]) => (
                <div key={name}>
                  <div className="flex justify-between items-end mb-1.5">
                    <span className="text-sm font-semibold text-slate-800">
                      {name}
                    </span>
                    <span className="text-xs font-bold text-slate-500">
                      {count} listings
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-[#00ADEF] h-2.5 rounded-full transition-all duration-700 ease-out"
                      style={{
                        width: `${(count / maxAgentCount) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Suburbs */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="font-bold text-slate-900 mb-6">
            Market Footprint (Top Suburbs)
          </h3>
          {topSuburbs.length === 0 ? (
            <p className="text-sm text-slate-500 italic text-center py-4">
              No suburb data available.
            </p>
          ) : (
            <div className="space-y-5">
              {topSuburbs.map(([suburb, count]) => (
                <div key={suburb}>
                  <div className="flex justify-between items-end mb-1.5">
                    <span className="text-sm font-semibold text-slate-800">
                      {suburb}
                    </span>
                    <span className="text-xs font-bold text-slate-500">
                      {count} flags
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-sky-500 h-2.5 rounded-full transition-all duration-700 ease-out"
                      style={{
                        width: `${(count / maxSuburbCount) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pipeline Funnel */}
        <div className="col-span-1 lg:col-span-2 bg-slate-900 text-white rounded-xl shadow-sm border border-slate-700 p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-white uppercase tracking-wider text-sm">
              CRM Conversion Funnel
            </h3>
            <Link
              href="/dashboard/missing-millions/pipeline"
              className="text-xs text-sky-400 hover:text-sky-300 font-medium bg-white/5 py-1.5 px-3 rounded-lg border border-white/10 transition-colors"
            >
              Open Pipeline ↗
            </Link>
          </div>
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {stages.map((stage) => {
              const count = pipelineTally[stage.id] || 0;
              return (
                <div
                  key={stage.id}
                  className="flex-1 w-full flex flex-col items-center"
                >
                  <div className="relative w-full h-12 flex justify-center items-end opacity-90 mb-3 group hover:opacity-100 transition-opacity">
                    <div
                      className="w-full max-w-[40px] bg-sky-400 rounded-t-md transition-all duration-1000 ease-in-out relative group-hover:bg-sky-300 shadow-[0_0_15px_rgba(56,189,248,0.3)]"
                      style={{
                        height: `${count === 0 ? 4 : (count / maxPipelineCount) * 100}%`,
                      }}
                    >
                      <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-xs font-bold text-white bg-white/20 px-2 py-0.5 rounded backdrop-blur-sm shadow-sm">
                        {count}
                      </span>
                    </div>
                  </div>
                  <div className="text-[10px] uppercase font-semibold text-center text-blue-200/80 truncate max-w-[80px]">
                    {stage.name}
                  </div>
                </div>
              );
            })}
          </div>
          {stages.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-4">
              Pipeline stages not configured. Apply the Supabase migration
              first.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
