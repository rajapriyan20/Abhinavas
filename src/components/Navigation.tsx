import React from 'react';
import { 
  LayoutDashboard, 
  UserPlus, 
  Search, 
  CalendarClock, 
  Stethoscope, 
  Receipt, 
  FileCheck, 
  ChevronLeft, 
  ChevronRight, 
  Building2,
  FileSpreadsheet,
  BadgeCheck,
  CreditCard,
  Sparkles,
  Eye
} from 'lucide-react';

export type ActiveTab = 
  | 'dashboard'
  | 'register'
  | 'search'
  | 'surgeries'
  | 'ot-list'
  | 'rate-card'
  | 'billing'
  | 'discharge';

interface NavigationProps {
  currentTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  totalPatients: number;
  upcomingSurgeriesCount: number;
  unpaidBillsCount: number;
  isFirebaseConnected: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onSelectTab,
  collapsed,
  onToggleCollapse,
  totalPatients,
  upcomingSurgeriesCount,
  unpaidBillsCount,
  isFirebaseConnected
}) => {
  const quickAccessItems = [
    { id: 'register' as ActiveTab, label: 'Patient Registration', icon: UserPlus, badge: null },
    { id: 'billing' as ActiveTab, label: 'Billing & Financials', icon: Receipt, badge: unpaidBillsCount > 0 ? unpaidBillsCount : null },
    { id: 'ot-list' as ActiveTab, label: 'O.T. List', icon: CalendarClock, badge: upcomingSurgeriesCount > 0 ? upcomingSurgeriesCount : null },
    { id: 'search' as ActiveTab, label: 'Patient Search & Report', icon: Search, badge: totalPatients > 0 ? totalPatients : null },
  ];

  const modules = [
    { id: 'dashboard' as ActiveTab, label: 'Overview Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'surgeries' as ActiveTab, label: 'Surgery Scheduling', icon: Stethoscope, badge: null },
    { id: 'rate-card' as ActiveTab, label: 'Procedure Rate Card', icon: FileSpreadsheet, badge: null },
    { id: 'discharge' as ActiveTab, label: 'Discharge Summaries', icon: FileCheck, badge: null },
  ];

  return (
    <aside
      className={`h-screen sticky top-0 flex flex-col bg-slate-950 border-r border-slate-800 transition-all duration-300 ease-in-out shrink-0 select-none z-30 ${
        collapsed ? 'w-[72px]' : 'w-[270px]'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center px-4 border-b border-slate-800/80 justify-between">
        {!collapsed ? (
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-slate-950 font-black shadow-md shadow-teal-500/20 shrink-0">
              <Eye className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>
            <div className="flex flex-col truncate">
              <span className="font-bold text-xs tracking-tight text-white flex items-center gap-1.5 truncate">
                Abhinavas Eye Care
              </span>
              <span className="text-[10px] font-semibold text-teal-400 uppercase tracking-wider truncate">
                ip management
              </span>
            </div>
          </div>
        ) : (
          <div className="w-full flex justify-center">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-slate-950 font-black shadow-md shadow-teal-500/20">
              <Eye className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>
          </div>
        )}

        {!collapsed && (
          <button
            type="button"
            onClick={onToggleCollapse}
            title="Collapse sidebar"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

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

      {/* Nav Content */}
      <div className="flex-1 py-4 px-3 space-y-4 overflow-y-auto">
        {/* Quick-Access Section */}
        <div>
          {!collapsed && (
            <div className="px-3 pb-2 text-[10px] font-bold text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" />
              <span>Quick-Access Panel</span>
            </div>
          )}
          <div className="space-y-1">
            {quickAccessItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectTab(item.id)}
                  title={collapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all group relative ${
                    isActive
                      ? 'bg-teal-500 text-slate-950 font-bold shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-slate-950 stroke-[2.5]' : 'text-slate-400 group-hover:text-slate-200'}`} />
                  {!collapsed && <span className="truncate flex-1 text-left">{item.label}</span>}
                  {!collapsed && item.badge !== null && (
                    <span className={`font-mono text-[10px] tabular-nums px-1.5 py-0.5 rounded font-bold ${
                      isActive ? 'bg-slate-950 text-teal-300' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                  {collapsed && (
                    <div className="absolute left-full ml-3 px-2.5 py-1 bg-slate-900 text-slate-100 text-xs rounded-md shadow-xl border border-slate-700 whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                      {item.label}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Core Clinical Modules */}
        <div>
          {!collapsed && (
            <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Core Modules
            </div>
          )}
          <div className="space-y-1">
            {modules.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectTab(item.id)}
                  title={collapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all group relative ${
                    isActive
                      ? 'bg-teal-500/15 text-teal-300 font-semibold border border-teal-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-teal-400' : 'text-slate-400 group-hover:text-slate-300'}`} />
                  {!collapsed && <span className="truncate flex-1 text-left">{item.label}</span>}
                  {collapsed && (
                    <div className="absolute left-full ml-3 px-2.5 py-1 bg-slate-900 text-slate-100 text-xs rounded-md shadow-xl border border-slate-700 whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                      {item.label}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Clinic Inpatient Unit Card */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/60">
        {!collapsed ? (
          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-300 text-xs font-bold shrink-0">
                AE
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-slate-200 truncate">
                  Abhinavas Eye Care
                </span>
                <span className="text-[10px] text-slate-400 truncate">
                  Inpatient & Surgery Unit
                </span>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px]">
              <span className="text-slate-400">Database Status</span>
              <span className={`font-mono px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                isFirebaseConnected ? 'text-emerald-400 bg-emerald-500/10' : 'text-amber-400 bg-amber-500/10'
              }`}>
                {isFirebaseConnected ? 'Connected' : 'Syncing'}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-8 h-8 rounded-full bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-300 text-xs font-bold">
              AE
            </div>
            <div className={`w-2 h-2 rounded-full ${isFirebaseConnected ? 'bg-emerald-400' : 'bg-amber-400'}`} />
          </div>
        )}
      </div>
    </aside>
  );
};
