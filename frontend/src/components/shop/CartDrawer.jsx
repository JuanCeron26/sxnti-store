// components/shop/CartDrawer.jsx
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart, formatCOP } from '../../utils/context';
import { Button } from '../ui';

export default function CartDrawer() {
  const { items, removeItem, total, count, isOpen, setIsOpen } = useCart();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-sm bg-[#0a0a0a] border-l border-white/10 z-50 flex flex-col shadow-[-8px_0_40px_rgba(0,0,0,0.8)]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-red-500" />
                <h2 className="font-display text-xl tracking-widest">CARRITO</h2>
                {count > 0 && (
                  <span className="w-5 h-5 bg-red-600 text-white text-xs font-mono rounded-full flex items-center justify-center">
                    {count}
                  </span>
                )}
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                  <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center">
                    <ShoppingCart className="w-7 h-7 text-white/20" />
                  </div>
                  <p className="text-white/40 font-body">Tu carrito está vacío</p>
                  <Button variant="outline" size="sm" onClick={() => setIsOpen(false)}>
                    Ver productos
                  </Button>
                </div>
              ) : (
                <AnimatePresence>
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex gap-3 bg-white/[0.03] border border-white/10 rounded-lg p-3 group"
                    >
                      <img
                        src={item.imagenes?.[0]?.imagen_url}
                        alt={item.nombre}
                        className="w-16 h-16 object-cover rounded flex-shrink-0 bg-black/40"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-body font-semibold text-sm text-white truncate">{item.nombre}</p>
                        <p className="text-xs text-white/40 font-mono mt-0.5 uppercase tracking-wider">
                          {item.tipo === 'cuenta_ff' ? '🎮 Cuenta FF' : `💎 ${item.cantidad_diamantes} Diamantes`}
                        </p>
                        <p className="text-red-400 font-display text-base mt-1">{formatCOP(item.precio)}</p>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-1.5 cursor-pointer text-white/20 hover:text-red-400 hover:bg-red-900/20 rounded transition-all opacity-0 group-hover:opacity-100 flex items-center justify-center" style={{ width: '50px'}}
                      >
                        <Trash2 className="w-6 h-3.5" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="px-6 py-5 border-t border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-white/60 font-body font-semibold uppercase tracking-wider text-sm">Total</span>
                  <span className="font-display text-2xl text-white">{formatCOP(total)}</span>
                </div>
                <Link to="/checkout" onClick={() => setIsOpen(false)}>
                  <Button variant="primary" size="lg" className="w-full">
                    Proceder al pago <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <p className="text-center text-white/30 text-xs font-mono">
                  ⚡ Entrega inmediata tras verificar el pago
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}