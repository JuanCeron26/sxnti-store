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
        <div className="mb-8">
          <SectionTitle sub="Catálogo completo">
            TIENDA
          </SectionTitle>
        </div>

        {/* Filters bar */}
        <div className="bg-[#0d0d0d] border border-white/10 rounded-xl p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4">

            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar cuentas, diamantes..."
                className="w-full bg-black/50 border border-white/15 rounded px-10 py-2.5 text-white placeholder:text-white/30 font-body text-sm focus:outline-none focus:border-red-500 transition-colors"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Tipo tabs */}
            <div className="flex items-center gap-1 bg-black/40 border border-white/10 rounded-lg p-1">
              {FILTROS_TIPO.map(f => (
                <button
                  key={f.value}
                  onClick={() => {
                    setTipo(f.value);
                    setSearchParams(f.value ? { tipo: f.value } : {});
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-body font-semibold uppercase tracking-wider transition-all duration-200
                    ${tipo === f.value
                      ? 'bg-red-600 text-white shadow-[0_0_12px_rgba(255,0,0,0.4)]'
                      : 'text-white/50 hover:text-white hover:bg-white/5'
                    }`}
                >
                  <span>{f.icon}</span>
                  <span className="hidden sm:inline">{f.label}</span>
                </button>
              ))}
            </div>

            {/* Sort */}
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="bg-black/50 border border-white/15 rounded px-3 py-2.5 text-white font-body text-sm focus:outline-none focus:border-red-500 min-w-[150px]"
            >
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {/* Active filters */}
          {hasFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="flex items-center gap-2 mt-3 pt-3 border-t border-white/10 flex-wrap"
            >
              <span className="text-white/30 font-mono text-xs uppercase tracking-wider">Filtros activos:</span>
              {tipo && (
                <span className="flex items-center gap-1 px-2 py-1 bg-red-900/30 border border-red-800/50 rounded text-xs font-mono text-red-400">
                  {FILTROS_TIPO.find(f => f.value === tipo)?.label}
                  <button onClick={() => { setTipo(''); setSearchParams({}); }}><X className="w-3 h-3" /></button>
                </span>
              )}
              {search && (
                <span className="flex items-center gap-1 px-2 py-1 bg-white/10 border border-white/20 rounded text-xs font-mono text-white/60">
                  "{search}"
                  <button onClick={() => setSearch('')}><X className="w-3 h-3" /></button>
                </span>
              )}
              <button onClick={clearFilters} className="ml-auto text-white/30 hover:text-red-400 font-mono text-xs uppercase tracking-wider transition-colors">
                Limpiar todo
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