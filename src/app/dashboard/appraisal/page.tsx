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
import StarBorder from "@/components/StarBorder";
import TrueFocus from "@/components/TrueFocus";
import "@/components/StarBorder.css";
import "@/components/TrueFocus.css";
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
    }, 80);

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
  const [isProcessingComplete, setIsProcessingComplete] = useState(false);

  // New handler for when AppraisalLoading finishes its resume animation
  const handleAnimationComplete = () => {
    setStatus("review");
    setIsProcessingComplete(false);
  };

  const handleProcess = async () => {
    if (selectedFiles.length === 0) return;

    setStatus("processing");
    setProcessingThought("");
    setActiveModelName("Gemini AI");
    setIsProcessingComplete(false); // Reset

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
                // DO NOT set status to review here.
                // Signal completion to the loading animation instead.
                setIsProcessingComplete(true);
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
      setIsProcessingComplete(false);
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
      }

      toast.success("Success! Appraisal saved and workflow triggered.");

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
    <div className="min-h-[calc(100vh-8rem)]">
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
            ? "This will save the appraisal to the database and trigger the automation workflow."
            : "Are you sure? All extracted data will be lost."
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
            className="flex flex-col lg:flex-row items-center justify-center min-h-[70vh] w-full max-w-6xl mx-auto transition-all duration-700 gap-12 lg:gap-16 relative z-10 px-4 py-8"
          >
            {/* Subtle Background Gradients */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-sky-400/5 rounded-full blur-[100px] -z-10" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-violet-400/5 rounded-full blur-[100px] -z-10" />

            <motion.div
              layout
              className={`flex flex-col space-y-5 ${
                showIntro
                  ? "text-center items-center w-full max-w-2xl"
                  : "text-left items-start w-full lg:w-1/2 lg:max-w-xl"
              }`}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <StarBorder
                as="div"
                color="#00ADEF"
                speed="4s"
                className="rounded-full mb-4"
              >
                <div className="flex items-center gap-2 px-4 py-2 bg-sky-50 rounded-full">
                  <Sparkles className="w-3.5 h-3.5 text-[#00ADEF]" />
                  <span className="text-xs font-semibold text-[#001F49] uppercase tracking-wide">
                    AI-Powered Assistant
                  </span>
                </div>
              </StarBorder>

              <div className="min-h-[100px] flex flex-col justify-center">
                {showIntro ? (
                  <h1 className="font-display text-5xl md:text-6xl font-bold text-[#001F49] tracking-tight leading-[1.1]">
                    <span>{headerText.slice(0, 13)}</span>
                    <span className="text-[#00ADEF]">
                      {headerText.slice(13)}
                    </span>
                    {headerText.length < FULL_TEXT.length && (
                      <span className="inline-block w-1 h-10 bg-[#00ADEF] ml-1 animate-pulse align-middle rounded-full" />
                    )}
                  </h1>
                ) : (
                  <TrueFocus
                    sentence="Say Hello to Aisal."
                    manualMode={false}
                    blurAmount={4}
                    borderColor="#00ADEF"
                    glowColor="rgba(0, 173, 239, 0.4)"
                    animationDuration={0.6}
                    pauseBetweenAnimations={1.5}
                  />
                )}
              </div>

              <p className="text-lg md:text-xl text-slate-500 leading-relaxed max-w-md">
                Your intelligent copilot for processing listing authorities with
                precision.
              </p>

              <AnimatePresence>
                {showIntro && (
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: 1.2 }}
                    className="pt-6"
                  >
                    <button
                      onClick={startAisal}
                      className="group inline-flex items-center gap-3 px-7 py-3.5 bg-[#001F49] text-white rounded-xl text-base font-semibold shadow-xl shadow-slate-900/15 hover:bg-[#002a60] transition-all duration-200 hover:-translate-y-0.5"
                    >
                      <span>Start Aisal</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <AnimatePresence>
              {!showIntro && (
                <motion.div
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 40 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                    delay: 0.15,
                  }}
                  className="w-full lg:w-1/2 max-w-xl"
                >
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-900/5 p-6">
                    <FileUpload onFileSelect={handleFileSelect} />
                    <div className="mt-5 flex items-center justify-center gap-5 text-sm text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        Handwriting Capable
                      </span>
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
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
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="max-w-3xl mx-auto py-8 px-4"
          >
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 text-center">
              <div className="mb-6">
                <h2 className="font-display text-2xl font-bold text-[#001F49]">
                  {selectedFiles.length} file
                  {selectedFiles.length > 1 ? "s" : ""} selected
                </h2>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-8">
                {selectedFiles.map((fileObj, i) => (
                  <div
                    key={i}
                    className="relative group bg-slate-50 rounded-xl p-3 border border-slate-100 flex flex-col h-[160px]"
                  >
                    <div className="flex-1 relative mb-2 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center">
                      {fileObj.file.type === "application/pdf" ||
                      fileObj.file.name.endsWith(".pdf") ? (
                        <FileText className="w-8 h-8 text-red-400" />
                      ) : (
                        <Image
                          src={fileObj.preview}
                          alt={fileObj.file.name}
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>
                    <p className="text-xs font-medium text-slate-600 truncate">
                      {fileObj.file.name}
                    </p>
                    <button
                      onClick={() => removeFile(i)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full shadow-md text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 border border-slate-200 z-10 grid place-items-center transition-all"
                      aria-label={`Remove ${fileObj.file.name}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <div className="h-[160px]">
                  <FileUpload
                    onFileSelect={handleFileSelect}
                    variant="compact"
                  />
                </div>
              </div>

              <div className="max-w-xs mx-auto">
                <button
                  onClick={handleProcess}
                  className="w-full py-3.5 bg-[#001F49] hover:bg-[#002a60] text-white rounded-xl font-semibold shadow-lg flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 active:scale-[0.98]"
                >
                  <Sparkles className="w-4 h-4 text-[#00ADEF]" />
                  Generate Digital Twin
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
            className="w-full min-h-[70vh] flex flex-col items-center justify-center"
          >
            <AppraisalLoading
              currentThought={processingThought}
              modelName={activeModelName}
              isComplete={isProcessingComplete}
              onAnimationComplete={handleAnimationComplete}
            />
          </motion.div>
        )}

        {/* REVIEW */}
        {status === "review" && (
          <motion.div
            key="review"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full flex flex-col"
          >
            {/* Header Bar */}
            <div className="sticky top-20 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between rounded-t-xl shadow-sm -mx-4 sm:-mx-6 lg:-mx-8">
              <div className="flex items-center gap-3">
                <h2 className="font-display text-lg font-bold text-[#001F49] hidden sm:block">
                  Contract Review
                </h2>
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                    showPreview
                      ? "bg-sky-50 text-sky-700 border border-sky-200"
                      : "text-slate-500 hover:bg-slate-100 border border-transparent hover:border-slate-200"
                  }`}
                  title={
                    showPreview
                      ? "Hide the original document"
                      : "Compare with original document"
                  }
                >
                  {showPreview ? (
                    <Minimize2 className="w-4 h-4" />
                  ) : (
                    <Maximize2 className="w-4 h-4" />
                  )}
                  {showPreview ? "Hide Original" : "Compare"}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setModalConfig({ isOpen: true, type: "discard" })
                  }
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 font-medium text-sm transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Discard</span>
                </button>
                <button
                  onClick={() =>
                    setModalConfig({ isOpen: true, type: "submit" })
                  }
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#001F49] text-white font-semibold text-sm hover:bg-[#002a60] transition-all shadow-md hover:shadow-lg active:scale-[0.98] cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  Submit
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden relative mt-4">
              <div
                className={`h-full transition-all duration-300 ${
                  showPreview
                    ? "flex flex-col gap-4"
                    : "w-full max-w-5xl mx-auto"
                }`}
              >
                {/* Preview Panel - Now on top when visible */}
                {showPreview && (
                  <div className="h-[350px] bg-slate-900 rounded-xl overflow-hidden shadow-inner shrink-0">
                    <DocumentPreview
                      files={selectedFiles}
                      onClose={() => setShowPreview(false)}
                    />
                  </div>
                )}

                {/* Form Panel */}
                <div
                  className={`${showPreview ? "flex-1 overflow-y-auto" : "h-full overflow-y-auto"} custom-scrollbar bg-slate-50 rounded-xl border border-slate-200`}
                >
                  <SmartListingForm
                    initialData={extractedData || {}}
                    onChange={(newData) => setExtractedData(newData)}
                    onViewImage={() => setShowPreview(true)}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
