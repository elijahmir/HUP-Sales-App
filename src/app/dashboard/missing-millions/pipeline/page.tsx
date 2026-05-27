"use client";

/**
 * Missing Millions — Pipeline Kanban Board
 */

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Contact, PipelineStage } from "@/lib/missing-millions/types";
import Link from "next/link";

export default function PipelinePage() {
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadData() {
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

  const contactsByStage = (stageId: string | null) =>
    contacts.filter((c) => c.pipeline_stage_id === stageId);

  const STAGE_COLORS: Record<string, string> = {
    "Not Ready": "border-slate-300",
    Nurturing: "border-blue-400",
    Considering: "border-amber-400",
    Appraisal: "border-purple-400",
    Listing: "border-cyan-400",
    Sold: "border-emerald-400",
    Lost: "border-red-400",
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4 overflow-x-auto pb-4 items-start min-h-[500px]">
        {stages.map((stage) => {
          const stageContacts = contactsByStage(stage.id);
          const borderColor =
            STAGE_COLORS[stage.name] || "border-slate-200";

          return (
            <div
              key={stage.id}
              className={`min-w-[280px] w-[280px] bg-slate-50 rounded-xl flex flex-col h-full shrink-0 border-t-4 ${borderColor} border border-slate-200`}
            >
              <div className="p-3 border-b border-slate-200 flex justify-between items-center">
                <h3 className="font-semibold text-sm text-slate-700">
                  {stage.name}
                </h3>
                <span className="text-xs bg-white text-slate-500 px-2 py-0.5 rounded-full border border-slate-200 font-medium shadow-sm">
                  {stageContacts.length}
                </span>
              </div>
              <div className="p-3 space-y-3 flex-1 overflow-y-auto">
                {stageContacts.map((c) => (
                  <Link
                    href={`/dashboard/missing-millions/contacts/${c.id}`}
                    key={c.id}
                    className="block bg-white p-3 rounded-lg border border-slate-200 shadow-sm hover:border-[#00ADEF]/40 hover:shadow-md transition-all group"
                  >
                    <h4 className="text-sm font-medium text-slate-900 group-hover:text-[#00ADEF] truncate">
                      {c.name}
                    </h4>
                    {c.assigned_agent && (
                      <p className="text-xs text-slate-400 mt-1">
                        Agent: {c.assigned_agent}
                      </p>
                    )}
                    {c.next_follow_up_at && (
                      <p
                        className={`text-xs mt-1 ${
                          new Date(c.next_follow_up_at) < new Date()
                            ? "text-red-500 font-medium"
                            : "text-slate-400"
                        }`}
                      >
                        Follow-up:{" "}
                        {new Date(
                          c.next_follow_up_at,
                        ).toLocaleDateString()}
                      </p>
                    )}
                  </Link>
                ))}
                {stageContacts.length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-4 italic">
                    Empty
                  </p>
                )}
              </div>
            </div>
          );
        })}

        {/* Unassigned */}
        <div className="min-w-[280px] w-[280px] bg-slate-50/50 rounded-xl flex flex-col h-full shrink-0 border border-dashed border-slate-200">
          <div className="p-3 border-b border-slate-200/50 flex justify-between items-center">
            <h3 className="font-semibold text-sm text-slate-400">
              Unassigned
            </h3>
            <span className="text-xs bg-white text-slate-400 px-2 py-0.5 rounded-full border border-slate-100 shadow-sm">
              {contactsByStage(null).length}
            </span>
          </div>
          <div className="p-3 space-y-3 flex-1 overflow-y-auto">
            {contactsByStage(null).map((c) => (
              <Link
                href={`/dashboard/missing-millions/contacts/${c.id}`}
                key={c.id}
                className="block bg-white p-3 rounded-lg border border-slate-200 shadow-sm hover:border-[#00ADEF]/40 transition-all group"
              >
                <h4 className="text-sm font-medium text-slate-900 group-hover:text-[#00ADEF] truncate">
                  {c.name}
                </h4>
                {c.email && (
                  <p className="text-xs text-slate-400 mt-1 truncate">
                    {c.email}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
