// pages/admin/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Shield, Eye, EyeOff, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../../services/api';
import { useAuth } from '../../utils/context';
import { Button, Input } from '../../components/ui';

const schema = z.object({
  username: z.string().min(1, 'Requerido'),
  password: z.string().min(1, 'Requerido'),
});

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = handleSubmit(async (data) => {
    setLoading(true);
    try {
      const res = await api.login(data.username, data.password);
      login(res.access_token);
      toast.success('Bienvenido al panel admin');
      navigate('/admin/dashboard');
    } catch (e) {
      toast.error('Credenciales incorrectas');
    } finally {
      setLoading(false);
    }
  });

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 relative overflow-hidden">

      {/* Background grid */}
      <div className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,0,0,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,0,0,1) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Center glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(139,0,0,0.25) 0%, transparent 70%)', filter: 'blur(40px)' }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm relative z-10"
      >
        {/* Card */}
        <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 shadow-[0_20px_80px_rgba(0,0,0,0.8)]">

          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-16 h-16 bg-red-900/30 border border-red-800/50 rounded-full flex items-center justify-center">
                <Shield className="w-7 h-7 text-red-500" />
              </div>
              <div className="absolute inset-0 rounded-full bg-red-500/10 blur-xl" />
            </div>
          </div>

          <div className="text-center mb-7">
            <h1 className="font-display text-3xl tracking-widest text-white mb-1">PANEL ADMIN</h1>
            <p className="text-white/40 font-mono text-xs uppercase tracking-wider">SXNTI STORE</p>
          </div>

          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <Input
              label="Usuario"
              placeholder="admin"
              error={errors.username?.message}
              icon={<Shield className="w-4 h-4" />}
              {...register('username')}
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-white/70 uppercase tracking-wider font-mono">Contraseña</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...register('password')}
                  className="w-full bg-black/50 border border-white/15 hover:border-white/30 focus:border-red-500 text-white placeholder:text-white/30 rounded px-4 py-2.5 pr-10 font-body text-base transition-all focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <span className="text-xs text-red-400 font-mono">{errors.password.message}</span>}
            </div>

            <Button type="submit" variant="primary" size="lg" loading={loading} className="mt-2 w-full">
              <Zap className="w-4 h-4" fill="currentColor" /> Ingresar
            </Button>
          </form>

          <p className="text-center text-white/20 font-mono text-xs mt-5">
            Credenciales de prueba: admin / admin123
          </p>
        </div>
      </motion.div>
    </div>
  );
}