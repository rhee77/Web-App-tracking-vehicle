import React, { useState } from 'react';
import {
  GitBranch,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  Truck,
  Copy,
  Check
} from 'lucide-react';

export const ActivityDiagramView: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [copied, setCopied] = useState(false);

  const steps = [
    {
      id: 0,
      title: 'Mulai: Form Pemesanan oleh Admin',
      actor: 'Admin / Pegawai Pool',
      desc: 'Admin memilih kendaraan (angkutan orang/barang), driver, waktu pemakaian (mulai - selesai), tujuan ke salah satu dari 6 tambang/kantor, serta menunjuk Approver Level 1 & Level 2.',
      status: 'pending'
    },
    {
      id: 1,
      title: 'Validasi Ketersediaan Jadwal (Conflict Check)',
      actor: 'Sistem Backend',
      desc: 'Sistem mengecek apakah kendaraan atau driver sedang terpakai pada rentang tanggal/jam yang dipilih (startA < endB && endA > startB). Jika bentrok, form menolak input dengan peringatan overlap.',
      status: 'system'
    },
    {
      id: 2,
      title: 'Penerbitan Tiket Pemesanan & Notifikasi Level 1',
      actor: 'Sistem Backend',
      desc: 'Sistem menyimpan record pemesanan dengan status PENDING. Approval Level 1 di-set ke status PENDING, sedangkan Approval Level 2 di-set ke WAITING (terkunci). Catatan dibuat pada activity_logs.',
      status: 'system'
    },
    {
      id: 3,
      title: 'Tinjauan Persetujuan Level 1 (Atasan Langsung)',
      actor: 'Approver Level 1',
      desc: 'Approver Level 1 (misal: Kepala Divisi Operasional) membuka menu "Persetujuan Saya" dan memeriksa urgensi pemakaian. Approver dapat menyetujui atau menolak dengan catatan tertulis.',
      status: 'approver1'
    },
    {
      id: 4,
      title: 'Percabangan Keputusan Level 1',
      actor: 'Sistem Backend',
      desc: 'Jika DITOLAK: Status pemesanan langsung REJECTED dan alur berhenti. Jika DISETUJUI: Level 1 menjadi APPROVED, lalu sistem otomatis membuka status Approval Level 2 menjadi PENDING.',
      status: 'decision'
    },
    {
      id: 5,
      title: 'Tinjauan Persetujuan Level 2 (Kepala Pool / Logistik)',
      actor: 'Approver Level 2',
      desc: 'Approver Level 2 (General Manager Pool & Logistik) memeriksa kesiapan armada, kesiapan driver, serta cadangan BBM. Approver L2 dapat menyetujui atau menolak.',
      status: 'approver2'
    },
    {
      id: 6,
      title: 'Status Pemesanan Menjadi APPROVED',
      actor: 'Sistem Backend',
      desc: 'Setelah kedua level menyetujui, status pemesanan resmi menjadi APPROVED. Status armada di pool berubah menjadi SIAP TUGAS.',
      status: 'approved'
    },
    {
      id: 7,
      title: 'Pelaksanaan Perjalanan & Pemakaian Kendaraan',
      actor: 'Driver & Kru Lapangan',
      desc: 'Kendaraan beroperasi di lapangan tambang nikel (hauling ore, inspeksi K3, perpindahan shift pekerja tambang, dll.).',
      status: 'in_use'
    },
    {
      id: 8,
      title: 'Pengembalian Unit, Odometer Akhir & Pengisian BBM',
      actor: 'Admin Pool',
      desc: 'Kendaraan kembali ke pool. Admin menginput Odometer Akhir dan jumlah pengisian bahan bakar (Liter & Biaya Solar). Status pemesanan menjadi COMPLETED dan data otomatis memperbarui dashboard serta laporan Excel.',
      status: 'completed'
    }
  ];

  const mermaidText = `flowchart TD
    A([Mulai: Admin Login]) --> B[Input Form Pemesanan: Armada, Driver, Jadwal, Approver L1 & L2]
    B --> C{Sistem Validasi:<br/>Cek Jadwal Overlap Kendaraan & Driver}
    C -- Ada Bentrok --> B
    C -- Tersedia (Valid) --> D[Simpan Booking (Status: PENDING)<br/>Approval L1 = PENDING, L2 = WAITING<br/>Catat ke activity_logs]
    D --> E[Notifikasi Persetujuan ke Approver Level 1]
    E --> F{Keputusan<br/>Approver L1?}
    F -- Tolak --> G[Status Booking = REJECTED<br/>Catat Alasan Penolakan<br/>Alur Berhenti]
    F -- Setujui --> H[Status L1 = APPROVED<br/>Aktifkan Status L2 = PENDING]
    H --> I[Notifikasi Persetujuan ke Approver Level 2]
    I --> J{Keputusan<br/>Approver L2?}
    J -- Tolak --> G
    J -- Setujui --> K[Status L2 = APPROVED<br/>Status Booking = APPROVED<br/>Armada Siap Beroperasi]
    K --> L[Kendaraan Digunakan di Lapangan Tambang]
    L --> M[Kendaraan Kembali ke Pool]
    M --> N[Admin Input Odometer Akhir & Konsumsi BBM]
    N --> O[Status Booking = COMPLETED<br/>Update Grafik Dashboard & Laporan Excel]
    O --> P([Selesai])
    G --> P`;

  const handleCopy = () => {
    navigator.clipboard.writeText(mermaidText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-2">
            <span>Instruction Tambahan (b)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2">
            <GitBranch className="w-6 h-6 text-amber-500" />
            <span>Activity Diagram Alur Pemesanan Kendaraan</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Diagram aktivitas alur kerja terstruktur dari permohonan, validasi overlap, otorisasi berjenjang 2-level hingga penyelesaian BBM
          </p>
        </div>

        <button
          onClick={handleCopy}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center space-x-1.5 transition-colors self-start sm:self-auto"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'Tersalin!' : 'Salin Kode Diagram'}</span>
        </button>
      </div>

      {/* Interactive Step Simulator */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              Simulasi Tahap Interaktif
            </span>
            <h2 className="text-base font-extrabold text-white mt-0.5">
              Tahap {currentStep + 1} dari {steps.length}: {steps[currentStep].title}
            </h2>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
              disabled={currentStep === 0}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 text-xs font-semibold"
            >
              Langkah Sebelumnya
            </button>
            <button
              onClick={() => setCurrentStep((prev) => Math.min(steps.length - 1, prev + 1))}
              disabled={currentStep === steps.length - 1}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 text-xs font-bold flex items-center space-x-1"
            >
              <span>Langkah Berikutnya</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setCurrentStep(0)}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              title="Reset Simulasi"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Step Explanation Card */}
        <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-start space-x-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
            {currentStep + 1}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-white">{steps[currentStep].title}</span>
              <span className="text-[10px] px-2 py-0.2 rounded bg-slate-700 text-amber-300 font-medium">
                Pelaku: {steps[currentStep].actor}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
              {steps[currentStep].desc}
            </p>
          </div>
        </div>

        {/* Swimlane Columns View */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-2 text-xs">
          {/* Lane 1: Admin */}
          <div className="bg-slate-850 border border-slate-700/80 rounded-xl p-3 space-y-2">
            <div className="font-bold text-blue-400 pb-2 border-b border-slate-700 text-center">
              1. Admin / Pemohon
            </div>
            <div
              className={`p-2.5 rounded-lg border transition-all ${
                currentStep === 0
                  ? 'bg-amber-500/20 border-amber-500 text-white font-bold ring-2 ring-amber-500/40'
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              Input Pemesanan &amp; Penugasan Driver
            </div>
            <div
              className={`p-2.5 rounded-lg border transition-all ${
                currentStep === 8
                  ? 'bg-emerald-500/20 border-emerald-500 text-white font-bold ring-2 ring-emerald-500/40'
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              Input Odo Akhir &amp; BBM (Selesai)
            </div>
          </div>

          {/* Lane 2: Sistem */}
          <div className="bg-slate-850 border border-slate-700/80 rounded-xl p-3 space-y-2">
            <div className="font-bold text-purple-400 pb-2 border-b border-slate-700 text-center">
              2. Sistem (Engine)
            </div>
            <div
              className={`p-2.5 rounded-lg border transition-all ${
                currentStep === 1
                  ? 'bg-amber-500/20 border-amber-500 text-white font-bold ring-2 ring-amber-500/40'
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              Validasi Jadwal Bentrok (Conflict Overlap)
            </div>
            <div
              className={`p-2.5 rounded-lg border transition-all ${
                currentStep === 2
                  ? 'bg-amber-500/20 border-amber-500 text-white font-bold ring-2 ring-amber-500/40'
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              Simpan Booking &amp; Log Aktivitas
            </div>
            <div
              className={`p-2.5 rounded-lg border transition-all ${
                currentStep === 4 || currentStep === 6
                  ? 'bg-amber-500/20 border-amber-500 text-white font-bold ring-2 ring-amber-500/40'
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              Transisi Status Approval Berjenjang
            </div>
          </div>

          {/* Lane 3: Approver Level 1 */}
          <div className="bg-slate-850 border border-slate-700/80 rounded-xl p-3 space-y-2">
            <div className="font-bold text-emerald-400 pb-2 border-b border-slate-700 text-center">
              3. Approver L1 (Atasan)
            </div>
            <div
              className={`p-2.5 rounded-lg border transition-all ${
                currentStep === 3
                  ? 'bg-amber-500/20 border-amber-500 text-white font-bold ring-2 ring-amber-500/40'
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              Tinjau Permohonan Lapangan
            </div>
            <div
              className={`p-2.5 rounded-lg border transition-all ${
                currentStep === 4
                  ? 'bg-emerald-500/20 border-emerald-500 text-white font-bold ring-2 ring-emerald-500/40'
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              Keputusan: Setujui / Tolak
            </div>
          </div>

          {/* Lane 4: Approver Level 2 */}
          <div className="bg-slate-850 border border-slate-700/80 rounded-xl p-3 space-y-2">
            <div className="font-bold text-amber-400 pb-2 border-b border-slate-700 text-center">
              4. Approver L2 (Pool)
            </div>
            <div
              className={`p-2.5 rounded-lg border transition-all ${
                currentStep === 5
                  ? 'bg-amber-500/20 border-amber-500 text-white font-bold ring-2 ring-amber-500/40'
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              Tinjau Kesiapan Armada &amp; BBM
            </div>
            <div
              className={`p-2.5 rounded-lg border transition-all ${
                currentStep === 6
                  ? 'bg-emerald-500/20 border-emerald-500 text-white font-bold ring-2 ring-emerald-500/40'
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              Otorisasi Final Terbit Kendaraan
            </div>
          </div>

          {/* Lane 5: Driver & Pool Lapangan */}
          <div className="bg-slate-850 border border-slate-700/80 rounded-xl p-3 space-y-2">
            <div className="font-bold text-teal-400 pb-2 border-b border-slate-700 text-center">
              5. Pool &amp; Driver
            </div>
            <div
              className={`p-2.5 rounded-lg border transition-all ${
                currentStep === 7
                  ? 'bg-amber-500/20 border-amber-500 text-white font-bold ring-2 ring-amber-500/40'
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              Perjalanan Operasi di Pit / Tambang
            </div>
            <div
              className={`p-2.5 rounded-lg border transition-all ${
                currentStep === 8
                  ? 'bg-emerald-500/20 border-emerald-500 text-white font-bold ring-2 ring-emerald-500/40'
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              Pengembalian Unit &amp; Catat BBM
            </div>
          </div>
        </div>
      </div>

      {/* Raw Mermaid Flowchart View */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-bold text-white text-xs">
            Kode Diagram Alur (Mermaid Flowchart Syntax)
          </span>
          <span className="text-[11px] text-slate-400">
            Dapat langsung di-render pada GitHub / Mermaid Live Editor
          </span>
        </div>
        <pre className="text-xs font-mono text-emerald-400 overflow-x-auto p-4 bg-slate-950 rounded-xl leading-relaxed">
          {mermaidText}
        </pre>
      </div>
    </div>
  );
};
