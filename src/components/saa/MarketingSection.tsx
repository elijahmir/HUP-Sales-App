import { ShoppingCart, CheckCircle, Info, Plus, Trash2 } from "lucide-react";
import type { FormData } from "@/lib/saa/types";
import { MarketingItem, getMarketingGroups } from "@/lib/saa/marketing";
import { formatNumberWithCommas } from "@/lib/saa/validation";
import { useState } from "react";

interface MarketingSectionProps {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
  items: MarketingItem[];
}

export function MarketingSection({
  formData,
  updateFormData,
  items,
}: MarketingSectionProps) {
  const [customName, setCustomName] = useState("");
  const [customPrice, setCustomPrice] = useState("");

  const marketingGroups = getMarketingGroups(items);

  const handleToggle = (id: string) => {
    const selected = new Set(formData.selectedMarketing);
    if (selected.has(id)) {
      selected.delete(id);
    } else {
      selected.add(id);
    }
    updateFormData({ selectedMarketing: Array.from(selected) });
  };

  const handleAddCustomItem = () => {
    if (!customName.trim() || !customPrice.trim()) return;
    const price = parseFloat(customPrice.replace(/[^0-9.]/g, ""));
    if (isNaN(price)) return;

    const newItem: MarketingItem = {
      id: `custom_${Date.now()}`,
      name: customName.trim(),
      price,
      group: "Custom Additions",
    };

    updateFormData({
      customMarketingItems: [...(formData.customMarketingItems || []), newItem],
      selectedMarketing: [...formData.selectedMarketing, newItem.id],
    });

    setCustomName("");
    setCustomPrice("");
  };

  const handleRemoveCustomItem = (id: string) => {
    updateFormData({
      customMarketingItems: formData.customMarketingItems.filter(i => i.id !== id),
      selectedMarketing: formData.selectedMarketing.filter(i => i !== id),
    });
  };

  const allAvailableItems = [...items, ...(formData.customMarketingItems || [])];

  const totalCost = formData.selectedMarketing.reduce((sum, id) => {
    const item = allAvailableItems.find((i) => i.id === id);
    return sum + (item?.price || 0);
  }, 0);

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="section-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h2 className="section-title mb-0">
            <ShoppingCart className="text-harcourts-blue" />
            Marketing Package
          </h2>
          <div className="px-4 py-2 bg-harcourts-navy text-white rounded-lg shadow-sm">
            <span className="text-sm opacity-80 mr-2">
              Total Estimated Cost:
            </span>
            <span className="text-lg font-bold">
              ${formatNumberWithCommas(totalCost.toString())}
            </span>
          </div>
        </div>

        <div className="space-y-8">
          {Object.entries(marketingGroups).map(([groupName, items]) => (
            <div
              key={groupName}
              className="space-y-4 pb-6 border-b border-gray-100 last:border-0 last:pb-0"
            >
              <h3 className="font-semibold text-harcourts-blue uppercase tracking-wider text-xs md:text-sm pl-1">
                {groupName}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.map((item) => {
                  const isSelected = formData.selectedMarketing.includes(
                    item.id,
                  );
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleToggle(item.id)}
                      className={`
                        flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 text-left group
                        ${isSelected
                          ? "bg-blue-50/50 border-harcourts-blue shadow-sm"
                          : "bg-white border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                        }
                      `}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`
                            w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200
                            ${isSelected
                              ? "bg-harcourts-blue border-harcourts-blue text-white"
                              : "bg-white border-gray-200 group-hover:border-gray-300 text-transparent"
                            }
                          `}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </div>
                        <span
                          className={`font-medium transition-colors ${isSelected ? "text-harcourts-navy" : "text-gray-700"
                            }`}
                        >
                          {item.name}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-gray-900 ml-4 font-mono">
                        ${formatNumberWithCommas(item.price.toString())}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Custom Items Section */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <h3 className="font-semibold text-harcourts-blue uppercase tracking-wider text-xs md:text-sm pl-1">
              Custom Additions
            </h3>

            {formData.customMarketingItems?.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 rounded-xl border border-harcourts-blue bg-blue-50 text-left shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <span className="font-medium text-harcourts-navy">
                    {item.name}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold text-gray-900 font-mono">
                    ${formatNumberWithCommas(item.price.toString())}
                  </span>
                  <button
                    onClick={() => handleRemoveCustomItem(item.id)}
                    className="p-1.5 text-red-500 hover:bg-red-100 rounded-md transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            <div className="flex flex-col md:flex-row items-center gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <input
                type="text"
                placeholder="Item Name (e.g. Drone Photography)"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-harcourts-blue focus:border-harcourts-blue outline-none"
              />
              <div className="relative w-full md:w-48">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value.replace(/[^0-9.]/g, ""))}
                  className="w-full pl-7 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-harcourts-blue focus:border-harcourts-blue outline-none"
                />
              </div>
              <button
                type="button"
                onClick={handleAddCustomItem}
                disabled={!customName.trim() || !customPrice.trim()}
                className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-2 bg-harcourts-blue text-white rounded-lg hover:bg-harcourts-navy transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </button>
            </div>
          </div>
        </div>

        {/* Info Note */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg flex items-start gap-3 text-sm text-gray-600">
          <Info className="w-5 h-5 flex-shrink-0 text-harcourts-blue mt-0.5" />
          <p>
            This marketing schedule is an estimate. Final costs may vary based
            on specific vendor requirements and provider rates. This selection
            approves the agent to incur these costs on behalf of the vendor.
          </p>
        </div>
      </div>
    </div>
  );
}
