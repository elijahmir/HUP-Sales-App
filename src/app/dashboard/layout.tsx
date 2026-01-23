"use client";

import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { LogOut, Home } from "lucide-react";
import {
  motion,
  useScroll,
  useMotionValue,
  useTransform,
  useMotionTemplate,
} from "framer-motion";
import { useEffect } from "react";

function useBoundedScroll(threshold: number) {
  const { scrollY } = useScroll();
  const scrollYBounded = useMotionValue(0);
  const scrollYBoundedProgress = useTransform(
    scrollYBounded,
    [0, threshold],
    [0, 1],
  );

  useEffect(() => {
    return scrollY.on("change", (current) => {
      const previous = scrollY.getPrevious() || 0;
      const diff = current - previous;
      const newScrollYBounded = scrollYBounded.get() + diff;
      scrollYBounded.set(Math.min(Math.max(newScrollYBounded, 0), threshold));
    });
  }, [threshold, scrollY, scrollYBounded]);

  return { scrollYBoundedProgress };
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const router = useRouter();
  const { scrollYBoundedProgress } = useBoundedScroll(150);

  // Header slide up/down logic
  // 0 = visible, 1 = hidden
  const headerY = useTransform(scrollYBoundedProgress, [0, 1], [0, -100]);
  const headerOpacity = useTransform(scrollYBoundedProgress, [0, 1], [1, 0.5]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Animated Header */}
      <motion.header
        style={{
          y: headerY,
          opacity: headerOpacity,
        }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl shadow-sm border-b border-gray-200/50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo Area */}
            <Link
              href="/dashboard"
              className="group flex items-center gap-4 hover:opacity-100 transition-opacity"
            >
              <div className="relative w-32 sm:w-40 h-10 transition-transform duration-300 group-hover:scale-105">
                <Image
                  src="https://resources.cloudhi.io/images/logo/harcourts-international-logo.svg"
                  alt="Harcourts"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <span className="text-[#00ADEF] font-semibold text-lg hidden sm:block border-l-2 pl-4 border-gray-200 tracking-tight">
                Sales App
              </span>
            </Link>

            {/* Action Area */}
            <div className="flex items-center gap-2 sm:gap-4">
              <Link
                href="/dashboard"
                className="p-3 text-gray-500 hover:text-[#00ADEF] hover:bg-blue-50 rounded-full transition-all duration-200 active:scale-95"
                title="Dashboard Home"
              >
                <Home className="w-5 h-5" />
              </Link>

              <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>

              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 text-gray-600 hover:text-[#001F49] hover:bg-gray-100 px-4 py-2.5 rounded-full transition-all duration-200 active:scale-95 font-medium text-sm group"
              >
                <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content Area - Added padding-top to account for fixed header */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-40 transition-all duration-300 ease-in-out slide-in-from-bottom-4 duration-700">
        {children}
      </main>

      {/* Simplified Footer */}
      <footer className="py-6 text-center text-gray-400 text-sm">
        <p>
          &copy; {new Date().getFullYear()} Harcourts Ulverstone & Penguin.
          Powered by AI.
        </p>
      </footer>
    </div>
  );
}
