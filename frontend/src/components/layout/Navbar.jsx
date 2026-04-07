// components/layout/Navbar.jsx
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Menu, X, Zap, Shield } from 'lucide-react';
import { useCart } from '../../utils/context';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { count, setIsOpen } = useCart();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setMobileOpen(false), [location]);

  const links = [
    { to: '/', label: 'Inicio' },
    { to: '/tienda', label: 'Tienda' },
    { to: '/tienda?tipo=cuenta_ff', label: 'Cuentas FF' },
    { to: '/tienda?tipo=paquete_diamantes', label: 'Diamantes' },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-black/95 backdrop-blur-xl border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.8)]' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 md:h-20">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="relative">
                <Zap className="w-6 h-6 text-red-500 group-hover:text-red-400 transition-colors" fill="currentColor" />
                <div className="absolute inset-0 blur-sm bg-red-500/50 group-hover:bg-red-400/70 transition-all rounded" />
              </div>
              <span className="font-display text-2xl text-white tracking-widest group-hover:text-red-400 transition-colors">
                SXNTI<span className="text-red-500">STORE</span>
              </span>
            </Link>

            {/* Desktop links */}
            <div className="hidden md:flex items-center gap-1">
              {links.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-4 py-2 font-body font-semibold text-sm uppercase tracking-widest transition-all duration-200 rounded relative group
                    ${location.pathname === link.to.split('?')[0] ? 'text-red-400' : 'text-white/70 hover:text-white'}`}
                >
                  {link.label}
                  <span className={`absolute bottom-0 left-0 h-px bg-red-500 transition-all duration-300
                    ${location.pathname === link.to.split('?')[0] ? 'w-full' : 'w-0 group-hover:w-full'}`} />
                </Link>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {/* Cart */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(true)}
                className="relative flex items-center gap-2 bg-white/5 hover:bg-red-600/20 border border-white/10 hover:border-red-500/50 rounded px-3 py-2 transition-all duration-200"
              >
                <ShoppingCart className="w-4 h-4 text-white/80" />
                <span className="text-sm font-body font-semibold text-white/80 hidden sm:inline">Carrito</span>
                <AnimatePresence>
                  {count > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-red-600 text-white text-xs font-mono rounded-full flex items-center justify-center shadow-[0_0_8px_rgba(255,0,0,0.6)]"
                    >
                      {count}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* Admin */}
              <Link
                to="/admin"
                className="hidden md:flex items-center gap-1.5 text-white/40 hover:text-red-400 transition-colors p-2"
                title="Panel Admin"
              >
                <Shield className="w-4 h-4" />
              </Link>

              {/* Mobile menu */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 text-white/70 hover:text-white transition-colors"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-black/98 border-t border-white/10 overflow-hidden"
            >
              <div className="px-4 py-4 flex flex-col gap-1">
                {links.map((link, i) => (
                  <motion.div
                    key={link.to}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link
                      to={link.to}
                      className="block px-4 py-3 font-display text-lg tracking-widest text-white/80 hover:text-red-400 hover:bg-red-600/10 rounded transition-all duration-200 border-l-2 border-transparent hover:border-red-600"
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
                <div className="pt-2 border-t border-white/10 mt-2">
                  <Link to="/admin" className="flex items-center gap-2 px-4 py-3 text-white/40 hover:text-red-400 transition-colors">
                    <Shield className="w-4 h-4" />
                    <span className="font-body font-semibold text-sm uppercase tracking-wider">Admin</span>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
}