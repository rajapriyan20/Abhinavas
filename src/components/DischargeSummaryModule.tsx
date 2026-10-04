import React, { useState } from 'react';
import { 
  FileCheck, 
  Plus, 
  Search, 
  Printer, 
  Calendar, 
  CheckCircle2, 
  Stethoscope, 
  AlertCircle, 
  User, 
  X,
  FileText
} from 'lucide-react';
import { Patient, DischargeRecord, DischargeCondition } from '../types';

interface DischargeSummaryModuleProps {
  patients: Patient[];
  discharges: DischargeRecord[];
  onSaveDischarge: (discharge: DischargeRecord) => Promise<void>;
  preselectedPatient?: Patient | null;
}

export const DischargeSummaryModule: React.FC<DischargeSummaryModuleProps> = ({
  patients,
  discharges,
  onSaveDischarge,
  preselectedPatient
}) => {
  const [search, setSearch] = useState('');
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [selectedDischargeForPrint, setSelectedDischargeForPrint] = useState<DischargeRecord | null>(null);

  // Checkout Form state
  const [selectedMedNo, setSelectedMedNo] = useState(preselectedPatient?.medNo || (patients[0]?.medNo || ''));
  const [admissionDate, setAdmissionDate] = useState(new Date(Date.now() - 86400000 * 3).toISOString().slice(0, 10));
  const [dischargeDate, setDischargeDate] = useState(new Date().toISOString().slice(0, 10));
  const [procedurePerformed, setProcedurePerformed] = useState('Laparoscopic Cholecystectomy');
  const [dischargeCondition, setDischargeCondition] = useState<DischargeCondition>('Stable');
  const [postCareNotes, setPostCareNotes] = useState(
    '1. Keep surgical puncture sites dry and clean for 5 days.\n2. Normal shower allowed from Post-Op Day 3, pat dry gently.\n3. Avoid strenuous exercise or lifting weights exceeding 5 kg for 3 weeks.\n4. Light walking encouraged to prevent DVT.'
  );
  const [medications, setMedications] = useState(
    '1. Tab. Augmentin 625mg PO BD x 5 days (After food)\n2. Tab. Pantoprazole 40mg PO OD before breakfast x 7 days\n3. Tab. Paracetamol 650mg PO TDS SOS for pain\n4. Syp. Lactulose 15ml PO at bedtime if constipated'
  );
  const [followUpDate, setFollowUpDate] = useState(new Date(Date.now() + 86400000 * 7).toISOString().slice(0, 10));
  const [summaryNotes, setSummaryNotes] = useState(
    'Patient responded well to surgery. Hemodynamically stable, afebrile, tolerating regular oral diet, bowel sounds active.'
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const patientObj = patients.find(p => p.medNo === selectedMedNo);
    if (!patientObj) {
      alert("Please select a registered patient.");
      return;
    }

    try {
      setIsSubmitting(true);
      const newDischarge: DischargeRecord = {
        id: `DSC-2026-${String(discharges.length + 1).padStart(3, '0')}`,
        patientId: patientObj.id,
        patientName: patientObj.name,
        medNo: patientObj.medNo,
        admissionDate,
        dischargeDate,
        procedurePerformed: procedurePerformed.trim(),
        dischargeCondition,
        postCareNotes: postCareNotes.trim(),
        medications: medications.trim(),
        followUpDate,
        surgeonName: 'Chief Consultant Eye Surgeon, M.S. (Ophthalmology)',
        summaryNotes: summaryNotes.trim(),
        createdAt: new Date().toISOString()
      };

      await onSaveDischarge(newDischarge);
      setIsCheckoutModalOpen(false);
    } catch (err) {
      console.error("Discharge save error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredDischarges = discharges.filter((d) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      d.patientName.toLowerCase().includes(q) ||
      d.medNo.toLowerCase().includes(q) ||
      d.procedurePerformed.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-6 space-y-6 max-w-[1440px] mx-auto">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Module IV: Discharge Summary & Patient Checkout
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
              Post-Care Management
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Dedicated discharge summary generation, wound post-care instructions, discharge prescriptions, and follow-up planning.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search discharge summaries..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>
          <button
            type="button"
            onClick={() => setIsCheckoutModalOpen(true)}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-lg shadow-sm shadow-emerald-500/20 flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>+ Patient Checkout / Discharge</span>
          </button>
        </div>
      </div>

      {/* Discharge Summaries List */}
      <div className="space-y-4">
        {filteredDischarges.length === 0 ? (
          <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
            <FileCheck className="w-8 h-8 text-slate-500 mx-auto" />
            <h3 className="text-sm font-semibold text-slate-300">
              No discharge summaries found
            </h3>
            <p className="text-xs text-slate-400">
              Click "+ Patient Checkout / Discharge" to generate an official discharge summary with post-care instructions.
            </p>
          </div>
        ) : (
          filteredDischarges.map((d) => (
            <div
              key={d.id}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs font-mono">
                    {d.id.slice(-3)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white">{d.patientName}</h3>
                      <span className="font-mono text-xs text-teal-400">({d.medNo})</span>
                      <span className="text-[10px] font-semibold px-2 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {d.dischargeCondition}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      Admitted: {d.admissionDate} · Discharged: {d.dischargeDate} · Surgeon: {d.surgeonName}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right text-xs font-mono">
                    <span className="text-slate-400 text-[10px] block">Clinic Follow-Up</span>
                    <strong className="text-teal-300">{d.followUpDate}</strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedDischargeForPrint(d)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5 text-teal-400" />
                    <span>Print Summary</span>
                  </button>
                </div>
              </div>

              {/* Procedure & Post Care Preview */}
              <div className="grid grid-cols-12 gap-4 text-xs">
                <div className="col-span-4 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Procedure Performed
                  </span>
                  <p className="text-slate-200 font-medium">{d.procedurePerformed}</p>
                  <p className="text-[11px] text-slate-400 mt-1">{d.summaryNotes}</p>
                </div>

                <div className="col-span-4 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Post-Care & Wound Instructions
                  </span>
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 whitespace-pre-wrap leading-relaxed text-[11px]">
                    {d.postCareNotes}
                  </div>
                </div>

                <div className="col-span-4 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Discharge Medications
                  </span>
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 whitespace-pre-wrap leading-relaxed text-[11px] font-mono">
                    {d.medications}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL 1: CHECKOUT / CREATE DISCHARGE SUMMARY */}
      {isCheckoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden my-6">
            <div className="px-6 py-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white tracking-tight">
                    Patient Checkout & Discharge Summary
                  </h2>
                  <p className="text-xs text-slate-400">
                    Abhinavas Eye Care · Complete clinical checkout, post-care instructions, and medications.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsCheckoutModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCheckoutSubmit} className="p-6 space-y-4 max-h-[82vh] overflow-y-auto">
              <div className="grid grid-cols-12 gap-3 text-xs">
                {/* Patient */}
                <div className="col-span-6">
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Select Patient for Checkout *
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

                {/* Procedure */}
                <div className="col-span-6">
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Procedure Performed *
                  </label>
                  <input
                    type="text"
                    value={procedurePerformed}
                    onChange={(e) => setProcedurePerformed(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100"
                    required
                  />
                </div>

                {/* Admission & Discharge Dates */}
                <div className="col-span-4">
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Admission Date *
                  </label>
                  <input
                    type="date"
                    value={admissionDate}
                    onChange={(e) => setAdmissionDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono"
                    required
                  />
                </div>

                <div className="col-span-4">
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Discharge Date *
                  </label>
                  <input
                    type="date"
                    value={dischargeDate}
                    onChange={(e) => setDischargeDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono"
                    required
                  />
                </div>

                <div className="col-span-4">
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Discharge Condition *
                  </label>
                  <select
                    value={dischargeCondition}
                    onChange={(e) => setDischargeCondition(e.target.value as DischargeCondition)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-bold"
                  >
                    <option value="Stable">Stable & Ambulatory</option>
                    <option value="Recovered">Fully Recovered</option>
                    <option value="Referred">Referred for Tertiary Care</option>
                    <option value="DAMA (Discharge Against Medical Advice)">DAMA</option>
                  </select>
                </div>

                {/* Post Care Notes */}
                <div className="col-span-12">
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Post-Care Notes & Wound Care Instructions *
                  </label>
                  <textarea
                    value={postCareNotes}
                    onChange={(e) => setPostCareNotes(e.target.value)}
                    rows={3}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 leading-relaxed"
                    required
                  />
                </div>

                {/* Medications */}
                <div className="col-span-12">
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Discharge Medications & Dosage *
                  </label>
                  <textarea
                    value={medications}
                    onChange={(e) => setMedications(e.target.value)}
                    rows={4}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 font-mono text-[11px]"
                    required
                  />
                </div>

                {/* Follow up date */}
                <div className="col-span-6">
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Follow-Up Date in Clinic OPD *
                  </label>
                  <input
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono"
                    required
                  />
                </div>

                <div className="col-span-6">
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Operative Assessment & Clinical Summary
                  </label>
                  <input
                    type="text"
                    value={summaryNotes}
                    onChange={(e) => setSummaryNotes(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCheckoutModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-lg shadow-sm shadow-emerald-500/20 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSubmitting ? 'Recording...' : 'Finalize Discharge Summary'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: PRINT OFFICIAL DISCHARGE SUMMARY */}
      {selectedDischargeForPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh]">
            <div className="px-6 py-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between shrink-0">
              <span className="font-bold text-white text-sm">
                Official Clinical Discharge Summary: {selectedDischargeForPrint.id}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Document</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDischargeForPrint(null)}
                  className="p-1.5 text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Printable Document Sheet */}
            <div className="p-8 bg-white text-slate-900 overflow-y-auto font-sans space-y-6">
              <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-start">
                <div>
                  <h1 className="text-xl font-black text-slate-950 tracking-tight">
                    ABHINAVAS EYE CARE & SURGICAL SUITE
                  </h1>
                  <p className="text-xs text-slate-600 font-medium">
                    Department of Ophthalmology & Inpatient Surgery · Reg: TN-MED-449102
                  </p>
                  <p className="text-xs text-slate-500">
                    Chief Consultant Eye Surgeon, M.S. (Ophthalmology)
                  </p>
                </div>
                <div className="text-right text-xs font-mono">
                  <div className="font-bold text-slate-900 text-sm">DISCHARGE SUMMARY</div>
                  <div>Doc No: {selectedDischargeForPrint.id}</div>
                  <div>Date: {selectedDischargeForPrint.dischargeDate}</div>
                </div>
              </div>

              {/* Patient Banner */}
              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-3 rounded border border-slate-200">
                <div>
                  <span className="text-slate-500 block">Patient Name:</span>
                  <strong className="text-sm text-slate-900">{selectedDischargeForPrint.patientName}</strong>
                  <div className="font-mono text-slate-600">MED No: {selectedDischargeForPrint.medNo}</div>
                </div>
                <div className="text-right font-mono">
                  <div>Admission Date: {selectedDischargeForPrint.admissionDate}</div>
                  <div>Discharge Date: {selectedDischargeForPrint.dischargeDate}</div>
                  <div className="font-sans mt-0.5">Condition: <strong className="text-slate-900">{selectedDischargeForPrint.dischargeCondition}</strong></div>
                </div>
              </div>

              {/* Procedure & Findings */}
              <div className="text-xs space-y-1">
                <strong className="text-slate-900 uppercase tracking-wider block">Surgical Procedure Performed:</strong>
                <p className="text-slate-800 font-semibold p-2 bg-slate-100 rounded border border-slate-200">
                  {selectedDischargeForPrint.procedurePerformed}
                </p>
                {selectedDischargeForPrint.summaryNotes && (
                  <p className="text-slate-600 pt-1">{selectedDischargeForPrint.summaryNotes}</p>
                )}
              </div>

              {/* Post Care Notes */}
              <div className="text-xs space-y-1">
                <strong className="text-slate-900 uppercase tracking-wider block">Post-Care Notes & Wound Care:</strong>
                <div className="p-3 bg-slate-50 rounded border border-slate-200 text-slate-800 whitespace-pre-wrap leading-relaxed">
                  {selectedDischargeForPrint.postCareNotes}
                </div>
              </div>

              {/* Medications on Discharge */}
              <div className="text-xs space-y-1">
                <strong className="text-slate-900 uppercase tracking-wider block">Discharge Medications & Regimen:</strong>
                <div className="p-3 bg-slate-50 rounded border border-slate-200 text-slate-900 font-mono whitespace-pre-wrap leading-relaxed">
                  {selectedDischargeForPrint.medications}
                </div>
              </div>

              {/* Follow-up & Emergency block */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs space-y-1">
                <div className="font-bold text-amber-900">Follow-Up Schedule:</div>
                <p className="text-amber-800">
                  Please report to Abhinavas Eye Care OPD on <strong>{selectedDischargeForPrint.followUpDate}</strong> for postoperative ocular inspection and slit-lamp examination.
                </p>
                <p className="text-amber-700 text-[11px]">
                  Emergency SOS: In case of sudden vision drop, severe ocular pain, redness, or discharge, contact clinic 24/7 hotline immediately.
                </p>
              </div>

              {/* Signature block */}
              <div className="pt-8 flex justify-between items-end text-xs">
                <div>
                  <p className="text-slate-500">Electronically generated clinical discharge certificate.</p>
                </div>
                <div className="text-right">
                  <div className="font-bold text-slate-900">Chief Consultant Eye Surgeon</div>
                  <div className="text-slate-600">Department of Ophthalmology & Surgery</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
