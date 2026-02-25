import { useEffect, useState } from "react";

interface LoadingModalProps {
  isOpen: boolean;
}

export function LoadingModal({ isOpen }: LoadingModalProps) {
  const [displayText, setDisplayText] = useState("");
  const fullText = "Please wait while we generate your agreement...";

  useEffect(() => {
    if (!isOpen) {
      setDisplayText("");
      return;
    }

    let index = 0;
    const interval = setInterval(() => {
      if (index <= fullText.length) {
        setDisplayText(fullText.slice(0, index));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 50); // Typewriter speed

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Glassmorphism Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-harcourts-navy/30 via-harcourts-blue/20 to-gray-900/30 backdrop-blur-md" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Loading GIF Container */}
        <div className="mb-8 rounded-2xl bg-white/10 backdrop-blur-sm p-6 shadow-2xl border border-white/20">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/the-form-logiGIF.gif"
            alt="Loading..."
            className="w-full max-w-md h-auto rounded-lg"
            style={{ maxHeight: "450px", objectFit: "contain" }}
          />
        </div>

        {/* Typewriter Text */}
        <div className="text-center">
          <p className="text-xl md:text-2xl font-semibold text-white drop-shadow-lg min-h-[2rem]">
            {displayText}
            <span className="animate-pulse">|</span>
          </p>
          <p className="text-sm text-white/80 mt-3">
            This may take a few moments
          </p>
        </div>

        {/* Animated Dots */}
        <div className="flex gap-2 mt-6">
          <div
            className="w-3 h-3 bg-white/60 rounded-full animate-bounce"
            style={{ animationDelay: "0ms" }}
          />
          <div
            className="w-3 h-3 bg-white/60 rounded-full animate-bounce"
            style={{ animationDelay: "150ms" }}
          />
          <div
            className="w-3 h-3 bg-white/60 rounded-full animate-bounce"
            style={{ animationDelay: "300ms" }}
          />
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-bounce {
          animation: bounce 1s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
