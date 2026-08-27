import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product, CartItem } from '../types';
import { useToast } from './ToastContext';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, selectedColor?: string, selectedStorage?: string) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalAmount: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType>({
  cart: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  totalAmount: 0,
  itemCount: 0,
});

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const { showToast } = useToast();

  useEffect(() => {
    AsyncStorage.getItem('technomania_cart').then(saved => {
      if (saved) {
        try { setCart(JSON.parse(saved)); } catch (e) {}
      }
    });
  }, []);

  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    AsyncStorage.setItem('technomania_cart', JSON.stringify(newCart));
  };

  const addToCart = (product: Product, quantity = 1, selectedColor?: string, selectedStorage?: string) => {
    setCart(prev => {
      const existingIdx = prev.findIndex(item => item.product.id === product.id);
      let updated: CartItem[];
      if (existingIdx > -1) {
        updated = [...prev];
        updated[existingIdx].quantity += quantity;
      } else {
        updated = [...prev, { product, quantity, selectedColor, selectedStorage }];
      }
      saveCart(updated);
      return updated;
    });

    const prodName = product.model_name || product.name || 'Məhsul';
    showToast(`"${prodName}" səbətə əlavə edildi! 🛍️`, 'cart');
  };

  const removeFromCart = (productId: string) => {
    const updated = cart.filter(item => item.product.id !== productId);
    saveCart(updated);
    showToast('Məhsul səbətdən silindi', 'info');
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    const updated = cart.map(item =>
      item.product.id === productId ? { ...item, quantity } : item
    );
    saveCart(updated);
  };

  const clearCart = () => {
    saveCart([]);
    showToast('Səbət təmizləndi', 'info');
  };

  const totalAmount = cart.reduce((sum, item) => {
    const price = typeof item.product.cash_price === 'number'
      ? item.product.cash_price
      : parseFloat(String(item.product.cash_price).replace(/[^\d.]/g, '')) || 0;
    return sum + price * item.quantity;
  }, 0);

  const itemCount = cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      totalAmount,
      itemCount,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
