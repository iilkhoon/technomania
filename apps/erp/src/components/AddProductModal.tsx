'use client';

import React from 'react';
import { X, Package } from './HeroIconsHub';
import ProductForm from './ProductForm';
import { Product } from '../types';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
  onSuccess: () => void;
}

export default function AddProductModal({
  isOpen,
  onClose,
  productToEdit,
  onSuccess
}: AddProductModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white border border-slate-200 text-slate-900 rounded-2xl sm:rounded-3xl max-w-5xl w-full max-h-[95vh] overflow-y-auto shadow-2xl p-4 sm:p-6 md:p-8 relative my-auto animate-fadeIn"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#f4f5f0] text-[#4f533b] border border-[#4f533b]/20 flex items-center justify-center font-bold">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                {productToEdit ? 'Məhsulu Redaktə Et' : 'Yeni Məhsul Əlavə Et'}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Məhsul adı, kateqoriya, qiymət və kampaniyanı daxil edərək yadda saxlayın
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition cursor-pointer border border-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Embedded Form */}
        <ProductForm
          initialProduct={productToEdit || undefined}
          isEditMode={!!productToEdit}
          isModal={true}
          onSuccess={() => {
            onSuccess();
            onClose();
          }}
          onCancel={onClose}
        />
      </div>
    </div>
  );
}
