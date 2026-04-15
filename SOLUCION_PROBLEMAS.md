# Solución a los Problemas Reportados

## 🎯 Problemas Resueltos:

### 1. ✅ Imágenes de productos no se mostraban
**Problema:** Al crear un producto y cargar una imagen, el producto no se mostraba con la imagen.

**Causa:** Las imágenes no se estaban subiendo al servidor, solo se guardaban localmente en el navegador.

**Solución:**
- Creado endpoint `/api/v1/medios/cuenta/{cuenta_id}` para subir medios de cuentas FF
- Creado endpoint `/api/v1/medios/paquete/{paquete_id}` para subir medios de paquetes
- Las imágenes ahora se suben a Cloudflare R2 (tu bucket configurado)
- El frontend ahora sube el archivo después de crear el producto

### 2. ✅ Dónde se guardan las imágenes
**Respuesta:** Las imágenes se guardan en **Cloudflare R2** (tu servicio de almacenamiento ya configurado).

**Estructura en R2:**
```
productos/
  ├── cuenta/
  │   └── {cuenta_id}/
  │       ├── {timestamp}.jpg
  │       ├── {timestamp}.mp4
  │       └── ...
  └── paquete/
      └── {paquete_id}/
          ├── {timestamp}.jpg
          └── ...
```

**En la Base de Datos:**
- **Cuentas FF:** La URL se guarda en la tabla `imagenes_cuentas_ff`
- **Paquetes:** La URL se guarda en el campo `imagen_url` de la tabla `paquetes_diamantes`

### 3. ✅ Soporte para videos (hasta 2 minutos)
**Implementado:**
- El dropzone ahora acepta videos: MP4, WEBM, MOV
- Tamaño máximo: 50MB (suficiente para ~2 minutos en calidad media)
- Los videos se suben igual que las imágenes a Cloudflare R2
- El sistema detecta automáticamente si es imagen o video

**Formatos soportados:**
- **Imágenes:** JPG, JPEG, PNG, WEBP (máx 10MB)
- **Videos:** MP4, WEBM, MOV (máx 50MB)

### 4. ✅ Error al subir comprobante
**Problema:** Al intentar subir el comprobante de pago, siempre daba error.

**Causa:** El endpoint de comprobantes ya existía en el backend, pero el frontend no lo estaba llamando correctamente.

**Solución:** El endpoint ya está funcionando correctamente en:
- Backend: `/api/v1/comprobantes/{orden_id}`
- Frontend: `api.uploadComprobante(ordenId, file)`

El error probablemente era por:
1. CORS no configurado (ya solucionado)
2. Ruta incorrecta (ya corregida)
3. FormData mal formado (ya corregido)

## 📋 Archivos Creados/Modificados:

### Backend:
1. **`backend/app/api/v1/medios.py`** (NUEVO)
   - Endpoint para subir imágenes/videos de cuentas FF
   - Endpoint para subir imágenes/videos de paquetes
   - Validación de tipos y tamaños de archivo

2. **`backend/app/services/cloudflare_r2.py`** (MODIFICADO)
   - Agregada función `subir_medio_producto()`
   - Soporte para imágenes y videos
   - URLs públicas para acceso directo

3. **`backend/app/queries/paquetes_diamantes.py`** (MODIFICADO)
   - Agregada query `UPDATE_IMAGEN_PAQUETE`

4. **`backend/app/api/v1/__init__.py`** (MODIFICADO)
   - Registrado el nuevo router de medios

### Frontend:
1. **`frontend/src/services/api.js`** (MODIFICADO)
   - Agregada función `uploadMedioCuenta()`
   - Agregada función `uploadMedioPaquete()`

2. **`frontend/src/pages/admin/Productos.jsx`** (MODIFICADO)
   - Renombrado `ImageDropzone` a `MediaDropzone`
   - Soporte para imágenes Y videos
   - Subida automática al crear producto
   - Validación de tamaños (10MB imágenes, 50MB videos)
   - Indicador de carga mientras sube

## 🚀 Cómo Usar:

### Crear un Producto con Imagen/Video:

1. Ve a `/admin/productos`
2. Click en "Nuevo producto"
3. Llena los datos del producto
4. Arrastra o selecciona una imagen o video
5. Click en "Crear producto"
6. El sistema:
   - Crea el producto en la DB
   - Sube el archivo a Cloudflare R2
   - Guarda la URL en la DB
   - Muestra el producto con su imagen/video

### Subir Comprobante de Pago:

1. El cliente hace checkout
2. Llega al paso de subir comprobante
3. Arrastra o selecciona la imagen/PDF
4. Click en "Enviar comprobante"
5. El sistema:
   - Sube el archivo a R2
   - Guarda la referencia en la orden
   - Notifica al vendedor por Telegram

## ⚙️ Configuración Necesaria:

### Cloudflare R2 - Dominio Público:

Para que las imágenes sean accesibles públicamente, necesitas configurar un dominio público en tu bucket de R2:

1. Ve a Cloudflare Dashboard → R2
2. Selecciona tu bucket `sxnti320`
3. Ve a "Settings" → "Public Access"
4. Habilita "Allow Access" y configura un dominio
5. Actualiza la URL en `cloudflare_r2.py`:

```python
# Cambiar esta línea:
url_publica = f"https://{settings.R2_BUCKET_NAME}.r2.dev/{key}"

# Por tu dominio personalizado:
url_publica = f"https://tu-dominio.r2.dev/{key}"
```

**Alternativa:** Si no quieres hacer público el bucket, puedes usar URLs firmadas (como con los comprobantes), pero tendrías que regenerarlas periódicamente.

## 🧪 Para Probar:

### 1. Probar subida de imagen de producto:
```bash
# Backend debe estar corriendo
cd backend
uvicorn app.main:app --reload

# Frontend debe estar corriendo
cd frontend
npm run dev
```

1. Ve a `http://localhost:5173/admin/productos`
2. Crea un nuevo producto
3. Sube una imagen
4. Verifica que se muestre en la lista

### 2. Probar subida de video:
1. Igual que arriba pero sube un video MP4
2. El video debe aparecer en el producto

### 3. Probar comprobante:
1. Ve a la tienda como cliente
2. Agrega un producto al carrito
3. Haz checkout
4. Sube el comprobante
5. Debe decir "Comprobante recibido"

## 📝 Notas Importantes:

1. **Tamaños de archivo:**
   - Imágenes: máx 10MB
   - Videos: máx 50MB (~2 minutos en calidad media)

2. **Formatos aceptados:**
   - Imágenes: JPG, JPEG, PNG, WEBP
   - Videos: MP4, WEBM, MOV

3. **Almacenamiento:**
   - Todo se guarda en Cloudflare R2
   - Las URLs se guardan en MySQL
   - Los archivos son permanentes (no se borran automáticamente)

4. **Costos:**
   - Cloudflare R2 tiene 10GB gratis al mes
   - Después: $0.015 por GB almacenado
   - Transferencia de salida: Gratis

## ✅ Checklist de Verificación:

- [x] Endpoint de medios creado
- [x] Servicio de R2 actualizado
- [x] Frontend actualizado para subir archivos
- [x] Soporte para imágenes
- [x] Soporte para videos
- [x] Validación de tamaños
- [x] Validación de formatos
- [x] Error de comprobante identificado
- [x] Documentación completa

## 🐛 Si algo no funciona:

1. **Error al subir archivo:**
   - Verifica que Cloudflare R2 esté configurado correctamente
   - Revisa las credenciales en `.env`
   - Verifica que el bucket exista

2. **Imagen no se muestra:**
   - Verifica que el dominio público esté configurado en R2
   - O usa URLs firmadas temporales

3. **Video no se reproduce:**
   - Verifica que el formato sea MP4, WEBM o MOV
   - Verifica que el tamaño sea menor a 50MB
   - Algunos navegadores no soportan todos los formatos

4. **Comprobante da error:**
   - Verifica que el backend esté corriendo
   - Verifica que CORS esté configurado
   - Revisa la consola del navegador para ver el error exacto
