// services/api.js - API service conectado al backend

const API_BASE_URL = 'http://localhost:8000/api/v1';

// Helper para manejar respuestas
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Error desconocido' }));
    throw new Error(error.detail || 'Error en la petición');
  }
  return response.json();
};

// Helper para headers con auth
const getHeaders = (token = null) => {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

// API calls
export const api = {
  // ─── PRODUCTOS ───────────────────────────────────────────────────────────
  getProducts: async (filters = {}) => {
    try {
      // Obtener paquetes de diamantes
      const paquetesRes = await fetch(`${API_BASE_URL}/paquetes/`);
      const paquetes = await handleResponse(paquetesRes);
      
      // Obtener cuentas FF
      const cuentasRes = await fetch(`${API_BASE_URL}/cuentas/`);
      const cuentas = await handleResponse(cuentasRes);
      
      // Combinar y normalizar datos
      let products = [
        ...paquetes.map(p => ({
          ...p,
          tipo: 'paquete_diamantes',
          imagenes: p.imagen_url ? [{ imagen_url: p.imagen_url, es_principal: true }] : []
        })),
        ...cuentas.map(c => ({
          ...c,
          tipo: 'cuenta_ff',
          imagenes: c.imagenes || []
        }))
      ];
      
      // Aplicar filtros
      if (filters.tipo) {
        products = products.filter(p => p.tipo === filters.tipo);
      }
      if (filters.search) {
        const search = filters.search.toLowerCase();
        products = products.filter(p =>
          p.nombre?.toLowerCase().includes(search) ||
          p.descripcion?.toLowerCase().includes(search)
        );
      }
      
      return products;
    } catch (error) {
      console.error('Error al obtener productos:', error);
      return [];
    }
  },

  getProduct: async (id) => {
    try {
      // Intentar obtener como paquete
      try {
        const res = await fetch(`${API_BASE_URL}/paquetes/${id}`);
        if (res.ok) {
          const paquete = await res.json();
          return {
            ...paquete,
            tipo: 'paquete_diamantes',
            imagenes: paquete.imagen_url ? [{ imagen_url: paquete.imagen_url, es_principal: true }] : []
          };
        }
      } catch (e) {}
      
      // Intentar obtener como cuenta FF
      try {
        const res = await fetch(`${API_BASE_URL}/cuentas/${id}`);
        if (res.ok) {
          const cuenta = await res.json();
          return {
            ...cuenta,
            tipo: 'cuenta_ff',
            imagenes: cuenta.imagenes || []
          };
        }
      } catch (e) {}
      
      return null;
    } catch (error) {
      console.error('Error al obtener producto:', error);
      return null;
    }
  },

  // ─── ÓRDENES ─────────────────────────────────────────────────────────────
  createOrder: async (data) => {
    const res = await fetch(`${API_BASE_URL}/ordenes/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  getOrders: async (token) => {
    const res = await fetch(`${API_BASE_URL}/ordenes/`, {
      headers: getHeaders(token)
    });
    return handleResponse(res);
  },

  getOrder: async (id) => {
    const res = await fetch(`${API_BASE_URL}/ordenes/${id}`);
    return handleResponse(res);
  },

  // ─── MÉTODOS DE PAGO ─────────────────────────────────────────────────────
  getMetodosPago: async () => {
    const res = await fetch(`${API_BASE_URL}/metodos-pago/`);
    return handleResponse(res);
  },

  createMetodoPago: async (data, token) => {
    const res = await fetch(`${API_BASE_URL}/metodos-pago/`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  toggleMetodoPago: async (id, token) => {
    const res = await fetch(`${API_BASE_URL}/metodos-pago/${id}/toggle`, {
      method: 'PATCH',
      headers: getHeaders(token)
    });
    return handleResponse(res);
  },

  // ─── COMPROBANTES ────────────────────────────────────────────────────────
  uploadComprobante: async (ordenId, file) => {
    const formData = new FormData();
    formData.append('archivo', file);  // El backend espera 'archivo', no 'file'
    
    const res = await fetch(`${API_BASE_URL}/comprobantes/${ordenId}`, {
      method: 'POST',
      body: formData
    });
    return handleResponse(res);
  },

  // ─── AUTH ────────────────────────────────────────────────────────────────
  login: async (username, password) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ username, password })
    });
    return handleResponse(res);
  },

  // ─── ADMIN - PAQUETES ────────────────────────────────────────────────────
  createPaquete: async (data, token) => {
    const res = await fetch(`${API_BASE_URL}/paquetes/`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  // ─── ADMIN - CUENTAS FF ──────────────────────────────────────────────────
  getCuentasFF: async () => {
    const res = await fetch(`${API_BASE_URL}/cuentas/`);
    return handleResponse(res);
  },

  createCuentaFF: async (data, token) => {
    const res = await fetch(`${API_BASE_URL}/cuentas/`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  // ─── MEDIOS (IMÁGENES/VIDEOS) ────────────────────────────────────────────
  uploadMedioCuenta: async (cuentaId, file, esPrincipal = false) => {
    const formData = new FormData();
    formData.append('archivo', file);
    formData.append('es_principal', esPrincipal);
    
    const res = await fetch(`${API_BASE_URL}/medios/cuenta/${cuentaId}?es_principal=${esPrincipal}`, {
      method: 'POST',
      body: formData
    });
    return handleResponse(res);
  },

  uploadMedioPaquete: async (paqueteId, file) => {
    const formData = new FormData();
    formData.append('archivo', file);
    
    const res = await fetch(`${API_BASE_URL}/medios/paquete/${paqueteId}`, {
      method: 'POST',
      body: formData
    });
    return handleResponse(res);
  },
};