import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product } from '../types';

interface WishlistContextType {
  favorites: string[];
  toggleFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  comparedProducts: string[];
  toggleCompare: (productId: string) => void;
  removeFromCompare: (productId: string) => void;
  clearCompare: () => void;
  isCompared: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType>({
  favorites: [],
  toggleFavorite: () => {},
  isFavorite: () => false,
  comparedProducts: [],
  toggleCompare: () => {},
  removeFromCompare: () => {},
  clearCompare: () => {},
  isCompared: () => false,
});

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [comparedProducts, setComparedProducts] = useState<string[]>([]);

  useEffect(() => {
    AsyncStorage.getItem('technomania_favorites').then(saved => {
      if (saved) {
        try { setFavorites(JSON.parse(saved)); } catch (e) {}
      }
    });
    AsyncStorage.getItem('technomania_compared').then(saved => {
      if (saved) {
        try { setComparedProducts(JSON.parse(saved)); } catch (e) {}
      }
    });
  }, []);

  const toggleFavorite = (productId: string) => {
    setFavorites(prev => {
      const updated = prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId];
      AsyncStorage.setItem('technomania_favorites', JSON.stringify(updated));
      return updated;
    });
  };

  const isFavorite = (productId: string) => favorites.includes(productId);

  const toggleCompare = (productId: string) => {
    setComparedProducts(prev => {
      const updated = prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId];
      AsyncStorage.setItem('technomania_compared', JSON.stringify(updated));
      return updated;
    });
  };

  const removeFromCompare = (productId: string) => {
    setComparedProducts(prev => {
      const updated = prev.filter(id => id !== productId);
      AsyncStorage.setItem('technomania_compared', JSON.stringify(updated));
      return updated;
    });
  };

  const clearCompare = () => {
    setComparedProducts([]);
    AsyncStorage.removeItem('technomania_compared');
  };

  const isCompared = (productId: string) => comparedProducts.includes(productId);

  return (
    <WishlistContext.Provider value={{
      favorites,
      toggleFavorite,
      isFavorite,
      comparedProducts,
      toggleCompare,
      removeFromCompare,
      clearCompare,
      isCompared,
    }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
