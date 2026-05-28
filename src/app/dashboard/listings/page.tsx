/**
 * /dashboard/listings — CopyPro listings repo (list view).
 *
 * The complementary surface to /dashboard/copypro: every listing a
 * teammate saved from their CopyPro chat lands here as a card. Owner-
 * scoped — admins (profiles.is_copypro_admin) see everyone's. The
 * filtering happens server-side via the backend's /api/listings route,
 * so this page just renders what comes back.
 */
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { createClient } from "@/lib/supabase/client";
import {
  configureAuth,
  fetchListings,
  type ListingRow,
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

function prettyConsultant(slug: string): string {
  return (
    CONSULTANT_LABELS[slug] ??
    slug.split("-").map((s) => s[0]?.toUpperCase() + s.slice(1)).join(" ")
  );
}

function timeAgo(iso: string): string {
  const ts = iso.includes("T") ? iso : iso.replace(" ", "T") + "Z";
  const diff = Date.now() - new Date(ts).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d === 1) return "yesterday";
  if (d < 7) return `${d}d ago`;
  return new Date(ts).toLocaleDateString();
}

export default function ListingsPage() {
  const supabase = useMemo(() => createClient(), []);
  const backendUrl = process.env.NEXT_PUBLIC_HARCOURTS_BACKEND_URL ?? "";
  const [authReady, setAuthReady] = useState(false);
  const [listings, setListings] = useState<ListingRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [consultantFilter, setConsultantFilter] = useState<string>("");
  const [search, setSearch] = useState("");

  // Wire Supabase JWT into the same module-level auth slot the chat
  // uses — once configured, all the existing fetch* helpers work.
  useEffect(() => {
    configureAuth(async () => {
      const { data } = await supabase.auth.getSession();
      return data.session?.access_token ?? null;
    });
    queueMicrotask(() => setAuthReady(true));
  }, [supabase]);

  // Refetch whenever filters change (debounced loosely via the next
  // render's effect run).
  useEffect(() => {
    if (!authReady || !backendUrl) return;
    let cancelled = false;
    // Deferred to satisfy react-hooks/set-state-in-effect — clearing
    // stale state before the fetch without a synchronous cascade.
    queueMicrotask(() => {
      if (cancelled) return;
      setListings(null);
      setError(null);
    });
    fetchListings(backendUrl, {
      consultantSlug: consultantFilter || undefined,
      q: search.trim() || undefined,
      limit: 100,
    })
      .then((rows) => { if (!cancelled) setListings(rows); })
      .catch((err) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : String(err));
      });
    return () => { cancelled = true; };
  }, [authReady, backendUrl, consultantFilter, search]);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-6">
      {/* Back-to-parent pill — duplicates the top breadcrumb's
          functionality but stays visible on mobile (where the floating
          navbar's breadcrumb is hidden under md). Small + tonal so it
          reads as orientation, not a primary CTA. */}
      <Link
        href="/dashboard/copypro"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-[#00ADEF] transition-colors"
      >
        <span aria-hidden>←</span> Back to CopyPro
      </Link>
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Listings</h1>
        <p className="text-sm text-muted-foreground">
          Every listing you&apos;ve saved from CopyPro. Click one to open
          its full copy. Admins see everyone&apos;s.
        </p>
      </header>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by address…"
          className="h-9 min-w-[240px] flex-1 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
        <select
          value={consultantFilter}
          onChange={(e) => setConsultantFilter(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="">All consultants</option>
          {Object.entries(CONSULTANT_LABELS).map(([slug, label]) => (
            <option key={slug} value={slug}>{label}</option>
          ))}
        </select>
      </div>

      {/* Results */}
      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          Couldn&apos;t load listings: {error}
        </div>
      )}

      {listings === null && !error && (
        <p className="text-sm text-muted-foreground">Loading…</p>
      )}

      {listings !== null && listings.length === 0 && (
        <div className="rounded-md border border-dashed border-input p-8 text-center">
          <p className="text-sm font-medium">No listings yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Open{" "}
            <Link
              href="/dashboard/copypro"
              className="font-medium underline-offset-2 hover:underline"
            >
              CopyPro
            </Link>
            , walk through a listing with a consultant, and tap{" "}
            <span className="font-medium">Save as listing</span> on the
            final reply. It lands here.
          </p>
        </div>
      )}

      {listings !== null && listings.length > 0 && (
        <ul className="space-y-2">
          {listings.map((l) => (
            <li key={l.id}>
              <Link
                href={`/dashboard/listings/${l.id}`}
                className="flex flex-col gap-1 rounded-md border border-input p-4 transition hover:border-foreground/30 hover:bg-muted/40 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{l.address}</p>
                  {l.headline && (
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {l.headline}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-3 text-xs text-muted-foreground">
                  <span>{prettyConsultant(l.consultant_slug)}</span>
                  <span>·</span>
                  <span>{timeAgo(l.updated_at)}</span>
                  {l.status === "archived" && (
                    <span className="rounded-sm bg-muted px-1.5 py-0.5 text-[10px] uppercase tracking-wide">
                      archived
                    </span>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
