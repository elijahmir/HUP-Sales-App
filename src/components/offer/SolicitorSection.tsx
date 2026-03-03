"use client";

import { useState, useRef, useEffect } from "react";
import type { OfferFormData } from "@/lib/offer/types";
import { AlertCircle, Scale, ChevronDown } from "lucide-react";

interface SolicitorSectionProps {
    formData: OfferFormData;
    updateFormData: (updates: Partial<OfferFormData>) => void;
    errors: Record<string, string>;
    setErrors: (errors: Record<string, string>) => void;
}

const SUGGESTED_SOLICITORS = [
    { firm: "Graham Woodhouse Conveyancing", name: "Graham Woodhouse", email: "email@gwcmail.com.au" },
    { firm: "Glynn Williams Legal", name: "Glynn Williams", email: "debbie@glynnwilliams.com.au" },
    { firm: "Blackwood Beattie Legal", name: "Andrea Blackwood Beattie", email: "andrea@blackwoodbeattielegal.com.au" },
    { firm: "Debbie Hutton Conveyancing", name: "Debbie Hutton", email: "office@debbiehuttonconveyancing.com.au" },
    { firm: "Jason Dolbel Solicitor", name: "Jason Dolbel", email: "office@jdsolicitor.com.au" },
    { firm: "Simmons Wolfhagen Lawyers", name: "Katie Notley", email: "reception@simwolf.com.au, georgia.maroney@simwolf.com.au" },
];

export function SolicitorSection({
    formData,
    updateFormData,
    errors,
    setErrors,
}: SolicitorSectionProps) {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    const handleChange = (field: keyof OfferFormData, value: string) => {
        updateFormData({ [field]: value });
        if (errors[field]) {
            const newErrors = { ...errors };
            delete newErrors[field];
            setErrors(newErrors);
        }
    };

    const handleFirmChange = (value: string) => {
        const match = SUGGESTED_SOLICITORS.find(s => `${s.firm} - ${s.name}` === value);
        if (match) {
            updateFormData({
                solicitorFirm: match.firm,
                solicitorName: match.name,
                solicitorEmail: match.email
            });
            const newErrors = { ...errors };
            delete newErrors.solicitorFirm;
            delete newErrors.solicitorName;
            if (newErrors.solicitorEmail) delete newErrors.solicitorEmail;
            setErrors(newErrors);
            setIsOpen(false);
        } else {
            handleChange("solicitorFirm", value);
        }
    };

    const isExactMatch = SUGGESTED_SOLICITORS.some(s => `${s.firm} - ${s.name}` === formData.solicitorFirm);
    const filteredOptions = isExactMatch
        ? SUGGESTED_SOLICITORS
        : SUGGESTED_SOLICITORS.filter(s =>
            `${s.firm} - ${s.name}`.toLowerCase().includes(formData.solicitorFirm.toLowerCase())
        );

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
                    <p className="text-sm text-gray-500 mt-1">
                        We advise using a Tasmanian-based solicitor or conveyancer to represent you in this transaction. If you are unsure of who to use, utilise the drop down list to select a local firm.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Solicitor Firm */}
                <div className="md:col-span-2 relative" ref={wrapperRef}>
                    <label className="field-label">Solicitor / Conveyancer Firm</label>
                    <div className="relative">
                        <input
                            type="text"
                            value={formData.solicitorFirm}
                            onChange={(e) => {
                                handleFirmChange(e.target.value);
                                setIsOpen(true);
                            }}
                            onFocus={() => setIsOpen(true)}
                            className={`input-field pr-10 ${errors.solicitorFirm ? "border-red-500" : ""}`}
                            placeholder="Select from list or type Law Firm Name"
                        />
                        <button
                            type="button"
                            onClick={() => setIsOpen(!isOpen)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                        >
                            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                        </button>
                    </div>

                    {isOpen && (
                        <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white border-gray-200 rounded-xl shadow-xl border overflow-hidden animate-fade-in">
                            <div className="max-h-60 overflow-y-auto custom-scrollbar">
                                {filteredOptions.length > 0 ? (
                                    filteredOptions.map((s, idx) => {
                                        const optionValue = `${s.firm} - ${s.name}`;
                                        return (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => handleFirmChange(optionValue)}
                                                className="w-full text-left px-4 py-3 text-sm font-medium text-harcourts-navy hover:bg-harcourts-blue/10 hover:text-harcourts-blue transition-colors"
                                            >
                                                {optionValue}
                                            </button>
                                        );
                                    })
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setIsOpen(false)}
                                        className="w-full text-left px-4 py-3 text-sm font-medium text-gray-500 hover:bg-harcourts-blue/10 hover:text-harcourts-blue transition-colors"
                                    >
                                        Use custom firm: <span className="text-harcourts-navy font-bold">{formData.solicitorFirm}</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

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
            </div>
        </div>
    );
}
