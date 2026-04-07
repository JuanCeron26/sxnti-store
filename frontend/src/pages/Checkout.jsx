// pages/Checkout.jsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Upload, CheckCircle, ArrowLeft, Zap, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { useCart, formatCOP } from '../utils/context';
import { mockMetodosPago, api } from '../services/api';
import { Button, Input, GlassCard } from '../components/ui';

const schema = z.object({
  nombre_cliente: z.string().min(2, 'Ingresa tu nombre'),
  whatsapp_cliente: z.string().min(10, 'Número inválido').max(15),
  metodo_pago_id: z.string().min(1, 'Selecciona un método de pago'),
});

const STEPS = ['Datos', 'Pago', 'Comprobante', '¡Listo!'];

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [orden, setOrden] = useState(null);
  const [comprobante, setComprobante] = useState(null);
  const [uploading, setUploading] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const metodoPagoId = watch('metodo_pago_id');
  const metodoPago = mockMetodosPago.find(m => m.id === metodoPagoId);

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
        nombre_cliente: data.nombre_cliente,
        whatsapp_cliente: data.whatsapp_cliente,
      };
      const ord = await api.createOrder(orderData);
      setOrden(ord);
      setStep(1);
    } catch (e) {
      toast.error('Error al crear la orden');
    }
  });

  const submitComprobante = async () => {
    if (!comprobante) return toast.error('Adjunta el comprobante');
    setUploading(true);
    await new Promise(r => setTimeout(r, 1500)); // simulate upload
    setUploading(false);
    clearCart();
    setStep(3);
    toast.success('¡Comprobante recibido! El vendedor lo revisará pronto.', {
      style: { background: '#001a00', border: '1px solid rgba(0,255,0,0.3)', color: '#fff' },
    });
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
    <div className="min-h-screen bg-black pt-24 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="mb-8">
          <Link to="/tienda" className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors text-sm font-mono uppercase tracking-wider mb-4">
            <ArrowLeft className="w-3.5 h-3.5" /> Volver
          </Link>
          <h1 className="font-display text-4xl text-white">CHECKOUT</h1>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center gap-0 mb-10">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center flex-1">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 font-mono text-xs transition-all duration-300 flex-shrink-0
                ${i < step ? 'bg-red-600 border-red-600 text-white' :
                  i === step ? 'border-red-500 text-red-400' :
                  'border-white/20 text-white/20'}`}
              >
                {i < step ? '✓' : i + 1}
              </div>
              <p className={`hidden sm:block ml-2 font-mono text-xs uppercase tracking-wider mr-2 transition-colors ${i <= step ? 'text-white/60' : 'text-white/20'}`}>
                {s}
              </p>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-px transition-all duration-300 ${i < step ? 'bg-red-600' : 'bg-white/10'}`} />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">

          {/* Step 0: Datos */}
          {step === 0 && (
            <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Form */}
                <GlassCard className="p-6">
                  <h2 className="font-display text-xl tracking-widest mb-5">TUS DATOS</h2>
                  <form onSubmit={onSubmitDatos} className="flex flex-col gap-4">
                    <Input label="Tu nombre" placeholder="Carlos Mendez" error={errors.nombre_cliente?.message} {...register('nombre_cliente')} />
                    <Input label="WhatsApp (con código país)" placeholder="573001234567" error={errors.whatsapp_cliente?.message} {...register('whatsapp_cliente')} />
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-white/70 uppercase tracking-wider font-mono">Método de pago</label>
                      <div className="grid grid-cols-1 gap-2">
                        {mockMetodosPago.filter(m => m.activo).map(m => (
                          <label key={m.id} className="flex items-center gap-3 p-3 bg-black/40 border border-white/10 rounded cursor-pointer hover:border-red-500/50 transition-all has-[:checked]:border-red-500 has-[:checked]:bg-red-900/20">
                            <input type="radio" value={m.id} {...register('metodo_pago_id')} className="accent-red-600" />
                            <span className="text-lg">{m.icon}</span>
                            <div>
                              <p className="font-body font-semibold text-white text-sm">{m.nombre}</p>
                              <p className="text-white/40 font-mono text-xs">{m.datos_cuenta}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                      {errors.metodo_pago_id && <span className="text-xs text-red-400 font-mono">{errors.metodo_pago_id.message}</span>}
                    </div>
                    <Button type="submit" variant="primary" size="lg" className="mt-2">
                      Continuar <Zap className="w-4 h-4" />
                    </Button>
                  </form>
                </GlassCard>

                {/* Order summary */}
                <GlassCard className="p-6 h-fit">
                  <h2 className="font-display text-xl tracking-widest mb-4">RESUMEN</h2>
                  <div className="space-y-3 mb-4">
                    {items.map(item => (
                      <div key={item.id} className="flex gap-3">
                        <img src={item.imagenes?.[0]?.imagen_url} alt="" className="w-14 h-14 object-cover rounded bg-black/40 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-body font-semibold text-sm truncate">{item.nombre}</p>
                          <p className="text-red-400 font-display text-base">{formatCOP(item.precio)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-white/10 pt-3 flex justify-between">
                    <span className="text-white/60 font-body font-semibold">Total</span>
                    <span className="font-display text-2xl text-white">{formatCOP(total)}</span>
                  </div>
                </GlassCard>
              </div>
            </motion.div>
          )}

          {/* Step 1: Instrucciones de pago */}
          {step === 1 && metodoPago && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <GlassCard className="p-8 text-center">
                <div className="text-5xl mb-4">{metodoPago.icon}</div>
                <h2 className="font-display text-3xl mb-2">REALIZA EL PAGO</h2>
                <p className="text-white/50 font-body mb-6">Transfiere exactamente el monto indicado a esta cuenta:</p>

                <div className="bg-black/60 border border-white/10 rounded-xl p-6 mb-4 text-left">
                  <div className="flex flex-col gap-3">
                    <div>
                      <p className="text-white/40 font-mono text-xs uppercase tracking-wider">Método</p>
                      <p className="font-display text-2xl text-white mt-0.5">{metodoPago.nombre}</p>
                    </div>
                    <div>
                      <p className="text-white/40 font-mono text-xs uppercase tracking-wider">Cuenta / Número</p>
                      <p className="font-mono text-xl text-red-400 mt-0.5">{metodoPago.datos_cuenta}</p>
                    </div>
                    <div>
                      <p className="text-white/40 font-mono text-xs uppercase tracking-wider">Monto exacto</p>
                      <p className="font-display text-4xl text-white mt-0.5">{formatCOP(total)}</p>
                    </div>
                    {metodoPago.instrucciones && (
                      <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                        <p className="text-white/60 font-body text-sm">{metodoPago.instrucciones}</p>
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-white/40 font-mono text-xs mb-6">
                  ID de orden: <span className="text-white/60">{orden?.id}</span>
                </p>

                <Button variant="primary" size="lg" onClick={() => setStep(2)}>
                  Ya realicé el pago <Zap className="w-4 h-4" />
                </Button>
              </GlassCard>
            </motion.div>
          )}

          {/* Step 2: Subir comprobante */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <GlassCard className="p-8">
                <h2 className="font-display text-2xl tracking-widest mb-2">SUBE TU COMPROBANTE</h2>
                <p className="text-white/50 font-body text-sm mb-6">Adjunta la captura o PDF de tu transferencia para verificar el pago.</p>

                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-200
                    ${isDragActive ? 'border-red-500 bg-red-900/10' : comprobante ? 'border-green-500/50 bg-green-900/10' : 'border-white/20 hover:border-red-500/50 hover:bg-red-900/5'}`}
                >
                  <input {...getInputProps()} />
                  {comprobante ? (
                    <div className="flex flex-col items-center gap-3">
                      <CheckCircle className="w-10 h-10 text-green-400" />
                      <p className="font-body font-semibold text-green-400">{comprobante.name}</p>
                      <p className="text-white/40 font-mono text-xs">{(comprobante.size / 1024).toFixed(0)} KB</p>
                      <button
                        onClick={(e) => { e.stopPropagation(); setComprobante(null); }}
                        className="flex items-center gap-1 text-white/40 hover:text-red-400 text-xs font-mono"
                      >
                        <X className="w-3 h-3" /> Cambiar archivo
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <Upload className="w-10 h-10 text-white/20" />
                      <p className="font-body text-white/50">{isDragActive ? 'Suelta aquí...' : 'Arrastra o toca para subir'}</p>
                      <p className="text-white/30 font-mono text-xs">JPG, PNG o PDF — máx 10MB</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 mt-6">
                  <Button variant="ghost" onClick={() => setStep(1)}>
                    <ArrowLeft className="w-4 h-4" /> Atrás
                  </Button>
                  <Button variant="primary" size="lg" className="flex-1" onClick={submitComprobante} loading={uploading} disabled={!comprobante}>
                    Enviar comprobante
                  </Button>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* Step 3: Éxito */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <GlassCard className="p-10 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.2 }}
                  className="w-20 h-20 bg-green-900/30 border-2 border-green-500/50 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <CheckCircle className="w-10 h-10 text-green-400" />
                </motion.div>
                <h2 className="font-display text-4xl mb-3">¡COMPROBANTE<br />RECIBIDO!</h2>
                <p className="text-white/60 font-body mb-2">El vendedor verificará tu pago y se comunicará contigo por WhatsApp.</p>
                <p className="text-white/30 font-mono text-xs mb-8">⚡ Entrega en menos de 24 horas</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link to="/tienda"><Button variant="outline">Seguir comprando</Button></Link>
                  <Link to="/"><Button variant="ghost">Volver al inicio</Button></Link>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}