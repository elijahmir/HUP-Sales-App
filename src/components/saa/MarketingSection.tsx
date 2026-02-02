import { ShoppingCart, CheckCircle, Info } from "lucide-react";
import type { FormData } from "@/lib/saa/types";
import { marketingItems, getMarketingGroups } from "@/lib/saa/marketing";
import { formatNumberWithCommas } from "@/lib/saa/validation";

interface MarketingSectionProps {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
}

export function MarketingSection({
  formData,
  updateFormData,
}: MarketingSectionProps) {
  const marketingGroups = getMarketingGroups();

  const handleToggle = (id: string) => {
    const selected = new Set(formData.selectedMarketing);
    if (selected.has(id)) {
      selected.delete(id);
    } else {
      selected.add(id);
    }
    updateFormData({ selectedMarketing: Array.from(selected) });
  };

  const totalCost = formData.selectedMarketing.reduce((sum, id) => {
    const item = marketingItems.find((i) => i.id === id);
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
                        ${
                          isSelected
                            ? "bg-blue-50/50 border-harcourts-blue shadow-sm"
                            : "bg-white border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                        }
                      `}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`
                            w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200
                            ${
                              isSelected
                                ? "bg-harcourts-blue border-harcourts-blue text-white"
                                : "bg-white border-gray-200 group-hover:border-gray-300 text-transparent"
                            }
                          `}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </div>
                        <span
                          className={`font-medium transition-colors ${
                            isSelected ? "text-harcourts-navy" : "text-gray-700"
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
