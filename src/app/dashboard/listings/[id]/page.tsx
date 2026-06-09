/**
 * /dashboard/listings/[id] — single listing detail.
 *
 * Supports inline editing: the "Edit" button swaps the headline + body
 * into editable fields and saves via PATCH /api/listings/{id}. The
 * backend trigger snapshots the prior version into
 * copypro_listing_revisions, so every save is recoverable from the
 * revision history below. "Open in CopyPro" still exists for a full
 * conversational rewrite.
 */
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { AnimatePresence, motion } from "framer-motion";

import { createClient } from "@/lib/supabase/client";
import ConfirmationModal from "@/components/confirmation-modal";
import {
  configureAuth,
  fetchListing,
  gradeListing,
  clearGrade,
  updateListing,
  setPublicReference,
  deleteListing,
  type ListingRow,
  type GradeSummary,
  type Grade,
} from "@/components/harcourts-chat/lib/ws";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
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

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function prettyConsultant(slug: string): string {
  return (
    CONSULTANT_LABELS[slug] ??
    slug.split("-").map((s) => s[0]?.toUpperCase() + s.slice(1)).join(" ")
  );
}

function formatDate(iso: string): string {
  const ts = iso.includes("T") ? iso : iso.replace(" ", "T") + "Z";
  return new Date(ts).toLocaleString();
}

/* ------------------------------------------------------------------ */
/*  SVG Icons (inline, no extra dep)                                   */
/* ------------------------------------------------------------------ */

/** Thumbs glyph (Lucide thumbs-up path); rotated 180° for the down vote.
 *  SVG, not an emoji, so it inherits currentColor and sizing cleanly. */
function ThumbIcon({ up = false }: { up?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={up ? "" : "rotate-180"}
    >
      <path d="M7 10v12" />
      <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" />
    </svg>
  );
}

function EllipsisIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
      <circle cx="5" cy="12" r="1" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Markdown toolbar helpers                                           */
/* ------------------------------------------------------------------ */

type ToolbarAction =
  | { type: "wrap"; prefix: string; suffix: string; placeholder: string }
  | { type: "line-prefix"; prefix: string; placeholder: string };

const TOOLBAR_ITEMS: {
  label: string;
  title: string;
  action: ToolbarAction;
}[] = [
  {
    label: "B",
    title: "Bold",
    action: { type: "wrap", prefix: "**", suffix: "**", placeholder: "bold text" },
  },
  {
    label: "I",
    title: "Italic",
    action: { type: "wrap", prefix: "*", suffix: "*", placeholder: "italic text" },
  },
  {
    label: "H",
    title: "Heading",
    action: { type: "line-prefix", prefix: "## ", placeholder: "Heading" },
  },
  {
    label: "•",
    title: "Bullet list",
    action: { type: "line-prefix", prefix: "- ", placeholder: "List item" },
  },
  {
    label: "1.",
    title: "Numbered list",
    action: { type: "line-prefix", prefix: "1. ", placeholder: "List item" },
  },
  {
    label: "❝",
    title: "Quote",
    action: { type: "line-prefix", prefix: "> ", placeholder: "Quote" },
  },
  {
    label: "🔗",
    title: "Link",
    action: {
      type: "wrap",
      prefix: "[",
      suffix: "](https://)",
      placeholder: "link text",
    },
  },
];

/** Apply a toolbar action to a textarea: wraps selection or inserts at
 *  cursor, then re-focuses and positions the caret after the edit. */
function applyToolbarAction(
  textarea: HTMLTextAreaElement,
  action: ToolbarAction,
  value: string,
  setValue: (v: string) => void,
) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = value.slice(start, end);

  let replacement: string;
  let cursorOffset: number;

  if (action.type === "wrap") {
    const inner = selected || action.placeholder;
    replacement = `${action.prefix}${inner}${action.suffix}`;
    cursorOffset = selected
      ? start + replacement.length
      : start + action.prefix.length + inner.length;
  } else {
    // line-prefix: insert at the start of the current line
    const lineStart = value.lastIndexOf("\n", start - 1) + 1;
    const before = value.slice(0, lineStart);
    const after = value.slice(lineStart);
    const inner = selected || action.placeholder;
    replacement = `${action.prefix}${inner}`;
    const newValue = before + replacement + after.slice(selected ? end - lineStart : 0);
    setValue(newValue);
    // Defer focus + cursor position to next tick so React has flushed
    requestAnimationFrame(() => {
      textarea.focus();
      const pos = lineStart + replacement.length;
      textarea.setSelectionRange(pos, pos);
    });
    return;
  }

  const newValue = value.slice(0, start) + replacement + value.slice(end);
  setValue(newValue);
  requestAnimationFrame(() => {
    textarea.focus();
    textarea.setSelectionRange(cursorOffset, cursorOffset);
  });
}

/* ------------------------------------------------------------------ */
/*  ActionsDropdown                                                    */
/* ------------------------------------------------------------------ */

interface DropdownItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  destructive?: boolean;
  disabled?: boolean;
  /** When true a visual divider is rendered ABOVE this item */
  dividerBefore?: boolean;
}

function ActionsDropdown({ items }: { items: DropdownItem[] }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on click-outside
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="More actions"
        className="inline-flex cursor-pointer items-center justify-center rounded-md border border-input p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <EllipsisIcon />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
            role="menu"
            className="absolute right-0 z-50 mt-1.5 min-w-[200px] origin-top-right overflow-hidden rounded-xl border border-input bg-white shadow-lg shadow-slate-900/8 ring-1 ring-slate-900/5"
          >
            <div className="py-1">
              {items.map((item) => (
                <div key={item.id}>
                  {item.dividerBefore && (
                    <div className="my-1 border-t border-slate-100" />
                  )}
                  <button
                    type="button"
                    role="menuitem"
                    disabled={item.disabled}
                    onClick={() => {
                      item.onClick();
                      // Keep dropdown open for copy actions (feedback shows)
                      if (!item.id.startsWith("copy")) setOpen(false);
                    }}
                    className={`flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-[13px] font-medium transition-colors disabled:opacity-50 ${
                      item.destructive
                        ? "text-red-600 hover:bg-red-50"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {item.icon && (
                      <span className="flex w-4 shrink-0 items-center justify-center">
                        {item.icon}
                      </span>
                    )}
                    {item.label}
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Page Component                                                */
/* ------------------------------------------------------------------ */

export default function ListingDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id;
  const supabase = useMemo(() => createClient(), []);
  const backendUrl = process.env.NEXT_PUBLIC_HARCOURTS_BACKEND_URL ?? "";
  const [authReady, setAuthReady] = useState(false);
  // Used to decide which primary action to show (Open in CopyPro for the
  // owner, View Conversation for admins viewing someone else's listing).
  // Backend admin gate on /api/sessions/:id/messages remains the real
  // security boundary; this is UI only.
  const [viewerEmail, setViewerEmail] = useState<string | null>(null);
  const [listing, setListing] = useState<ListingRow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<"md" | "rich" | false>(false);
  const [grades, setGrades] = useState<GradeSummary | null>(null);
  const [grading, setGrading] = useState(false);
  const [gradeError, setGradeError] = useState<string | null>(null);
  // Inline edit state
  const [editing, setEditing] = useState(false);
  const [draftHeadline, setDraftHeadline] = useState("");
  const [draftBody, setDraftBody] = useState("");
  const [draftSummary, setDraftSummary] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [promotingRef, setPromotingRef] = useState(false);
  const [deleting, setDeleting] = useState(false);
  // Modern delete confirmation dialog
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  // Editor preview toggle
  const [showPreview, setShowPreview] = useState(false);
  // Textarea ref for toolbar actions
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // Hidden div for rich-text copy
  const richTextRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    configureAuth(async () => {
      const { data } = await supabase.auth.getSession();
      return data.session?.access_token ?? null;
    });
    // Capture viewer email for the role-aware action button below.
    supabase.auth.getUser().then(({ data }) => {
      if (cancelled) return;
      setViewerEmail(data.user?.email ?? null);
      setAuthReady(true);
    });
    return () => { cancelled = true; };
  }, [supabase]);

  useEffect(() => {
    if (!authReady || !backendUrl || !id) return;
    let cancelled = false;
    setListing(null);
    setError(null);
    fetchListing(backendUrl, id, { includeRevisions: true })
      .then((row) => {
        if (cancelled) return;
        setListing(row);
        setGrades(row.grade_summary ?? { up: 0, down: 0, my_grade: null });
      })
      .catch((err) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : String(err));
      });
    return () => { cancelled = true; };
  }, [authReady, backendUrl, id]);

  // Toggle the current user's grade. Tapping the active thumb clears it.
  async function vote(next: Grade) {
    if (!listing || grading) return;
    const prev = grades;
    setGrading(true);
    setGradeError(null);
    try {
      const summary =
        grades?.my_grade === next
          ? await clearGrade(backendUrl, listing.id)
          : await gradeListing(backendUrl, listing.id, next);
      setGrades(summary);
    } catch (err) {
      setGrades(prev ?? null);
      const raw = err instanceof Error ? err.message : String(err);
      const isNetwork =
        /failed to fetch|load failed|networkerror|network request failed/i.test(
          raw,
        );
      setGradeError(
        isNetwork
          ? "Network hiccup — your rating didn't save. Tap to retry."
          : `Couldn't save your rating: ${raw}`,
      );
    } finally {
      setGrading(false);
    }
  }

  // Delete listing via the modern ConfirmationModal instead of window.confirm
  const confirmDelete = useCallback(async () => {
    if (!listing || deleting) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteListing(backendUrl, listing.id);
      router.push("/dashboard/listings");
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : String(err));
      setDeleting(false);
    }
  }, [listing, deleting, backendUrl, router]);

  // Admin-only: promote/demote this listing as a team-wide reference.
  async function togglePublicReference() {
    if (!listing || promotingRef) return;
    setPromotingRef(true);
    try {
      const updated = await setPublicReference(
        backendUrl,
        listing.id,
        !listing.is_public_reference,
      );
      setListing((prev) =>
        prev
          ? { ...prev, is_public_reference: updated.is_public_reference }
          : prev,
      );
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : String(err));
    } finally {
      setPromotingRef(false);
    }
  }

  function startEdit() {
    if (!listing) return;
    setDraftHeadline(listing.headline ?? "");
    setDraftBody(listing.body_md ?? "");
    setDraftSummary("");
    setSaveError(null);
    setShowPreview(false);
    setEditing(true);
  }

  function cancelEdit() {
    setEditing(false);
    setSaveError(null);
    setShowPreview(false);
  }

  // Persist edits via PATCH. The backend trigger snapshots the prior
  // version into copypro_listing_revisions, so we re-fetch with
  // revisions afterward to show the new history entry without a reload.
  async function saveEdit() {
    if (!listing || saving) return;
    const headline = draftHeadline.trim();
    const body = draftBody.trim();
    if (body.length < 10) {
      setSaveError("The listing body is too short to save.");
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      await updateListing(backendUrl, listing.id, {
        headline,
        body_md: body,
        edit_summary: draftSummary.trim() || undefined,
      });
      const full = await fetchListing(backendUrl, listing.id, {
        includeRevisions: true,
      });
      setListing(full);
      setGrades(full.grade_summary ?? grades);
      setEditing(false);
      setShowPreview(false);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }

  // Copy raw markdown
  async function handleCopyMarkdown() {
    if (!listing?.body_md) return;
    try {
      await navigator.clipboard.writeText(listing.body_md);
      setCopied("md");
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard refused
    }
  }

  // Copy as rich text (formatted HTML) — paste into Outlook/Docs/Word
  async function handleCopyRichText() {
    if (!listing?.body_md || !richTextRef.current) return;
    try {
      const html = richTextRef.current.innerHTML;
      const blob = new Blob([html], { type: "text/html" });
      const textBlob = new Blob([listing.body_md], { type: "text/plain" });
      await navigator.clipboard.write([
        new ClipboardItem({
          "text/html": blob,
          "text/plain": textBlob,
        }),
      ]);
      setCopied("rich");
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Fallback: copy plain text if clipboard.write isn't supported
      try {
        await navigator.clipboard.writeText(listing.body_md);
        setCopied("rich");
        setTimeout(() => setCopied(false), 1800);
      } catch {
        // clipboard refused entirely
      }
    }
  }

  // Apply a toolbar formatting action to the editor textarea
  function handleToolbarAction(action: ToolbarAction) {
    if (!textareaRef.current) return;
    applyToolbarAction(textareaRef.current, action, draftBody, setDraftBody);
  }

  /* ---------------------------------------------------------------- */
  /*  Build the dropdown menu items                                    */
  /* ---------------------------------------------------------------- */

  const dropdownItems: DropdownItem[] = useMemo(() => {
    if (!listing) return [];

    const items: DropdownItem[] = [
      {
        id: "copy-md",
        label: copied === "md" ? "Copied ✓" : "Copy Markdown",
        icon: (
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="14" height="14" x="8" y="8" rx="2" />
            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
          </svg>
        ),
        onClick: handleCopyMarkdown,
      },
      {
        id: "copy-rich",
        label: copied === "rich" ? "Copied ✓" : "Copy Rich Text",
        icon: (
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
        ),
        onClick: handleCopyRichText,
      },
    ];

    // Admin-only: Make public reference — sits below a divider
    if (listing.viewer_is_admin) {
      items.push({
        id: "toggle-ref",
        label: listing.is_public_reference
          ? "★ Public reference"
          : "Make public reference",
        icon: (
          <svg viewBox="0 0 24 24" width="14" height="14" fill={listing.is_public_reference ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        ),
        onClick: togglePublicReference,
        disabled: promotingRef,
        dividerBefore: true,
      });
    }

    // Delete — always last, always destructive, always behind a divider
    items.push({
      id: "delete",
      label: deleting ? "Deleting…" : "Delete listing",
      icon: (
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 6h18" />
          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
          <line x1="10" y1="11" x2="10" y2="17" />
          <line x1="14" y1="11" x2="14" y2="17" />
        </svg>
      ),
      onClick: () => setShowDeleteConfirm(true),
      destructive: true,
      disabled: deleting,
      dividerBefore: !listing.viewer_is_admin,
    });

    return items;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listing, copied, deleting, promotingRef]);

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 p-6">
      <div className="text-sm text-muted-foreground">
        <Link
          href="/dashboard/listings"
          className="underline-offset-2 hover:underline"
        >
          ← Back to listings
        </Link>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          Couldn&apos;t load listing: {error}
        </div>
      )}

      {!error && listing === null && (
        <p className="text-sm text-muted-foreground">Loading…</p>
      )}

      {listing && (
        <>
          <header className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              {listing.address}
            </h1>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span>{prettyConsultant(listing.consultant_slug)}</span>
              <span>·</span>
              <span>by {listing.user_email}</span>
              <span>·</span>
              <span>updated {formatDate(listing.updated_at)}</span>
              {listing.revisions && listing.revisions.length > 0 && (
                <>
                  <span>·</span>
                  <span>
                    {listing.revisions.length} prior revision
                    {listing.revisions.length === 1 ? "" : "s"}
                  </span>
                </>
              )}
              {listing.status === "archived" && (
                <>
                  <span>·</span>
                  <span className="rounded-sm bg-muted px-1.5 py-0.5 text-[10px] uppercase tracking-wide">
                    archived
                  </span>
                </>
              )}
            </div>
            {editing ? (
              <input
                type="text"
                value={draftHeadline}
                onChange={(e) => setDraftHeadline(e.target.value)}
                placeholder="Headline"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-base font-medium shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            ) : (
              listing.headline && (
                <p className="text-base font-medium">{listing.headline}</p>
              )
            )}
          </header>

          {/* ─── Action bar ─── */}
          <div className="flex flex-wrap items-center gap-2">
            {!editing ? (
              <>
                {/* Primary visible actions */}
                <button
                  type="button"
                  onClick={startEdit}
                  className="inline-flex items-center gap-1.5 rounded-md border border-input px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
                >
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                    <path d="m15 5 4 4" />
                  </svg>
                  Edit
                </button>
                {/* Role-aware primary action:
                 *   Owner          → Open in CopyPro (resumes editing)
                 *   Admin viewing other → View Conversation (read-only transcript)
                 * Backend admin gate on /api/sessions/:id/messages is the real
                 * security boundary; this swap is UI only. */}
                {viewerEmail && listing.user_email === viewerEmail ? (
                  <Link
                    href={`/dashboard/copypro?edit=${encodeURIComponent(listing.id)}`}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90"
                  >
                    Open in CopyPro
                  </Link>
                ) : (
                  <Link
                    href={`/dashboard/listings/${encodeURIComponent(listing.id)}/conversation`}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      width="13"
                      height="13"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                    >
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    View Conversation
                  </Link>
                )}

                {/* Ellipsis dropdown — Copy MD, Copy Rich Text, Make Ref, Delete */}
                <ActionsDropdown items={dropdownItems} />

                {/* Grade — thumbs up/down, pushed right */}
                <div className="ml-auto flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => vote("up")}
                    disabled={grading}
                    aria-pressed={grades?.my_grade === "up"}
                    aria-label="Rate this listing strong"
                    title="This listing is strong"
                    className={`inline-flex cursor-pointer items-center gap-1 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${
                      grades?.my_grade === "up"
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                        : "border-input text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <ThumbIcon up />
                    {grades && grades.up > 0 && <span>{grades.up}</span>}
                  </button>
                  <button
                    type="button"
                    onClick={() => vote("down")}
                    disabled={grading}
                    aria-pressed={grades?.my_grade === "down"}
                    aria-label="Rate this listing needs work"
                    title="This listing needs work"
                    className={`inline-flex cursor-pointer items-center gap-1 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${
                      grades?.my_grade === "down"
                        ? "border-rose-500 bg-rose-50 text-rose-700"
                        : "border-input text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <ThumbIcon />
                    {grades && grades.down > 0 && <span>{grades.down}</span>}
                  </button>
                </div>
              </>
            ) : (
              /* ─── Edit-mode actions ─── */
              <>
                <button
                  type="button"
                  onClick={saveEdit}
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
                >
                  {saving ? "Saving…" : "Save changes"}
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 rounded-md border border-input px-3 py-1.5 text-xs font-medium hover:bg-muted disabled:opacity-50"
                >
                  Cancel
                </button>
              </>
            )}
          </div>

          {gradeError && !editing && (
            <p className="text-xs text-destructive">{gradeError}</p>
          )}
          {saveError && (
            <p className="text-xs text-destructive">
              Couldn&apos;t save changes: {saveError}
            </p>
          )}
          {deleteError && (
            <p className="text-xs text-destructive">
              Couldn&apos;t delete listing: {deleteError}
            </p>
          )}

          {editing ? (
            <div className="space-y-2">
              {/* ─── Markdown editor toolbar ─── */}
              <div className="flex items-center gap-0.5 rounded-t-md border border-b-0 border-input bg-slate-50 px-2 py-1.5">
                {TOOLBAR_ITEMS.map((item) => (
                  <button
                    key={item.title}
                    type="button"
                    title={item.title}
                    onClick={() => handleToolbarAction(item.action)}
                    className="inline-flex h-7 min-w-[28px] items-center justify-center rounded px-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-200 hover:text-slate-900 active:scale-95"
                  >
                    {item.label}
                  </button>
                ))}

                {/* Divider */}
                <div className="mx-1.5 h-4 w-px bg-slate-200" />

                {/* Preview toggle */}
                <button
                  type="button"
                  onClick={() => setShowPreview((p) => !p)}
                  className={`inline-flex h-7 items-center gap-1 rounded px-2 text-xs font-medium transition-colors ${
                    showPreview
                      ? "bg-slate-200 text-slate-900"
                      : "text-slate-500 hover:bg-slate-200 hover:text-slate-700"
                  }`}
                >
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  Preview
                </button>
              </div>

              <textarea
                ref={textareaRef}
                value={draftBody}
                onChange={(e) => setDraftBody(e.target.value)}
                rows={showPreview ? 14 : 24}
                spellCheck
                className="w-full rounded-b-md border border-input bg-background p-3 font-mono text-xs leading-relaxed shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />

              {/* ─── Live preview ─── */}
              <AnimatePresence>
                {showPreview && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="rounded-md border border-input bg-white p-4">
                      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        Preview
                      </p>
                      <article className="prose prose-sm max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {draftBody || "*Start typing to see preview…*"}
                        </ReactMarkdown>
                      </article>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <input
                type="text"
                value={draftSummary}
                onChange={(e) => setDraftSummary(e.target.value)}
                placeholder="What changed? (optional — shown in revision history)"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
          ) : (
            /* Body — render the full structured markdown the chat saved. */
            <article className="prose prose-sm max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {listing.body_md ?? ""}
              </ReactMarkdown>
            </article>
          )}

          {/* Hidden div used by Copy Rich Text — renders the markdown as
              HTML offscreen so we can grab innerHTML for the clipboard. */}
          <div
            ref={richTextRef}
            className="prose prose-sm sr-only"
            aria-hidden
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {listing.body_md ?? ""}
            </ReactMarkdown>
          </div>

          {listing.revisions && listing.revisions.length > 0 && (
            <details className="rounded-md border border-input p-3">
              <summary className="cursor-pointer text-xs font-medium text-muted-foreground">
                Revision history ({listing.revisions.length})
              </summary>
              <ul className="mt-3 space-y-2 text-xs">
                {listing.revisions.map((r) => (
                  <li
                    key={r.id}
                    className="flex flex-wrap items-baseline gap-2 border-l-2 border-muted pl-3"
                  >
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {formatDate(r.created_at)}
                    </span>
                    {r.edit_summary && (
                      <span className="text-muted-foreground">
                        — {r.edit_summary}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </details>
          )}

          {/* ─── Delete confirmation modal ─── */}
          <ConfirmationModal
            isOpen={showDeleteConfirm}
            onClose={() => {
              if (!deleting) {
                setShowDeleteConfirm(false);
                setDeleteError(null);
              }
            }}
            onConfirm={confirmDelete}
            title="Delete listing"
            description={`Permanently delete the listing for ${listing.address}? This action cannot be undone and all revision history will be lost.`}
            confirmLabel="Delete"
            cancelLabel="Cancel"
            isProcessing={deleting}
          />
        </>
      )}
    </div>
  );
}
