"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, CheckCircle, X } from "lucide-react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isProcessing?: boolean;
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  isProcessing = false,
}: ConfirmationModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={!isProcessing ? onClose : undefined}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100"
          >
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{title}</h3>
                  <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                    {description}
                  </p>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-end gap-3">
                <button
                  onClick={onClose}
                  disabled={isProcessing}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-colors disabled:opacity-50"
                >
                  {cancelLabel}
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isProcessing}
                  className="px-6 py-2 text-sm font-bold text-white bg-[#001F49] hover:bg-[#002a60] rounded-lg shadow-lg shadow-blue-900/10 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>{confirmLabel}</>
                  )}
                </button>
              </div>
            </div>

            {/* Close X */}
            {!isProcessing && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
