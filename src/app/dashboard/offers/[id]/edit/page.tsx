"use client";

import { useState, useCallback, useEffect, useRef, useMemo, use } from "react";
import { motion } from "framer-motion";
import {
    FileText,
    Loader2,
    CheckCircle2,
    Shield,
    AlertCircle,
    ArrowRight,
    X,
    ChevronLeft,
} from "lucide-react";
import Link from "next/link";
import { PurchaserSection } from "@/components/offer/PurchaserSection";
import { SolicitorSection } from "@/components/offer/SolicitorSection";
import { OfferDetailsSection } from "@/components/offer/OfferDetailsSection";
import {
    initialOfferFormData,
    type OfferFormData,
} from "@/lib/offer/types";
import { validateStep } from "@/lib/offer/validation";
import { getChanges, type FieldChange } from "@/lib/offer/diff";

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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
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
            className="text-center py-16 bg-white rounded-2xl border border-gray-200 shadow-sm mt-8 max-w-2xl mx-auto"
        >
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Offer Updated Successfully
            </h2>
            <p className="text-gray-500 max-w-md mx-auto mb-8">
                Your changes have been saved to the database.
            </p>
            <Link
                href="/dashboard/offers"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#001F49] text-white font-medium rounded-xl hover:bg-[#002D6B] transition-colors"
            >
                Return to Dashboard
            </Link>
        </motion.div>
    );
}

// ─── Error Screen ───────────────────────────────────────────────
function ErrorScreen({ message }: { message: string }) {
    return (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 shadow-sm mt-8 max-w-2xl mx-auto">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Unable to Load Offer
            </h2>
            <p className="text-gray-500 max-w-md mx-auto mb-8">{message}</p>
            <Link
                href="/dashboard/offers"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
            >
                Return to Dashboard
            </Link>
        </div>
    );
}

// ─── Main Page ──────────────────────────────────────────────────
export default function AdminEditOfferPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);

    const [formData, setFormData] = useState<OfferFormData>(initialOfferFormData);
    const originalFormData = useRef<OfferFormData>(initialOfferFormData);
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
                    setLoadError("This offer could not be found.");
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

    // Validate all sections before showing confirmation
    const handleSaveClick = () => {
        // Validate Purchaser (Step 1), Solicitor (Step 2), Offer (Step 3)
        // Note: steps are 0-indexed in validation logic, so 1 = Purchaser, 2 = Solicitor, 3 = Offer
        let allErrors: Record<string, string> = {};
        allErrors = { ...allErrors, ...validateStep(1, formData) };
        allErrors = { ...allErrors, ...validateStep(2, formData) };
        allErrors = { ...allErrors, ...validateStep(3, formData) };

        if (Object.keys(allErrors).length > 0) {
            setErrors(allErrors);
            // Scroll to top to see error summary if needed, but errors will show inline
            window.scrollTo({ top: 0, behavior: "smooth" });
            return;
        }

        setErrors({});
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
                setSubmitError(data.error || "Update failed. Please try again.");
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
            <div className="w-full flex items-center justify-center py-32">
                <Loader2 className="w-8 h-8 text-[#00ADEF] animate-spin" />
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

    return (
        <div className="w-full max-w-4xl mx-auto pb-32">
            {/* Header & Back Navigation */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <div className="mb-6">
                    <Link
                        href="/dashboard/offers"
                        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors font-medium"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Back to Offers Dashboard
                    </Link>
                </div>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-[#001F49] tracking-tight">
                            Edit Offer Details
                        </h1>
                        <p className="text-gray-500 mt-2 text-sm">
                            Editing offer for <strong className="text-gray-900">{formData.propertyAddress}</strong>
                        </p>
                    </div>

                    {/* Desktop Actions */}
                    <div className="hidden md:flex items-center gap-3">
                        <Link
                            href="/dashboard/offers"
                            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors text-sm"
                        >
                            Cancel
                        </Link>
                        <button
                            onClick={handleSaveClick}
                            disabled={!hasChanges}
                            className={`px-4 py-2 font-medium rounded-xl transition-all duration-200 text-sm flex items-center gap-2 shadow-sm ${hasChanges
                                ? "bg-[#00ADEF] text-white hover:bg-[#0096D1]"
                                : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                }`}
                        >
                            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                            Save Changes
                        </button>
                    </div>
                </div>

                {/* Submit Error */}
                {submitError && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-start gap-2">
                        <Shield className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        {submitError}
                    </div>
                )}
                {/* Validation Errors Summary */}
                {Object.keys(errors).length > 0 && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex flex-col gap-1">
                        <div className="flex items-center gap-2 font-semibold">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            Please fix the following validation errors:
                        </div>
                        <ul className="list-disc pl-9 mt-1 space-y-1 text-red-600/90 text-xs">
                            {Object.entries(errors).map(([key, msg]) => (
                                <li key={key}>{msg}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </motion.div>

            {/* Continuous Form Sections */}
            <div className="space-y-8">
                {/* We skip PropertySelector because changing the property of an existing offer breaks data integrity. */}

                <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm">
                    <h2 className="text-lg font-bold text-[#001F49] border-b border-gray-100 pb-4 mb-6 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold">1</span>
                        Purchaser Details
                    </h2>
                    <PurchaserSection
                        formData={formData}
                        updateFormData={updateFormData}
                        errors={errors}
                        setErrors={setErrors}
                    />
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm">
                    <h2 className="text-lg font-bold text-[#001F49] border-b border-gray-100 pb-4 mb-6 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold">2</span>
                        Solicitor Details
                    </h2>
                    <SolicitorSection
                        formData={formData}
                        updateFormData={updateFormData}
                        errors={errors}
                        setErrors={setErrors}
                    />
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm">
                    <h2 className="text-lg font-bold text-[#001F49] border-b border-gray-100 pb-4 mb-6 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold">3</span>
                        Offer & Conditions
                    </h2>
                    <OfferDetailsSection
                        formData={formData}
                        updateFormData={updateFormData}
                        errors={errors}
                        setErrors={setErrors}
                    />
                </div>
            </div>

            {/* Sticky Mobile Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-gray-200 md:hidden z-40 flex items-center gap-3">
                <Link
                    href="/dashboard/offers"
                    className="flex-1 text-center py-3 bg-gray-50 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-100 transition-colors text-sm"
                >
                    Cancel
                </Link>
                <button
                    onClick={handleSaveClick}
                    disabled={!hasChanges}
                    className={`flex-1 py-3 font-medium rounded-xl transition-all duration-200 text-sm flex items-center justify-center gap-2 shadow-sm ${hasChanges
                        ? "bg-[#00ADEF] text-white hover:bg-[#0096D1]"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        }`}
                >
                    {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    Save Changes
                </button>
            </div>

            {/* Security Note at Bottom */}
            <div className="mt-8 flex items-center justify-center gap-2 text-xs text-gray-400">
                <Shield className="w-4 h-4" />
                <span>Edits are securely tracked and versioned in the database.</span>
            </div>

            {/* Submitting Overlay */}
            {isSubmitting && !showConfirmation && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                        <Loader2 className="w-6 h-6 animate-spin text-[#00ADEF]" />
                        <span className="text-gray-700 font-medium">Saving changes...</span>
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
