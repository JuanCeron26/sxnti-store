// pages/Home.jsx
import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Zap, Shield, Clock, ChevronRight, Star, ArrowRight, Flame } from 'lucide-react';
import { api } from '../services/api';
import ProductCard from '../components/shop/ProductCard';
import { Button, SectionTitle, RedDivider } from '../components/ui';

// ─── HERO ─────────────────────────────────────────────────────────────────────
function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.6], ['0px', '40px']);

  const words = ['CUENTAS', 'DIAMANTES', 'SKINS'];
  const [wordIdx, setWordIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setWordIdx(i => (i + 1) % words.length), 2400);
    return () => clearInterval(t);
  }, []);

  return (
    <section
      ref={ref}
      className="relative min-h-screen flex items-center overflow-hidden bg-black"
    >
      {/* Grid background — parallax */}
      <motion.div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          y: bgY,
          backgroundImage:
            'linear-gradient(rgba(255,0,0,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,0,0,0.6) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Red radial glow center */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full pointer-events-none"
        style={{
          background:
            'radial-gradient(circle, rgba(120,0,0,0.35) 0%, rgba(255,0,0,0.08) 45%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      {/* Scanline */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-600/25 to-transparent animate-[scanline_10s_linear_infinite]" />
      </div>

      {/* Content — padding-top para compensar el navbar fijo (h-20 = 80px) */}
      <motion.div
        style={{ opacity: contentOpacity, y: contentY }}
        className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-8 pt-32 pb-20"
      >
        <div className="max-w-4xl">

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2.5 px-4 py-2 bg-red-900/25 border border-red-800/40 rounded-full mb-8"
          >
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse flex-shrink-0" />
            <span className="text-red-400 font-mono text-xs uppercase tracking-[3px]">
              Free Fire Colombia
            </span>
          </motion.div>

          {/* Headline estático */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.6 }}
            className="font-display text-[clamp(3.5rem,10vw,7rem)] text-white leading-[0.92] mb-4"
          >
            COMPRA Y<br />VENDE
          </motion.h1>

          {/* Palabra animada — altura fija para evitar saltos de layout */}
          <div className="h-[clamp(3rem,9vw,6.5rem)] overflow-hidden mb-8">
            <AnimatePresence mode="wait">
              <motion.span
                key={wordIdx}
                initial={{ y: '100%', opacity: 0 }}
                animate={{ y: '0%', opacity: 1 }}
                exit={{ y: '-100%', opacity: 0 }}
                transition={{ duration: 0.38, ease: [0.4, 0, 0.2, 1] }}
                className="block font-display text-[clamp(3rem,9vw,6.5rem)] leading-[0.92]"
                style={{ WebkitTextStroke: '2px #FF0000', color: 'transparent' }}
              >
                {words[wordIdx]}
              </motion.span>
            </AnimatePresence>
          </div>

          {/* Descripción */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.5 }}
            className="text-white/55 font-body text-lg max-w-lg mb-10 leading-relaxed"
          >
            La tienda más confiable de Free Fire en Colombia. Cuentas premium,
            paquetes de diamantes y más. Pago seguro, entrega rápida.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.5 }}
            className="flex flex-wrap gap-4"
          >
            <Link to="/tienda">
              <Button variant="primary" size="xl">
                <Zap className="w-5 h-5 flex-shrink-0" fill="currentColor" />
                Ver Tienda
              </Button>
            </Link>
            <Link to="/tienda?tipo=cuenta_ff">
              <Button variant="outline" size="xl">
              {/* Envolvemos el contenido para forzar el espacio interno */}
                <span className="px-6 flex items-center gap-2" style={{paddingLeft: '20px'}}> 
                  Cuentas FF
                <ArrowRight className="w-4 h-4 flex-shrink-0" />
                </span>
              </Button>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.85 }}
            className="flex flex-wrap items-center gap-10 mt-16 pt-10 border-t border-white/10"
          >
            {[
              { value: '200+', label: 'Cuentas vendidas' },
              { value: '100%', label: 'Clientes satisfechos' },
              { value: '<24h', label: 'Tiempo de entrega' },
            ].map(stat => (
              <div key={stat.label}>
                <p className="font-display text-3xl text-red-500 leading-none">
                  {stat.value}
                </p>
                <p className="text-white/40 font-mono text-xs uppercase tracking-wider mt-1.5">
                  {stat.label}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <p className="text-white/25 font-mono text-[10px] uppercase tracking-[4px]">Scroll</p>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          className="w-px h-8 bg-gradient-to-b from-red-600/50 to-transparent"
        />
      </motion.div>
    </section>
  );
}

// ─── FEATURES ─────────────────────────────────────────────────────────────────
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
    <section className="py-24 bg-[#080808] relative overflow-hidden">
      {/* Subtle top/bottom fades */}
      <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <SectionTitle sub="Por qué elegirnos" center>
          COMPRA CON CONFIANZA
        </SectionTitle>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-10" style={{ marginTop: '20px'}}>
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="bg-white/[0.03] border border-white/10 rounded-xl p-7
                hover:border-red-500/30 hover:bg-red-950/10
                transition-all duration-300 group"
            >
              <div
                className="w-12 h-12 bg-red-900/30 border border-red-800/50 rounded-lg
                  flex items-center justify-center mb-5
                  group-hover:bg-red-900/50 group-hover:shadow-[0_0_20px_rgba(255,0,0,0.18)]
                  transition-all duration-300"
              >
                <f.icon className="w-5 h-5 text-red-500" />
              </div>
              <h3 className="font-display text-xl tracking-wider text-white mb-3">
                {f.title}
              </h3>
              <p className="text-white/50 text-sm font-body leading-relaxed">
                {f.desc}
              </p>
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

      {/* ── Productos destacados ── */}
      <section className="py-42 bg-black relative z-20 my-10" style={{ paddingTop: '20px', paddingBottom: '20px', marginTop: '30px', marginBottom: '30px' }}> {/* Aumenté el padding vertical de py-24 a py-32 */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

    {/* Section header corregido para estar centrado */}
    <div className="flex flex-col items-center text-center mb-20 mt-[10px]" style={{ marginBottom: '20px'}}> {/* Cambiado a flex-col e items-center */}
      <SectionTitle sub="Lo más vendido" center> {/* Añadido el prop 'center' si tu componente lo soporta */}
        PRODUCTOS DESTACADOS
      </SectionTitle>
      
      <Link
        to="/tienda"
        className="mt-6 flex items-center gap-2 text-red-400 hover:text-red-300
          font-display tracking-widest uppercase text-sm transition-colors group"
      >
        Ver todo
        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>

    {/* Grid */}
    {loading ? (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"> {/* Aumenté el gap a 8 */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-white/[0.03] border border-white/5 rounded-xl aspect-[4/3] animate-pulse"
          />
        ))}
      </div>
    ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"> {/* Aumenté el gap a 8 */}
        {products.map((p, i) => (
          <ProductCard key={p.id} product={p} index={i} />
        ))}
      </div>
    )}

    {/* CTA Final */}
    <div className="flex justify-center mt-16" style={{marginTop: '15px'}}>
      <Link to="/tienda">
        <Button variant="outline" size="lg">
          Ver todos los productos
          <ArrowRight className="w-4 h-4 flex-shrink-0" />
        </Button>
      </Link>
    </div>
  </div>
      </section>

      {/* ── Banner CTA ── */}
      <section className="py-20 relative overflow-hidden bg-[#080808] flex justify-center">
        {/* Side accent lines */}
        <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-red-600 to-transparent" />
        <div className="absolute right-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-red-600 to-transparent" />
        {/* Radial bg */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(139,0,0,0.12) 0%, transparent 70%)',
          }}
        />

        <div className="max-w-3xl mx-auto px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-red-500 font-mono text-sm uppercase tracking-[5px] mb-4">
              Pago fácil
            </p>
            <h2 className="font-display text-[clamp(2.5rem,7vw,5rem)] text-white leading-tight mb-5">
              SIN PASARELAS<br />SIN COMPLICACIONES
            </h2>
            <p className="text-white/50 font-body text-lg mb-10 max-w-lg mx-auto leading-relaxed">
              Nequi, Bancolombia, Zelle, Western Union — paga como prefieras,
              sube tu comprobante y listo.
            </p>
            <Link to="/tienda">
              <Button variant="primary" size="xl">
                <Zap className="w-5 h-5 flex-shrink-0" fill="currentColor" />
                Comprar ahora
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}