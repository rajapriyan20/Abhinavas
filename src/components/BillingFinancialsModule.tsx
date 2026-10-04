import React, { useState } from 'react';
import { 
  Receipt, 
  Plus, 
  FileText, 
  DollarSign, 
  Printer, 
  ShieldCheck, 
  RotateCcw, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  FileCheck,
  CreditCard,
  Ban
} from 'lucide-react';
import { 
  Patient, 
  BillingRecord, 
  BillType, 
  BillStatus, 
  PaymentMode 
} from '../types';

interface BillingFinancialsModuleProps {
  patients: Patient[];
  bills: BillingRecord[];
  onSaveBill: (bill: BillingRecord) => Promise<void>;
  onUpdateBill: (id: string, updates: Partial<BillingRecord>) => Promise<void>;
  preselectedPatient?: Patient | null;
}

export const BillingFinancialsModule: React.FC<BillingFinancialsModuleProps> = ({
  patients,
  bills,
  onSaveBill,
  onUpdateBill,
  preselectedPatient
}) => {
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('All');
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [selectedBillForPrint, setSelectedBillForPrint] = useState<BillingRecord | null>(null);

  // Cancellation / Refund Modal state
  const [actionTargetBill, setActionTargetBill] = useState<BillingRecord | null>(null);
  const [actionType, setActionType] = useState<'cancel' | 'refund'>('cancel');
  const [refundAmountInput, setRefundAmountInput] = useState<string>('0');
  const [reasonInput, setReasonInput] = useState('');

  // Generate Form state
  const [selectedMedNo, setSelectedMedNo] = useState(preselectedPatient?.medNo || (patients[0]?.medNo || ''));
  const [billType, setBillType] = useState<BillType>('Invoice');
  const [chargesCategory, setChargesCategory] = useState('General Surgery / Minimal Access');
  const [surgeonFees, setSurgeonFees] = useState<string>('35000');
  const [implantsCost, setImplantsCost] = useState<string>('12000');
  const [consumablesCost, setConsumablesCost] = useState<string>('10000');
  const [othersCoPayment, setOthersCoPayment] = useState<string>('3000');
  const [insuranceApprovalAmount, setInsuranceApprovalAmount] = useState<string>('45000');
  const [amountPaid, setAmountPaid] = useState<string>('15000');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('Card / UPI');
  const [notes, setNotes] = useState('Routine procedure billing with insurance approval.');

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Computed math
  const nSurgeon = parseFloat(surgeonFees) || 0;
  const nImplants = parseFloat(implantsCost) || 0;
  const nConsumables = parseFloat(consumablesCost) || 0;
  const nOthers = parseFloat(othersCoPayment) || 0;
  const nApproved = parseFloat(insuranceApprovalAmount) || 0;
  const nPaid = parseFloat(amountPaid) || 0;

  const grossTotal = nSurgeon + nImplants + nConsumables + nOthers;
  const patientPayable = Math.max(0, grossTotal - nApproved);
  const balanceDue = Math.max(0, patientPayable - nPaid);

  const handleGenerateBill = async (e: React.FormEvent) => {
    e.preventDefault();
    const patientObj = patients.find(p => p.medNo === selectedMedNo);
    if (!patientObj) {
      alert("Please select a registered patient.");
      return;
    }

    try {
      setIsSubmitting(true);
      const prefix = billType === 'Estimate' ? 'EST' : billType === 'Receipt' ? 'RCT' : 'INV';
      const newBill: BillingRecord = {
        id: `${prefix}-2026-${String(bills.length + 1).padStart(3, '0')}`,
        patientId: patientObj.id,
        patientName: patientObj.name,
        medNo: patientObj.medNo,
        billType,
        chargesCategory,
        surgeonFees: nSurgeon,
        implantsCost: nImplants,
        consumablesCost: nConsumables,
        othersCoPayment: nOthers,
        insuranceApprovalAmount: nApproved,
        totalAmount: grossTotal,
        patientPayable,
        amountPaid: nPaid,
        refundAmount: 0,
        status: balanceDue === 0 && nPaid > 0 ? 'Paid' : nPaid > 0 ? 'Partially Paid' : 'Issued',
        paymentMode,
        receiptNumber: nPaid > 0 ? `RCT-2026-${String(bills.length + 1).padStart(3, '0')}` : undefined,
        notes: notes.trim(),
        createdAt: new Date().toISOString()
      };

      await onSaveBill(newBill);
      setIsGenerateModalOpen(false);
    } catch (err) {
      console.error("Save bill error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExecuteCancelOrRefund = async () => {
    if (!actionTargetBill) return;

    try {
      if (actionType === 'cancel') {
        await onUpdateBill(actionTargetBill.id, {
          status: 'Cancelled',
          cancellationReason: reasonInput.trim() || 'Cancelled by clinic administration.'
        });
      } else {
        const refAmt = parseFloat(refundAmountInput) || 0;
        await onUpdateBill(actionTargetBill.id, {
          status: 'Refunded',
          refundAmount: refAmt,
          notes: `${actionTargetBill.notes || ''} [Refund Processed: ₹${refAmt} - Reason: ${reasonInput.trim()}]`
        });
      }
      setActionTargetBill(null);
      setReasonInput('');
      setRefundAmountInput('0');
    } catch (err) {
      console.error("Failed to cancel or refund bill:", err);
    }
  };

  const filteredBills = bills.filter((b) => {
    if (selectedTypeFilter === 'All') return true;
    return b.billType === selectedTypeFilter;
  });

  const totalInvoiced = bills
    .filter(b => b.status !== 'Cancelled')
    .reduce((sum, b) => sum + b.totalAmount, 0);

  const totalPaid = bills
    .filter(b => b.status !== 'Cancelled')
    .reduce((sum, b) => sum + (b.amountPaid || 0), 0);

  const totalRefunded = bills
    .reduce((sum, b) => sum + (b.refundAmount || 0), 0);

  return (
    <div className="p-6 space-y-6 max-w-[1440px] mx-auto">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Module III: Billing, Financials & Cost Breakdown
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono border border-indigo-500/30">
              Accounts & Ledger
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Charges category, surgeon fees, implants, consumables, estimates, invoices, receipts, and refund handling.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setBillType('Estimate');
              setIsGenerateModalOpen(true);
            }}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <FileText className="w-4 h-4 text-indigo-400" />
            <span>+ New Estimate</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setBillType('Invoice');
              setIsGenerateModalOpen(true);
            }}
            className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold rounded-lg shadow-sm shadow-indigo-500/20 flex items-center gap-1.5 transition-colors"
          >
            <Receipt className="w-4 h-4" />
            <span>+ Generate Invoice / Receipt</span>
          </button>
        </div>
      </div>

      {/* Financial Breakdown KPIs */}
      <div className="grid grid-cols-4 gap-4 font-mono text-xs">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-slate-400 font-sans block mb-1">Gross Invoiced Total</span>
          <div className="text-xl font-bold text-white tabular-nums">
            ₹{totalInvoiced.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-500 font-sans mt-1 block">Excluding cancellations</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-slate-400 font-sans block mb-1">Total Patient Collections</span>
          <div className="text-xl font-bold text-emerald-400 tabular-nums">
            ₹{totalPaid.toLocaleString()}
          </div>
          <span className="text-[11px] text-emerald-500 font-sans mt-1 block">Cash, UPI & Cards settled</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-slate-400 font-sans block mb-1">Total Refunds Processed</span>
          <div className="text-xl font-bold text-rose-400 tabular-nums">
            ₹{totalRefunded.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-500 font-sans mt-1 block">Adjustments & cancelled procedures</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-slate-400 font-sans block mb-1">Active Ledger Records</span>
          <div className="text-xl font-bold text-teal-400 tabular-nums">
            {bills.length} Bills
          </div>
          <span className="text-[11px] text-slate-500 font-sans mt-1 block">Estimates, Invoices & Receipts</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        {['All', 'Estimate', 'Invoice', 'Receipt'].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setSelectedTypeFilter(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              selectedTypeFilter === tab
                ? 'bg-indigo-500 text-white shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab === 'All' ? 'All Transactions' : `${tab}s`}
          </button>
        ))}
      </div>

      {/* Bills Ledger Table */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 font-semibold select-none">
              <tr>
                <th className="py-3 px-4">Bill No & Type</th>
                <th className="py-3 px-3">Patient & MED no</th>
                <th className="py-3 px-3">Charges Category</th>
                <th className="py-3 px-3 text-right">Surgeon Fees</th>
                <th className="py-3 px-3 text-right">Implants & Consumables</th>
                <th className="py-3 px-3 text-right">Insurance Approved</th>
                <th className="py-3 px-3 text-right">Gross Total</th>
                <th className="py-3 px-3 text-right">Amount Paid</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans text-slate-300">
              {filteredBills.map((b) => (
                <tr key={b.id} className="hover:bg-slate-800/50 transition-colors">
                  {/* Bill No */}
                  <td className="py-3 px-4">
                    <strong className="text-white font-mono block">{b.id}</strong>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                      b.billType === 'Estimate'
                        ? 'bg-amber-500/20 text-amber-300'
                        : b.billType === 'Receipt'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-indigo-500/20 text-indigo-300'
                    }`}>
                      {b.billType}
                    </span>
                  </td>

                  {/* Patient */}
                  <td className="py-3 px-3">
                    <strong className="text-slate-100 block">{b.patientName}</strong>
                    <span className="font-mono text-teal-400 text-[11px]">{b.medNo}</span>
                  </td>

                  {/* Category */}
                  <td className="py-3 px-3 text-slate-300 max-w-[150px] truncate" title={b.chargesCategory}>
                    {b.chargesCategory}
                  </td>

                  {/* Surgeon Fees */}
                  <td className="py-3 px-3 text-right font-mono text-slate-300 tabular-nums">
                    ₹{b.surgeonFees.toLocaleString()}
                  </td>

                  {/* Implants & Consumables */}
                  <td className="py-3 px-3 text-right font-mono text-slate-300 tabular-nums">
                    ₹{(b.implantsCost + b.consumablesCost).toLocaleString()}
                  </td>

                  {/* Insurance Approved */}
                  <td className="py-3 px-3 text-right font-mono text-emerald-400 tabular-nums">
                    ₹{b.insuranceApprovalAmount.toLocaleString()}
                  </td>

                  {/* Gross Total */}
                  <td className="py-3 px-3 text-right font-mono font-bold text-white tabular-nums">
                    ₹{b.totalAmount.toLocaleString()}
                  </td>

                  {/* Paid */}
                  <td className="py-3 px-3 text-right font-mono font-bold text-emerald-400 tabular-nums">
                    ₹{b.amountPaid.toLocaleString()}
                  </td>

                  {/* Status */}
                  <td className="py-3 px-3 text-center">
                    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                      b.status === 'Paid'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : b.status === 'Cancelled'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : b.status === 'Refunded'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    }`}>
                      {b.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setSelectedBillForPrint(b)}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-semibold flex items-center gap-1"
                        title="Print Invoice / Receipt"
                      >
                        <Printer className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Print</span>
                      </button>

                      {b.status !== 'Cancelled' && b.status !== 'Refunded' && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setActionTargetBill(b);
                              setActionType('refund');
                              setRefundAmountInput(b.amountPaid.toString());
                            }}
                            className="p-1 text-slate-400 hover:text-amber-400 rounded"
                            title="Process Refund"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setActionTargetBill(b);
                              setActionType('cancel');
                            }}
                            className="p-1 text-slate-400 hover:text-rose-400 rounded"
                            title="Cancel Bill"
                          >
                            <Ban className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: GENERATE ESTIMATE / INVOICE */}
      {isGenerateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden my-6">
            <div className="px-6 py-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white tracking-tight">
                    Generate {billType} & Financial Breakdown
                  </h2>
                  <p className="text-xs text-slate-400">
                    Abhinavas Eye Care · Complete cost component allocation & patient payable calculation.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsGenerateModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleGenerateBill} className="p-6 space-y-4 max-h-[82vh] overflow-y-auto">
              {/* Type & Patient */}
              <div className="grid grid-cols-12 gap-3 text-xs">
                <div className="col-span-4">
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Document Type *
                  </label>
                  <select
                    value={billType}
                    onChange={(e) => setBillType(e.target.value as BillType)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-bold"
                  >
                    <option value="Estimate">Pre-Op Estimate (Quotation)</option>
                    <option value="Invoice">Official Invoice (Final Bill)</option>
                    <option value="Receipt">Payment Receipt</option>
                  </select>
                </div>

                <div className="col-span-8">
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Select Patient *
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

                <div className="col-span-12">
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Charges Category *
                  </label>
                  <input
                    type="text"
                    value={chargesCategory}
                    onChange={(e) => setChargesCategory(e.target.value)}
                    placeholder="e.g. Laparoscopic Surgery, Orthopedic Daycare, General Surgery"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100"
                    required
                  />
                </div>
              </div>

              {/* The 5 Core Cost Breakdown Components */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                  Cost Components / Breakdown
                </h3>

                <div className="grid grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Surgeon Fees (₹) *</label>
                    <input
                      type="number"
                      value={surgeonFees}
                      onChange={(e) => setSurgeonFees(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Implants (₹) *</label>
                    <input
                      type="number"
                      value={implantsCost}
                      onChange={(e) => setImplantsCost(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Consumables (₹) *</label>
                    <input
                      type="number"
                      value={consumablesCost}
                      onChange={(e) => setConsumablesCost(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Others / Co-Pay (₹)</label>
                    <input
                      type="number"
                      value={othersCoPayment}
                      onChange={(e) => setOthersCoPayment(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-800">
                  <div>
                    <label className="block text-[11px] font-semibold text-emerald-400 mb-1">
                      Insurance Approval Amount (₹)
                    </label>
                    <input
                      type="number"
                      value={insuranceApprovalAmount}
                      onChange={(e) => setInsuranceApprovalAmount(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-emerald-400 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Amount Collected / Paid by Patient (₹)
                    </label>
                    <input
                      type="number"
                      value={amountPaid}
                      onChange={(e) => setAmountPaid(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Dynamic Live Summary Box */}
              <div className="p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-xl flex items-center justify-between text-xs font-mono">
                <div>
                  <span className="text-slate-400 font-sans block">Gross Total</span>
                  <strong className="text-base text-white">₹{grossTotal.toLocaleString()}</strong>
                </div>
                <div>
                  <span className="text-slate-400 font-sans block">TPA Coverage</span>
                  <strong className="text-base text-emerald-400">-₹{nApproved.toLocaleString()}</strong>
                </div>
                <div>
                  <span className="text-slate-400 font-sans block">Net Patient Payable</span>
                  <strong className="text-base text-teal-300">₹{patientPayable.toLocaleString()}</strong>
                </div>
                <div>
                  <span className="text-slate-400 font-sans block">Balance Remaining</span>
                  <strong className="text-base text-rose-400">₹{balanceDue.toLocaleString()}</strong>
                </div>
              </div>

              {/* Payment Mode & Notes */}
              <div className="grid grid-cols-12 gap-3 text-xs">
                <div className="col-span-4">
                  <label className="block text-[11px] text-slate-400 mb-1">Payment Channel</label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value as PaymentMode)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Card / UPI">Card / UPI Online</option>
                    <option value="Insurance / TPA">Insurance / TPA</option>
                    <option value="Corporate Credit">Corporate Credit</option>
                  </select>
                </div>
                <div className="col-span-8">
                  <label className="block text-[11px] text-slate-400 mb-1">Notes / Remarks</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsGenerateModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold rounded-lg shadow-sm shadow-indigo-500/20"
                >
                  {isSubmitting ? 'Generating...' : `Confirm & Issue ${billType}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: PRINT OFFICIAL INVOICE / ESTIMATE */}
      {selectedBillForPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh]">
            <div className="px-6 py-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between shrink-0">
              <span className="font-bold text-white text-sm">
                Official Clinic {selectedBillForPrint.billType}: {selectedBillForPrint.id}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs rounded-lg flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Document</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedBillForPrint(null)}
                  className="p-1.5 text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Printable Document Body */}
            <div className="p-8 bg-white text-slate-900 overflow-y-auto font-sans space-y-6">
              <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-start">
                <div>
                  <h1 className="text-xl font-black text-slate-950 tracking-tight">
                    ABHINAVAS EYE CARE & SURGICAL SUITE
                  </h1>
                  <p className="text-xs text-slate-600">
                    Comprehensive Eye Surgery & Inpatient Care · Reg: TN-MED-449102
                  </p>
                  <p className="text-xs text-slate-500">
                    Department of Ophthalmology & Surgical Services
                  </p>
                </div>
                <div className="text-right text-xs font-mono">
                  <div className="font-bold text-slate-900 text-sm uppercase">{selectedBillForPrint.billType}</div>
                  <div>Doc No: {selectedBillForPrint.id}</div>
                  <div>Date: {new Date(selectedBillForPrint.createdAt).toLocaleDateString()}</div>
                </div>
              </div>

              {/* Patient Banner */}
              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-3 rounded border border-slate-200">
                <div>
                  <span className="text-slate-500 block">Billed To:</span>
                  <strong className="text-sm text-slate-900">{selectedBillForPrint.patientName}</strong>
                  <div className="font-mono text-slate-600">MED No: {selectedBillForPrint.medNo}</div>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 block">Charges Category:</span>
                  <strong className="text-slate-900">{selectedBillForPrint.chargesCategory}</strong>
                  <div className="text-slate-600">Status: <strong className="uppercase">{selectedBillForPrint.status}</strong></div>
                </div>
              </div>

              {/* Breakdown Table */}
              <table className="w-full text-left text-xs border border-slate-200">
                <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                  <tr>
                    <th className="py-2 px-3">Description / Cost Component</th>
                    <th className="py-2 px-3 text-right">Amount (INR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-mono">
                  <tr>
                    <td className="py-2 px-3 font-sans">Surgeon Professional Fees</td>
                    <td className="py-2 px-3 text-right">₹{selectedBillForPrint.surgeonFees.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-sans">Surgical Implants & Prosthetics</td>
                    <td className="py-2 px-3 text-right">₹{selectedBillForPrint.implantsCost.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-sans">Surgical Consumables, Disposables & OT Packs</td>
                    <td className="py-2 px-3 text-right">₹{selectedBillForPrint.consumablesCost.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-sans">Others & Co-Payment Allocation</td>
                    <td className="py-2 px-3 text-right">₹{selectedBillForPrint.othersCoPayment.toLocaleString()}</td>
                  </tr>
                  <tr className="bg-slate-50 font-bold text-slate-950 font-sans">
                    <td className="py-2 px-3">Gross Total Amount</td>
                    <td className="py-2 px-3 text-right font-mono">₹{selectedBillForPrint.totalAmount.toLocaleString()}</td>
                  </tr>
                  {selectedBillForPrint.insuranceApprovalAmount > 0 && (
                    <tr className="text-emerald-700">
                      <td className="py-2 px-3 font-sans">Less: Approved TPA / Insurance Coverage</td>
                      <td className="py-2 px-3 text-right">-₹{selectedBillForPrint.insuranceApprovalAmount.toLocaleString()}</td>
                    </tr>
                  )}
                  <tr className="bg-slate-100 font-bold text-slate-900 font-sans">
                    <td className="py-2 px-3">Net Patient Payable</td>
                    <td className="py-2 px-3 text-right font-mono">₹{selectedBillForPrint.patientPayable.toLocaleString()}</td>
                  </tr>
                  <tr className="text-slate-800">
                    <td className="py-2 px-3 font-sans">Amount Paid / Collected ({selectedBillForPrint.paymentMode || 'Cash'})</td>
                    <td className="py-2 px-3 text-right text-emerald-600 font-bold">₹{selectedBillForPrint.amountPaid.toLocaleString()}</td>
                  </tr>
                  <tr className="bg-slate-50 font-bold text-rose-700 font-sans">
                    <td className="py-2 px-3">Balance Amount Due</td>
                    <td className="py-2 px-3 text-right font-mono">
                      ₹{Math.max(0, selectedBillForPrint.patientPayable - selectedBillForPrint.amountPaid).toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>

              {selectedBillForPrint.notes && (
                <div className="text-xs text-slate-600">
                  <strong>Notes:</strong> {selectedBillForPrint.notes}
                </div>
              )}

              {/* Signature block */}
              <div className="pt-6 flex justify-between items-end text-xs">
                 <div>
                   <p className="text-slate-500">Thank you for placing your trust in Abhinavas Eye Care.</p>
                   <p className="text-[10px] text-slate-400">Computer-generated official statement.</p>
                 </div>
                 <div className="text-right">
                   <div className="font-bold text-slate-900">Authorized Signatory</div>
                   <div className="text-slate-600">Accounts & Billing Desk</div>
                 </div>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: REFUND / CANCELLATION HANDLER */}
      {actionTargetBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400" />
                <span>{actionType === 'cancel' ? 'Cancel Bill / Invoice' : 'Process Refund'}</span>
              </h3>
              <button type="button" onClick={() => setActionTargetBill(null)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400">
              {actionType === 'cancel'
                ? `Are you sure you want to cancel document ${actionTargetBill.id} for ${actionTargetBill.patientName}?`
                : `Enter refund details for ${actionTargetBill.patientName} (${actionTargetBill.id}).`}
            </p>

            {actionType === 'refund' && (
              <div>
                <label className="block text-xs text-slate-300 mb-1">Refund Amount (₹)</label>
                <input
                  type="number"
                  value={refundAmountInput}
                  onChange={(e) => setRefundAmountInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-amber-400 font-bold"
                />
              </div>
            )}

            <div>
              <label className="block text-xs text-slate-300 mb-1">Reason / Justification *</label>
              <textarea
                value={reasonInput}
                onChange={(e) => setReasonInput(e.target.value)}
                placeholder="e.g. Procedure postponed by patient, billing adjustment, or duplicate invoice"
                rows={3}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActionTargetBill(null)}
                className="px-3.5 py-1.5 bg-slate-800 text-slate-300 text-xs rounded-lg"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleExecuteCancelOrRefund}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg text-white ${
                  actionType === 'cancel' ? 'bg-rose-500 hover:bg-rose-400' : 'bg-amber-500 hover:bg-amber-400'
                }`}
              >
                {actionType === 'cancel' ? 'Confirm Cancellation' : 'Process Refund'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
