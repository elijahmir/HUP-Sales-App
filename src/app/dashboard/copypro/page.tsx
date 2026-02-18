"use client";

import { useState } from "react";
import { ChatKit, useChatKit } from "@openai/chatkit-react";
import { Sparkles, Wrench } from "lucide-react";
import Script from "next/script";
import { ImageMergerModal } from "@/components/tools/ImageMergerModal";

export default function CopyProPage() {
  const [isMergerOpen, setIsMergerOpen] = useState(false);

  const { control } = useChatKit({
    api: {
      async getClientSecret(existing) {
        if (existing) return existing;
        const res = await fetch("/api/chatkit/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) {
          // Handle error gracefully
          console.error("Failed to fetch session token");
          throw new Error("Failed to fetch session token");
        }
        const { client_secret } = await res.json();
        return client_secret;
      },
    },
    theme: {
      color: {
        accent: {
          primary: "#00ADEF", // Harcourts Blue
          level: 2,
        },
      },
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
    // Simplified layout to fit viewport - removing duplicate background and padding
    <div className="flex flex-col h-[calc(100vh-7rem)]">
      <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col relative w-full mx-auto">
        {/* Header inside the card for a cohesive look */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center text-[#00ADEF]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#001F49]">
                CopyPro Assistant
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                AI-Powered Real Estate Copywriting
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsMergerOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 hover:text-[#00ADEF] rounded-lg border border-slate-200 transition-all"
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Tools</span>
          </button>
        </div>

        {/* Chat Interface - Fills remaining space */}
        <div className="flex-1 relative w-full bg-white min-h-0 flex flex-col">
          <div className="flex-1 relative">
            <ChatKit
              control={control}
              className="w-full h-full absolute inset-0"
            />
          </div>
          {/* Disclaimer Footer */}
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
      <Script
        src="https://cdn.platform.openai.com/deployments/chatkit/chatkit.js"
        strategy="lazyOnload"
      />
    </div>
  );
}
