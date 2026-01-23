/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { ListingData } from "@/lib/gemini-ocr";
import { PenTool } from "lucide-react";

interface SmartListingFormProps {
  initialData: Partial<ListingData>;
  onChange: (data: Partial<ListingData>) => void;
  readOnly?: boolean;
}

export default function SmartListingForm({
  initialData,
  onChange,
  readOnly = false,
}: SmartListingFormProps) {
  const [formData, setFormData] = useState<Partial<ListingData>>(
    initialData || {},
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    if (JSON.stringify(initialData) !== JSON.stringify(formData)) {
      setFormData(initialData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData]);

  const handleChange = (newData: Partial<ListingData>) => {
    if (readOnly) return;
    setFormData(newData);
    onChange(newData);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateField = (field: keyof ListingData, value: any) => {
    const next = { ...formData, [field]: value };
    handleChange(next);
  };

  const updateNestedField = (
    section: keyof ListingData,
    field: string,
    value: any,
  ) => {
    const sectionData = (formData[section] as any) || {};
    const next = {
      ...formData,
      [section]: {
        ...sectionData,
        [field]: value,
      },
    };
    handleChange(next);
  };

  const updateDeepNestedField = (
    section: keyof ListingData,
    subSection: string,
    field: string,
    value: any,
  ) => {
    const sectionData = (formData[section] as any) || {};
    const subSectionData = sectionData[subSection] || {};
    const next = {
      ...formData,
      [section]: {
        ...sectionData,
        [subSection]: {
          ...subSectionData,
          [field]: value,
        },
      },
    };
    handleChange(next);
  };

  // Helper styles to mimic paper form
  const paperCardClass = "bg-white border-2 border-gray-300 p-4 shadow-sm";
  const paperLabelClass =
    "block text-xs font-bold text-gray-800 uppercase tracking-tight mb-1";
  const paperInputClass =
    "w-full border-b border-gray-300 focus:border-blue-600 outline-none py-1 px-1 text-sm bg-transparent placeholder-gray-300 disabled:opacity-70 disabled:cursor-not-allowed";
  const paperCheckboxClass =
    "w-4 h-4 text-blue-600 border-gray-400 rounded focus:ring-blue-500 disabled:opacity-70";
  const sectionTitleClass =
    "font-bold text-sm text-white bg-[#001F49] py-1 px-2 inline-block mb-3 uppercase";

  /* 
     We use a fieldset here to disable all inputs when readOnly is true.
     The styles 'border-none p-0 m-0 w-full' ensure it acts like a transparent wrapper.
  */
  return (
    <fieldset
      disabled={readOnly}
      className="max-w-[1200px] mx-auto space-y-6 font-sans text-gray-900 pb-20 border-none p-0 m-0 w-full group"
    >
      {/* HEADER: LOGO/AGENT PLACEHOLDER AREA */}
      <div className="grid grid-cols-12 gap-4">
        {/* LEFT COLUMN: 8 cols */}
        <div className="col-span-12 lg:col-span-8 space-y-4">
          {/* 1. PRINCIPAL / VENDOR & AGENT BLOCK */}
          <div className={paperCardClass}>
            <h3 className={sectionTitleClass}>Principal Details</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className={paperLabelClass}>Listing Agent</label>
                <input
                  className={paperInputClass}
                  value={formData.listing_agent || ""}
                  onChange={(e) => updateField("listing_agent", e.target.value)}
                />
              </div>
              <div>
                <label className={paperLabelClass}>Agency Type</label>
                <select
                  className={paperInputClass}
                  value={
                    typeof formData.agency_type === "object"
                      ? formData.agency_type?.value || ""
                      : formData.agency_type || ""
                  }
                  onChange={(e) => updateField("agency_type", e.target.value)}
                >
                  <option value="">Select...</option>
                  <option value="Sole">Sole</option>
                  <option value="Open">Open</option>
                  <option value="Joint">Joint</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={paperLabelClass}>Vendor Name</label>
                <input
                  className={paperInputClass}
                  value={formData.vendors || ""}
                  onChange={(e) => updateField("vendors", e.target.value)}
                />
              </div>
              <div>
                <label className={paperLabelClass}>Phone</label>
                <input
                  className={paperInputClass}
                  value={formData.phone_numbers || ""}
                  onChange={(e) => updateField("phone_numbers", e.target.value)}
                />
              </div>
              <div className="col-span-2">
                <label className={paperLabelClass}>Vendor Email</label>
                <input
                  className={paperInputClass}
                  value={formData.email || ""}
                  onChange={(e) => updateField("email", e.target.value)}
                />
              </div>
              <div>
                <label className={paperLabelClass}>Solicitor</label>
                <input
                  className={paperInputClass}
                  value={formData.solicitor || ""}
                  onChange={(e) => updateField("solicitor", e.target.value)}
                />
              </div>
              <div>
                <label className={paperLabelClass}>Postal Address</label>
                <input
                  className={paperInputClass}
                  value={formData.postal_address || ""}
                  onChange={(e) =>
                    updateField("postal_address", e.target.value)
                  }
                />
              </div>
            </div>
          </div>

          {/* 2. PROPERTY DETAILS BLOCK */}
          <div className={paperCardClass}>
            <h3 className={sectionTitleClass}>Property Details</h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-8">
                <label className={paperLabelClass}>Address</label>
                <input
                  className={`${paperInputClass} font-bold text-base`}
                  value={formData.address || ""}
                  onChange={(e) => updateField("address", e.target.value)}
                />
              </div>
              <div className="col-span-4">
                <label className={paperLabelClass}>Price</label>
                <input
                  className={`${paperInputClass} font-bold text-base text-green-700`}
                  value={formData.price || ""}
                  onChange={(e) => updateField("price", e.target.value)}
                />
              </div>
              {/* Legal */}
              <div className="col-span-3">
                <label className={paperLabelClass}>Title Ref</label>
                <input
                  className={paperInputClass}
                  value={formData.title_ref || ""}
                  onChange={(e) => updateField("title_ref", e.target.value)}
                />
              </div>
              <div className="col-span-3">
                <label className={paperLabelClass}>PID</label>
                <input
                  className={paperInputClass}
                  value={formData.pid || ""}
                  onChange={(e) => updateField("pid", e.target.value)}
                />
              </div>
              <div className="col-span-3">
                <label className={paperLabelClass}>Rates</label>
                <input
                  className={paperInputClass}
                  value={formData.rates || ""}
                  onChange={(e) => updateField("rates", e.target.value)}
                />
              </div>
              <div className="col-span-3">
                <label className={paperLabelClass}>Zoning</label>
                <input
                  className={paperInputClass}
                  value={formData.zoning || ""}
                  onChange={(e) => updateField("zoning", e.target.value)}
                />
              </div>

              {/* Structure */}
              <div className="col-span-3">
                <label className={paperLabelClass}>Year Built</label>
                <input
                  className={paperInputClass}
                  value={formData.year_built || ""}
                  onChange={(e) => updateField("year_built", e.target.value)}
                />
              </div>
              <div className="col-span-3">
                <label className={paperLabelClass}>Construction</label>
                <select
                  className={paperInputClass}
                  value={
                    typeof formData.construction === "object"
                      ? formData.construction?.value || ""
                      : formData.construction || ""
                  }
                  onChange={(e) => updateField("construction", e.target.value)}
                >
                  <option value="">-</option>
                  <option value="B">B</option>
                  <option value="BV">BV</option>
                  <option value="WB">WB</option>
                  <option value="R">R</option>
                </select>
              </div>
              <div className="col-span-3">
                <label className={paperLabelClass}>Roof</label>
                <select
                  className={paperInputClass}
                  value={
                    typeof formData.roof === "object"
                      ? formData.roof?.value || ""
                      : formData.roof || ""
                  }
                  onChange={(e) => updateField("roof", e.target.value)}
                >
                  <option value="">-</option>
                  <option value="Tile">Tile</option>
                  <option value="CB">CB</option>
                  <option value="T">T</option>
                </select>
              </div>
              <div className="col-span-3">
                <label className={paperLabelClass}>Land Size</label>
                <input
                  className={paperInputClass}
                  value={formData.land_size || ""}
                  onChange={(e) => updateField("land_size", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* 3. ROOMS & LAYOUT - MATCHING VISUAL FLOW */}
          <div className={paperCardClass}>
            <h3 className={sectionTitleClass}>Rooms</h3>
            <div className="space-y-4">
              {/* BEDROOM 1 + ENSUITE NESTED */}
              <div className="border border-blue-100 bg-blue-50/30 p-3 rounded">
                <div className="flex items-start justify-between mb-2">
                  <span className="font-bold text-blue-900 uppercase text-sm">
                    Bedroom 1
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.bed_1?.has_checkbox || false}
                      onChange={(e) =>
                        updateNestedField(
                          "bed_1",
                          "has_checkbox",
                          e.target.checked,
                        )
                      }
                      className={paperCheckboxClass}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-12 gap-3 mb-2">
                  <div className="col-span-4">
                    <label className="text-[10px] uppercase text-gray-500">
                      Size
                    </label>
                    <input
                      className={paperInputClass}
                      placeholder="3x3"
                      value={formData.bed_1?.measurements || ""}
                      onChange={(e) =>
                        updateNestedField(
                          "bed_1",
                          "measurements",
                          e.target.value,
                        )
                      }
                    />
                  </div>
                  <div className="col-span-4">
                    <label className="text-[10px] uppercase text-gray-500">
                      Wardrobe
                    </label>
                    <select
                      className={paperInputClass}
                      value={formData.bed_1?.wardrobe_type || ""}
                      onChange={(e) =>
                        updateNestedField(
                          "bed_1",
                          "wardrobe_type",
                          e.target.value,
                        )
                      }
                    >
                      <option value="None">-</option>
                      <option value="BI">BI</option>
                      <option value="WI">WI</option>
                      <option value="BI/WI">BI/WI</option>
                    </select>
                  </div>
                </div>

                {/* ENSUITE INSIDE BED 1 - UPDATED BINDING */}
                <div className="mt-2 pt-2 border-t border-blue-200">
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-bold text-blue-800 uppercase">
                      Ensuite
                    </span>
                    <select
                      className={`${paperInputClass} w-32`}
                      value={formData.bed_1?.ensuite?.type || ""}
                      onChange={(e) =>
                        updateDeepNestedField(
                          "bed_1",
                          "ensuite",
                          "type",
                          e.target.value,
                        )
                      }
                    >
                      <option value="">-</option>
                      <option value="SOB">SOB</option>
                      <option value="Sep Shower">Sep Shower</option>
                      <option value="Bath">Bath</option>
                    </select>
                    <input
                      className={`${paperInputClass} w-24`}
                      placeholder="Size"
                      value={formData.bed_1?.ensuite?.measurements || ""}
                      onChange={(e) =>
                        updateDeepNestedField(
                          "bed_1",
                          "ensuite",
                          "measurements",
                          e.target.value,
                        )
                      }
                    />
                  </div>
                </div>
              </div>

              {/* OTHER BEDROOMS */}
              <div className="space-y-2">
                {[2, 3, 4, 5].map((i) => {
                  const key = `bed_${i}` as keyof ListingData;
                  const data = (formData[key] as any) || {};
                  return (
                    <div
                      key={key}
                      className="grid grid-cols-12 gap-3 items-center border-b border-gray-100 pb-1"
                    >
                      <div className="col-span-2 text-xs font-bold text-gray-600 uppercase">
                        Bed {i}
                      </div>
                      <div className="col-span-3">
                        <input
                          className={paperInputClass}
                          placeholder="Size"
                          value={data.measurements || ""}
                          onChange={(e) =>
                            updateNestedField(
                              key,
                              "measurements",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                      <div className="col-span-3">
                        <select
                          className={paperInputClass}
                          value={data.wardrobe_type || ""}
                          onChange={(e) =>
                            updateNestedField(
                              key,
                              "wardrobe_type",
                              e.target.value,
                            )
                          }
                        >
                          <option value="None">-</option>
                          <option value="BI">BI</option>
                          <option value="WI">WI</option>
                          <option value="BI/WI">BI/WI</option>
                        </select>
                      </div>
                      <div className="col-span-1">
                        <input
                          type="checkbox"
                          checked={data.has_checkbox || false}
                          onChange={(e) =>
                            updateNestedField(
                              key,
                              "has_checkbox",
                              e.target.checked,
                            )
                          }
                          className={paperCheckboxClass}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* BATHROOM */}
              <div className="grid grid-cols-12 gap-3 items-center pt-2">
                <div className="col-span-2 text-xs font-bold text-gray-600 uppercase">
                  Bathroom
                </div>
                <div className="col-span-3">
                  <input
                    className={paperInputClass}
                    placeholder="Size"
                    value={formData.bathroom?.measurements || ""}
                    onChange={(e) =>
                      updateNestedField(
                        "bathroom",
                        "measurements",
                        e.target.value,
                      )
                    }
                  />
                </div>
                <div className="col-span-3">
                  <select
                    className={paperInputClass}
                    value={formData.bathroom?.type || ""}
                    onChange={(e) =>
                      updateNestedField("bathroom", "type", e.target.value)
                    }
                  >
                    <option value="">-</option>
                    <option value="SOB">SOB</option>
                    <option value="Sep Shower">Sep Shower</option>
                    <option value="Bath">Bath</option>
                  </select>
                </div>
                <div className="col-span-1">
                  <input
                    type="checkbox"
                    checked={formData.bathroom?.has_checkbox || false}
                    onChange={(e) =>
                      updateNestedField(
                        "bathroom",
                        "has_checkbox",
                        e.target.checked,
                      )
                    }
                    className={paperCheckboxClass}
                  />
                </div>
              </div>
              <div className="grid grid-cols-12 gap-3 items-center">
                <div className="col-span-2 text-xs font-bold text-gray-600 uppercase">
                  Toilets
                </div>
                <div className="col-span-2">
                  <input
                    type="number"
                    className={paperInputClass}
                    value={formData.toilets || ""}
                    onChange={(e) =>
                      updateField("toilets", parseInt(e.target.value))
                    }
                  />
                </div>
              </div>

              {/* LIVING AREAS */}
              <div className="border-t border-gray-200 mt-2 pt-2 space-y-2">
                {[
                  "kitchen",
                  "dining",
                  "lounge",
                  "family",
                  "rumpus",
                  "office",
                  "laundry",
                ].map((room) => {
                  const key = room as keyof ListingData;
                  const data = (formData[key] as any) || {};
                  return (
                    <div
                      key={room}
                      className="grid grid-cols-12 gap-3 items-center"
                    >
                      <div className="col-span-2 text-xs font-bold text-gray-600 uppercase">
                        {room}
                      </div>
                      <div className="col-span-3">
                        <input
                          className={paperInputClass}
                          placeholder="Size"
                          value={data.measurements || ""}
                          onChange={(e) =>
                            updateNestedField(
                              key,
                              "measurements",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                      <div className="col-span-1">
                        <input
                          type="checkbox"
                          checked={data.has_checkbox || false}
                          onChange={(e) =>
                            updateNestedField(
                              key,
                              "has_checkbox",
                              e.target.checked,
                            )
                          }
                          className={paperCheckboxClass}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 4. UTILITIES BLOCK */}
          <div className={paperCardClass}>
            <h3 className={sectionTitleClass}>Services</h3>
            <div className="grid grid-cols-3 gap-4">
              {[
                ["gas_hot_water", "Gas Hot Water"],
                ["town_gas", "Town Gas"],
                ["bottled_gas", "Bottled Gas"],
                ["solar_hot_water", "Solar HW"],
                ["town_water", "Town Water"],
                ["insulation", "Insulation"], // Handling the main yes/no for insulation
              ].map(([key, label]) => (
                <div key={key}>
                  <label className="text-[10px] uppercase text-gray-600">
                    {label}
                  </label>
                  <select
                    className={paperInputClass}
                    value={(formData[key as keyof ListingData] as string) || ""}
                    onChange={(e) =>
                      updateField(key as keyof ListingData, e.target.value)
                    }
                  >
                    <option value="">-</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
              ))}
            </div>
            {/* Insulation Locations */}
            <div className="mt-2 flex gap-4 text-xs">
              {["ceiling", "walls", "floor"].map((loc) => (
                <label
                  key={loc}
                  className="flex items-center gap-1 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={
                      formData.insulation_locations?.[
                        loc as "ceiling" | "walls" | "floor"
                      ] || false
                    }
                    onChange={(e) =>
                      updateDeepNestedField(
                        "insulation",
                        "locations",
                        loc,
                        e.target.checked,
                      )
                    }
                    className={paperCheckboxClass}
                  />
                  <span className="uppercase">{loc}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: 4 cols - INCLUSIONS & NOTES */}
        <div className="col-span-12 lg:col-span-4 space-y-4">
          {/* 5. TOP RIGHT NOTES (Hash, Shed Key, etc) */}
          <div className="bg-yellow-50 border border-yellow-200 p-3 shadow-sm rounded">
            <div className="space-y-2">
              <div>
                <label className="text-[10px] uppercase text-gray-500">
                  Key #
                </label>
                <input
                  className="w-full bg-white border border-yellow-300 p-1 font-mono text-sm"
                  value={formData.handwritten_notes_top?.hash_number || ""}
                  onChange={(e) =>
                    updateNestedField(
                      "handwritten_notes_top",
                      "hash_number",
                      e.target.value,
                    )
                  }
                />
              </div>
              <div>
                <label className="text-[10px] uppercase text-gray-500">
                  Other
                </label>
                <input
                  className="w-full bg-white border border-yellow-300 p-1 font-mono text-sm text-blue-600"
                  value={formData.handwritten_notes_top?.shed_note || ""}
                  onChange={(e) =>
                    updateNestedField(
                      "handwritten_notes_top",
                      "shed_note",
                      e.target.value,
                    )
                  }
                />
              </div>
            </div>
          </div>

          {/* 6. INCLUSIONS CHECKLIST */}
          <div className={paperCardClass}>
            <h3 className={sectionTitleClass}>Inclusions</h3>
            <div className="space-y-1">
              {[
                ["floor_coverings", "Floor Coverings"],
                ["window_furnishings", "Window Furnishings"],
                ["drapes_blinds", "Drapes / Blinds"],
                ["insect_screens", "Insect Screens"],
                ["clothesline", "Clothesline"],
                ["tv_antenna", "TV Antenna"],
              ].map(([key, label]) => (
                <label
                  key={key}
                  className="flex items-center justify-between p-1 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0"
                >
                  <span className="text-xs font-bold text-gray-700 uppercase">
                    {label}
                  </span>
                  <input
                    type="checkbox"
                    checked={
                      (formData[key as keyof ListingData] as boolean) || false
                    }
                    onChange={(e) =>
                      updateField(key as keyof ListingData, e.target.checked)
                    }
                    className={paperCheckboxClass}
                  />
                </label>
              ))}
            </div>

            {/* APPLIANCES TEXT INPUTS */}
            <div className="mt-4 space-y-2">
              {[
                "stove",
                "wall_oven",
                "hot_plates",
                "dishwasher",
                "rangehood",
                "exhaust_fan",
              ].map((field) => (
                <div key={field}>
                  <label className="text-[10px] uppercase text-gray-500">
                    {field.replace("_", " ")}
                  </label>
                  <input
                    className={paperInputClass}
                    value={
                      (formData[field as keyof ListingData] as string) || ""
                    }
                    onChange={(e) =>
                      updateField(field as keyof ListingData, e.target.value)
                    }
                  />
                </div>
              ))}
            </div>

            {/* HEATING/COOLING */}
            <div className="mt-4 space-y-2 pt-4 border-t border-gray-200">
              <h4 className="text-xs font-bold uppercase text-gray-900">
                Heating / Cooling
              </h4>
              {[
                "heating",
                "wood_heater",
                "heat_pump",
                "security_system",
                "solar_panels",
              ].map((field) => (
                <div key={field}>
                  <label className="text-[10px] uppercase text-gray-500">
                    {field.replace("_", " ")}
                  </label>
                  <input
                    className={paperInputClass}
                    value={
                      (formData[field as keyof ListingData] as string) || ""
                    }
                    onChange={(e) =>
                      updateField(field as keyof ListingData, e.target.value)
                    }
                  />
                </div>
              ))}
            </div>
          </div>

          {/* 7. FINANCIALS MINI BLOCK */}
          <div className="bg-green-50 border border-green-200 p-3 shadow-sm rounded">
            <h3 className="font-bold text-green-800 text-xs uppercase mb-2">
              Financials
            </h3>
            <div className="space-y-2">
              <div>
                <label className="text-[10px] uppercase text-green-700">
                  Commission
                </label>
                <input
                  className="w-full bg-white border border-green-300 p-1 text-sm"
                  value={formData.commission || ""}
                  onChange={(e) => updateField("commission", e.target.value)}
                />
              </div>
              <div>
                <label className="text-[10px] uppercase text-green-700">
                  Marketing
                </label>
                <input
                  className="w-full bg-white border border-green-300 p-1 text-sm"
                  value={formData.marketing_fee || ""}
                  onChange={(e) => updateField("marketing_fee", e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 8. NOTES SECTION (Full Width Bottom) */}
      <div className={paperCardClass}>
        <h3 className={sectionTitleClass}>
          <PenTool className="w-3 h-3 inline mr-1" /> Notes Page
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-50 p-4 rounded border border-slate-200">
            <label className={paperLabelClass}>Transcript (OCR)</label>
            <textarea
              className="w-full h-48 bg-transparent text-xs font-mono text-gray-600 resize-none outline-none disabled:opacity-70"
              value={formData.notes_page_content || ""}
              onChange={(e) =>
                updateField("notes_page_content", e.target.value)
              }
            />
          </div>
          <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
            <label className={paperLabelClass}>
              Handwritten Notes (Extracted)
            </label>
            <textarea
              className="w-full h-48 bg-transparent text-lg font-handwriting text-blue-800 resize-none outline-none leading-relaxed disabled:opacity-70"
              style={{
                fontFamily: '"Comic Sans MS", "Chalkboard SE", sans-serif',
              }}
              value={formData.handwritten_notes_section || ""}
              onChange={(e) =>
                updateField("handwritten_notes_section", e.target.value)
              }
            />
          </div>
        </div>
        <div className="mt-4">
          <label className={paperLabelClass}>Bottom Note</label>
          <input
            className={`${paperInputClass} font-handwriting text-blue-600`}
            value={formData.bottom_handwritten_note || ""}
            onChange={(e) =>
              updateField("bottom_handwritten_note", e.target.value)
            }
          />
        </div>
      </div>
    </fieldset>
  );
}
