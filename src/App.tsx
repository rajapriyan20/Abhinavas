import React, { useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot 
} from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { 
  db, 
  auth, 
  testConnection, 
  loginWithGoogle, 
  logoutUser, 
  savePatient, 
  deletePatient,
  saveSurgery,
  updateSurgery,
  deleteSurgery,
  saveBill,
  updateBill,
  saveDischarge,
  seedClinicDataIfEmpty,
  INITIAL_PATIENTS,
  INITIAL_SURGERIES,
  INITIAL_BILLING,
  INITIAL_DISCHARGES,
  CLINIC_RATE_CARD,
  handleFirestoreError,
  OperationType 
} from './firebase';
import { 
  Patient, 
  SurgerySchedule, 
  BillingRecord, 
  DischargeRecord, 
  OTStatus 
} from './types';
import { Navigation, ActiveTab } from './components/Navigation';
import { Header } from './components/Header';
import { DashboardQuickAccess } from './components/DashboardQuickAccess';
import { PatientRegistrationModal } from './components/PatientRegistrationModal';
import { PatientSearchAndReport } from './components/PatientSearchAndReport';
import { SurgerySchedulingModule } from './components/SurgerySchedulingModule';
import { OTListView } from './components/OTListView';
import { BillingFinancialsModule } from './components/BillingFinancialsModule';
import { DischargeSummaryModule } from './components/DischargeSummaryModule';

export default function App() {
  const [currentTab, setCurrentTab] = useState<ActiveTab>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

  // Firebase Realtime State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(false);
  const [patients, setPatients] = useState<Patient[]>(INITIAL_PATIENTS);
  const [surgeries, setSurgeries] = useState<SurgerySchedule[]>(INITIAL_SURGERIES);
  const [bills, setBills] = useState<BillingRecord[]>(INITIAL_BILLING);
  const [discharges, setDischarges] = useState<DischargeRecord[]>(INITIAL_DISCHARGES);
  const [isSeeding, setIsSeeding] = useState(false);

  // Modals & Selection
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [selectedPatientForAction, setSelectedPatientForAction] = useState<Patient | null>(null);

  // 1. Connection check and Auth listener on startup
  useEffect(() => {
    testConnection().then(() => setIsFirebaseConnected(true)).catch(() => setIsFirebaseConnected(false));

    const unsubAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });

    return () => unsubAuth();
  }, []);

  // 2. Realtime sync across the 4 core collections
  useEffect(() => {
    // Patients listener
    const pathPatients = 'patients';
    const unsubPatients = onSnapshot(
      collection(db, pathPatients),
      (snapshot) => {
        if (!snapshot.empty) {
          const loaded: Patient[] = [];
          snapshot.forEach((doc) => loaded.push(doc.data() as Patient));
          setPatients(loaded);
        } else {
          // Auto-seed if empty
          seedClinicDataIfEmpty().then((seeded) => {
            if (seeded) setPatients(INITIAL_PATIENTS);
          });
        }
        setIsFirebaseConnected(true);
      },
      (error) => {
        console.warn("Patients sync warning:", error);
        handleFirestoreError(error, OperationType.GET, pathPatients);
      }
    );

    // Surgeries listener
    const pathSurgeries = 'surgeries';
    const unsubSurgeries = onSnapshot(
      collection(db, pathSurgeries),
      (snapshot) => {
        if (!snapshot.empty) {
          const loaded: SurgerySchedule[] = [];
          snapshot.forEach((doc) => loaded.push(doc.data() as SurgerySchedule));
          setSurgeries(loaded);
        }
      },
      (error) => {
        console.warn("Surgeries sync warning:", error);
        handleFirestoreError(error, OperationType.GET, pathSurgeries);
      }
    );

    // Billing listener
    const pathBilling = 'billing';
    const unsubBilling = onSnapshot(
      collection(db, pathBilling),
      (snapshot) => {
        if (!snapshot.empty) {
          const loaded: BillingRecord[] = [];
          snapshot.forEach((doc) => loaded.push(doc.data() as BillingRecord));
          setBills(loaded);
        }
      },
      (error) => {
        console.warn("Billing sync warning:", error);
        handleFirestoreError(error, OperationType.GET, pathBilling);
      }
    );

    // Discharge listener
    const pathDischarges = 'discharges';
    const unsubDischarges = onSnapshot(
      collection(db, pathDischarges),
      (snapshot) => {
        if (!snapshot.empty) {
          const loaded: DischargeRecord[] = [];
          snapshot.forEach((doc) => loaded.push(doc.data() as DischargeRecord));
          setDischarges(loaded);
        }
      },
      (error) => {
        console.warn("Discharge sync warning:", error);
        handleFirestoreError(error, OperationType.GET, pathDischarges);
      }
    );

    return () => {
      unsubPatients();
      unsubSurgeries();
      unsubBilling();
      unsubDischarges();
    };
  }, []);

  // Handlers
  const handleSeedData = async () => {
    try {
      setIsSeeding(true);
      await seedClinicDataIfEmpty();
      setPatients(INITIAL_PATIENTS);
      setSurgeries(INITIAL_SURGERIES);
      setBills(INITIAL_BILLING);
      setDischarges(INITIAL_DISCHARGES);
      alert("Clinic demo data populated across Patient Registration, Surgery, Billing, and Discharges.");
    } catch (err: any) {
      console.error("Seeding error:", err);
    } finally {
      setIsSeeding(false);
    }
  };

  const handleRegisterPatient = async (patient: Patient) => {
    try {
      await savePatient(patient);
      setPatients((prev) => [patient, ...prev.filter((p) => p.id !== patient.id)]);
    } catch (err) {
      console.error("Save patient error:", err);
      setPatients((prev) => [patient, ...prev.filter((p) => p.id !== patient.id)]);
    }
  };

  const handleDeletePatient = async (patientId: string) => {
    try {
      await deletePatient(patientId);
      setPatients((prev) => prev.filter((p) => p.id !== patientId));
    } catch (err) {
      console.error("Delete patient error:", err);
      setPatients((prev) => prev.filter((p) => p.id !== patientId));
    }
  };

  const handleScheduleSurgery = async (surgery: SurgerySchedule) => {
    try {
      await saveSurgery(surgery);
      setSurgeries((prev) => [surgery, ...prev.filter((s) => s.id !== surgery.id)]);
    } catch (err) {
      console.error("Save surgery error:", err);
      setSurgeries((prev) => [surgery, ...prev.filter((s) => s.id !== surgery.id)]);
    }
  };

  const handleUpdateSurgeryStatus = async (id: string, newStatus: OTStatus) => {
    try {
      await updateSurgery(id, { otStatus: newStatus });
      setSurgeries((prev) => prev.map((s) => (s.id === id ? { ...s, otStatus: newStatus } : s)));
    } catch (err) {
      console.error("Update surgery status error:", err);
      setSurgeries((prev) => prev.map((s) => (s.id === id ? { ...s, otStatus: newStatus } : s)));
    }
  };

  const handleDeleteSurgery = async (id: string) => {
    try {
      await deleteSurgery(id);
      setSurgeries((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error("Delete surgery error:", err);
      setSurgeries((prev) => prev.filter((s) => s.id !== id));
    }
  };

  const handleSaveBill = async (bill: BillingRecord) => {
    try {
      await saveBill(bill);
      setBills((prev) => [bill, ...prev.filter((b) => b.id !== bill.id)]);
    } catch (err) {
      console.error("Save bill error:", err);
      setBills((prev) => [bill, ...prev.filter((b) => b.id !== bill.id)]);
    }
  };

  const handleUpdateBill = async (id: string, updates: Partial<BillingRecord>) => {
    try {
      await updateBill(id, updates);
      setBills((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)));
    } catch (err) {
      console.error("Update bill error:", err);
      setBills((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)));
    }
  };

  const handleSaveDischarge = async (discharge: DischargeRecord) => {
    try {
      await saveDischarge(discharge);
      setDischarges((prev) => [discharge, ...prev.filter((d) => d.id !== discharge.id)]);
    } catch (err) {
      console.error("Save discharge error:", err);
      setDischarges((prev) => [discharge, ...prev.filter((d) => d.id !== discharge.id)]);
    }
  };

  // Metrics for badges
  const upcomingSurgeriesCount = surgeries.filter((s) => s.otStatus === 'Scheduled' || s.otStatus === 'Confirmed').length;
  const unpaidBillsCount = bills.filter((b) => b.status === 'Issued' || b.status === 'Partially Paid').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex min-w-[1280px]">
      {/* 1. Collapsible Sidebar Navigation */}
      <Navigation
        currentTab={currentTab}
        onSelectTab={(tab) => {
          if (tab === 'register') {
            setIsRegisterModalOpen(true);
          } else {
            setCurrentTab(tab);
          }
        }}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
        totalPatients={patients.length}
        upcomingSurgeriesCount={upcomingSurgeriesCount}
        unpaidBillsCount={unpaidBillsCount}
        isFirebaseConnected={isFirebaseConnected}
      />

      {/* 2. Main Viewport */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-900/40">
        {/* Top Header with Global Search, Live Clock & Auth */}
        <Header
          searchQuery={globalSearch}
          onSearchChange={(q) => {
            setGlobalSearch(q);
            if (q && currentTab !== 'search') {
              setCurrentTab('search');
            }
          }}
          onOpenRegisterModal={() => setIsRegisterModalOpen(true)}
          onNavigateToTab={(tab) => setCurrentTab(tab)}
          currentUser={currentUser}
          onLogin={loginWithGoogle}
          onLogout={logoutUser}
          onSeedData={handleSeedData}
          isSeeding={isSeeding}
          totalPatientsCount={patients.length}
        />

        {/* Core Modules Routing */}
        <main className="flex-1 overflow-y-auto pb-12">
          {/* Main Dashboard & Quick-Access Workflows */}
          {currentTab === 'dashboard' && (
            <DashboardQuickAccess
              patients={patients}
              surgeries={surgeries}
              bills={bills}
              discharges={discharges}
              onNavigate={(tab) => {
                if (tab === 'register') {
                  setIsRegisterModalOpen(true);
                } else {
                  setCurrentTab(tab);
                }
              }}
              onSelectPatient={(p) => {
                setSelectedPatientForAction(p);
                setCurrentTab('search');
              }}
            />
          )}

          {/* Module I: Patient Search & Unified Master Report */}
          {currentTab === 'search' && (
            <PatientSearchAndReport
              patients={patients}
              surgeries={surgeries}
              bills={bills}
              discharges={discharges}
              onSelectPatient={(p) => setSelectedPatientForAction(p)}
              onOpenRegister={() => setIsRegisterModalOpen(true)}
              onOpenScheduleSurgery={(p) => {
                setSelectedPatientForAction(p);
                setCurrentTab('surgeries');
              }}
              onOpenCreateBill={(p) => {
                setSelectedPatientForAction(p);
                setCurrentTab('billing');
              }}
              onDeletePatient={handleDeletePatient}
            />
          )}

          {/* Module II: Surgery Scheduling */}
          {currentTab === 'surgeries' && (
            <SurgerySchedulingModule
              patients={patients}
              surgeries={surgeries}
              onScheduleSurgery={handleScheduleSurgery}
              onUpdateSurgery={updateSurgery}
              onDeleteSurgery={handleDeleteSurgery}
              onNavigateToOTList={() => setCurrentTab('ot-list')}
              preselectedPatient={selectedPatientForAction}
            />
          )}

          {/* Module II Action: Dedicated O.T. List */}
          {currentTab === 'ot-list' && (
            <OTListView
              surgeries={surgeries}
              onUpdateStatus={handleUpdateSurgeryStatus}
              onOpenScheduleModal={() => setCurrentTab('surgeries')}
            />
          )}

          {/* Module II Action: Procedure Rate Card Library View */}
          {currentTab === 'rate-card' && (
            <div className="p-6 space-y-6 max-w-[1440px] mx-auto">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-white">
                    Clinical Procedure Rate Card Catalog
                  </h1>
                  <p className="text-xs text-slate-400 mt-1">
                    Standardized surgeon fees, implants, and consumables benchmarks for Dr. Karthik's Clinic.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentTab('surgeries')}
                  className="px-4 py-2 bg-rose-500 hover:bg-rose-400 text-white text-xs font-bold rounded-lg shadow-sm"
                >
                  Schedule Surgery →
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {CLINIC_RATE_CARD.map((item) => {
                  const totalEst = item.baseSurgeonFees + item.standardImplants + item.standardConsumables + item.standardOthers;
                  return (
                    <div
                      key={item.id}
                      className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm space-y-3"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono text-teal-400 font-bold">{item.id}</span>
                        <span className="text-[11px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded font-mono">
                          Stay: {item.typicalStayDays} day(s)
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white">{item.procedureName}</h3>
                      <span className="text-xs text-slate-400">{item.category}</span>

                      <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono bg-slate-950 p-2.5 rounded-xl border border-slate-800">
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
                        <div>
                          <span className="text-[10px] text-slate-500 block font-sans">Total Est.</span>
                          <strong className="text-teal-400">₹{totalEst.toLocaleString()}</strong>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-300">
                        <strong className="text-slate-400">Consumables & Implants Kit:</strong> {item.defaultConsumablesList}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Module III: Billing & Financials */}
          {currentTab === 'billing' && (
            <BillingFinancialsModule
              patients={patients}
              bills={bills}
              onSaveBill={handleSaveBill}
              onUpdateBill={handleUpdateBill}
              preselectedPatient={selectedPatientForAction}
            />
          )}

          {/* Module IV: Discharge Summary */}
          {currentTab === 'discharge' && (
            <DischargeSummaryModule
              patients={patients}
              discharges={discharges}
              onSaveDischarge={handleSaveDischarge}
              preselectedPatient={selectedPatientForAction}
            />
          )}
        </main>
      </div>

      {/* Patient Registration Modal */}
      <PatientRegistrationModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onRegister={handleRegisterPatient}
        existingPatients={patients}
      />
    </div>
  );
}
