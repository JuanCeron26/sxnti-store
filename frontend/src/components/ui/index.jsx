// components/ui/index.jsx
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

// ─── BUTTON ──────────────────────────────────────────────────────────────────
export function Button({ children, variant = 'primary', size = 'md', className, onClick, type = 'button', disabled, loading }) {
  const base = 'inline-flex items-center justify-center gap-2 font-display tracking-widest uppercase transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer';

  const variants = {
    primary: 'bg-red-600 hover:bg-red-500 text-white border border-red-500 hover:shadow-[0_0_20px_rgba(255,0,0,0.5)] active:scale-95',
    outline: 'bg-transparent border border-red-600 text-red-500 hover:bg-red-600 hover:text-white hover:shadow-[0_0_20px_rgba(255,0,0,0.4)] active:scale-95',
    ghost: 'bg-white/5 border border-white/10 text-white hover:bg-white/10 active:scale-95',
    danger: 'bg-red-900 border border-red-700 text-red-300 hover:bg-red-700 hover:text-white active:scale-95',
  };

  const sizes = {
    sm: 'px-4 py-1.5 text-sm rounded',
    md: 'px-6 py-2.5 text-base rounded',
    lg: 'px-8 py-3.5 text-lg rounded-lg',
    xl: 'px-10 py-4 text-xl rounded-lg',
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      className={clsx(base, variants[variant], sizes[size], className)}
    >
      {loading ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : children}
    </motion.button>
  );
}

// ─── BADGE ───────────────────────────────────────────────────────────────────
export function Badge({ children, variant = 'default' }) {
  const variants = {
    default: 'bg-white/10 text-white/70 border-white/20',
    red: 'bg-red-900/50 text-red-400 border-red-800',
    green: 'bg-green-900/50 text-green-400 border-green-800',
    blue: 'bg-blue-900/50 text-blue-400 border-blue-800',
    yellow: 'bg-yellow-900/50 text-yellow-400 border-yellow-800',
  };
  return (
    <span className={clsx('inline-flex items-center px-2 py-0.5 text-xs font-mono rounded border uppercase tracking-wider', variants[variant])}>
      {children}
    </span>
  );
}

// ─── INPUT ───────────────────────────────────────────────────────────────────
export function Input({ label, error, className, icon, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-semibold text-white/70 uppercase tracking-wider font-mono">{label}</label>}
      <div className="relative">
        {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">{icon}</span>}
        <input
          {...props}
          className={clsx(
            'w-full bg-black/50 border text-white placeholder:text-white/30 rounded font-body text-base transition-all duration-200',
            'focus:outline-none focus:border-red-500 focus:shadow-[0_0_0_2px_rgba(255,0,0,0.15)]',
            error ? 'border-red-500' : 'border-white/15 hover:border-white/30',
            icon ? 'pl-10 pr-4 py-2.5' : 'px-4 py-2.5',
            className
          )}
        />
      </div>
      {error && <span className="text-xs text-red-400 font-mono">{error}</span>}
    </div>
  );
}

// ─── TEXTAREA ────────────────────────────────────────────────────────────────
export function Textarea({ label, error, className, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-semibold text-white/70 uppercase tracking-wider font-mono">{label}</label>}
      <textarea
        {...props}
        className={clsx(
          'w-full bg-black/50 border text-white placeholder:text-white/30 rounded font-body text-base transition-all duration-200 resize-none',
          'focus:outline-none focus:border-red-500 focus:shadow-[0_0_0_2px_rgba(255,0,0,0.15)]',
          error ? 'border-red-500' : 'border-white/15 hover:border-white/30',
          'px-4 py-2.5',
          className
        )}
      />
      {error && <span className="text-xs text-red-400 font-mono">{error}</span>}
    </div>
  );
}

// ─── SELECT ──────────────────────────────────────────────────────────────────
export function Select({ label, error, className, children, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-semibold text-white/70 uppercase tracking-wider font-mono">{label}</label>}
      <select
        {...props}
        className={clsx(
          'w-full bg-black/80 border text-white rounded font-body text-base transition-all duration-200',
          'focus:outline-none focus:border-red-500',
          error ? 'border-red-500' : 'border-white/15',
          'px-4 py-2.5',
          className
        )}
      >
        {children}
      </select>
      {error && <span className="text-xs text-red-400 font-mono">{error}</span>}
    </div>
  );
}

// ─── GLASS CARD ──────────────────────────────────────────────────────────────
export function GlassCard({ children, className, hover = false, glow = false }) {
  return (
    <motion.div
      whileHover={hover ? { y: -4, scale: 1.01 } : {}}
      className={clsx(
        'bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-xl',
        glow && 'hover:border-red-500/50 hover:shadow-[0_0_20px_rgba(255,0,0,0.15)]',
        'transition-all duration-300',
        className
      )}
    >
      {children}
    </motion.div>
  );
}

// ─── DIVIDER ─────────────────────────────────────────────────────────────────
export function RedDivider({ className }) {
  return (
    <div className={clsx('flex items-center gap-3', className)}>
      <div className="flex-1 h-px bg-gradient-to-r from-transparent to-red-600/50" />
      <div className="w-2 h-2 bg-red-600 rotate-45" />
      <div className="flex-1 h-px bg-gradient-to-l from-transparent to-red-600/50" />
    </div>
  );
}

// ─── SECTION TITLE ───────────────────────────────────────────────────────────
export function SectionTitle({ children, sub, center = false }) {
  return (
    <div className={clsx('mb-8', center && 'text-center')}>
      {sub && <p className="text-red-500 font-mono text-sm uppercase tracking-[4px] mb-2">{sub}</p>}
      <h2 className="font-display text-4xl md:text-5xl text-white leading-tight">{children}</h2>
      <div className={clsx('mt-3 flex', center ? 'justify-center' : '')}>
        <div className="h-0.5 w-16 bg-red-600" />
        <div className="h-0.5 w-4 bg-red-600/40 ml-1" />
      </div>
    </div>
  );
}

// ─── SPINNER ─────────────────────────────────────────────────────────────────
export function Spinner({ size = 'md' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div className={clsx('border-2 border-red-600/30 border-t-red-600 rounded-full animate-spin', sizes[size])} />
  );
}