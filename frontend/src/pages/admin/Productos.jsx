// pages/admin/Productos.jsx
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Edit2, Trash2, X, Upload, Package, CheckCircle } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import { mockProducts } from '../../services/api';
import { formatCOP } from '../../utils/context';
import { Button, Input, Textarea, Select, GlassCard, Badge } from '../../components/ui';

const schema = z.object({
  nombre: z.string().min(3, 'Mínimo 3 caracteres'),
  tipo: z.enum(['cuenta_ff', 'paquete_diamantes']),
  precio: z.coerce.number().min(1000, 'Precio mínimo $1.000'),
  descripcion: z.string().optional(),
  nivel: z.coerce.number().optional(),
  rango: z.string().optional(),
  diamantes: z.coerce.number().optional(),
  personajes: z.coerce.number().optional(),
  skins: z.coerce.number().optional(),
  cantidad_diamantes: z.coerce.number().optional(),
});

function ImageDropzone({ onFile, file }) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': [] },
    maxSize: 5 * 1024 * 1024,
    onDrop: (files) => files[0] && onFile(files[0]),
    onDropRejected: () => toast.error('Imagen inválida. Máx 5MB.'),
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200
        ${isDragActive ? 'border-red-500 bg-red-900/10' :
          file ? 'border-green-500/50 bg-green-900/10' :
          'border-white/20 hover:border-red-500/40 hover:bg-red-900/5'}`}
    >
      <input {...getInputProps()} />
      {file ? (
        <div className="flex flex-col items-center gap-2">
          <CheckCircle className="w-7 h-7 text-green-400" />
          <p className="text-green-400 font-mono text-sm">{file.name}</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <Upload className="w-7 h-7 text-white/20" />
          <p className="text-white/40 font-body text-sm">{isDragActive ? 'Suelta aquí' : 'Sube la imagen del producto'}</p>
          <p className="text-white/20 font-mono text-xs">JPG, PNG — máx 5MB</p>
        </div>
      )}
    </div>
  );
}

function ProductModal({ product, onClose, onSave }) {
  const isEdit = !!product;
  const [imgFile, setImgFile] = useState(null);

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: product || { tipo: 'cuenta_ff' },
  });

  const tipo = watch('tipo');

  const onSubmit = handleSubmit((data) => {
    onSave({ ...data, id: product?.id || String(Date.now()), imagenes: product?.imagenes || [] });
    toast.success(isEdit ? 'Producto actualizado' : 'Producto creado');
    onClose();
  });

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
        className="bg-[#0d0d0d] border border-white/15 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-[0_20px_80px_rgba(0,0,0,0.9)]"
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 sticky top-0 bg-[#0d0d0d] z-10">
          <h2 className="font-display text-xl tracking-widest">{isEdit ? 'EDITAR' : 'NUEVO'} PRODUCTO</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 flex flex-col gap-4">
          <Select label="Tipo de producto" error={errors.tipo?.message} {...register('tipo')}>
            <option value="cuenta_ff">🎮 Cuenta Free Fire</option>
            <option value="paquete_diamantes">💎 Paquete de Diamantes</option>
          </Select>

          <Input label="Nombre" placeholder="Ej: Cuenta Heroico Full Skins" error={errors.nombre?.message} {...register('nombre')} />
          <Textarea label="Descripción" placeholder="Describe el producto..." rows={3} {...register('descripcion')} />
          <Input label="Precio (COP)" type="number" placeholder="150000" error={errors.precio?.message} {...register('precio')} />

          {tipo === 'cuenta_ff' && (
            <div className="grid grid-cols-2 gap-3">
              <Input label="Nivel" type="number" placeholder="80" {...register('nivel')} />
              <Input label="Rango" placeholder="Heroico" {...register('rango')} />
              <Input label="Diamantes" type="number" placeholder="5000" {...register('diamantes')} />
              <Input label="Personajes" type="number" placeholder="12" {...register('personajes')} />
              <Input label="Skins" type="number" placeholder="30" {...register('skins')} />
            </div>
          )}

          {tipo === 'paquete_diamantes' && (
            <Input label="Cantidad de diamantes" type="number" placeholder="310" error={errors.cantidad_diamantes?.message} {...register('cantidad_diamantes')} />
          )}

          <ImageDropzone onFile={setImgFile} file={imgFile} />

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={onClose} className="flex-1">Cancelar</Button>
            <Button type="submit" variant="primary" size="lg" className="flex-1">
              {isEdit ? 'Guardar cambios' : 'Crear producto'}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default function AdminProductos() {
  const [products, setProducts] = useState(mockProducts);
  const [modal, setModal] = useState(null); // null | 'new' | product

  const handleSave = (data) => {
    setProducts(prev => {
      const exists = prev.find(p => p.id === data.id);
      return exists ? prev.map(p => p.id === data.id ? { ...p, ...data } : p) : [data, ...prev];
    });
  };

  const handleDelete = (id) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    toast.success('Producto eliminado');
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-white/40 font-mono text-xs uppercase tracking-wider mb-1">Admin</p>
          <h1 className="font-display text-3xl text-white">PRODUCTOS</h1>
        </div>
        <Button variant="primary" onClick={() => setModal('new')}>
          <Plus className="w-4 h-4" /> Nuevo producto
        </Button>
      </div>

      {/* Products grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <AnimatePresence>
          {products.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: i * 0.04 }}
            >
              <GlassCard className="overflow-hidden group">
                <div className="relative aspect-[16/9] bg-black/60">
                  <img
                    src={p.imagenes?.[0]?.imagen_url || 'https://placehold.co/400x225/111/333?text=FF'}
                    alt={p.nombre}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute top-2 left-2 flex gap-1.5">
                    <Badge variant={p.tipo === 'cuenta_ff' ? 'red' : 'blue'}>
                      {p.tipo === 'cuenta_ff' ? '🎮 Cuenta' : '💎 Diamantes'}
                    </Badge>
                  </div>
                  {/* Action buttons on hover */}
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setModal(p)}
                      className="w-7 h-7 bg-black/70 hover:bg-blue-600 border border-white/20 rounded flex items-center justify-center transition-all"
                    >
                      <Edit2 className="w-3 h-3 text-white" />
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="w-7 h-7 bg-black/70 hover:bg-red-600 border border-white/20 rounded flex items-center justify-center transition-all"
                    >
                      <Trash2 className="w-3 h-3 text-white" />
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <p className="font-body font-bold text-white text-sm mb-1 truncate">{p.nombre}</p>
                  <div className="flex items-center justify-between">
                    <p className="font-display text-lg text-red-400">{formatCOP(p.precio)}</p>
                    {p.tipo === 'cuenta_ff' && (
                      <p className="text-white/30 font-mono text-xs">Nv.{p.nivel} · {p.skins} skins</p>
                    )}
                    {p.tipo === 'paquete_diamantes' && (
                      <p className="text-white/30 font-mono text-xs">💎 {p.cantidad_diamantes}</p>
                    )}
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modal && (
          <ProductModal
            product={modal === 'new' ? null : modal}
            onClose={() => setModal(null)}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>
    </div>
  );
}