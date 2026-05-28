/**
 * /dashboard/admin — CopyPro admin review.
 *
 * Admin-only (profiles.is_copypro_admin). Two queues per consultant:
 *  1. Pending per-user voice rules — teammates' private training, with a
 *     "Promote to team" action that makes a rule everyone-wide.
 *  2. Listings with up/down grade counts — promote a strong one to a
 *     public reference the agent draws on for everyone writing that
 *     consultant.
 *
 * The backend gates everything (admin-overview + promote endpoints 403 for
 * non-admins); this page just renders the queues and fires the actions.
 */
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { createClient } from "@/lib/supabase/client";
import {
  configureAuth,
  fetchAdminListings,
  fetchLearnings,
  promoteLearning,
  setPublicReference,
  type ListingRow,
  type LearningRow,
} from "@/components/harcourts-chat/lib/ws";

const CONSULTANT_LABELS: Record<string, string> = {
  "colin-tunn": "Colin Tunn",
  "jakub-lehman": "Jakub Lehman",
  "jarrod-burr": "Jarrod Burr",
  "jodi-tunn": "Jodi Tunn",
  "kurt-knowles": "Kurt Knowles",
  "raymond-buitenhuis": "Raymond Buitenhuis",
  "wendy-squibb": "Wendy Squibb",
};

export default function AdminReviewPage() {
  const supabase = useMemo(() => createClient(), []);
  const backendUrl = process.env.NEXT_PUBLIC_HARCOURTS_BACKEND_URL ?? "";
  const [authReady, setAuthReady] = useState(false);
  const [consultant, setConsultant] = useState("kurt-knowles");
  const [listings, setListings] = useState<ListingRow[] | null>(null);
  const [rules, setRules] = useState<LearningRow[] | null>(null);
  const [notAdmin, setNotAdmin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    configureAuth(async () => {
      const { data } = await supabase.auth.getSession();
      return data.session?.access_token ?? null;
    });
    queueMicrotask(() => setAuthReady(true));
  }, [supabase]);

  useEffect(() => {
    if (!authReady || !backendUrl) return;
    let cancelled = false;
    setListings(null);
    setRules(null);
    setError(null);
    setNotAdmin(false);
    Promise.all([
      fetchAdminListings(backendUrl, consultant),
      fetchLearnings(backendUrl, consultant, "user"),
    ])
      .then(([ls, rs]) => {
        if (cancelled) return;
        setListings(ls);
        setRules(rs);
      })
      .catch((err) => {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes("403")) setNotAdmin(true);
        else setError(msg);
      });
    return () => {
      cancelled = true;
    };
  }, [authReady, backendUrl, consultant]);

  async function onPromoteRule(id: number) {
    setBusy(`rule:${id}`);
    try {
      await promoteLearning(backendUrl, id);
      setRules((prev) => prev?.filter((r) => r.id !== id) ?? prev);
    } catch (err) {
      alert(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(null);
    }
  }

  async function onTogglePublic(l: ListingRow) {
    setBusy(`listing:${l.id}`);
    try {
      const updated = await setPublicReference(
        backendUrl,
        l.id,
        !l.is_public_reference,
      );
      setListings(
        (prev) =>
          prev?.map((x) =>
            x.id === l.id
              ? { ...x, is_public_reference: updated.is_public_reference }
              : x,
          ) ?? prev,
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 p-6">
      <Link
        href="/dashboard/copypro"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 transition-colors hover:text-[#00ADEF]"
      >
        <span aria-hidden>←</span> Back to CopyPro
      </Link>

      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Admin review</h1>
        <p className="text-sm text-muted-foreground">
          Promote teammates&apos; private voice rules to the whole team, and
          mark strong listings as references the agent uses for everyone.
        </p>
      </header>

      <select
        value={consultant}
        onChange={(e) => setConsultant(e.target.value)}
        className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        {Object.entries(CONSULTANT_LABELS).map(([slug, label]) => (
          <option key={slug} value={slug}>
            {label}
          </option>
        ))}
      </select>

      {notAdmin && (
        <div className="rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
          This page is for CopyPro admins only.
        </div>
      )}

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {!notAdmin && !error && (
        <>
          {/* Pending per-user voice rules */}
          <section className="space-y-3">
            <h2 className="text-sm font-semibold">
              Pending voice rules{" "}
              {rules !== null && (
                <span className="text-muted-foreground">({rules.length})</span>
              )}
            </h2>
            {rules === null && (
              <p className="text-sm text-muted-foreground">Loading…</p>
            )}
            {rules !== null && rules.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No private rules waiting. When a teammate trains{" "}
                {CONSULTANT_LABELS[consultant]} (&quot;Save as voice rule&quot;
                in chat), it lands here for you to promote.
              </p>
            )}
            {rules?.map((r) => (
              <div
                key={r.id}
                className="flex flex-col gap-2 rounded-md border border-input p-4 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{r.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {r.rule}
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    by {r.saved_by}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onPromoteRule(r.id)}
                  disabled={busy === `rule:${r.id}`}
                  className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
                >
                  {busy === `rule:${r.id}` ? "Promoting…" : "Promote to team"}
                </button>
              </div>
            ))}
          </section>

          {/* Listings + grades */}
          <section className="space-y-3">
            <h2 className="text-sm font-semibold">
              Listings{" "}
              {listings !== null && (
                <span className="text-muted-foreground">
                  ({listings.length})
                </span>
              )}
            </h2>
            {listings === null && (
              <p className="text-sm text-muted-foreground">Loading…</p>
            )}
            {listings !== null && listings.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No listings for {CONSULTANT_LABELS[consultant]} yet.
              </p>
            )}
            {listings?.map((l) => (
              <div
                key={l.id}
                className="flex flex-col gap-2 rounded-md border border-input p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/dashboard/listings/${l.id}`}
                    className="truncate text-sm font-medium hover:underline"
                  >
                    {l.address}
                  </Link>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    👍 {l.grade_summary?.up ?? 0} · 👎{" "}
                    {l.grade_summary?.down ?? 0} · by {l.user_email}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onTogglePublic(l)}
                  disabled={busy === `listing:${l.id}`}
                  className={`inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${
                    l.is_public_reference
                      ? "border-amber-500 bg-amber-50 text-amber-700"
                      : "border-input text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {l.is_public_reference
                    ? "★ Public reference"
                    : "Make public reference"}
                </button>
              </div>
            ))}
          </section>
        </>
      )}
    </div>
  );
}
