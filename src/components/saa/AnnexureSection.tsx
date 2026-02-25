import { useEffect, useRef } from "react";
import { FileText, Plus, Trash2, AlertCircle } from "lucide-react";
import type { FormData } from "@/lib/saa/types";
import { createEmptyAnnexure } from "@/lib/saa/types";

interface AnnexureSectionProps {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
  errors: Record<string, string | undefined>;
}

export function AnnexureSection({
  formData,
  updateFormData,
  errors,
}: AnnexureSectionProps) {
  const MAX_ITEMS = 13;
  const prevCountRef = useRef(formData.annexureCount || 1);

  // Initialize annexure data if missing (for legacy data)
  useEffect(() => {
    if (!formData.annexureItems || formData.annexureItems.length === 0) {
      const emptyItems = Array.from({ length: 13 }, () =>
        createEmptyAnnexure(),
      );
      updateFormData({
        annexureCount: formData.annexureCount || 1,
        annexureItems: emptyItems,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-focus new item when count increases
  useEffect(() => {
    const currentCount = formData.annexureCount || 1;
    if (currentCount > prevCountRef.current) {
      // Focus the new item's title field
      const newItemIndex = currentCount - 1;
      const input = document.getElementById(`annexure-${newItemIndex}-item`);
      if (input) {
        input.focus();
      }
    }
    prevCountRef.current = currentCount;
  }, [formData.annexureCount]);

  const updateItem = (
    index: number,
    field: "item" | "description",
    value: string,
  ) => {
    const newItems = [...formData.annexureItems];
    if (!newItems[index]) {
      newItems[index] = createEmptyAnnexure();
    }
    newItems[index] = { ...newItems[index], [field]: value };
    updateFormData({ annexureItems: newItems });
  };

  const handleAddItem = () => {
    if (formData.annexureCount < MAX_ITEMS) {
      updateFormData({ annexureCount: formData.annexureCount + 1 });
    }
  };

  const handleRemoveItem = (index: number) => {
    if (formData.annexureCount > 1) {
      const newItems = [...formData.annexureItems];
      // Shift items up from the removed index
      for (let i = index; i < formData.annexureCount - 1; i++) {
        newItems[i] = { ...newItems[i + 1] };
      }
      // Reset the last active item (now unused) to empty
      newItems[formData.annexureCount - 1] = createEmptyAnnexure();

      updateFormData({
        annexureCount: formData.annexureCount - 1,
        annexureItems: newItems,
      });
    }
  };

  if (!formData.annexureItems || formData.annexureItems.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">Loading Annexure...</div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="section-card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="section-title mb-0">
            <FileText className="text-harcourts-blue" />
            Annexure A Items
          </h2>
          <span className="text-sm font-medium text-gray-500">
            {formData.annexureCount} / {MAX_ITEMS} Items
          </span>
        </div>

        <div className="p-4 bg-amber-50 rounded-lg border border-amber-200 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-gray-700">
            <p className="font-medium text-amber-800 mb-1">Important Note</p>
            <p>
              Use this section to list Chattels, Inclusions, or Special
              Conditions. Only valid filled items will be included in the final
              agreement.
            </p>
          </div>
        </div>

        {errors.annexure && (
          <div className="p-4 bg-red-50 rounded-lg border border-red-200 mb-6 flex items-center gap-3 animate-pulse">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-sm font-medium text-red-700">
              {errors.annexure}
            </p>
          </div>
        )}

        <div className="space-y-4">
          {Array.from({ length: formData.annexureCount }).map((_, index) => (
            <div
              key={index}
              className="p-6 bg-gray-50 rounded-xl border border-gray-200/60 transition-all hover:border-gray-300 relative group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-harcourts-blue text-white flex items-center justify-center text-xs font-bold shadow-sm">
                    {index + 1}
                  </div>
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Item Details
                  </h3>
                </div>

                {formData.annexureCount > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                    title="Remove Item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-4">
                  <label
                    htmlFor={`annexure-${index}-item`}
                    className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2"
                  >
                    Item Name
                  </label>
                  <input
                    id={`annexure-${index}-item`}
                    type="text"
                    value={formData.annexureItems[index]?.item || ""}
                    onChange={(e) => updateItem(index, "item", e.target.value)}
                    className="input-field bg-white"
                    placeholder="e.g. Dishwasher"
                  />
                </div>

                <div className="md:col-span-8">
                  <label
                    htmlFor={`annexure-${index}-description`}
                    className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2"
                  >
                    Description / Details
                  </label>
                  <textarea
                    id={`annexure-${index}-description`}
                    value={formData.annexureItems[index]?.description || ""}
                    onChange={(e) =>
                      updateItem(index, "description", e.target.value)
                    }
                    className="input-field bg-white resize-y min-h-[80px]"
                    placeholder="e.g. Westinghouse model in kitchen"
                    rows={3}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleAddItem}
            disabled={formData.annexureCount >= MAX_ITEMS}
            className="flex-1 btn-secondary flex items-center justify-center gap-2 py-3"
          >
            <Plus className="w-4 h-4" />
            Add New Item
          </button>
        </div>
      </div>
    </div>
  );
}
