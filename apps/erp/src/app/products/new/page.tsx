'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Package } from '../../../components/HeroIconsHub';
import ProductForm from '../../../components/ProductForm';

export default function NewProductPage() {
  return (
    <div className="space-y-6 text-slate-900 max-w-7xl mx-auto pb-12">
      {/* Header Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href="/products"
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer border border-slate-200"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Package className="w-5 h-5 text-[#4f533b]" /> Yeni Məhsul Əlavə Et
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Məhsul adı, kateqoriya, qiymət və kampaniyanı daxil edərək bazaya əlavə edin
            </p>
          </div>
        </div>
      </div>

      {/* Form Container */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
        <ProductForm isEditMode={false} />
      </div>
    </div>
  );
}
