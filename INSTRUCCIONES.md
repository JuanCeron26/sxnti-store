# Instrucciones para ejecutar el proyecto

## 🚀 Cambios realizados

### Backend
- ✅ Configurado CORS para permitir conexiones desde el frontend
- ✅ Corregida la estructura de rutas de la API
- ✅ Todas las rutas ahora están bajo `/api/v1/`

### Frontend
- ✅ Conectado completamente con el backend real
- ✅ Eliminados todos los datos mock/quemados
- ✅ Integración con endpoints de:
  - Paquetes de diamantes
  - Cuentas FF
  - Métodos de pago
  - Órdenes/compras
  - Comprobantes
  - Autenticación
- ✅ Mejorado el diseño y espaciado:
  - Mejor padding y margins en cards
  - Espaciado consistente en grids
  - Mejor alineación de textos
  - Inputs y botones con mejor tamaño
  - Responsive mejorado
  - Elementos ya no se superponen

## 📋 Requisitos previos

### Backend
- Python 3.10+
- MySQL corriendo en el puerto 3307
- Base de datos `sxnti320` creada

### Frontend
- Node.js 16+
- npm o yarn

## 🔧 Configuración

### 1. Backend

```bash
cd backend

# Crear entorno virtual (si no existe)
python -m venv .venv

# Activar entorno virtual
# En Windows:
.venv\Scripts\activate
# En Linux/Mac:
source .venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Verificar que el archivo .env tenga la configuración correcta
# Ya está configurado con:
# - DB_HOST=localhost
# - DB_PORT=3307
# - DB_NAME=sxnti320
# - DB_USER=root
# - DB_PASSWORD=ceron123

# Ejecutar el servidor
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

El backend estará disponible en: `http://localhost:8000`
Documentación API: `http://localhost:8000/docs`

### 2. Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Ejecutar el servidor de desarrollo
npm run dev
```

El frontend estará disponible en: `http://localhost:5173`

## 🧪 Probar la integración

1. Asegúrate de que el backend esté corriendo en el puerto 8000
2. Asegúrate de que el frontend esté corriendo en el puerto 5173
3. Abre el navegador en `http://localhost:5173`
4. Deberías ver:
   - Los productos cargando desde el backend
   - Los métodos de pago reales en el checkout
   - Todo funcionando sin datos quemados

## 📝 Endpoints principales

### Públicos
- `GET /api/v1/paquetes/` - Listar paquetes de diamantes
- `GET /api/v1/cuentas/` - Listar cuentas FF
- `GET /api/v1/metodos-pago/` - Listar métodos de pago activos
- `POST /api/v1/ordenes/` - Crear una orden
- `POST /api/v1/comprobantes/{orden_id}` - Subir comprobante

### Admin (requieren autenticación)
- `POST /api/v1/auth/login` - Login admin
- `POST /api/v1/paquetes/` - Crear paquete
- `POST /api/v1/cuentas/` - Crear cuenta FF
- `GET /api/v1/ordenes/` - Listar órdenes

## 🎨 Mejoras de diseño aplicadas

1. **Espaciado mejorado**
   - Cards con padding consistente (p-5 en lugar de p-4)
   - Grids con gap-6 en lugar de gap-5
   - Mejor separación entre secciones

2. **Tipografía**
   - Tamaños de fuente más legibles
   - Mejor line-height
   - Textos no se cortan ni se superponen

3. **Componentes**
   - Botones con mejor tamaño y padding
   - Inputs más grandes y fáciles de usar
   - Badges con mejor espaciado interno

4. **Responsive**
   - Mejor adaptación a diferentes tamaños de pantalla
   - Elementos no se amontonan en móviles
   - Grids que se ajustan correctamente

## ⚠️ Notas importantes

1. El backend debe estar corriendo ANTES de iniciar el frontend
2. Si cambias el puerto del backend, actualiza `API_BASE_URL` en `frontend/src/services/api.js`
3. Los métodos de pago se cargan dinámicamente desde la base de datos
4. Las imágenes de productos deben estar en Cloudflare R2 o usar URLs válidas

## 🐛 Solución de problemas

### Error de CORS
- Verifica que el backend tenga configurado CORS correctamente
- El backend ya está configurado para aceptar peticiones desde `localhost:5173`

### No se cargan los productos
- Verifica que la base de datos tenga datos
- Revisa la consola del navegador para ver errores
- Verifica que el backend esté corriendo

### Error 404 en las rutas
- Todas las rutas de la API ahora están bajo `/api/v1/`
- Ejemplo: `http://localhost:8000/api/v1/paquetes/`

## ✅ Todo listo

Si seguiste todos los pasos, tu aplicación debería estar funcionando perfectamente con:
- Backend y frontend conectados
- Datos reales desde la base de datos
- Diseño mejorado y responsive
- Sin elementos superpuestos o mal alineados


## 🔄 Archivos actualizados

### Backend
- `backend/app/main.py` - CORS y rutas corregidas
- `backend/app/api/v1/__init__.py` - Router sin prefix duplicado

### Frontend - Integración con Backend
- `frontend/src/services/api.js` - Integración completa con backend, eliminados todos los datos mock
- `frontend/src/pages/Checkout.jsx` - Métodos de pago dinámicos desde backend
- `frontend/src/pages/ProductoDetalle.jsx` - Métodos de pago cargados desde backend
- `frontend/src/pages/admin/Productos.jsx` - Carga productos desde backend

### Frontend - Mejoras de Diseño
- `frontend/src/pages/Tienda.jsx` - Mejor espaciado y padding
- `frontend/src/pages/Home.jsx` - Mejor espaciado en secciones
- `frontend/src/components/shop/ProductCard.jsx` - Diseño mejorado con mejor padding
- `frontend/src/index.css` - Estilos globales mejorados para mejor responsive
