// pages/ProductoDetalle.jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ShoppingCart, Zap, Shield, Clock, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { api, mockMetodosPago } from '../services/api';
import { useCart, formatCOP } from '../utils/context';
import { Button, Badge, GlassCard, Spinner } from '../components/ui';

export default function ProductoDetalle() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imgIdx, setImgIdx] = useState(0);
  const { addItem } = useCart();

  useEffect(() => {
    api.getProduct(id).then(p => {
      setProduct(p);
      setLoading(false);
    });
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  );

  if (!product) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
      <p className="text-white/40 font-body text-xl">Producto no encontrado</p>
      <Link to="/tienda"><Button variant="outline">Volver a la tienda</Button></Link>
    </div>
  );

  const isDiamonds = product.tipo === 'paquete_diamantes';
  const imgs = product.imagenes || [];

  const handleComprar = () => {
    addItem(product);
    toast.success('¡Agregado al carrito!', {
      description: `${product.nombre} — ${formatCOP(product.precio)}`,
      icon: isDiamonds ? '💎' : '🎮',
      style: { background: '#1a0000', border: '1px solid rgba(255,0,0,0.3)', color: '#fff' },
    });
  };

  return (
    <div className="min-h-screen bg-black pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-white/40 font-mono text-xs uppercase tracking-wider mb-8">
          <Link to="/" className="hover:text-white transition-colors">Inicio</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/tienda" className="hover:text-white transition-colors">Tienda</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-white/70 truncate max-w-[200px]">{product.nombre}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* Images */}
          <div>
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative aspect-[4/3] bg-black/60 border border-white/10 rounded-xl overflow-hidden"
            >
              <img
                src={imgs[imgIdx]?.imagen_url || 'https://placehold.co/600x400/111/333?text=FF'}
                alt={product.nombre}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />

              {isDiamonds && (
                <div className="absolute top-4 right-4 bg-blue-900/80 border border-blue-500/50 rounded-lg px-4 py-2 backdrop-blur-sm">
                  <p className="font-display text-2xl text-blue-300">💎 {product.cantidad_diamantes}</p>
                  <p className="text-blue-400/70 font-mono text-xs">DIAMANTES</p>
                </div>
              )}
            </motion.div>

            {imgs.length > 1 && (
              <div className="flex gap-2 mt-3">
                {imgs.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setImgIdx(i)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      imgIdx === i ? 'border-red-500' : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    <img src={img.imagen_url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col gap-5"
          >
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Badge variant={isDiamonds ? 'blue' : 'red'}>
                  {isDiamonds ? '💎 Diamantes' : '🎮 Cuenta FF'}
                </Badge>
                {!isDiamonds && product.rango && <Badge variant="default">{product.rango}</Badge>}
                {!product.vendida && <Badge variant="green">Disponible</Badge>}
              </div>
              <h1 className="font-display text-4xl md:text-5xl text-white leading-tight">{product.nombre}</h1>
            </div>

            <p className="text-white/60 font-body leading-relaxed">{product.descripcion}</p>

            {/* Stats grid for cuentas */}
            {!isDiamonds && (
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Nivel', value: product.nivel, icon: '⭐' },
                  { label: 'Personajes', value: product.personajes, icon: '👤' },
                  { label: 'Skins', value: product.skins, icon: '✨' },
                  { label: 'Diamantes', value: product.diamantes?.toLocaleString(), icon: '💎' },
                  { label: 'Rango', value: product.rango, icon: '🏆' },
                ].filter(s => s.value).map(stat => (
                  <div key={stat.label} className="bg-white/[0.03] border border-white/10 rounded-lg p-3 text-center">
                    <p className="text-lg mb-0.5">{stat.icon}</p>
                    <p className="font-display text-xl text-white">{stat.value}</p>
                    <p className="text-white/40 font-mono text-xs uppercase tracking-wider">{stat.label}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Price */}
            <div className="flex items-end gap-3 py-4 border-y border-white/10">
              <p className="font-display text-5xl text-red-400">{formatCOP(product.precio)}</p>
              <p className="text-white/40 font-mono text-sm mb-2">COP</p>
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="primary" size="lg" onClick={handleComprar} className="flex-1">
                <ShoppingCart className="w-4 h-4" /> Agregar al carrito
              </Button>
              <Link to="/checkout" className="flex-1">
                <Button variant="outline" size="lg" className="w-full" onClick={handleComprar}>
                  <Zap className="w-4 h-4" fill="currentColor" /> Comprar ya
                </Button>
              </Link>
            </div>

            {/* Trust signals */}
            <div className="flex flex-col gap-2">
              {[
                { icon: Shield, text: 'Cuenta verificada y garantizada' },
                { icon: Clock, text: 'Entrega en menos de 24 horas' },
                { icon: Zap, text: 'Soporte directo por WhatsApp' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-white/40 text-sm font-body">
                  <Icon className="w-3.5 h-3.5 text-red-600/70" />
                  {text}
                </div>
              ))}
            </div>

            {/* Payment methods */}
            <GlassCard className="p-4">
              <p className="text-white/50 font-mono text-xs uppercase tracking-wider mb-3">Métodos de pago aceptados</p>
              <div className="flex flex-wrap gap-2">
                {mockMetodosPago.filter(m => m.activo).map(m => (
                  <span key={m.id} className="flex items-center gap-1 px-3 py-1 bg-white/5 border border-white/10 rounded text-xs font-mono text-white/50 uppercase">
                    {m.icon} {m.nombre}
                  </span>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </div>
  );
}