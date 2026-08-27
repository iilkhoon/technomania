'use client';

import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ShieldCheck, Calendar, ArrowLeft } from '../components/HeroIconsHub';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
  const [doc, setDoc] = useState<any>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const isDark = localStorage.getItem('technomania_dark') === 'true';
    setIsDarkMode(isDark);

    fetch('/api/catalog/legal/privacy', {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    })
      .then(r => r.json())
      .then(data => {
        if (data && data.title) {
          setDoc(data);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-[#f4f5f8] text-slate-900'}`}>
      <Header isDarkMode={isDarkMode} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-500 hover:text-[#4f533b] dark:hover:text-amber-300 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Ana səhifəyə qayıt</span>
        </Link>

        <div className={`rounded-3xl p-6 sm:p-10 border shadow-sm ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="space-y-3 pb-6 border-b border-slate-200 dark:border-slate-800">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#4f533b]/10 text-[#4f533b] dark:text-amber-300 text-xs font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Hüquqi Sənəd</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              {doc?.title || 'Məxfilik Siyasəti (Privacy Policy)'}
            </h1>
            <p className="text-xs text-slate-400">
              Son yenilənmə tarixi: {doc?.updated_at ? new Date(doc.updated_at).toLocaleDateString('az-AZ') : '01 Yanvar 2026'}
            </p>
          </div>

          <div className={`pt-6 text-sm sm:text-base leading-relaxed space-y-4 ${
            isDarkMode ? 'text-slate-300' : 'text-slate-700'
          }`}>
            {doc?.content ? (
              doc.content.split('\n').map((p: string, i: number) => (
                p.trim() ? <p key={i}>{p}</p> : null
              ))
            ) : (
              <>
                <p>
                  <strong>TechnoMania</strong> olaraq müştərilərimizin şəxsi məlumatlarının məxfiliyinə və təhlükəsizliyinə yüksək həssaslıqla yanaşırıq. Bu Məxfilik Siyasəti veb saytımızdan və xidmətlərimizdən istifadə zamanı toplanan məlumatların necə qorunduğunu və emal edildiyini tənzimləyir.
                </p>
                <h3 className="text-base font-bold text-slate-900 dark:text-white pt-2">1. Toplanan Məlumatlar</h3>
                <p>
                  Sifarişlərin icrası, çatdırılma və müştəri xidmətlərinin göstərilməsi məqsədilə ad, soyad, əlaqə nömrəsi, çatdırılma ünvanı və email kimi zəruri məlumatlar toplanır.
                </p>
                <h3 className="text-base font-bold text-slate-900 dark:text-white pt-2">2. Məlumatların Təhlükəsizliyi</h3>
                <p>
                  Şəxsi məlumatlarınız heç bir halda üçüncü şəxslərə ötürülmür və 256-bit SSL şifrələmə protokolları ilə mühafizə olunur.
                </p>
                <h3 className="text-base font-bold text-slate-900 dark:text-white pt-2">3. Əlaqə</h3>
                <p>
                  Məxfilik siyasəti ilə bağlı hər hansı sualınız yaranarsa, <strong>171</strong> Qaynar Xətt və ya <strong>info@technomania.az</strong> vasitəsilə bizimlə əlaqə saxlaya bilərsiniz.
                </p>
              </>
            )}
          </div>
        </div>
      </main>

      <Footer isDarkMode={isDarkMode} />
    </div>
  );
}
