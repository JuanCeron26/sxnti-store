// pages/admin/Ordenes.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Eye, MessageSquare, Clock, Filter, FileText, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../../services/api';
import { formatCOP } from '../../utils/context';
import { GlassCard, Badge } from '../../components/ui';

const STATUS_COLORS = {
  pendiente: 'yellow',
  aprobada: 'green',
  rechazada: 'red',
};

export default function AdminOrdenes() {
  const [orders, setOrders] = useState([]);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => { api.getOrders().then(setOrders); }, []);

  const handleApprove = (id) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, estado: 'aprobada' } : o));
    toast.success('Orden aprobada');
  };

  const handleReject = (id) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, estado: 'rechazada' } : o));
    toast.error('Orden rechazada');
  };

  const filtered = filter === 'all' ? orders : orders.filter(o => o.estado === filter);

  // Detectar si el comprobante es una imagen
  const esImagen = (url) => {
    if (!url) return false;
    const ext = url.split('.').pop().split('?')[0].toLowerCase();
    return ['jpg', 'jpeg', 'png', 'webp'].includes(ext);
  };

  return (
    <div className="p-6" style={{ paddingLeft: '10px', marginTop: '10px'}}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-white/40 font-mono text-xs uppercase tracking-wider mb-1">Admin</p>
          <h1 className="font-display text-3xl text-white">ÓRDENES</h1>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-1 bg-black/40 border border-white/10 rounded-lg p-1">
          {[
            { value: 'all', label: 'Todas' },
            { value: 'pendiente', label: 'Pendientes' },
            { value: 'aprobada', label: 'Aprobadas' },
          ].map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-3 py-1.5 rounded text-xs font-mono uppercase tracking-wider transition-all
                ${filter === f.value ? 'bg-red-600 text-white' : 'text-white/40 hover:text-white'}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map((order, i) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <GlassCard className={`p-5 border transition-all ${selected?.id === order.id ? 'border-red-500/50' : ''}`}>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <Badge variant={STATUS_COLORS[order.estado]}>{order.estado}</Badge>
                    <span className="text-white/30 font-mono text-xs">{order.id}</span>
                  </div>
                  <p className="font-body font-bold text-white truncate">{order.nombre_cliente}</p>
                  <p className="text-white/50 font-body text-sm truncate">{order.producto_nombre || 'Producto no disponible'}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-display text-xl text-red-400">
                    {order.producto_precio ? formatCOP(order.producto_precio) : 'N/A'}
                  </p>
                  <p className="text-white/30 font-mono text-xs mt-0.5">{order.metodo_pago_nombre || 'N/A'}</p>
                </div>
              </div>

              {/* Comprobante - mostrar imagen o link */}
              {order.url_comprobante && (
                <div className="mb-3">
                  {esImagen(order.url_comprobante) ? (
                    <a href={order.url_comprobante} target="_blank" rel="noopener noreferrer">
                      <img
                        src={order.url_comprobante}
                        alt="Comprobante"
                        className="w-full h-24 object-cover rounded-lg border border-white/10 hover:border-red-500/50 transition-all cursor-pointer"
                      />
                    </a>
                  ) : (
                    <a
                      href={order.url_comprobante}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-blue-900/20 border border-blue-800/40 text-blue-400 hover:bg-blue-900/40 rounded-lg px-3 py-2 transition-all"
                    >
                      <FileText className="w-4 h-4" />
                      <span className="font-mono text-xs">Ver comprobante</span>
                    </a>
                  )}
                </div>
              )}

              {!order.url_comprobante && (
                <div className="mb-3 flex items-center gap-2 bg-yellow-900/20 border border-yellow-800/30 rounded-lg px-3 py-2">
                  <Clock className="w-3.5 h-3.5 text-yellow-500" />
                  <p className="text-yellow-500/70 font-mono text-xs">Sin comprobante aún</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2">
                <a
                  href={`https://wa.me/${order.whatsapp_cliente}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-green-900/20 border border-green-800/40 text-green-400 hover:bg-green-900/40 rounded font-mono text-xs uppercase tracking-wider transition-all"
                >
                  <MessageSquare className="w-3 h-3" />
                  WhatsApp
                </a>

                {order.estado === 'pendiente' && (
                  <>
                    <button
                      onClick={() => handleApprove(order.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-green-900/20 border border-green-800/40 text-green-400 hover:bg-green-600 hover:text-white hover:border-green-600 rounded font-mono text-xs uppercase tracking-wider transition-all"
                    >
                      <CheckCircle className="w-3 h-3" /> Aprobar
                    </button>
                    <button
                      onClick={() => handleReject(order.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-900/20 border border-red-800/40 text-red-400 hover:bg-red-600 hover:text-white hover:border-red-600 rounded font-mono text-xs uppercase tracking-wider transition-all"
                    >
                      <XCircle className="w-3 h-3" /> Rechazar
                    </button>
                  </>
                )}

                <p className="ml-auto text-white/20 font-mono text-xs">
                  {new Date(order.creado_en).toLocaleDateString('es-CO', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </GlassCard>
          </motion.div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-2 flex flex-col items-center justify-center py-16 gap-3 text-center">
            <p className="text-white/30 font-body text-lg">No hay órdenes {filter !== 'all' ? filter + 's' : ''}</p>
          </div>
        )}
      </div>
    </div>
  );
}