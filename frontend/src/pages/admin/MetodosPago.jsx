// pages/admin/MetodosPago.jsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Plus, Edit2, Trash2, X, CreditCard,
  Copy, Check, ToggleLeft, ToggleRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../../services/api';
import { useAuth } from '../../utils/context';
import { Button, Input, Textarea, GlassCard, Badge, Spinner } from '../../components/ui';

// ─── Esquema de validación ────────────────────────────────────────────────────
const schema = z.object({
  nombre:        z.string().min(2, 'Mínimo 2 caracteres').max(60),
  datos_cuenta:  z.string().min(3, 'Ingresa los datos de la cuenta'),
  instrucciones: z.string().optional(),
});

// ─── Iconos disponibles para el método ───────────────────────────────────────
const ICONOS = [
  { value: '📱', label: 'Móvil'     },
  { value: '🏦', label: 'Banco'     },
  { value: '💸', label: 'Envío'     },
  { value: '💳', label: 'Tarjeta'   },
  { value: '💰', label: 'Dinero'    },
  { value: '🌐', label: 'Global'    },
  { value: '⚡', label: 'Rápido'    },
  { value: '🔐', label: 'Seguro'    },
];

// Helper para obtener icono basado en el nombre del método
const getMetodoIcon = (nombre) => {
  const lower = nombre.toLowerCase();
  if (lower.includes('nequi') || lower.includes('daviplata')) return '📱';
  if (lower.includes('banco')) return '🏦';
  if (lower.includes('western')) return '💸';
  if (lower.includes('zelle') || lower.includes('paypal')) return '💳';
  if (lower.includes('binance') || lower.includes('crypto')) return '💰';
  return '💳'; // Default
};

// ─── Sugerencias rápidas de métodos conocidos ────────────────────────────────
const SUGERENCIAS = [
  { nombre: 'Nequi',         icon: '📱', placeholder: '3001234567' },
  { nombre: 'Bancolombia',   icon: '🏦', placeholder: '123-456789-12' },
  { nombre: 'Daviplata',     icon: '📱', placeholder: '3009876543' },
  { nombre: 'Western Union', icon: '💸', placeholder: 'Nombre completo' },
  { nombre: 'Zelle',         icon: '💳', placeholder: 'correo@email.com' },
  { nombre: 'PayPal',        icon: '🌐', placeholder: 'correo@paypal.com' },
  { nombre: 'Binance',       icon: '💰', placeholder: 'ID de usuario' },
  { nombre: 'Remetly',       icon: '⚡', placeholder: 'Datos de cuenta' },
];

// ─── Componente: copiar al portapapeles ──────────────────────────────────────
function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="p-1.5 text-white/30 hover:text-white hover:bg-white/10 rounded transition-all"
      title="Copiar"
    >
      {copied
        ? <Check className="w-3.5 h-3.5 text-green-400" />
        : <Copy className="w-3.5 h-3.5" />
      }
    </button>
  );
}

// ─── Modal crear / editar ────────────────────────────────────────────────────
function MetodoModal({ metodo, onClose, onSave }) {
  const isEdit = !!metodo;
  const [iconSelected, setIconSelected] = useState(metodo?.icon || '📱');

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: metodo || { nombre: '', datos_cuenta: '', instrucciones: '' },
  });

  const onSubmit = handleSubmit((data) => {
    onSave({
      ...data,
      icon:   iconSelected, // Solo para UI local, no se envía al backend
      id:     metodo?.id,
      activo: metodo?.activo ?? true,
    });
    onClose();
  });

  const aplicarSugerencia = (s) => {
    setValue('nombre', s.nombre);
    setIconSelected(s.icon);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-[#0d0d0d] border border-white/15 rounded-2xl w-full max-w-lg
          max-h-[90vh] overflow-y-auto shadow-[0_30px_80px_rgba(0,0,0,0.9)]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 sticky top-0 bg-[#0d0d0d] z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-900/30 border border-red-800/50 rounded-lg flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-red-500" />
            </div>
            <h2 className="font-display text-xl tracking-widest text-white">
              {isEdit ? 'EDITAR' : 'NUEVO'} MÉTODO
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 flex flex-col gap-5">

          {/* Sugerencias rápidas */}
          {!isEdit && (
            <div>
              <p className="text-white/40 font-mono text-xs uppercase tracking-wider mb-3">
                Métodos conocidos
              </p>
              <div className="flex flex-wrap gap-2">
                {SUGERENCIAS.map(s => (
                  <button
                    key={s.nombre}
                    type="button"
                    onClick={() => aplicarSugerencia(s)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-red-900/20
                      border border-white/10 hover:border-red-600/40 rounded-lg
                      text-white/60 hover:text-white text-xs font-body font-semibold
                      transition-all duration-200"
                  >
                    <span>{s.icon}</span>
                    {s.nombre}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Selección de ícono */}
          <div>
            <p className="text-white/40 font-mono text-xs uppercase tracking-wider mb-3">
              Ícono del método
            </p>
            <div className="flex flex-wrap gap-2">
              {ICONOS.map(ic => (
                <button
                  key={ic.value}
                  type="button"
                  onClick={() => setIconSelected(ic.value)}
                  className={`w-10 h-10 flex items-center justify-center rounded-lg border text-lg transition-all duration-200
                    ${iconSelected === ic.value
                      ? 'bg-red-900/40 border-red-500 shadow-[0_0_12px_rgba(255,0,0,0.3)]'
                      : 'bg-white/5 border-white/15 hover:border-white/30'
                    }`}
                  title={ic.label}
                >
                  {ic.value}
                </button>
              ))}
            </div>
          </div>

          {/* Campos */}
          <Input
            label="Nombre del método"
            placeholder="Ej: Nequi, Bancolombia, Zelle..."
            error={errors.nombre?.message}
            {...register('nombre')}
          />

          <Input
            label="Datos de la cuenta"
            placeholder="Número, correo o ID según el método"
            error={errors.datos_cuenta?.message}
            {...register('datos_cuenta')}
          />

          <Textarea
            label="Instrucciones para el cliente (opcional)"
            placeholder="Ej: Enviar al número 300-123-4567 a nombre de Juan Pérez"
            rows={3}
            {...register('instrucciones')}
          />

          {/* Preview */}
          <div>
            <p className="text-white/40 font-mono text-xs uppercase tracking-wider mb-3">
              Vista previa
            </p>
            <div className="flex items-center gap-4 bg-black/40 border border-white/10 rounded-xl p-4">
              <span className="text-3xl flex-shrink-0">{iconSelected}</span>
              <div className="flex-1 min-w-0">
                <p className="font-display text-lg text-white tracking-wider">
                  {watch('nombre') || 'Nombre del método'}
                </p>
                <p className="text-red-400 font-mono text-sm truncate">
                  {watch('datos_cuenta') || 'datos de la cuenta'}
                </p>
                {watch('instrucciones') && (
                  <p className="text-white/40 text-xs font-body mt-1 truncate">
                    {watch('instrucciones')}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" variant="primary" size="lg" className="flex-1">
              {isEdit ? 'Guardar cambios' : 'Crear método'}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ─── Card de método de pago ───────────────────────────────────────────────────
function MetodoCard({ metodo, onEdit, onDelete, onToggle, index }) {
  // Obtener icono basado en el nombre si no tiene uno guardado
  const icon = metodo.icon || getMetodoIcon(metodo.nombre);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.06 }}
      
    >
      <GlassCard
        className={`p-5 transition-all duration-300 group
          ${metodo.activo
            ? 'border-white/10 hover:border-red-500/30'
            : 'border-white/5 opacity-60'
          }`} 
      >
        <div className="flex items-start gap-4" style={{ padding: '15px'}}>
          {/* Ícono */}
          <div className={`w-12 h-12 flex items-center justify-center rounded-xl shrink-0 text-2xl
            border transition-all duration-300
            ${metodo.activo
              ? 'bg-white/5 border-white/10 group-hover:bg-red-900/20 group-hover:border-red-800/40'
              : 'bg-white/2 border-white/5 grayscale'
            }`}
          >
            {icon}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="font-display text-lg tracking-wider text-white leading-none">
                {metodo.nombre}
              </h3>
              <Badge variant={metodo.activo ? 'green' : 'default'}>
                {metodo.activo ? 'Activo' : 'Inactivo'}
              </Badge>
            </div>

            {/* Datos de cuenta con botón copiar */}
            <div className="flex items-center gap-1 mb-1">
              <p className="text-red-400 font-mono text-sm truncate">
                {metodo.datos_cuenta}
              </p>
              <CopyButton text={metodo.datos_cuenta} />
            </div>

            {/* Instrucciones */}
            {metodo.instrucciones && (
              <p className="text-white/40 font-body text-xs leading-relaxed line-clamp-2">
                {metodo.instrucciones}
              </p>
            )}
          </div>
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/8" style={{ padding: '10px'}}>

          {/* Toggle activo/inactivo */}
          <button
            onClick={() => onToggle(metodo.id)}
            className={`cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider
              transition-all duration-200
              ${metodo.activo
                ? 'bg-green-900/20 border border-green-800/40 text-green-400 hover:bg-red-900/20 hover:border-red-800/40 hover:text-red-400'
                : 'bg-white/5 border border-white/10 text-white/40 hover:bg-green-900/20 hover:border-green-800/40 hover:text-green-400'
              }`} style={{ padding: '5px'}}
          >
            {metodo.activo
              ? <><ToggleRight className="w-3.5 h-3.5" /> Activo</>
              : <><ToggleLeft className="w-3.5 h-3.5" /> Inactivo</>
            }
          </button>

          <div className="flex-1" />

          {/* Editar */}
          <button
            onClick={() => onEdit(metodo)}
            className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-blue-900/30
              border border-white/10 hover:border-blue-700/50
              text-white/50 hover:text-blue-300
              rounded-lg text-xs font-mono uppercase tracking-wider
              transition-all duration-200" style={{ padding: '5px'}}
          >
            <Edit2 className="w-3 h-3" /> Editar
          </button>

          {/* Eliminar */}
          <button
            onClick={() => onDelete(metodo.id)}
            className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-red-900/30
              border border-white/10 hover:border-red-700/50
              text-white/50 hover:text-red-400
              rounded-lg text-xs font-mono uppercase tracking-wider
              transition-all duration-200" style={{ padding: '5px'}}
          >
            <Trash2 className="w-3 h-3" /> Eliminar
          </button>
        </div>
      </GlassCard>
    </motion.div>
  );
}

// ─── PÁGINA PRINCIPAL ─────────────────────────────────────────────────────────
export default function AdminMetodosPago() {
  const { token } = useAuth();
  const [metodos, setMetodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'new' | metodo

  // Cargar métodos al montar
  useEffect(() => {
    loadMetodos();
  }, []);

  const loadMetodos = async () => {
    try {
      setLoading(true);
      const data = await api.getMetodosPago();
      setMetodos(data);
    } catch (error) {
      toast.error('Error al cargar métodos de pago');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data) => {
    try {
      if (data.id && metodos.find(m => m.id === data.id)) {
        // Editar existente - por ahora solo actualiza localmente
        // TODO: Implementar endpoint de actualización en el backend
        setMetodos(prev => prev.map(m => m.id === data.id ? { ...m, ...data } : m));
        toast.success('Método actualizado');
      } else {
        // Crear nuevo
        const result = await api.createMetodoPago({
          nombre: data.nombre,
          datos_cuenta: data.datos_cuenta,
          instrucciones: data.instrucciones || null,
        }, token);
        
        // Recargar la lista
        await loadMetodos();
        toast.success('Método de pago creado', {
          style: { background: '#001a00', border: '1px solid rgba(0,200,0,0.3)', color: '#fff' },
        });
      }
    } catch (error) {
      toast.error(error.message || 'Error al guardar el método');
    }
  };

  const handleDelete = async (id) => {
    try {
      // Por ahora solo elimina localmente
      // TODO: Implementar endpoint de eliminación en el backend
      setMetodos(prev => prev.filter(m => m.id !== id));
      toast.success('Método eliminado');
    } catch (error) {
      toast.error('Error al eliminar el método');
    }
  };

  const handleToggle = async (id) => {
    try {
      await api.toggleMetodoPago(id, token);
      
      // Actualizar localmente
      setMetodos(prev =>
        prev.map(m => m.id === id ? { ...m, activo: !m.activo } : m)
      );
      
      const metodo = metodos.find(m => m.id === id);
      toast(metodo?.activo ? 'Método desactivado' : 'Método activado', {
        icon: metodo?.activo ? '🔴' : '🟢',
      });
    } catch (error) {
      toast.error('Error al cambiar el estado del método');
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" />
          <p className="text-white/30 font-mono text-sm">Cargando métodos de pago...</p>
        </div>
      </div>
    );
  }

  const activos   = metodos.filter(m => m.activo).length;
  const inactivos = metodos.length - activos;

  return (
    <div className="p-6" style={{ marginTop: '20px', paddingLeft: '20px'}}>

      {/* ── Encabezado ── */}
      <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
        <div>
          <p className="text-white/40 font-mono text-xs uppercase tracking-wider mb-1">Admin</p>
          <h1 className="font-display text-3xl text-white tracking-wide">MÉTODOS DE PAGO</h1>
          <p className="text-white/40 font-body text-sm mt-1">
            Gestiona las cuentas donde los clientes realizan sus pagos
          </p>
        </div>
        <div style={{marginRight: '20px'}}>
            <Button variant="primary" onClick={() => setModal('new')}>
                <Plus className="w-4 h-4" />Agregar método
            </Button>
        </div>
      </div>

      {/* ── Stats rápidas ── */}
      <div className="grid grid-cols-3 gap-4 mb-8" style={{ marginBottom: '30px'}}>
        {[
          { label: 'Total',     value: metodos.length, color: 'text-white' },
          { label: 'Activos',   value: activos,         color: 'text-green-400' },
          { label: 'Inactivos', value: inactivos,        color: 'text-white/40' },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
          >
            <GlassCard className="px-5 py-4">
              <p className="text-white/40 font-mono text-xs uppercase tracking-wider mb-2" style={{ paddingLeft: '15px'}}>
                {s.label}
              </p>
              <p className={`font-display text-3xl ${s.color} leading-none`} style={{ paddingLeft: '15px'}}>
                {s.value}
              </p>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* ── Info tip ── */}
      <div className="flex items-start gap-3 bg-red-950/20 border border-red-900/30 rounded-xl px-4 py-3 mb-8" style={{ marginBottom: '20px'}}>
        <CreditCard className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
        <p className="text-white/50 font-body text-sm leading-relaxed">
          Los métodos <span className="text-white/70 font-semibold">activos</span> son los que
          verán los clientes al hacer checkout. Desactiva temporalmente los que no estés usando
          sin necesidad de eliminarlos.
        </p>
      </div>

      {/* ── Grid de métodos ── */}
      {metodos.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-24 gap-4 text-center"
        >
          <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center">
            <CreditCard className="w-7 h-7 text-white/20" />
          </div>
          <p className="text-white/40 font-body text-lg">Sin métodos de pago</p>
          <Button variant="outline" onClick={() => setModal('new')}>
            <Plus className="w-4 h-4" /> Agregar el primero
          </Button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          <AnimatePresence>
            {metodos.map((m, i) => (
              <MetodoCard
                key={m.id}
                metodo={m}
                index={i}
                onEdit={setModal}
                onDelete={handleDelete}
                onToggle={handleToggle}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* ── Modal ── */}
      <AnimatePresence>
        {modal && (
          <MetodoModal
            metodo={modal === 'new' ? null : modal}
            onClose={() => setModal(null)}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>
    </div>
  );
}