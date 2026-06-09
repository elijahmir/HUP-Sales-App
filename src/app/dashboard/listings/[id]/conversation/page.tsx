/**
 * /dashboard/listings/[id]/conversation — read-only transcript viewer.
 *
 * Replays the original CopyPro conversation that produced this listing.
 * Owner sees their own chat. CopyPro admins see anyone's chat (with a
 * "viewing X's conversation" banner). Non-admin non-owners hit this URL
 * directly will get an empty array from the backend and see the
 * "no longer available" empty state — the backend never 403s here, to
 * avoid leaking whether the session exists.
 *
 * Read-only by design: no input box, no way to write back into the
 * historical session. The "Open in CopyPro" edit flow lives on the
 * detail page and is the only mutation path.
 */
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { createClient } from "@/lib/supabase/client";
import {
  configureAuth,
  fetchListing,
  fetchSessionMessages,
  type ListingRow,
  type SessionMessageRow,
} from "@/components/harcourts-chat/lib/ws";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

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

function formatTimestamp(iso: string): string {
  const ts = iso.includes("T") ? iso : iso.replace(" ", "T") + "Z";
  return new Date(ts).toLocaleString();
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function ConversationPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const supabase = useMemo(() => createClient(), []);
  const backendUrl = process.env.NEXT_PUBLIC_HARCOURTS_BACKEND_URL ?? "";

  const [authReady, setAuthReady] = useState(false);
  const [viewerEmail, setViewerEmail] = useState<string | null>(null);
  const [listing, setListing] = useState<ListingRow | null>(null);
  // null = still loading; [] = loaded but empty (forbidden / deleted)
  const [messages, setMessages] = useState<SessionMessageRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Configure auth + capture viewer email.
  useEffect(() => {
    let cancelled = false;
    configureAuth(async () => {
      const { data } = await supabase.auth.getSession();
      return data.session?.access_token ?? null;
    });
    supabase.auth.getUser().then(({ data }) => {
      if (cancelled) return;
      setViewerEmail(data.user?.email ?? null);
      setAuthReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  // Fetch listing then session messages. State resets happen inside the
  // async IIFE so we don't trip react-hooks/set-state-in-effect — the
  // resets run asynchronously after the effect commits, same render
  // budget as the fetched data that follows them.
  useEffect(() => {
    if (!authReady || !backendUrl || !id) return;
    let cancelled = false;

    (async () => {
      setListing(null);
      setMessages(null);
      setError(null);
      try {
        const row = await fetchListing(backendUrl, id);
        if (cancelled) return;
        setListing(row);
        if (!row.chat_session_id) {
          // Older listings may have an empty linkage. Treat as no transcript.
          setMessages([]);
          return;
        }
        const msgs = await fetchSessionMessages(backendUrl, row.chat_session_id);
        if (cancelled) return;
        setMessages(msgs);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : String(err));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authReady, backendUrl, id]);

  /* ------------------------- render ----------------------------- */

  const isOwner =
    listing !== null &&
    viewerEmail !== null &&
    listing.user_email === viewerEmail;

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 p-6">
      <div className="text-sm text-muted-foreground">
        <Link
          href={id ? `/dashboard/listings/${id}` : "/dashboard/listings"}
          className="underline-offset-2 hover:underline"
        >
          ← Back to listing
        </Link>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          Couldn&apos;t load conversation: {error}
        </div>
      )}

      {!error && listing === null && (
        <p className="text-sm text-muted-foreground">Loading…</p>
      )}

      {listing && (
        <>
          <header className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              Conversation
            </h1>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">
                {listing.headline ?? listing.address}
              </span>
              <span>·</span>
              <span>{prettyConsultant(listing.consultant_slug)}</span>
              <span>·</span>
              <span>by {listing.user_email}</span>
            </div>
          </header>

          {/* Admin banner: viewer != owner means CopyPro admin viewing someone
              else's chat. Owner viewing their own gets no banner. */}
          {!isOwner && viewerEmail && (
            <div className="rounded-md border border-amber-400/40 bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
              Read-only — viewing{" "}
              <span className="font-medium">{listing.user_email}</span>
              &apos;s conversation.
            </div>
          )}

          {messages === null && (
            <p className="text-sm text-muted-foreground">Loading messages…</p>
          )}

          {messages !== null && messages.length === 0 && (
            <div className="rounded-md border border-input bg-muted/30 p-6 text-center text-sm text-muted-foreground">
              This conversation is no longer available.
            </div>
          )}

          {messages !== null && messages.length > 0 && (
            <ol className="space-y-4">
              {messages.map((m) => {
                const isUser = m.role === "user";
                return (
                  <li
                    key={m.id}
                    className={`flex ${
                      isUser ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg border p-3 text-sm ${
                        isUser
                          ? "border-primary/30 bg-primary/5"
                          : "border-input bg-muted/40"
                      }`}
                    >
                      <div className="mb-1 flex items-center justify-between gap-3 text-[11px] text-muted-foreground">
                        <span className="font-medium uppercase tracking-wide">
                          {isUser ? "User" : "CopyPro"}
                        </span>
                        <time>{formatTimestamp(m.created_at)}</time>
                      </div>
                      <div className="prose prose-sm dark:prose-invert max-w-none break-words">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {m.content}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </>
      )}
    </div>
  );
}
