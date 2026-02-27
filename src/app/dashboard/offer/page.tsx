"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    FileText,
    Clock,
    Loader2,
    CheckCircle2,
    XCircle,
    Trash2,
    Save,
    History,
    AlertTriangle,
} from "lucide-react";
import { FormStepper, FormNavigation } from "@/components/saa/FormStepper";
import { PropertySelector } from "@/components/offer/PropertySelector";
import { PurchaserSection } from "@/components/offer/PurchaserSection";
import { SolicitorSection } from "@/components/offer/SolicitorSection";
import { OfferDetailsSection } from "@/components/offer/OfferDetailsSection";
import { ReviewSection } from "@/components/offer/ReviewSection";
import {
    initialOfferFormData,
    type OfferFormData,
} from "@/lib/offer/types";
import { validateStep, isStepValid } from "@/lib/offer/validation";
import { submitOffer } from "@/lib/offer/api";
import {
    getHistory,
    saveSubmission,
    loadSubmission,
    deleteSubmission,
    getRelativeTime,
    type OfferHistoryEntry,
} from "@/lib/offer/historyStorage";

// ============================================
// Steps Configuration
// ============================================
const STEPS = [
    { id: 0, title: "Property Selection", shortTitle: "Property" },
    { id: 1, title: "Purchaser Details", shortTitle: "Purchaser" },
    { id: 2, title: "Solicitor Details", shortTitle: "Solicitor" },
    { id: 3, title: "Offer Details & Conditions", shortTitle: "Offer" },
    { id: 4, title: "Review & Submit", shortTitle: "Review" },
];

// ============================================
// History Modal
// ============================================
function HistoryModal({
    isOpen,
    onClose,
    onLoad,
    onDelete,
    entries,
    loading,
}: {
    isOpen: boolean;
    onClose: () => void;
    onLoad: (id: string) => void;
    onDelete: (id: string) => void;
    entries: OfferHistoryEntry[];
    loading: boolean;
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            />
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[70vh] overflow-hidden"
            >
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                        <History className="w-5 h-5 text-harcourts-blue" />
                        <h3 className="text-lg font-bold text-harcourts-navy">
                            Offer History
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <XCircle className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-4 overflow-y-auto max-h-[50vh] custom-scrollbar">
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-5 h-5 animate-spin text-harcourts-blue" />
                        </div>
                    ) : entries.length === 0 ? (
                        <div className="text-center py-8 text-gray-400 text-sm">
                            <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
                            No submissions yet
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {entries.map((entry) => (
                                <div
                                    key={entry.id}
                                    className="flex items-center gap-3 p-3.5 rounded-xl bg-gray-50 hover:bg-white border border-transparent hover:border-gray-200 hover:shadow-sm transition-all group"
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <h4 className="text-sm font-semibold text-harcourts-navy truncate">
                                                {entry.propertyAddress}
                                            </h4>
                                            <span
                                                className={`flex-shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${entry.status === "completed"
                                                    ? "bg-emerald-50 text-emerald-600"
                                                    : "bg-amber-50 text-amber-600"
                                                    }`}
                                            >
                                                {entry.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-400">
                                            <span>{entry.purchaserName}</span>
                                            {entry.offerPrice && (
                                                <>
                                                    <span>·</span>
                                                    <span>${entry.offerPrice}</span>
                                                </>
                                            )}
                                            <span>·</span>
                                            <span>{getRelativeTime(entry.updatedAt)}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => onLoad(entry.id)}
                                            className="px-3 py-1.5 text-xs font-semibold text-harcourts-blue hover:bg-harcourts-blue/10 rounded-lg transition-colors"
                                        >
                                            Load
                                        </button>
                                        {entry.isOwn && (
                                            <button
                                                onClick={() => onDelete(entry.id)}
                                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}

// ============================================
// Delete Confirmation Modal
// ============================================
function DeleteConfirmModal({
    isOpen,
    entryName,
    isDeleting,
    onConfirm,
    onCancel,
}: {
    isOpen: boolean;
    entryName: string;
    isDeleting: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onCancel}
            />
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
            >
                <div className="p-6 text-center">
                    <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle className="w-7 h-7 text-red-500" />
                    </div>
                    <h3 className="text-lg font-bold text-harcourts-navy mb-2">
                        Delete Submission?
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed mb-1">
                        This will permanently delete:
                    </p>
                    <p className="text-sm font-semibold text-gray-700 mb-6 truncate">
                        {entryName}
                    </p>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={isDeleting}
                            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={onConfirm}
                            disabled={isDeleting}
                            className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors cursor-pointer disabled:opacity-70 flex items-center justify-center gap-2"
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="w-4 h-4" />
                                    Delete
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

// ============================================
// Success Modal
// ============================================
function SuccessModal({
    isOpen,
    onClose,
    onNewForm,
}: {
    isOpen: boolean;
    onClose: () => void;
    onNewForm: () => void;
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center"
            >
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-harcourts-navy mb-2">
                    Offer Submitted!
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                    The offer has been sent successfully. The details have been saved and
                    forwarded for processing.
                </p>
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-colors"
                    >
                        Close
                    </button>
                    <button
                        onClick={onNewForm}
                        className="flex-1 py-2.5 rounded-xl bg-harcourts-blue text-white font-semibold text-sm hover:bg-harcourts-blue/90 transition-colors"
                    >
                        New Offer
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

// ============================================
// Main Page Component
// ============================================
export default function OfferFormPage() {
    const [formData, setFormData] = useState<OfferFormData>(initialOfferFormData);
    const [currentStep, setCurrentStep] = useState(0);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [existingId, setExistingId] = useState<string | undefined>(undefined);
    const [showHistory, setShowHistory] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [historyEntries, setHistoryEntries] = useState<OfferHistoryEntry[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    // Delete confirmation state
    const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Update form data
    const updateFormData = useCallback(
        (updates: Partial<OfferFormData>) => {
            setFormData((prev) => ({ ...prev, ...updates }));
        },
        []
    );

    // Load history
    const fetchHistory = useCallback(async () => {
        setHistoryLoading(true);
        const entries = await getHistory();
        setHistoryEntries(entries);
        setHistoryLoading(false);
    }, []);

    // Step change with validation
    const handleStepChange = (step: number) => {
        if (step > currentStep) {
            const stepErrors = validateStep(currentStep, formData);
            if (Object.keys(stepErrors).length > 0) {
                setErrors(stepErrors);
                return;
            }
        }
        setErrors({});
        setCurrentStep(step);
    };

    // Save draft
    const handleSaveDraft = async () => {
        setIsSaving(true);
        try {
            const id = await saveSubmission(formData, "draft", existingId);
            if (id) {
                setExistingId(id);
            }
        } catch (err) {
            console.error("Save draft error:", err);
        } finally {
            setIsSaving(false);
        }
    };

    // Submit
    const handleSubmit = async () => {
        // Validate all steps
        for (let i = 0; i < 4; i++) {
            const stepErrors = validateStep(i, formData);
            if (Object.keys(stepErrors).length > 0) {
                setErrors(stepErrors);
                setCurrentStep(i);
                return;
            }
        }

        setIsSubmitting(true);
        try {
            const result = await submitOffer(formData);
            if (result.success) {
                // Update existing draft to completed (don't create a new record)
                if (existingId) {
                    await saveSubmission(formData, "completed", existingId);
                }
                setShowSuccess(true);
            } else {
                alert(`Submission failed: ${result.error}`);
            }
        } catch (err) {
            console.error("Submit error:", err);
            alert("Submission failed. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Load submission
    const handleLoadSubmission = async (id: string) => {
        const data = await loadSubmission(id);
        if (data) {
            setFormData(data);
            setExistingId(id);
            setCurrentStep(0);
            setShowHistory(false);
        }
    };

    // Delete submission — show modal first
    const handleDeleteSubmission = (id: string) => {
        const entry = historyEntries.find((e) => e.id === id);
        setDeleteTarget({ id, name: entry?.propertyAddress || "this submission" });
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        setIsDeleting(true);
        const success = await deleteSubmission(deleteTarget.id);
        if (success) {
            setHistoryEntries((prev) => prev.filter((e) => e.id !== deleteTarget.id));
        }
        setIsDeleting(false);
        setDeleteTarget(null);
    };

    // New form
    const handleNewForm = () => {
        setFormData(initialOfferFormData);
        setCurrentStep(0);
        setExistingId(undefined);
        setErrors({});
        setShowSuccess(false);
    };

    // Open history
    const handleOpenHistory = () => {
        fetchHistory();
        setShowHistory(true);
    };

    // Auto-save on step change
    useEffect(() => {
        const timer = setTimeout(() => {
            if (formData.propertyId || formData.purchasers[0]?.fullName) {
                saveSubmission(formData, "draft", existingId).then((id) => {
                    if (id && !existingId) setExistingId(id);
                });
            }
        }, 2000);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentStep]);

    const canProceed = isStepValid(currentStep, formData);

    return (
        <div className="max-w-4xl mx-auto pb-12 w-full">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                        <h1 className="font-display text-3xl md:text-4xl font-bold text-harcourts-navy tracking-tight">
                            Offer Form
                        </h1>
                        <p className="text-gray-500 mt-2 text-base">
                            Complete the property offer details for your purchaser.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleSaveDraft}
                            disabled={isSaving}
                            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-500 hover:text-harcourts-blue hover:bg-harcourts-blue/5 rounded-lg transition-all border border-gray-200"
                        >
                            {isSaving ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                                <Save className="w-3.5 h-3.5" />
                            )}
                            Save Draft
                        </button>
                        <button
                            onClick={handleOpenHistory}
                            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-500 hover:text-harcourts-blue hover:bg-harcourts-blue/5 rounded-lg transition-all border border-gray-200"
                        >
                            <Clock className="w-3.5 h-3.5" />
                            History
                        </button>
                    </div>
                </div>

                {/* Info Banner */}
                <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-100">
                    <FileText className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-amber-800">
                        <p className="font-semibold mb-1">How this works</p>
                        <p className="text-amber-600 leading-relaxed">
                            Complete the offer details below and submit. The information will
                            be sent to the office for contract preparation. We encourage
                            purchasers to present their{" "}
                            <strong>best and final offer</strong> to strengthen their position.
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Form Stepper */}
            <FormStepper
                steps={STEPS}
                currentStep={currentStep}
                onStepChange={handleStepChange}
                canProceed={canProceed}
                isLastStep={currentStep === STEPS.length - 1}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                showNavigation
                showStepIndicators
                hideNavigation
            />

            {/* Step Content */}
            <motion.div
                className="mt-8"
                initial={false}
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm">
                            {currentStep === 0 && (
                                <PropertySelector
                                    formData={formData}
                                    updateFormData={updateFormData}
                                    errors={errors}
                                />
                            )}
                            {currentStep === 1 && (
                                <PurchaserSection
                                    formData={formData}
                                    updateFormData={updateFormData}
                                    errors={errors}
                                    setErrors={setErrors}
                                />
                            )}
                            {currentStep === 2 && (
                                <SolicitorSection
                                    formData={formData}
                                    updateFormData={updateFormData}
                                    errors={errors}
                                    setErrors={setErrors}
                                />
                            )}
                            {currentStep === 3 && (
                                <OfferDetailsSection
                                    formData={formData}
                                    updateFormData={updateFormData}
                                    errors={errors}
                                    setErrors={setErrors}
                                />
                            )}
                            {currentStep === 4 && (
                                <ReviewSection
                                    formData={formData}
                                    onJumpToStep={(step) => {
                                        setCurrentStep(step);
                                    }}
                                />
                            )}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </motion.div>

            {/* Bottom Navigation */}
            <div className="mt-6">
                <FormNavigation
                    currentStep={currentStep}
                    totalSteps={STEPS.length}
                    canProceed={canProceed}
                    isLastStep={currentStep === STEPS.length - 1}
                    isSubmitting={isSubmitting}
                    onPrev={() => currentStep > 0 && handleStepChange(currentStep - 1)}
                    onNext={() => currentStep < STEPS.length - 1 && handleStepChange(currentStep + 1)}
                    onSubmit={handleSubmit}
                    submitLabel="Submit Offer"
                    submittingLabel="Submitting Offer..."
                />
            </div>

            {/* Modals */}
            {showHistory && (
                <HistoryModal
                    isOpen={showHistory}
                    onClose={() => setShowHistory(false)}
                    onLoad={handleLoadSubmission}
                    onDelete={handleDeleteSubmission}
                    entries={historyEntries}
                    loading={historyLoading}
                />
            )}
            {showSuccess && (
                <SuccessModal
                    isOpen={showSuccess}
                    onClose={() => setShowSuccess(false)}
                    onNewForm={handleNewForm}
                />
            )}
            <DeleteConfirmModal
                isOpen={!!deleteTarget}
                entryName={deleteTarget?.name || ""}
                isDeleting={isDeleting}
                onConfirm={confirmDelete}
                onCancel={() => setDeleteTarget(null)}
            />
        </div>
    );
}
