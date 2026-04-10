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
    
    {/* Background grid - Ajustado para ser más sutil y técnico */}
    <div className="absolute inset-0 opacity-[0.03]"
      style={{
        backgroundImage: 'linear-gradient(rgba(255,0,0,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,0,0,1) 1px, transparent 1px)',
        backgroundSize: '30px 30px',
      }}
    />

    {/* Glow central dinámico */}
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
      style={{ 
        background: 'radial-gradient(circle, rgba(220,38,38,0.15) 0%, transparent 70%)', 
        filter: 'blur(60px)' 
      }}
    />

    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full max-w-[400px] relative z-10"
    >
      {/* Card Principal */}
      <div className="bg-[#050505] border border-white/5 rounded-[2rem] shadow-[0_0_50px_rgba(0,0,0,1)] overflow-hidden">
        
        <div style={{ padding: '48px 40px' }}>
          
          {/* Icono con efecto de profundidad */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-20 h-20 bg-red-600/10 border border-red-500/20 rounded-3xl flex items-center justify-center ">
                <Shield className="w-9 h-9 text-red-500" />
              </div>
              <div className="absolute inset-0 rounded-3xl bg-red-500/20 blur-2xl -z-10" />
            </div>
          </div>

          <div className="text-center mb-10">
            <h1 className="font-display text-4xl tracking-tighter text-white mb-2 uppercase">PANEL ADMIN</h1>
            <div className="flex items-center justify-center gap-2">
              <div className="h-[1px] w-4 bg-red-500/50" />
              <p className="text-white/30 font-mono text-[10px] uppercase tracking-[0.3em]">Acceso Restringido</p>
              <div className="h-[1px] w-4 bg-red-500/50" />
            </div>
          </div>

          <form onSubmit={onSubmit} className="flex flex-col gap-6" style={{marginBottom: '20px'}}>
            {/* Input Usuario */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] ml-1 font-mono">Usuario</label>
              <Input
                placeholder="XXXXXX"
                error={errors.username?.message}
                className="!bg-white/[0.02] !border-white/10 focus:!border-red-500/50 !h-12 !px-4"
                {...register('username')}
              />
            </div>

            {/* Input Contraseña */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] ml-1 font-mono">Contraseña</label>
              <div className="relative group">
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...register('password')}
                  className={`w-full bg-white/[0.02] border ${errors.password ? 'border-red-500/50' : 'border-white/10'} 
                    group-hover:border-white/20 focus:border-red-500/50 text-white placeholder:text-white/20 
                    rounded-xl px-4 h-12 font-body text-base transition-all focus:outline-none focus:ring-1 focus:ring-red-500/20`}
                    style={{ paddingLeft: '16px'}}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <span className="text-[10px] text-red-500 font-mono uppercase tracking-wider ml-1">{errors.password.message}</span>}
            </div>

            {/* Botón de Ingreso */}
            <Button 
              type="submit" 
              variant="primary" 
              size="lg" 
              loading={loading} 
              className="mt-4 w-full !h-14 !rounded-xl !bg-red-600 hover:!bg-red-500 transition-transform active:scale-[0.98]"
            >
              <span className="font-display tracking-[0.15em] text-sm">ENTRAR AL SISTEMA</span> 
              <Zap className="w-4 h-4 fill-current ml-2" />
            </Button>
          </form>

          {/* Footer del Login */}
          <div className="mt-10 pt-8 border-t border-white/5">
            <p className="text-center text-white/20 font-mono text-[9px] uppercase tracking-[0.2em] leading-relaxed">
              Credenciales de prueba:<br/>
              <span className="text-white/40">admin / admin123</span>
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  </div>
);
}