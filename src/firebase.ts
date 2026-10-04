import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDocFromServer,
  collection, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot 
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { 
  Patient, 
  SurgerySchedule, 
  BillingRecord, 
  DischargeRecord,
  RateCardItem 
} from './types';

// Initialize Firebase with exact firestoreDatabaseId
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Startup connection verification
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firestore connection successfully verified.");
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}

// Auth helpers
export async function loginWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
}

export async function logoutUser() {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
}

// 1. Patient CRUD
export async function savePatient(patient: Patient): Promise<void> {
  const path = `patients/${patient.id}`;
  try {
    await setDoc(doc(db, 'patients', patient.id), patient);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function updatePatient(patientId: string, updates: Partial<Patient>): Promise<void> {
  const path = `patients/${patientId}`;
  try {
    await updateDoc(doc(db, 'patients', patientId), {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deletePatient(patientId: string): Promise<void> {
  const path = `patients/${patientId}`;
  try {
    await deleteDoc(doc(db, 'patients', patientId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// 2. Surgery Schedule CRUD
export async function saveSurgery(surgery: SurgerySchedule): Promise<void> {
  const path = `surgeries/${surgery.id}`;
  try {
    await setDoc(doc(db, 'surgeries', surgery.id), surgery);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function updateSurgery(surgeryId: string, updates: Partial<SurgerySchedule>): Promise<void> {
  const path = `surgeries/${surgeryId}`;
  try {
    await updateDoc(doc(db, 'surgeries', surgeryId), updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteSurgery(surgeryId: string): Promise<void> {
  const path = `surgeries/${surgeryId}`;
  try {
    await deleteDoc(doc(db, 'surgeries', surgeryId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// 3. Billing CRUD
export async function saveBill(bill: BillingRecord): Promise<void> {
  const path = `billing/${bill.id}`;
  try {
    await setDoc(doc(db, 'billing', bill.id), bill);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function updateBill(billId: string, updates: Partial<BillingRecord>): Promise<void> {
  const path = `billing/${billId}`;
  try {
    await updateDoc(doc(db, 'billing', billId), updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// 4. Discharge Summary CRUD
export async function saveDischarge(discharge: DischargeRecord): Promise<void> {
  const path = `discharges/${discharge.id}`;
  try {
    await setDoc(doc(db, 'discharges', discharge.id), discharge);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Clinic Procedure Rate Card Library
export const CLINIC_RATE_CARD: RateCardItem[] = [
  {
    id: "RC-01",
    procedureName: "Laparoscopic Cholecystectomy",
    category: "General Surgery / Minimal Access",
    baseSurgeonFees: 38000,
    standardImplants: 8000,
    standardConsumables: 14000,
    standardOthers: 5000,
    typicalStayDays: 2,
    defaultConsumablesList: "5mm & 10mm Trocars, Harmonic Scalpel Blade, Titanium Hemoclips, Endobag, Vicryl 2-0, Monocryl 3-0"
  },
  {
    id: "RC-02",
    procedureName: "Inguinal Hernioplasty (Laparoscopic TEP / Lichtenstein)",
    category: "General Surgery",
    baseSurgeonFees: 32000,
    standardImplants: 12000,
    standardConsumables: 9000,
    standardOthers: 4000,
    typicalStayDays: 2,
    defaultConsumablesList: "Prolene 3D Mesh 15x10cm, Absorbable Tackers, Bipolar Cautery, Suction Irrigation Set"
  },
  {
    id: "RC-03",
    procedureName: "Total Knee Arthroplasty (TKR - Unilateral)",
    category: "Orthopedics & Joint Replacement",
    baseSurgeonFees: 65000,
    standardImplants: 75000,
    standardConsumables: 22000,
    standardOthers: 12000,
    typicalStayDays: 4,
    defaultConsumablesList: "High-Flexion Cobalt-Chromium Femoral & Tibial Component, Bone Cement with Gentamicin, Pulsed Lavage, Drain Tube"
  },
  {
    id: "RC-04",
    procedureName: "Arthroscopic ACL Reconstruction with Hamstring Graft",
    category: "Sports Medicine / Orthopedics",
    baseSurgeonFees: 45000,
    standardImplants: 28000,
    standardConsumables: 15000,
    standardOthers: 6000,
    typicalStayDays: 2,
    defaultConsumablesList: "Endobutton CL Ultra, Bio-absorbable Interference Screw, FiberTape, Shaver Blades, RF Wand"
  },
  {
    id: "RC-05",
    procedureName: "Laparoscopic Appendectomy",
    category: "Emergency & General Surgery",
    baseSurgeonFees: 28000,
    standardImplants: 4000,
    standardConsumables: 11000,
    standardOthers: 4500,
    typicalStayDays: 2,
    defaultConsumablesList: "10mm Laparoscopic Port, Roeder Knot Loops / Endoloops, Suction Cannula, Steri-Strips"
  },
  {
    id: "RC-06",
    procedureName: "Total Thyroidectomy with Nerve Monitoring",
    category: "Endocrine & Neck Surgery",
    baseSurgeonFees: 52000,
    standardImplants: 6000,
    standardConsumables: 18000,
    standardOthers: 7000,
    typicalStayDays: 3,
    defaultConsumablesList: "NIM EMG Endotracheal Tube, LigaSure Vessel Sealer, Surgicel Fibrillar, Closed Suction Drain"
  }
];

// Initial clinic records for demonstration
export const INITIAL_PATIENTS: Patient[] = [
  {
    id: "MED-2026-001",
    medNo: "MED-2026-001",
    name: "Rajesh Ramaswamy",
    dob: "1972-04-14",
    mobile: "+91 98401 23456",
    gender: "Male",
    insuranceType: "Insurance",
    insuranceProvider: "Star Health & Allied Insurance",
    policyNumber: "SH-992014-TAM",
    createdAt: "2026-09-28T09:30:00Z",
    updatedAt: "2026-10-02T14:15:00Z"
  },
  {
    id: "MED-2026-002",
    medNo: "MED-2026-002",
    name: "Meenakshi Sundaram",
    dob: "1984-11-20",
    mobile: "+91 97910 88231",
    gender: "Female",
    insuranceType: "Insurance",
    insuranceProvider: "ICICI Lombard Healthcare",
    policyNumber: "IL-448201-IND",
    createdAt: "2026-09-29T11:15:00Z",
    updatedAt: "2026-10-03T06:00:00Z"
  },
  {
    id: "MED-2026-003",
    medNo: "MED-2026-003",
    name: "Gopalakrishnan V.",
    dob: "1958-08-05",
    mobile: "+91 94440 55198",
    gender: "Male",
    insuranceType: "Non-Insurance",
    createdAt: "2026-09-30T16:45:00Z",
    updatedAt: "2026-10-02T18:00:00Z"
  },
  {
    id: "MED-2026-004",
    medNo: "MED-2026-004",
    name: "Priyanka Natarajan",
    dob: "1997-03-12",
    mobile: "+91 98840 71234",
    gender: "Female",
    insuranceType: "Insurance",
    insuranceProvider: "HDFC ERGO General Insurance",
    policyNumber: "HD-771920-CORP",
    createdAt: "2026-10-01T08:00:00Z",
    updatedAt: "2026-10-03T07:15:00Z"
  },
  {
    id: "MED-2026-005",
    medNo: "MED-2026-005",
    name: "Anand Chandrasekar",
    dob: "1965-01-30",
    mobile: "+91 99620 33445",
    gender: "Male",
    insuranceType: "Non-Insurance",
    createdAt: "2026-09-26T14:20:00Z",
    updatedAt: "2026-10-02T11:00:00Z"
  }
];

export const INITIAL_SURGERIES: SurgerySchedule[] = [
  {
    id: "SURG-2026-001",
    patientId: "MED-2026-001",
    patientName: "Rajesh Ramaswamy",
    medNo: "MED-2026-001",
    procedureName: "Laparoscopic Cholecystectomy",
    consumablesAndImplants: "Harmonic blade, 10mm clip applier, Endobag, Vicryl 2-0",
    tentativeDate: "2026-10-05",
    tentativeHospital: "Abhinavas Eye Care Surgical Centre",
    paymentMode: "Insurance / TPA",
    preoperativeInstructions: "NPO from midnight 10:00 PM. Continue morning anti-hypertensive with sips of water. Stop Aspirin 5 days prior. Bring chest X-ray and ECG.",
    insuranceApprovalAmount: 55000,
    hospitalMapping: "Tier-1 Surgical Network · Semi-Private Suite",
    otStatus: "Confirmed",
    estimatedCost: 65000,
    otRoom: "O.T. Suite 2",
    anesthesiaType: "General Anesthesia (GA with ETT)",
    surgeonName: "Senior Consultant Eye Surgeon, M.S. (Ophth)",
    createdAt: "2026-10-01T10:00:00Z"
  },
  {
    id: "SURG-2026-002",
    patientId: "MED-2026-004",
    patientName: "Priyanka Natarajan",
    medNo: "MED-2026-004",
    procedureName: "Laparoscopic Appendectomy",
    consumablesAndImplants: "Port access kit, Roeder endoloop sutures, Suction irrigator",
    tentativeDate: "2026-10-04",
    tentativeHospital: "Apollo Specialty Hospital (O.T. Block B)",
    paymentMode: "Insurance / TPA",
    preoperativeInstructions: "Complete 6-hour solid fasting. Shave prep right lower abdomen. IV line on non-dominant arm.",
    insuranceApprovalAmount: 42000,
    hospitalMapping: "Partner Hospital · Daycare Laparoscopy Unit",
    otStatus: "Scheduled",
    estimatedCost: 47500,
    otRoom: "O.T. 1",
    anesthesiaType: "General Anesthesia",
    surgeonName: "Consultant Vitreo-Retinal Surgeon",
    createdAt: "2026-10-02T14:30:00Z"
  },
  {
    id: "SURG-2026-003",
    patientId: "MED-2026-003",
    patientName: "Gopalakrishnan V.",
    medNo: "MED-2026-003",
    procedureName: "Total Knee Arthroplasty (TKR - Unilateral)",
    consumablesAndImplants: "High-Flexion Co-Cr Femoral & Tibial Implants, Bone Cement, Pulsed Lavage, Knee Brace",
    tentativeDate: "2026-10-08",
    tentativeHospital: "Abhinavas Eye Care Surgical Centre",
    paymentMode: "Cash",
    preoperativeInstructions: "Pre-anesthesia check-up (PAC) cleared. Dental clearance done. 8 hours overnight fasting.",
    insuranceApprovalAmount: 0,
    hospitalMapping: "In-House Deluxe Joint Care Unit",
    otStatus: "Scheduled",
    estimatedCost: 174000,
    otRoom: "Laminar Flow Modular O.T.",
    anesthesiaType: "Combined Spinal-Epidural (CSE)",
    surgeonName: "Cornea & Refractive Team",
    createdAt: "2026-10-02T16:00:00Z"
  }
];

export const INITIAL_BILLING: BillingRecord[] = [
  {
    id: "INV-2026-001",
    patientId: "MED-2026-001",
    patientName: "Rajesh Ramaswamy",
    medNo: "MED-2026-001",
    billType: "Invoice",
    chargesCategory: "General Surgery / Minimal Access",
    surgeonFees: 38000,
    implantsCost: 8000,
    consumablesCost: 14000,
    othersCoPayment: 5000,
    insuranceApprovalAmount: 55000,
    totalAmount: 65000,
    patientPayable: 10000,
    amountPaid: 10000,
    refundAmount: 0,
    status: "Paid",
    paymentMode: "Card / UPI",
    receiptNumber: "RCT-2026-001",
    transactionRef: "UPI-IND-994829104",
    notes: "Insurance pre-auth settled. Patient co-payment collected via Google Pay.",
    createdAt: "2026-10-02T11:00:00Z"
  },
  {
    id: "EST-2026-002",
    patientId: "MED-2026-003",
    patientName: "Gopalakrishnan V.",
    medNo: "MED-2026-003",
    billType: "Estimate",
    chargesCategory: "Orthopedics & Joint Replacement",
    surgeonFees: 65000,
    implantsCost: 75000,
    consumablesCost: 22000,
    othersCoPayment: 12000,
    insuranceApprovalAmount: 0,
    totalAmount: 174000,
    patientPayable: 174000,
    amountPaid: 50000,
    refundAmount: 0,
    status: "Partially Paid",
    paymentMode: "Cash",
    receiptNumber: "RCT-2026-002",
    notes: "Formal pre-operative financial estimate provided. Advance deposit collected.",
    createdAt: "2026-10-02T16:30:00Z"
  },
  {
    id: "INV-2026-003",
    patientId: "MED-2026-005",
    patientName: "Anand Chandrasekar",
    medNo: "MED-2026-005",
    billType: "Invoice",
    chargesCategory: "Daycare Wound Care & Debridement",
    surgeonFees: 12000,
    implantsCost: 0,
    consumablesCost: 4500,
    othersCoPayment: 1500,
    insuranceApprovalAmount: 0,
    totalAmount: 18000,
    patientPayable: 18000,
    amountPaid: 18000,
    refundAmount: 0,
    status: "Paid",
    paymentMode: "Cash",
    receiptNumber: "RCT-2026-003",
    createdAt: "2026-10-01T15:00:00Z"
  }
];

export const INITIAL_DISCHARGES: DischargeRecord[] = [
  {
    id: "DSC-2026-001",
    patientId: "MED-2026-005",
    patientName: "Anand Chandrasekar",
    medNo: "MED-2026-005",
    admissionDate: "2026-09-26",
    dischargeDate: "2026-10-01",
    procedurePerformed: "Surgical Wound Debridement & Negative Pressure VAC Application",
    dischargeCondition: "Stable",
    postCareNotes: "Maintain vacuum dressing seal intact. Keep foot elevated on two pillows while resting. Diabetic sugar log twice daily. Zero weight bearing on right heel.",
    medications: "1. Tab. Amoxiclav 625mg PO BD x 7 days\n2. Tab. Pantoprazole 40mg PO OD before breakfast\n3. Tab. Paracetamol 650mg PO SOS for pain\n4. Continue Insulin Glargine 14 units at 9 PM",
    followUpDate: "2026-10-08",
    surgeonName: "Consultant Eye Surgeon",
    summaryNotes: "Post-op wound healthy, granulation tissue progressing well. Discharged in stable ambulating condition.",
    createdAt: "2026-10-01T16:00:00Z"
  }
];

export async function seedClinicDataIfEmpty(): Promise<boolean> {
  try {
    const snap = await getDocs(collection(db, 'patients'));
    if (snap.empty) {
      console.log("Seeding Abhinavas Eye Care records across 4 core modules...");
      for (const p of INITIAL_PATIENTS) {
        await setDoc(doc(db, 'patients', p.id), p);
      }
      for (const s of INITIAL_SURGERIES) {
        await setDoc(doc(db, 'surgeries', s.id), s);
      }
      for (const b of INITIAL_BILLING) {
        await setDoc(doc(db, 'billing', b.id), b);
      }
      for (const d of INITIAL_DISCHARGES) {
        await setDoc(doc(db, 'discharges', d.id), d);
      }
      return true;
    }
    return false;
  } catch (err) {
    console.warn("Could not seed data:", err);
    return false;
  }
}
