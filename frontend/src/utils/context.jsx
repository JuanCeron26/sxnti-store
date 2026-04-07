// utils/context.jsx
import { createContext, useContext, useState, useEffect } from 'react';

// ─── AUTH ────────────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('sxnti_token'));
  const [isAdmin, setIsAdmin] = useState(() => !!localStorage.getItem('sxnti_token'));

  const login = (tk) => {
    localStorage.setItem('sxnti_token', tk);
    setToken(tk);
    setIsAdmin(true);
  };

  const logout = () => {
    localStorage.removeItem('sxnti_token');
    setToken(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ token, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

// ─── CART ────────────────────────────────────────────────────────────────────
const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const addItem = (product) => {
    setItems(prev => {
      const exists = prev.find(i => i.id === product.id);
      if (exists) return prev;
      return [...prev, { ...product, qty: 1 }];
    });
    setIsOpen(true);
  };

  const removeItem = (id) => setItems(prev => prev.filter(i => i.id !== id));
  const clearCart = () => setItems([]);
  const total = items.reduce((acc, i) => acc + i.precio * i.qty, 0);
  const count = items.length;

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clearCart, total, count, isOpen, setIsOpen }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);

// ─── FORMAT ──────────────────────────────────────────────────────────────────
export const formatCOP = (n) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n);