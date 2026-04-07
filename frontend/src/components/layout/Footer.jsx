// components/layout/Footer.jsx
import { Link } from 'react-router-dom';
import { Zap, MessageCircle, Shield } from 'lucide-react';
import { FaInstagram, FaYoutube } from 'react-icons/fa';
import { SiWhatsapp } from 'react-icons/si';
import { RedDivider } from '../ui';

export default function Footer() {
  return (
    <footer className="bg-black border-t border-white/10 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-red-600/5 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-red-500" fill="currentColor" />
              <span className="font-display text-2xl tracking-widest">SXNTI<span className="text-red-500">STORE</span></span>
            </div>
            <p className="text-white/50 text-sm font-body leading-relaxed">
              Tu tienda de confianza para cuentas y diamantes de Free Fire. Entregas rápidas, precios justos.
            </p>
            <div className="flex items-center gap-3 mt-5">
              {[
                { icon: FaInstagram, href: '#', label: 'Instagram' },
                { icon: SiWhatsapp, href: '#', label: 'WhatsApp' },
                { icon: FaYoutube, href: '#', label: 'YouTube' },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 flex items-center justify-center bg-white/5 border border-white/10 rounded hover:bg-red-600/20 hover:border-red-500/50 hover:text-red-400 text-white/60 transition-all duration-200"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-display text-lg tracking-widest mb-4 text-white/90">TIENDA</h4>
            <ul className="space-y-2">
              {[
                { to: '/tienda', label: 'Todos los productos' },
                { to: '/tienda?tipo=cuenta_ff', label: 'Cuentas Free Fire' },
                { to: '/tienda?tipo=paquete_diamantes', label: 'Paquetes de Diamantes' },
              ].map(link => (
                <li key={link.to}>
                  <Link to={link.to} className="text-white/50 hover:text-red-400 text-sm font-body transition-colors duration-200 flex items-center gap-1.5 group">
                    <span className="w-1 h-1 bg-red-600/50 rounded-full group-hover:bg-red-500 transition-colors" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Métodos de pago */}
          <div>
            <h4 className="font-display text-lg tracking-widest mb-4 text-white/90">MÉTODOS DE PAGO</h4>
            <div className="flex flex-wrap gap-2">
              {['Nequi', 'Bancolombia', 'Western Union', 'Zelle', 'Faviola', 'Remetly'].map(m => (
                <span key={m} className="px-3 py-1 bg-white/5 border border-white/10 rounded text-xs font-mono text-white/50 uppercase tracking-wider">
                  {m}
                </span>
              ))}
            </div>
            <p className="text-white/30 text-xs font-mono mt-4">
              ⚡ Entregas en menos de 24 horas
            </p>
          </div>
        </div>

        <RedDivider />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 text-white/30 text-xs font-mono">
          <p>© 2025 SXNTI STORE — Todos los derechos reservados</p>
          <Link to="/admin" className="flex items-center gap-1.5 hover:text-red-400/50 transition-colors">
            <Shield className="w-3 h-3" /> Panel Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}

