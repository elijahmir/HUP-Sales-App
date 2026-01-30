"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  X,
  Loader2,
  Building2,
  CheckCircle2,
} from "lucide-react";

interface PropertyExistsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
  property: {
    displayAddress: string;
    id: number;
    status?: string;
  };
  isProcessing?: boolean;
}

export default function PropertyExistsModal({
  isOpen,
  onClose,
  onContinue,
  property,
  isProcessing = false,
}: PropertyExistsModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={!isProcessing ? onClose : undefined}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-lg font-bold text-slate-900">
                    Property Already Exists
                  </h3>
                  <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                    A property with this address was found in VaultRE. Creating
                    a duplicate might cause confusion.
                  </p>

                  <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Building2 className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-semibold text-slate-900">
                        {property.displayAddress}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-500 ml-6">
                      <span>ID: {property.id}</span>
                      {property.status && (
                        <span className="px-2 py-0.5 bg-slate-200 rounded-full text-slate-600 font-medium capitalize">
                          {property.status}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-end gap-3 cancel-button-group">
                <button
                  onClick={onClose}
                  disabled={isProcessing}
                  className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={onContinue}
                  disabled={isProcessing}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-lg shadow-amber-900/10 flex items-center gap-2 transition-all active:scale-[0.98]"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Anyway"
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
