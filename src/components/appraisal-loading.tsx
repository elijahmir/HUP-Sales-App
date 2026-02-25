"use client";

import { useEffect, useState, useRef } from "react";
import {
  Sparkles,
  ScanLine,
  FileText,
  PenTool,
  Database,
  Code2,
} from "lucide-react";
import Carousel from "./Carousel";
import "@/components/Carousel.css";

interface AppraisalLoadingProps {
  currentThought?: string;
  modelName?: string;
  isComplete?: boolean;
  onAnimationComplete?: () => void;
}

const OCR_STAGES = [
  {
    id: 1,
    title: "Scanning Document",
    description: "Analyzing high-resolution image structure and layout.",
    icon: <ScanLine className="w-5 h-5 text-[#00ADEF]" />,
  },
  {
    id: 2,
    title: "Text Recognition",
    description: "Identifying printed text and handwritten notes.",
    icon: <FileText className="w-5 h-5 text-[#00ADEF]" />,
  },
  {
    id: 3,
    title: "Data Extraction",
    description: "Parsing checkboxes, selections, and structured fields.",
    icon: <Database className="w-5 h-5 text-[#00ADEF]" />,
  },
  {
    id: 4,
    title: "Handwriting Analysis",
    description: "Deciphering complex handwritten agent notes.",
    icon: <PenTool className="w-5 h-5 text-[#00ADEF]" />,
  },
  {
    id: 5,
    title: "Finalizing",
    description: "Formatting data into structured JSON for review.",
    icon: <Code2 className="w-5 h-5 text-[#00ADEF]" />,
  },
];

const PING_STYLES = `
  @keyframes ping-force {
    75%, 100% { transform: scale(2); opacity: 0; }
  }
  .animate-ping-force {
    animation: ping-force 1s cubic-bezier(0, 0, 0.2, 1) infinite !important;
  }
  @media (prefers-reduced-motion: reduce) {
    .animate-ping-force {
      animation-duration: 1s !important;
      transition-duration: 1s !important;
    }
  }
`;

export default function AppraisalLoading({
  currentThought = "",
  modelName = "Gemini AI",
  isComplete = false,
  onAnimationComplete,
}: AppraisalLoadingProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [hasCompletedThinking, setHasCompletedThinking] = useState(false);

  // Transition from Carousel "Spinning" to "Thinking" mode after 3.5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      // Only enter thinking mode if we haven't already finished everything fast
      if (!isComplete && !hasCompletedThinking) {
        setIsThinking(true);
      }
    }, 3500);
    return () => clearTimeout(timer);
  }, [isComplete, hasCompletedThinking]);

  // Handle "Resume" logic when streaming is complete
  useEffect(() => {
    if (isComplete) {
      if (isThinking) {
        // We were thinking, now we are done. Resume carousel.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsThinking(false);
        setHasCompletedThinking(true);
      }

      // Schedule the final completion signal
      // Give it 2.5s to show the last spin (visualizing "finishing up")
      const finishTimer = setTimeout(() => {
        if (onAnimationComplete) {
          onAnimationComplete();
        }
      }, 2500);

      return () => clearTimeout(finishTimer);
    }
  }, [isComplete, isThinking, onAnimationComplete]);

  // Auto-scroll thought stream
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [currentThought]);

  // The content to render INSIDE the center carousel card when in thinking mode
  const thinkingContent = (
    <div className="flex flex-col w-full h-full">
      {/* Header Section (Icon) */}
      <div className="carousel-item-header">
        <div className="carousel-icon-container bg-[#001F49]">
          <Sparkles className="carousel-icon text-[#00ADEF]" />
        </div>
      </div>

      {/* Content Body */}
      <div className="carousel-item-content w-full flex-1 flex flex-col p-5">
        <div className="carousel-item-title flex items-center gap-2 mb-2">
          <span>AI Analyzing</span>
          <span className="flex h-2 w-2 relative">
            <style>{PING_STYLES}</style>
            <span className="animate-ping-force absolute inline-flex h-full w-full rounded-full bg-[#00ADEF] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00ADEF]"></span>
          </span>
        </div>

        {/* Teleprompter Stream */}
        <div className="relative flex-1 bg-white/50 rounded-lg border border-slate-100/50 overflow-hidden min-h-[160px]">
          <div
            ref={scrollRef}
            className="absolute inset-0 overflow-y-auto p-3 font-mono text-sm leading-relaxed custom-scrollbar scroll-smooth text-slate-600"
          >
            {currentThought ? (
              <pre className="text-sm/6 font-mono text-cyan-700 whitespace-pre-wrap font-medium pb-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                {currentThought}
                <span className="inline-block w-1.5 h-4 bg-[#00ADEF] ml-1 animate-pulse align-middle rounded-sm" />
              </pre>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
                <span className="text-xs italic">
                  Connecting to {modelName}...
                </span>
              </div>
            )}
          </div>
          {/* Fade overlay */}
          <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-white/90 to-transparent pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-white/90 to-transparent pointer-events-none" />
        </div>

        <p className="carousel-item-description mt-3 text-xs text-center opacity-70">
          Generating structured data...
        </p>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] w-full py-8 px-4 gap-8">
      {/* 3D Carousel Section */}
      <div className="h-[350px] w-full flex items-center justify-center relative">
        <Carousel
          items={OCR_STAGES}
          baseWidth={320}
          autoplay={!isThinking} // Stop autoplay when thinking
          autoplayDelay={1500}
          pauseOnHover={false}
          loop={true}
          round={false}
          thinkingMode={isThinking} // Enable thinking mode to lock center & show content
          {...({ thinkingContent } as Record<string, unknown>)} // The content to inject
        />
      </div>
    </div>
  );
}
