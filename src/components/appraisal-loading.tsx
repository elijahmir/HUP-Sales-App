"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import {
  Brain,
  Scan,
  MapPin,
  Database,
  CheckCircle2,
  FileText,
  Sparkles,
  Loader2,
} from "lucide-react";

// Mock steps to simulate "Phases" of thinking
const steps = [
  { text: "Reading document structure", icon: Scan },
  { text: "Identifying key entities", icon: FileText },
  { text: "Analyzing vendor details", icon: Brain },
  { text: "Verifying property address", icon: MapPin },
  { text: "Structuring extracted data", icon: Database },
  { text: "Finalizing output", icon: CheckCircle2 },
];

interface AppraisalLoadingProps {
  currentThought?: string;
  modelName?: string;
}

export default function AppraisalLoading({
  currentThought = "",
  modelName = "Gemini AI",
}: AppraisalLoadingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll thoughts
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [currentThought]);

  // Cycle through mock steps
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= steps.length - 1) return prev;
        return prev + 1;
      });
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  const ActiveIcon = steps[currentStep].icon;

  return (
    <div className="flex items-center justify-center min-h-[80vh] w-full py-12 px-4">
      {/* Expanded Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-4xl z-10"
      >
        <div className="relative overflow-hidden rounded-[2rem] bg-white shadow-2xl shadow-blue-900/10 border border-slate-100">
          {/* Header Bar */}
          <div className="flex items-center justify-between px-8 py-6 border-b border-slate-50 bg-slate-50/50">
            <div className="flex items-center gap-4">
              <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-[#001F49] shadow-lg shadow-blue-900/20">
                <Sparkles className="w-5 h-5 text-[#00ADEF] animate-spin-slow" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#001F49] tracking-tight">
                  {modelName}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00ADEF] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00ADEF]"></span>
                  </span>
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Processing
                  </span>
                </div>
              </div>
            </div>

            <div className="px-4 py-1.5 rounded-full bg-slate-100 border border-slate-200">
              <span className="text-xs font-semibold text-slate-500">
                Phase {currentStep + 1} of {steps.length}
              </span>
            </div>
          </div>

          <div className="p-8 space-y-8 flex flex-col items-center text-center">
            {/* Active Step Header */}
            <div className="relative h-24 flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, scale: 0.8, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: -10 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="flex flex-col items-center gap-4"
                >
                  <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#001F49] flex items-center justify-center shadow-sm">
                    <ActiveIcon className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-[#001F49] mb-1">
                      {steps[currentStep].text}
                    </h2>
                    <p className="text-sm text-slate-400 font-medium animate-pulse">
                      Analyzing document context...
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="w-full h-px bg-slate-100" />

            {/* Thought Stream - Expanded Height and Hidden Scrollbar */}
            <div className="w-full relative group text-left">
              <div className="h-[400px] relative overflow-hidden rounded-xl bg-slate-50 border border-slate-100 shadow-inner">
                <div
                  ref={scrollRef}
                  className="absolute inset-0 overflow-y-auto p-6 font-mono text-sm leading-relaxed scroll-smooth no-scrollbar"
                  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                  {currentThought ? (
                    <div className="space-y-2">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] bg-blue-100 text-blue-700 font-bold mb-2">
                        STREAM LOG
                      </span>
                      <div className="whitespace-pre-wrap text-slate-600 break-words">
                        <span className="text-[#00ADEF] mr-2">›</span>
                        {currentThought}
                        <span className="inline-block w-2 h-4 bg-[#00ADEF] ml-1 animate-pulse align-middle" />
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400/70 italic gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Waiting for intelligence stream...</span>
                    </div>
                  )}

                  {/* Fade Out Bottom Overlay */}
                  <div className="sticky bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-slate-50 to-transparent pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          <div className="px-8 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-center gap-2 text-[10px] text-slate-400 uppercase tracking-widest font-medium">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Secure Enterprise Connection Active</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
