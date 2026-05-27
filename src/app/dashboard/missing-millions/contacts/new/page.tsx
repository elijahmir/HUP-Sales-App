"use client";

/**
 * Missing Millions — New Contact Form
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { PipelineStage } from "@/lib/missing-millions/types";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

export default function NewContactPage() {
  const router = useRouter();
  const supabase = createClient();
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    assigned_agent: "",
    pipeline_stage_id: "",
    provenance: "Manual",
  });

  useEffect(() => {
    async function loadStages() {
      const { data } = await supabase
        .from("sales_pipeline_stages")
        .select("*")
        .order("order_num");
      if (data) setStages(data);
    }
    loadStages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);

    const { error } = await supabase.from("sales_contacts").insert({
      name: form.name.trim(),
      phone: form.phone.trim() || null,
      email: form.email.trim() || null,
      assigned_agent: form.assigned_agent.trim() || null,
      pipeline_stage_id: form.pipeline_stage_id || null,
      provenance: form.provenance,
    });

    setSaving(false);

    if (!error) {
      router.push("/dashboard/missing-millions/contacts");
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <Link
        href="/dashboard/missing-millions/contacts"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Contacts
      </Link>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-6">
          New Contact
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Name *
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00ADEF]/20 focus:border-[#00ADEF]"
              placeholder="Vendor / Owner name"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) =>
                  setForm({ ...form, phone: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00ADEF]/20 focus:border-[#00ADEF]"
                placeholder="04xx xxx xxx"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00ADEF]/20 focus:border-[#00ADEF]"
                placeholder="vendor@email.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Pipeline Stage
              </label>
              <select
                value={form.pipeline_stage_id}
                onChange={(e) =>
                  setForm({
                    ...form,
                    pipeline_stage_id: e.target.value,
                  })
                }
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#00ADEF]/20"
              >
                <option value="">Select stage...</option>
                {stages.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Assigned Agent
              </label>
              <input
                type="text"
                value={form.assigned_agent}
                onChange={(e) =>
                  setForm({
                    ...form,
                    assigned_agent: e.target.value,
                  })
                }
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00ADEF]/20 focus:border-[#00ADEF]"
                placeholder="Agent name"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving || !form.name.trim()}
            className="w-full bg-[#00ADEF] text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-[#0097D1] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Create Contact"}
          </button>
        </form>
      </div>
    </div>
  );
}
