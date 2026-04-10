// pages/Checkout.jsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Upload, CheckCircle, ArrowLeft, Zap, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { useCart, formatCOP } from '../utils/context';
import { api } from '../services/api';
import { Button, Input, GlassCard, Spinner } from '../components/ui';

const schema = z.object({
  nombre_cliente: z.string().min(2, 'Ingresa tu nombre'),
  whatsapp_cliente: z.string().min(10, 'Número inválido').max(15),
  metodo_pago_id: z.string().min(1, 'Selecciona un método de pago'),
});

const STEPS = ['Datos', 'Pago', 'Comprobante', '¡Listo!'];

// Helper para iconos de métodos de pago
const getMetodoIcon = (nombre) => {
  const lower = nombre.toLowerCase();
  if (lower.includes('nequi')) return '📱';
  if (lower.includes('banco')) return '🏦';
  if (lower.includes('western')) return '💸';
  if (lower.includes('zelle')) return '💳';
  if (lower.includes('paypal')) return '💰';
  return '💳';
};

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [orden, setOrden] = useState(null);
  const [comprobante, setComprobante] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [metodosPago, setMetodosPago] = useState([]);
  const [loadingMetodos, setLoadingMetodos] = useState(true);

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const metodoPagoId = watch('metodo_pago_id');
  const metodoPago = metodosPago.find(m => m.id === metodoPagoId);

  // Cargar métodos de pago
  useEffect(() => {
    api.getMetodosPago()
      .then(metodos => {
        setMetodosPago(metodos.filter(m => m.activo));
        setLoadingMetodos(false);
      })
      .catch(err => {
        console.error('Error al cargar métodos de pago:', err);
        toast.error('Error al cargar métodos de pago');
        setLoadingMetodos(false);
      });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': [], 'application/pdf': [] },
    maxSize: 10 * 1024 * 1024,
    onDrop: (files) => {
      if (files[0]) setComprobante(files[0]);
    },
    onDropRejected: () => toast.error('Archivo inválido. Usa JPG, PNG o PDF menor a 10MB.'),
  });

  const onSubmitDatos = handleSubmit(async (data) => {
    try {
      const item = items[0];
      const orderData = {
        tipo: item.tipo,
        cuenta_id: item.tipo === 'cuenta_ff' ? item.id : null,
        paquete_id: item.tipo === 'paquete_diamantes' ? item.id : null,
        metodo_pago_id: data.metodo_pago_id,
        nombre_cliente: data.nombre_cliente || null,
        whatsapp_cliente: data.whatsapp_cliente,
      };
      const ord = await api.createOrder(orderData);
      setOrden(ord);
      setStep(1);
    } catch (e) {
      toast.error(e.message || 'Error al crear la orden');
    }
  });

  const submitComprobante = async () => {
    if (!comprobante) return toast.error('Adjunta el comprobante');
    setUploading(true);
    try {
      await api.uploadComprobante(orden.id, comprobante);
      clearCart();
      setStep(3);
      toast.success('¡Comprobante recibido! El vendedor lo revisará pronto.', {
        style: { background: '#001a00', border: '1px solid rgba(0,255,0,0.3)', color: '#fff' },
      });
    } catch (error) {
      toast.error('Error al subir el comprobante');
    } finally {
      setUploading(false);
    }
  };

  if (items.length === 0 && step < 3) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4 pt-20">
        <p className="text-white/40 font-body text-lg">Tu carrito está vacío</p>
        <Link to="/tienda"><Button variant="outline">Ver productos</Button></Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-24 pb-20 flex justify-center">
      <div className="max-w-4xl mx-auto px-4 sm:px-6" style={{ marginTop: '90px', marginBottom: '30px' }}>

        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <Link to="/tienda" className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors text-sm font-mono uppercase tracking-widest mb-4">
            <ArrowLeft className="w-4 h-4" /> Volver a la tienda
          </Link>
          <h1 className="font-display text-5xl text-white tracking-tighter">CHECKOUT</h1>
        </div>

        {/* Pasos */}
        <div className="w-full" style={{ marginBottom: '48px' }}>
  <div 
    className="flex items-center justify-between mx-auto" 
    style={{ 
      maxWidth: '100%', // Se ajusta al ancho del contenedor padre (max-w-4xl)
      padding: '0 10px' 
    }}
  >
    {STEPS.map((s, i) => (
      <div 
        key={s} 
        className="flex items-center" 
        style={{ 
          flex: i === STEPS.length - 1 ? '0 0 auto' : '1 1 0%',
          justifyContent: i === STEPS.length - 1 ? 'flex-end' : 'flex-start'
        }}
      >
        
        {/* Indicador (Círculo + Texto) */}
        <div className="flex flex-col md:flex-row items-center gap-2 md:gap-3 flex-shrink-0">
          <div className={`flex items-center justify-center w-9 h-9 rounded-full border-2 font-mono text-xs transition-all duration-300
            ${i < step ? 'bg-red-600 border-red-600 text-white' :
              i === step ? 'border-red-500 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.3)]' :
              'border-white/10 text-white/20'}`}
          >
            {i < step ? '✓' : i + 1}
          </div>
          <p className={`hidden md:block font-mono text-[10px] uppercase tracking-[0.2em] transition-colors ${i <= step ? 'text-white/70' : 'text-white/20'}`}>
            {s}
          </p>
        </div>

        {/* Línea Conectora */}
        {i < STEPS.length - 1 && (
          <div className="flex-1 mx-4" style={{ minWidth: '20px' }}>
            <div className={`h-[1px] w-full transition-all duration-300 ${i < step ? 'bg-red-600' : 'bg-white/10'}`} />
          </div>
        )}
        
      </div>
    ))}
  </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="step0" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">

                {/* Formulario de Datos */}
                <GlassCard className="lg:col-span-3 overflow-hidden">
                  <div style={{ padding: '32px' }}>
                    <h2 className="font-display text-2xl tracking-widest mb-8 text-white">TUS DATOS</h2>
                    <form onSubmit={onSubmitDatos} className="flex flex-col gap-6">
                      <Input label="Tu nombre (opcional)" placeholder="Ej: Carlos Mendez" error={errors.nombre_cliente?.message} {...register('nombre_cliente')} />
                      <Input label="WhatsApp (con código país)" placeholder="Ej: 573001234567" error={errors.whatsapp_cliente?.message} {...register('whatsapp_cliente')} />
                      
                      <div className="flex flex-col gap-3">
                        <label className="text-[11px] font-bold text-white/40 uppercase tracking-[0.2em] font-mono">Método de pago</label>
                        {loadingMetodos ? (
                          <div className="flex items-center justify-center py-10"><Spinner /></div>
                        ) : (
                          <div className="grid grid-cols-1 gap-3">
                            {metodosPago.map(m => (
                              <label key={m.id} className="flex items-center gap-4 p-4 bg-white/[0.02] border border-white/5 rounded-xl cursor-pointer hover:border-red-500/30 transition-all has-[:checked]:border-red-500 has-[:checked]:bg-red-500/[0.05]">
                                <input type="radio" value={m.id} {...register('metodo_pago_id')} className="accent-red-600 w-4 h-4" />
                                <span className="text-2xl">{getMetodoIcon(m.nombre)}</span>
                                <div className="flex-1 min-w-0">
                                  <p className="font-body font-bold text-white text-sm uppercase tracking-wide">{m.nombre}</p>
                                  <p className="text-white/40 font-mono text-[11px] truncate mt-0.5">{m.datos_cuenta}</p>
                                </div>
                              </label>
                            ))}
                          </div>
                        )}
                        {errors.metodo_pago_id && <span className="text-xs text-red-500 font-mono mt-1">{errors.metodo_pago_id.message}</span>}
                      </div>

                      <Button type="submit" variant="primary" size="lg" className="w-full !py-5 mt-4" disabled={loadingMetodos || metodosPago.length === 0}>
                        <span className="font-display tracking-[0.2em]">CONTINUAR A PAGAR</span> <Zap className="w-5 h-5 fill-current" />
                      </Button>
                    </form>
                  </div>
                </GlassCard>

                {/* Resumen de Compra */}
                <div className="lg:col-span-2 flex flex-col gap-4">
                  <GlassCard>
                    <div style={{ padding: '24px' }}>
                      <h2 className="font-display text-lg tracking-widest mb-6 text-white/60">RESUMEN</h2>
                      <div className="space-y-4 mb-6">
                        {items.map(item => (
                          <div key={item.id} className="flex gap-4 items-center">
                            <div className="relative flex-shrink-0">
                              <img src={item.imagenes?.[0]?.imagen_url || 'https://placehold.co/100x100/111/333?text=FF'} alt="" className="w-16 h-16 object-cover rounded-lg border border-white/10" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-white font-body font-bold text-sm truncate uppercase tracking-tight">{item.nombre}</p>
                              <p className="text-red-500 font-display text-lg mt-0.5">{formatCOP(item.precio)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="border-t border-white/10 pt-5 flex justify-between items-end">
                        <span className="text-white/40 font-mono text-[10px] uppercase tracking-widest pb-1">Total a pagar</span>
                        <span className="font-display text-3xl text-white tracking-tighter">{formatCOP(total)}</span>
                      </div>
                    </div>
                  </GlassCard>
                  
                  <div className="p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/10">
                    <p className="text-[10px] text-yellow-500/70 font-mono leading-relaxed uppercase tracking-wider">
                      ⚠️ Asegúrate de enviar el monto exacto para evitar retrasos en la entrega de tu cuenta o diamantes.
                    </p>
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* Los demás steps siguen el mismo patrón de GlassCard con padding manual... */}
          {step === 1 && metodoPago && (
            <motion.div key="step1" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
              <GlassCard className="max-w-xl mx-auto overflow-hidden">
                <div style={{ padding: '40px' }} className="text-center">
                  <div className="text-6xl mb-6">{getMetodoIcon(metodoPago.nombre)}</div>
                  <h2 className="font-display text-3xl mb-3 text-white">REALIZA TU PAGO</h2>
                  <p className="text-white/40 font-body text-sm mb-8">Transfiere el monto exacto a los siguientes datos:</p>

                  <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-8 mb-8 text-left space-y-6">
                    <div>
                      <p className="text-white/30 font-mono text-[10px] uppercase tracking-[0.2em]">Banco / Plataforma</p>
                      <p className="font-display text-2xl text-white mt-1 uppercase">{metodoPago.nombre}</p>
                    </div>
                    <div>
                      <p className="text-white/30 font-mono text-[10px] uppercase tracking-[0.2em]">Número de Cuenta</p>
                      <p className="font-mono text-2xl text-red-500 mt-1 break-all tracking-tight font-bold">{metodoPago.datos_cuenta}</p>
                    </div>
                    <div>
                      <p className="text-white/30 font-mono text-[10px] uppercase tracking-[0.2em]">Valor Total</p>
                      <p className="font-display text-4xl text-white mt-1 tracking-tighter">{formatCOP(total)}</p>
                    </div>
                  </div>

                  <Button variant="primary" size="lg" className="w-full !py-5" onClick={() => setStep(2)}>
                    <span className="font-display tracking-widest">YA REALICÉ EL PAGO</span> <Zap className="w-5 h-5" />
                  </Button>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <GlassCard className="max-w-xl mx-auto">
                <div style={{ padding: '40px' }}>
                  <h2 className="font-display text-2xl tracking-widest mb-2 text-white">SUBIR COMPROBANTE</h2>
                  <p className="text-white/40 font-body text-sm mb-8">Adjunta una captura de pantalla legible de la transferencia.</p>

                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all
                      ${isDragActive ? 'border-red-500 bg-red-500/10' : comprobante ? 'border-green-500 bg-green-500/5' : 'border-white/10 hover:border-white/20 hover:bg-white/[0.02]'}`}
                  >
                    <input {...getInputProps()} />
                    {comprobante ? (
                      <div className="flex flex-col items-center gap-4">
                        <CheckCircle className="w-12 h-12 text-green-500" />
                        <p className="font-body font-bold text-green-500 text-sm">{comprobante.name}</p>
                        <button onClick={(e) => { e.stopPropagation(); setComprobante(null); }} className="text-[10px] font-mono uppercase tracking-widest text-white/40 hover:text-red-500">
                          Eliminar y cambiar
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-4">
                        <Upload className="w-12 h-12 text-white/10" />
                        <p className="font-body text-white/50 text-sm">Arrastra tu comprobante aquí</p>
                        <p className="text-[10px] text-white/20 font-mono uppercase">PNG, JPG o PDF hasta 10MB</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-4 mt-8">
                    <Button variant="ghost" onClick={() => setStep(1)} className="flex-1">Atrás</Button>
                    <Button variant="primary" size="lg" className="flex-[2] !py-5" onClick={submitComprobante} loading={uploading} disabled={!comprobante}>
                      ENVIAR AHORA
                    </Button>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <GlassCard className="max-w-lg mx-auto overflow-hidden">
                <div style={{ padding: '60px 40px' }} className="text-center">
                  <div className="w-24 h-24 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
                    <CheckCircle className="w-12 h-12 text-green-500" />
                  </div>
                  <h2 className="font-display text-4xl mb-4 text-white uppercase tracking-tighter">¡LISTO!</h2>
                  <p className="text-white/50 font-body mb-8 text-sm leading-relaxed">
                    Hemos recibido tu comprobante. El equipo verificará la transacción y te contactará por WhatsApp en breve.
                  </p>
                  <div className="flex flex-col gap-3">
                    <Link to="/tienda"><Button variant="primary" className="w-full py-4!">SEGUIR COMPRANDO</Button></Link>
                    <Link to="/"><Button variant="ghost" className="w-full">VOLVER AL INICIO</Button></Link>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}