"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Cpu,
  Zap,
  Eye,
  CheckCircle,
  AlertTriangle,
  Loader2,
  ShieldCheck,
  DollarSign,
} from "lucide-react";

import {
  DEFAULT_MODEL,
  AVAILABLE_MODELS,
  type AIModel,
} from "@/lib/model-config";

export default function SettingsPage() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [activeModelId, setActiveModelId] = useState<string>(
    "gemini-3-flash-preview",
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    checkAdminAndFetchSettings();
  }, []);

  async function checkAdminAndFetchSettings() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      // Check Profile Role
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role !== "admin") {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      setIsAdmin(true);

      // Fetch Current Setting
      const { data: setting } = await supabase
        .from("app_settings")
        .select("value")
        .eq("key", "ai_model_config")
        .single();

      if (setting?.value?.modelId) {
        setActiveModelId(setting.value.modelId);
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    } finally {
      setLoading(false);
    }
  }

  async function saveModelParams(modelId: string) {
    setSaving(true);
    try {
      const { error } = await supabase.from("app_settings").upsert({
        key: "ai_model_config",
        value: { modelId: modelId, updatedAt: new Date().toISOString() },
        updated_by: (await supabase.auth.getUser()).data.user?.id,
      });

      if (error) throw error;
      setActiveModelId(modelId);
    } catch (err) {
      console.error("Failed to save model:", err);
      alert("Failed to update model settings.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
        <ShieldCheck className="w-16 h-16 text-gray-300" />
        <h1 className="text-2xl font-bold text-gray-800">Access Restricted</h1>
        <p className="text-gray-500">
          Only Admin users can configure AI settings.
        </p>
        <button
          onClick={() => router.push("/dashboard")}
          className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  // Find active model details for cost calc
  const activeModel =
    AVAILABLE_MODELS.find((m) => m.id === activeModelId) || AVAILABLE_MODELS[0];
  const estAppraisalCost =
    (activeModel.inputCost / 1000000) * 5000 +
    (activeModel.outputCost / 1000000) * 1000; // 5k tokens in, 1k out approx

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 pb-32">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
          AI Configuration
        </h1>
        <p className="text-slate-500 text-lg">
          Manage the brain powering your Appraisal tools.
        </p>
      </div>

      {/* Active Status Card */}
      <div className="bg-gradient-to-br from-blue-900 to-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full filter blur-3xl -translate-y-1/2 translate-x-1/2" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-blue-500/30 border border-blue-400/30 text-blue-200 text-xs font-semibold uppercase tracking-wider">
                Current Core Model
              </span>
              {activeModel.preview && (
                <span className="px-3 py-1 rounded-full bg-yellow-500/30 border border-yellow-400/30 text-yellow-200 text-xs font-semibold uppercase tracking-wider">
                  Preview
                </span>
              )}
            </div>
            <h2 className="text-4xl font-bold mb-2">{activeModel.name}</h2>
            <p className="text-blue-200/80 max-w-xl text-lg">
              {activeModel.description}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 min-w-[240px]">
            <div className="flex items-center gap-2 text-blue-200 mb-4">
              <DollarSign className="w-5 h-5" />
              <span className="font-medium">Est. Cost / Appraisal</span>
            </div>
            <div className="text-3xl font-bold">
              ${estAppraisalCost.toFixed(4)}
            </div>
            <div className="text-xs text-blue-300/60 mt-1">
              Based on ~6k combined tokens
            </div>
          </div>
        </div>
      </div>

      {/* Models Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {AVAILABLE_MODELS.map((model) => {
          const isActive = activeModelId === model.id;
          return (
            <motion.div
              key={model.id}
              whileHover={{ y: -4 }}
              className={`
                relative group rounded-2xl p-6 border-2 transition-all cursor-pointer bg-white
                ${
                  isActive
                    ? "border-blue-500 shadow-xl shadow-blue-500/10 ring-4 ring-blue-500/5"
                    : "border-slate-100 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-900/5"
                }
              `}
              onClick={() => saveModelParams(model.id)}
            >
              {/* Active Badge */}
              {isActive && (
                <div className="absolute top-4 right-4 text-blue-500">
                  <CheckCircle className="w-6 h-6 fill-blue-50 text-blue-600" />
                </div>
              )}

              {/* Icon & Title */}
              <div className="mb-4">
                <div
                  className={`
                  w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-white shadow-lg
                  ${isActive ? "bg-blue-600" : "bg-slate-900 group-hover:bg-blue-600 transition-colors"}
                `}
                >
                  <Cpu className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">
                  {model.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    {model.bestFor}
                  </span>
                </div>
              </div>

              <p className="text-slate-500 text-sm mb-6 h-10 leading-relaxed">
                {model.description}
              </p>

              {/* Specs */}
              <div className="space-y-3 pt-6 border-t border-slate-100">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Eye className="w-4 h-4 text-purple-500" />
                    <span>Multimodal</span>
                  </div>
                  {model.multimodal ? (
                    <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                      Supported
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">
                      Text Only
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <span>Speed</span>
                  </div>
                  <span className="text-slate-900 font-medium">
                    {model.name.includes("Flash") ? "Ultra Fast" : "Standard"}
                  </span>
                </div>

                <div className="flex flex-col gap-1.5 text-xs bg-slate-50 p-3 rounded-lg mt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Input (1M Tokens)</span>
                    <span className="font-mono text-slate-700 font-medium">
                      ${model.inputCost.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-t border-slate-200 pt-1.5">
                    <span className="text-slate-500">Output (1M Tokens)</span>
                    <span className="font-mono text-slate-700 font-medium">
                      ${model.outputCost.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Activate Button (if not active) */}
              {!isActive && (
                <div className="mt-6 pt-2">
                  <button className="w-full py-2 rounded-lg bg-slate-50 text-slate-600 font-medium group-hover:bg-blue-50 group-hover:text-blue-600 transition-all text-sm">
                    Switch to {model.name.split(" ")[1]}
                  </button>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Warnings / Footer */}
      <div className="mt-12 p-6 bg-amber-50 rounded-xl border border-amber-100 flex gap-4 items-start">
        <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
        <div>
          <h4 className="font-bold text-amber-800">Administrator Notice</h4>
          <p className="text-amber-700/80 text-sm mt-1 leading-relaxed">
            Changing the active model affects all appraisal operations
            immediately. Preview models (`*-preview`) may have rate limits but
            offer latest features. Production environments should typically use
            standard `Pro` or `Flash` variants unless testing.
          </p>
        </div>
      </div>
    </div>
  );
}
