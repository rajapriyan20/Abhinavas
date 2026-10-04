export type Gender = 'Male' | 'Female' | 'Other';
export type InsuranceClassification = 'Insurance' | 'Non-Insurance';

export interface Patient {
  id: string; // MED no
  medNo: string;
  name: string;
  dob: string; // YYYY-MM-DD
  mobile: string;
  gender: Gender;
  insuranceType: InsuranceClassification;
  insuranceProvider?: string;
  policyNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export type PaymentMode = 'Cash' | 'Insurance / TPA' | 'Card / UPI' | 'Corporate Credit';

export type OTStatus = 'Scheduled' | 'Confirmed' | 'In O.T.' | 'Completed' | 'Postponed' | 'Cancelled';

export interface SurgerySchedule {
  id: string;
  patientId: string; // MED no
  patientName: string;
  medNo: string;
  procedureName: string;
  consumablesAndImplants: string;
  tentativeDate: string; // YYYY-MM-DD
  tentativeHospital: string;
  paymentMode: PaymentMode;
  preoperativeInstructions: string;
  insuranceApprovalAmount: number;
  hospitalMapping: string;
  otStatus: OTStatus;
  estimatedCost: number;
  otRoom?: string;
  anesthesiaType?: string;
  surgeonName?: string;
  createdAt: string;
}

export interface RateCardItem {
  id: string;
  procedureName: string;
  category: string;
  baseSurgeonFees: number;
  standardImplants: number;
  standardConsumables: number;
  standardOthers: number;
  typicalStayDays: number;
  defaultConsumablesList: string;
}

export type BillType = 'Estimate' | 'Invoice' | 'Receipt';
export type BillStatus = 'Draft' | 'Issued' | 'Paid' | 'Partially Paid' | 'Cancelled' | 'Refunded';

export interface BillingRecord {
  id: string; // INV-..., EST-..., RCT-...
  patientId: string;
  patientName: string;
  medNo: string;
  billType: BillType;
  chargesCategory: string;
  surgeonFees: number;
  implantsCost: number;
  consumablesCost: number;
  othersCoPayment: number;
  insuranceApprovalAmount: number;
  totalAmount: number;
  patientPayable: number;
  amountPaid: number;
  refundAmount: number;
  status: BillStatus;
  paymentMode?: PaymentMode;
  receiptNumber?: string;
  transactionRef?: string;
  cancellationReason?: string;
  notes?: string;
  createdAt: string;
}

export type DischargeCondition = 'Stable' | 'Recovered' | 'Referred' | 'DAMA (Discharge Against Medical Advice)';

export interface DischargeRecord {
  id: string; // DSC-...
  patientId: string; // MED no
  patientName: string;
  medNo: string;
  admissionDate: string;
  dischargeDate: string;
  procedurePerformed: string;
  dischargeCondition: DischargeCondition;
  postCareNotes: string;
  medications: string;
  followUpDate: string;
  surgeonName: string;
  summaryNotes?: string;
  createdAt: string;
}
