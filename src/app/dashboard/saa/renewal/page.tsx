"use client";

import { useState, useEffect, useCallback } from "react";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

import {
  RenewalPropertySelector,
  type RenewalPropertyOption,
} from "@/components/saa/renewal/RenewalPropertySelector";
import { RenewalDataReview } from "@/components/saa/renewal/RenewalDataReview";
import { RenewalDurationForm } from "@/components/saa/renewal/RenewalDurationForm";
import { RenewalAnnexureSection } from "@/components/saa/renewal/RenewalAnnexureSection";
import { FormStepper, FormNavigation } from "@/components/saa/FormStepper";
import { SuccessModal } from "@/components/saa/SuccessModal";
import { LoadingModal } from "@/components/saa/LoadingModal";

import type {
  RenewalPropertyData,
  RenewalFormData,
} from "@/lib/saa/renewal/types";
import { initialRenewalFormData, RENEWAL_STEPS } from "@/lib/saa/renewal/types";
import { submitRenewal } from "@/lib/saa/renewal/api";
import type { RenewalAnnexureItem } from "@/lib/saa/renewal/api";
import type { MarketingItem } from "@/lib/saa/marketing";
import {
  getAgentByName,
  getOfficeByName,
} from "@/lib/saa/agents";

export default function SAARewalPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<RenewalFormData>(initialRenewalFormData);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  // Property data loaded from VaultRE
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Marketing
  const [marketingOptions, setMarketingOptions] = useState<MarketingItem[]>([]);
  const [selectedMarketingIds, setSelectedMarketingIds] = useState<string[]>(
    [],
  );

  // UI State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successData, setSuccessData] = useState<{
    vendorName: string;
    docusignUrl?: string;
  } | null>(null);

  // Annexure A — hybrid data from previous SAA submission in DB
  const [annexureItems, setAnnexureItems] = useState<RenewalAnnexureItem[] | null>(null);
  const [includeAnnexure, setIncludeAnnexure] = useState(true);
  const [annexureSourceDate, setAnnexureSourceDate] = useState<string | undefined>(undefined);

  // Load marketing items from VaultRE
  useEffect(() => {
    async function loadMarketing() {
      try {
        const response = await fetch("/api/vaultre/expense-types");
        if (!response.ok) throw new Error("Failed to fetch expense types");
        const types = await response.json();
        const mapped: MarketingItem[] = types
          .filter((t: { amount: number }) => t.amount > 0)
          .map(
            (t: {
              id: string | number;
              name: string;
              amount: number;
              supplier: { name: string; id: string };
            }) => ({
              id: String(t.id),
              name: t.name,
              price: t.amount,
              group: t.supplier.name,
              supplierId: t.supplier.id,
            }),
          );

        if (mapped.length > 0) setMarketingOptions(mapped);
      } catch (e) {
        console.error("Failed to load marketing items", e);
      }
    }
    loadMarketing();
  }, []);

  const updateFormData = useCallback(
    (updates: Partial<RenewalFormData>) => {
      setFormData((prev) => ({ ...prev, ...updates }));
    },
    [],
  );

  /**
   * When a property is selected, fetch its full details from VaultRE
   * and auto-populate agent data from the first contact staff member.
   */
  const handlePropertySelect = useCallback(
    async (property: RenewalPropertyOption) => {
      setIsLoadingDetails(true);
      setErrors({});

      try {
        const res = await fetch(
          `/api/saa/renewal/property?id=${property.id}`,
        );
        if (!res.ok) throw new Error("Failed to fetch property details");

        const { property: detail } = (await res.json()) as {
          property: RenewalPropertyData;
        };

        // Auto-fill agent from the first contact staff member
        let agentName = "";
        let agentEmail = "";
        let agentMobile = "";
        let officeName = "";
        let officeStreet = "";
        let officeSuburb = "";
        let officeState = "";
        let officePostcode = "";
        let officePhone = "";

        if (detail.contactStaff.length > 0) {
          const primaryAgent = detail.contactStaff[0];
          const fullName = `${primaryAgent.firstName} ${primaryAgent.lastName}`.trim();
          const matchedAgent = getAgentByName(fullName);

          if (matchedAgent) {
            agentName = matchedAgent.name;
            agentEmail = matchedAgent.email;
            agentMobile = matchedAgent.mobile;

            const office = getOfficeByName(matchedAgent.office);
            if (office) {
              officeName = office.name;
              officeStreet = office.street;
              officeSuburb = office.suburb;
              officeState = office.state;
              officePostcode = office.postcode;
              officePhone = office.phone;
            }
          } else {
            // Fallback: use VaultRE contact staff data directly
            agentName = fullName;
            agentEmail = primaryAgent.email;
            agentMobile = primaryAgent.mobile;
          }
        }

        // Determine commission type
        let commissionType: "fixed" | "percentage" | "reit" = "percentage";
        let commissionValue = "";
        if (detail.sellingFeePercent) {
          commissionType = "percentage";
          commissionValue = detail.sellingFeePercent.toString();
        } else if (detail.sellingFeeFixed) {
          commissionType = "fixed";
          commissionValue = detail.sellingFeeFixed.toString();
        }

        updateFormData({
          propertyId: detail.id,
          propertyData: detail,
          agentName,
          agentEmail,
          agentMobile,
          officeName,
          officeStreet,
          officeSuburb,
          officeState,
          officePostcode,
          officePhone,
          commissionType,
          commissionValue,
        });

        // Pre-select marketing items from VaultRE advertising schedule
        if (
          detail.marketingScheduleIds &&
          detail.marketingScheduleIds.length > 0
        ) {
          // Only select items that exist in both schedule and master catalog
          const validIds = detail.marketingScheduleIds.filter((id: string) =>
            marketingOptions.some((m) => m.id === id),
          );
          setSelectedMarketingIds(validIds);
          toast.info(
            `Pre-selected ${validIds.length} marketing item(s) from advertising schedule`,
          );
        } else {
          // No schedule — leave empty for agent to select manually
          setSelectedMarketingIds([]);
        }

        toast.success("Property data loaded from VaultRE");

        // Fetch annexure data from previous SAA submission (hybrid approach)
        try {
          const annexRes = await fetch(
            `/api/saa/renewal/annexure?street=${encodeURIComponent(detail.street)}&suburb=${encodeURIComponent(detail.suburb)}`,
          );
          if (annexRes.ok) {
            const annexData = await annexRes.json();
            if (annexData.found && annexData.items.length > 0) {
              setAnnexureItems(annexData.items);
              setIncludeAnnexure(true);
              setAnnexureSourceDate(annexData.sourceDate);
              toast.info(
                `Found ${annexData.items.length} Annexure A item(s) from previous agreement`,
              );
            } else {
              setAnnexureItems(null);
              setIncludeAnnexure(false);
              setAnnexureSourceDate(undefined);
            }
          }
        } catch (annexErr) {
          console.warn("[Renewal] Annexure fetch failed (non-critical):", annexErr);
        }
      } catch (err) {
        console.error("Failed to load property details:", err);
        toast.error("Failed to load property details. Please try again.");
      } finally {
        setIsLoadingDetails(false);
      }
    },
    [updateFormData, marketingOptions],
  );

  const handlePropertyDeselect = useCallback(() => {
    setFormData(initialRenewalFormData);
    setSelectedMarketingIds([]);
    setAnnexureItems(null);
    setIncludeAnnexure(true);
    setAnnexureSourceDate(undefined);
    setCurrentStep(0);
    setErrors({});
  }, []);

  // ─── Validation ─────────────────────────────────────────────

  const validateStep = (stepIndex: number): boolean => {
    const newErrors: Record<string, string | undefined> = {};
    let isValid = true;

    if (stepIndex === 0) {
      // Step 1: Property Selection
      if (!formData.propertyId || !formData.propertyData) {
        newErrors.property = "Please select a property to renew";
        isValid = false;
      }
    } else if (stepIndex === 1) {
      // Step 2: Review — always valid (read-only)
      isValid = true;
    } else if (stepIndex === 2) {
      // Step 3: Duration
      if (!formData.soleAgencyPeriod) {
        newErrors.soleAgencyPeriod = "Please enter the agency period";
        isValid = false;
      } else {
        const period = parseInt(formData.soleAgencyPeriod, 10);
        if (isNaN(period) || period < 1) {
          newErrors.soleAgencyPeriod = "Agency period must be at least 1 day";
          isValid = false;
        } else if (period > 365) {
          newErrors.soleAgencyPeriod = "Agency period cannot exceed 365 days";
          isValid = false;
        }
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleStepChange = (newStep: number) => {
    if (newStep > currentStep) {
      if (validateStep(currentStep)) {
        setCurrentStep(newStep);
        window.scrollTo(0, 0);
      } else {
        const firstError = document.querySelector(".error-text");
        firstError?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    } else {
      setCurrentStep(newStep);
      window.scrollTo(0, 0);
    }
  };

  // ─── Submission ─────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;
    if (!formData.propertyData) return;

    setIsSubmitting(true);

    try {
      const result = await submitRenewal(
        formData,
        formData.propertyData,
        selectedMarketingIds,
        marketingOptions,
        annexureItems,
        includeAnnexure,
      );

      if (result.success) {
        setSuccessData({
          vendorName: result.vendorName,
          docusignUrl: result.docusignUrl,
        });
        setShowSuccess(true);
      }
    } catch (error) {
      console.error("Renewal submission error:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Failed to submit renewal. Please try again.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData(initialRenewalFormData);
    setSelectedMarketingIds([]);
    setAnnexureItems(null);
    setIncludeAnnexure(true);
    setAnnexureSourceDate(undefined);
    setCurrentStep(0);
    setErrors({});
    setShowSuccess(false);
    setSuccessData(null);
  };

  // ─── Step Definitions (FormStepper compatible) ──────────────

  const stepperSteps = RENEWAL_STEPS.map((s) => ({
    id: s.id,
    title: s.title,
    shortTitle: s.title,
  }));

  // ─── Render Step Content ────────────────────────────────────

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <RenewalPropertySelector
            selectedPropertyId={formData.propertyId}
            onSelect={handlePropertySelect}
            isLoadingDetails={isLoadingDetails}
          />
        );
      case 1:
        return formData.propertyData ? (
          <>
            <RenewalDataReview
              propertyData={formData.propertyData}
              marketingItems={marketingOptions}
              selectedMarketingIds={selectedMarketingIds}
              onDeselectProperty={handlePropertyDeselect}
            />
            {/* Annexure A — shown only if previous SAA had annexure data */}
            {annexureItems && annexureItems.length > 0 && (
              <div className="mt-6">
                <RenewalAnnexureSection
                  items={annexureItems}
                  includeAnnexure={includeAnnexure}
                  onToggle={setIncludeAnnexure}
                  sourceDate={annexureSourceDate}
                />
              </div>
            )}
          </>
        ) : null;
      case 2:
        return (
          <RenewalDurationForm
            soleAgencyPeriod={formData.soleAgencyPeriod}
            agencyPeriodType={formData.agencyPeriodType}
            onUpdate={(updates) => updateFormData(updates)}
            errors={errors}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 pb-24">
      {/* Page Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/dashboard/saa"
          className="flex items-center gap-1.5 text-gray-500 hover:text-harcourts-navy transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back to SAA</span>
        </Link>
        <div className="h-6 w-px bg-gray-200" />
        <div>
          <h1 className="text-xl font-bold text-harcourts-navy">
            Create SAA Renewal
          </h1>
          <p className="text-xs text-gray-500">
            Renew an existing Sole Agency Agreement with current VaultRE data
          </p>
        </div>
      </div>

      {/* Stepper */}
      <div className="mb-6">
        <FormStepper
          steps={stepperSteps}
          currentStep={currentStep}
          onStepChange={handleStepChange}
          canProceed={true}
          isLastStep={currentStep === stepperSteps.length - 1}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          hideNavigation={true}
        />
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        {renderStepContent()}
      </div>

      {/* Bottom Navigation */}
      <div className="mt-6">
        <FormNavigation
          currentStep={currentStep}
          totalSteps={stepperSteps.length}
          canProceed={
            currentStep === 0 ? !!formData.propertyId : true
          }
          isLastStep={currentStep === stepperSteps.length - 1}
          isSubmitting={isSubmitting}
          onPrev={() => handleStepChange(currentStep - 1)}
          onNext={() => handleStepChange(currentStep + 1)}
          onSubmit={handleSubmit}
          submitLabel="Generate Renewal Agreement"
          submittingLabel="Creating Renewal..."
        />
      </div>

      {/* Loading Modal */}
      <LoadingModal isOpen={isSubmitting} />

      {/* Success Modal */}
      {showSuccess && successData && (
        <SuccessModal
          vendorName={successData.vendorName}
          docusignUrl={successData.docusignUrl}
          onClose={() => setShowSuccess(false)}
          onNewAgreement={handleReset}
        />
      )}
    </div>
  );
}
