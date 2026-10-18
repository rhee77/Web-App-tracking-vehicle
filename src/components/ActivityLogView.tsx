import React, { useState } from 'react';
import { Search } from 'lucide-react';
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
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          Audit Trail &amp; Log Aktivitas Sistem
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
          Pencatatan real-time setiap aksi pemesanan, persetujuan bertingkat, monitoring BBM, dan ekspor laporan
        </p>
      </div>

      {/* Filter and Search */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari user, aksi, deskripsi log, atau IP..."
            className="w-full bg-slate-850 border border-slate-700/80 rounded-lg pl-9 pr-3.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-slate-500"
          />
        </div>

        <div className="w-full sm:w-56">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full bg-slate-850 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-slate-500"
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
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-850 text-slate-400 uppercase text-[10px] font-medium border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3.5">Waktu</th>
                <th className="py-2.5 px-3.5">Pengguna &amp; Role</th>
                <th className="py-2.5 px-3.5">Aksi Sistem</th>
                <th className="py-2.5 px-3.5">Deskripsi Aktivitas</th>
                <th className="py-2.5 px-3.5">Alamat IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {filteredLogs.map((log) => {
                const badgeClass = 'bg-slate-800 text-slate-300 border border-slate-700';

                return (
                  <tr key={log.id} className="hover:bg-slate-850/60 transition-colors">
                    <td className="py-2.5 px-3.5 whitespace-nowrap text-slate-400 font-mono text-[11px]">
                      {formatDateTimeID(log.timestamp)}
                    </td>
                    <td className="py-2.5 px-3.5">
                      <div className="font-medium text-slate-200">{log.userName}</div>
                      <div className="text-[10px] text-slate-500 capitalize">
                        {log.role}
                      </div>
                    </td>
                    <td className="py-2.5 px-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium font-mono ${badgeClass}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-2.5 px-3.5 text-slate-300 leading-relaxed max-w-md">
                      {log.description}
                    </td>
                    <td className="py-2.5 px-3.5 font-mono text-[11px] text-slate-500">
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
