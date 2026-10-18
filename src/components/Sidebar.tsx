import React from 'react';
import {
  LayoutDashboard,
  CalendarCheck,
  PlusCircle,
  FileCheck2,
  Fuel,
  FileSpreadsheet,
  History,
  Database,
  GitBranch,
  BookOpen,
  X
} from 'lucide-react';
import type { User, Booking } from '../types/index.ts';

interface SidebarProps {
  activeTab: string;
  onNavigate: (tab: string) => void;
  currentUser: User;
  bookings: Booking[];
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onNavigate,
  currentUser,
  bookings,
  isMobileOpen,
  onCloseMobile
}) => {
  // Count items waiting for current user's approval
  const pendingApprovalsCount = bookings.filter((b) => {
    if (b.status !== 'pending') return false;
    if (currentUser.role === 'admin') {
      return true; // Admin sees total active pending
    }
    const myApp = b.approvals.find(
      (a) => a.approverId === currentUser.id || a.level === currentUser.approvalLevel
    );
    if (!myApp) return false;
    if (myApp.status !== 'pending') return false;
    if (myApp.level === 2) {
      const l1 = b.approvals.find((a) => a.level === 1);
      return l1?.status === 'approved';
    }
    return true;
  }).length;

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard & Grafik',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'bookings',
      label: 'Daftar Pemesanan',
      icon: CalendarCheck,
      badge: bookings.length.toString()
    },
    {
      id: 'new_booking',
      label: 'Buat Pemesanan Baru',
      icon: PlusCircle,
      badge: null,
      highlight: true
    },
    {
      id: 'approvals',
      label: 'Persetujuan Saya',
      icon: FileCheck2,
      badge: pendingApprovalsCount > 0 ? `${pendingApprovalsCount}` : null,
      badgeColor: 'bg-slate-800 text-slate-200 border border-slate-700 font-medium'
    },
    {
      id: 'fleet_monitoring',
      label: 'Monitoring BBM & Servis',
      icon: Fuel,
      badge: null
    },
    {
      id: 'reports',
      label: 'Laporan & Export Excel',
      icon: FileSpreadsheet,
      badge: 'XLSX',
      badgeColor: 'bg-slate-800 text-slate-300 border border-slate-700'
    },
    {
      id: 'activity_logs',
      label: 'Log Aktivitas Sistem',
      icon: History,
      badge: null
    },
    {
      type: 'divider',
      label: 'DOKUMENTASI TEKNIKAL'
    },
    {
      id: 'pdm',
      label: 'Physical Data Model (PDM)',
      icon: Database,
      badge: null
    },
    {
      id: 'activity_diagram',
      label: 'Activity Diagram Alur',
      icon: GitBranch,
      badge: null
    },
    {
      id: 'readme',
      label: 'Panduan & README.md',
      icon: BookOpen,
      badge: null
    }
  ];

  const content = (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800 text-slate-300">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-slate-800">
        <div>
          <span className="font-semibold text-white text-sm">Sekawan Fleet</span>
        </div>
        <button
          onClick={onCloseMobile}
          className="p-1 rounded-lg text-slate-400 hover:text-white"
          aria-label="Tutup menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 mb-2">
          <p className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
            Menu Utama
          </p>
        </div>

        {navItems.map((item, index) => {
          if (item.type === 'divider') {
            return (
              <div key={index} className="pt-4 pb-1 px-3">
                <p className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                  {item.label}
                </p>
              </div>
            );
          }

          const Icon = item.icon!;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id!);
                onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors ${
                isActive
                  ? 'bg-slate-800 text-white font-medium border border-slate-700/80 shadow-xs'
                  : item.highlight
                  ? 'bg-slate-850 border border-slate-700/60 text-slate-200 hover:bg-slate-800'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center space-x-2.5 truncate">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive
                      ? 'text-slate-200'
                      : item.highlight
                      ? 'text-slate-300'
                      : 'text-slate-400'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`ml-2 px-1.5 py-0.5 rounded text-[10px] ${
                    item.badgeColor ||
                    (isActive
                      ? 'bg-slate-700 text-slate-200'
                      : 'bg-slate-800 text-slate-400 border border-slate-700/80')
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Operational Region Info Footer */}
      <div className="p-3 m-3 rounded-lg bg-slate-850/60 border border-slate-800 text-[11px]">
        <div className="text-slate-300 font-medium mb-1">
          <span>8 Wilayah Operasional</span>
        </div>
        <p className="text-slate-400 text-[10px] leading-relaxed">
          1 Kantor Pusat, 1 Kantor Cabang &amp; 6 Tambang Nikel (Kolaka, Morowali, Sorowako, Konawe, Halmahera, Morowali Utara).
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 shrink-0 h-[calc(100vh-4rem)] sticky top-16">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 max-w-[80vw] h-full shadow-2xl z-10">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
