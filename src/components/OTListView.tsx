import React, { useState } from 'react';
import { 
  CalendarClock, 
  Printer, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Stethoscope, 
  Building, 
  Filter,
  Activity,
  Plus
} from 'lucide-react';
import { SurgerySchedule, OTStatus } from '../types';

interface OTListViewProps {
  surgeries: SurgerySchedule[];
  onUpdateStatus: (id: string, newStatus: OTStatus) => Promise<void>;
  onOpenScheduleModal: () => void;
}

export const OTListView: React.FC<OTListViewProps> = ({
  surgeries,
  onUpdateStatus,
  onOpenScheduleModal
}) => {
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Unique surgery dates
  const dates = Array.from(new Set(surgeries.map(s => s.tentativeDate))).sort();

  const filteredSurgeries = surgeries.filter((s) => {
    const matchesDate = selectedDateFilter === 'All' || s.tentativeDate === selectedDateFilter;
    const matchesStatus = statusFilter === 'All' || s.otStatus === statusFilter;
    return matchesDate && matchesStatus;
  }).sort((a, b) => new Date(a.tentativeDate).getTime() - new Date(b.tentativeDate).getTime());

  return (
    <div className="p-6 space-y-6 max-w-[1440px] mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Operation Theatre (O.T.) List Generation
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono border border-rose-500/30">
              O.T. Board
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Operation theatre master scheduling, consumable/implant prep checklists, and official theatre sheet generation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-2 transition-colors"
          >
            <Printer className="w-4 h-4 text-teal-400" />
            <span>Print Official O.T. List</span>
          </button>
          <button
            type="button"
            onClick={onOpenScheduleModal}
            className="px-4 py-2 bg-rose-500 hover:bg-rose-400 text-white text-xs font-bold rounded-lg shadow-sm shadow-rose-500/20 flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Case to O.T. List</span>
          </button>
        </div>
      </div>

      {/* Filter Ribbon */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs">
          <span className="font-semibold text-slate-300">Filter Date:</span>
          <select
            value={selectedDateFilter}
            onChange={(e) => setSelectedDateFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 font-mono"
          >
            <option value="All">All Slotted Dates</option>
            {dates.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          <span className="font-semibold text-slate-300 ml-3">O.T. Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200"
          >
            <option value="All">All Statuses</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Confirmed">Confirmed</option>
            <option value="In O.T.">In O.T.</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        <div className="text-xs text-slate-400 font-mono">
          Showing <strong className="text-white">{filteredSurgeries.length}</strong> O.T. Surgical Cases
        </div>
      </div>

      {/* O.T. Sheet Table */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 shadow-sm overflow-hidden print:border-none print:shadow-none">
        {/* Printable Header (Visible during Print or Screen) */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <CalendarClock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Dr. Karthik Surgical Centre · Operation Theatre List
              </h2>
              <span className="text-[11px] text-slate-400 font-mono">
                Date: {selectedDateFilter === 'All' ? 'Consolidated Upcoming Week' : selectedDateFilter}
              </span>
            </div>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            Attending Surgeon: Dr. Karthik M.B.B.S., M.D., F.I.A.G.E.S.
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 font-semibold select-none">
              <tr>
                <th className="py-3 px-3 text-center">Case #</th>
                <th className="py-3 px-3">Date & O.T. Room</th>
                <th className="py-3 px-3">Patient & MED no</th>
                <th className="py-3 px-3">Surgical Procedure</th>
                <th className="py-3 px-3">Consumables & Implants Checklist</th>
                <th className="py-3 px-3">Anesthesia</th>
                <th className="py-3 px-3">Payment & Pre-Auth</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-right print:hidden">Update Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans text-slate-300">
              {filteredSurgeries.map((s, idx) => (
                <tr key={s.id} className="hover:bg-slate-800/50 transition-colors">
                  {/* Case # */}
                  <td className="py-3 px-3 text-center font-mono font-bold text-slate-400">
                    #{idx + 1}
                  </td>

                  {/* Date & O.T. */}
                  <td className="py-3 px-3 font-mono">
                    <strong className="text-white block">{s.tentativeDate}</strong>
                    <span className="text-[10px] text-teal-400 font-semibold">{s.otRoom || 'O.T. Suite 1'}</span>
                  </td>

                  {/* Patient Name */}
                  <td className="py-3 px-3">
                    <strong className="text-slate-100 block">{s.patientName}</strong>
                    <span className="text-[11px] font-mono text-teal-400">{s.medNo}</span>
                  </td>

                  {/* Procedure */}
                  <td className="py-3 px-3 max-w-[200px]">
                    <div className="font-semibold text-slate-200">{s.procedureName}</div>
                    <div className="text-[10px] text-slate-400 truncate">{s.tentativeHospital}</div>
                  </td>

                  {/* Consumables / Implants */}
                  <td className="py-3 px-3 max-w-[240px] text-[11px] bg-slate-950/40 p-2 rounded border border-slate-800/60">
                    <span className="font-semibold text-rose-300 block mb-0.5">Implants / Kit:</span>
                    <span className="text-slate-300 leading-snug">{s.consumablesAndImplants}</span>
                  </td>

                  {/* Anesthesia */}
                  <td className="py-3 px-3 text-[11px] text-slate-300">
                    {s.anesthesiaType || 'General Anesthesia'}
                  </td>

                  {/* Payment */}
                  <td className="py-3 px-3">
                    <div className="font-medium text-slate-200">{s.paymentMode}</div>
                    {s.insuranceApprovalAmount > 0 ? (
                      <span className="text-[10px] font-mono text-emerald-400 block">
                        Auth: ₹{s.insuranceApprovalAmount.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500">Direct Pay</span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="py-3 px-3 text-center">
                    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                      s.otStatus === 'Confirmed'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : s.otStatus === 'In O.T.'
                        ? 'bg-rose-500 text-white animate-pulse'
                        : s.otStatus === 'Completed'
                        ? 'bg-slate-800 text-slate-400'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {s.otStatus}
                    </span>
                  </td>

                  {/* Action Dropdown */}
                  <td className="py-3 px-4 text-right print:hidden">
                    <select
                      value={s.otStatus}
                      onChange={(e) => onUpdateStatus(s.id, e.target.value as OTStatus)}
                      className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded px-2 py-1 font-semibold focus:outline-none focus:ring-1 focus:ring-teal-500"
                    >
                      <option value="Scheduled">Scheduled</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="In O.T.">In O.T.</option>
                      <option value="Completed">Completed</option>
                      <option value="Postponed">Postponed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
