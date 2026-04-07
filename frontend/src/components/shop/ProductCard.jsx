// components/shop/ProductCard.jsx
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShoppingCart, Eye, Zap, Star } from 'lucide-react';
import { toast } from 'sonner';
import { useCart, formatCOP } from '../../utils/context';
import { Badge } from '../ui';

export default function ProductCard({ product, index = 0 }) {
  const { addItem } = useCart();
  const img = product.imagenes?.[0]?.imagen_url || 'https://placehold.co/600x400/111/333?text=FF+STORE';
  const isDiamonds = product.tipo === 'paquete_diamantes';

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    toast.success(`¡${product.nombre} agregado!`, {
      description: formatCOP(product.precio),
      icon: isDiamonds ? '💎' : '🎮',
      style: {
        background: '#1a0000',
        border: '1px solid rgba(255,0,0,0.3)',
        color: '#fff',
      },
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
      className="group relative"
    >
      <Link to={`/producto/${product.id}`}>
        <div className="bg-[#0d0d0d] border border-white/10 rounded-xl overflow-hidden transition-all duration-300
          hover:border-red-500/40 hover:shadow-[0_8px_40px_rgba(255,0,0,0.15)] hover:-translate-y-1">

          {/* Image */}
          <div className="relative overflow-hidden aspect-[4/3] bg-black">
            <img
              src={img}
              alt={product.nombre}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />

            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

            {/* Top badges */}
            <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
              {isDiamonds ? (
                <span className="flex items-center gap-1 px-2 py-1 bg-blue-900/80 border border-blue-500/50 rounded text-xs font-mono text-blue-300 backdrop-blur-sm">
                  💎 {product.cantidad_diamantes}
                </span>
              ) : (
                <>
                  {product.rango && (
                    <span className="px-2 py-1 bg-red-900/80 border border-red-500/50 rounded text-xs font-mono text-red-300 backdrop-blur-sm uppercase">
                      {product.rango}
                    </span>
                  )}
                  {product.nivel && (
                    <span className="px-2 py-1 bg-black/70 border border-white/20 rounded text-xs font-mono text-white/70 backdrop-blur-sm">
                      Nv.{product.nivel}
                    </span>
                  )}
                </>
              )}
            </div>

            {/* Quick actions overlay */}
            <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleAddToCart}
                className="w-10 h-10 bg-red-600 hover:bg-red-500 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,0,0,0.5)] transition-colors"
              >
                <ShoppingCart className="w-4 h-4 text-white" />
              </motion.button>
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="w-10 h-10 bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-full flex items-center justify-center border border-white/20 transition-colors cursor-pointer"
              >
                <Eye className="w-4 h-4 text-white" />
              </motion.div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-body font-bold text-white text-sm leading-tight line-clamp-2 flex-1">
                {product.nombre}
              </h3>
            </div>

            {/* Stats for cuentas */}
            {!isDiamonds && (
              <div className="flex items-center gap-3 mb-3">
                <span className="flex items-center gap-1 text-xs text-white/40 font-mono">
                  👤 {product.personajes}
                </span>
                <span className="flex items-center gap-1 text-xs text-white/40 font-mono">
                  ✨ {product.skins} skins
                </span>
                <span className="flex items-center gap-1 text-xs text-white/40 font-mono">
                  💎 {product.diamantes}
                </span>
              </div>
            )}

            {/* Price + CTA */}
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="font-display text-xl text-red-400 leading-none">
                  {formatCOP(product.precio)}
                </p>
                <p className="text-white/30 text-xs font-mono mt-0.5">COP</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAddToCart}
                className="flex items-center gap-1.5 px-3 py-2 bg-red-600/20 hover:bg-red-600 border border-red-600/40 hover:border-red-500 text-red-400 hover:text-white rounded text-xs font-display tracking-wider uppercase transition-all duration-200"
              >
                <Zap className="w-3 h-3" />
                Comprar
              </motion.button>
            </div>
          </div>

          {/* Bottom neon line */}
          <div className="h-px w-0 group-hover:w-full bg-gradient-to-r from-transparent via-red-600 to-transparent transition-all duration-500" />
        </div>
      </Link>
    </motion.div>
  );
}