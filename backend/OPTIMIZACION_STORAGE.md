# Estrategia de Optimización de Almacenamiento

## 📊 Resumen

Tu aplicación usa dos sistemas de almacenamiento:
- **MySQL**: Metadatos (info de productos, órdenes, keys de archivos)
- **Cloudflare R2**: Archivos reales (imágenes, videos, comprobantes)

## 💰 Costos de Cloudflare R2

- **Primeros 10GB**: GRATIS
- **Después de 10GB**: $0.015/GB/mes (muy barato)
- **Descargas**: GRATIS (sin cargos por egreso)

## ✅ Optimizaciones Implementadas

### 1. Compresión Automática de Imágenes ✓

Todas las imágenes se comprimen automáticamente al subirlas:
- Redimensiona a máximo 1920px de ancho
- Reduce calidad a 85% (imperceptible para el usuario)
- Convierte a formato WebP (50% más pequeño que JPG)
- **Ahorro estimado**: 60-70% del tamaño original

**Ejemplo**: Una imagen de 2MB se reduce a ~600KB

### 2. Límites de Tamaño ✓

Validación estricta en el backend:
- **Imágenes**: Máximo 10MB
- **Videos**: Máximo 50MB (~2 minutos en calidad media)
- **Comprobantes**: Máximo 10MB

### 3. Eliminación Automática al Borrar Productos ✓

Cuando eliminas un producto (cuenta o paquete):
- Se eliminan TODOS sus archivos de R2 automáticamente
- Se elimina el registro de la base de datos
- No quedan archivos huérfanos

### 4. Limpieza de Comprobantes Antiguos ✓

Script automático para limpiar comprobantes viejos:
- Elimina comprobantes de órdenes completadas hace más de 90 días
- Genera reporte de uso de almacenamiento
- Alerta si te acercas al límite gratuito de 10GB

## 🚀 Cómo Usar

### Instalar Dependencias

Primero, instala las nuevas dependencias:

```bash
cd backend
pip install -r requirements.txt
```

Esto instalará:
- `Pillow`: Para compresión de imágenes
- `boto3`: Para gestión avanzada de R2

### Ejecutar Limpieza Manual

Para limpiar comprobantes antiguos y ver el reporte de uso:

```bash
cd backend
python -m app.utils.limpieza_storage
```

Esto mostrará:
```
============================================================
LIMPIEZA AUTOMÁTICA DE ALMACENAMIENTO
============================================================

[LIMPIEZA] Buscando comprobantes de hace más de 90 días...
[LIMPIEZA] Encontradas 15 órdenes con comprobantes antiguos.
[LIMPIEZA] ✓ Eliminados 15 comprobantes antiguos.

[REPORTE] Estadísticas de almacenamiento:

Total de archivos: 234
Tamaño total: 2.45 GB (2508.3 MB)

Por categoría:
  productos/cuenta/: 89 archivos (1234.5 MB)
  productos/paquete/: 12 archivos (456.2 MB)
  comprobantes/: 133 archivos (817.6 MB)

✓ Uso normal: 2.45GB de 10GB gratuitos.

============================================================
LIMPIEZA COMPLETADA
============================================================
```

### Automatizar con Cron (Linux/Mac)

Para ejecutar la limpieza automáticamente cada semana:

```bash
# Editar crontab
crontab -e

# Agregar esta línea (ejecuta cada domingo a las 3am)
0 3 * * 0 cd /ruta/a/tu/proyecto/backend && /ruta/a/python -m app.utils.limpieza_storage >> /var/log/limpieza_storage.log 2>&1
```

### Automatizar con Task Scheduler (Windows)

1. Abre "Programador de tareas"
2. Crear tarea básica
3. Nombre: "Limpieza Storage"
4. Desencadenador: Semanal (domingo 3am)
5. Acción: Iniciar programa
   - Programa: `python`
   - Argumentos: `-m app.utils.limpieza_storage`
   - Iniciar en: `C:\ruta\a\tu\proyecto\backend`

## 📈 Estimación de Uso

Con 1000 órdenes procesadas:

| Tipo | Cantidad | Tamaño Promedio | Total |
|------|----------|-----------------|-------|
| Imágenes de productos | 500 | 500KB (comprimidas) | 250MB |
| Videos de productos | 50 | 20MB | 1GB |
| Comprobantes (90 días) | 300 | 200KB | 60MB |
| **TOTAL** | | | **~1.3GB** |

**Conclusión**: Con 1000 órdenes estás usando solo el 13% del plan gratuito.

## 🎯 Recomendaciones Adicionales

### Para Escalar Más

Si en el futuro necesitas optimizar aún más:

1. **Reducir retención de comprobantes**
   - Cambiar de 90 a 60 días en `limpieza_storage.py`
   - Línea: `await limpiar_comprobantes_antiguos(dias=60)`

2. **Comprimir videos antes de subir**
   - Usar FFmpeg en el backend para recodificar
   - Reducir bitrate a 1-2 Mbps

3. **Lazy loading de imágenes**
   - Ya implementado: URLs firmadas con 24h de expiración
   - Solo se generan cuando se solicitan

4. **CDN de Cloudflare**
   - R2 se integra gratis con Cloudflare CDN
   - Acelera la entrega de archivos globalmente

## 🔍 Monitoreo

### Ver Uso Actual

```bash
python -m app.utils.limpieza_storage
```

### Alertas Automáticas

El script te alertará si:
- Usas más de 5GB (50% del plan gratuito)
- Usas más de 8GB (80% del plan gratuito)

## ❓ Preguntas Frecuentes

### ¿Qué pasa si borro un producto por error?

Los archivos de R2 se eliminan inmediatamente. Considera:
- Hacer backups periódicos de la base de datos
- Implementar "soft delete" (marcar como eliminado en vez de borrar)

### ¿Puedo recuperar comprobantes eliminados?

No, una vez eliminados de R2 no se pueden recuperar. Por eso el script espera 90 días antes de eliminar.

### ¿Cuánto cuesta si supero los 10GB?

Muy poco. Ejemplos:
- 20GB = 10GB gratis + 10GB × $0.015 = $0.15/mes
- 50GB = 10GB gratis + 40GB × $0.015 = $0.60/mes
- 100GB = 10GB gratis + 90GB × $0.015 = $1.35/mes

### ¿Las imágenes comprimidas se ven mal?

No. La compresión a 85% de calidad es imperceptible para el ojo humano. WebP es un formato moderno que mantiene excelente calidad.

## 🛠️ Troubleshooting

### Error: "No module named 'PIL'"

```bash
pip install Pillow
```

### Error: "No module named 'boto3'"

```bash
pip install boto3
```

### Error de permisos en R2

Verifica que tu `.env` tenga las credenciales correctas:
```
R2_ACCESS_KEY_ID=tu_access_key
R2_SECRET_ACCESS_KEY=tu_secret_key
R2_ENDPOINT_URL=https://tu-account-id.r2.cloudflarestorage.com
R2_BUCKET_NAME=tu-bucket
```

## 📝 Changelog

- **v1.0** (Actual)
  - Compresión automática de imágenes a WebP
  - Eliminación de archivos al borrar productos
  - Script de limpieza de comprobantes antiguos
  - Reporte de uso de almacenamiento
  - Límites de tamaño validados
