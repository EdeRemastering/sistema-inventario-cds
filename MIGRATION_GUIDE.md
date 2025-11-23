# 🔧 Guía de Migración - Firmas en Base de Datos

## 📋 Resumen del Problema

En **producción**, cuando intentas marcar un ticket como entregado, el sistema falla porque intenta guardar las firmas como archivos PNG en el directorio `public/signatures/`, pero la mayoría de plataformas de deployment (Vercel, Netlify, Railway, etc.) tienen un sistema de archivos de **solo lectura**.

## ✅ Solución Implementada

Hemos actualizado el sistema para que:

1. **En producción**: Las firmas se guardan como **data URLs (base64)** directamente en la base de datos
2. **En desarrollo**: Las firmas se pueden guardar como archivos (opcional) o también como data URLs
3. **Compatibilidad total**: El sistema detecta automáticamente el formato y funciona con ambos

## 🚀 Pasos para Aplicar la Migración

### Paso 1: Actualizar la Base de Datos

Ejecuta el siguiente comando en tu terminal:

```bash
npm run migrate:signatures
```

Esto actualizará los campos de firma en las tablas `tickets_guardados` y `movimientos` de `VARCHAR` a `TEXT` para soportar data URLs más largos.

### Paso 2: Verificar que Prisma esté actualizado

```bash
npx prisma generate
```

### Paso 3: Desplegar los Cambios

1. **Commitea todos los cambios:**
   ```bash
   git add .
   git commit -m "feat: migrar firmas a base de datos para compatibilidad con producción"
   git push
   ```

2. **Aplica la migración en producción:**
   - Si usas una plataforma como **Railway** o **Render**, conéctate a tu base de datos y ejecuta el SQL manualmente
   - O ejecuta el script de migración en tu servidor de producción

### Paso 4: Probar en Producción

Después de desplegar:

1. Ve a la sección de **Tickets**
2. Intenta **marcar un ticket como entregado**
3. Firma en ambos campos
4. Verifica que se guarde exitosamente

## 📁 Archivos Modificados

### 1. Base de Datos
- ✅ `prisma/schema.prisma` - Campos de firma cambiados a `TEXT`
- ✅ `prisma/migrations/update_signature_fields.sql` - Script SQL de migración
- ✅ `scripts/migrate-signatures.ts` - Script automatizado de migración

### 2. Backend
- ✅ `src/lib/signature-storage.ts` - Lógica de guardado adaptativa
- ✅ `src/modules/tickets_guardados/actions.ts` - Validación mejorada

### 3. Frontend
- ✅ `src/components/ui/signature-display.tsx` - Visualización para ambos formatos
- ✅ `src/components/tickets/ticket-actions.tsx` - Eliminada llamada duplicada

## 🔍 Cómo Funciona

### Antes (❌ Fallaba en Producción)
```
Firma → Guardar como archivo PNG → /public/signatures/ticket_1.png
                                     ↑
                                 Solo lectura ❌
```

### Ahora (✅ Funciona en Producción)
```
Firma → Guardar como data URL → data:image/png;base64,iVBORw0...
                                  ↑
                              En la base de datos ✅
```

## 🧪 Testing

Después de aplicar la migración, verifica:

- [ ] Las firmas antiguas (archivos) siguen visualizándose
- [ ] Puedes crear nuevos tickets con firmas
- [ ] Puedes marcar tickets como entregados sin errores
- [ ] Las firmas se visualizan correctamente en todos los reportes

## 🛠️ Migración Manual (Si el script falla)

Si prefieres ejecutar la migración SQL manualmente, conéctate a tu base de datos y ejecuta:

```sql
-- Actualizar tickets_guardados
ALTER TABLE tickets_guardados 
  MODIFY COLUMN firma_funcionario_entrega TEXT,
  MODIFY COLUMN firma_funcionario_recibe TEXT;

-- Actualizar movimientos
ALTER TABLE movimientos 
  MODIFY COLUMN firma_funcionario_entrega TEXT,
  MODIFY COLUMN firma_funcionario_recibe TEXT,
  MODIFY COLUMN firma_recepcion TEXT,
  MODIFY COLUMN firma_entrega TEXT,
  MODIFY COLUMN firma_recibe TEXT,
  MODIFY COLUMN firma_devuelve TEXT,
  MODIFY COLUMN firma_recibe_devolucion TEXT;
```

## 📞 Soporte

Si encuentras algún problema durante la migración:

1. Revisa los logs de la consola del navegador (F12)
2. Revisa los logs del servidor
3. Verifica que los campos en la BD sean de tipo `TEXT`
4. Asegúrate de haber ejecutado `npx prisma generate` después de cambiar el schema

## ⚠️ Notas Importantes

- **No se perderán datos**: La migración solo cambia el tipo de columna, no los datos
- **Compatibilidad**: Las firmas antiguas (archivos) seguirán funcionando
- **Tamaño**: Las firmas en base64 ocupan ~33% más espacio, pero es necesario para producción
- **Performance**: El impacto es mínimo, las firmas se cargan bajo demanda

## ✨ Mejoras Adicionales Implementadas

1. **Validación más flexible** de firmas (de 1000 → 100 caracteres mínimo)
2. **Logging detallado** para debugging
3. **Números de ticket únicos** mejorados (evita duplicados)
4. **Manejo de errores** más específico

---

¿Listo para aplicar la migración? Ejecuta:

```bash
npm run migrate:signatures
```

¡Y luego despliega! 🚀

