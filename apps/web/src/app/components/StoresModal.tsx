'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, MapPin, Phone, Clock, ExternalLink, Building2, Navigation, CheckCircle2, Sparkles } from './HeroIconsHub';
import { StoreBranch, getStoreBranches, fetchStoreBranchesApi } from '../data/storesData';

interface StoresModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  isDarkMode?: boolean;
}

export default function StoresModal({
  isOpen: propIsOpen,
  onClose: propOnClose,
  isDarkMode = false,
}: StoresModalProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [stores, setStores] = useState<StoreBranch[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<string>('');

  const isModalOpen = propIsOpen !== undefined ? propIsOpen : internalIsOpen;

  const handleClose = () => {
    if (propOnClose) {
      propOnClose();
    }
    setInternalIsOpen(false);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  // Listen to global event
  useEffect(() => {
    const handleOpenModal = () => {
      setInternalIsOpen(true);
    };

    window.addEventListener('techno_open_stores_modal', handleOpenModal);
    return () => window.removeEventListener('techno_open_stores_modal', handleOpenModal);
  }, []);

  // Fetch store branches when modal is opened
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
      fetchStoreBranchesApi().then(data => {
        const activeStores = data.filter(s => s.status === 'active');
        setStores(activeStores);
        if (activeStores.length > 0 && !selectedStoreId) {
          const mainStore = activeStores.find(s => s.isMain) || activeStores[0];
          setSelectedStoreId(mainStore.id);
        }
      });
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isModalOpen]);

  if (!mounted || !isModalOpen) return null;

  const currentStore: StoreBranch = stores.find(s => s.id === selectedStoreId) || stores[0] || {
    id: 'store_default',
    name: 'TechnoMania Baş Filial',
    address: 'Bakı şəh., 28 May küç. 15 (28 Mall yaxınlığı)',
    phone: '+994 12 493 00 00',
    hours: '10:00 - 21:00 (Hər gün)',
    googleMapsUrl: 'https://maps.google.com/?q=Baku+28+May',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80',
    status: 'active',
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[999999] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        className={`rounded-3xl shadow-2xl max-w-4xl w-full flex flex-col max-h-[92vh] overflow-hidden border transition-all duration-300 relative z-10 scale-100 ${
          isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className={`p-4 sm:p-6 border-b flex items-center justify-between gap-4 flex-shrink-0 ${
          isDarkMode ? 'border-slate-800 bg-slate-900/90' : 'border-slate-100 bg-white'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#4f533b]/10 text-[#4f533b] dark:text-[#a3a886] flex items-center justify-center flex-shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight flex items-center gap-2">
                <span>Mağazalarımız Və Filiallar</span>
                <span className="text-[10px] bg-[#4f533b] text-white px-2 py-0.5 rounded-full font-bold">
                  {stores.length} Filial
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                Bütün filialların dəqiq ünvanları, əlaqə nömrələri, iş saatları və xəritədə yeri
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className={`p-2 rounded-2xl transition cursor-pointer flex-shrink-0 ${
              isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
            title="Bağla"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Column: Branch Tabs / List */}
          <div className="md:col-span-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-400 mb-2">Filial seçin:</h3>

            <div className="space-y-2">
              {stores.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-2xl">
                  Filiallar yüklənir...
                </div>
              ) : (
                stores.map(store => {
                  const isSelected = store.id === selectedStoreId;
                  return (
                    <button
                      key={store.id}
                      type="button"
                      onClick={() => setSelectedStoreId(store.id)}
                      className={`w-full text-left p-3.5 rounded-2xl border transition flex items-start gap-3 cursor-pointer ${
                        isSelected
                          ? 'border-[#4f533b] bg-[#4f533b]/10 shadow-sm ring-2 ring-[#4f533b]/20 dark:bg-stone-900'
                          : isDarkMode
                            ? 'border-slate-800 bg-slate-800/40 hover:bg-slate-800'
                            : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        isSelected ? 'bg-[#4f533b] text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}>
                        <MapPin className="w-4 h-4" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 justify-between">
                          <span className={`font-bold text-sm truncate ${isSelected ? 'text-[#4f533b] dark:text-[#a3a886]' : ''}`}>
                            {store.name}
                          </span>
                          {store.isMain && (
                            <span className="text-[9px] font-extrabold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-md flex-shrink-0">
                              Əsas
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {store.address}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Active Branch Details & Map */}
          {currentStore && (
            <div className="md:col-span-7 flex flex-col space-y-4">
              {/* Branch Image Banner */}
              <div className="h-36 sm:h-44 w-full rounded-2xl overflow-hidden relative border border-slate-200 dark:border-slate-800 shadow-xs flex-shrink-0">
                <img
                  src={currentStore.image || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80'}
                  alt={currentStore.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent flex items-end p-4">
                  <div>
                    <span className="bg-emerald-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full inline-block mb-1 shadow-xs">
                      Açıqdır • Xidmətinizdəyik
                    </span>
                    <h3 className="font-black text-lg sm:text-xl text-white">{currentStore.name}</h3>
                  </div>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className={`p-3.5 rounded-2xl border flex items-start gap-2.5 ${
                  isDarkMode ? 'bg-slate-800/60 border-slate-800' : 'bg-slate-50 border-slate-100'
                }`}>
                  <MapPin className="w-4 h-4 text-[#4f533b] dark:text-[#a3a886] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-400 block text-[11px] mb-0.5">Ünvan:</span>
                    <span className="font-semibold">{currentStore.address}</span>
                  </div>
                </div>

                <div className={`p-3.5 rounded-2xl border flex items-start gap-2.5 ${
                  isDarkMode ? 'bg-slate-800/60 border-slate-800' : 'bg-slate-50 border-slate-100'
                }`}>
                  <Phone className="w-4 h-4 text-[#4f533b] dark:text-[#a3a886] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-400 block text-[11px] mb-0.5">Əlaqə:</span>
                    <a href={`tel:${currentStore.phone}`} className="font-black text-[#4f533b] dark:text-[#a3a886] hover:underline">
                      {currentStore.phone}
                    </a>
                  </div>
                </div>

                <div className={`p-3.5 rounded-2xl border flex items-start gap-2.5 sm:col-span-2 ${
                  isDarkMode ? 'bg-slate-800/60 border-slate-800' : 'bg-slate-50 border-slate-100'
                }`}>
                  <Clock className="w-4 h-4 text-[#4f533b] dark:text-[#a3a886] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-400 block text-[11px] mb-0.5">İş saatları:</span>
                    <span className="font-black text-[#4f533b] dark:text-[#a3a886]">{currentStore.hours}</span>
                  </div>
                </div>
              </div>

              {/* Google Maps / Directions Button */}
              <a
                href={currentStore.googleMapsUrl || (currentStore as any).mapUrl || `https://maps.google.com/?q=${encodeURIComponent(currentStore.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-[#4f533b] hover:bg-[#3e4230] text-white font-bold rounded-2xl shadow-md transition flex items-center justify-center gap-2 text-xs cursor-pointer active:scale-95 flex-shrink-0"
              >
                <Navigation className="w-4 h-4" />
                <span>Google Maps-də Xəritəni və Marşrutu Aç</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-75" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
