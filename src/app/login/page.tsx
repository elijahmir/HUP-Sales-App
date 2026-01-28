"use client";

import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import { useState } from "react";
import { Loader2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import ShinyText from "@/components/ShinyText";
import "@/components/ShinyText.css";

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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#001F49]">
      {/* Background Pattern - Subtle geometric */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Gradient Orbs */}
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[#00ADEF]/20 rounded-full blur-[150px] translate-x-1/4 translate-y-1/4" />
      <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-[#002d6a]/30 rounded-full blur-[120px] -translate-x-1/4 -translate-y-1/4" />

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="bg-white rounded-3xl shadow-2xl p-10 sm:p-12">
          {/* Logo */}
          <div className="flex justify-center mb-10">
            <div className="relative w-44 h-10">
              <Image
                src="https://resources.cloudhi.io/images/logo/harcourts-international-logo.svg"
                alt="Harcourts"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>

          {/* Title with ShinyText */}
          <div className="text-center mb-10">
            <h1 className="font-display text-3xl font-bold text-[#001F49] tracking-tight mb-3 flex items-center justify-center gap-1">
              <ShinyText
                text="Sales"
                speed={3}
                color="#001F49"
                shineColor="#00ADEF"
                spread={100}
                className="font-display text-3xl font-bold"
              />
              <span> App</span>
            </h1>
            <p className="text-slate-500 text-lg">
              Your All-in-One Sales Toolkit
            </p>
          </div>

          {/* SSO Button */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="group w-full py-4 px-6 bg-[#001F49] hover:bg-[#002a60] text-white font-semibold rounded-xl transition-all duration-200 ease-out shadow-lg shadow-slate-900/20 hover:shadow-xl hover:shadow-slate-900/30 active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <svg
                className="w-5 h-5"
                viewBox="0 0 23 23"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path fill="#f35325" d="M1 1h10v10H1z" />
                <path fill="#81bc06" d="M12 1h10v10H12z" />
                <path fill="#05a6f0" d="M1 12h10v10H1z" />
                <path fill="#ffba08" d="M12 12h10v10H12z" />
              </svg>
            )}
            <span>Sign in with Microsoft</span>
            {!loading && (
              <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
            )}
          </button>

          {/* Footer */}
          <div className="mt-10 pt-8 border-t border-slate-100">
            <p className="text-center text-sm text-slate-400">
              Protected by Enterprise Single Sign-On
            </p>
            <p className="text-center text-xs text-slate-300 mt-2">
              Harcourts Ulverstone &amp; Penguin
            </p>
          </div>
        </div>

        {/* Bottom Accent */}
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-[#00ADEF] to-transparent rounded-full opacity-60" />
      </motion.div>
    </div>
  );
}
