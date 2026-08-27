'use client';

import React from 'react';
import Link from 'next/link';
import { Rocket, ArrowLeft, Clock, ShieldCheck, Sparkles } from './HeroIconsHub';

interface ComingSoonPageProps {
  title: string;
  category?: string;
  description?: string;
}

export default function ComingSoonPage({
  title,
  category = 'ERP Modulu',
  description = 'Bu modul üzərində işlər yekunlaşmaq üzrədir. Çox yaxında istifadəyə veriləcək!',
}: ComingSoonPageProps) {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 text-slate-800">
      <div className="max-w-xl w-full text-center space-y-6 p-8 sm:p-12 rounded-3xl bg-white border border-slate-200 shadow-xl relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-[#4f533b]/10 blur-3xl pointer-events-none" />

        {/* Icon & Badge */}
        <div className="space-y-3 relative z-10">
          <div className="w-20 h-20 rounded-3xl bg-[#4f533b]/10 border border-[#4f533b]/20 text-[#4f533b] flex items-center justify-center mx-auto shadow-inner">
            <Rocket className="w-10 h-10 animate-bounce text-[#4f533b]" />
          </div>

          <span className="inline-flex items-center gap-1.5 text-xs font-black tracking-widest text-[#4f533b] bg-[#4f533b]/10 border border-[#4f533b]/20 px-3.5 py-1 rounded-full">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> {category}
          </span>
        </div>

        {/* Title & Message */}
        <div className="space-y-2 relative z-10">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
            {title}
          </h1>
          <p className="text-sm text-slate-600 font-medium leading-relaxed max-w-md mx-auto">
            {description}
          </p>
        </div>

        {/* Status Pill */}
        <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold px-4 py-2 rounded-xl relative z-10">
          <Clock className="w-4 h-4 text-amber-600 animate-spin" />
          <span>Bu modul çox yaxında aktiv olacaq</span>
        </div>

        {/* Actions */}
        <div className="pt-4 flex items-center justify-center gap-3 relative z-10">
          <Link
            href="/"
            className="px-6 py-3 rounded-xl bg-[#4f533b] hover:bg-[#3e4230] text-white text-xs font-extrabold shadow-md transition flex items-center gap-2 cursor-pointer active:scale-95 border border-white/10"
          >
            <ArrowLeft className="w-4 h-4" /> Ana İdarəetmə Paneli
          </Link>
        </div>
      </div>
    </div>
  );
}
