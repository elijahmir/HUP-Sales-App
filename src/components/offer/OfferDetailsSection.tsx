"use client";

import type { OfferFormData } from "@/lib/offer/types";
import { formatCurrency } from "@/lib/offer/validation";
import {
    AlertCircle,
    Info,
    DollarSign,
    Landmark,
    ClipboardCheck,
    Calendar,
} from "lucide-react";

interface OfferDetailsSectionProps {
    formData: OfferFormData;
    updateFormData: (updates: Partial<OfferFormData>) => void;
    errors: Record<string, string>;
    setErrors: (errors: Record<string, string>) => void;
}

export function OfferDetailsSection({
    formData,
    updateFormData,
    errors,
    setErrors,
}: OfferDetailsSectionProps) {
    const handleChange = (field: keyof OfferFormData, value: string | boolean) => {
        updateFormData({ [field]: value });
        if (errors[field as string]) {
            const newErrors = { ...errors };
            delete newErrors[field as string];
            setErrors(newErrors);
        }
    };

    const handleCurrencyChange = (field: keyof OfferFormData, value: string) => {
        const formatted = formatCurrency(value);
        handleChange(field, formatted);
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* ===== Offer Price & Deposit ===== */}
            <div className="space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-harcourts-navy">
                            Offer Price & Deposit
                        </h3>
                        <p className="text-sm text-gray-500">
                            Your proposed purchase price and deposit details
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Offer Price */}
                    <div>
                        <label className="field-label">Offer Price ($)</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                                $
                            </span>
                            <input
                                type="text"
                                value={formData.offerPrice}
                                onChange={(e) =>
                                    handleCurrencyChange("offerPrice", e.target.value)
                                }
                                className={`input-field pl-8 ${errors.offerPrice ? "border-red-500" : ""}`}
                                placeholder="500,000"
                            />
                        </div>
                        {errors.offerPrice && (
                            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" /> {errors.offerPrice}
                            </p>
                        )}
                    </div>

                    {/* Deposit */}
                    <div>
                        <label className="field-label">Deposit Amount ($)</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                                $
                            </span>
                            <input
                                type="text"
                                value={formData.depositAmount}
                                onChange={(e) =>
                                    handleCurrencyChange("depositAmount", e.target.value)
                                }
                                className={`input-field pl-8 ${errors.depositAmount ? "border-red-500" : ""}`}
                                placeholder="25,000"
                            />
                        </div>
                        {errors.depositAmount && (
                            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" /> {errors.depositAmount}
                            </p>
                        )}
                    </div>
                </div>

                {/* Deposit Info */}
                <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100">
                    <Info className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-700">
                        We suggest a <strong>5% deposit</strong> and no split deposits.
                        Deposit to be paid within <strong>3 days</strong> of contract date.
                    </p>
                </div>
            </div>

            {/* ===== Finance ===== */}
            <div className="space-y-4">
                <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                        <Landmark className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-bold text-harcourts-navy">
                        Finance
                    </h3>
                </div>

                {/* Finance Required Toggle */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <span className="text-sm font-medium text-gray-700">
                        Is finance required?
                    </span>
                    <div className="flex gap-2">
                        {[true, false].map((val) => (
                            <button
                                key={val.toString()}
                                type="button"
                                onClick={() => handleChange("financeRequired", val)}
                                className={`
                  px-4 py-2 rounded-lg text-sm font-semibold transition-all border
                  ${formData.financeRequired === val
                                        ? val
                                            ? "border-blue-400 bg-blue-50 text-blue-700"
                                            : "border-gray-400 bg-gray-100 text-gray-700"
                                        : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                                    }
                `}
                            >
                                {val ? "Yes" : "No"}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Finance Details (conditional) */}
                {formData.financeRequired && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4 border-l-2 border-blue-200 animate-fade-in">
                        <div>
                            <label className="field-label">Bank / Lender</label>
                            <input
                                type="text"
                                value={formData.bankLender}
                                onChange={(e) =>
                                    handleChange("bankLender", e.target.value)
                                }
                                className={`input-field ${errors.bankLender ? "border-red-500" : ""}`}
                                placeholder="Commonwealth Bank"
                            />
                            {errors.bankLender && (
                                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" /> {errors.bankLender}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="field-label">Amount to be Borrowed ($)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                                    $
                                </span>
                                <input
                                    type="text"
                                    value={formData.financeAmount}
                                    onChange={(e) =>
                                        handleCurrencyChange("financeAmount", e.target.value)
                                    }
                                    className={`input-field pl-8 ${errors.financeAmount ? "border-red-500" : ""}`}
                                    placeholder="400,000"
                                />
                            </div>
                            {errors.financeAmount && (
                                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" /> {errors.financeAmount}
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* ===== Other Conditions ===== */}
            <div className="space-y-4">
                <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                    <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
                        <ClipboardCheck className="w-5 h-5 text-violet-600" />
                    </div>
                    <h3 className="text-lg font-bold text-harcourts-navy">
                        Other Conditions
                    </h3>
                </div>

                {/* Building Inspection */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <span className="text-sm font-medium text-gray-700">
                        Building &amp; pest inspection required?
                    </span>
                    <div className="flex gap-2">
                        {[true, false].map((val) => (
                            <button
                                key={`bi-${val}`}
                                type="button"
                                onClick={() => handleChange("buildingInspection", val)}
                                className={`
                  px-4 py-2 rounded-lg text-sm font-semibold transition-all border
                  ${formData.buildingInspection === val
                                        ? val
                                            ? "border-violet-400 bg-violet-50 text-violet-700"
                                            : "border-gray-400 bg-gray-100 text-gray-700"
                                        : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                                    }
                `}
                            >
                                {val ? "Yes" : "No"}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Cooling Off */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <span className="text-sm font-medium text-gray-700">
                        Cooling off period required?
                    </span>
                    <div className="flex gap-2">
                        {[true, false].map((val) => (
                            <button
                                key={`co-${val}`}
                                type="button"
                                onClick={() => handleChange("coolingOffPeriod", val)}
                                className={`
                  px-4 py-2 rounded-lg text-sm font-semibold transition-all border
                  ${formData.coolingOffPeriod === val
                                        ? val
                                            ? "border-violet-400 bg-violet-50 text-violet-700"
                                            : "border-gray-400 bg-gray-100 text-gray-700"
                                        : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                                    }
                `}
                            >
                                {val ? "Yes" : "No"}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Settlement Period */}
                <div>
                    <label className="field-label flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        Desired Settlement Period
                    </label>
                    <input
                        type="text"
                        value={formData.settlementPeriod}
                        onChange={(e) =>
                            handleChange("settlementPeriod", e.target.value)
                        }
                        className={`input-field ${errors.settlementPeriod ? "border-red-500" : ""}`}
                        placeholder="30 days"
                    />
                    {errors.settlementPeriod && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> {errors.settlementPeriod}
                        </p>
                    )}
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100 mt-2">
                        <Info className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-gray-500">
                            Generally <strong>30 days</strong> after satisfaction of other clauses.
                        </p>
                    </div>
                </div>

                {/* Special Clauses */}
                <div>
                    <label className="field-label">
                        Any Other Special Clauses
                    </label>
                    <textarea
                        value={formData.specialClauses}
                        onChange={(e) =>
                            handleChange("specialClauses", e.target.value)
                        }
                        className="input-field-normal min-h-[120px] resize-y"
                        placeholder="Enter any additional terms and conditions..."
                        rows={4}
                    />
                </div>
            </div>
        </div>
    );
}
