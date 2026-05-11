"use client";

import { useState, useCallback } from "react";
import { Check, Copy } from "lucide-react";

interface CopyButtonProps {
  /** The text value to copy to clipboard */
  value: string;
  /** Optional aria-label for accessibility */
  label?: string;
}

/**
 * Inline copy-to-clipboard button.
 * Shows a clipboard icon that changes to a checkmark on successful copy.
 */
export function CopyButton({ value, label }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!value) return;
      try {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      } catch {
        // Fallback for older browsers
        const textarea = document.createElement("textarea");
        textarea.value = value;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }
    },
    [value]
  );

  if (!value) return null;

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`inline-flex items-center justify-center w-5 h-5 rounded transition-all duration-200 flex-shrink-0 ${
        copied
          ? "text-emerald-500 bg-emerald-50"
          : "text-gray-300 hover:text-gray-500 hover:bg-gray-100"
      }`}
      aria-label={label || `Copy ${value}`}
      title={copied ? "Copied!" : "Copy to clipboard"}
    >
      {copied ? (
        <Check className="w-3 h-3" />
      ) : (
        <Copy className="w-3 h-3" />
      )}
    </button>
  );
}
