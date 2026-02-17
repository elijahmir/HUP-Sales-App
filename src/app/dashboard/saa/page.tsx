"use client";

import { useState, useEffect } from "react";
import { FileText, RotateCcw, Save, Clock, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AgentSection } from "@/components/saa/AgentSection";
import { PropertySection } from "@/components/saa/PropertySection";
import { AnnexureSection } from "@/components/saa/AnnexureSection";
import { VendorSection } from "@/components/saa/VendorSection";
import { MarketingSection } from "@/components/saa/MarketingSection";
import { FormStepper } from "@/components/saa/FormStepper";
import { ReviewModal } from "@/components/saa/ReviewModal";
import { SuccessModal } from "@/components/saa/SuccessModal";
import { LoadingModal } from "@/components/saa/LoadingModal";
import { ConfirmModal } from "@/components/saa/ConfirmModal";
import { HistoryDrawer } from "@/components/saa/HistoryDrawer";
import type { FormData } from "@/lib/saa/types";
import { initialFormData } from "@/lib/saa/types";
import {
  isValidAgent,
  isValidProperty,
  isValidPricing,
  isValidVendor,
  isValidMarketing,
  isValidAnnexure,
} from "@/lib/saa/validation";
import {
  saveSubmission,
  getHistory,
  loadSubmission,
  type HistoryEntry,
} from "@/lib/saa/historyStorage";
import { submitForm } from "@/lib/saa/api";

import { MarketingItem } from "@/lib/saa/marketing";

export default function SAAFormPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [marketingOptions, setMarketingOptions] = useState<MarketingItem[]>([]);

  // Modals & UI State
  const [showHistory, setShowHistory] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  // Success Data
  const [successData, setSuccessData] = useState<{
    vendorName: string;
    docusignUrl?: string;
  } | null>(null);

  // History Data
  const [historyEntries, setHistoryEntries] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    setHistoryEntries(getHistory());

    async function loadMarketing() {
      try {
        const response = await fetch("/api/vaultre/expense-types");
        if (!response.ok) {
          throw new Error("Failed to fetch expense types");
        }
        const types = await response.json();
        const mapped: MarketingItem[] = types
          .filter((t: any) => t.amount > 0)
          .map((t: any) => ({
            id: String(t.id),
            name: t.name,
            price: t.amount,
            group: t.supplier.name,
            supplierId: t.supplier.id,
          }));

        if (mapped.length > 0) {
          setMarketingOptions(mapped);
        }
      } catch (e) {
        console.error("Failed to load marketing items", e);
      }
    }
    loadMarketing();
  }, []);

  const updateHistory = () => {
    setHistoryEntries(getHistory());
  };

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const steps = formData.annexureA
    ? [
        { id: 1, title: "Agent Details", shortTitle: "Agent" },
        { id: 2, title: "Property Details", shortTitle: "Property" },
        { id: 3, title: "Annexure A", shortTitle: "Annexure" },
        { id: 4, title: "Vendor Details", shortTitle: "Vendor" },
        { id: 5, title: "Marketing", shortTitle: "Marketing" },
      ]
    : [
        { id: 1, title: "Agent Details", shortTitle: "Agent" },
        { id: 2, title: "Property Details", shortTitle: "Property" },
        { id: 3, title: "Vendor Details", shortTitle: "Vendor" },
        { id: 4, title: "Marketing", shortTitle: "Marketing" },
      ];

  // Validation
  const validateStep = (stepIndex: number): boolean => {
    let stepErrors = {};
    let isValid = true;

    // Determine logical step (accounting for Annexure)
    const currentStepId = steps[stepIndex].id;

    if (currentStepId === 1) {
      // Agent
      const res = isValidAgent(formData);
      stepErrors = res.errors;
      isValid = res.isValid;
    } else if (currentStepId === 2) {
      // Property
      const res = isValidProperty(formData);
      // Combine property and pricing validation as they are in the same component visually in previous logic,
      // but here PropertySection has them both.
      // Wait, PropertySection has Address + Legal + Pricing + Commission + Agency.
      // So we need property validation AND pricing validation.
      const pricingRes = isValidPricing(formData);
      stepErrors = { ...res.errors, ...pricingRes.errors };
      isValid = res.isValid && pricingRes.isValid;
    } else if (currentStepId === 3 && formData.annexureA) {
      // Annexure
      const res = isValidAnnexure(formData);
      stepErrors = res.errors;
      isValid = res.isValid;
    } else if (currentStepId === (formData.annexureA ? 4 : 3)) {
      // Vendor
      const res = isValidVendor(formData);
      stepErrors = res.errors;
      isValid = res.isValid;
    } else if (currentStepId === (formData.annexureA ? 5 : 4)) {
      // Marketing
      // Marketing often optional or basic
      isValid = true;
    }

    setErrors(stepErrors);
    return isValid;
  };

  const handleStepChange = (newStep: number) => {
    // Only validate if moving forward
    if (newStep > currentStep) {
      if (validateStep(currentStep)) {
        setCurrentStep(newStep);
        window.scrollTo(0, 0);
      } else {
        // Show validation errors (handled by passing errors to components)
        const firstError = document.querySelector(".error-text");
        firstError?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    } else {
      setCurrentStep(newStep);
    }
  };

  const checkCanProceed = () => {
    // Basic check if required fields are filled to enable button visually
    // Real validation happens on click
    return true;
  };

  const handleInitialSubmit = () => {
    if (validateStep(currentStep)) {
      setShowReview(true);
    }
  };

  const handleFinalSubmit = async () => {
    setShowReview(false);
    setIsSubmitting(true);

    // Save locally
    saveSubmission(formData);
    updateHistory();

    try {
      const result = await submitForm(formData, marketingOptions);
      if (result.success) {
        setSuccessData({
          vendorName: result.vendorName,
          docusignUrl: result.docusignUrl,
        });
        setShowSuccess(true);
      }
    } catch (error) {
      console.error("Submission error:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Failed to submit agreement. Please try again.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData(initialFormData);
    setCurrentStep(0);
    setErrors({});
    setConfirmReset(false);
    setShowSuccess(false);
  };

  const handleLoadHistory = (id: string) => {
    const loadedData = loadSubmission(id);
    if (loadedData) {
      setFormData(loadedData);
      setCurrentStep(0);
      setShowHistory(false);
    }
  };

  const renderStepContent = () => {
    const currentStepId = steps[currentStep].id;

    // Map ID to visual component
    // If Annexure is NOT enabled:
    // 1 -> Agent
    // 2 -> Property
    // 3 -> Vendor
    // 4 -> Marketing

    // If Annexure IS enabled:
    // 1 -> Agent
    // 2 -> Property
    // 3 -> Annexure
    // 4 -> Vendor
    // 5 -> Marketing

    if (currentStepId === 1) {
      return (
        <AgentSection formData={formData} updateFormData={updateFormData} />
      );
    } else if (currentStepId === 2) {
      return (
        <PropertySection
          formData={formData}
          updateFormData={updateFormData}
          errors={errors}
          setErrors={setErrors}
        />
      );
    } else if (formData.annexureA && currentStepId === 3) {
      return (
        <AnnexureSection
          formData={formData}
          updateFormData={updateFormData}
          errors={errors}
        />
      );
    } else if (
      (formData.annexureA && currentStepId === 4) ||
      (!formData.annexureA && currentStepId === 3)
    ) {
      return (
        <VendorSection
          formData={formData}
          updateFormData={updateFormData}
          errors={errors}
          setErrors={setErrors}
        />
      );
    } else {
      return (
        <MarketingSection
          formData={formData}
          updateFormData={updateFormData}
          items={marketingOptions}
        />
      );
    }
  };

  if (showSuccess && successData) {
    return (
      <SuccessModal
        vendorName={successData.vendorName}
        docusignUrl={successData.docusignUrl}
        onClose={() => setShowSuccess(false)}
        onNewAgreement={handleReset}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* Header */}
      <HistoryDrawer
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        onLoad={handleLoadHistory}
        entries={historyEntries}
        onUpdate={updateHistory}
      />

      <main className="max-w-4xl mx-auto px-4 pt-8">
        {/* Page Title & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-harcourts-navy">
              Sole Agency Agreement
            </h1>
            <p className="text-gray-500">Digital Contract Generation</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHistory(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-harcourts-blue transition-colors shadow-sm"
              title="History"
            >
              <Clock className="w-4 h-4" />
              <span className="hidden sm:inline">History</span>
            </button>
            <button
              onClick={() => setConfirmReset(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-colors shadow-sm"
              title="Reset Form"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>
        </div>
        {/* Step Card matching Source */}
        <div className="card p-4 md:p-8">
          <FormStepper
            steps={steps}
            currentStep={currentStep}
            onStepChange={handleStepChange}
            canProceed={checkCanProceed()}
            isLastStep={currentStep === steps.length - 1}
            onSubmit={handleInitialSubmit}
            isSubmitting={isSubmitting}
            showNavigation={false}
          />

          <div className="my-8">{renderStepContent()}</div>

          <FormStepper
            steps={steps}
            currentStep={currentStep}
            onStepChange={handleStepChange}
            canProceed={checkCanProceed()}
            isLastStep={currentStep === steps.length - 1}
            onSubmit={handleInitialSubmit}
            isSubmitting={isSubmitting}
            showStepIndicators={false}
          />
        </div>
      </main>

      {/* Modals */}
      <ReviewModal
        isOpen={showReview}
        formData={formData}
        onConfirm={handleFinalSubmit}
        onCancel={() => setShowReview(false)}
        items={marketingOptions}
      />

      <LoadingModal isOpen={isSubmitting} />

      <ConfirmModal
        isOpen={confirmReset}
        title="Reset Form?"
        message="Are you sure you want to start over? All entered data will be lost."
        confirmText="Reset"
        variant="danger"
        onConfirm={handleReset}
        onCancel={() => setConfirmReset(false)}
      />
    </div>
  );
}
