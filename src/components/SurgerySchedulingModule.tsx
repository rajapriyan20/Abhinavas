import React, { useState } from 'react';
import { 
  Stethoscope, 
  Plus, 
  Calendar, 
  Hospital, 
  ShieldCheck, 
  FileText, 
  Printer, 
  Sparkles, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Edit3, 
  Trash2,
  FileSpreadsheet,
  X
} from 'lucide-react';
import { 
  Patient, 
  SurgerySchedule, 
  PaymentMode, 
  OTStatus, 
  RateCardItem 
} from '../types';
import { CLINIC_RATE_CARD } from '../firebase';

interface SurgerySchedulingModuleProps {
  patients: Patient[];
  surgeries: SurgerySchedule[];
  onScheduleSurgery: (surgery: SurgerySchedule) => Promise<void>;
  onUpdateSurgery: (id: string, updates: Partial<SurgerySchedule>) => Promise<void>;
  onDeleteSurgery: (id: string) => Promise<void>;
  onNavigateToOTList: () => void;
  preselectedPatient?: Patient | null;
}

export const SurgerySchedulingModule: React.FC<SurgerySchedulingModuleProps> = ({
  patients,
  surgeries,
  onScheduleSurgery,
  onUpdateSurgery,
  onDeleteSurgery,
  onNavigateToOTList,
  preselectedPatient
}) => {
  // Modal states
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [showRateCardModal, setShowRateCardModal] = useState(false);
  const [selectedForAdmissionLetter, setSelectedForAdmissionLetter] = useState<SurgerySchedule | null>(null);

  // Scheduling Form state
  const [selectedMedNo, setSelectedMedNo] = useState(preselectedPatient?.medNo || (patients[0]?.medNo || ''));
  const [procedureName, setProcedureName] = useState('Laparoscopic Cholecystectomy');
  const [consumablesAndImplants, setConsumablesAndImplants] = useState('Harmonic blade, 10mm clip applier, Endobag, Vicryl 2-0');
  const [tentativeDate, setTentativeDate] = useState(new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10));
  const [tentativeHospital, setTentativeHospital] = useState('Dr. Karthik Surgical Centre & Specialty Hospital');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('Insurance / TPA');
  const [preoperativeInstructions, setPreoperativeInstructions] = useState(
    '1. NPO (Nil per oral / fasting) from midnight 10:00 PM.\n2. Morning anti-hypertensives may be taken with small sips of water.\n3. Stop blood thinners (Aspirin / Clopidogrel) 5 days prior under physician advice.\n4. Bring all pre-anesthesia check-up (PAC) investigations, Chest X-ray, and ECG.'
  );
  const [insuranceApprovalAmount, setInsuranceApprovalAmount] = useState<string>('50000');
  const [hospitalMapping, setHospitalMapping] = useState('Tier-1 Surgical Network · Semi-Private Suite');
  const [estimatedCost, setEstimatedCost] = useState<string>('65000');
  const [otRoom, setOtRoom] = useState('O.T. Suite 1');
  const [anesthesiaType, setAnesthesiaType] = useState('General Anesthesia (GA with ETT)');
  const [otStatus, setOtStatus] = useState<OTStatus>('Scheduled');

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Apply Rate Card selection
  const handleSelectRateCard = (item: RateCardItem) => {
    setProcedureName(item.procedureName);
    setConsumablesAndImplants(item.defaultConsumablesList);
    const totalEst = item.baseSurgeonFees + item.standardImplants + item.standardConsumables + item.standardOthers;
    setEstimatedCost(totalEst.toString());
    setShowRateCardModal(false);
  };

  const handleSaveSurgery = async (e: React.FormEvent) => {
    e.preventDefault();
    const patientObj = patients.find(p => p.medNo === selectedMedNo);
    if (!patientObj) {
      alert("Please select a registered patient.");
      return;
    }

    try {
      setIsSubmitting(true);
      const newSurgery: SurgerySchedule = {
        id: `SURG-${Date.now()}`,
        patientId: patientObj.id,
        patientName: patientObj.name,
        medNo: patientObj.medNo,
        procedureName: procedureName.trim(),
        consumablesAndImplants: consumablesAndImplants.trim(),
        tentativeDate,
        tentativeHospital: tentativeHospital.trim(),
        paymentMode,
        preoperativeInstructions: preoperativeInstructions.trim(),
        insuranceApprovalAmount: parseFloat(insuranceApprovalAmount) || 0,
        hospitalMapping: hospitalMapping.trim(),
        otStatus,
        estimatedCost: parseFloat(estimatedCost) || 50000,
        otRoom,
        anesthesiaType,
        surgeonName: 'Dr. Karthik M.B.B.S., M.D., F.I.A.G.E.S.',
        createdAt: new Date().toISOString()
      };

      await onScheduleSurgery(newSurgery);
      setIsScheduleModalOpen(false);
    } catch (err) {
      console.error("Surgery scheduling failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1440px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Module II: Surgery Scheduling & Related Actions
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-rose-400 font-mono border border-slate-700">
              {surgeries.length} Procedures Slotted
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Procedure scheduling, consumables & implants, rate card integration, admission letters, and insurance mapping.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowRateCardModal(true)}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-2 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-teal-400" />
            <span>Rate Card Library</span>
          </button>
          <button
            type="button"
            onClick={onNavigateToOTList}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-2 transition-colors"
          >
            <Calendar className="w-4 h-4 text-rose-400" />
            <span>View O.T. List</span>
          </button>
          <button
            type="button"
            onClick={() => setIsScheduleModalOpen(true)}
            className="px-4 py-2 bg-rose-500 hover:bg-rose-400 text-white text-xs font-bold rounded-lg shadow-sm shadow-rose-500/20 flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule New Surgery</span>
          </button>
        </div>
      </div>

      {/* Surgeries List Table */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs font-semibold text-slate-300">
          <span>Scheduled Surgical Procedures</span>
          <span className="text-slate-400 font-mono text-[11px]">Surgeon: Dr. Karthik</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-slate-950/40 border-b border-slate-800 text-slate-400 font-semibold select-none">
              <tr>
                <th className="py-3 px-4">Tentative Date</th>
                <th className="py-3 px-3">Patient & MED no</th>
                <th className="py-3 px-3">Procedure Name</th>
                <th className="py-3 px-3">Hospital & Mapping</th>
                <th className="py-3 px-3">Payment & Pre-Auth</th>
                <th className="py-3 px-3">Consumables / Implants</th>
                <th className="py-3 px-3">O.T. Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {surgeries.map((s) => (
                <tr key={s.id} className="hover:bg-slate-800/50 transition-colors">
                  {/* Date */}
                  <td className="py-3 px-4 font-mono font-bold text-slate-200">
                    <div>{s.tentativeDate}</div>
                    <div className="text-[10px] text-slate-500 font-normal">{s.otRoom || 'O.T. 1'}</div>
                  </td>

                  {/* Patient */}
                  <td className="py-3 px-3">
                    <div className="font-semibold text-white">{s.patientName}</div>
                    <div className="font-mono text-teal-400 text-[11px]">{s.medNo}</div>
                  </td>

                  {/* Procedure */}
                  <td className="py-3 px-3 max-w-[200px]">
                    <div className="font-medium text-slate-100 truncate" title={s.procedureName}>
                      {s.procedureName}
                    </div>
                    <div className="text-[10px] text-slate-400">{s.anesthesiaType}</div>
                  </td>

                  {/* Hospital */}
                  <td className="py-3 px-3 max-w-[200px]">
                    <div className="text-slate-200 truncate" title={s.tentativeHospital}>
                      {s.tentativeHospital}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">{s.hospitalMapping}</div>
                  </td>

                  {/* Payment */}
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 text-[11px] font-medium">
                      {s.paymentMode}
                    </span>
                    {s.insuranceApprovalAmount > 0 && (
                      <div className="text-[10px] text-emerald-400 font-mono mt-0.5">
                        Approved: ₹{s.insuranceApprovalAmount.toLocaleString()}
                      </div>
                    )}
                  </td>

                  {/* Consumables / Implants */}
                  <td className="py-3 px-3 max-w-[220px] text-[11px] text-slate-400 truncate" title={s.consumablesAndImplants}>
                    {s.consumablesAndImplants}
                  </td>

                  {/* Status */}
                  <td className="py-3 px-3">
                    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                      s.otStatus === 'Confirmed'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : s.otStatus === 'In O.T.'
                        ? 'bg-rose-500 text-white font-bold animate-pulse'
                        : s.otStatus === 'Completed'
                        ? 'bg-slate-800 text-slate-400'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {s.otStatus}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setSelectedForAdmissionLetter(s)}
                        title="Generate Official Hospital Admission Letter"
                        className="px-2.5 py-1 bg-slate-800 hover:bg-teal-500/20 text-teal-300 border border-slate-700 rounded text-[11px] font-semibold flex items-center gap-1 transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5 text-teal-400" />
                        <span>Admission Letter</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Remove surgery slot for ${s.patientName}?`)) {
                            onDeleteSurgery(s.id);
                          }
                        }}
                        className="p-1 text-slate-500 hover:text-rose-400 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: SCHEDULE NEW SURGERY */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden my-6">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white tracking-tight">
                    Schedule Surgical Procedure
                  </h2>
                  <p className="text-xs text-slate-400">
                    Select patient, link rate card, specify implants, hospital, and instructions.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsScheduleModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSurgery} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-12 gap-3 text-xs">
                {/* Patient Selection */}
                <div className="col-span-6">
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Select Registered Patient *
                  </label>
                  <select
                    value={selectedMedNo}
                    onChange={(e) => setSelectedMedNo(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-semibold"
                    required
                  >
                    {patients.map((p) => (
                      <option key={p.id} value={p.medNo}>
                        {p.name} ({p.medNo}) · {p.insuranceType}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Procedure with Rate Card Shortcut */}
                <div className="col-span-6">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-semibold text-slate-300">
                      Procedure Name *
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowRateCardModal(true)}
                      className="text-[11px] text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Rate Card Picker</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={procedureName}
                    onChange={(e) => setProcedureName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100"
                    required
                  />
                </div>

                {/* Consumables & Implants */}
                <div className="col-span-12">
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Consumables & Implants Required *
                  </label>
                  <textarea
                    value={consumablesAndImplants}
                    onChange={(e) => setConsumablesAndImplants(e.target.value)}
                    rows={2}
                    placeholder="e.g. Dual-mesh 15x15cm, Laparoscopic Trocars, Endo-GIA staples"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100"
                    required
                  />
                </div>

                {/* Tentative Date & Hospital */}
                <div className="col-span-4">
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Tentative Surgery Date *
                  </label>
                  <input
                    type="date"
                    value={tentativeDate}
                    onChange={(e) => setTentativeDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono"
                    required
                  />
                </div>

                <div className="col-span-8">
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Tentative Hospital / Surgical Centre *
                  </label>
                  <select
                    value={tentativeHospital}
                    onChange={(e) => setTentativeHospital(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100"
                  >
                    <option value="Dr. Karthik Surgical Centre & Specialty Hospital">Dr. Karthik Surgical Centre & Specialty Hospital</option>
                    <option value="Apollo Specialty Hospital (O.T. Block B)">Apollo Specialty Hospital (O.T. Block B)</option>
                    <option value="Fortis Malar Hospital">Fortis Malar Hospital</option>
                    <option value="Kauvery Hospital Surgical Suites">Kauvery Hospital Surgical Suites</option>
                    <option value="Gleneagles Global Health City">Gleneagles Global Health City</option>
                  </select>
                </div>

                {/* Payment Mode & Insurance Approval */}
                <div className="col-span-4">
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Payment Mode *
                  </label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value as PaymentMode)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100"
                  >
                    <option value="Cash">Cash (Self-Pay)</option>
                    <option value="Insurance / TPA">Insurance / TPA (Cashless / Reimbursement)</option>
                    <option value="Card / UPI">Card / UPI Online</option>
                    <option value="Corporate Credit">Corporate Credit</option>
                  </select>
                </div>

                <div className="col-span-4">
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Insurance Approved Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={insuranceApprovalAmount}
                    onChange={(e) => setInsuranceApprovalAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono text-emerald-400"
                  />
                </div>

                <div className="col-span-4">
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Hospital Mapping / Ward Tier
                  </label>
                  <input
                    type="text"
                    value={hospitalMapping}
                    onChange={(e) => setHospitalMapping(e.target.value)}
                    placeholder="e.g. Deluxe Room · Network Tier 1"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100"
                  />
                </div>

                {/* O.T. Room & Anesthesia */}
                <div className="col-span-4">
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    O.T. Room Assignment
                  </label>
                  <input
                    type="text"
                    value={otRoom}
                    onChange={(e) => setOtRoom(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100"
                  />
                </div>

                <div className="col-span-4">
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Anesthesia Type
                  </label>
                  <input
                    type="text"
                    value={anesthesiaType}
                    onChange={(e) => setAnesthesiaType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100"
                  />
                </div>

                <div className="col-span-4">
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    O.T. Status
                  </label>
                  <select
                    value={otStatus}
                    onChange={(e) => setOtStatus(e.target.value as OTStatus)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-bold"
                  >
                    <option value="Scheduled">Scheduled</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="In O.T.">In O.T.</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                {/* Preoperative Instructions */}
                <div className="col-span-12">
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Preoperative Instructions for Patient *
                  </label>
                  <textarea
                    value={preoperativeInstructions}
                    onChange={(e) => setPreoperativeInstructions(e.target.value)}
                    rows={3}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 font-mono text-[11px]"
                    required
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-rose-500 hover:bg-rose-400 text-white text-xs font-bold rounded-lg shadow-sm shadow-rose-500/20 flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSubmitting ? 'Slotted...' : 'Confirm Surgery Scheduling'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: RATE CARD INTEGRATION */}
      {showRateCardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white tracking-tight">
                    Procedure Rate Card Library
                  </h2>
                  <p className="text-xs text-slate-400">
                    Standardized surgeon fees, implants, and consumables benchmarks for Dr. Karthik's Clinic.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowRateCardModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {CLINIC_RATE_CARD.map((item) => {
                  const totalEst = item.baseSurgeonFees + item.standardImplants + item.standardConsumables + item.standardOthers;
                  return (
                    <div
                      key={item.id}
                      className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-teal-500/40 transition-all flex flex-col justify-between space-y-3"
                    >
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-mono text-teal-400 font-bold">{item.id}</span>
                          <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded font-mono">
                            Stay: {item.typicalStayDays} day(s)
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-white">{item.procedureName}</h3>
                        <span className="text-[11px] text-slate-400">{item.category}</span>

                        <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs font-mono border-y border-slate-800/80 py-2">
                          <div>
                            <span className="text-[10px] text-slate-500 block font-sans">Surgeon</span>
                            <strong className="text-slate-200">₹{item.baseSurgeonFees.toLocaleString()}</strong>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 block font-sans">Implants</span>
                            <strong className="text-slate-200">₹{item.standardImplants.toLocaleString()}</strong>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 block font-sans">Consumables</span>
                            <strong className="text-slate-200">₹{item.standardConsumables.toLocaleString()}</strong>
                          </div>
                        </div>

                        <div className="mt-2 text-[11px] text-slate-400">
                          <strong className="text-slate-300">Standard Kit:</strong> {item.defaultConsumablesList}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <span className="font-mono text-xs font-bold text-teal-300">
                          Total: ₹{totalEst.toLocaleString()}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleSelectRateCard(item)}
                          className="px-3 py-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold rounded-lg transition-colors"
                        >
                          Use in Scheduling →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: ADMISSION LETTER GENERATION */}
      {selectedForAdmissionLetter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh]">
            <div className="px-6 py-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">
                    Official Hospital Admission Request Letter
                  </h2>
                  <p className="text-xs text-slate-400">
                    Formal documentation for hospital admission desk & TPA authorization.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Admission Letter</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedForAdmissionLetter(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Printable Letterhead Surface */}
            <div className="p-8 bg-white text-slate-900 overflow-y-auto font-serif space-y-6">
              {/* Header Letterhead */}
              <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-sans">
                    DR. KARTHIK CLINICAL SURGICAL SUITE
                  </h1>
                  <p className="text-xs text-slate-600 font-sans font-medium">
                    Department of Minimal Access & General Surgery · Reg. No: TN-MED-449102
                  </p>
                  <p className="text-xs text-slate-500 font-sans">
                    Consulting Surgeon: Dr. Karthik M.B.B.S., M.D., F.I.A.G.E.S.
                  </p>
                </div>
                <div className="text-right text-xs font-mono font-sans text-slate-700">
                  <div>Date: {new Date().toLocaleDateString()}</div>
                  <div>Ref: ADM/{selectedForAdmissionLetter.medNo}/{selectedForAdmissionLetter.id}</div>
                </div>
              </div>

              {/* Addressee */}
              <div className="text-sm font-sans space-y-1">
                <p className="font-bold">To,</p>
                <p>The Medical Superintendent / Admission Desk,</p>
                <p className="font-semibold text-slate-800">{selectedForAdmissionLetter.tentativeHospital}</p>
              </div>

              {/* Subject */}
              <div className="py-1 border-y border-slate-300 font-sans text-sm font-bold text-slate-800">
                Subject: Planned Inpatient Admission & O.T. Booking for Surgical Procedure
              </div>

              {/* Patient Details Table */}
              <div className="font-sans text-xs space-y-2">
                <p>Dear Colleague / Admission Team,</p>
                <p>
                  Please admit the undermentioned patient under my care for planned elective surgical intervention as per details below:
                </p>

                <div className="border border-slate-300 rounded p-3 space-y-1.5 bg-slate-50">
                  <div className="grid grid-cols-2 gap-2">
                    <div><strong>Patient Name:</strong> {selectedForAdmissionLetter.patientName}</div>
                    <div><strong>MED Record No:</strong> {selectedForAdmissionLetter.medNo}</div>
                    <div><strong>Planned Procedure:</strong> {selectedForAdmissionLetter.procedureName}</div>
                    <div><strong>Tentative Date of Surgery:</strong> {selectedForAdmissionLetter.tentativeDate}</div>
                    <div><strong>Anesthesia Requirement:</strong> {selectedForAdmissionLetter.anesthesiaType || 'GA'}</div>
                    <div><strong>Payment / Insurance Mode:</strong> {selectedForAdmissionLetter.paymentMode}</div>
                    <div><strong>Hospital Mapping / Ward:</strong> {selectedForAdmissionLetter.hospitalMapping}</div>
                    <div><strong>Approved TPA Amount:</strong> ₹{selectedForAdmissionLetter.insuranceApprovalAmount.toLocaleString()}</div>
                  </div>
                </div>

                <div className="pt-2">
                  <strong className="block text-slate-800 mb-1">Required Consumables & Implants:</strong>
                  <p className="bg-slate-100 p-2 rounded text-slate-700 border border-slate-200">
                    {selectedForAdmissionLetter.consumablesAndImplants}
                  </p>
                </div>

                <div className="pt-2">
                  <strong className="block text-slate-800 mb-1">Pre-Operative Orders:</strong>
                  <p className="whitespace-pre-wrap text-slate-700 bg-slate-100 p-2 rounded border border-slate-200">
                    {selectedForAdmissionLetter.preoperativeInstructions}
                  </p>
                </div>
              </div>

              {/* Doctor Signature Block */}
              <div className="pt-8 flex justify-between items-end font-sans">
                <div className="text-xs text-slate-500">
                  * Generated electronically via Dr. Karthik Clinical Portal.
                </div>
                <div className="text-right space-y-1">
                  <div className="font-cursive text-xl font-bold text-slate-800">Dr. Karthik</div>
                  <p className="text-xs font-bold text-slate-900">Dr. Karthik M.B.B.S., M.D., F.I.A.G.E.S.</p>
                  <p className="text-[11px] text-slate-600">Chief Attending Surgeon & Medical Director</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
