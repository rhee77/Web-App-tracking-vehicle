import React from 'react';
import {
  Truck,
  Shield,
  UserCheck,
  ChevronDown,
  Clock,
  MapPin,
  Menu,
  FileSpreadsheet,
  CheckCircle2
} from 'lucide-react';
import type { User, Booking } from '../types/index.ts';

interface NavbarProps {
  currentUser: User;
  users: User[];
  onSwitchUser: (user: User) => void;
  bookings: Booking[];
  onOpenMobileMenu: () => void;
  onNavigate: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  users,
  onSwitchUser,
  bookings,
  onOpenMobileMenu,
  onNavigate
}) => {
  // Count pending approvals specifically waiting for current user
  const myPendingApprovals = bookings.filter((b) => {
    if (b.status !== 'pending') return false;
    if (currentUser.role === 'admin') return false;
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
  });

  return (
    <header className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Logo */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onOpenMobileMenu}
              className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
              aria-label="Buka menu navigasi"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div
              onClick={() => onNavigate('dashboard')}
              className="flex items-center space-x-3 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
                <Truck className="w-6 h-6 text-slate-950 font-bold" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-amber-300 bg-clip-text text-transparent">
                    NikelFleet
                  </span>
                  <span className="px-1.5 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded">
                    PT Sekawan Media
                  </span>
                </div>
                <p className="text-xs text-slate-400 hidden sm:block">
                  Sistem Pemesanan &amp; Monitoring Kendaraan Tambang
                </p>
              </div>
            </div>
          </div>

          {/* Quick Context & Role Switcher */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Pending Badge */}
            {currentUser.role === 'approver' && myPendingApprovals.length > 0 && (
              <button
                onClick={() => onNavigate('approvals')}
                className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-medium hover:bg-amber-500/30 transition-colors animate-pulse"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{myPendingApprovals.length} Perlu Persetujuan</span>
              </button>
            )}

            {/* Role Switcher Pill */}
            <div className="relative group">
              <div className="flex items-center space-x-2 bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 rounded-xl px-3 py-1.5 cursor-pointer transition-all">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                    currentUser.role === 'admin'
                      ? 'bg-blue-600 text-white'
                      : currentUser.approvalLevel === 1
                      ? 'bg-emerald-600 text-white'
                      : 'bg-purple-600 text-white'
                  }`}
                >
                  {currentUser.avatar || currentUser.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="text-left hidden md:block">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs font-semibold text-white">
                      {currentUser.name}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                        currentUser.role === 'admin'
                          ? 'bg-blue-900/60 text-blue-300 border border-blue-700'
                          : currentUser.approvalLevel === 1
                          ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700'
                          : 'bg-purple-900/60 text-purple-300 border border-purple-700'
                      }`}
                    >
                      {currentUser.role === 'admin'
                        ? 'ADMIN'
                        : `APPROVER L${currentUser.approvalLevel}`}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate max-w-[170px]">
                    {currentUser.position}
                  </p>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
              </div>

              {/* Role Dropdown */}
              <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 hidden group-hover:block transition-all z-50">
                <div className="px-3 py-2 border-b border-slate-800 mb-1">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Simulasi Ganti Role (Testing)
                  </p>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Pilih akun untuk menguji flow pemesanan &amp; approval:
                  </p>
                </div>
                {users.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => onSwitchUser(u)}
                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                      currentUser.id === u.id
                        ? 'bg-amber-500/15 border border-amber-500/30 text-amber-200'
                        : 'hover:bg-slate-800 text-slate-200'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                        u.role === 'admin'
                          ? 'bg-blue-600 text-white'
                          : u.approvalLevel === 1
                          ? 'bg-emerald-600 text-white'
                          : 'bg-purple-600 text-white'
                      }`}
                    >
                      {u.avatar || u.name.slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold truncate">
                          {u.name}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                          @{u.username}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">
                        {u.position}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
