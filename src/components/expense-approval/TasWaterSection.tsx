"use client";

import type { ExpenseApprovalFormData } from "@/lib/expense-approval/types";
import { AlertCircle, Info, Droplets, MapPin, Calendar, Copy } from "lucide-react";
import { SuburbAutocomplete } from "@/components/saa/SuburbAutocomplete";
import { isValidSuburb } from "@/lib/saa/suburbs";

interface TasWaterSectionProps {
    formData: ExpenseApprovalFormData;
    updateFormData: (updates: Partial<ExpenseApprovalFormData>) => void;
    errors: Record<string, string>;
    setErrors: (errors: Record<string, string>) => void;
}

export function TasWaterSection({
    formData,
    updateFormData,
    errors,
    setErrors,
}: TasWaterSectionProps) {
    const clearError = (key: string) => {
        if (errors[key]) {
            const newErrors = { ...errors };
            delete newErrors[key];
            setErrors(newErrors);
        }
    };

    const handlePostalSameAsProperty = (checked: boolean) => {
        if (checked) {
            updateFormData({
                taswaterPostalSameAsProperty: true,
                taswaterPostalStreet: formData.propertyStreet,
                taswaterPostalSuburb: formData.propertySuburb,
                taswaterPostalPostcode: formData.propertyPostcode,
                taswaterPostalState: formData.propertyState,
            });
        } else {
            updateFormData({
                taswaterPostalSameAsProperty: false,
                taswaterPostalStreet: "",
                taswaterPostalSuburb: "",
                taswaterPostalPostcode: "",
                taswaterPostalState: "TAS",
            });
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Info Banner */}
            <div className="flex items-start gap-3 p-4 bg-teal-50 rounded-xl border border-teal-100">
                <Droplets className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-teal-700">
                    Please provide your TasWater account details below. This information will be used
                    to set up the authority for us to manage your water account on your behalf.
                </p>
            </div>

            {/* Account Details */}
            <div className="p-4 sm:p-5 bg-gray-50/50 rounded-xl border border-gray-100 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                    <Droplets className="w-4 h-4 text-teal-600" />
                    <h3 className="font-semibold text-harcourts-navy">Account Details</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <label className="field-label">Account Number *</label>
                        <input
                            type="text"
                            value={formData.taswaterAccountNo}
                            onChange={(e) => {
                                updateFormData({ taswaterAccountNo: e.target.value });
                                clearError("taswaterAccountNo");
                            }}
                            placeholder="e.g. 12345678"
                            className={`form-input ${errors.taswaterAccountNo ? "border-red-500" : ""}`}
                        />
                        {errors.taswaterAccountNo && (
                            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />{errors.taswaterAccountNo}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="field-label">Account Name *</label>
                        <input
                            type="text"
                            value={formData.taswaterAccountName}
                            onChange={(e) => {
                                updateFormData({ taswaterAccountName: e.target.value });
                                clearError("taswaterAccountName");
                            }}
                            placeholder="As it appears on your TasWater account"
                            className={`form-input ${errors.taswaterAccountName ? "border-red-500" : ""}`}
                        />
                        {errors.taswaterAccountName && (
                            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />{errors.taswaterAccountName}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Postal Address */}
            <div className="p-4 sm:p-5 bg-gray-50/50 rounded-xl border border-gray-100 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-teal-600" />
                        <h3 className="font-semibold text-harcourts-navy">Postal Address for Notices</h3>
                    </div>
                    <button
                        type="button"
                        onClick={() => handlePostalSameAsProperty(!formData.taswaterPostalSameAsProperty)}
                        className="text-xs text-teal-600 hover:text-teal-800 font-medium flex items-center gap-1 transition-colors"
                    >
                        <Copy className="w-3 h-3" />
                        {formData.taswaterPostalSameAsProperty
                            ? "Unlink Property Address"
                            : "Same as Property Address"}
                    </button>
                </div>

                {formData.taswaterPostalSameAsProperty ? (
                    <div className="p-3 bg-teal-50/50 rounded-lg border border-teal-100">
                        <p className="text-sm text-gray-700">
                            {formData.propertyStreet}, {formData.propertySuburb} {formData.propertyState} {formData.propertyPostcode}
                        </p>
                        <p className="text-xs text-teal-500 mt-1">Linked to property address above</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        {/* Street Address - 8 cols */}
                        <div className="md:col-span-8">
                            <label className="field-label">Street Address *</label>
                            <input
                                type="text"
                                value={formData.taswaterPostalStreet}
                                onChange={(e) => {
                                    updateFormData({ taswaterPostalStreet: e.target.value });
                                    clearError("taswaterPostalStreet");
                                }}
                                placeholder="e.g. PO Box 113"
                                className={`form-input ${errors.taswaterPostalStreet ? "border-red-500" : ""}`}
                            />
                            {errors.taswaterPostalStreet && (
                                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />{errors.taswaterPostalStreet}
                                </p>
                            )}
                        </div>

                        {/* Postcode - 4 cols */}
                        <div className="md:col-span-4">
                            <label className="field-label">Postcode *</label>
                            <input
                                type="text"
                                value={formData.taswaterPostalPostcode}
                                onChange={(e) => {
                                    updateFormData({ taswaterPostalPostcode: e.target.value.replace(/[^0-9]/g, "") });
                                    clearError("taswaterPostalPostcode");
                                }}
                                placeholder="7315"
                                maxLength={4}
                                className={`form-input ${errors.taswaterPostalPostcode ? "border-red-500" : ""}`}
                            />
                            {errors.taswaterPostalPostcode && (
                                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />{errors.taswaterPostalPostcode}
                                </p>
                            )}
                        </div>

                        {/* Suburb with Autocomplete - full width */}
                        <div className="md:col-span-12">
                            <label htmlFor="property-suburb" className="field-label">Suburb *</label>
                            <SuburbAutocomplete
                                value={formData.taswaterPostalSuburb}
                                onChange={(value) => {
                                    updateFormData({ taswaterPostalSuburb: value });
                                    clearError("taswaterPostalSuburb");
                                }}
                                onSelect={(suburb) => {
                                    updateFormData({
                                        taswaterPostalSuburb: suburb.suburb,
                                        taswaterPostalPostcode: suburb.postcode,
                                        taswaterPostalState: suburb.state,
                                    });
                                    const newErrors = { ...errors };
                                    delete newErrors.taswaterPostalSuburb;
                                    delete newErrors.taswaterPostalPostcode;
                                    setErrors(newErrors);
                                }}
                                error={!!errors.taswaterPostalSuburb}
                            />
                            {errors.taswaterPostalSuburb && (
                                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />{errors.taswaterPostalSuburb}
                                </p>
                            )}
                            {formData.taswaterPostalSuburb &&
                                !isValidSuburb(formData.taswaterPostalSuburb) && (
                                    <p className="text-xs text-amber-600 mt-1">
                                        Warning: Suburb not found in Tasmania database
                                    </p>
                                )}
                        </div>
                    </div>
                )}
            </div>

            {/* Additional Options */}
            <div className="p-4 sm:p-5 bg-gray-50/50 rounded-xl border border-gray-100 space-y-5">
                <div className="flex items-center gap-2 mb-1">
                    <Info className="w-4 h-4 text-teal-600" />
                    <h3 className="font-semibold text-harcourts-navy">Additional Options</h3>
                </div>

                {/* Cancel BPAY */}
                <div>
                    <label className="field-label mb-2 block">
                        Would you like to cancel any existing BPAY arrangement?
                    </label>
                    <div className="flex gap-4">
                        {[
                            { label: "Yes", value: true },
                            { label: "No", value: false },
                        ].map((opt) => (
                            <label
                                key={`bpay-${opt.label}`}
                                className={`
                                    flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-all text-sm
                                    ${formData.taswaterCancelBpay === opt.value
                                        ? "border-teal-500 bg-teal-50 text-teal-700 font-medium"
                                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                                    }
                                `}
                            >
                                <input
                                    type="radio"
                                    name="cancelBpay"
                                    checked={formData.taswaterCancelBpay === opt.value}
                                    onChange={() => updateFormData({ taswaterCancelBpay: opt.value })}
                                    className="sr-only"
                                />
                                {opt.label}
                            </label>
                        ))}
                    </div>
                </div>

                {/* Cancel Direct Debit */}
                <div>
                    <label className="field-label mb-2 block">
                        Would you like to cancel any existing Direct Debit arrangement?
                    </label>
                    <div className="flex gap-4">
                        {[
                            { label: "Yes", value: true },
                            { label: "No", value: false },
                        ].map((opt) => (
                            <label
                                key={`dd-${opt.label}`}
                                className={`
                                    flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-all text-sm
                                    ${formData.taswaterCancelDirectDebit === opt.value
                                        ? "border-teal-500 bg-teal-50 text-teal-700 font-medium"
                                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                                    }
                                `}
                            >
                                <input
                                    type="radio"
                                    name="cancelDirectDebit"
                                    checked={formData.taswaterCancelDirectDebit === opt.value}
                                    onChange={() => updateFormData({ taswaterCancelDirectDebit: opt.value })}
                                    className="sr-only"
                                />
                                {opt.label}
                            </label>
                        ))}
                    </div>
                </div>

                {/* Change of Ownership */}
                <div className="space-y-3">
                    <label className="field-label mb-2 block">
                        Is there a recent change of ownership?
                    </label>
                    <div className="flex gap-4">
                        {[
                            { label: "Yes", value: true },
                            { label: "No", value: false },
                        ].map((opt) => (
                            <label
                                key={`ownership-${opt.label}`}
                                className={`
                                    flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-all text-sm
                                    ${formData.taswaterChangeOwnership === opt.value
                                        ? "border-teal-500 bg-teal-50 text-teal-700 font-medium"
                                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                                    }
                                `}
                            >
                                <input
                                    type="radio"
                                    name="changeOwnership"
                                    checked={formData.taswaterChangeOwnership === opt.value}
                                    onChange={() => updateFormData({ taswaterChangeOwnership: opt.value })}
                                    className="sr-only"
                                />
                                {opt.label}
                            </label>
                        ))}
                    </div>

                    {/* Settlement Date - conditional */}
                    {formData.taswaterChangeOwnership && (
                        <div className="ml-0 mt-3 p-3 bg-teal-50/50 rounded-lg border border-teal-100">
                            <label className="field-label flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-teal-600" />
                                Settlement Date *
                            </label>
                            <input
                                type="date"
                                value={formData.taswaterSettlementDate}
                                onChange={(e) => {
                                    updateFormData({ taswaterSettlementDate: e.target.value });
                                    clearError("taswaterSettlementDate");
                                }}
                                className={`form-input mt-1 ${errors.taswaterSettlementDate ? "border-red-500" : ""}`}
                            />
                            {errors.taswaterSettlementDate && (
                                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />{errors.taswaterSettlementDate}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
