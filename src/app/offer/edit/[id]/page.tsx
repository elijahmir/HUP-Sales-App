"use client";

import { useState, useCallback, useEffect, useRef, useMemo, use } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    FileText,
    Loader2,
    CheckCircle2,
    Shield,
    AlertCircle,
    ArrowRight,
    X,
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
import { getChanges, type FieldChange } from "@/lib/offer/diff";

// Steps (same as public form)
const STEPS = [
    { id: 0, title: "Property Selection", shortTitle: "Property" },
    { id: 1, title: "Purchaser Details", shortTitle: "Purchaser" },
    { id: 2, title: "Solicitor Details", shortTitle: "Solicitor" },
    { id: 3, title: "Offer Details & Conditions", shortTitle: "Offer" },
    { id: 4, title: "Review & Submit", shortTitle: "Review" },
];

// ─── Change Detection Helpers imported from @/lib/offer/diff ─────────

// ─── Confirmation Modal ─────────────────────────────────────────
function ChangesConfirmationModal({
    changes,
    onConfirm,
    onCancel,
    isSubmitting,
}: {
    changes: FieldChange[];
    onConfirm: () => void;
    onCancel: () => void;
    isSubmitting: boolean;
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                            <FileText className="w-5 h-5 text-[#00ADEF]" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">Confirm Changes</h3>
                            <p className="text-xs text-gray-500">{changes.length} field{changes.length !== 1 ? "s" : ""} modified</p>
                        </div>
                    </div>
                    <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
                        <X className="w-4 h-4 text-gray-400" />
                    </button>
                </div>

                {/* Changes List */}
                <div className="overflow-y-auto p-5 flex-1">
                    <div className="space-y-3">
                        {changes.map((change, idx) => (
                            <div key={idx} className="bg-gray-50 rounded-xl p-3.5 border border-gray-100">
                                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                                    {change.label}
                                </p>
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="bg-red-50 text-red-600 px-2.5 py-1 rounded-lg font-medium text-xs line-through max-w-[45%] truncate">
                                        {change.oldValue}
                                    </span>
                                    <ArrowRight className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                                    <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg font-semibold text-xs max-w-[45%] truncate">
                                        {change.newValue}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 p-5 border-t border-gray-100">
                    <button
                        onClick={onCancel}
                        disabled={isSubmitting}
                        className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors text-sm cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isSubmitting}
                        className="px-5 py-2.5 bg-[#001F49] text-white font-semibold rounded-xl hover:bg-[#002D6B] transition-colors text-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                        {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                        {isSubmitting ? "Updating..." : "Confirm & Update"}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

// ─── Success Screen ─────────────────────────────────────────────
function UpdateSuccessScreen() {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
        >
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Offer Updated Successfully
            </h2>
            <p className="text-gray-500 max-w-md mx-auto">
                Your changes have been saved. Our team will review the updated offer and be in touch shortly.
            </p>
        </motion.div>
    );
}

// ─── Error Screen ───────────────────────────────────────────────
function ErrorScreen({ message }: { message: string }) {
    return (
        <div className="text-center py-16">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Unable to Load Offer
            </h2>
            <p className="text-gray-500 max-w-md mx-auto">{message}</p>
        </div>
    );
}

// ─── Main Page ──────────────────────────────────────────────────
export default function EditOfferPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);

    const [formData, setFormData] = useState<OfferFormData>(initialOfferFormData);
    const originalFormData = useRef<OfferFormData>(initialOfferFormData);
    const [currentStep, setCurrentStep] = useState(0);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [showConfirmation, setShowConfirmation] = useState(false);

    // Load existing offer data
    useEffect(() => {
        const loadOffer = async () => {
            try {
                const res = await fetch(`/api/offer/${id}`);
                if (!res.ok) {
                    setLoadError("This offer link is invalid or has expired.");
                    return;
                }
                const data = await res.json();
                if (data.offer?.form_data) {
                    const loaded = data.offer.form_data as OfferFormData;
                    setFormData(loaded);
                    originalFormData.current = JSON.parse(JSON.stringify(loaded));
                } else {
                    setLoadError("Could not load offer data.");
                }
            } catch {
                setLoadError("Network error. Please check your connection and try again.");
            } finally {
                setLoading(false);
            }
        };
        loadOffer();
    }, [id]);

    // Compute changes — use deep comparison for hasChanges (catches ALL fields)
    const hasChanges = useMemo(
        () => JSON.stringify(formData) !== JSON.stringify(originalFormData.current),
        [formData]
    );
    // Build human-readable diff for the confirmation modal
    const changes = useMemo(() => getChanges(originalFormData.current, formData), [formData]);

    const updateFormData = useCallback(
        (updates: Partial<OfferFormData>) => {
            setFormData((prev) => ({ ...prev, ...updates }));
        },
        []
    );

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

    // Show confirmation modal instead of submitting directly
    const handleSubmitClick = () => {
        // Validate all steps first
        for (let i = 0; i < STEPS.length; i++) {
            const stepErrors = validateStep(i, formData);
            if (Object.keys(stepErrors).length > 0) {
                setErrors(stepErrors);
                setCurrentStep(i);
                return;
            }
        }
        setShowConfirmation(true);
    };

    // Actual submit after confirmation
    const handleConfirmedSubmit = async () => {
        setIsSubmitting(true);
        setSubmitError(null);

        try {
            const res = await fetch("/api/offer/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    formData,
                    existingId: id,
                    isPublic: true,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setShowConfirmation(false);
                if (res.status === 429) {
                    setSubmitError("Too many submissions. Please wait and try again later.");
                } else {
                    setSubmitError(data.error || "Update failed. Please try again.");
                }
                return;
            }

            if (data.success) {
                setShowConfirmation(false);
                setShowSuccess(true);
            } else {
                setShowConfirmation(false);
                setSubmitError(data.error || "Update failed.");
            }
        } catch {
            setShowConfirmation(false);
            setSubmitError("Network error. Please check your connection and try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="text-center py-16">
                <Loader2 className="w-8 h-8 text-[#00ADEF] animate-spin mx-auto mb-4" />
                <p className="text-gray-500">Loading your offer...</p>
            </div>
        );
    }

    // Error state
    if (loadError) {
        return <ErrorScreen message={loadError} />;
    }

    // Success state
    if (showSuccess) {
        return <UpdateSuccessScreen />;
    }

    // canProceed for navigation — on the last step, also require changes
    const stepValid = isStepValid(currentStep, formData);
    const canProceed = currentStep === STEPS.length - 1 ? stepValid && hasChanges : stepValid;

    return (
        <div className="w-full">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="text-3xl md:text-4xl font-bold text-[#001F49] tracking-tight">
                    Edit Your Offer
                </h1>
                <p className="text-gray-500 mt-2 text-base">
                    Review and update your property purchase offer below.
                </p>

                {/* Edit Banner */}
                <div className="flex items-start gap-3 p-4 mt-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
                    <FileText className="w-5 h-5 text-[#00ADEF] flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800">
                        <p className="font-semibold mb-1">Editing Existing Offer</p>
                        <p className="text-blue-600 leading-relaxed">
                            You are editing your offer for{" "}
                            <strong>{formData.propertyAddress || "this property"}</strong>.
                            Make your changes and submit to update.
                        </p>
                    </div>
                </div>

                {/* Changes indicator */}
                {hasChanges && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-emerald-600 font-medium">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        {changes.length > 0 ? `${changes.length} unsaved change${changes.length !== 1 ? "s" : ""}` : "Unsaved changes detected"}
                    </div>
                )}
            </motion.div>

            {/* Form Stepper */}
            <FormStepper
                steps={STEPS}
                currentStep={currentStep}
                onStepChange={handleStepChange}
                canProceed={canProceed}
                isLastStep={currentStep === STEPS.length - 1}
                onSubmit={handleSubmitClick}
                isSubmitting={isSubmitting}
                showNavigation
                showStepIndicators
                hideNavigation
            />

            {/* Submit Error */}
            {submitError && (
                <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-start gap-2"
                >
                    <Shield className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    {submitError}
                </motion.div>
            )}

            {/* No changes hint on last step */}
            {currentStep === STEPS.length - 1 && !hasChanges && (
                <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-xl text-sm flex items-center gap-2"
                >
                    <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                    <span className="text-amber-700">No changes detected. Modify a field to enable the update button.</span>
                </motion.div>
            )}

            {/* Step Content */}
            <motion.div className="mt-8 relative z-50" initial={false}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="relative z-50"
                    >
                        <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm relative z-50">
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
                                    onJumpToStep={setCurrentStep}
                                />
                            )}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </motion.div>

            {/* Bottom Navigation */}
            <div className="mt-6 relative z-10">
                <FormNavigation
                    currentStep={currentStep}
                    totalSteps={STEPS.length}
                    canProceed={canProceed}
                    isLastStep={currentStep === STEPS.length - 1}
                    isSubmitting={isSubmitting}
                    onPrev={() => currentStep > 0 && handleStepChange(currentStep - 1)}
                    onNext={() => currentStep < STEPS.length - 1 && handleStepChange(currentStep + 1)}
                    onSubmit={handleSubmitClick}
                    submitLabel="Update Offer"
                    submittingLabel="Updating Offer..."
                />
            </div>

            {/* Security Badge */}
            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400">
                <Shield className="w-3.5 h-3.5" />
                <span>Your information is encrypted and securely transmitted</span>
            </div>

            {/* Submitting Overlay */}
            {isSubmitting && !showConfirmation && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                        <Loader2 className="w-6 h-6 animate-spin text-[#00ADEF]" />
                        <span className="text-gray-700 font-medium">Updating your offer...</span>
                    </div>
                </div>
            )}

            {/* Changes Confirmation Modal */}
            {showConfirmation && (
                <ChangesConfirmationModal
                    changes={changes}
                    onConfirm={handleConfirmedSubmit}
                    onCancel={() => setShowConfirmation(false)}
                    isSubmitting={isSubmitting}
                />
            )}
        </div>
    );
}
