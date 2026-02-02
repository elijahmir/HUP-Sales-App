import { User, Building2, Mail, Phone, MapPin } from "lucide-react";
import type { FormData } from "@/lib/saa/types";
import { agents, getAgentByName, getOfficeByName } from "@/lib/saa/agents";

interface AgentSectionProps {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
}

export function AgentSection({ formData, updateFormData }: AgentSectionProps) {
  const handleAgentChange = (agentName: string) => {
    const agent = getAgentByName(agentName);
    if (agent) {
      const office = getOfficeByName(agent.office);
      updateFormData({
        agentName: agent.name,
        agentEmail: agent.email,
        agentMobile: agent.mobile,
        officeName: agent.office,
        officeStreet: office?.street || "",
        officeSuburb: office?.suburb || "",
        officeState: office?.state || "TAS",
        officePostcode: office?.postcode || "",
        officePhone: office?.phone || "",
      });
    } else {
      // Clear fields if agent not found
      updateFormData({
        agentName: "",
        agentEmail: "",
        agentMobile: "",
        officeName: "",
        officeStreet: "",
        officeSuburb: "",
        officeState: "TAS",
        officePostcode: "",
        officePhone: "",
      });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-harcourts-navy">
          <User className="text-harcourts-blue" />
          Agent Selection
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Agent Dropdown */}
          <div className="col-span-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Agent
            </label>
            <div className="relative">
              <select
                value={formData.agentName}
                onChange={(e) => handleAgentChange(e.target.value)}
                className="input-field appearance-none"
              >
                <option value="">Choose an agent...</option>
                {agents.map((agent) => (
                  <option key={agent.email} value={agent.name}>
                    {agent.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                <svg
                  className="h-4 w-4 fill-current"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Auto-populated details */}
          {formData.agentName && (
            <>
              {/* Personal Details */}
              <div className="md:col-span-1 space-y-4 animate-fade-in">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                  Personal Details
                </h3>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Email
                  </label>
                  <div className="flex items-center gap-2 text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <Mail className="w-4 h-4 text-gray-400" />
                    {formData.agentEmail}
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Mobile
                  </label>
                  <div className="flex items-center gap-2 text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <Phone className="w-4 h-4 text-gray-400" />
                    {formData.agentMobile}
                  </div>
                </div>
              </div>

              {/* Office Details */}
              <div className="md:col-span-1 space-y-4 animate-fade-in delay-100">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                  Office Details
                </h3>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Office
                  </label>
                  <div className="flex items-center gap-2 text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <Building2 className="w-4 h-4 text-gray-400" />
                    Harcourts {formData.officeName}
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Address
                  </label>
                  <div className="flex items-start gap-2 text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      <p>{formData.officeStreet}</p>
                      <p>
                        {formData.officeSuburb}, {formData.officeState}{" "}
                        {formData.officePostcode}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
