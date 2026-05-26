/**
 * HarcourtsChat — Supabase-wired wrapper around the chat ported from
 * harcourts-listings/apps/web. The chat hook expects a userName and an
 * async getAccessToken callback; this adapter pulls both from the
 * @supabase/ssr browser client and forwards them.
 *
 * The chat replaces the OpenAI ChatKit at /dashboard/copypro. Backend
 * URL comes from NEXT_PUBLIC_HARCOURTS_BACKEND_URL — see the install.sh
 * `funnel` subcommand output for the value to paste into Vercel.
 *
 * Identity propagation:
 *   - userName  = the verified Supabase session's email claim. The Neo
 *     backend also re-derives this from the JWT before persisting, so
 *     even if a malicious client passed something else in the WS
 *     payload it wouldn't be honoured.
 *   - getAccessToken returns supabase.auth.getSession()'s access_token
 *     lazily so refreshes are picked up automatically (Supabase rotates
 *     these every ~1h).
 *
 * Sync: re-running scripts/sync-to-hup.sh in the harcourts-listings
 * repo overwrites the sibling files (chat.tsx, session-picker.tsx,
 * etc.) but NEVER this file — the sync script intentionally skips
 * index.tsx so the adapter survives upstream churn.
 */
"use client";

import { useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";

import { Chat } from "./chat";
import { configureAuth } from "./lib/ws";

export interface HarcourtsChatProps {
  /** The public funnel URL of Neo's backend. Comes from
   * NEXT_PUBLIC_HARCOURTS_BACKEND_URL on the wrapping page. */
  backendUrl: string;
  /** Extra elements to render alongside the chat's own header controls
   * (variant switch, Tools button, anything the host dashboard adds).
   * Forwarded straight to <Chat headerSlot> so there's no double-toolbar. */
  headerSlot?: React.ReactNode;
}

export function HarcourtsChat({ backendUrl, headerSlot }: HarcourtsChatProps) {
  const supabase = createClient();
  const [userName, setUserName] = useState<string | null>(null);
  const [authConfigured, setAuthConfigured] = useState(false);

  // Pull the signed-in email once. If the user signs out mid-session
  // Supabase's listener would fire, but at that point the parent
  // /dashboard route will already redirect to /login per the existing
  // InactivityProvider — we don't need to handle the transition here.
  useEffect(() => {
    let cancelled = false;
    supabase.auth.getUser().then(({ data, error }) => {
      if (cancelled) return;
      if (error || !data.user) {
        // Shouldn't happen — this page is gated by the dashboard layout
        // — but degrade gracefully rather than crash.
        setUserName("unknown@harcourts.com.au");
        return;
      }
      setUserName(data.user.email ?? "unknown@harcourts.com.au");
    });
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  // Wire the token getter into the chat hook's module-level auth slot.
  // Done once on mount; subsequent re-renders reuse the same getter.
  useEffect(() => {
    configureAuth(async () => {
      const { data } = await supabase.auth.getSession();
      return data.session?.access_token ?? null;
    });
    queueMicrotask(() => setAuthConfigured(true));
  }, [supabase]);

  if (!userName || !authConfigured) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-slate-500">
        Loading chat…
      </div>
    );
  }

  // Token getter is plumbed via configureAuth above — the Chat component
  // itself only needs userName + backendUrl. Every REST call and the WS
  // handshake reach into ws.ts's module-level getter, so this stays in
  // sync with token rotation without prop drilling.
  return (
    <Chat
      userName={userName}
      backendUrl={backendUrl}
      headerSlot={headerSlot}
    />
  );
}
