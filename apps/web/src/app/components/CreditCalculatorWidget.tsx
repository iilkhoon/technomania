'use client';

import React, { useState } from 'react';
import { Calculator, CheckCircle2, AlertTriangle, ShieldCheck } from './HeroIconsHub';

interface CreditCalculatorWidgetProps {
  productPrice: number;
  productTitle: string;
}

export function CreditCalculatorWidget({ productPrice, productTitle }: CreditCalculatorWidgetProps) {
  const [months, setMonths] = useState<number>(12);
  const [income, setIncome] = useState<string>('800');

  // Simple calculation: Price divided by months (plus 1% monthly service fee for 12+ months simulation)
  const feeMultiplier = months > 12 ? 1.08 : months > 6 ? 1.05 : 1.0;
  const totalAmount = productPrice * feeMultiplier;
  const monthlyPayment = (totalAmount / months).toFixed(2);

  const numIncome = parseFloat(income) || 0;
  const dti = numIncome > 0 ? (parseFloat(monthlyPayment) / numIncome) * 100 : 0;
  const isApproved = numIncome > 0 && dti <= 50;

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md space-y-4">
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <Calculator className="w-5 h-5 text-indigo-400" />
        <h3 className="text-sm font-bold text-slate-100">Kredit & Taksit Kalkulyatoru</h3>
      </div>

      {/* Month Options */}
      <div>
        <label className="text-xs text-slate-400 font-medium mb-2 block">Ödəniş Müddəti:</label>
        <div className="grid grid-cols-5 gap-2">
          {[3, 6, 12, 18, 24].map((m) => (
            <button
              key={m}
              onClick={() => setMonths(m)}
              className={`py-2 rounded-xl text-xs font-semibold transition-all border ${
                months === m
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-800/80 text-slate-300 border-slate-700/60 hover:bg-slate-700'
              }`}
            >
              {m} ay
            </button>
          ))}
        </div>
      </div>

      {/* Income Input */}
      <div>
        <label className="text-xs text-slate-400 font-medium mb-1.5 block">
          Aylıq Rəsmi Gəliriniz (AZN):
        </label>
        <input
          type="number"
          value={income}
          onChange={(e) => setIncome(e.target.value)}
          placeholder="Məs: 800"
          className="w-full px-3.5 py-2 bg-slate-800/60 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
        />
      </div>

      {/* Monthly Payment Summary */}
      <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-between">
        <div>
          <span className="text-xs text-slate-400 block">Aylıq Ödəniş:</span>
          <span className="text-xl font-extrabold text-indigo-400">{monthlyPayment} AZN</span>
        </div>
        <div className="text-right">
          <span className="text-[11px] text-slate-500 block">Ümumi Yekun:</span>
          <span className="text-xs font-semibold text-slate-300">{totalAmount.toFixed(2)} AZN</span>
        </div>
      </div>

      {/* Approval Status Indicator */}
      {numIncome > 0 && (
        <div
          className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs ${
            isApproved
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
          }`}
        >
          {isApproved ? (
            <>
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Təsdiqlənmə ehtimalı yüksəkdir (Ödəniş gəlirin {dti.toFixed(0)}%-dir).</span>
            </>
          ) : (
            <>
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Ödəniş gəlirinizə nisbətdə yüksəkdir (Gəlirin {dti.toFixed(0)}%-i). Zamin tələb oluna bilər.</span>
            </>
          )}
        </div>
      )}

      <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-1">
        <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
        <span>Rəsmi tərəfdaş banklar və BOKT-lar vasitəsilə 0% ilkin ödənişlə rəsmiləşdirilmə.</span>
      </div>
    </div>
  );
}
