'use client';

import React, { useState } from 'react';
import { QrCode, Scan, CheckCircle, X, Search } from './HeroIconsHub';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanResult: (barcode: string) => void;
}

export function BarcodeScannerModal({
  isOpen,
  onClose,
  onScanResult,
}: BarcodeScannerModalProps) {
  const [manualCode, setManualCode] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  if (!isOpen) return null;

  const handleSimulateScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      const simulatedBarcode = '8690123456789';
      setIsScanning(false);
      onScanResult(simulatingBarcode(simulatedBarcode));
      onClose();
    }, 1200);
  };

  const simulatingBarcode = (code: string) => code;

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      onScanResult(manualCode.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-100">Ştrix-kod və QR Skaner</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder simulation */}
        <div className="p-6 text-center space-y-4">
          <div className="relative w-48 h-48 mx-auto border-2 border-dashed border-indigo-500/60 rounded-2xl bg-slate-950/80 flex flex-col items-center justify-center overflow-hidden">
            {isScanning ? (
              <div className="space-y-2">
                <Scan className="w-12 h-12 text-indigo-400 animate-pulse mx-auto" />
                <span className="text-xs text-indigo-300 font-semibold block">Skan olunur...</span>
              </div>
            ) : (
              <div className="space-y-2">
                <QrCode className="w-12 h-12 text-slate-600 mx-auto" />
                <span className="text-xs text-slate-400 block">Kameraya ştrix-kodu tutun</span>
              </div>
            )}
            <div className="absolute inset-x-0 top-1/2 border-b border-indigo-500/80 animate-ping opacity-30" />
          </div>

          <button
            onClick={handleSimulateScan}
            disabled={isScanning}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2"
          >
            <Scan className="w-4 h-4" />
            <span>Kamera ilə Skan et (Simulyasiya)</span>
          </button>

          {/* Manual Code Input */}
          <div className="pt-2 border-t border-slate-800">
            <form onSubmit={handleManualSubmit} className="flex gap-2">
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="Və ya kodi daxil edin..."
                className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700"
              >
                Daxil et
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
