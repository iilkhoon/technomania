'use client';

import React, { useState } from 'react';
import { MapPin, CheckCircle, Clock, X, Store } from './HeroIconsHub';

interface BranchStock {
  id: string;
  name: string;
  address: string;
  hours: string;
  stockCount: number;
}

const SAMPLE_BRANCHES: BranchStock[] = [
  { id: '1', name: 'Xırdalan Filialı', address: 'Xırdalan şəh., H. Əliyev pr. 120', hours: '09:00 - 21:00', stockCount: 5 },
  { id: '2', name: '28 May Filialı', address: 'Bakı şəh., 28 May küç. 45', hours: '10:00 - 22:00', stockCount: 2 },
  { id: '3', name: 'Gənclik Filialı', address: 'Bakı şəh., Fətəli Xan Xoyski 83', hours: '10:00 - 22:00', stockCount: 0 },
  { id: '4', name: 'Sumqayıt Filialı', address: 'Sumqayıt şəh., 3-cü mkr, Sülh küç.', hours: '09:00 - 20:00', stockCount: 8 },
];

interface ClickAndCollectModalProps {
  isOpen: boolean;
  onClose: () => void;
  productTitle: string;
  onSelectBranch: (branch: BranchStock) => void;
}

export function ClickAndCollectModal({
  isOpen,
  onClose,
  productTitle,
  onSelectBranch,
}: ClickAndCollectModalProps) {
  const [selectedId, setSelectedId] = useState<string>('1');

  if (!isOpen) return null;

  const handleConfirm = () => {
    const b = SAMPLE_BRANCHES.find((item) => item.id === selectedId);
    if (b) {
      onSelectBranch(b);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <Store className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="text-sm font-bold text-slate-100">Mağazadan Təhvil Al (Click & Collect)</h3>
              <p className="text-xs text-slate-400 truncate max-w-[280px]">{productTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Branch List */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          <p className="text-xs text-slate-400">
            Məhsulu sizə ən yaxın mağazamızdan tamamilə pulsuz təhvil ala bilərsiniz:
          </p>
          {SAMPLE_BRANCHES.map((b) => {
            const isAvailable = b.stockCount > 0;
            const isSelected = selectedId === b.id;
            return (
              <div
                key={b.id}
                onClick={() => isAvailable && setSelectedId(b.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start justify-between ${
                  !isAvailable
                    ? 'bg-slate-950/40 border-slate-800/40 opacity-50 cursor-not-allowed'
                    : isSelected
                    ? 'bg-indigo-600/10 border-indigo-500 text-slate-100 shadow-md'
                    : 'bg-slate-800/40 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span className="text-sm font-bold">{b.name}</span>
                  </div>
                  <p className="text-xs text-slate-400 pl-6">{b.address}</p>
                  <div className="flex items-center gap-1.5 pl-6 text-[11px] text-slate-500">
                    <Clock className="w-3 h-3" />
                    <span>İş saatları: {b.hours}</span>
                  </div>
                </div>

                <div className="text-right shrink-0 pl-2">
                  {isAvailable ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/30">
                      <CheckCircle className="w-3 h-3" /> {b.stockCount} ədəd var
                    </span>
                  ) : (
                    <span className="inline-block px-2.5 py-1 text-[11px] font-semibold bg-rose-500/20 text-rose-400 rounded-lg border border-rose-500/30">
                      Stokda yoxdur
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
          >
            Ləğv et
          </button>
          <button
            onClick={handleConfirm}
            className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-lg shadow-indigo-600/30"
          >
            Mağazanı Seç və Təsdiqlə
          </button>
        </div>
      </div>
    </div>
  );
}
