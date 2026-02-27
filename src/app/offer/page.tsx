"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    FileText,
    Loader2,
    CheckCircle2,
    Shield,
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

// Steps
const STEPS = [
    { id: 0, title: "Property Selection", shortTitle: "Property" },
    { id: 1, title: "Purchaser Details", shortTitle: "Purchaser" },
    { id: 2, title: "Solicitor Details", shortTitle: "Solicitor" },
    { id: 3, title: "Offer Details & Conditions", shortTitle: "Offer" },
    { id: 4, title: "Review & Submit", shortTitle: "Review" },
];

// Success screen
function SuccessScreen({ onNewForm }: { onNewForm: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto text-center py-16"
        >
            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-[#001F49] mb-3">
                Offer Submitted Successfully!
            </h2>
            <p className="text-gray-500 mb-2 leading-relaxed">
                Thank you for your offer. Your submission has been received and will be
                reviewed by our team for contract preparation.
            </p>
            <p className="text-sm text-gray-400 mb-8">
                You will be contacted by our office regarding the next steps.
            </p>
            <button
                onClick={onNewForm}
                className="px-6 py-3 rounded-xl bg-[#001F49] text-white font-semibold text-sm hover:bg-[#001F49]/90 transition-colors"
            >
                Submit Another Offer
            </button>
        </motion.div>
    );
}

export default function PublicOfferPage() {
    const [formData, setFormData] = useState<OfferFormData>(initialOfferFormData);
    const [currentStep, setCurrentStep] = useState(0);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    // Honeypot field value (should remain empty)
    const [honeypot, setHoneypot] = useState("");

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
        setSubmitError(null);

        try {
            const res = await fetch("/api/offer/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    formData,
                    isPublic: true,
                    _hp_field: honeypot,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                if (res.status === 429) {
                    setSubmitError("Too many submissions. Please wait and try again later.");
                } else {
                    setSubmitError(data.error || "Submission failed. Please try again.");
                }
                return;
            }

            if (data.success) {
                setShowSuccess(true);
            } else {
                setSubmitError(data.error || "Submission failed.");
            }
        } catch {
            setSubmitError("Network error. Please check your connection and try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleNewForm = () => {
        setFormData(initialOfferFormData);
        setCurrentStep(0);
        setErrors({});
        setShowSuccess(false);
        setSubmitError(null);
    };

    if (showSuccess) {
        return <SuccessScreen onNewForm={handleNewForm} />;
    }

    const canProceed = isStepValid(currentStep, formData);

    return (
        <div className="w-full">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="text-3xl md:text-4xl font-bold text-[#001F49] tracking-tight">
                    Submit Your Offer
                </h1>
                <p className="text-gray-500 mt-2 text-base">
                    Complete the details below to submit your property purchase offer.
                </p>

                {/* Info Banner */}
                <div className="flex items-start gap-3 p-4 mt-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-100">
                    <FileText className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-amber-800">
                        <p className="font-semibold mb-1">How this works</p>
                        <p className="text-amber-600 leading-relaxed">
                            Complete the offer details and submit. The information will be
                            securely sent to our office for contract preparation. We encourage
                            you to present your{" "}
                            <strong>best and final offer</strong> to strengthen your position.
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Honeypot — invisible to real users */}
            <div aria-hidden="true" className="absolute -left-[9999px] opacity-0 h-0 overflow-hidden">
                <label htmlFor="hp_website">Website</label>
                <input
                    id="hp_website"
                    name="_hp_field"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                />
            </div>

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

            {/* Step Content */}
            <motion.div className="mt-8" initial={false}>
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
                                    onJumpToStep={setCurrentStep}
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

            {/* Security Badge */}
            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400">
                <Shield className="w-3.5 h-3.5" />
                <span>Your information is encrypted and securely transmitted</span>
            </div>

            {/* Mobile Spacing */}
            {isSubmitting && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                        <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
                        <span className="text-gray-700 font-medium">Submitting your offer...</span>
                    </div>
                </div>
            )}
        </div>
    );
}
