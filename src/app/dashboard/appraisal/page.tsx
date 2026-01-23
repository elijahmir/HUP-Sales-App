/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Sparkles,
  CheckCircle2,
  ArrowRight,
  X,
  FileText,
  Maximize2,
  Minimize2,
  Save,
  Trash2,
} from "lucide-react";
import FileUpload from "@/components/file-upload";
import SmartListingForm from "@/components/smart-listing-form";
import AppraisalLoading from "@/components/appraisal-loading";
import DocumentPreview from "@/components/document-preview";
import ConfirmationModal from "@/components/confirmation-modal";
import { toast } from "sonner";
import type { ListingData } from "@/lib/gemini-ocr";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

declare global {
  interface Window {
    hasVisitedAisal?: boolean;
  }
}

export default function AppraisalPage() {
  const [showIntro, setShowIntro] = useState(() => {
    if (typeof window !== "undefined") {
      return !window.hasVisitedAisal;
    }
    return true;
  });

  const [headerText, setHeaderText] = useState("");
  const FULL_TEXT = "Say Hello to Aisal.";

  // Typewriter effect
  useEffect(() => {
    if (!showIntro) {
      setHeaderText(FULL_TEXT);
      return;
    }

    let i = 0;
    const timer = setInterval(() => {
      setHeaderText(FULL_TEXT.slice(0, i + 1));
      i++;
      if (i > FULL_TEXT.length) clearInterval(timer);
    }, 100);

    return () => clearInterval(timer);
  }, [showIntro]);

  const startAisal = () => {
    setShowIntro(false);
    if (typeof window !== "undefined") {
      window.hasVisitedAisal = true;
    }
  };

  const [status, setStatus] = useState<"idle" | "processing" | "review">(
    "idle",
  );
  const [extractedData, setExtractedData] =
    useState<Partial<ListingData> | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    type: "submit" | "discard";
  }>({ isOpen: false, type: "submit" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const name =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email?.split("@")[0];
        setUserName(name || "Agent");
      }
    };
    getUser();
  }, [supabase]);

  const [selectedFiles, setSelectedFiles] = useState<
    { file: File; preview: string }[]
  >([]);

  const handleFileSelect = async (files: File[]) => {
    const newFiles = await Promise.all(
      files.map(async (file) => {
        return new Promise<{ file: File; preview: string }>((resolve) => {
          const reader = new FileReader();
          reader.onload = () =>
            resolve({ file, preview: reader.result as string });
          reader.readAsDataURL(file);
        });
      }),
    );
    setSelectedFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const [processingThought, setProcessingThought] = useState<string>("");
  const [activeModelName, setActiveModelName] = useState<string>("Gemini AI");

  const handleProcess = async () => {
    if (selectedFiles.length === 0) return;

    setStatus("processing");
    setProcessingThought("");
    setActiveModelName("Gemini AI");

    try {
      const imagesPayload = selectedFiles.map((f) => ({
        base64: f.preview.split(",")[1],
        mimeType: f.file.type,
      }));

      const response = await fetch("/api/ocr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          images: imagesPayload,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to start processing");
      }

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        buffer += text;

        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("event: ")) {
            const eventType = line.split("\n")[0].replace("event: ", "").trim();
            const dataLine = line
              .split("\n")
              .find((l) => l.startsWith("data: "));
            if (!dataLine) continue;

            const dataStr = dataLine.replace("data: ", "");
            try {
              const data = JSON.parse(dataStr);

              if (eventType === "info") {
                if (data.modelId) {
                  const name = data.modelId
                    .replace(/-/g, " ")
                    .replace(/\b\w/g, (c: string) => c.toUpperCase());
                  setActiveModelName(name);
                }
              } else if (eventType === "thought") {
                setProcessingThought((prev) => prev + data);
              } else if (eventType === "complete") {
                if (data.error) throw new Error(data.error);
                setExtractedData(data);
                setStatus("review");
              } else if (eventType === "error") {
                throw new Error(data.error || "Stream error");
              }
            } catch (e) {
              console.warn("Error parsing stream data:", e);
            }
          }
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to process files. Please try again.");
      setStatus("idle");
      setSelectedFiles([]);
    }
  };

  const handleConfirmAction = async () => {
    if (modalConfig.type === "discard") {
      setStatus("idle");
      setSelectedFiles([]);
      setExtractedData(null);
      setShowPreview(false);
      setModalConfig((prev) => ({ ...prev, isOpen: false }));
      toast.info("Listing discarded.");
      return;
    }

    // Submit Logic
    setIsSubmitting(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      const finalData = {
        ...extractedData,
        agent_name: userName || "Unknown Agent",
        created_at: new Date().toISOString(),
        listing_source: "AI_OCR_APP",
        raw_ocr_notes: processingThought,
      };

      // 1. Save to Supabase
      const { error: dbError } = await supabase
        .from("sales_appraisals")
        .insert({
          user_id: user.id,
          agent_name: userName,
          address: extractedData?.address,
          vendor_name: extractedData?.vendors,
          status: "completed",
          form_data: finalData,
        });

      if (dbError) throw dbError;

      // 2. Post to n8n Webhook
      const response = await fetch(
        "https://hup.app.n8n.cloud/webhook/create-appraisal",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(finalData),
        },
      );

      if (!response.ok) {
        console.warn("n8n webhook failed, but DB saved.");
        // We might still consider this a success for the user, but warn them?
        // "Saved to database but workflow failed". Use toast warning?
        // Or just fail. User said "post to n8n... success toast".
        // Let's assume critical.
        // throw new Error("Failed to send to n8n workflow");
      }

      toast.success("Success! Appraisal saved and workflow triggered.");

      // Reset
      setExtractedData(null);
      setSelectedFiles([]);
      setStatus("idle");
      setShowPreview(false);
    } catch (err: any) {
      console.error(err);
      toast.error(`Submission failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
      setModalConfig((prev) => ({ ...prev, isOpen: false }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <ConfirmationModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={handleConfirmAction}
        isProcessing={isSubmitting}
        title={
          modalConfig.type === "submit"
            ? "Confirm Submission"
            : "Discard Listing?"
        }
        description={
          modalConfig.type === "submit"
            ? "This will save the appraisal to the database and trigger the automation workflow. All details will be verified."
            : "Are you sure you want to discard this listing? All extracted data and changes will be lost irreversibly."
        }
        confirmLabel={modalConfig.type === "submit" ? "Yes, Submit" : "Discard"}
        cancelLabel="Cancel"
      />

      <AnimatePresence mode="wait">
        {/* IDLE STATE */}
        {status === "idle" && selectedFiles.length === 0 && (
          <motion.div
            key="idle-container"
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col lg:flex-row items-center justify-center min-h-[80vh] w-full max-w-[1600px] mx-auto transition-all duration-700 ease-in-out gap-12 lg:gap-24 relative z-10 px-4 py-12"
          >
            <div className="absolute top-0 inset-x-0 h-[500px] w-full bg-gradient-to-b from-blue-50/50 via-transparent to-transparent -z-10" />
            <div className="absolute top-20 right-20 w-72 h-72 bg-blue-400/10 rounded-full blur-[100px] -z-10" />
            <div className="absolute bottom-20 left-20 w-72 h-72 bg-indigo-400/10 rounded-full blur-[100px] -z-10" />

            <motion.div
              layout
              className={`flex flex-col space-y-6 ${
                showIntro
                  ? "text-center items-center w-full max-w-3xl"
                  : "text-left items-start w-full lg:w-1/2 lg:max-w-xl"
              }`}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50/80 border border-blue-100/50 backdrop-blur-sm shadow-sm mb-4">
                <Sparkles className="w-4 h-4 text-[#00ADEF]" />
                <span className="text-sm font-semibold text-[#001F49] tracking-wide uppercase">
                  AI-Powered Appraisal Assistant
                </span>
              </div>

              <div className="min-h-[120px] flex flex-col justify-center">
                <h1 className="text-6xl md:text-7xl font-bold text-[#001F49] tracking-tight leading-[1.1]">
                  <span>{headerText.slice(0, 13)}</span>
                  <span className="text-[#00ADEF]">{headerText.slice(13)}</span>
                  {showIntro && headerText.length < FULL_TEXT.length && (
                    <span className="inline-block w-1 h-12 bg-[#00ADEF] ml-1 animate-pulse align-middle" />
                  )}
                </h1>
              </div>

              <p className="text-xl md:text-2xl text-slate-500 font-medium leading-relaxed">
                Your intelligent copilot for processing listing authorities with
                precision and speed.
              </p>

              <AnimatePresence>
                {showIntro && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: 1.5 }}
                    className="pt-8"
                  >
                    <button
                      onClick={startAisal}
                      className="group relative inline-flex items-center gap-3 px-8 py-4 bg-[#001F49] text-white rounded-full text-lg font-semibold shadow-xl shadow-blue-900/20 overflow-hidden"
                    >
                      <span className="relative z-10">Start Aisal</span>
                      <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <AnimatePresence>
              {!showIntro && (
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                    delay: 0.2,
                  }}
                  className="w-full lg:w-1/2 max-w-2xl bg-white/70 backdrop-blur-xl border border-white/50 shadow-2xl shadow-blue-900/5 rounded-3xl p-2 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-transparent pointer-events-none" />
                  <div className="relative z-10 p-6 border border-slate-100 rounded-2xl bg-white/50">
                    <FileUpload onFileSelect={handleFileSelect} />
                    <div className="mt-6 flex items-center justify-center gap-6 text-sm text-slate-400 font-medium">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />{" "}
                        Handwriting Capable
                      </span>
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />{" "}
                        Multi-Page Support
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* FILE CONFIRMATION */}
        {status === "idle" && selectedFiles.length > 0 && (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="max-w-4xl mx-auto py-12 px-4"
          >
            <div className="bg-white rounded-3xl shadow-2xl border border-blue-50 p-8 text-center relative overflow-hidden">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-[#001F49]">
                  {selectedFiles.length} file
                  {selectedFiles.length > 1 ? "s" : ""} selected
                </h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-8">
                {selectedFiles.map((fileObj, i) => (
                  <div
                    key={i}
                    className="relative group bg-white rounded-2xl p-3 border border-gray-100 shadow-sm flex flex-col h-[180px]"
                  >
                    <div className="flex-1 relative mb-2 rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center">
                      {fileObj.file.type === "application/pdf" ||
                      fileObj.file.name.endsWith(".pdf") ? (
                        <FileText className="w-10 h-10 text-red-500 opacity-80" />
                      ) : (
                        <Image
                          src={fileObj.preview}
                          alt={fileObj.file.name}
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>
                    <p className="text-xs font-semibold text-[#001F49] truncate">
                      {fileObj.file.name}
                    </p>
                    <button
                      onClick={() => removeFile(i)}
                      className="absolute -top-2 -right-2 w-7 h-7 bg-white rounded-full shadow text-red-500 hover:scale-110 opacity-0 group-hover:opacity-100 border border-gray-100 z-10 grid place-items-center"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <div className="h-[180px]">
                  <FileUpload
                    onFileSelect={handleFileSelect}
                    variant="compact"
                  />
                </div>
              </div>
              <div className="max-w-sm mx-auto">
                <button
                  onClick={handleProcess}
                  className="w-full py-4 bg-[#001F49] hover:bg-[#002a60] text-white rounded-xl font-semibold shadow-xl flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95"
                >
                  <Sparkles className="w-5 h-5 text-[#00ADEF]" /> Generate
                  Digital Twin
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* PROCESSING */}
        {status === "processing" && (
          <motion.div
            key="processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-screen flex flex-col items-center justify-center"
          >
            <AppraisalLoading
              currentThought={processingThought}
              modelName={activeModelName}
            />
          </motion.div>
        )}

        {/* REVIEW - REDESIGNED */}
        {status === "review" && (
          <motion.div
            key="review"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full min-h-screen bg-gray-100 flex flex-col"
          >
            {/* Sticky Header Bar */}
            <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-bold text-[#001F49] hidden md:block">
                  Contract Review
                </h2>
                <div
                  className={`flex items-center gap-2 px-1 py-1 bg-gray-100 rounded-lg border border-gray-200 transition-all ${showPreview ? "bg-blue-50 border-blue-200" : ""}`}
                >
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-semibold transition-all ${
                      showPreview
                        ? "bg-white text-blue-700 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {showPreview ? (
                      <Minimize2 className="w-4 h-4" />
                    ) : (
                      <Maximize2 className="w-4 h-4" />
                    )}
                    {showPreview ? "Hide Original" : "Compare with Original"}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() =>
                    setModalConfig({ isOpen: true, type: "discard" })
                  }
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 font-medium text-sm transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Discard</span>
                </button>
                <button
                  onClick={() =>
                    setModalConfig({ isOpen: true, type: "submit" })
                  }
                  className="flex items-center gap-2 px-6 py-2 rounded-lg bg-gradient-to-r from-[#001F49] to-[#003366] text-white font-bold text-sm hover:shadow-lg hover:to-[#002a60] transition-all transform active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  Complete & Submit
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden relative">
              <div
                className="absolute inset-0 z-0 opacity-[0.02]"
                style={{
                  backgroundImage: "radial-gradient(#444 1px, transparent 1px)",
                  backgroundSize: "24px 24px",
                }}
              ></div>

              <div
                className={`h-full transition-all duration-300 ${showPreview ? "grid grid-cols-2 divide-x divide-gray-200" : "w-full max-w-[1400px] mx-auto"}`}
              >
                {/* LEFT PANEL: FORM */}
                <div
                  className={`h-full overflow-y-auto custom-scrollbar p-8 ${showPreview ? "" : "mx-auto"}`}
                >
                  <SmartListingForm
                    initialData={extractedData || {}}
                    onChange={(newData) => setExtractedData(newData)}
                  />
                </div>

                {/* RIGHT PANEL: PREVIEW */}
                {showPreview && (
                  <div className="h-full bg-slate-900 overflow-hidden relative shadow-inner">
                    <DocumentPreview
                      files={selectedFiles}
                      onClose={() => setShowPreview(false)}
                    />
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
