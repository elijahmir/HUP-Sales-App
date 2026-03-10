import { OfferFormData } from "./types";

export interface FieldChange {
    label: string;
    oldValue: string;
    newValue: string;
}

export const FIELD_LABELS: Record<string, string> = {
    propertyAddress: "Property Address",
    offerPrice: "Offer Price",
    depositAmount: "Deposit Amount",
    financeRequired: "Finance Required",
    bankLender: "Bank/Lender",
    financeAmount: "Finance Amount",
    buildingInspection: "Building Inspection",
    coolingOffPeriod: "Cooling-Off Period",
    settlementPeriod: "Settlement Period",
    specialClauses: "Special Clauses",
    subjectToSale: "Subject to Sale",
    subjectToSaleAddress: "Subject Property Address",
    subjectToSalePrice: "Subject Property Price",
    solicitorFirm: "Solicitor Firm",
    solicitorName: "Solicitor Name",
    solicitorEmail: "Solicitor Email",
    purchaserStructure: "Purchaser Structure",
    companyName: "Company Name",
    companyACN: "Company ACN",
    trustName: "Trust Name",
};

export function getChanges(original: OfferFormData, current: OfferFormData): FieldChange[] {
    const changes: FieldChange[] = [];

    // Top-level simple fields
    const simpleFields = Object.keys(FIELD_LABELS) as (keyof OfferFormData)[];
    for (const key of simpleFields) {
        const oldVal = String(original[key] ?? "");
        const newVal = String(current[key] ?? "");
        if (oldVal !== newVal) {
            let displayOld = oldVal || "—";
            let displayNew = newVal || "—";
            if (typeof original[key] === "boolean") {
                displayOld = original[key] ? "Yes" : "No";
                displayNew = (current[key] as boolean) ? "Yes" : "No";
            }
            if (key === "offerPrice" || key === "depositAmount" || key === "financeAmount" || key === "subjectToSalePrice") {
                displayOld = oldVal ? `$${oldVal}` : "—";
                displayNew = newVal ? `$${newVal}` : "—";
            }
            changes.push({
                label: FIELD_LABELS[key] || key,
                oldValue: displayOld,
                newValue: displayNew,
            });
        }
    }

    // Purchaser changes — compare ALL fields
    const purchaserFieldLabels: Record<string, string> = {
        fullName: "Name",
        email: "Email",
        mobileNumber: "Mobile",
        mobileCountryCode: "Mobile Code",
        street: "Street",
        suburb: "Suburb",
        state: "State",
        postcode: "Postcode",
    };
    const maxP = Math.max(original.purchasers?.length || 0, current.purchasers?.length || 0);
    for (let i = 0; i < maxP; i++) {
        const orig = original.purchasers?.[i];
        const curr = current.purchasers?.[i];
        const prefix = `Purchaser ${i + 1}`;

        if (!orig && curr) {
            changes.push({ label: `${prefix}`, oldValue: "—", newValue: `Added: ${curr.fullName}` });
        } else if (orig && !curr) {
            changes.push({ label: `${prefix}`, oldValue: orig.fullName, newValue: "(removed)" });
        } else if (orig && curr) {
            for (const [field, label] of Object.entries(purchaserFieldLabels)) {
                const oldV = String((orig as unknown as Record<string, string>)[field] ?? "");
                const newV = String((curr as unknown as Record<string, string>)[field] ?? "");
                if (oldV !== newV) {
                    changes.push({ label: `${prefix} ${label}`, oldValue: oldV || "—", newValue: newV || "—" });
                }
            }
        }
    }

    // Solicitor fields that aren't in FIELD_LABELS
    const solicitorExtra: [keyof OfferFormData, string][] = [
        ["solicitorPhone" as keyof OfferFormData, "Solicitor Phone"],
        ["solicitorAddress" as keyof OfferFormData, "Solicitor Address"],
    ];
    for (const [key, label] of solicitorExtra) {
        const oldVal = String((original as unknown as Record<string, unknown>)[key as string] ?? "");
        const newVal = String((current as unknown as Record<string, unknown>)[key as string] ?? "");
        if (oldVal !== newVal) {
            changes.push({ label, oldValue: oldVal || "—", newValue: newVal || "—" });
        }
    }

    return changes;
}
