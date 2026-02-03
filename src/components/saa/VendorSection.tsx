import {
  Users,
  User,
  Building2,
  Briefcase,
  AlertCircle,
  Copy,
} from "lucide-react";
import type { FormData, VendorInfo } from "@/lib/saa/types";
import { createEmptyVendor } from "@/lib/saa/types";
import { SuburbAutocomplete } from "./SuburbAutocomplete";

interface VendorSectionProps {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
  errors: Record<string, string | undefined>;
  setErrors: (errors: Record<string, string | undefined>) => void;
}

export function VendorSection({
  formData,
  updateFormData,
  errors,
  setErrors,
}: VendorSectionProps) {
  const updateVendor = (index: number, field: string, value: any) => {
    const newVendors = [...formData.vendors];
    newVendors[index] = { ...newVendors[index], [field]: value };
    updateFormData({ vendors: newVendors });

    // Clear specific vendor error logic from parent validation
    // Logic: field is like "vendors[0].email"
    const errorKey = `vendors[${index}].${field}`;
    if (errors[errorKey]) {
      const newErrors = { ...errors };
      delete newErrors[errorKey];
      setErrors(newErrors);
    }
  };

  const handleSameAddressChange = (index: number, checked: boolean) => {
    const newVendors = [...formData.vendors];
    const vendor = newVendors[index];

    vendor.sameAsProperty = checked;

    if (checked) {
      vendor.street = formData.propertyStreet;
      vendor.suburb = formData.propertySuburb;
      vendor.postcode = formData.propertyPostcode;
      vendor.state = formData.propertyState;
    } else {
      vendor.street = "";
      vendor.suburb = "";
      vendor.postcode = "";
      vendor.state = "TAS";
    }

    newVendors[index] = vendor;
    updateFormData({ vendors: newVendors });
  };

  const handleVendorCountChange = (value: string) => {
    const count = parseInt(value, 10) as 1 | 2 | 3 | 4;
    const currentVendors = [...formData.vendors];
    // Ensure we always have enough vendor objects
    while (currentVendors.length < count) {
      currentVendors.push(createEmptyVendor());
    }
    // Note: We don't splice/remove if count decreases to preserve data just in case,
    // or we can slice it. Reference implementation pushes up to 4 but sets usage by count.

    updateFormData({ vendorCount: count, vendors: currentVendors });
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="section-card">
        <h2 className="section-title">
          <Users className="text-harcourts-blue" />
          Vendor Details
        </h2>

        {/* Vendor Structure */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
          <div className="col-span-full">
            <label className="field-label block mb-3">Ownership Type</label>
            <div className="flex flex-wrap gap-4">
              {["Individual", "Company", "Trust"].map((type) => (
                <label
                  key={type}
                  className={`flex items-center gap-2 cursor-pointer px-3 py-1.5 rounded-lg border transition-colors ${
                    formData.vendorStructure === type
                      ? "bg-blue-50 border-harcourts-blue text-harcourts-blue"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="vendorStructure"
                    value={type}
                    checked={formData.vendorStructure === type}
                    onChange={(e) =>
                      updateFormData({
                        vendorStructure: e.target.value as any,
                      })
                    }
                    className="hidden"
                  />
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      formData.vendorStructure === type
                        ? "border-harcourts-blue bg-harcourts-blue"
                        : "border-gray-300 bg-white"
                    }`}
                  >
                    {formData.vendorStructure === type && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </div>
                  <span className="text-sm font-medium">{type}</span>
                </label>
              ))}
            </div>
          </div>

          {formData.vendorStructure === "Trust" && (
            <>
              <div className="col-span-full">
                <label className="field-label">Name of Trust</label>
                <input
                  type="text"
                  value={formData.trustName}
                  onChange={(e) =>
                    updateFormData({ trustName: e.target.value })
                  }
                  className={`input-field ${
                    errors.trustName ? "border-red-500" : ""
                  }`}
                  placeholder="The Family Trust"
                />
                {errors.trustName && (
                  <p className="error-text">{errors.trustName}</p>
                )}
              </div>

              <div className="col-span-full">
                <label className="field-label block mb-3">Trustee Type</label>
                <div className="flex gap-4">
                  {[
                    { val: "individual", label: "Individual Trustee(s)" },
                    { val: "company", label: "Corporate Trustee" },
                  ].map((opt) => (
                    <label
                      key={opt.val}
                      className={`flex items-center gap-2 cursor-pointer px-3 py-1.5 rounded-lg border transition-colors ${
                        formData.trusteeType === opt.val
                          ? "bg-blue-50 border-harcourts-blue text-harcourts-blue"
                          : "border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="trusteeType"
                        value={opt.val}
                        checked={formData.trusteeType === opt.val}
                        onChange={(e) =>
                          updateFormData({
                            trusteeType: e.target.value as any,
                            vendorCount:
                              e.target.value === "company"
                                ? formData.hasMultipleDirectors
                                  ? 2
                                  : 1
                                : formData.vendorCount,
                          })
                        }
                        className="hidden"
                      />
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          formData.trusteeType === opt.val
                            ? "border-harcourts-blue bg-harcourts-blue"
                            : "border-gray-300 bg-white"
                        }`}
                      >
                        {formData.trusteeType === opt.val && (
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </div>
                      <span className="text-sm font-medium">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}

          {(formData.vendorStructure === "Company" ||
            (formData.vendorStructure === "Trust" &&
              formData.trusteeType === "company")) && (
            <>
              <div className="md:col-span-8">
                <label className="field-label">Company Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building2 className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) =>
                      updateFormData({ companyName: e.target.value })
                    }
                    className={`input-field pl-10 ${
                      errors.companyName ? "border-red-500" : ""
                    }`}
                    placeholder="Company Pty Ltd"
                  />
                </div>
                {errors.companyName && (
                  <p className="error-text">{errors.companyName}</p>
                )}
              </div>

              <div className="md:col-span-4">
                <label className="field-label">ACN</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Briefcase className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={formData.companyACN}
                    onChange={(e) =>
                      updateFormData({
                        companyACN: e.target.value.replace(/[^0-9]/g, ""),
                      })
                    }
                    className={`input-field pl-10 ${
                      errors.companyACN ? "border-red-500" : ""
                    }`}
                    placeholder="000 000 000"
                    maxLength={9}
                  />
                </div>
                {errors.companyACN && (
                  <p className="error-text">{errors.companyACN}</p>
                )}
              </div>

              <div className="col-span-full md:col-span-8">
                <label className="field-label">
                  Does the company have more than 1 Director?
                </label>
                <select
                  value={formData.hasMultipleDirectors ? "yes" : "no"}
                  onChange={(e) =>
                    updateFormData({
                      hasMultipleDirectors: e.target.value === "yes",
                      vendorCount: e.target.value === "yes" ? 2 : 1,
                    })
                  }
                  className="input-field appearance-none bg-white"
                >
                  <option value="no">No - Sole Director/Secretary</option>
                  <option value="yes">Yes - Secretary + Director</option>
                </select>
              </div>
            </>
          )}

          {(formData.vendorStructure === "Individual" ||
            (formData.vendorStructure === "Trust" &&
              formData.trusteeType === "individual")) && (
            <div className="md:col-span-4">
              <label className="field-label">
                Number of{" "}
                {formData.vendorStructure === "Trust" ? "Trustees" : "Signers"}
              </label>
              <select
                value={formData.vendorCount}
                onChange={(e) => handleVendorCountChange(e.target.value)}
                className="input-field appearance-none bg-white"
              >
                {[1, 2, 3, 4].map((num) => (
                  <option key={num} value={num}>
                    {num}{" "}
                    {formData.vendorStructure === "Trust"
                      ? "Trustee"
                      : "Signer"}
                    {num > 1 ? "s" : ""}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* ID Warning */}
        <div className="p-4 bg-blue-50/50 rounded-lg border border-blue-100 flex gap-3 text-sm text-gray-600 mb-6">
          <AlertCircle className="w-5 h-5 text-harcourts-blue flex-shrink-0 mt-0.5" />
          <p>
            Please ensure Full Legal Name as it appears on the Government Issued
            ID is entered. If this name differs from that which is on the Title,
            please tick the &quot;Different name on title?&quot; box and add the
            name that appears on Title in the text field.
          </p>
        </div>

        {/* Vendors List */}
        <div className="space-y-6">
          {Array.from({ length: formData.vendorCount }).map((_, index) => (
            <div
              key={index}
              className="p-6 bg-gray-50/50 rounded-xl border border-gray-200 relative"
            >
              <div className="absolute top-6 left-6 w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-sm font-semibold text-gray-500 shadow-sm">
                {index + 1}
              </div>

              <div className="ml-12 grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="col-span-full md:col-span-6">
                  <label className="field-label">Full Name (Legal Name)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={formData.vendors[index].fullName}
                      onChange={(e) =>
                        updateVendor(index, "fullName", e.target.value)
                      }
                      className={`input-field pl-10 ${
                        errors[`vendors[${index}].fullName`]
                          ? "border-red-500"
                          : ""
                      }`}
                      placeholder="John Doe"
                    />
                  </div>
                  {errors[`vendors[${index}].fullName`] && (
                    <p className="error-text">
                      {errors[`vendors[${index}].fullName`]}
                    </p>
                  )}
                </div>

                {/* Name on Title Toggle */}
                <div className="col-span-full md:col-span-6 flex items-center h-full pt-6">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.vendors[index].hasDifferentNameOnTitle}
                      onChange={(e) =>
                        updateVendor(
                          index,
                          "hasDifferentNameOnTitle",
                          e.target.checked,
                        )
                      }
                      className="rounded border-gray-300 text-harcourts-blue focus:ring-harcourts-blue"
                    />
                    <span className="text-sm font-medium text-gray-600">
                      Different Name on Title?
                    </span>
                  </label>
                </div>

                {/* Name on Title Input */}
                {formData.vendors[index].hasDifferentNameOnTitle && (
                  <div className="col-span-full">
                    <label className="field-label">Name on Title</label>
                    <input
                      type="text"
                      value={formData.vendors[index].nameOnTitle || ""}
                      onChange={(e) =>
                        updateVendor(index, "nameOnTitle", e.target.value)
                      }
                      className="input-field"
                      placeholder="Name as it appears on Title"
                    />
                    {/* NOTE: We aren't explicitly error blocking this field's input in validation yet for specific key, 
                         but logic is there if error key existed. 
                         If strict validation fails, it might map to fullName or generic error. */}
                  </div>
                )}

                <div className="md:col-span-6">
                  <label className="field-label">Email Address</label>
                  <input
                    type="email"
                    value={formData.vendors[index].email}
                    onChange={(e) =>
                      updateVendor(index, "email", e.target.value)
                    }
                    className={`input-field ${
                      errors[`vendors[${index}].email`] ? "border-red-500" : ""
                    }`}
                    placeholder="john@example.com"
                  />
                  {errors[`vendors[${index}].email`] && (
                    <p className="error-text">
                      {errors[`vendors[${index}].email`]}
                    </p>
                  )}
                </div>

                <div className="md:col-span-6">
                  <label className="field-label">Mobile Number</label>
                  <input
                    type="tel"
                    value={formData.vendors[index].mobile}
                    onChange={(e) =>
                      updateVendor(
                        index,
                        "mobile",
                        e.target.value.replace(/[^0-9\s+]/g, ""),
                      )
                    }
                    className={`input-field ${
                      errors[`vendors[${index}].mobile`] ? "border-red-500" : ""
                    }`}
                    placeholder="0400 000 000"
                  />
                  {errors[`vendors[${index}].mobile`] && (
                    <p className="error-text">
                      {errors[`vendors[${index}].mobile`]}
                    </p>
                  )}
                </div>

                <div className="md:col-span-6">
                  <label className="field-label block mb-1">
                    Home Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    value={formData.vendors[index].homePhone || ""}
                    onChange={(e) =>
                      updateVendor(
                        index,
                        "homePhone",
                        e.target.value.replace(/[^0-9\s+]/g, ""),
                      )
                    }
                    className="input-field"
                    placeholder="03 6200 0000"
                  />
                </div>

                <div className="md:col-span-6 hidden md:block"></div>

                <div className="col-span-full border-t border-gray-200 mt-4 pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                      {formData.vendorStructure === "Company"
                        ? "Registered Address"
                        : "Residential Address"}
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        handleSameAddressChange(
                          index,
                          !formData.vendors[index].sameAsProperty,
                        )
                      }
                      className="text-xs text-harcourts-blue hover:text-harcourts-navy font-medium flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      {formData.vendors[index].sameAsProperty
                        ? "Unlink Property Address"
                        : "Copy Property Address"}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-12">
                      <label className="field-label text-xs">
                        Street Address
                      </label>
                      <input
                        type="text"
                        value={formData.vendors[index].street || ""}
                        onChange={(e) =>
                          updateVendor(index, "street", e.target.value)
                        }
                        className={`input-field ${formData.vendors[index].sameAsProperty ? "bg-gray-50" : ""} ${
                          /* Error Logic */
                          !formData.vendors[index].sameAsProperty &&
                          errors[`vendors[${index}].street`]
                            ? "border-red-500"
                            : ""
                        }`}
                        readOnly={formData.vendors[index].sameAsProperty}
                      />
                      {/* Display Error if Manual Entry */}
                      {!formData.vendors[index].sameAsProperty &&
                        errors[`vendors[${index}].street`] && (
                          <p className="error-text">
                            {errors[`vendors[${index}].street`]}
                          </p>
                        )}
                    </div>
                    <div className="md:col-span-8">
                      <label className="field-label text-xs">Suburb</label>
                      {formData.vendors[index].sameAsProperty ? (
                        <input
                          type="text"
                          value={formData.vendors[index].suburb || ""}
                          className="input-field bg-gray-50"
                          readOnly
                        />
                      ) : (
                        <div className="relative">
                          <SuburbAutocomplete
                            value={formData.vendors[index].suburb || ""}
                            onChange={(value) =>
                              updateVendor(index, "suburb", value)
                            }
                            onSelect={(suburb) => {
                              updateVendor(index, "suburb", suburb.suburb);
                              updateVendor(index, "postcode", suburb.postcode);
                              updateVendor(index, "state", suburb.state);
                            }}
                            // We might need to pass error style to SuburbAutocomplete or wrap it?
                            // SuburbAutocomplete usually exposes an input internally.
                            // If we can't easily style it, we at least show the error message below.
                          />
                          {errors[`vendors[${index}].suburb`] && (
                            <p className="error-text mt-1">
                              {errors[`vendors[${index}].suburb`]}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="md:col-span-4">
                      <label className="field-label text-xs">Postcode</label>
                      <input
                        type="text"
                        value={formData.vendors[index].postcode || ""}
                        onChange={(e) =>
                          updateVendor(
                            index,
                            "postcode",
                            e.target.value.replace(/[^0-9]/g, ""),
                          )
                        }
                        className={`input-field ${formData.vendors[index].sameAsProperty ? "bg-gray-50" : ""} ${
                          !formData.vendors[index].sameAsProperty &&
                          errors[`vendors[${index}].postcode`]
                            ? "border-red-500"
                            : ""
                        }`}
                        readOnly={formData.vendors[index].sameAsProperty}
                        maxLength={4}
                      />
                      {!formData.vendors[index].sameAsProperty &&
                        errors[`vendors[${index}].postcode`] && (
                          <p className="error-text">
                            {errors[`vendors[${index}].postcode`]}
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
    </div>
  );
}
