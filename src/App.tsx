import React, { useState, useEffect } from 'react';
import {
  INITIAL_USERS,
  INITIAL_REGIONS,
  INITIAL_VEHICLES,
  INITIAL_DRIVERS,
  INITIAL_BOOKINGS,
  INITIAL_FUEL_LOGS,
  INITIAL_SERVICE_SCHEDULES,
  INITIAL_ACTIVITY_LOGS
} from './data/mockData.ts';
import type {
  User,
  Booking,
  Vehicle,
  Driver,
  Region,
  FuelLog,
  ServiceSchedule,
  ActivityLog
} from './types/index.ts';
import { processApprovalAction } from './utils/rules.ts';
import { Navbar } from './components/Navbar.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { BookingsView } from './components/BookingsView.tsx';
import { NewBookingModal } from './components/NewBookingModal.tsx';
import { ApprovalsView } from './components/ApprovalsView.tsx';
import { FleetMonitoringView } from './components/FleetMonitoringView.tsx';
import { ReportsView } from './components/ReportsView.tsx';
import { ActivityLogView } from './components/ActivityLogView.tsx';
import { ArchitectureView } from './components/ArchitectureView.tsx';
import { ActivityDiagramView } from './components/ActivityDiagramView.tsx';
import { ReadmeModalView } from './components/ReadmeModalView.tsx';
import { BookingDetailModal } from './components/BookingDetailModal.tsx';
import { CompleteBookingModal } from './components/CompleteBookingModal.tsx';
import { LoginView } from './components/LoginView.tsx';
import { api } from './utils/api.ts';

export default function App() {
  const [isDbConnected, setIsDbConnected] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Persistence with localStorage fallback
  const [users] = useState<User[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[0]);

  const [regions] = useState<Region[]>(INITIAL_REGIONS);

  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    const saved = localStorage.getItem('nikel_fleet_vehicles');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return INITIAL_VEHICLES;
  });

  const [drivers] = useState<Driver[]>(INITIAL_DRIVERS);

  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem('nikel_fleet_bookings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return INITIAL_BOOKINGS;
  });

  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>(() => {
    const saved = localStorage.getItem('nikel_fleet_fuel_logs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return INITIAL_FUEL_LOGS;
  });

  const [serviceSchedules, setServiceSchedules] = useState<ServiceSchedule[]>(() => {
    const saved = localStorage.getItem('nikel_fleet_service_schedules');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return INITIAL_SERVICE_SCHEDULES;
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem('nikel_fleet_activity_logs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return INITIAL_ACTIVITY_LOGS;
  });

  // UI state
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNewBookingModalOpen, setIsNewBookingModalOpen] = useState(false);
  const [selectedBookingForDetail, setSelectedBookingForDetail] = useState<Booking | null>(null);
  const [selectedBookingForComplete, setSelectedBookingForComplete] = useState<Booking | null>(null);

  // Initial fetch from MySQL Backend
  useEffect(() => {
    async function initDatabase() {
      try {
        if (!isAuthenticated) return;
        const health = await api.checkHealth();
        setIsDbConnected(health.connected);
        if (health.connected) {
          const bootstrap = await api.getBootstrap();
          if (bootstrap) {
            if (bootstrap.vehicles?.length) setVehicles(bootstrap.vehicles);
            if (bootstrap.bookings?.length) setBookings(bootstrap.bookings);
            if (bootstrap.fuelLogs?.length) setFuelLogs(bootstrap.fuelLogs);
            if (bootstrap.serviceSchedules?.length) setServiceSchedules(bootstrap.serviceSchedules);
            if (bootstrap.activityLogs?.length) setActivityLogs(bootstrap.activityLogs);
          }
        }
      } catch (err) {
        console.warn('MySQL init error, using local fallback:', err);
      }
    }
    initDatabase();
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem('nikel_fleet_bookings', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem('nikel_fleet_vehicles', JSON.stringify(vehicles));
  }, [vehicles]);

  useEffect(() => {
    localStorage.setItem('nikel_fleet_fuel_logs', JSON.stringify(fuelLogs));
  }, [fuelLogs]);

  useEffect(() => {
    localStorage.setItem('nikel_fleet_service_schedules', JSON.stringify(serviceSchedules));
  }, [serviceSchedules]);

  useEffect(() => {
    localStorage.setItem('nikel_fleet_activity_logs', JSON.stringify(activityLogs));
  }, [activityLogs]);

  // Helper to add activity log
  const logActivity = (
    action: string,
    category: 'auth' | 'booking' | 'approval' | 'vehicle' | 'export' | 'service',
    description: string
  ) => {
    const newLog: ActivityLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      userId: currentUser.id,
      userName: `${currentUser.name} (${currentUser.role === 'admin' ? 'Admin' : `Approver L${currentUser.approvalLevel}`})`,
      role: currentUser.role,
      action,
      category,
      description,
      timestamp: new Date().toISOString(),
      ipAddress: '192.168.10.45'
    };
    setActivityLogs((prev) => [newLog, ...prev]);
    if (category === 'export') api.logExport(description).catch(() => {});
  };

  // Create booking
  const handleCreateBooking = (newBooking: Booking) => {
    setBookings((prev) => [newBooking, ...prev]);
    api.createBooking(newBooking).catch(() => {});
    logActivity(
      'CREATE_BOOKING',
      'booking',
      `Membuat permohonan pemesanan kendaraan baru: ${newBooking.code} untuk ${newBooking.destination} (${newBooking.department})`
    );
    setActiveTab('bookings');
  };

  // Approve booking
  const handleApproveBooking = (bookingId: string, note: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    try {
      const updated = processApprovalAction(
        booking,
        currentUser.id,
        'approve',
        note,
        currentUser.approvalLevel
      );

      setBookings((prev) => prev.map((b) => (b.id === bookingId ? updated : b)));
      api.processApproval(
        bookingId,
        'approve',
        note
      ).catch(() => {});

      // If fully approved, mark vehicle as in_use
      if (updated.status === 'approved') {
        setVehicles((prev) =>
          prev.map((v) =>
            v.id === updated.vehicleId ? { ...v, status: 'in_use' } : v
          )
        );
      }

      logActivity(
        currentUser.approvalLevel === 1 ? 'APPROVE_LEVEL_1' : 'APPROVE_LEVEL_2',
        'approval',
        `Menyetujui pemesanan ${booking.code} (Level ${currentUser.approvalLevel || 1}). ${
          updated.status === 'approved'
            ? 'Status pemesanan resmi menjadi APPROVED.'
            : 'Status berlanjut ke persetujuan Level 2.'
        }`
      );
    } catch (err: any) {
      alert(err.message || 'Gagal memproses persetujuan');
    }
  };

  // Reject booking
  const handleRejectBooking = (bookingId: string, note: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    try {
      const updated = processApprovalAction(
        booking,
        currentUser.id,
        'reject',
        note,
        currentUser.approvalLevel
      );

      setBookings((prev) => prev.map((b) => (b.id === bookingId ? updated : b)));
      api.processApproval(
        bookingId,
        'reject',
        note
      ).catch(() => {});

      logActivity(
        currentUser.approvalLevel === 1 ? 'REJECT_LEVEL_1' : 'REJECT_LEVEL_2',
        'approval',
        `Menolak pemesanan ${booking.code} (Level ${currentUser.approvalLevel || 1}). Alasan: "${note}"`
      );
    } catch (err: any) {
      alert(err.message || 'Gagal memproses penolakan');
    }
  };

  // Cancel booking
  const handleCancelBooking = (bookingId: string) => {
    if (!confirm('Apakah Anda yakin ingin membatalkan pemesanan ini?')) return;
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'cancelled' } : b))
    );
    api.cancelBooking(bookingId).catch(() => {});
    logActivity('CANCEL_BOOKING', 'booking', `Membatalkan pemesanan kendaraan (ID: ${bookingId})`);
  };

  // Complete booking
  const handleCompleteBooking = (
    bookingId: string,
    endOdometer: number,
    fuelLiters: number,
    fuelCost: number
  ) => {
    const bkg = bookings.find((b) => b.id === bookingId);
    if (!bkg) return;

    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              status: 'completed',
              endOdometer,
              fuelFilledLiters: fuelLiters,
              fuelCost
            }
          : b
      )
    );
    api.completeBooking(bookingId, endOdometer, fuelLiters, fuelCost, bkg.vehicleId).catch(() => {});

    // Update vehicle odometer and availability
    setVehicles((prev) =>
      prev.map((v) =>
        v.id === bkg.vehicleId
          ? {
              ...v,
              odometer: Math.max(v.odometer, endOdometer),
              status: 'available'
            }
          : v
      )
    );

    // Also record to fuelLogs if fuel was filled
    if (fuelLiters > 0) {
      const newFuelLog: FuelLog = {
        id: `fl-${Date.now()}`,
        vehicleId: bkg.vehicleId,
        bookingId: bkg.id,
        liters: fuelLiters,
        cost: fuelCost,
        filledAt: new Date().toISOString(),
        odometer: endOdometer,
        fuelStation: 'SPBU Internal Pool Tambang'
      };
      setFuelLogs((prev) => [newFuelLog, ...prev]);
    }

    logActivity(
      'COMPLETE_BOOKING',
      'vehicle',
      `Menyelesaikan pemesanan ${bkg.code}: Odometer akhir ${endOdometer.toLocaleString(
        'id-ID'
      )} KM, BBM ${fuelLiters} Liter (${fuelCost ? `Rp ${fuelCost.toLocaleString('id-ID')}` : 'Rp 0'})`
    );
  };

  // Add fuel log directly
  const handleAddFuelLog = (log: FuelLog) => {
    setFuelLogs((prev) => [log, ...prev]);
    // update vehicle odo
    setVehicles((prev) =>
      prev.map((v) =>
        v.id === log.vehicleId
          ? { ...v, odometer: Math.max(v.odometer, log.odometer) }
          : v
      )
    );
    logActivity(
      'ADD_FUEL_LOG',
      'vehicle',
      `Mencatat pengisian BBM ${log.liters} Liter untuk kendaraan ID: ${log.vehicleId} di ${log.fuelStation}`
    );
  };

  // Update service schedule
  const handleUpdateServiceStatus = (
    serviceId: string,
    status: 'in_progress' | 'completed'
  ) => {
    setServiceSchedules((prev) =>
      prev.map((s) =>
        s.id === serviceId
          ? {
              ...s,
              status,
              completedAt: status === 'completed' ? new Date().toISOString() : undefined
            }
          : s
      )
    );
    logActivity(
      'UPDATE_SERVICE',
      'service',
      `Memperbarui status servis ID ${serviceId} menjadi ${status.toUpperCase()}`
    );
  };

  // Approvers list
  const approverUsers = users.filter((u) => u.role === 'approver');

  // Selected vehicle for completion modal
  const vehicleForComplete = selectedBookingForComplete
    ? vehicles.find((v) => v.id === selectedBookingForComplete.vehicleId)
    : undefined;

  if (!isAuthenticated) {
    return <LoginView onLoggedIn={(user) => { setCurrentUser(user); setIsAuthenticated(true); }} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-slate-700 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        currentUser={currentUser}
        onLogout={() => { api.logout().finally(() => setIsAuthenticated(false)); }}
        bookings={bookings}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        onNavigate={(tab) => {
          if (tab === 'new_booking') {
            setIsNewBookingModalOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
      />

      {/* Main Workspace */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onNavigate={(tab) => {
            if (tab === 'new_booking') {
              setIsNewBookingModalOpen(true);
            } else {
              setActiveTab(tab);
            }
          }}
          currentUser={currentUser}
          bookings={bookings}
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              bookings={bookings}
              vehicles={vehicles}
              drivers={drivers}
              regions={regions}
              currentUser={currentUser}
              onNavigate={(tab) => {
                if (tab === 'new_booking') {
                  setIsNewBookingModalOpen(true);
                } else {
                  setActiveTab(tab);
                }
              }}
              onViewBookingDetail={(b) => setSelectedBookingForDetail(b)}
            />
          )}

          {activeTab === 'bookings' && (
            <BookingsView
              bookings={bookings}
              vehicles={vehicles}
              drivers={drivers}
              regions={regions}
              currentUser={currentUser}
              onNewBookingClick={() => setIsNewBookingModalOpen(true)}
              onViewBookingDetail={(b) => setSelectedBookingForDetail(b)}
              onOpenCompleteModal={(b) => setSelectedBookingForComplete(b)}
              onCancelBooking={handleCancelBooking}
            />
          )}

          {activeTab === 'approvals' && (
            <ApprovalsView
              bookings={bookings}
              vehicles={vehicles}
              drivers={drivers}
              regions={regions}
              currentUser={currentUser}
              onApprove={handleApproveBooking}
              onReject={handleRejectBooking}
              onViewBookingDetail={(b) => setSelectedBookingForDetail(b)}
              onSwitchUser={() => {}}
              allUsers={users}
            />
          )}

          {activeTab === 'fleet_monitoring' && (
            <FleetMonitoringView
              vehicles={vehicles}
              fuelLogs={fuelLogs}
              serviceSchedules={serviceSchedules}
              regions={regions}
              onAddFuelLog={handleAddFuelLog}
              onUpdateServiceStatus={handleUpdateServiceStatus}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView
              bookings={bookings}
              vehicles={vehicles}
              drivers={drivers}
              regions={regions}
              onLogActivity={(action, category, desc) =>
                logActivity(action, category, desc)
              }
            />
          )}

          {activeTab === 'activity_logs' && (
            <ActivityLogView logs={activityLogs} />
          )}

          {activeTab === 'pdm' && <ArchitectureView />}

          {activeTab === 'activity_diagram' && <ActivityDiagramView />}

          {activeTab === 'readme' && <ReadmeModalView />}
        </main>
      </div>

      {/* New Booking Modal */}
      <NewBookingModal
        isOpen={isNewBookingModalOpen}
        onClose={() => setIsNewBookingModalOpen(false)}
        onSubmit={handleCreateBooking}
        existingBookings={bookings}
        vehicles={vehicles}
        drivers={drivers}
        regions={regions}
        approvers={approverUsers}
        currentUser={currentUser}
      />

      {/* Booking Detail Modal */}
      <BookingDetailModal
        booking={selectedBookingForDetail}
        onClose={() => setSelectedBookingForDetail(null)}
        vehicles={vehicles}
        drivers={drivers}
        regions={regions}
      />

      {/* Complete Booking Modal */}
      <CompleteBookingModal
        booking={selectedBookingForComplete}
        vehicle={vehicleForComplete}
        onClose={() => setSelectedBookingForComplete(null)}
        onConfirm={handleCompleteBooking}
      />
    </div>
  );
}
