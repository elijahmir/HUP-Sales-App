"use client";

import type { OfferFormData } from "@/lib/offer/types";
import {
    Home,
    Users,
    Scale,
    DollarSign,
    MapPin,
    Bed,
    Bath,
    Car,
    Check,
    X,
} from "lucide-react";

interface ReviewSectionProps {
    formData: OfferFormData;
    onJumpToStep: (step: number) => void;
}

function ReviewCard({
    title,
    icon: Icon,
    step,
    onEdit,
    children,
}: {
    title: string;
    icon: React.ElementType;
    step: number;
    onEdit: (step: number) => void;
    children: React.ReactNode;
}) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-fade-in">
            <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-harcourts-blue" />
                    <h4 className="text-sm font-bold text-harcourts-navy">{title}</h4>
                </div>
                <button
                    type="button"
                    onClick={() => onEdit(step)}
                    className="text-xs font-semibold text-harcourts-blue hover:bg-harcourts-blue/5 px-2.5 py-1 rounded-lg transition-colors"
                >
                    Edit
                </button>
            </div>
            <div className="p-5 space-y-2 text-sm">{children}</div>
        </div>
    );
}

function Row({ label, value }: { label: string; value: string | null | undefined }) {
    if (!value) return null;
    return (
        <div className="flex justify-between py-1.5">
            <span className="text-gray-500">{label}</span>
            <span className="font-medium text-gray-900 text-right max-w-[60%] break-words uppercase">
                {value}
            </span>
        </div>
    );
}

function BoolRow({ label, value }: { label: string; value: boolean }) {
    return (
        <div className="flex justify-between py-1.5">
            <span className="text-gray-500">{label}</span>
            <span
                className={`inline-flex items-center gap-1 font-semibold ${value ? "text-emerald-600" : "text-gray-400"}`}
            >
                {value ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                {value ? "Yes" : "No"}
            </span>
        </div>
    );
}

export function ReviewSection({ formData, onJumpToStep }: ReviewSectionProps) {
    return (
        <div className="space-y-4 animate-fade-in">
            {/* Property */}
            <ReviewCard title="Property" icon={Home} step={0} onEdit={onJumpToStep}>
                <div className="flex items-start gap-3 mb-3">
                    {formData.propertyMainImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={formData.propertyMainImage}
                            alt=""
                            className="w-16 h-12 rounded-lg object-cover flex-shrink-0"
                        />
                    ) : (
                        <div className="w-16 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                            <Home className="w-5 h-5 text-gray-300" />
                        </div>
                    )}
                    <div>
                        <p className="font-semibold text-harcourts-navy uppercase">
                            {formData.propertyAddress || "Not selected"}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                            <MapPin className="w-3 h-3" />
                            {formData.propertySuburb}, {formData.propertyState}{" "}
                            {formData.propertyPostcode}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500 border-t border-gray-100 pt-2">
                    {formData.propertyBed != null && (
                        <span className="flex items-center gap-1">
                            <Bed className="w-3 h-3" /> {formData.propertyBed} bed
                        </span>
                    )}
                    {formData.propertyBath != null && (
                        <span className="flex items-center gap-1">
                            <Bath className="w-3 h-3" /> {formData.propertyBath} bath
                        </span>
                    )}
                    {formData.propertyGarages != null && (
                        <span className="flex items-center gap-1">
                            <Car className="w-3 h-3" /> {formData.propertyGarages} car
                        </span>
                    )}
                    <span className="ml-auto px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-50 text-blue-600 border border-blue-100">
                        {formData.propertyStatus}
                    </span>
                </div>
            </ReviewCard>

            {/* Purchaser */}
            <ReviewCard title="Purchaser Details" icon={Users} step={1} onEdit={onJumpToStep}>
                <Row label="Structure" value={formData.purchaserStructure} />
                {formData.purchaserStructure === "Trust" && (
                    <>
                        <Row label="Trust Name" value={formData.trustName} />
                        <Row label="Trustee Type" value={formData.trusteeType} />
                    </>
                )}
                {(formData.purchaserStructure === "Company" ||
                    (formData.purchaserStructure === "Trust" &&
                        formData.trusteeType === "company")) && (
                        <>
                            <Row label="Company" value={formData.companyName} />
                            <Row label="ACN" value={formData.companyACN} />
                        </>
                    )}
                <div className="border-t border-gray-100 mt-2 pt-2">
                    {Array.from({ length: formData.purchaserCount }).map((_, i) => {
                        const p = formData.purchasers[i];
                        if (!p) return null;
                        return (
                            <div key={i} className="py-2 first:pt-0 last:pb-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="w-5 h-5 rounded-full bg-gray-100 text-[10px] font-bold text-gray-500 flex items-center justify-center">
                                        {i + 1}
                                    </span>
                                    <span className="font-semibold text-gray-900 uppercase">
                                        {p.fullName || "—"}
                                    </span>
                                </div>
                                <div className="ml-7 text-xs text-gray-400 space-y-0.5">
                                    <p>{p.email}</p>
                                    <p>
                                        {p.mobileCountryCode} {p.mobileNumber}
                                    </p>
                                    <p className="uppercase">
                                        {[p.street, p.suburb, p.state, p.postcode]
                                            .filter(Boolean)
                                            .join(", ")}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </ReviewCard>

            {/* Solicitor */}
            <ReviewCard title="Solicitor" icon={Scale} step={2} onEdit={onJumpToStep}>
                <Row label="Firm" value={formData.solicitorFirm} />
                <Row label="Name" value={formData.solicitorName} />
                <Row label="Email" value={formData.solicitorEmail} />
                <Row
                    label="Mobile"
                    value={`${formData.solicitorMobileCountryCode} ${formData.solicitorMobileNumber}`}
                />
            </ReviewCard>

            {/* Offer */}
            <ReviewCard title="Offer Details" icon={DollarSign} step={3} onEdit={onJumpToStep}>
                <Row label="Offer Price" value={formData.offerPrice ? `$${formData.offerPrice}` : ""} />
                <Row label="Deposit" value={formData.depositAmount ? `$${formData.depositAmount}` : ""} />
                <div className="border-t border-gray-100 mt-2 pt-2">
                    <BoolRow label="Finance Required" value={formData.financeRequired} />
                    {formData.financeRequired && (
                        <>
                            <Row label="Bank / Lender" value={formData.bankLender} />
                            <Row
                                label="Amount Borrowed"
                                value={formData.financeAmount ? `$${formData.financeAmount}` : ""}
                            />
                        </>
                    )}
                    <BoolRow label="Building Inspection" value={formData.buildingInspection} />
                    <BoolRow label="Cooling Off Period" value={formData.coolingOffPeriod} />
                    <Row label="Settlement Period" value={formData.settlementPeriod} />
                    {formData.specialClauses && (
                        <div className="mt-2 pt-2 border-t border-gray-100">
                            <span className="text-gray-500 text-xs block mb-1">Special Clauses</span>
                            <p className="text-gray-900 text-sm whitespace-pre-wrap">
                                {formData.specialClauses}
                            </p>
                        </div>
                    )}
                </div>
            </ReviewCard>
        </div>
    );
}
