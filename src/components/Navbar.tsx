import React from 'react';
import { Menu, LogOut } from 'lucide-react';
import type { User, Booking } from '../types/index.ts';

interface NavbarProps {
  currentUser: User;
  bookings: Booking[];
  onOpenMobileMenu: () => void;
  onNavigate: (tab: string) => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  bookings,
  onOpenMobileMenu,
  onNavigate,
  onLogout
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
    <header className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 text-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Logo */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onOpenMobileMenu}
              className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
              aria-label="Buka menu navigasi"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div
              onClick={() => onNavigate('dashboard')}
              className="flex items-center space-x-2.5 cursor-pointer group"
            >
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-base tracking-tight text-white group-hover:text-slate-200 transition-colors">
                    NikelFleet
                  </span>
                  <span className="px-1.5 py-0.5 text-[10px] font-medium tracking-wide bg-slate-800 text-slate-400 border border-slate-700/80 rounded">
                    PT Sekawan Media
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 hidden sm:block">
                  Sistem Pemesanan &amp; Monitoring Kendaraan Tambang
                </p>
              </div>
            </div>
          </div>

          {/* Quick Context */}
          <div className="flex items-center space-x-3">
            {/* Pending Badge */}
            {currentUser.role === 'approver' && myPendingApprovals.length > 0 && (
              <button
                onClick={() => onNavigate('approvals')}
                className="hidden sm:flex items-center px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium hover:bg-slate-750 hover:text-white transition-colors"
              >
                <span>{myPendingApprovals.length} Perlu Persetujuan</span>
              </button>
            )}

            <div className="flex items-center space-x-2.5 bg-slate-800/80 border border-slate-700/70 rounded-lg px-3 py-1.5">
                <div className="w-6 h-6 rounded bg-slate-700 text-slate-200 flex items-center justify-center font-semibold text-[11px]">
                  {currentUser.avatar || currentUser.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="text-left hidden md:block">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs font-medium text-slate-200">
                      {currentUser.name}
                    </span>
                    <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-slate-700/60 text-slate-300 border border-slate-600/60">
                      {currentUser.role === 'admin'
                        ? 'Admin'
                        : `Approver L${currentUser.approvalLevel}`}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 truncate max-w-[170px]">
                    {currentUser.position}
                  </p>
                </div>
              </div>
            <button onClick={onLogout} className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white" title="Keluar" aria-label="Keluar"><LogOut size={17} /></button>
          </div>
        </div>
      </div>
    </header>
  );
};
