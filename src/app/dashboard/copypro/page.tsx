"use client";

import { useState } from "react";
import { Source_Sans_3 } from "next/font/google";
import { Sparkles, Wrench } from "lucide-react";
import { ChatKit, useChatKit } from "@openai/chatkit-react";
import Script from "next/script";
import { ImageMergerModal } from "@/components/tools/ImageMergerModal";
import { HarcourtsChat } from "@/components/harcourts-chat";

// Source Sans Pro = Harcourts brand typography (per the official
// Branding JSON). Loaded here, not in the root layout, so it only
// applies inside the chat shell and doesn't override fonts elsewhere
// on the dashboard. The CSS variable is consumed by .harcourts-chat-shell
// in globals.css.
const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-source-sans",
  display: "swap",
});

/**
 * CopyPro — two versions, switchable at runtime.
 *
 *   ?v=new          → Harcourts chat (Neo backend, Tailscale Funnel).
 *                     Default when no query param.
 *   ?v=old          → Original OpenAI ChatKit embed (the version that
 *                     was live before this migration).
 *   NEXT_PUBLIC_COPYPRO_DEFAULT=old  → globally flip the default in
 *                     production without code changes.
 *
 * The two share the outer card chrome (border, disclaimer footer) but
 * neither claims the inner header strip — the dashboard layout above
 * already shows the page title and the user's identity. Keeping the
 * old code reachable means a one-URL-param rollback if the new chat
 * misbehaves in front of a consultant.
 */
type Variant = "new" | "old";

export default function CopyProPage() {
  return <CopyProContent />;
}

function CopyProContent() {
  const [isMergerOpen, setIsMergerOpen] = useState(false);
  const backendUrl = process.env.NEXT_PUBLIC_HARCOURTS_BACKEND_URL ?? "";

  // Resolve the active variant. `?v=old|new` wins over the build-time
  // default. We read the URL on the client only (no SSR) — running this
  // on every render is cheap and avoids hydration mismatches.
  const variant: Variant = useVariant();

  // Page-level toolbar extras forwarded into the chat header so there's
  // a single row, not two stacked toolbars. The chat already owns the
  // dropdown / History / New / status dot; this slot tacks on the
  // variant switch + Tools button at the right edge.
  const headerExtras = (
    <>
      <VariantSwitch current={variant} />
      <button
        onClick={() => setIsMergerOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-[#00ADEF] transition-colors"
      >
        <Wrench className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Tools</span>
      </button>
    </>
  );

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)]">
      <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col relative w-full mx-auto">
        {/* When the New variant is active, its chat header absorbs the
            variant switch + Tools button (via headerSlot). The Old
            variant is the OpenAI ChatKit which owns its own UI and has
            no slot for ours — so we render a thin fallback toolbar
            above it. Either way the user always has access to the
            variant switch and Tools button. */}
        {variant === "old" && (
          <div className="px-6 py-2.5 border-b border-slate-100 flex items-center justify-end gap-2 bg-white shrink-0">
            {headerExtras}
          </div>
        )}

        <div className="flex-1 relative w-full min-h-0 flex flex-col">
          <div className="flex-1 relative">
            {variant === "old" ? (
              <ChatKitView />
            ) : !backendUrl ? (
              <BackendNotConfigured />
            ) : (
              <div
                className={`harcourts-chat-shell ${sourceSans.variable} absolute inset-0 overflow-hidden`}
              >
                <HarcourtsChat
                  backendUrl={backendUrl}
                  headerSlot={headerExtras}
                />
              </div>
            )}
          </div>
          {/* Disclaimer footer — same wording across both variants. */}
          <div className="px-6 py-3 bg-white border-t border-slate-100 text-center">
            <p className="text-[10px] text-slate-400 leading-relaxed max-w-4xl mx-auto">
              CopyPro is an AI tool designed to generate marketing content. All
              outputs require human review for accuracy. Please ensure a
              licensed Harcourts professional verifies all property details,
              pricing, and legal information before publishing.
            </p>
          </div>
        </div>
      </div>
      <ImageMergerModal
        isOpen={isMergerOpen}
        onClose={() => setIsMergerOpen(false)}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Variant selection                                                          */
/* -------------------------------------------------------------------------- */

function useVariant(): Variant {
  if (typeof window === "undefined") {
    return (process.env.NEXT_PUBLIC_COPYPRO_DEFAULT as Variant) || "new";
  }
  const params = new URLSearchParams(window.location.search);
  const q = params.get("v");
  if (q === "old" || q === "new") return q;
  return (process.env.NEXT_PUBLIC_COPYPRO_DEFAULT as Variant) || "new";
}

function VariantSwitch({ current }: { current: Variant }) {
  // `new` is the default — its URL has NO query param. Clicking "New"
  // navigates to the bare path so `?v=new` never appears in the address
  // bar. Only the "Old" link carries `?v=old`. Net effect: 99% of the
  // time the URL is /dashboard/copypro with no clutter; the param only
  // shows up when the operator has deliberately chosen the fallback.
  const base = "px-2.5 py-1 text-xs font-medium rounded-md transition-colors";
  const active = "bg-[#00ADEF] text-white";
  const idle = "bg-slate-50 text-slate-600 hover:bg-slate-100";
  return (
    <div className="flex items-center gap-1 rounded-md border border-slate-200 p-0.5 mr-2">
      <a
        href="/dashboard/copypro"
        className={`${base} ${current === "new" ? active : idle}`}
      >
        New
      </a>
      <a
        href="?v=old"
        className={`${base} ${current === "old" ? active : idle}`}
      >
        Old
      </a>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Variant: new (Harcourts chat) — "backend not configured" fallback panel    */
/* -------------------------------------------------------------------------- */

function BackendNotConfigured() {
  return (
    <div className="flex h-full items-center justify-center p-8 text-center text-sm text-slate-500">
      <div>
        <div className="mx-auto mb-4 w-12 h-12 rounded-xl bg-sky-50 flex items-center justify-center text-[#00ADEF]">
          <Sparkles className="w-6 h-6" />
        </div>
        <p className="font-semibold text-slate-700">
          CopyPro backend not configured.
        </p>
        <p className="mt-2">
          Set{" "}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">
            NEXT_PUBLIC_HARCOURTS_BACKEND_URL
          </code>{" "}
          in the Vercel project&apos;s environment variables (the URL printed
          by{" "}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">
            ./scripts/install.sh funnel
          </code>{" "}
          on the host Mac).
        </p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Variant: old (OpenAI ChatKit) — preserved as-is for fallback               */
/* -------------------------------------------------------------------------- */

function ChatKitView() {
  const { control } = useChatKit({
    api: {
      async getClientSecret(existing) {
        if (existing) return existing;
        const res = await fetch("/api/chatkit/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) {
          console.error("Failed to fetch session token");
          throw new Error("Failed to fetch session token");
        }
        const { client_secret } = await res.json();
        return client_secret;
      },
    },
    theme: {
      color: { accent: { primary: "#00ADEF", level: 2 } },
    },
    composer: {
      attachments: {
        enabled: true,
        accept: {
          "image/png": [".png"],
          "image/jpeg": [".jpg", ".jpeg"],
          "application/pdf": [".pdf"],
          "text/plain": [".txt"],
        },
      },
    },
    startScreen: {
      greeting: "Got a new listing? Perfect, let's get the copy dialed in.",
      prompts: [
        {
          label: "Let's start creating the sales listing",
          prompt: "I need help creating a sales listing for a new property.",
        },
        {
          label: "Upload property info for instant help",
          prompt:
            "I have property information to upload. Can you help me process it?",
        },
      ],
    },
  });

  return (
    <>
      <ChatKit control={control} className="w-full h-full absolute inset-0" />
      <Script
        src="https://cdn.platform.openai.com/deployments/chatkit/chatkit.js"
        strategy="lazyOnload"
      />
    </>
  );
}
