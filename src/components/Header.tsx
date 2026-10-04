import React, { useState, useEffect } from 'react';
import { 
  Search, 
  X, 
  UserPlus, 
  LogIn, 
  LogOut, 
  Clock, 
  Calendar,
  Sparkles,
  Receipt,
  CalendarClock
} from 'lucide-react';
import { User } from 'firebase/auth';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenRegisterModal: () => void;
  onNavigateToTab: (tab: any) => void;
  currentUser: User | null;
  onLogin: () => void;
  onLogout: () => void;
  onSeedData: () => void;
  isSeeding: boolean;
  totalPatientsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  onOpenRegisterModal,
  onNavigateToTab,
  currentUser,
  onLogin,
  onLogout,
  onSeedData,
  isSeeding,
  totalPatientsCount
}) => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateStr = now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <header className="h-16 bg-slate-900/90 border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md">
      {/* Left: Global Search */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Global search by Name, MED no (MED-2026-...), Mobile, Procedure, or Insurance..."
            className="w-full bg-slate-950/80 border border-slate-700/80 rounded-lg pl-10 pr-9 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-all font-sans"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        {/* Clinic Clock */}
        <div className="hidden xl:flex items-center gap-3 text-xs border-r border-slate-800 pr-4">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Calendar className="w-3.5 h-3.5 text-teal-400" />
            <span>{dateStr}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300 font-mono tabular-nums">
            <Clock className="w-3.5 h-3.5 text-teal-400" />
            <span>{timeStr}</span>
          </div>
        </div>

        {/* Demo Data Seeder */}
        {totalPatientsCount === 0 && (
          <button
            type="button"
            onClick={onSeedData}
            disabled={isSeeding}
            className="px-3 py-1.5 bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 border border-indigo-500/40 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
            title="Populate demo clinic data across all 4 modules"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isSeeding ? 'Populating...' : 'Seed Clinic Data'}</span>
          </button>
        )}

        {/* Action Button: Patient Registration */}
        <button
          type="button"
          onClick={onOpenRegisterModal}
          className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-2 shadow-sm shadow-teal-500/20 transition-all active:scale-[0.98] whitespace-nowrap"
        >
          <UserPlus className="w-4 h-4 text-slate-950 stroke-[2.5]" />
          <span>Patient Registration</span>
        </button>

        {/* User Auth */}
        {currentUser ? (
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            {currentUser.photoURL ? (
              <img
                src={currentUser.photoURL}
                alt={currentUser.displayName || 'Clinic User'}
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-full border border-teal-500/40 object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-teal-300 text-xs font-semibold">
                {currentUser.displayName
                  ? currentUser.displayName.charAt(0).toUpperCase()
                  : currentUser.email?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-medium text-slate-200 truncate max-w-[130px]">
                {currentUser.displayName || 'Clinic Staff'}
              </span>
              <span className="text-[10px] text-slate-400 truncate max-w-[130px]">
                {currentUser.email}
              </span>
            </div>
            <button
              type="button"
              onClick={onLogout}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors ml-1"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onLogin}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 border border-slate-700 transition-colors"
          >
            <LogIn className="w-3.5 h-3.5 text-teal-400" />
            <span>Staff Login</span>
          </button>
        )}
      </div>
    </header>
  );
};
