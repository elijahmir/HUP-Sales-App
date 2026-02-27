"use client";

import { COUNTRY_CODES } from "@/lib/offer/types";
import type { OfferFormData } from "@/lib/offer/types";
import { AlertCircle, Scale, Phone } from "lucide-react";
import { CustomDropdown } from "@/components/offer/CustomDropdown";

interface SolicitorSectionProps {
    formData: OfferFormData;
    updateFormData: (updates: Partial<OfferFormData>) => void;
    errors: Record<string, string>;
    setErrors: (errors: Record<string, string>) => void;
}

export function SolicitorSection({
    formData,
    updateFormData,
    errors,
    setErrors,
}: SolicitorSectionProps) {
    const handleChange = (field: keyof OfferFormData, value: string) => {
        updateFormData({ [field]: value });
        if (errors[field]) {
            const newErrors = { ...errors };
            delete newErrors[field];
            setErrors(newErrors);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Section Header */}
            <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                <div className="w-10 h-10 rounded-xl bg-harcourts-blue/10 flex items-center justify-center">
                    <Scale className="w-5 h-5 text-harcourts-blue" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-harcourts-navy">
                        Solicitor / Conveyancer Details
                    </h3>
                    <p className="text-sm text-gray-500">
                        Details of the purchaser&apos;s legal representative
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Solicitor Firm */}
                <div className="md:col-span-2">
                    <label className="field-label">Solicitor / Conveyancer Firm</label>
                    <input
                        type="text"
                        value={formData.solicitorFirm}
                        onChange={(e) => handleChange("solicitorFirm", e.target.value)}
                        className={`input-field ${errors.solicitorFirm ? "border-red-500" : ""}`}
                        placeholder="Law Firm Name"
                    />
                    {errors.solicitorFirm && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> {errors.solicitorFirm}
                        </p>
                    )}
                </div>

                {/* Solicitor Name */}
                <div>
                    <label className="field-label">Solicitor Name</label>
                    <input
                        type="text"
                        value={formData.solicitorName}
                        onChange={(e) => handleChange("solicitorName", e.target.value)}
                        className={`input-field ${errors.solicitorName ? "border-red-500" : ""}`}
                        placeholder="Full Name"
                    />
                    {errors.solicitorName && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> {errors.solicitorName}
                        </p>
                    )}
                </div>

                {/* Solicitor Email */}
                <div>
                    <label className="field-label">Solicitor Email</label>
                    <input
                        type="email"
                        value={formData.solicitorEmail}
                        onChange={(e) => handleChange("solicitorEmail", e.target.value)}
                        className={`input-field-normal ${errors.solicitorEmail ? "border-red-500" : ""}`}
                        placeholder="solicitor@lawfirm.com"
                    />
                    {errors.solicitorEmail && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> {errors.solicitorEmail}
                        </p>
                    )}
                </div>

                {/* Solicitor Mobile */}
                <div className="md:col-span-2">
                    <label className="field-label">Solicitor Mobile Number</label>
                    <div className="flex gap-2 max-w-md">
                        <CustomDropdown
                            value={formData.solicitorMobileCountryCode}
                            options={COUNTRY_CODES.map((cc) => ({
                                value: cc.dial,
                                label: `${cc.dial} ${cc.code}`,
                            }))}
                            onChange={(val) =>
                                handleChange("solicitorMobileCountryCode", val)
                            }
                            icon={<Phone className="w-3.5 h-3.5" />}
                            width="w-32"
                            placeholder="+61"
                        />
                        <input
                            type="tel"
                            value={formData.solicitorMobileNumber}
                            onChange={(e) =>
                                handleChange("solicitorMobileNumber", e.target.value)
                            }
                            className={`input-field flex-1 ${errors.solicitorMobileNumber ? "border-red-500" : ""}`}
                            placeholder="412 345 678"
                        />
                    </div>
                    {errors.solicitorMobileNumber && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> {errors.solicitorMobileNumber}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
