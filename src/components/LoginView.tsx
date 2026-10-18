import React, { useState } from 'react';
import { LockKeyhole } from 'lucide-react';
import type { User } from '../types/index.ts';
import { api } from '../utils/api.ts';

export function LoginView({ onLoggedIn }: { onLoggedIn: (user: User) => void }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true); setError('');
    try {
      const result = await api.login(username, password);
      if (!result) setError('Username atau password tidak valid.');
      else onLoggedIn(result.user);
    } catch {
      setError('Server tidak dapat dihubungi. Pastikan API dan database sudah berjalan.');
    } finally { setLoading(false); }
  }

  return <main className="min-h-screen grid place-items-center bg-slate-950 p-5 text-slate-100">
    <form onSubmit={submit} className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-7 shadow-2xl">
      <div className="mb-6 flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-400 text-slate-950"><LockKeyhole size={20} /></span><div><h1 className="font-semibold">NikelFleet</h1><p className="text-xs text-slate-400">Masuk ke sistem pemesanan kendaraan</p></div></div>
      <label className="mb-4 block text-sm">Username<input value={username} onChange={e => setUsername(e.target.value)} autoComplete="username" className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-amber-400" /></label>
      <label className="mb-4 block text-sm">Password<input type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-amber-400" /></label>
      {error && <p className="mb-4 rounded-lg bg-rose-950/50 p-2 text-xs text-rose-200">{error}</p>}
      <button disabled={loading} className="w-full rounded-lg bg-amber-400 py-2.5 text-sm font-semibold text-slate-950 disabled:opacity-60">{loading ? 'Memeriksa…' : 'Masuk'}</button>
      <p className="mt-4 text-center text-xs text-slate-500">Akun uji: admin / password</p>
    </form>
  </main>;
}
