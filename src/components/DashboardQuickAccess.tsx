import React from 'react';
import { 
  UserPlus, 
  Receipt, 
  CalendarClock, 
  Search, 
  Users, 
  ShieldCheck, 
  Stethoscope, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  ChevronRight,
  TrendingUp,
  FileText,
  DollarSign
} from 'lucide-react';
import { Patient, SurgerySchedule, BillingRecord, DischargeRecord } from '../types';

interface DashboardQuickAccessProps {
  patients: Patient[];
  surgeries: SurgerySchedule[];
  bills: BillingRecord[];
  discharges: DischargeRecord[];
  onNavigate: (tab: any) => void;
  onSelectPatient: (patient: Patient) => void;
}

export const DashboardQuickAccess: React.FC<DashboardQuickAccessProps> = ({
  patients,
  surgeries,
  bills,
  discharges,
  onNavigate,
  onSelectPatient
}) => {
  // Metrics
  const totalPatients = patients.length;
  const insuredCount = patients.filter(p => p.insuranceType === 'Insurance').length;
  const nonInsuredCount = totalPatients - insuredCount;
  const insuredPercentage = totalPatients > 0 ? Math.round((insuredCount / totalPatients) * 100) : 0;

  const upcomingSurgeries = surgeries.filter(s => s.otStatus === 'Scheduled' || s.otStatus === 'Confirmed');
  const completedSurgeries = surgeries.filter(s => s.otStatus === 'Completed');

  const totalInvoiced = bills
    .filter(b => b.billType === 'Invoice' && b.status !== 'Cancelled')
    .reduce((sum, b) => sum + b.totalAmount, 0);

  const totalCollected = bills
    .filter(b => b.status !== 'Cancelled')
    .reduce((sum, b) => sum + (b.amountPaid || 0), 0);

  const totalInsuranceApproved = bills
    .filter(b => b.status !== 'Cancelled')
    .reduce((sum, b) => sum + (b.insuranceApprovalAmount || 0), 0);

  return (
    <div className="p-6 space-y-6 max-w-[1440px] mx-auto">
      {/* Top Welcome Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Dr. Karthik Clinic · Clinical Operations & Surgery Management
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-mono border border-teal-500/30">
              Live Clinical Suite
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Centralized portal for Patient Registration, O.T. Scheduling, Multi-component Billing, and Discharge Summaries.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onNavigate('search')}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-2 transition-colors"
          >
            <Search className="w-3.5 h-3.5 text-teal-400" />
            <span>Search & Unified Report</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('register')}
            className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold rounded-lg shadow-sm shadow-teal-500/20 flex items-center gap-1.5 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>Register New Patient</span>
          </button>
        </div>
      </div>

      {/* PRIMARY QUICK-ACCESS PANEL (The 4 Most Frequent Workflows) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-teal-400 uppercase tracking-wider text-[11px] flex items-center gap-2">
            Primary Quick-Access Workflows
          </span>
          <span className="text-slate-400 text-[11px]">Direct one-click execution</span>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {/* 1. Patient Registration */}
          <div
            onClick={() => onNavigate('register')}
            className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 hover:border-teal-500/60 shadow-sm cursor-pointer transition-all group hover:scale-[1.01]"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 group-hover:bg-teal-500 group-hover:text-slate-950 transition-colors">
                <UserPlus className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono font-bold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded">
                Module I
              </span>
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-teal-300 transition-colors">
              Patient Registration
            </h3>
            <p className="text-xs text-slate-400 mt-1 line-clamp-2">
              Enroll new patient with Name, DOB, MED no, Mobile, Gender, and Insurance categorization.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 group-hover:text-teal-400">
              <span className="font-mono">{totalPatients} Registered</span>
              <span className="font-semibold flex items-center gap-1">Open Form →</span>
            </div>
          </div>

          {/* 2. Billing & Financials */}
          <div
            onClick={() => onNavigate('billing')}
            className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 hover:border-indigo-500/60 shadow-sm cursor-pointer transition-all group hover:scale-[1.01]"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                <Receipt className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                Module III
              </span>
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
              Billing & Financials
            </h3>
            <p className="text-xs text-slate-400 mt-1 line-clamp-2">
              Generate Estimates, Invoices, Receipts, and handle Refunds with multi-cost breakdowns.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 group-hover:text-indigo-400">
              <span className="font-mono">₹{totalCollected.toLocaleString()} Collected</span>
              <span className="font-semibold flex items-center gap-1">Open Billing →</span>
            </div>
          </div>

          {/* 3. O.T. List */}
          <div
            onClick={() => onNavigate('ot-list')}
            className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 hover:border-rose-500/60 shadow-sm cursor-pointer transition-all group hover:scale-[1.01]"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 group-hover:bg-rose-500 group-hover:text-white transition-colors">
                <CalendarClock className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded">
                Module II
              </span>
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-rose-300 transition-colors">
              O.T. List Generation
            </h3>
            <p className="text-xs text-slate-400 mt-1 line-clamp-2">
              View daily Operation Theatre schedule, implants, anesthesia specs, and printable theatre lists.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 group-hover:text-rose-400">
              <span className="font-mono">{upcomingSurgeries.length} Slotted Cases</span>
              <span className="font-semibold flex items-center gap-1">View Schedule →</span>
            </div>
          </div>

          {/* 4. Patient Search */}
          <div
            onClick={() => onNavigate('search')}
            className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 hover:border-amber-500/60 shadow-sm cursor-pointer transition-all group hover:scale-[1.01]"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                <Search className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                Reporting
              </span>
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
              Patient Search & Report
            </h3>
            <p className="text-xs text-slate-400 mt-1 line-clamp-2">
              Dedicated lookup by Name, MED no, Mobile, and single unified master report exporter.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 group-hover:text-amber-400">
              <span className="font-mono">Unified Export</span>
              <span className="font-semibold flex items-center gap-1">Search Records →</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-4 gap-4">
        {/* Total Patients & Insurance Ratio */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span className="font-medium">Total Registered Patients</span>
            <Users className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono tabular-nums">
            {totalPatients}
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-2">
            <span className="text-teal-400 font-semibold">{insuredCount} Insured ({insuredPercentage}%)</span>
            <span>·</span>
            <span>{nonInsuredCount} Non-Insured</span>
          </div>
        </div>

        {/* Upcoming Surgeries */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span className="font-medium">Upcoming Surgeries (O.T.)</span>
            <CalendarClock className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-400 font-mono tabular-nums">
            {upcomingSurgeries.length}
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span>{completedSurgeries.length} Completed surgeries</span>
            <span className="text-rose-400 font-medium cursor-pointer" onClick={() => onNavigate('ot-list')}>
              O.T. Board →
            </span>
          </div>
        </div>

        {/* Financial Collections */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span className="font-medium">Gross Invoiced Revenue</span>
            <DollarSign className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono tabular-nums">
            ₹{totalInvoiced.toLocaleString()}
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Paid: <strong className="text-emerald-400 font-mono">₹{totalCollected.toLocaleString()}</strong></span>
            <span className="text-indigo-400 font-medium cursor-pointer" onClick={() => onNavigate('billing')}>
              Ledger →
            </span>
          </div>
        </div>

        {/* Insurance Approvals */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span className="font-medium">TPA / Insurance Approvals</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono tabular-nums">
            ₹{totalInsuranceApproved.toLocaleString()}
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Discharges: <strong className="text-slate-300 font-mono">{discharges.length}</strong></span>
            <span className="text-emerald-400 font-medium cursor-pointer" onClick={() => onNavigate('discharge')}>
              Post-Care →
            </span>
          </div>
        </div>
      </div>

      {/* 2 Column Section: O.T. List Snapshot & Recent Patients */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left: Operation Theatre List Snapshot (7 cols) */}
        <div className="col-span-7 p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <CalendarClock className="w-4 h-4 text-rose-400" />
                Active Surgery Schedule & O.T. Queue
              </h2>
              <p className="text-[11px] text-slate-400">
                Scheduled procedures, implant requirements, and hospital mapping.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('ot-list')}
              className="text-xs text-rose-400 hover:text-rose-300 font-semibold"
            >
              Full O.T. Sheet →
            </button>
          </div>

          <div className="space-y-2.5">
            {surgeries.slice(0, 4).map((s) => (
              <div
                key={s.id}
                className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{s.patientName}</span>
                    <span className="font-mono text-[11px] text-teal-400">({s.medNo})</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.2 rounded ${
                      s.otStatus === 'Confirmed'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : s.otStatus === 'Completed'
                        ? 'bg-slate-800 text-slate-400'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}>
                      {s.otStatus}
                    </span>
                  </div>
                  <div className="text-xs text-slate-300 font-medium">
                    {s.procedureName}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Hospital: <span className="text-slate-200">{s.tentativeHospital}</span> · Mode: <span className="text-teal-300">{s.paymentMode}</span>
                  </div>
                </div>

                <div className="text-right font-mono text-xs">
                  <div className="text-slate-200 font-bold">{s.tentativeDate}</div>
                  <div className="text-[11px] text-slate-400 mt-1">{s.otRoom || 'O.T. Suite 1'}</div>
                  <div className="text-[11px] text-teal-400 font-semibold mt-0.5">₹{s.estimatedCost.toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Quick Patient Directory (5 cols) */}
        <div className="col-span-5 p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-teal-400" />
                Registered Patients
              </h2>
              <p className="text-[11px] text-slate-400">
                Latest patients registered with medical record IDs.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('search')}
              className="text-xs text-teal-400 hover:text-teal-300 font-semibold"
            >
              Unified Search →
            </button>
          </div>

          <div className="space-y-2">
            {patients.slice(0, 5).map((p) => (
              <div
                key={p.id}
                onClick={() => onSelectPatient(p)}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-teal-500/40 cursor-pointer transition-all flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-teal-300 transition-colors">
                    {p.name}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                    {p.medNo} · DOB: {p.dob} · {p.gender}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    {p.mobile}
                  </div>
                </div>

                <div className="text-right">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded font-mono ${
                    p.insuranceType === 'Insurance'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}>
                    {p.insuranceType}
                  </span>
                  <span className="block text-[10px] text-teal-400 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    Actions →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
