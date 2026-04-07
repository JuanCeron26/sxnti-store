// services/api.js - Mock data & API service

export const mockProducts = [
  {
    id: '1',
    tipo: 'cuenta_ff',
    nombre: 'Cuenta Heroico Full Skins',
    descripcion: 'Cuenta con más de 30 skins épicas, nivel 80, rango Heroico. Personajes desbloqueados: Alok, Chrono, K.',
    precio: 150000,
    nivel: 80,
    rango: 'Heroico',
    diamantes: 5200,
    personajes: 12,
    skins: 34,
    activo: true,
    vendida: false,
    creado_en: '2024-01-15',
    imagenes: [
      { id: '1', imagen_url: 'https://placehold.co/600x400/1a0000/FF0000?text=CUENTA+FF&font=bebas-neue', es_principal: true, orden: 0 },
    ]
  },
  {
    id: '2',
    tipo: 'paquete_diamantes',
    nombre: '100 Diamantes',
    descripcion: 'Recarga instantánea de 100 diamantes para tu cuenta Free Fire.',
    precio: 12000,
    cantidad_diamantes: 100,
    activo: true,
    imagenes: [
      { id: '2', imagen_url: 'https://placehold.co/600x400/0a0a1a/0066FF?text=100+💎&font=bebas-neue', es_principal: true, orden: 0 },
    ]
  },
  {
    id: '3',
    tipo: 'paquete_diamantes',
    nombre: '310 Diamantes',
    descripcion: 'Recarga de 310 diamantes. La más popular para sacar skins del giro.',
    precio: 32000,
    cantidad_diamantes: 310,
    activo: true,
    imagenes: [
      { id: '3', imagen_url: 'https://placehold.co/600x400/0a0a1a/0066FF?text=310+💎&font=bebas-neue', es_principal: true, orden: 0 },
    ]
  },
  {
    id: '4',
    tipo: 'cuenta_ff',
    nombre: 'Cuenta Gran Maestro Rara',
    descripcion: 'Cuenta Gran Maestro con skins de élite, accesorios y mascotas exclusivas.',
    precio: 280000,
    nivel: 95,
    rango: 'Gran Maestro',
    diamantes: 12000,
    personajes: 18,
    skins: 67,
    activo: true,
    vendida: false,
    creado_en: '2024-01-10',
    imagenes: [
      { id: '4', imagen_url: 'https://placehold.co/600x400/1a0000/FF0000?text=GRAN+MAESTRO&font=bebas-neue', es_principal: true, orden: 0 },
    ]
  },
  {
    id: '5',
    tipo: 'paquete_diamantes',
    nombre: '520 Diamantes',
    descripcion: 'Recarga de 520 diamantes. Ideal para el pase de élite mensual.',
    precio: 52000,
    cantidad_diamantes: 520,
    activo: true,
    imagenes: [
      { id: '5', imagen_url: 'https://placehold.co/600x400/0a0a1a/0066FF?text=520+💎&font=bebas-neue', es_principal: true, orden: 0 },
    ]
  },
  {
    id: '6',
    tipo: 'cuenta_ff',
    nombre: 'Cuenta Platino Starter',
    descripcion: 'Cuenta nivel 45 con skins básicas y buenos personajes para empezar.',
    precio: 45000,
    nivel: 45,
    rango: 'Platino',
    diamantes: 800,
    personajes: 5,
    skins: 12,
    activo: true,
    vendida: false,
    creado_en: '2024-01-20',
    imagenes: [
      { id: '6', imagen_url: 'https://placehold.co/600x400/1a0000/FF0000?text=PLATINO&font=bebas-neue', es_principal: true, orden: 0 },
    ]
  },
];

export const mockOrders = [
  {
    id: 'ord-001',
    tipo: 'cuenta_ff',
    nombre_cliente: 'Carlos Mendez',
    whatsapp_cliente: '573001234567',
    producto: 'Cuenta Heroico Full Skins',
    precio: 150000,
    metodo_pago: 'Nequi',
    url_comprobante: 'https://placehold.co/400x600/111/333?text=Comprobante',
    estado: 'pendiente',
    creado_en: '2024-01-25T14:30:00',
  },
  {
    id: 'ord-002',
    tipo: 'paquete_diamantes',
    nombre_cliente: 'Ana García',
    whatsapp_cliente: '573009876543',
    producto: '310 Diamantes',
    precio: 32000,
    metodo_pago: 'Bancolombia',
    url_comprobante: 'https://placehold.co/400x600/111/333?text=Comprobante',
    estado: 'aprobada',
    creado_en: '2024-01-25T12:00:00',
  },
  {
    id: 'ord-003',
    tipo: 'cuenta_ff',
    nombre_cliente: 'Miguel Torres',
    whatsapp_cliente: '573005551234',
    producto: 'Cuenta Gran Maestro Rara',
    precio: 280000,
    metodo_pago: 'Nequi',
    url_comprobante: null,
    estado: 'pendiente',
    creado_en: '2024-01-25T10:15:00',
  },
];

export const mockMetodosPago = [
  { id: '1', nombre: 'Nequi', datos_cuenta: '3001234567', instrucciones: 'Enviar al número 300-123-4567', activo: true, icon: '📱' },
  { id: '2', nombre: 'Bancolombia', datos_cuenta: '123-456789-12', instrucciones: 'Transferencia a cuenta de ahorros', activo: true, icon: '🏦' },
  { id: '3', nombre: 'Western Union', datos_cuenta: 'Juan Pérez - Colombia', instrucciones: 'Envío a nombre de Juan Pérez', activo: true, icon: '💸' },
  { id: '4', nombre: 'Zelle', datos_cuenta: 'sxntistore@gmail.com', instrucciones: 'Enviar al correo registrado', activo: false, icon: '💳' },
];

// Simulated API calls
export const api = {
  getProducts: async (filters = {}) => {
    await new Promise(r => setTimeout(r, 300));
    let products = [...mockProducts];
    if (filters.tipo) products = products.filter(p => p.tipo === filters.tipo);
    if (filters.search) products = products.filter(p =>
      p.nombre.toLowerCase().includes(filters.search.toLowerCase())
    );
    return products;
  },

  getProduct: async (id) => {
    await new Promise(r => setTimeout(r, 200));
    return mockProducts.find(p => p.id === id);
  },

  createOrder: async (data) => {
    await new Promise(r => setTimeout(r, 500));
    return { id: `ord-${Date.now()}`, ...data, creado_en: new Date().toISOString() };
  },

  getOrders: async () => {
    await new Promise(r => setTimeout(r, 300));
    return mockOrders;
  },

  login: async (username, password) => {
    await new Promise(r => setTimeout(r, 600));
    if (username === 'admin' && password === 'admin123') {
      return { access_token: 'mock-jwt-token', token_type: 'bearer' };
    }
    throw new Error('Credenciales incorrectas');
  },
};