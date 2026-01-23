"use client";

import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import { useState } from "react";
import { Loader2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleLogin = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "azure",
        options: {
          scopes: "email openid profile offline_access",
          redirectTo: `${location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error("Login Error:", error);
      alert("Failed to initiate login");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#001F49] relative overflow-hidden">
      {/* Background Gradients - Subtle only at bottom */}
      <div className="absolute top-0 left-0 w-full h-full opacity-30">
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-[#0055AA] rounded-full blur-[120px] mix-blend-screen opacity-50" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
        className="w-full max-w-md relative z-10 p-6"
      >
        <div className="bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden p-8 sm:p-12 text-center">
          {/* Logo Wrapper - White Pill for Contrast */}
          <div className="bg-white rounded-full py-4 px-8 mb-10 w-48 mx-auto shadow-lg flex items-center justify-center">
            <div className="relative w-full h-8">
              <Image
                src="https://resources.cloudhi.io/images/logo/harcourts-international-logo.svg"
                alt="Harcourts"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
            Sales App
          </h1>
          <p className="text-blue-200 mb-10 text-lg font-light">
            Enterprise AI Automation & Appraisal CRM
          </p>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-4 px-6 bg-[#00ADEF] hover:bg-[#0090C5] text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-500/30 flex items-center justify-center gap-3 group"
          >
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <svg
                className="w-5 h-5 mr-1"
                viewBox="0 0 23 23"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path fill="#f35325" d="M1 1h10v10H1z" />
                <path fill="#81bc06" d="M12 1h10v10H12z" />
                <path fill="#05a6f0" d="M1 12h10v10H1z" />
                <path fill="#ffba08" d="M12 12h10v10H12z" />
              </svg>
            )}
            <span>Sign in with Microsoft</span>
            {!loading && (
              <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            )}
          </button>

          <div className="mt-8 pt-8 border-t border-white/10 text-xs text-blue-300">
            <p>Protected by Enterprise SSO. Authorized Personnel Only.</p>
            <p className="mt-2 text-blue-400/60">
              Harcourts Ulverstone & Penguin
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
