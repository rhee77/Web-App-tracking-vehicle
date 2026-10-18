import React, { useState } from 'react';

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
          <div className="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-medium bg-slate-800 border border-slate-700 text-slate-300 mb-2">
            <span>Pemenuhan Soal (g)</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Dokumentasi Sistem &amp; File README.md
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Daftar kredensial username-password, versi database &amp; PHP, arsitektur framework, dan panduan penggunaan
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
          >
            {copied ? 'Tersalin!' : 'Salin Markdown'}
          </button>
          <button
            onClick={handleDownload}
            className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-900 text-xs font-medium shadow-sm transition-colors"
          >
            Unduh File README.md
          </button>
        </div>
      </div>

      {/* Quick Specs Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {/* Card 1: Kredensial */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="text-slate-300 font-medium text-xs">
            Akun &amp; Kredensial Pengujian
          </div>
          <div className="space-y-1 text-xs">
            <div className="p-2 rounded-lg bg-slate-850/80 border border-slate-800 text-slate-300">
              <span className="font-medium text-white">Admin:</span>{' '}
              <span className="font-mono text-slate-200">admin</span> /{' '}
              <span className="font-mono text-slate-500">password</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-850/80 border border-slate-800 text-slate-300">
              <span className="font-medium text-slate-200">Approver L1:</span>{' '}
              <span className="font-mono text-slate-200">approver1</span> /{' '}
              <span className="font-mono text-slate-500">password</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-850/80 border border-slate-800 text-slate-300">
              <span className="font-medium text-slate-200">Approver L2:</span>{' '}
              <span className="font-mono text-slate-200">approver2</span> /{' '}
              <span className="font-mono text-slate-500">password</span>
            </div>
          </div>
        </div>

        {/* Card 2: Environment */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="text-slate-300 font-medium text-xs">
            Versi Bahasa &amp; Framework
          </div>
          <ul className="space-y-1.5 text-xs text-slate-300">
            <li className="flex justify-between">
              <span className="text-slate-400">PHP Version:</span>
              <span className="font-mono font-medium text-white">PHP 8.2 / 8.3</span>
            </li>
            <li className="flex justify-between">
              <span className="text-slate-400">Framework:</span>
              <span className="font-medium text-slate-200">Laravel 11.x</span>
            </li>
            <li className="flex justify-between">
              <span className="text-slate-400">Frontend Stack:</span>
              <span className="text-white font-medium">React 19, Tailwind CSS</span>
            </li>
            <li className="flex justify-between">
              <span className="text-slate-400">Export Engine:</span>
              <span className="text-slate-200 font-medium">PhpSpreadsheet / SheetJS</span>
            </li>
          </ul>
        </div>

        {/* Card 3: Database */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="text-slate-300 font-medium text-xs">
            Database Version &amp; Engine
          </div>
          <ul className="space-y-1.5 text-xs text-slate-300">
            <li className="flex justify-between">
              <span className="text-slate-400">Database Engine:</span>
              <span className="font-mono font-medium text-white">MySQL 8.0 / MariaDB 10.11</span>
            </li>
            <li className="flex justify-between">
              <span className="text-slate-400">Storage Engine:</span>
              <span className="font-medium text-white">InnoDB (ACID Compliant)</span>
            </li>
            <li className="flex justify-between">
              <span className="text-slate-400">Relational FK:</span>
              <span className="text-slate-200 font-medium">ON DELETE CASCADE/SET NULL</span>
            </li>
            <li className="flex justify-between">
              <span className="text-slate-400">Integrity:</span>
              <span className="text-white font-medium">Schedule Overlap Indexing</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Formatted Markdown Reader Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="prose prose-invert max-w-none text-xs text-slate-300 space-y-4">
          <pre className="text-xs font-mono text-slate-300 overflow-x-auto p-4 bg-slate-950/80 border border-slate-850 rounded-lg leading-relaxed whitespace-pre-wrap">
            {README_MARKDOWN}
          </pre>
        </div>
      </div>
    </div>
  );
};
