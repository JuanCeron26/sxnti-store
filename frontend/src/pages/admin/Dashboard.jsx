// pages/admin/Dashboard.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Package, ShoppingBag, CreditCard,
  LogOut, Menu, X, Zap, Shield, ChevronRight,
  TrendingUp, Clock, CheckCircle, AlertCircle
} from 'lucide-react';
import { useAuth, formatCOP } from '../../utils/context';
import { api } from '../../services/api';
import { GlassCard, Badge } from '../../components/ui';
import { toast } from 'sonner';

const NAV = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/productos', icon: Package, label: 'Productos' },
  { to: '/admin/ordenes', icon: ShoppingBag, label: 'Órdenes' },
  { to: '/admin/metodos-pago', icon: CreditCard, label: 'Métodos Pago' },
];

function AdminSidebar({ mobile, onClose }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/admin');
    toast.success('Sesión cerrada');
  };

  return (
    <div className={`${mobile ? 'w-full' : 'w-60'} bg-[#0a0a0a] border-r border-white/10 flex flex-col h-full`}>
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-red-500" fill="currentColor" />
          <span className="font-display text-lg tracking-widest">SXNTI<span className="text-red-500">ADMIN</span></span>
        </div>
        {mobile && (
          <button onClick={onClose} className="text-white/50 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {NAV.map(({ to, icon: Icon, label }) => {
          const active = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              onClick={mobile ? onClose : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-body font-semibold text-sm uppercase tracking-wider transition-all duration-200
                ${active
                  ? 'bg-red-600/20 text-red-400 border border-red-600/30'
                  : 'text-white/50 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
            >
              <Icon className={`w-4 h-4 ${active ? 'text-red-500' : ''}`} />
              {label}
              {active && <ChevronRight className="w-3 h-3 ml-auto text-red-500/50" />}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-white/10">
        <Link to="/" className="flex items-center gap-3 px-3 py-2 text-white/30 hover:text-white/60 text-xs font-mono uppercase tracking-wider transition-colors mb-1">
          Ver tienda
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-white/40 hover:text-red-400 hover:bg-red-900/20 rounded-lg font-body font-semibold text-sm uppercase tracking-wider transition-all"
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}

// ─── DASHBOARD HOME ───────────────────────────────────────────────────────────
export function DashboardHome() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    api.getOrders().then(setOrders);
  }, []);

  const stats = [
    { label: 'Órdenes totales', value: orders.length, icon: ShoppingBag, color: 'text-blue-400' },
    { label: 'Pendientes', value: orders.filter(o => o.estado === 'pendiente').length, icon: Clock, color: 'text-yellow-400' },
    { label: 'Aprobadas', value: orders.filter(o => o.estado === 'aprobada').length, icon: CheckCircle, color: 'text-green-400' },
    { label: 'Ingresos aprox.', value: formatCOP(orders.reduce((a, o) => a + o.precio, 0)), icon: TrendingUp, color: 'text-red-400', wide: true },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <p className="text-white/40 font-mono text-xs uppercase tracking-wider mb-1">Panel de control</p>
        <h1 className="font-display text-3xl text-white">DASHBOARD</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <GlassCard className="p-5">
              <div className="flex items-start justify-between mb-3">
                <p className="text-white/40 font-mono text-xs uppercase tracking-wider leading-tight">{s.label}</p>
                <s.icon className={`w-4 h-4 ${s.color} flex-shrink-0`} />
              </div>
              <p className={`font-display text-2xl ${s.color}`}>{s.value}</p>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Recent orders */}
      <GlassCard className="overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="font-display text-lg tracking-widest">ÓRDENES RECIENTES</h2>
          <Link to="/admin/ordenes" className="text-red-400 hover:text-red-300 font-mono text-xs uppercase tracking-wider transition-colors">
            Ver todas
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {['Cliente', 'Producto', 'Precio', 'Estado', 'WhatsApp'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-white/30 font-mono text-xs uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((order, i) => (
                <motion.tr
                  key={order.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-4 py-3 text-white font-body text-sm font-semibold">{order.nombre_cliente}</td>
                  <td className="px-4 py-3 text-white/60 font-body text-sm truncate max-w-[160px]">{order.producto}</td>
                  <td className="px-4 py-3 text-red-400 font-display text-sm">{formatCOP(order.precio)}</td>
                  <td className="px-4 py-3">
                    <Badge variant={order.estado === 'aprobada' ? 'green' : order.estado === 'rechazada' ? 'red' : 'yellow'}>
                      {order.estado}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <a
                      href={`https://wa.me/${order.whatsapp_cliente}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-400 hover:text-green-300 font-mono text-xs transition-colors"
                    >
                      💬 Escribir
                    </a>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}

// ─── ADMIN LAYOUT ─────────────────────────────────────────────────────────────
export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin) navigate('/admin');
  }, [isAdmin]);

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-[#080808] flex">

      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-60 z-30">
        <AdminSidebar />
      </div>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/80 z-40 md:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-64 z-50 md:hidden"
            >
              <AdminSidebar mobile onClose={() => setMobileOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 md:ml-60 flex flex-col min-h-screen">
        {/* Mobile topbar */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[#0a0a0a] border-b border-white/10">
          <button onClick={() => setMobileOpen(true)} className="text-white/60 hover:text-white p-1">
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-display text-lg tracking-widest">SXNTI<span className="text-red-500">ADMIN</span></span>
          <Shield className="w-4 h-4 text-red-500/50" />
        </div>

        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}