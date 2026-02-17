import {
  X,
  Check,
  User,
  Home,
  Users,
  DollarSign,
  ShoppingCart,
  FileText,
} from "lucide-react";
import type { FormData } from "@/lib/saa/types";
import { formatNumberWithCommas } from "@/lib/saa/validation";
import { MarketingItem } from "@/lib/saa/marketing";

interface ReviewModalProps {
  isOpen: boolean;
  formData: FormData;
  onConfirm: () => void;
  onCancel: () => void;
  items: MarketingItem[]; // Helper prop
}

export function ReviewModal({
  isOpen,
  formData,
  onConfirm,
  onCancel,
  items,
}: ReviewModalProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[80]"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-harcourts-navy">
                Review Agreement Details
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Please review all information before generating
              </p>
            </div>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 uppercase">
            {/* Agent Section */}
            <div className="space-y-3">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-harcourts-navy">
                <User className="w-5 h-5" />
                Agent Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 bg-gray-50 rounded-lg">
                <InfoItem label="Agent Name" value={formData.agentName} />
                <InfoItem label="Email" value={formData.agentEmail} isEmail />
                <InfoItem label="Mobile" value={formData.agentMobile} />
                <InfoItem label="Office" value={formData.officeName} />
              </div>
            </div>

            {/* Property Section */}
            <div className="space-y-3">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-harcourts-navy">
                <Home className="w-5 h-5" />
                Property Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 bg-gray-50 rounded-lg">
                <InfoItem
                  label="Address"
                  value={`${formData.propertyStreet}, ${formData.propertySuburb}`}
                  fullWidth
                />
                <InfoItem label="State" value={formData.propertyState} />
                <InfoItem label="Postcode" value={formData.propertyPostcode} />
                <InfoItem label="CT Volume" value={formData.ctVolume} />
                <InfoItem label="Folio No" value={formData.folioNo} />
                <InfoItem label="PID" value={formData.pid} />
                {formData.listingNo && (
                  <InfoItem label="Listing No" value={formData.listingNo} />
                )}
                <InfoItem
                  label="Include Annexure A"
                  value={formData.annexureA ? "Yes" : "No"}
                />
              </div>
            </div>

            {/* Annexure A Section (only if enabled) */}
            {formData.annexureA && (
              <div className="space-y-3 normal-case">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-harcourts-navy uppercase">
                  <FileText className="w-5 h-5" />
                  Annexure A Items
                </h3>
                <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                  {Array.from({ length: formData.annexureCount }).map(
                    (_, index) => (
                      <div
                        key={index}
                        className="p-3 bg-white rounded border border-gray-200"
                      >
                        <p className="text-xs text-gray-500 mb-1 uppercase">
                          Item {index + 1}
                        </p>
                        <p className="font-medium text-sm">
                          {formData.annexureItems[index]?.item || "—"}
                        </p>
                        <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">
                          {formData.annexureItems[index]?.description || "—"}
                        </p>
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}

            {/* Pricing & Commission */}
            <div className="space-y-3">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-harcourts-navy">
                <DollarSign className="w-5 h-5" />
                Pricing & Commission
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 bg-gray-50 rounded-lg">
                <InfoItem
                  label="Listing Price"
                  value={formData.listingPrice.toUpperCase()}
                />
                <InfoItem
                  label="Commission Type"
                  value={
                    formData.commissionType === "fixed"
                      ? "Fixed"
                      : formData.commissionType === "percentage"
                        ? "Percentage"
                        : "REIT Scale"
                  }
                />
                {formData.commissionType === "reit" ? (
                  <InfoItem
                    label="Commission"
                    value="REIT Gross Scale of Commission"
                    fullWidth
                  />
                ) : formData.commissionType === "percentage" ? (
                  <InfoItem
                    label="Commission Rate"
                    value={`${formData.commissionValue}%`}
                  />
                ) : (
                  <InfoItem
                    label="Commission Amount"
                    value={`$${formatNumberWithCommas(
                      formData.commissionValue,
                    )}`}
                  />
                )}
                <InfoItem
                  label="GST"
                  value={formData.gstTaxable ? "Taxable" : "Not Taxable"}
                />
                <InfoItem
                  label="Agency Period"
                  value={
                    formData.agencyPeriodType === "standard"
                      ? `${formData.soleAgencyPeriod} days`
                      : `Development (${formData.soleAgencyPeriod} days)`
                  }
                />
              </div>
            </div>

            {/* Vendors Section */}
            <div className="space-y-3">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-harcourts-navy">
                <Users className="w-5 h-5" />
                Vendor Details
              </h3>

              {/* Vendor Structure Overview */}
              <div className="p-4 bg-harcourts-blue/5 border border-harcourts-blue/20 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <InfoItem
                    label="Entity Type"
                    value={formData.vendorStructure}
                  />
                  <InfoItem
                    label="Number of Vendors"
                    value={formData.vendorCount.toString()}
                  />

                  {/* Company-specific fields */}
                  {formData.vendorStructure === "Company" && (
                    <>
                      <InfoItem
                        label="Company Name"
                        value={formData.companyName}
                        fullWidth
                      />
                      <InfoItem
                        label="Multiple Directors"
                        value={formData.hasMultipleDirectors ? "Yes" : "No"}
                      />
                    </>
                  )}

                  {/* Trust-specific fields */}
                  {formData.vendorStructure === "Trust" && (
                    <>
                      <InfoItem
                        label="Trustee Type"
                        value={
                          formData.trusteeType === "individual"
                            ? "Individual"
                            : "Company"
                        }
                      />
                      {formData.trusteeType === "company" && (
                        <>
                          <InfoItem
                            label="Company Name"
                            value={formData.companyName}
                            fullWidth
                          />
                          <InfoItem
                            label="Multiple Directors"
                            value={formData.hasMultipleDirectors ? "Yes" : "No"}
                          />
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Individual Vendor Cards */}
              {formData.vendors
                .slice(0, formData.vendorCount)
                .map((vendor, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gray-50 rounded-lg space-y-2"
                  >
                    <p className="font-semibold text-harcourts-blue">
                      {formData.vendorStructure === "Company"
                        ? `Director ${index + 1}`
                        : formData.vendorStructure === "Trust"
                          ? `Trustee ${index + 1}`
                          : `Vendor ${index + 1}`}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <InfoItem label="Full Name" value={vendor.fullName} />
                      <InfoItem label="Email" value={vendor.email} isEmail />
                      <InfoItem
                        label="Mobile"
                        value={`${vendor.mobileCountryCode} ${vendor.mobile}`}
                      />
                      {vendor.homePhone && (
                        <InfoItem label="Home Phone" value={vendor.homePhone} />
                      )}
                      <InfoItem
                        label="Address"
                        value={
                          vendor.sameAsProperty
                            ? "Same as Property"
                            : "Different Address"
                        }
                        fullWidth
                      />
                      {!vendor.sameAsProperty && (
                        <>
                          <InfoItem
                            label="Street"
                            value={vendor.street}
                            fullWidth
                          />
                          <InfoItem label="Suburb" value={vendor.suburb} />
                          <InfoItem label="State" value={vendor.state} />
                          <InfoItem label="Postcode" value={vendor.postcode} />
                        </>
                      )}
                    </div>
                  </div>
                ))}
            </div>

            {/* Marketing Section */}
            <div className="space-y-3">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-harcourts-navy">
                <ShoppingCart className="w-5 h-5" />
                Marketing Package
              </h3>
              <div className="p-4 bg-gray-50 rounded-lg">
                {formData.selectedMarketing.length > 0 ? (
                  <>
                    <ul className="space-y-2">
                      {formData.selectedMarketing.map((itemId, index) => {
                        const item = items.find((i) => i.id === itemId);
                        return (
                          <li
                            key={index}
                            className="flex items-center justify-between text-gray-700"
                          >
                            <span className="flex items-center gap-2">
                              <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                              {item?.name || itemId}
                            </span>
                            <span className="font-medium">
                              $
                              {formatNumberWithCommas(
                                item?.price.toString() || "0",
                              )}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                    <div className="mt-4 pt-4 border-t border-gray-300">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold text-harcourts-navy">
                          Total Marketing Cost:
                        </span>
                        <span className="text-lg font-semibold text-harcourts-blue">
                          $
                          {formatNumberWithCommas(
                            formData.selectedMarketing
                              .reduce((total, itemId) => {
                                const item = items.find((i) => i.id === itemId);
                                return total + (item?.price || 0);
                              }, 0)
                              .toString(),
                          )}
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-gray-500">No marketing items selected</p>
                )}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex gap-3 p-6 border-t border-gray-200">
            <button
              onClick={onCancel}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Edit Details
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-6 py-3 bg-harcourts-blue text-white rounded-lg font-medium hover:bg-harcourts-blue-dark transition-colors"
            >
              Confirm & Generate Agreement
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// Helper component for displaying info items
function InfoItem({
  label,
  value,
  fullWidth = false,
  isEmail = false,
}: {
  label: string;
  value: string;
  fullWidth?: boolean;
  isEmail?: boolean;
}) {
  return (
    <div className={fullWidth ? "md:col-span-2" : ""}>
      <p className="text-xs text-gray-500 font-medium uppercase">{label}</p>
      <p
        className={`text-sm text-gray-900 mt-0.5 ${isEmail ? "lowercase" : ""}`}
      >
        {value || "—"}
      </p>
    </div>
  );
}
