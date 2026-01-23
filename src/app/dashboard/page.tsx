"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion"; // Added AnimatePresence
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  FileText,
  Sparkles,
  TrendingUp,
  Users,
  Settings,
  Clock,
  ArrowRight,
  Plus,
  Loader2,
  Calendar,
  Bot,
  PenTool,
} from "lucide-react";
import AppraisalDetailsModal from "@/components/appraisal-details-modal";
import type { ListingData } from "@/lib/gemini-ocr";

// Types
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
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 },
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

  // Modal State
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
          .limit(10);

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
      // Fetch full data
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
    <div className="space-y-8 pb-12 w-full max-w-[1600px] mx-auto">
      <AppraisalDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        data={modalData}
        meta={modalMeta}
      />

      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-100 pb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#001F49] tracking-tight">
            Welcome back,{" "}
            <span className="text-[#00ADEF]">
              {userEmail ? userEmail.split("@")[0] : "Agent"}
            </span>
          </h1>
          <p className="text-gray-500 mt-3 text-lg font-medium">
            Your command center for property appraisals and sales.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-full border border-green-100 self-start md:self-auto">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
          </span>
          <span className="text-xs font-bold text-green-700 uppercase tracking-wide">
            System Active
          </span>
        </div>
      </div>

      {/* Bento Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 auto-rows-[minmax(360px,auto)]"
      >
        {/* Main Feature: Appraisal AI - Spans 2 cols */}
        <motion.div
          variants={item}
          className="md:col-span-2 row-span-1 lg:row-span-1 group relative z-0 hover:z-10"
        >
          <Link href="/dashboard/appraisal" className="block h-full w-full">
            <div className="relative h-full w-full bg-gradient-to-br from-[#00ADEF] to-[#0099D4] rounded-2xl p-8 sm:p-10 text-white overflow-hidden shadow-xl shadow-blue-200/50 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-300/50 hover:scale-[1.01] hover:-translate-y-1 flex flex-col justify-between border border-blue-400/20">
              <div className="relative z-10 flex flex-col gap-6">
                <div className="inline-flex items-center gap-3 self-start bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-white">
                    Featured Tool
                  </span>
                </div>

                <div className="space-y-3">
                  <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
                    Appraisal AI
                  </h2>
                  <p className="text-blue-50/90 text-lg max-w-md font-medium leading-relaxed">
                    Generate instant property appraisals from listing sheets
                    using advanced Gemini 3 Pro AI.
                  </p>
                </div>
              </div>

              <div className="relative z-10 mt-8 pt-6 border-t border-white/10 flex items-center justify-between group-hover:border-white/20 transition-colors">
                <span className="font-bold text-lg tracking-wide">
                  Launch Tool
                </span>
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:bg-white group-hover:text-[#00ADEF] transition-all duration-300">
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>

              {/* Decorative Background Icon */}
              <div className="absolute -right-12 -bottom-12 opacity-10 transform rotate-12 group-hover:rotate-0 group-hover:scale-110 transition-all duration-700 ease-out">
                <FileText className="w-80 h-80" />
              </div>
            </div>
          </Link>
        </motion.div>

        {/* List: Real Recent Activity */}
        <motion.div
          variants={item}
          className="lg:col-span-2 relative z-0 hover:z-10"
        >
          <div className="h-full bg-white rounded-2xl p-8 border border-gray-100 shadow-sm transition-all hover:shadow-md flex flex-col hover:border-blue-100 relative">
            {/* Loading overlay for details */}
            {detailsLoading && (
              <div className="absolute inset-0 bg-white/50 z-20 flex items-center justify-center backdrop-blur-sm rounded-2xl">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            )}

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-50 rounded-lg text-gray-400">
                  <Clock className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-[#001F49]">
                  Recent Appraisals
                </h3>
              </div>
              <button className="text-xs font-bold text-[#00ADEF] hover:bg-blue-50 px-3 py-1.5 rounded-md transition-colors uppercase tracking-wide">
                View All
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
              {loading ? (
                <div className="flex items-center justify-center h-48 text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : appraisals.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-slate-400 text-sm">
                  <FileText className="w-8 h-8 mb-2 opacity-20" />
                  No appraisals found.
                </div>
              ) : (
                appraisals.map((appraisal) => (
                  <div
                    key={appraisal.id}
                    onClick={() => handleAppraisalClick(appraisal)}
                    className="group flex items-center gap-4 p-4 rounded-xl bg-gray-50/50 hover:bg-white border border-transparent hover:border-gray-100 hover:shadow-sm transition-all cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#00ADEF]/10 flex items-center justify-center text-[#00ADEF] font-bold text-xs ring-2 ring-white">
                      {appraisal.agent_name
                        ? appraisal.agent_name.slice(0, 2).toUpperCase()
                        : "AG"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-[#001F49] text-sm group-hover:text-[#00ADEF] transition-colors truncate">
                        {appraisal.address || "Unknown Address"}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                        <span>{appraisal.vendor_name || "No Vendor"}</span>
                        <span className="text-gray-300">•</span>
                        <span>{getTimeAgo(appraisal.created_at)}</span>
                      </div>
                    </div>
                    <div className="hidden sm:block">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                          appraisal.status === "completed"
                            ? "bg-green-50 text-green-700 border-green-100"
                            : "bg-yellow-50 text-yellow-700 border-yellow-100"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            appraisal.status === "completed"
                              ? "bg-green-500"
                              : "bg-yellow-500"
                          }`}
                        ></span>
                        {appraisal.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </motion.div>

        {/* Secondary: Sally AI Agent */}
        <motion.div variants={item} className="group relative z-0 hover:z-10">
          <div className="h-full bg-white rounded-2xl p-8 border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-xl hover:border-pink-100 hover:-translate-y-1 relative overflow-hidden flex flex-col justify-between">
            <div className="absolute -top-16 -right-16 opacity-[0.03] rotate-12 transition-transform group-hover:rotate-6">
              <Bot className="w-48 h-48" />
            </div>

            <div className="space-y-4 relative z-10">
              <div className="w-12 h-12 bg-pink-50 rounded-xl flex items-center justify-center text-pink-500 ring-4 ring-pink-50/50">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#001F49] mb-2">Sally</h3>
                <p className="text-gray-500 leading-relaxed text-sm">
                  Your dedicated AI Sales Listing Agent. Automates client
                  communication and follow-ups.
                </p>
              </div>
            </div>

            <div className="mt-8">
              <span className="inline-block px-3 py-1 rounded bg-pink-50 text-pink-600 text-[10px] font-bold uppercase tracking-wider border border-pink-100">
                Coming Soon
              </span>
            </div>
          </div>
        </motion.div>

        {/* Secondary: CopyPro */}
        <motion.div variants={item} className="group relative z-0 hover:z-10">
          <div className="h-full bg-white rounded-2xl p-8 border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-xl hover:border-indigo-100 hover:-translate-y-1 relative overflow-hidden flex flex-col justify-between">
            <div className="absolute -top-16 -right-16 opacity-[0.03] rotate-12 transition-transform group-hover:rotate-6">
              <PenTool className="w-48 h-48" />
            </div>

            <div className="space-y-4 relative z-10">
              <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-500 ring-4 ring-indigo-50/50">
                <PenTool className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#001F49] mb-2">
                  CopyPro
                </h3>
                <p className="text-gray-500 leading-relaxed text-sm">
                  AI-powered listing content generation. Create compelling copy
                  in seconds.
                </p>
              </div>
            </div>

            <div className="mt-8">
              <span className="inline-block px-3 py-1 rounded bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-wider border border-indigo-100">
                Coming Soon
              </span>
            </div>
          </div>
        </motion.div>

        {/* Quick Tools */}
        <motion.div
          variants={item}
          className="lg:col-span-2 relative z-0 hover:z-10"
        >
          <div className="h-full w-full bg-[#001F49] rounded-2xl p-8 sm:p-10 text-white shadow-xl flex flex-col justify-between relative overflow-hidden border border-blue-900/50">
            <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#00ADEF]/20 rounded-full blur-[100px]"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#000F24] to-transparent opacity-60"></div>

            <div className="relative z-10 w-full h-full flex flex-col">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-white/10 rounded-lg">
                  <Settings className="w-5 h-5 text-blue-200" />
                </div>
                <h3 className="text-lg font-bold">Quick Actions</h3>
              </div>

              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 content-start">
                <Link
                  href="/dashboard/appraisal"
                  className="flex flex-col p-5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all hover:-translate-y-1 hover:shadow-lg group"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Plus className="w-5 h-5 text-blue-300 group-hover:text-white" />
                  </div>
                  <span className="font-bold text-base text-white group-hover:text-blue-200 transition-colors">
                    Start Appraisal
                  </span>
                  <span className="text-xs text-gray-400 mt-1">
                    Upload & process new listing
                  </span>
                </Link>

                <Link
                  href="/dashboard/settings"
                  className="flex flex-col p-5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all hover:-translate-y-1 hover:shadow-lg group"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Settings className="w-5 h-5 text-blue-300 group-hover:text-white" />
                  </div>
                  <span className="font-bold text-base text-white group-hover:text-blue-200 transition-colors">
                    Settings
                  </span>
                  <span className="text-xs text-gray-400 mt-1">
                    Manage app configuration
                  </span>
                </Link>
              </div>

              <div className="mt-8 pt-6 border-t border-white/5 text-center">
                <p className="text-[11px] text-gray-500 font-medium">
                  Harcourts Sales App v1.0
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
