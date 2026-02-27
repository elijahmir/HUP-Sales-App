"use client";

import { COUNTRY_CODES, createEmptyPurchaser } from "@/lib/offer/types";
import type { OfferFormData, PurchaserInfo } from "@/lib/offer/types";
import { AlertCircle, Info, UserPlus, UserMinus, Phone } from "lucide-react";
import { CustomDropdown } from "@/components/offer/CustomDropdown";

interface PurchaserSectionProps {
    formData: OfferFormData;
    updateFormData: (updates: Partial<OfferFormData>) => void;
    errors: Record<string, string>;
    setErrors: (errors: Record<string, string>) => void;
}

export function PurchaserSection({
    formData,
    updateFormData,
    errors,
    setErrors,
}: PurchaserSectionProps) {
    const updatePurchaser = (
        index: number,
        field: keyof PurchaserInfo,
        value: string
    ) => {
        const updated = [...formData.purchasers];
        updated[index] = { ...updated[index], [field]: value };
        updateFormData({ purchasers: updated });
        // Clear field error
        const key = `purchaser_${index}_${field}`;
        if (errors[key]) {
            const newErrors = { ...errors };
            delete newErrors[key];
            setErrors(newErrors);
        }
    };

    const handlePurchaserCountChange = (delta: number) => {
        const newCount = Math.min(4, Math.max(1, formData.purchaserCount + delta)) as
            | 1
            | 2
            | 3
            | 4;
        const updatedPurchasers = [...formData.purchasers];
        while (updatedPurchasers.length < newCount) {
            updatedPurchasers.push(createEmptyPurchaser());
        }
        updateFormData({
            purchaserCount: newCount,
            purchasers: updatedPurchasers,
        });
    };

    const structures: Array<{ value: OfferFormData["purchaserStructure"]; label: string }> = [
        { value: "Individual", label: "Individual" },
        { value: "Company", label: "Company" },
        { value: "Trust", label: "Trust" },
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Info Banner */}
            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-700">
                    Please enter the purchaser details exactly as they appear on{" "}
                    <strong>Government Issued ID</strong>. Up to 4 purchasers can be added.
                </p>
            </div>

            {/* Purchaser Structure */}
            <div>
                <label className="field-label mb-3 block">Purchaser Type</label>
                <div className="grid grid-cols-3 gap-3">
                    {structures.map((s) => (
                        <button
                            key={s.value}
                            type="button"
                            onClick={() => updateFormData({ purchaserStructure: s.value })}
                            className={`
                py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 border-2
                ${formData.purchaserStructure === s.value
                                    ? "border-harcourts-blue bg-harcourts-blue/5 text-harcourts-blue"
                                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                                }
              `}
                        >
                            {s.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Trust Fields */}
            {formData.purchaserStructure === "Trust" && (
                <div className="space-y-4 p-5 bg-amber-50/50 rounded-xl border border-amber-100 animate-fade-in">
                    <div>
                        <label className="field-label">Name of Trust</label>
                        <input
                            type="text"
                            value={formData.trustName}
                            onChange={(e) => updateFormData({ trustName: e.target.value })}
                            className={`input-field ${errors.trustName ? "border-red-500" : ""}`}
                            placeholder="The Family Trust"
                        />
                        {errors.trustName && (
                            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" /> {errors.trustName}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="field-label mb-2 block">Trustee Type</label>
                        <div className="grid grid-cols-2 gap-3">
                            {(["individual", "company"] as const).map((t) => (
                                <button
                                    key={t}
                                    type="button"
                                    onClick={() => updateFormData({ trusteeType: t })}
                                    className={`
                    py-2.5 px-4 rounded-lg text-sm font-medium transition-all border
                    ${formData.trusteeType === t
                                            ? "border-amber-400 bg-amber-50 text-amber-700"
                                            : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                                        }
                  `}
                                >
                                    {t === "individual" ? "Individual Trustee" : "Company Trustee"}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Company Fields */}
            {(formData.purchaserStructure === "Company" ||
                (formData.purchaserStructure === "Trust" &&
                    formData.trusteeType === "company")) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                        <div>
                            <label className="field-label">Company Name</label>
                            <input
                                type="text"
                                value={formData.companyName}
                                onChange={(e) => updateFormData({ companyName: e.target.value })}
                                className={`input-field ${errors.companyName ? "border-red-500" : ""}`}
                                placeholder="Company Pty Ltd"
                            />
                            {errors.companyName && (
                                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" /> {errors.companyName}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="field-label">ACN (9 digits)</label>
                            <input
                                type="text"
                                value={formData.companyACN}
                                onChange={(e) => updateFormData({ companyACN: e.target.value })}
                                className={`input-field ${errors.companyACN ? "border-red-500" : ""}`}
                                placeholder="123 456 789"
                                maxLength={11}
                            />
                            {errors.companyACN && (
                                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" /> {errors.companyACN}
                                </p>
                            )}
                        </div>
                    </div>
                )}

            {/* Purchaser Count */}
            <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-xl border border-gray-200">
                <span className="text-sm font-medium text-gray-700">
                    Number of{" "}
                    {formData.purchaserStructure === "Trust"
                        ? formData.trusteeType === "individual"
                            ? "Trustees"
                            : "Directors"
                        : formData.purchaserStructure === "Company"
                            ? "Directors"
                            : "Purchasers"}
                </span>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => handlePurchaserCountChange(-1)}
                        disabled={formData.purchaserCount <= 1}
                        className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                        <UserMinus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-bold text-harcourts-navy">
                        {formData.purchaserCount}
                    </span>
                    <button
                        type="button"
                        onClick={() => handlePurchaserCountChange(1)}
                        disabled={formData.purchaserCount >= 4}
                        className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                        <UserPlus className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Purchaser Details */}
            <div className="space-y-4">
                {Array.from({ length: formData.purchaserCount }).map((_, index) => (
                    <div
                        key={index}
                        className="p-6 bg-gray-50/50 rounded-xl border border-gray-200 relative animate-fade-in"
                    >
                        {/* Number badge */}
                        <div className="absolute top-6 left-6 w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-sm font-semibold text-gray-500 shadow-sm">
                            {index + 1}
                        </div>

                        <div className="ml-12 grid grid-cols-1 md:grid-cols-12 gap-4">
                            {/* Full Name */}
                            <div className="col-span-full md:col-span-6">
                                <label className="field-label">
                                    Full Name{" "}
                                    <span className="text-gray-400 font-normal text-xs">
                                        (Full Name on ID)
                                    </span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.purchasers[index]?.fullName || ""}
                                    onChange={(e) =>
                                        updatePurchaser(index, "fullName", e.target.value)
                                    }
                                    className={`input-field ${errors[`purchaser_${index}_fullName`] ? "border-red-500" : ""}`}
                                    placeholder="John William Smith"
                                />
                                {errors[`purchaser_${index}_fullName`] && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {errors[`purchaser_${index}_fullName`]}
                                    </p>
                                )}
                            </div>

                            {/* Email */}
                            <div className="col-span-full md:col-span-6">
                                <label className="field-label">Email Address</label>
                                <input
                                    type="email"
                                    value={formData.purchasers[index]?.email || ""}
                                    onChange={(e) =>
                                        updatePurchaser(index, "email", e.target.value)
                                    }
                                    className={`input-field-normal ${errors[`purchaser_${index}_email`] ? "border-red-500" : ""}`}
                                    placeholder="john@example.com"
                                />
                                {errors[`purchaser_${index}_email`] && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {errors[`purchaser_${index}_email`]}
                                    </p>
                                )}
                            </div>

                            {/* Mobile */}
                            <div className="col-span-full md:col-span-6">
                                <label className="field-label">Mobile Number</label>
                                <div className="flex gap-2">
                                    <CustomDropdown
                                        value={formData.purchasers[index]?.mobileCountryCode || "+61"}
                                        options={COUNTRY_CODES.map((cc) => ({
                                            value: cc.dial,
                                            label: `${cc.dial} ${cc.code}`,
                                        }))}
                                        onChange={(val) =>
                                            updatePurchaser(index, "mobileCountryCode", val)
                                        }
                                        icon={<Phone className="w-3.5 h-3.5" />}
                                        width="w-32"
                                        placeholder="+61"
                                    />
                                    <input
                                        type="tel"
                                        value={formData.purchasers[index]?.mobileNumber || ""}
                                        onChange={(e) =>
                                            updatePurchaser(index, "mobileNumber", e.target.value)
                                        }
                                        className={`input-field flex-1 ${errors[`purchaser_${index}_mobileNumber`] ? "border-red-500" : ""}`}
                                        placeholder="412 345 678"
                                    />
                                </div>
                                {errors[`purchaser_${index}_mobileNumber`] && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {errors[`purchaser_${index}_mobileNumber`]}
                                    </p>
                                )}
                            </div>

                            {/* Address */}
                            <div className="col-span-full border-t border-gray-200 mt-2 pt-4">
                                <label className="field-label text-gray-400 uppercase text-[10px] tracking-widest mb-3 block">
                                    Purchaser Address
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                    <div className="md:col-span-12">
                                        <label className="field-label">Street</label>
                                        <input
                                            type="text"
                                            value={formData.purchasers[index]?.street || ""}
                                            onChange={(e) =>
                                                updatePurchaser(index, "street", e.target.value)
                                            }
                                            className={`input-field ${errors[`purchaser_${index}_street`] ? "border-red-500" : ""}`}
                                            placeholder="123 Example Street"
                                        />
                                        {errors[`purchaser_${index}_street`] && (
                                            <p className="text-red-500 text-xs mt-1">
                                                {errors[`purchaser_${index}_street`]}
                                            </p>
                                        )}
                                    </div>
                                    <div className="md:col-span-5">
                                        <label className="field-label">Suburb</label>
                                        <input
                                            type="text"
                                            value={formData.purchasers[index]?.suburb || ""}
                                            onChange={(e) =>
                                                updatePurchaser(index, "suburb", e.target.value)
                                            }
                                            className={`input-field ${errors[`purchaser_${index}_suburb`] ? "border-red-500" : ""}`}
                                            placeholder="Suburb"
                                        />
                                        {errors[`purchaser_${index}_suburb`] && (
                                            <p className="text-red-500 text-xs mt-1">
                                                {errors[`purchaser_${index}_suburb`]}
                                            </p>
                                        )}
                                    </div>
                                    <div className="md:col-span-4">
                                        <label className="field-label">State</label>
                                        <CustomDropdown
                                            value={formData.purchasers[index]?.state || ""}
                                            options={[
                                                { value: "", label: "Select" },
                                                { value: "TAS", label: "TAS" },
                                                { value: "VIC", label: "VIC" },
                                                { value: "NSW", label: "NSW" },
                                                { value: "QLD", label: "QLD" },
                                                { value: "SA", label: "SA" },
                                                { value: "WA", label: "WA" },
                                                { value: "ACT", label: "ACT" },
                                                { value: "NT", label: "NT" },
                                            ]}
                                            onChange={(val) =>
                                                updatePurchaser(index, "state", val)
                                            }
                                            width="w-full"
                                            placeholder="Select"
                                            hasError={!!errors[`purchaser_${index}_state`]}
                                        />
                                        {errors[`purchaser_${index}_state`] && (
                                            <p className="text-red-500 text-xs mt-1">
                                                {errors[`purchaser_${index}_state`]}
                                            </p>
                                        )}
                                    </div>
                                    <div className="md:col-span-3">
                                        <label className="field-label">Postcode</label>
                                        <input
                                            type="text"
                                            value={formData.purchasers[index]?.postcode || ""}
                                            onChange={(e) =>
                                                updatePurchaser(index, "postcode", e.target.value)
                                            }
                                            className={`input-field ${errors[`purchaser_${index}_postcode`] ? "border-red-500" : ""}`}
                                            placeholder="7000"
                                            maxLength={4}
                                        />
                                        {errors[`purchaser_${index}_postcode`] && (
                                            <p className="text-red-500 text-xs mt-1">
                                                {errors[`purchaser_${index}_postcode`]}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
