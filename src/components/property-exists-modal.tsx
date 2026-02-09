"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  Building2,
  User,
  Bed,
  Bath,
  Car,
  DollarSign,
} from "lucide-react";

interface PropertyExistsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
  property: {
    displayAddress: string;
    id: number;
    status?: string;
    bed?: number;
    bath?: number;
    garages?: number;
    agentName?: string;
    appraisalPriceLower?: number;
    appraisalPriceUpper?: number;
  };
  isProcessing?: boolean;
}

const SPIN_STYLES = `
  @keyframes spin-force {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  .animate-spin-force {
    animation: spin-force 1s linear infinite !important;
  }
  @media (prefers-reduced-motion: reduce) {
    .animate-spin-force {
      animation-duration: 1s !important;
      transition-duration: 1s !important;
    }
  }
`;

function formatPrice(value?: number): string {
  if (!value) return "";
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function PropertyExistsModal({
  isOpen,
  onClose,
  onUpdate,
  property,
  isProcessing = false,
}: PropertyExistsModalProps) {
  const hasFeatures =
    property.bed !== undefined ||
    property.bath !== undefined ||
    property.garages !== undefined;

  const hasPriceRange =
    property.appraisalPriceLower || property.appraisalPriceUpper;

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
                    This property exists in VaultRE. Click{" "}
                    <strong>Update Property</strong> to add new appraisal data.
                  </p>

                  <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                    {/* Address */}
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-semibold text-slate-900">
                        {property.displayAddress}
                      </span>
                    </div>

                    {/* Agent */}
                    {property.agentName && (
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>Agent: {property.agentName}</span>
                      </div>
                    )}

                    {/* Features (Bed/Bath/Car) */}
                    {hasFeatures && (
                      <div className="flex items-center gap-4 text-xs text-slate-600">
                        {property.bed !== undefined && (
                          <span className="flex items-center gap-1">
                            <Bed className="w-3.5 h-3.5" />
                            {property.bed}
                          </span>
                        )}
                        {property.bath !== undefined && (
                          <span className="flex items-center gap-1">
                            <Bath className="w-3.5 h-3.5" />
                            {property.bath}
                          </span>
                        )}
                        {property.garages !== undefined && (
                          <span className="flex items-center gap-1">
                            <Car className="w-3.5 h-3.5" />
                            {property.garages}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Price Range */}
                    {hasPriceRange && (
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {formatPrice(property.appraisalPriceLower)}
                          {property.appraisalPriceUpper &&
                            ` - ${formatPrice(property.appraisalPriceUpper)}`}
                        </span>
                      </div>
                    )}

                    {/* ID and Status */}
                    <div className="flex items-center gap-3 text-xs text-slate-500 pt-1 border-t border-slate-200">
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

              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  onClick={onClose}
                  disabled={isProcessing}
                  className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={onUpdate}
                  disabled={isProcessing}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-lg shadow-sky-900/10 flex items-center gap-2 transition-all active:scale-[0.98]"
                >
                  {isProcessing ? (
                    <>
                      <style>{SPIN_STYLES}</style>
                      <svg
                        className="animate-spin-force -ml-1 mr-2 h-4 w-4 text-white shrink-0"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Updating...
                    </>
                  ) : (
                    "Update Property"
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
