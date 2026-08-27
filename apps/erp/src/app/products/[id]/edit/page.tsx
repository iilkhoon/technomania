'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Package, Sparkles } from '../../../../components/HeroIconsHub';
import ProductForm from '../../../../components/ProductForm';
import { Product } from '../../../../types';
import { getLocalProducts, fetchApiProducts } from '../../../../lib/supabase';

export default function EditProductPage() {
  const params = useParams();
  const id = params?.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!id) {
        setLoading(false);
        return;
      }
      try {
        const apiProds = await fetchApiProducts();
        let found = apiProds.find(p => p.id === id);
        if (!found) {
          const all = getLocalProducts();
          found = all.find(p => p.id === id);
        }
        if (found) setProduct(found);
      } catch (e) {
        const all = getLocalProducts();
        const found = all.find(p => p.id === id);
        if (found) setProduct(found);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="p-16 text-center text-slate-500 font-bold text-sm bg-white border border-slate-200 rounded-2xl max-w-7xl mx-auto shadow-xs space-y-3">
        <div className="w-8 h-8 border-3 border-[#4f533b] border-t-transparent rounded-full animate-spin mx-auto" />
        <p>Məhsul məlumatları bazadan oxunur...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-12 text-center text-rose-600 font-bold text-sm bg-rose-50 border border-rose-200 rounded-2xl max-w-7xl mx-auto shadow-xs space-y-4">
        <p>❌ Məhsul tapılmadı və ya silinib!</p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-rose-300 text-rose-700 text-xs font-bold hover:bg-rose-100 transition shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" /> Məhsullar siyahısına qayıt
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-slate-900 max-w-7xl mx-auto pb-12">
      {/* Header Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href="/products"
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer border border-slate-200 flex-shrink-0"
            title="Məhsullar siyahısına qayıt"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Package className="w-5 h-5 text-[#4f533b]" /> Məhsulu Redaktə Et
              </h2>
              <span className="text-xs bg-[#f4f5f0] text-[#4f533b] border border-[#4f533b]/20 px-2.5 py-0.5 rounded-full font-bold">
                ID: {product.id}
              </span>
              {product.brand && (
                <span className="text-xs bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-0.5 rounded-full font-bold">
                  {product.brand}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5 truncate max-w-2xl">
              {product.name || product.model_name}
            </p>
          </div>
        </div>
      </div>

      {/* Form Container */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
        <ProductForm initialProduct={product} isEditMode={true} />
      </div>
    </div>
  );
}
