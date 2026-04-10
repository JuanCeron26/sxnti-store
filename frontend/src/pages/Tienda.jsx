// pages/Tienda.jsx
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, X, Zap } from 'lucide-react';
import { api } from '../services/api';
import ProductCard from '../components/shop/ProductCard';
import { SectionTitle, Spinner } from '../components/ui';

const FILTROS_TIPO = [
  { value: '', label: 'Todo', icon: '⚡' },
  { value: 'cuenta_ff', label: 'Cuentas FF', icon: '🎮' },
  { value: 'paquete_diamantes', label: 'Diamantes', icon: '💎' },
];

const FILTROS_PRECIO = [
  { value: '', label: 'Cualquier precio' },
  { value: '0-50000', label: 'Menos de $50.000' },
  { value: '50000-150000', label: '$50.000 – $150.000' },
  { value: '150000-999999', label: 'Más de $150.000' },
];

const SORT_OPTIONS = [
  { value: 'recent', label: 'Más recientes' },
  { value: 'price_asc', label: 'Menor precio' },
  { value: 'price_desc', label: 'Mayor precio' },
];

export default function Tienda() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tipo, setTipo] = useState(searchParams.get('tipo') || '');
  const [precio, setPrecio] = useState('');
  const [sort, setSort] = useState('recent');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    api.getProducts().then(p => {
      setProducts(p);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const t = searchParams.get('tipo') || '';
    setTipo(t);
  }, [searchParams]);

  useEffect(() => {
    let result = [...products];

    if (tipo) result = result.filter(p => p.tipo === tipo);
    if (search) result = result.filter(p =>
      p.nombre.toLowerCase().includes(search.toLowerCase()) ||
      p.descripcion?.toLowerCase().includes(search.toLowerCase())
    );
    if (precio) {
      const [min, max] = precio.split('-').map(Number);
      result = result.filter(p => p.precio >= min && p.precio <= max);
    }

    if (sort === 'price_asc') result.sort((a, b) => a.precio - b.precio);
    else if (sort === 'price_desc') result.sort((a, b) => b.precio - a.precio);

    setFiltered(result);
  }, [products, tipo, search, precio, sort]);

  const clearFilters = () => {
    setSearch('');
    setTipo('');
    setPrecio('');
    setSort('recent');
    setSearchParams({});
  };

  const hasFilters = search || tipo || precio;

  return (
    <div className="min-h-screen bg-black pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="mb-8" style={{ paddingTop: '80px', marginBottom: '20px'}}>
          <SectionTitle sub="Catálogo completo">
            TIENDA
          </SectionTitle>
        </div>

        {/* Filters bar */}
        <div className="bg-[#0d0d0d] border border-white/10 rounded-2xl p-5 mb-12 shadow-2xl">
  <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-5">

    {/* Search - Rediseñado para que respire */}
    <div className="relative flex-2 border-white" style={{marginLeft: '10px'}}>
      {/*}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
        <Search className="w-5 h-5 text-red-500/50" />
      </div> */}
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Buscar cuentas, diamantes..."
        className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-10 py-3.5 text-white placeholder:text-white/20 font-body text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500/50 transition-all"
      />
      {search && (
        <button 
          onClick={() => setSearch('')} 
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>

    {/* Tipo tabs - Más modernas y espaciosas */}
    <div className="flex flex-1 items-center gap-1.5 bg-black/60 border border-white/5 rounded-xl p-1.5">
      {FILTROS_TIPO.map(f => (
        <button
          key={f.value}
          onClick={() => {
            setTipo(f.value);
            setSearchParams(f.value ? { tipo: f.value } : {});
          }}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-display font-bold uppercase tracking-widest transition-all duration-300
            ${tipo === f.value
              ? 'bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.3)]'
              : 'text-white/40 hover:text-white hover:bg-white/5'
            }`}
        >
          <span className="text-base">{f.icon}</span>
          <span className="hidden xl:inline">{f.label}</span>
        </button>
      ))}
    </div>

    {/* Sort - Estilizado como los demás */}
    <div className="flex-1">
      <select
        value={sort}
        onChange={e => setSort(e.target.value)}
        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white/70 font-display text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-red-500/50 cursor-pointer appearance-none"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%23cc0000\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'org/19/9\' /%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1em' }}
      >
        {SORT_OPTIONS.map(o => <option key={o.value} value={o.value} className="bg-[#0d0d0d]">{o.label}</option>)}
      </select>
    </div>
  </div>

  {/* Active filters - Separación corregida */}
  {hasFilters && (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 mt-5 pt-5 border-t border-white/5 flex-wrap"
    >
      <span className="text-white/20 font-mono text-[10px] uppercase tracking-[2px]">Filtros aplicados:</span>
      {tipo && (
        <div className="flex items-center gap-2 px-3 py-1 bg-red-600/10 border border-red-600/30 rounded-full text-[10px] font-bold text-red-500 uppercase tracking-tighter">
          {FILTROS_TIPO.find(f => f.value === tipo)?.label}
          <button onClick={() => { setTipo(''); setSearchParams({}); }}><X className="w-3 h-3" /></button>
        </div>
      )}
      {search && (
        <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold text-white/50 uppercase tracking-tighter">
          "{search}"
          <button onClick={() => setSearch('')}><X className="w-3 h-3" /></button>
        </div>
      )}
      <button onClick={clearFilters} className="ml-auto text-[10px] text-white/20 hover:text-red-500 uppercase font-bold tracking-widest transition-colors">
        Resetear
      </button>
    </motion.div>
  )}
        </div>

        {/* Results info */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-white/40 font-mono text-sm">
            {loading ? '...' : `${filtered.length} producto${filtered.length !== 1 ? 's' : ''} encontrado${filtered.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <Spinner size="lg" />
              <p className="text-white/30 font-mono text-sm uppercase tracking-widest">Cargando...</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-24 gap-4 text-center"
          >
            <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center">
              <Search className="w-7 h-7 text-white/20" />
            </div>
            <p className="text-white/40 font-body text-lg">No se encontraron productos</p>
            <button onClick={clearFilters} className="text-red-400 hover:text-red-300 font-mono text-sm uppercase tracking-wider transition-colors">
              Limpiar filtros
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        )}
      </div>
    </div>
  );
}