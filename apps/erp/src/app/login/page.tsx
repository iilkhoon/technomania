'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, User, ArrowRight, CheckCircle2 } from '../../components/HeroIconsHub';
import { loginERPUser, verify2FACode, ERPUser } from '../../lib/erpAuth';

export default function ERPLoginPage() {
  const router = useRouter();
  
  // Step 1: Login Form State
  const [step, setStep] = useState<'login' | '2fa'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // Step 2: 2FA State
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [pendingUser, setPendingUser] = useState<ERPUser | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Handle Step 1: Username & Password
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password) {
      setError('Zəhmət olmasa istifadəçi adı və şifrəni daxil edin');
      return;
    }

    setIsLoading(true);
    await new Promise(r => setTimeout(r, 300));

    const res = loginERPUser(username, password);
    setIsLoading(false);

    if (!res.success) {
      setError(res.error || 'Giriş uğursuz oldu');
      return;
    }

    if (res.requires2FA && res.user) {
      setPendingUser(res.user);
      setStep('2fa');
    } else {
      setSuccess(true);
      setTimeout(() => {
        const targetPath = window.location.pathname.startsWith('/erp') ? '/erp' : '/';
        window.location.href = targetPath;
      }, 500);
    }
  };

  // Handle Step 2: 2FA Google Authenticator Verification
  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!twoFactorCode.trim() || !pendingUser) {
      setError('Zəhmət olmasa 6 rəqəmli 2FA kodunu daxil edin');
      return;
    }

    setIsLoading(true);
    await new Promise(r => setTimeout(r, 300));

    const res = await verify2FACode(pendingUser, twoFactorCode);
    setIsLoading(false);

    if (!res.success) {
      setError(res.error || '2FA kodu yanlışdır');
      return;
    }

    setSuccess(true);
    setTimeout(() => {
      const targetPath = window.location.pathname.startsWith('/erp') ? '/erp' : '/';
      window.location.href = targetPath;
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4 text-slate-700 font-sans selection:bg-[#4f533b]/20 select-none">
      <div className="w-full max-w-sm bg-white border border-slate-200/90 rounded-2xl shadow-xs p-6 space-y-5">
        
        {/* Brand Header */}
        <div className="text-center space-y-1.5 pt-1">
          <div className="w-10 h-10 rounded-xl bg-[#4f533b] flex items-center justify-center text-white font-bold text-sm mx-auto shadow-xs">
            TM
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">Techno ERP</h1>
            <p className="text-xs text-slate-500 font-normal">İdarəetmə Paneli Portalı</p>
          </div>
        </div>



        {/* Step 1 or Step 2 or Success */}
        {success ? (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium text-center space-y-2 animate-fadeIn">
            <CheckCircle2 className="w-7 h-7 text-emerald-600 mx-auto" />
            <p className="text-xs font-bold text-slate-900">Uğurla daxil oldunuz!</p>
            <p className="text-slate-500">ERP panelinə yönləndirilirsiniz...</p>
          </div>
        ) : step === 'login' ? (
          /* ── STEP 1: USERNAME & PASSWORD ── */
          <form onSubmit={handleLoginSubmit} className="space-y-3.5">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {error}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600 block">İstifadəçi Adı (Username)</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="ilkinrzayev"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 outline-none focus:border-[#4f533b] transition font-medium"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600 block">Şifrə</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 outline-none focus:border-[#4f533b] transition font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#4f533b] hover:bg-[#3e4230] text-white font-medium text-xs py-2.5 rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50 mt-1"
            >
              {isLoading ? 'Giriş yoxlanılır...' : (
                <>
                  Daxil Ol <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* ── STEP 2: GOOGLE AUTHENTICATOR 2FA ── */
          <form onSubmit={handle2FASubmit} className="space-y-3.5 animate-fadeIn">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs flex items-center gap-2 text-slate-700">
              <ShieldCheck className="w-4 h-4 text-[#4f533b] flex-shrink-0" />
              <p>Google Authenticator tətbiqindəki 6 rəqəmli kodu daxil edin.</p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {error}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600 block">6-Rəqəmli 2FA Kodu</label>
              <div className="relative">
                <ShieldCheck className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={twoFactorCode}
                  onChange={e => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-900 outline-none focus:border-[#4f533b] transition font-mono font-bold tracking-widest text-center"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStep('login')}
                className="w-1/3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition cursor-pointer"
              >
                Geri
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="w-2/3 bg-[#4f533b] hover:bg-[#3e4230] text-white font-medium text-xs py-2.5 rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
              >
                {isLoading ? 'Yoxlanılır...' : (
                  <>
                    Təsdiqlə <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Footer Security Badge */}
        <div className="pt-2 text-center border-t border-slate-100">
          <span className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> 2FA Təhlükəsizlik Zəmanəti
          </span>
        </div>

      </div>
    </div>
  );
}
