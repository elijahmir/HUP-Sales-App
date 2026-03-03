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
    FileText,
    Check
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

    const MINIMUM_DEPOSIT = 10000;
    const DEPOSIT_PERCENTAGE = 0.05;

    const handleOfferPriceChange = (value: string) => {
        const formattedOfferPrice = formatCurrency(value);

        // Calculate deposit
        const numericOfferPrice = parseFloat(formattedOfferPrice.replace(/,/g, "")) || 0;

        let calculatedDepositStr = "";
        if (numericOfferPrice > 0) {
            const calculatedDeposit = Math.max(numericOfferPrice * DEPOSIT_PERCENTAGE, MINIMUM_DEPOSIT);
            calculatedDepositStr = formatCurrency(calculatedDeposit.toString());
        }

        updateFormData({
            offerPrice: formattedOfferPrice,
            depositAmount: calculatedDepositStr,
        });

        // Clear errors if any
        const newErrors = { ...errors };
        if (newErrors.offerPrice) delete newErrors.offerPrice;
        if (newErrors.depositAmount) delete newErrors.depositAmount;
        if (Object.keys(newErrors).length !== Object.keys(errors).length) {
            setErrors(newErrors);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) {
            updateFormData({ appendixFileName: "", appendixFileBase64: "" });
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setErrors({ ...errors, appendixFile: "File size exceeds 5MB limit" });
            return;
        } else if (errors.appendixFile) {
            const newErrors = { ...errors };
            delete newErrors.appendixFile;
            setErrors(newErrors);
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            updateFormData({
                appendixFileName: file.name,
                appendixFileBase64: reader.result as string,
            });
        };
        reader.onerror = () => {
            setErrors({ ...errors, appendixFile: "Failed to read file" });
        };
        reader.readAsDataURL(file);
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
                                    handleOfferPriceChange(e.target.value)
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
                        Building inspection required?
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
                            Generally <strong>30 days</strong> after satisfaction of all other clauses.
                        </p>
                    </div>
                </div>

                {/* Subject to sale */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <span className="text-sm font-medium text-gray-700">
                        Subject to sale clause?
                    </span>
                    <div className="flex gap-2">
                        {[true, false].map((val) => (
                            <button
                                key={`sts-${val}`}
                                type="button"
                                onClick={() => handleChange("subjectToSale", val)}
                                className={`
                  px-4 py-2 rounded-lg text-sm font-semibold transition-all border
                  ${formData.subjectToSale === val
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

                {/* Subject to Sale Details (conditional) */}
                {formData.subjectToSale && (
                    <div className="space-y-4 pl-4 border-l-2 border-violet-200 animate-fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="field-label">Purchaser's Property Address</label>
                                <input
                                    type="text"
                                    value={formData.subjectToSaleAddress}
                                    onChange={(e) =>
                                        handleChange("subjectToSaleAddress", e.target.value)
                                    }
                                    className={`input-field ${errors.subjectToSaleAddress ? "border-red-500" : ""}`}
                                    placeholder="123 Example Street, Hobart TAS 7000"
                                />
                                {errors.subjectToSaleAddress && (
                                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" /> {errors.subjectToSaleAddress}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="field-label">Maximum Asking Price ($)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                                        $
                                    </span>
                                    <input
                                        type="text"
                                        value={formData.subjectToSalePrice}
                                        onChange={(e) =>
                                            handleCurrencyChange("subjectToSalePrice", e.target.value)
                                        }
                                        className={`input-field pl-8 ${errors.subjectToSalePrice ? "border-red-500" : ""}`}
                                        placeholder="500,000"
                                    />
                                </div>
                                {errors.subjectToSalePrice && (
                                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" /> {errors.subjectToSalePrice}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="field-label mb-2">Currently Under Contract?</label>
                                <div className="flex gap-2">
                                    {[true, false].map((val) => (
                                        <button
                                            key={`sts-uc-${val}`}
                                            type="button"
                                            onClick={() => handleChange("subjectToSaleUnderContract", val)}
                                            className={`
                        px-4 py-2 h-[46px] flex-1 rounded-lg text-sm font-semibold transition-all border
                        ${formData.subjectToSaleUnderContract === val
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
                        </div>

                        {formData.subjectToSaleUnderContract && (
                            <div className="animate-fade-in w-full md:w-1/2">
                                <label className="field-label flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-gray-400" />
                                    Expected Completion Date
                                </label>
                                <input
                                    type="date"
                                    value={formData.subjectToSaleCompletionDate}
                                    onChange={(e) =>
                                        handleChange("subjectToSaleCompletionDate", e.target.value)
                                    }
                                    className={`input-field ${errors.subjectToSaleCompletionDate ? "border-red-500" : ""}`}
                                />
                                {errors.subjectToSaleCompletionDate && (
                                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" /> {errors.subjectToSaleCompletionDate}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                )}

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

            {/* ===== Appendices ===== */}
            <div className="space-y-4">
                <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-orange-600" />
                    </div>
                    <h3 className="text-lg font-bold text-harcourts-navy">
                        Appendices
                    </h3>
                </div>
                <div>
                    <label className="field-label">Additional Documents (Optional)</label>
                    <p className="text-sm text-gray-500 mb-3">
                        Upload any supporting documents (e.g., pre-approval letter, special conditions draft). Max 5MB. PDF or images only.
                    </p>
                    <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleFileUpload}
                        className="block w-full text-sm text-gray-500
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-full file:border-0
                            file:text-sm file:font-semibold
                            file:bg-orange-50 file:text-orange-700
                            hover:file:bg-orange-100 cursor-pointer"
                    />
                    {formData.appendixFileName && (
                        <p className="text-sm text-emerald-600 mt-2 flex items-center gap-1">
                            <Check className="w-4 h-4" /> {formData.appendixFileName} attached
                        </p>
                    )}
                    {errors.appendixFile && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> {errors.appendixFile}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
