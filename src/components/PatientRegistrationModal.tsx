import React, { useState } from 'react';
import { 
  UserPlus, 
  X, 
  ShieldCheck, 
  Calendar, 
  Phone, 
  User, 
  CheckCircle2, 
  AlertCircle,
  FileCheck
} from 'lucide-react';
import { Patient, Gender, InsuranceClassification } from '../types';

interface PatientRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegister: (patient: Patient) => Promise<void>;
  existingPatients: Patient[];
}

export const PatientRegistrationModal: React.FC<PatientRegistrationModalProps> = ({
  isOpen,
  onClose,
  onRegister,
  existingPatients
}) => {
  // Generate next MED no e.g. MED-2026-006
  const nextNum = existingPatients.length + 1;
  const defaultMedNo = `MED-2026-${String(nextNum).padStart(3, '0')}`;

  const [medNo, setMedNo] = useState(defaultMedNo);
  const [name, setName] = useState('');
  const [dob, setDob] = useState('1985-05-15');
  const [mobile, setMobile] = useState('+91 ');
  const [gender, setGender] = useState<Gender>('Male');
  const [insuranceType, setInsuranceType] = useState<InsuranceClassification>('Non-Insurance');
  const [insuranceProvider, setInsuranceProvider] = useState('');
  const [policyNumber, setPolicyNumber] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Age calculation
  const calculateAge = (dobString: string) => {
    if (!dobString) return 0;
    const birthDate = new Date(dobString);
    const difference = Date.now() - birthDate.getTime();
    const ageDate = new Date(difference);
    return Math.abs(ageDate.getUTCFullYear() - 1970) || 0;
  };

  const calculatedAge = calculateAge(dob);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim()) {
      setErrorMsg('Patient full name is required.');
      return;
    }
    if (!dob) {
      setErrorMsg('Date of birth is required.');
      return;
    }
    if (!mobile.trim() || mobile.trim() === '+91') {
      setErrorMsg('Patient mobile number is required.');
      return;
    }
    if (!medNo.trim()) {
      setErrorMsg('MED number is required.');
      return;
    }

    try {
      setIsSubmitting(true);
      const nowIso = new Date().toISOString();

      const newPatient: Patient = {
        id: medNo.trim(),
        medNo: medNo.trim(),
        name: name.trim(),
        dob,
        mobile: mobile.trim(),
        gender,
        insuranceType,
        insuranceProvider: insuranceType === 'Insurance' ? insuranceProvider.trim() : undefined,
        policyNumber: insuranceType === 'Insurance' ? policyNumber.trim() : undefined,
        createdAt: nowIso,
        updatedAt: nowIso
      };

      await onRegister(newPatient);
      onClose();
    } catch (err: any) {
      console.error('Registration failed:', err);
      setErrorMsg(err.message || 'Failed to save patient record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-6">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Module I: Patient Registration
              </h2>
              <p className="text-xs text-slate-400">
                Enroll patient into Abhinavas Eye Care clinical records.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-lg text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-12 gap-4">
            {/* MED no */}
            <div className="col-span-5">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                MED no (Medical Record / ID) *
              </label>
              <input
                type="text"
                value={medNo}
                onChange={(e) => setMedNo(e.target.value)}
                placeholder="e.g. MED-2026-006"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono font-bold text-teal-400 focus:outline-none focus:ring-1 focus:ring-teal-500"
                required
              />
            </div>

            {/* Name */}
            <div className="col-span-7">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Patient Full Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Anbarasan S."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-teal-500"
                required
              />
            </div>

            {/* DOB & Age */}
            <div className="col-span-6">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Date of Birth (DOB) *
                </label>
                <span className="text-[11px] font-mono text-teal-400">
                  Age: {calculatedAge} years
                </span>
              </div>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-teal-500"
                required
              />
            </div>

            {/* Gender */}
            <div className="col-span-6">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Gender *
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as Gender)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-teal-500"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Mobile Contact */}
            <div className="col-span-6">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Mobile Number *
              </label>
              <input
                type="text"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="+91 98400 00000"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:ring-1 focus:ring-teal-500"
                required
              />
            </div>

            {/* Insurance Classification */}
            <div className="col-span-6">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Payment / Insurance Classification *
              </label>
              <select
                value={insuranceType}
                onChange={(e) => setInsuranceType(e.target.value as InsuranceClassification)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-teal-500 font-semibold"
              >
                <option value="Non-Insurance">Non-Insurance (Self-Pay / Cash / UPI)</option>
                <option value="Insurance">Insurance (TPA / Cashless / Reimbursement)</option>
              </select>
            </div>

            {/* Insurance details if insured */}
            {insuranceType === 'Insurance' && (
              <>
                <div className="col-span-6">
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Insurance Provider / TPA
                  </label>
                  <input
                    type="text"
                    value={insuranceProvider}
                    onChange={(e) => setInsuranceProvider(e.target.value)}
                    placeholder="e.g. Star Health, Medi Assist, ICICI"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                <div className="col-span-6">
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Policy / Card Number
                  </label>
                  <input
                    type="text"
                    value={policyNumber}
                    onChange={(e) => setPolicyNumber(e.target.value)}
                    placeholder="e.g. POL-99482104"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>
              </>
            )}
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold rounded-lg shadow-sm shadow-teal-500/20 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Registering...' : 'Register Patient'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
