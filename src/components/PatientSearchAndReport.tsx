import React, { useState, useMemo } from 'react';
import { 
  Search, 
  FileSpreadsheet, 
  Printer, 
  Download, 
  Plus, 
  Filter, 
  UserPlus, 
  Calendar, 
  Phone, 
  ShieldCheck, 
  Eye, 
  Trash2, 
  Stethoscope, 
  Receipt,
  FileCheck
} from 'lucide-react';
import { Patient, SurgerySchedule, BillingRecord, DischargeRecord } from '../types';

interface PatientSearchAndReportProps {
  patients: Patient[];
  surgeries: SurgerySchedule[];
  bills: BillingRecord[];
  discharges: DischargeRecord[];
  onSelectPatient: (patient: Patient) => void;
  onOpenRegister: () => void;
  onOpenScheduleSurgery: (patient: Patient) => void;
  onOpenCreateBill: (patient: Patient) => void;
  onDeletePatient: (patientId: string) => void;
}

export const PatientSearchAndReport: React.FC<PatientSearchAndReportProps> = ({
  patients,
  surgeries,
  bills,
  discharges,
  onSelectPatient,
  onOpenRegister,
  onOpenScheduleSurgery,
  onOpenCreateBill,
  onDeletePatient
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [insuranceFilter, setInsuranceFilter] = useState<'All' | 'Insurance' | 'Non-Insurance'>('All');
  const [genderFilter, setGenderFilter] = useState<string>('All');
  const [showUnifiedReportModal, setShowUnifiedReportModal] = useState(false);

  // Age calculation helper
  const calculateAge = (dobString: string) => {
    if (!dobString) return 0;
    const birthDate = new Date(dobString);
    const difference = Date.now() - birthDate.getTime();
    const ageDate = new Date(difference);
    return Math.abs(ageDate.getUTCFullYear() - 1970) || 0;
  };

  // Filtered patients
  const filteredPatients = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return patients.filter((p) => {
      const matchesSearch = !q || (
        p.name.toLowerCase().includes(q) ||
        p.medNo.toLowerCase().includes(q) ||
        p.mobile.toLowerCase().includes(q) ||
        p.dob.toLowerCase().includes(q) ||
        (p.insuranceProvider && p.insuranceProvider.toLowerCase().includes(q)) ||
        (p.policyNumber && p.policyNumber.toLowerCase().includes(q))
      );

      const matchesInsurance = insuranceFilter === 'All' || p.insuranceType === insuranceFilter;
      const matchesGender = genderFilter === 'All' || p.gender === genderFilter;

      return matchesSearch && matchesInsurance && matchesGender;
    });
  }, [patients, searchQuery, insuranceFilter, genderFilter]);

  // Unified report dataset generator
  const unifiedReportData = useMemo(() => {
    return patients.map((p) => {
      const patientSurgeries = surgeries.filter(s => s.patientId === p.id || s.medNo === p.medNo);
      const patientBills = bills.filter(b => b.patientId === p.id || b.medNo === p.medNo);
      const patientDischarge = discharges.find(d => d.patientId === p.id || d.medNo === p.medNo);

      const totalBilled = patientBills.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
      const totalPaid = patientBills.reduce((sum, b) => sum + (b.amountPaid || 0), 0);
      const totalApproved = patientBills.reduce((sum, b) => sum + (b.insuranceApprovalAmount || 0), 0);
      const outstanding = Math.max(0, totalBilled - totalApproved - totalPaid);

      return {
        patient: p,
        age: calculateAge(p.dob),
        surgeriesCount: patientSurgeries.length,
        latestSurgery: patientSurgeries[0] || null,
        totalBilled,
        totalPaid,
        totalApproved,
        outstanding,
        dischargeStatus: patientDischarge ? `Discharged (${patientDischarge.dischargeDate})` : 'Active / In Clinic'
      };
    });
  }, [patients, surgeries, bills, discharges]);

  // CSV Export handler
  const exportToCSV = () => {
    const headers = [
      'MED No',
      'Patient Name',
      'DOB',
      'Age',
      'Gender',
      'Mobile',
      'Insurance Classification',
      'Insurance Provider',
      'Policy Number',
      'Surgeries Slotted',
      'Latest Procedure',
      'Total Billed (INR)',
      'Total Paid (INR)',
      'Balance Due (INR)',
      'Discharge Status'
    ];

    const rows = unifiedReportData.map(r => [
      `"${r.patient.medNo}"`,
      `"${r.patient.name}"`,
      `"${r.patient.dob}"`,
      r.age,
      `"${r.patient.gender}"`,
      `"${r.patient.mobile}"`,
      `"${r.patient.insuranceType}"`,
      `"${r.patient.insuranceProvider || 'N/A'}"`,
      `"${r.patient.policyNumber || 'N/A'}"`,
      r.surgeriesCount,
      `"${r.latestSurgery ? r.latestSurgery.procedureName : 'None'}"`,
      r.totalBilled,
      r.totalPaid,
      r.outstanding,
      `"${r.dischargeStatus}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Abhinavas_Eye_Care_Unified_Patient_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 space-y-6 max-w-[1440px] mx-auto">
      {/* Title & Quick Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Module I: Patient Search & Unified Master Report
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-teal-400 font-mono border border-slate-700">
              {filteredPatients.length} of {patients.length} Enrolled
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Instant search across Name, MED no, Mobile, DOB, and unified clinic reporting.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowUnifiedReportModal(true)}
            className="px-4 py-2 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-indigo-400" />
            <span>Single Unified Master Report</span>
          </button>
          <button
            type="button"
            onClick={onOpenRegister}
            className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold rounded-lg shadow-sm shadow-teal-500/20 flex items-center gap-1.5 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>Register New Patient</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="grid grid-cols-12 gap-3 items-center">
          {/* Live Search */}
          <div className="col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Name, MED no (MED-2026-...), Mobile number, DOB, or Insurance..."
              className="w-full bg-slate-950 border border-slate-700/80 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>

          {/* Insurance Filter */}
          <div className="col-span-3">
            <select
              value={insuranceFilter}
              onChange={(e) => setInsuranceFilter(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              <option value="All">All Classifications</option>
              <option value="Insurance">Insurance Only (TPA)</option>
              <option value="Non-Insurance">Non-Insurance Only (Self-Pay)</option>
            </select>
          </div>

          {/* Gender Filter */}
          <div className="col-span-3">
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              <option value="All">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Patient Directory Table */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 shadow-sm overflow-hidden">
        {filteredPatients.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Search className="w-8 h-8 text-slate-500 mx-auto" />
            <h3 className="text-sm font-semibold text-slate-300">
              No patients found matching search query
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Verify the MED number, mobile digits, or register the patient into the database.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={onOpenRegister}
                className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold rounded-lg"
              >
                Register New Patient
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 font-semibold select-none">
                <tr>
                  <th className="py-3 px-4">MED no</th>
                  <th className="py-3 px-3">Patient Name</th>
                  <th className="py-3 px-3">DOB & Age</th>
                  <th className="py-3 px-3">Gender</th>
                  <th className="py-3 px-3">Mobile Contact</th>
                  <th className="py-3 px-3">Classification</th>
                  <th className="py-3 px-3">Insurance Details</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {filteredPatients.map((p) => {
                  const age = calculateAge(p.dob);
                  return (
                    <tr
                      key={p.id}
                      onClick={() => onSelectPatient(p)}
                      className="hover:bg-slate-800/60 transition-colors cursor-pointer group"
                    >
                      {/* MED no */}
                      <td className="py-3 px-4 font-mono font-bold text-teal-400">
                        {p.medNo}
                      </td>

                      {/* Name */}
                      <td className="py-3 px-3 font-semibold text-slate-100 group-hover:text-white">
                        {p.name}
                      </td>

                      {/* DOB & Age */}
                      <td className="py-3 px-3 font-mono text-slate-300 tabular-nums">
                        <div>{p.dob}</div>
                        <div className="text-[10px] text-slate-400 font-sans">{age} yrs</div>
                      </td>

                      {/* Gender */}
                      <td className="py-3 px-3 text-slate-300">
                        {p.gender}
                      </td>

                      {/* Mobile */}
                      <td className="py-3 px-3 font-mono text-slate-300 tabular-nums">
                        {p.mobile}
                      </td>

                      {/* Classification */}
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold whitespace-nowrap ${
                          p.insuranceType === 'Insurance'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}>
                          {p.insuranceType}
                        </span>
                      </td>

                      {/* Insurance Details */}
                      <td className="py-3 px-3 text-slate-400 text-[11px] max-w-[200px] truncate">
                        {p.insuranceType === 'Insurance' ? (
                          <div>
                            <span className="text-slate-200 font-medium">{p.insuranceProvider || 'Pending Provider'}</span>
                            {p.policyNumber && <span className="block font-mono text-[10px] text-slate-400">Policy: {p.policyNumber}</span>}
                          </div>
                        ) : (
                          <span className="text-slate-500">Self-Pay / Non-Insured</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onOpenScheduleSurgery(p)}
                            title="Schedule Surgery"
                            className="px-2 py-1 bg-slate-800 hover:bg-rose-500/20 text-rose-300 hover:border-rose-500/30 border border-slate-700 rounded text-[11px] font-medium transition-colors flex items-center gap-1"
                          >
                            <Stethoscope className="w-3 h-3 text-rose-400" />
                            <span>Surgery</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onOpenCreateBill(p)}
                            title="Generate Estimate or Invoice"
                            className="px-2 py-1 bg-slate-800 hover:bg-indigo-500/20 text-indigo-300 hover:border-indigo-500/30 border border-slate-700 rounded text-[11px] font-medium transition-colors flex items-center gap-1"
                          >
                            <Receipt className="w-3 h-3 text-indigo-400" />
                            <span>Bill</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Remove patient ${p.name} (${p.medNo})?`)) {
                                onDeletePatient(p.id);
                              }
                            }}
                            title="Delete Patient"
                            className="p-1 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SINGLE UNIFIED REPORT MODAL / EXPORT VIEW */}
      {showUnifiedReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-6xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh]">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white tracking-tight">
                    Unified Clinic Master Report (All Patient Details)
                  </h2>
                  <p className="text-xs text-slate-400">
                    Abhinavas Eye Care · Complete consolidated record of demographics, surgeries, financial balances, and checkout status.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={exportToCSV}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-4 h-4 text-teal-400" />
                  <span>Export CSV</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors"
                >
                  <Printer className="w-4 h-4 text-indigo-400" />
                  <span>Print Report</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowUnifiedReportModal(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-2"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Table Content */}
            <div className="p-6 overflow-y-auto flex-1">
              <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 font-semibold select-none">
                    <tr>
                      <th className="py-2.5 px-3">MED No</th>
                      <th className="py-2.5 px-3">Patient Details</th>
                      <th className="py-2.5 px-3">Contact</th>
                      <th className="py-2.5 px-3">Classification</th>
                      <th className="py-2.5 px-3">Latest Procedure</th>
                      <th className="py-2.5 px-3 text-right">Billed</th>
                      <th className="py-2.5 px-3 text-right">Paid</th>
                      <th className="py-2.5 px-3 text-right">Balance Due</th>
                      <th className="py-2.5 px-3">Discharge Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70 font-sans text-slate-300">
                    {unifiedReportData.map((row) => (
                      <tr key={row.patient.id} className="hover:bg-slate-900/50">
                        <td className="py-2.5 px-3 font-mono font-bold text-teal-400">
                          {row.patient.medNo}
                        </td>
                        <td className="py-2.5 px-3">
                          <strong className="text-white block">{row.patient.name}</strong>
                          <span className="text-[11px] text-slate-400">
                            {row.patient.dob} ({row.age}y / {row.patient.gender})
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px]">
                          {row.patient.mobile}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                            row.patient.insuranceType === 'Insurance'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-slate-800 text-slate-400'
                          }`}>
                            {row.patient.insuranceType}
                          </span>
                          {row.patient.insuranceProvider && (
                            <span className="block text-[10px] text-slate-400 mt-0.5 truncate max-w-[140px]">
                              {row.patient.insuranceProvider}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-slate-200">
                          {row.latestSurgery ? (
                            <div>
                              <span className="font-medium">{row.latestSurgery.procedureName}</span>
                              <span className="block text-[10px] text-slate-400 font-mono">
                                Date: {row.latestSurgery.tentativeDate} · {row.latestSurgery.otStatus}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-500">None Scheduled</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-300">
                          ₹{row.totalBilled.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums text-emerald-400">
                          ₹{row.totalPaid.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums text-rose-400 font-semibold">
                          ₹{row.outstanding.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-[11px]">
                          {row.dischargeStatus}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
