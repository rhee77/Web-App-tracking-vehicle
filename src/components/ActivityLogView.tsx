import React, { useState } from 'react';
import {
  History,
  Search,
  Filter,
  Shield,
  Clock,
  Laptop,
  CheckCircle2,
  FileCheck2,
  Truck,
  FileSpreadsheet
} from 'lucide-react';
import type { ActivityLog } from '../types/index.ts';
import { formatDateTimeID } from '../utils/rules.ts';

interface ActivityLogViewProps {
  logs: ActivityLog[];
}

export const ActivityLogView: React.FC<ActivityLogViewProps> = ({ logs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const filteredLogs = logs.filter((log) => {
    if (categoryFilter !== 'all' && log.category !== categoryFilter) {
      return false;
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        log.userName.toLowerCase().includes(q) ||
        log.description.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.ipAddress.includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2">
          <History className="w-6 h-6 text-amber-500" />
          <span>Audit Trail &amp; Log Aktivitas Sistem</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
          Pencatatan real-time setiap aksi pemesanan, persetujuan bertingkat, monitoring BBM, dan ekspor laporan
        </p>
      </div>

      {/* Filter and Search */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari user, aksi, deskripsi log, atau IP..."
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="w-full sm:w-56">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
          >
            <option value="all">Semua Kategori Aktivitas</option>
            <option value="booking">Pemesanan Kendaraan</option>
            <option value="approval">Persetujuan (Approvals)</option>
            <option value="vehicle">Operasional Armada &amp; BBM</option>
            <option value="export">Ekspor Laporan</option>
            <option value="auth">Otentikasi &amp; Akses</option>
          </select>
        </div>
      </div>

      {/* Log Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Waktu (WITA/WIB)</th>
                <th className="py-3 px-4">Pengguna &amp; Role</th>
                <th className="py-3 px-4">Aksi Sistem</th>
                <th className="py-3 px-4">Deskripsi Aktivitas</th>
                <th className="py-3 px-4">Alamat IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {filteredLogs.map((log) => {
                let badgeClass = 'bg-slate-800 text-slate-300';
                if (log.category === 'approval') badgeClass = 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
                else if (log.category === 'booking') badgeClass = 'bg-amber-500/20 text-amber-300 border border-amber-500/30';
                else if (log.category === 'export') badgeClass = 'bg-blue-500/20 text-blue-300 border border-blue-500/30';
                else if (log.category === 'vehicle') badgeClass = 'bg-purple-500/20 text-purple-300 border border-purple-500/30';

                return (
                  <tr key={log.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 whitespace-nowrap text-slate-400 font-mono text-[11px]">
                      {formatDateTimeID(log.timestamp)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{log.userName}</div>
                      <div className="text-[10px] text-slate-400 capitalize">
                        {log.role}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${badgeClass}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-200 leading-relaxed max-w-md">
                      {log.description}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                      {log.ipAddress}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
