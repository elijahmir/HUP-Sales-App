"use client";

/**
 * Missing Millions — Contacts CRM List
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Contact } from "@/lib/missing-millions/types";
import StatusBadge from "@/components/missing-millions/StatusBadge";
import { Search, ChevronRight, UserPlus } from "lucide-react";

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const supabase = createClient();

  useEffect(() => {
    async function loadData() {
      const { data: contactsData } = await supabase
        .from("sales_contacts")
        .select(
          `
          *,
          pipeline_stage:sales_pipeline_stages(*)
        `,
        )
        .order("created_at", { ascending: false });
      if (contactsData) setContacts(contactsData);
      setLoading(false);
    }
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredContacts = contacts.filter((c) => {
    if (!filter) return true;
    const term = filter.toLowerCase();
    return (
      c.name.toLowerCase().includes(term) ||
      (c.phone && c.phone.toLowerCase().includes(term)) ||
      (c.email && c.email.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div />
        <Link
          href="/dashboard/missing-millions/contacts/new"
          className="bg-[#00ADEF] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#0097D1] transition-colors shadow-sm flex items-center gap-1.5"
        >
          <UserPlus className="w-4 h-4" />
          Add Contact
        </Link>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by name, phone, email..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#00ADEF]/20 focus:border-[#00ADEF]"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00ADEF]" />
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-sky-50 text-sky-500 flex items-center justify-center mx-auto mb-3">
              <UserPlus className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-medium text-slate-900 mb-1">
              No contacts found
            </h3>
            <p className="text-sm text-slate-500">
              Add a new contact or sync from property vendors.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-4 py-3 text-left font-semibold text-slate-500">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-500">
                    Stage
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-500">
                    Contact Details
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-500">
                    Last Contacted
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-500">
                    Next Action
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-500" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredContacts.map((contact) => (
                  <tr
                    key={contact.id}
                    className="hover:bg-sky-50/50 transition-colors group"
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Link
                        href={`/dashboard/missing-millions/contacts/${contact.id}`}
                        className="font-medium text-slate-900 hover:text-[#00ADEF] hover:underline"
                      >
                        {contact.name || "Unknown"}
                      </Link>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {contact.pipeline_stage ? (
                        <StatusBadge
                          value={contact.pipeline_stage.name}
                        />
                      ) : (
                        <span className="text-xs text-slate-400">
                          None
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-0.5">
                        {contact.phone && (
                          <span className="text-slate-600">
                            {contact.phone}
                          </span>
                        )}
                        {contact.email && (
                          <span className="text-slate-500 text-xs">
                            {contact.email}
                          </span>
                        )}
                        {!contact.phone && !contact.email && (
                          <span className="text-slate-400 italic text-xs">
                            No details
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                      {contact.last_contacted_at
                        ? new Date(
                            contact.last_contacted_at,
                          ).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {contact.next_follow_up_at ? (
                        <span
                          className={
                            new Date(contact.next_follow_up_at) <
                            new Date()
                              ? "text-red-600 font-medium"
                              : "text-slate-600"
                          }
                        >
                          {new Date(
                            contact.next_follow_up_at,
                          ).toLocaleDateString()}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/dashboard/missing-millions/contacts/${contact.id}`}
                        className="p-1.5 inline-flex items-center text-slate-400 hover:text-[#00ADEF]"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
