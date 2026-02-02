"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  FileText,
  Sparkles,
  Clock,
  ArrowRight,
  Plus,
  Loader2,
  Bot,
  PenTool,
  Settings,
} from "lucide-react";
import AppraisalDetailsModal from "@/components/appraisal-details-modal";
import type { ListingData } from "@/lib/gemini-ocr";

interface Appraisal {
  id: string;
  created_at: string;
  address: string;
  vendor_name: string;
  agent_name: string;
  status: string;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const item = {
  hidden: { y: 16, opacity: 0 },
  show: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut" as const,
    },
  },
};

function getTimeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

export default function DashboardHub() {
  const [userEmail, setUserEmail] = useState<string>("");
  const [appraisals, setAppraisals] = useState<Appraisal[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState<Partial<ListingData> | null>(null);
  const [modalMeta, setModalMeta] = useState<
    { address: string; agent: string; date: string } | undefined
  >(undefined);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user?.email) setUserEmail(user.email);
    };

    const fetchAppraisals = async () => {
      try {
        const { data, error } = await supabase
          .from("sales_appraisals")
          .select("id, created_at, address, vendor_name, agent_name, status")
          .order("created_at", { ascending: false })
          .limit(8);

        if (error) throw error;
        if (data) setAppraisals(data);
      } catch (err) {
        console.error("Error fetching appraisals:", err);
      } finally {
        setLoading(false);
      }
    };

    getUser();
    fetchAppraisals();
  }, [supabase]);

  const handleAppraisalClick = async (appraisal: Appraisal) => {
    setDetailsLoading(true);
    try {
      const { data, error } = await supabase
        .from("sales_appraisals")
        .select("form_data")
        .eq("id", appraisal.id)
        .single();

      if (error) throw error;

      if (data && data.form_data) {
        setModalData(data.form_data);
        setModalMeta({
          address: appraisal.address,
          agent: appraisal.agent_name,
          date: appraisal.created_at,
        });
        setIsModalOpen(true);
      }
    } catch (err) {
      console.error("Failed to load details", err);
      alert("Could not load details for this appraisal.");
    } finally {
      setDetailsLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-8 w-full">
      <AppraisalDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        data={modalData}
        meta={modalMeta}
      />

      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-[#001F49] tracking-tight">
            Welcome back,{" "}
            <span className="text-[#00ADEF]">
              {userEmail ? userEmail.split("@")[0] : "Agent"}
            </span>
          </h1>
          <p className="text-slate-500 mt-2 text-lg">
            Your AI-powered command center for property appraisals.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full border border-emerald-100 self-start md:self-auto">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">
            System Active
          </span>
        </div>
      </div>

      {/* Bento Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 auto-rows-[minmax(280px,auto)]"
      >
        {/* HERO: Appraisal AI - 2 cols */}
        <motion.div variants={item} className="md:col-span-2 group relative">
          <Link href="/dashboard/appraisal" className="block h-full">
            <div className="relative h-full bg-gradient-to-br from-[#00ADEF] to-[#0088bc] rounded-2xl p-8 text-white overflow-hidden shadow-xl shadow-sky-500/20 transition-all duration-300 hover:shadow-2xl hover:shadow-sky-500/30 hover:-translate-y-1 flex flex-col justify-between border border-sky-400/20">
              {/* Content */}
              <div className="relative z-10 flex flex-col gap-5">
                <div className="inline-flex items-center gap-2 self-start bg-white/15 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/20">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    Featured Tool
                  </span>
                </div>

                <div className="space-y-2">
                  <h2 className="font-display text-3xl font-bold tracking-tight">
                    Appraisal AI
                  </h2>
                  <p className="text-sky-100 text-base max-w-md leading-relaxed">
                    Instantly extract property data from listing sheets using
                    Gemini AI vision.
                  </p>
                </div>
              </div>

              <div className="relative z-10 mt-6 pt-5 border-t border-white/15 flex items-center justify-between group-hover:border-white/25 transition-colors">
                <span className="font-semibold text-base">Launch Tool</span>
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white group-hover:text-[#00ADEF] transition-all duration-300">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>

              {/* Decorative Icon */}
              <div className="absolute -right-8 -bottom-8 opacity-10 transform rotate-12 group-hover:rotate-6 group-hover:scale-110 transition-all duration-500">
                <FileText className="w-56 h-56" />
              </div>
            </div>
          </Link>
        </motion.div>

        {/* SAA Form - New */}
        <motion.div variants={item} className="md:col-span-2 group relative">
          <Link href="/dashboard/saa" className="block h-full">
            <div className="relative h-full bg-gradient-to-br from-[#00ADEF]/5 to-emerald-500/5 rounded-2xl p-8 overflow-hidden shadow-sm border border-emerald-500/20 transition-all duration-300 hover:shadow-md hover:border-emerald-500/30 hover:-translate-y-1 flex flex-col justify-between">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <FileText className="w-32 h-32 text-emerald-600" />
              </div>

              {/* Content */}
              <div className="relative z-10 flex flex-col gap-5">
                <div className="inline-flex items-center gap-2 self-start bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                    New Feature
                  </span>
                </div>

                <div className="space-y-2">
                  <h2 className="font-display text-2xl font-bold tracking-tight text-[#001F49]">
                    Sole Agency Agreement
                  </h2>
                  <p className="text-slate-500 text-base max-w-md leading-relaxed">
                    Create compliant digital agency agreements with DocuSign
                    integration in minutes.
                  </p>
                </div>
              </div>

              <div className="relative z-10 mt-6 pt-5 border-t border-emerald-100 flex items-center justify-between group-hover:border-emerald-200 transition-colors">
                <span className="font-semibold text-base text-emerald-700">
                  Create Agreement
                </span>
                <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-200 group-hover:text-emerald-800 transition-all duration-300">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Recent Activity - 2 cols */}
        <motion.div variants={item} className="xl:col-span-2 relative">
          <div className="h-full bg-white rounded-2xl p-6 border border-slate-200 shadow-sm transition-all hover:shadow-md flex flex-col relative">
            {/* Loading overlay */}
            {detailsLoading && (
              <div className="absolute inset-0 bg-white/60 z-20 flex items-center justify-center backdrop-blur-sm rounded-2xl">
                <Loader2 className="w-6 h-6 animate-spin text-[#00ADEF]" />
              </div>
            )}

            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                  <Clock className="w-4 h-4" />
                </div>
                <h3 className="font-display text-lg font-bold text-[#001F49]">
                  Recent Appraisals
                </h3>
              </div>
              <button className="text-xs font-semibold text-[#00ADEF] hover:bg-sky-50 px-2.5 py-1.5 rounded-lg transition-colors uppercase tracking-wide">
                View All
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-2">
              {loading ? (
                <div className="flex items-center justify-center h-40 text-slate-400">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
              ) : appraisals.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-slate-400 text-sm">
                  <FileText className="w-6 h-6 mb-2 opacity-30" />
                  No appraisals yet
                </div>
              ) : (
                appraisals.map((appraisal) => (
                  <button
                    key={appraisal.id}
                    onClick={() => handleAppraisalClick(appraisal)}
                    className="w-full group flex items-center gap-3 p-3 rounded-xl bg-slate-50/50 hover:bg-white border border-transparent hover:border-slate-200 hover:shadow-sm transition-all text-left"
                  >
                    <div className="w-9 h-9 rounded-full bg-[#00ADEF]/10 flex items-center justify-center text-[#00ADEF] font-bold text-xs flex-shrink-0">
                      {appraisal.agent_name
                        ? appraisal.agent_name.slice(0, 2).toUpperCase()
                        : "AG"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-[#001F49] text-sm group-hover:text-[#00ADEF] transition-colors truncate">
                        {appraisal.address || "Unknown Address"}
                      </h4>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                        <span className="truncate">
                          {appraisal.vendor_name || "No Vendor"}
                        </span>
                        <span>•</span>
                        <span className="flex-shrink-0">
                          {getTimeAgo(appraisal.created_at)}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        appraisal.status === "completed"
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-amber-50 text-amber-600"
                      }`}
                    >
                      <span
                        className={`w-1 h-1 rounded-full ${
                          appraisal.status === "completed"
                            ? "bg-emerald-500"
                            : "bg-amber-500"
                        }`}
                      />
                      {appraisal.status}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </motion.div>

        {/* Sally AI - Coming Soon */}
        <motion.div variants={item} className="group relative">
          <div className="h-full bg-white rounded-2xl p-6 border border-slate-200 shadow-sm transition-all duration-300 hover:shadow-md hover:border-rose-200 relative overflow-hidden flex flex-col justify-between">
            <div className="absolute -top-12 -right-12 opacity-[0.03]">
              <Bot className="w-36 h-36" />
            </div>

            <div className="space-y-4 relative z-10">
              <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-500">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-[#001F49] mb-1.5">
                  Sally
                </h3>
                <p className="text-slate-500 leading-relaxed text-sm">
                  AI Sales Assistant for automated client communication.
                </p>
              </div>
            </div>

            <div className="mt-6">
              <span className="inline-flex px-2.5 py-1 rounded-md bg-slate-100 text-slate-500 text-[10px] font-semibold uppercase tracking-wider">
                Coming Soon
              </span>
            </div>
          </div>
        </motion.div>

        {/* CopyPro - Coming Soon */}
        <motion.div variants={item} className="group relative">
          <div className="h-full bg-white rounded-2xl p-6 border border-slate-200 shadow-sm transition-all duration-300 hover:shadow-md hover:border-violet-200 relative overflow-hidden flex flex-col justify-between">
            <div className="absolute -top-12 -right-12 opacity-[0.03]">
              <PenTool className="w-36 h-36" />
            </div>

            <div className="space-y-4 relative z-10">
              <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center text-violet-500">
                <PenTool className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-[#001F49] mb-1.5">
                  CopyPro
                </h3>
                <p className="text-slate-500 leading-relaxed text-sm">
                  Generate compelling listing descriptions in seconds.
                </p>
              </div>
            </div>

            <div className="mt-6">
              <span className="inline-flex px-2.5 py-1 rounded-md bg-slate-100 text-slate-500 text-[10px] font-semibold uppercase tracking-wider">
                Coming Soon
              </span>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions - 2 cols */}
        <motion.div variants={item} className="md:col-span-2 xl:col-span-2">
          <div className="h-full bg-[#001F49] rounded-2xl p-6 sm:p-8 text-white shadow-xl flex flex-col justify-between relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#00ADEF]/15 rounded-full blur-[80px]" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#000F24]/60 to-transparent" />

            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center gap-2.5 mb-6">
                <div className="p-2 bg-white/10 rounded-lg">
                  <Settings className="w-4 h-4 text-sky-300" />
                </div>
                <h3 className="font-display text-lg font-bold">
                  Quick Actions
                </h3>
              </div>

              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Link
                  href="/dashboard/appraisal"
                  className="flex flex-col p-5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all hover:-translate-y-0.5 group"
                >
                  <div className="w-9 h-9 rounded-lg bg-sky-500/20 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <Plus className="w-4 h-4 text-sky-300" />
                  </div>
                  <span className="font-semibold text-sm text-white">
                    Start Appraisal
                  </span>
                  <span className="text-xs text-slate-400 mt-1">
                    Upload & process listing
                  </span>
                </Link>

                <Link
                  href="/dashboard/settings"
                  className="flex flex-col p-5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all hover:-translate-y-0.5 group"
                >
                  <div className="w-9 h-9 rounded-lg bg-sky-500/20 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <Settings className="w-4 h-4 text-sky-300" />
                  </div>
                  <span className="font-semibold text-sm text-white">
                    Settings
                  </span>
                  <span className="text-xs text-slate-400 mt-1">
                    Manage configuration
                  </span>
                </Link>
              </div>

              <div className="mt-6 pt-5 border-t border-white/10 text-center">
                <p className="text-[11px] text-slate-500">HUP Sales App v1.0</p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
