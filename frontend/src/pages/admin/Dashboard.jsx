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

// ─── ADMIN SIDEBAR (LÓGICA ACTUALIZADA) ──────────────────────────────────────
function AdminSidebar({ mobile, onClose, collapsed, onToggle }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="flex flex-col h-full w-full">
      {/* Logo & Toggle */}
      <div className={`px-5 py-6 border-b border-white/10 flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-red-500" fill="currentColor" />
            <span className="font-display text-lg tracking-widest">SXNTI<span className="text-red-500">ADMIN</span></span>
          </div>
        )}
        {collapsed && <Zap className="w-6 h-6 text-red-500" fill="currentColor" />}
        
        {!mobile && (
          <button 
            onClick={onToggle}
            className={`text-white/30 hover:text-white p-1 transition-all ${collapsed ? 'mt-2' : ''}`}
          >
            {collapsed ? <ChevronRight className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-2">
        {NAV.map(({ to, icon: Icon, label }) => {
          const active = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              onClick={mobile ? onClose : undefined}
              className={`flex items-center gap-3 px-3 py-3 rounded-lg font-body font-semibold text-xs uppercase tracking-wider transition-all
                ${active 
                  ? 'bg-red-600/20 text-red-400 border border-red-600/30' 
                  : 'text-white/40 hover:text-white hover:bg-white/5 border border-transparent'
                } ${collapsed ? 'justify-center' : ''}`}
              title={collapsed ? label : ''}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-red-500' : ''}`} />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className={`px-3 py-4 border-t border-white/10 ${collapsed ? 'items-center' : ''} flex flex-col gap-1`}>
        <button
          onClick={() => { logout(); navigate('/admin'); }}
          className="w-full flex items-center gap-3 px-3 py-3 text-white/40 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-all"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="text-xs uppercase font-semibold">Salir</span>}
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
  /* 1. Añadimos overflow-hidden y w-full para que el grid no calcule el ancho fuera de la pantalla */
  <div className="p-4 md:p-8 w-full overflow-hidden" style={{paddingLeft: '10px'}}>
    <div className="mb-8" style={{marginTop: '20px'}}>
      <p className="text-white/40 font-mono text-[10px] uppercase tracking-[0.3em] mb-1">SISTEMA DE GESTIÓN</p>
      <h1 className="font-display text-4xl text-white tracking-tighter">DASHBOARD</h1>
    </div>

    {/* Stats - 2. Forzamos w-full para que el grid se ciña al contenedor padre */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10 w-full" style={{marginBottom: '20px'}}>
      {stats.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          /* 3. Aseguramos que el div de la animación no cause desbordamiento lateral */
          className="min-w-0"
        >
          <GlassCard className="!p-6 flex flex-col justify-between min-h-[120px] w-full">
            <div className="flex items-center justify-between opacity-40 mb-4">
              <span className="font-mono text-[10px] uppercase tracking-widest">{s.label}</span>
              <s.icon className={`w-4 h-4 ${s.color} flex-shrink-0`} />
            </div>
            <div className="flex items-baseline gap-2">
              {/* 4. 'truncate' evita que números muy largos (ingresos) empujen el cuadro hacia afuera */}
              <p className={`font-display text-2xl md:text-3xl tracking-tight ${s.color} truncate`}>
                {s.value}
              </p>
            </div>
          </GlassCard>
        </motion.div>
      ))}
    </div>

    {/* Recent orders */}
    <div className="space-y-4 w-full">
      <div className="flex items-center justify-between px-2">
        <h2 className="font-display text-xl tracking-widest uppercase">Órdenes Recientes</h2>
        <Link to="/admin/ordenes" className="group flex items-center gap-2 text-white/30 hover:text-red-400 transition-colors font-mono text-[10px] uppercase tracking-widest">
          Ver todas <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* 5. Aseguramos que la tabla ocupe el 100% y no 'estire' el layout */}
      <GlassCard className="!p-0 overflow-hidden border-white/5 w-full">
        <div className="overflow-x-auto custom-scrollbar w-full">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/5">
                {['Cliente', 'Producto', 'Precio', 'Estado', 'Acción'].map(h => (
                  <th key={h} className="px-6 py-4 text-left text-white/30 font-mono text-[10px] uppercase tracking-[0.2em]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {orders.map((order, i) => (
                <motion.tr
                  key={order.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="hover:bg-white/[0.03] transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="font-body text-sm font-bold text-white/90">{order.nombre_cliente}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-body text-xs text-white/50 max-w-[200px] truncate">{order.producto}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-display text-sm text-red-500">{formatCOP(order.precio)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={order.estado === 'aprobada' ? 'green' : order.estado === 'rechazada' ? 'red' : 'yellow'}>
                      {order.estado}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <a
                      href={`https://wa.me/${order.whatsapp_cliente}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-green-500/10 hover:bg-green-500/20 text-green-500 px-3 py-1.5 rounded-full font-mono text-[10px] uppercase tracking-tighter transition-all"
                    >
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                      WhatsApp
                    </a>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  </div>
);
}

// ─── ADMIN LAYOUT ─────────────────────────────────────────────────────────────
export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false); // Nuevo estado para colapsar
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin) navigate('/admin');
  }, [isAdmin]);

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-[#080808] flex overflow-hidden">
      
      {/* Desktop sidebar */}
      <motion.div 
        animate={{ width: isCollapsed ? 80 : 240 }}
        className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 bg-[#0a0a0a] border-r border-white/10 z-30 overflow-hidden"
      >
        <AdminSidebar collapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} />
      </motion.div>

      {/* Mobile sidebar (sin cambios profundos) */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/80 z-40 md:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              className="fixed left-0 top-0 bottom-0 w-64 z-50 md:hidden"
            >
              <AdminSidebar mobile onClose={() => setMobileOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main content - Ajuste dinámico de margen */}
      <motion.div 
        animate={{ marginLeft: isCollapsed ? 80 : 240 }}
        className="flex-1 flex flex-col min-h-screen w-full transition-all duration-300"
      >
        {/* Mobile topbar */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[#0a0a0a] border-b border-white/10">
          <button onClick={() => setMobileOpen(true)} className="text-white/60 hover:text-white p-1">
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-display text-lg tracking-widest">SXNTI<span className="text-red-500">ADMIN</span></span>
          <Shield className="w-4 h-4 text-red-500/50" />
        </div>

        <main className="flex-1 w-full overflow-x-hidden bg-[#080808]">
          <div className="w-full max-w-[1400px] mx-auto p-4 md:p-8">
            <Outlet />
          </div>
        </main>
      </motion.div>
    </div>
  );
}