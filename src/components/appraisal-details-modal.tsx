"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, User, MapPin } from "lucide-react";
import SmartListingForm from "./smart-listing-form";
import type { ListingData } from "@/lib/gemini-ocr";

interface AppraisalDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: Partial<ListingData> | null;
  meta?: {
    address: string;
    agent: string;
    date: string;
  };
}

export default function AppraisalDetailsModal({
  isOpen,
  onClose,
  data,
  meta,
}: AppraisalDetailsModalProps) {
  if (!isOpen || !data) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-5xl h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h2 className="text-xl font-bold text-[#001F49] flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#00ADEF]" />
                {meta?.address || "Property Appraisal"}
              </h2>
              <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" /> {meta?.agent || "Unknown Agent"}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />{" "}
                  {meta?.date ? new Date(meta.date).toLocaleDateString() : ""}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-gray-50/30">
            <SmartListingForm
              initialData={data}
              onChange={() => {}} // No-op
              readOnly={true}
            />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
