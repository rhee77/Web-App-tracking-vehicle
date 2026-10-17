import React, { useState } from 'react';
import {
  BookOpen,
  Download,
  Copy,
  Check,
  Key,
  Database,
  Server,
  FileText,
  UserCheck
} from 'lucide-react';
import { README_MARKDOWN } from '../utils/readmeContent.ts';

export const ReadmeModalView: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const handleDownload = () => {
    const blob = new Blob([README_MARKDOWN], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'README.md');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(README_MARKDOWN);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-2">
            <span>Pemenuhan Soal (g)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2">
            <BookOpen className="w-6 h-6 text-amber-500" />
            <span>Dokumentasi Sistem &amp; File README.md</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Daftar kredensial username-password, versi database &amp; PHP, arsitektur framework, dan panduan penggunaan
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopy}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center space-x-1.5 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Tersalin!' : 'Salin Markdown'}</span>
          </button>
          <button
            onClick={handleDownload}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 flex items-center space-x-1.5 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Unduh File README.md</span>
          </button>
        </div>
      </div>

      {/* Quick Specs Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Kredensial */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs">
            <Key className="w-4 h-4" />
            <span>Akun &amp; Kredensial Pengujian</span>
          </div>
          <div className="space-y-1 text-xs">
            <div className="p-2 rounded-lg bg-slate-800 text-slate-300">
              <span className="font-bold text-white">Admin:</span>{' '}
              <span className="font-mono text-amber-300">admin</span> /{' '}
              <span className="font-mono text-slate-400">password</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-800 text-slate-300">
              <span className="font-bold text-emerald-400">Approver L1:</span>{' '}
              <span className="font-mono text-emerald-300">approver1</span> /{' '}
              <span className="font-mono text-slate-400">password</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-800 text-slate-300">
              <span className="font-bold text-purple-400">Approver L2:</span>{' '}
              <span className="font-mono text-purple-300">approver2</span> /{' '}
              <span className="font-mono text-slate-400">password</span>
            </div>
          </div>
        </div>

        {/* Card 2: Environment */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center space-x-2 text-blue-400 font-bold text-xs">
            <Server className="w-4 h-4" />
            <span>Versi Bahasa &amp; Framework</span>
          </div>
          <ul className="space-y-1.5 text-xs text-slate-300">
            <li className="flex justify-between">
              <span className="text-slate-400">PHP Version:</span>
              <span className="font-mono font-bold text-white">PHP 8.2 / 8.3</span>
            </li>
            <li className="flex justify-between">
              <span className="text-slate-400">Framework:</span>
              <span className="font-bold text-amber-400">Laravel 11.x</span>
            </li>
            <li className="flex justify-between">
              <span className="text-slate-400">Frontend Stack:</span>
              <span className="text-white font-medium">React 19, Tailwind CSS</span>
            </li>
            <li className="flex justify-between">
              <span className="text-slate-400">Export Engine:</span>
              <span className="text-emerald-400 font-medium">PhpSpreadsheet / SheetJS</span>
            </li>
          </ul>
        </div>

        {/* Card 3: Database */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs">
            <Database className="w-4 h-4" />
            <span>Database Version &amp; Engine</span>
          </div>
          <ul className="space-y-1.5 text-xs text-slate-300">
            <li className="flex justify-between">
              <span className="text-slate-400">Database Engine:</span>
              <span className="font-mono font-bold text-white">MySQL 8.0 / MariaDB 10.11</span>
            </li>
            <li className="flex justify-between">
              <span className="text-slate-400">Storage Engine:</span>
              <span className="font-medium text-white">InnoDB (ACID Compliant)</span>
            </li>
            <li className="flex justify-between">
              <span className="text-slate-400">Relational FK:</span>
              <span className="text-emerald-400 font-medium">ON DELETE CASCADE/SET NULL</span>
            </li>
            <li className="flex justify-between">
              <span className="text-slate-400">Integrity:</span>
              <span className="text-white font-medium">Schedule Overlap Indexing</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Formatted Markdown Reader Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="prose prose-invert max-w-none text-xs text-slate-300 space-y-4">
          <pre className="text-xs font-mono text-slate-200 overflow-x-auto p-4 bg-slate-950 rounded-xl leading-relaxed whitespace-pre-wrap">
            {README_MARKDOWN}
          </pre>
        </div>
      </div>
    </div>
  );
};
