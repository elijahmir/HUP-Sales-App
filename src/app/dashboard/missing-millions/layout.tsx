"use client";

/**
 * Missing Millions sub-navigation layout.
 * Adds a horizontal tab bar below the main dashboard header.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Contact,
  Kanban,
  RefreshCw,
  CheckSquare,
  Search,
  Download,
} from "lucide-react";

const ICON_MAP: Record<string, React.ReactNode> = {
  "layout-dashboard": <LayoutDashboard className="w-4 h-4" />,
  users: <Users className="w-4 h-4" />,
  contact: <Contact className="w-4 h-4" />,
  kanban: <Kanban className="w-4 h-4" />,
  "refresh-cw": <RefreshCw className="w-4 h-4" />,
  "check-square": <CheckSquare className="w-4 h-4" />,
  search: <Search className="w-4 h-4" />,
  download: <Download className="w-4 h-4" />,
};

const TABS = [
  { name: "Dashboard", href: "/dashboard/missing-millions", icon: "layout-dashboard" },
  { name: "Customers", href: "/dashboard/missing-millions/customers", icon: "users" },
  { name: "Contacts", href: "/dashboard/missing-millions/contacts", icon: "contact" },
  { name: "Pipeline", href: "/dashboard/missing-millions/pipeline", icon: "kanban" },
  { name: "Sold Updates", href: "/dashboard/missing-millions/sold-updates", icon: "refresh-cw" },
  { name: "VaultRE Check", href: "/dashboard/missing-millions/vault-checker", icon: "check-square" },
  { name: "Vendor Lookup", href: "/dashboard/missing-millions/vendor-lookup", icon: "search" },
  { name: "Export", href: "/dashboard/missing-millions/export", icon: "download" },
];

export default function MissingMillionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard/missing-millions") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Missing Millions
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          CRM Intelligence & Revenue Tracking for Harcourts Ulverstone &
          Penguin
        </p>
      </div>

      {/* Tab Navigation */}
      <nav className="flex gap-1 overflow-x-auto pb-1 -mb-px">
        {TABS.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${
              isActive(tab.href)
                ? "bg-[#00ADEF]/10 text-[#00ADEF] shadow-sm"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            }`}
          >
            {ICON_MAP[tab.icon]}
            <span className="hidden sm:inline">{tab.name}</span>
          </Link>
        ))}
      </nav>

      {/* Page Content */}
      <div>{children}</div>
    </div>
  );
}
