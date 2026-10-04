import React from 'react';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  BedDouble,
  Activity,
  FileCheck2,
  ChevronLeft,
  ChevronRight,
  Stethoscope,
  Database,
  ShieldCheck,
  Building2
} from 'lucide-react';

export type NavTab = 'dashboard' | 'inpatients' | 'admit' | 'beds' | 'vitals' | 'discharge';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  admittedCount: number;
  totalOccupancyRate: number;
  isFirebaseConnected: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  collapsed,
  onToggleCollapse,
  admittedCount,
  totalOccupancyRate,
  isFirebaseConnected
}) => {
  const navItems = [
    {
      id: 'dashboard' as NavTab,
      label: 'Clinic Overview',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'inpatients' as NavTab,
      label: 'Inpatients Registry',
      icon: Users,
      badge: admittedCount > 0 ? admittedCount : null
    },
    {
      id: 'admit' as NavTab,
      label: 'Admit New Patient',
      icon: UserPlus,
      badge: null
    },
    {
      id: 'beds' as NavTab,
      label: 'Wards & Bed Status',
      icon: BedDouble,
      badge: `${totalOccupancyRate}%`
    },
    {
      id: 'vitals' as NavTab,
      label: 'Vitals & Daily Rounds',
      icon: Activity,
      badge: null
    },
    {
      id: 'discharge' as NavTab,
      label: 'Discharge Records',
      icon: FileCheck2,
      badge: null
    }
  ];

  return (
    <aside
      className={`h-screen sticky top-0 flex flex-col bg-slate-950 border-r border-slate-800 transition-all duration-300 ease-in-out shrink-0 select-none z-30 ${
        collapsed ? 'w-[72px]' : 'w-[264px]'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center px-4 border-b border-slate-800/80 justify-between">
        {!collapsed ? (
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white shadow-md shadow-teal-500/20 shrink-0">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div className="flex flex-col truncate">
              <span className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5 truncate">
                Dr. Karthik Clinic
              </span>
              <span className="text-[11px] font-medium text-slate-400 truncate">
                Inpatient Department
              </span>
            </div>
          </div>
        ) : (
          <div className="w-full flex justify-center">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
              <Stethoscope className="w-5 h-5" />
            </div>
          </div>
        )}

        {/* Collapse toggle button */}
        {!collapsed && (
          <button
            type="button"
            onClick={onToggleCollapse}
            title="Collapse sidebar"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* When collapsed, toggle button at top */}
      {collapsed && (
        <div className="px-3 py-2 flex justify-center border-b border-slate-800/50">
          <button
            type="button"
            onClick={onToggleCollapse}
            title="Expand sidebar"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
        {!collapsed && (
          <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Clinical Operations
          </div>
        )}

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all group relative ${
                isActive
                  ? 'bg-teal-500/15 text-teal-300 font-semibold border border-teal-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-colors ${
                  isActive ? 'text-teal-400' : 'text-slate-400 group-hover:text-slate-300'
                }`}
              />

              {!collapsed && (
                <span className="truncate flex-1 text-left">{item.label}</span>
              )}

              {!collapsed && item.badge !== null && (
                <span
                  className={`font-mono text-[11px] tabular-nums px-2 py-0.5 rounded-full font-semibold ${
                    isActive
                      ? 'bg-teal-500/25 text-teal-200'
                      : 'bg-slate-800 text-slate-400 group-hover:text-slate-200'
                  }`}
                >
                  {item.badge}
                </span>
              )}

              {/* Tooltip on collapsed */}
              {collapsed && (
                <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900 text-slate-200 text-xs rounded-md shadow-xl border border-slate-700 whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                  {item.label}
                  {item.badge !== null && ` (${item.badge})`}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Attending Doctor Profile Card & System Status */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/60 space-y-2">
        {!collapsed ? (
          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-teal-600/30 border border-teal-500/50 flex items-center justify-center text-teal-300 text-xs font-bold shrink-0">
                DK
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-slate-200 truncate">
                  Dr. Karthik
                </span>
                <span className="text-[10px] text-slate-400 truncate">
                  M.B.B.S., M.D. (Physician)
                </span>
              </div>
            </div>

            <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px]">
              <span className="flex items-center gap-1.5 text-slate-400">
                <Database className="w-3 h-3 text-teal-400" />
                Firestore DB
              </span>
              <span
                className={`font-mono px-1.5 py-0.5 rounded text-[10px] font-medium ${
                  isFirebaseConnected
                    ? 'text-emerald-400 bg-emerald-500/10'
                    : 'text-amber-400 bg-amber-500/10'
                }`}
              >
                {isFirebaseConnected ? 'Active' : 'Connecting'}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div
              className="w-8 h-8 rounded-full bg-teal-600/30 border border-teal-500/50 flex items-center justify-center text-teal-300 text-xs font-bold"
              title="Dr. Karthik M.B.B.S., M.D."
            >
              DK
            </div>
            <div
              className={`w-2 h-2 rounded-full ${
                isFirebaseConnected ? 'bg-emerald-400 ring-2 ring-emerald-500/20' : 'bg-amber-400'
              }`}
              title={isFirebaseConnected ? 'Firestore Connected' : 'Connecting...'}
            />
          </div>
        )}
      </div>
    </aside>
  );
};
