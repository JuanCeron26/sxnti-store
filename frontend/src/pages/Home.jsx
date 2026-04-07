// pages/Home.jsx
import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Zap, Shield, Clock, ChevronRight, Star, ArrowRight, Flame } from 'lucide-react';
import { api } from '../services/api';
import ProductCard from '../components/shop/ProductCard';
import { Button, SectionTitle, RedDivider } from '../components/ui';

// ─── HERO ────────────────────────────────────────────────────────────────────
function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const words = ['CUENTAS', 'DIAMANTES', 'SKINS'];
  const [wordIdx, setWordIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setWordIdx(i => (i + 1) % words.length), 2200);
    return () => clearInterval(t);
  }, []);

  return (
    <section ref={ref} className="relative min-h-screen flex items-center overflow-hidden bg-black">

      {/* Animated grid background */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,0,0,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,0,0,0.5) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

        {/* Radial glow */}
        <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
            style={{ 
                y, // Tu valor de movimiento
                background: 'radial-gradient(circle, rgba(139,0,0,0.3) 0%, rgba(255,0,0,0.1) 40%, transparent 70%)',
                filter: 'blur(40px)',
            }}
        />

      {/* Scanline effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-600/20 to-transparent animate-[scanline_8s_linear_infinite]" />
      </div>

      {/* Content */}
      <motion.div style={{ opacity }} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        <div className="max-w-4xl">

          {/* Tag */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-900/30 border border-red-800/50 rounded-full mb-6"
          >
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-red-400 font-mono text-xs uppercase tracking-[3px]">Free Fire Colombia</span>
          </motion.div>

          {/* Main headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="font-display text-6xl sm:text-7xl md:text-8xl xl:text-9xl text-white leading-[0.9] mb-4"
          >
            COMPRA Y<br />VENDE
          </motion.h1>

          {/* Animated word */}
          <div className="h-16 sm:h-20 md:h-24 xl:h-28 overflow-hidden mb-6">
            <AnimatePresence mode="wait">
              <motion.p
                key={wordIdx}
                initial={{ y: 60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -60, opacity: 0 }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
                className="font-display text-6xl sm:text-7xl md:text-8xl xl:text-9xl leading-[0.9]"
                style={{ WebkitTextStroke: '2px #FF0000', color: 'transparent' }}
              >
                {words[wordIdx]}
              </motion.p>
            </AnimatePresence>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-white/60 font-body text-lg max-w-xl mb-8 leading-relaxed"
          >
            La tienda más confiable de Free Fire en Colombia. Cuentas premium, paquetes de diamantes y más. Pago seguro, entrega rápida.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap gap-4"
          >
            <Link to="/tienda">
              <Button variant="primary" size="xl">
                <Zap className="w-5 h-5" fill="currentColor" />
                Ver Tienda
              </Button>
            </Link>
            <Link to="/tienda?tipo=cuenta_ff">
              <Button variant="outline" size="xl">
                Cuentas FF <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex items-center gap-8 mt-12 pt-10 border-t border-white/10"
          >
            {[
              { value: '200+', label: 'Cuentas vendidas' },
              { value: '100%', label: 'Clientes satisfechos' },
              { value: '<24h', label: 'Tiempo de entrega' },
            ].map(stat => (
              <div key={stat.label}>
                <p className="font-display text-3xl text-red-500">{stat.value}</p>
                <p className="text-white/40 font-mono text-xs uppercase tracking-wider mt-0.5">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <p className="text-white/30 font-mono text-xs uppercase tracking-widest">Scroll</p>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-px h-8 bg-gradient-to-b from-red-600/50 to-transparent"
        />
      </motion.div>
    </section>
  );
}

// ─── FEATURES ────────────────────────────────────────────────────────────────
function Features() {
  const features = [
    {
      icon: Shield,
      title: 'Compra Segura',
      desc: 'Verificamos cada transacción. Tu dinero y cuenta están protegidos.',
    },
    {
      icon: Clock,
      title: 'Entrega Rápida',
      desc: 'Una vez confirmado el pago, entregamos en menos de 24 horas.',
    },
    {
      icon: Star,
      title: 'Calidad Garantizada',
      desc: 'Todas las cuentas son verificadas antes de publicarse.',
    },
    {
      icon: Flame,
      title: 'Mejores Precios',
      desc: 'Precios competitivos y ofertas exclusivas para nuestros clientes.',
    },
  ];

  return (
    <section className="py-20 bg-[#0a0a0a] relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <SectionTitle sub="Por qué elegirnos" center>
          COMPRA CON CONFIANZA
        </SectionTitle>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white/[0.03] border border-white/10 rounded-xl p-6 hover:border-red-500/30 hover:bg-red-900/5 transition-all duration-300 group"
            >
              <div className="w-12 h-12 bg-red-900/30 border border-red-800/50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-red-900/50 group-hover:shadow-[0_0_20px_rgba(255,0,0,0.2)] transition-all duration-300">
                <f.icon className="w-5 h-5 text-red-500" />
              </div>
              <h3 className="font-display text-lg tracking-wider text-white mb-2">{f.title}</h3>
              <p className="text-white/50 text-sm font-body leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── HOME PAGE ────────────────────────────────────────────────────────────────
export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getProducts().then(p => {
      setProducts(p.slice(0, 6));
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen">
      <Hero />
      <Features />

      {/* Featured products */}
      <section className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-10">
            <SectionTitle sub="Lo más vendido">
              PRODUCTOS<br />DESTACADOS
            </SectionTitle>
            <Link to="/tienda" className="hidden md:flex items-center gap-2 text-red-400 hover:text-red-300 font-display tracking-widest uppercase text-sm transition-colors group">
              Ver todo <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white/[0.03] border border-white/5 rounded-xl aspect-[4/3] animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          )}

          <div className="flex justify-center mt-10">
            <Link to="/tienda">
              <Button variant="outline" size="lg">
                Ver todos los productos <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 relative overflow-hidden bg-[#0a0a0a]">
        <div className="absolute inset-0 bg-gradient-to-r from-red-900/20 via-transparent to-red-900/20" />
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-red-600 to-transparent" />
        <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-red-600 to-transparent" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <p className="text-red-500 font-mono text-sm uppercase tracking-[4px] mb-3">Pago fácil</p>
            <h2 className="font-display text-4xl md:text-6xl text-white mb-4">
              SIN PASARELAS<br />SIN COMPLICACIONES
            </h2>
            <p className="text-white/50 font-body mb-8 max-w-lg mx-auto">
              Nequi, Bancolombia, Zelle, Western Union — paga como prefieras, sube tu comprobante y listo.
            </p>
            <Link to="/tienda">
              <Button variant="primary" size="xl">
                <Zap className="w-5 h-5" fill="currentColor" />
                Comprar ahora
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}