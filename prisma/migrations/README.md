# Migración de Campos de Firma

## Problema
En producción, el sistema de archivos es de solo lectura, por lo que no se pueden guardar las firmas como archivos PNG en `public/signatures/`. Esto causa errores al marcar tickets como entregados.

## Solución
Cambiar los campos de firma de `VARCHAR(500)` a `TEXT` para poder almacenar las firmas como data URLs (base64) directamente en la base de datos.

## Aplicar Migración

### Opción 1: Usando el script automatizado (Recomendado)

```bash
npm run migrate:signatures
```

O directamente:

```bash
npx ts-node scripts/migrate-signatures.ts
```

### Opción 2: Ejecutar SQL manualmente

Si prefieres ejecutar el SQL manualmente en tu base de datos:

```sql
-- Actualizar tabla tickets_guardados
ALTER TABLE tickets_guardados 
  MODIFY COLUMN firma_funcionario_entrega TEXT,
  MODIFY COLUMN firma_funcionario_recibe TEXT;

-- Actualizar tabla movimientos
ALTER TABLE movimientos 
  MODIFY COLUMN firma_funcionario_entrega TEXT,
  MODIFY COLUMN firma_funcionario_recibe TEXT,
  MODIFY COLUMN firma_recepcion TEXT,
  MODIFY COLUMN firma_entrega TEXT,
  MODIFY COLUMN firma_recibe TEXT,
  MODIFY COLUMN firma_devuelve TEXT,
  MODIFY COLUMN firma_recibe_devolucion TEXT;
```

## Cambios Realizados

### 1. Schema de Prisma (`prisma/schema.prisma`)
- Cambiados todos los campos de firma de `@db.VarChar(500)` a `@db.Text`

### 2. Sistema de Almacenamiento (`src/lib/signature-storage.ts`)
- En **producción**: Las firmas se guardan como data URLs directamente en la BD
- En **desarrollo**: Las firmas se intentan guardar como archivos (con fallback a data URL)
- Soporta ambos formatos para compatibilidad con firmas existentes

### 3. Componente de Visualización (`src/components/ui/signature-display.tsx`)
- Detecta automáticamente si es un data URL o una URL de archivo
- Usa `<img>` para data URLs y `<Image>` de Next.js para archivos

## Compatibilidad

El sistema ahora soporta **tres formatos de firma**:

1. **URLs de archivos** (antiguas): `/signatures/ticket_1_entrega_123456.png`
2. **Data URLs** (nuevas): `data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...`
3. **Ambas**: El sistema detecta automáticamente el formato y lo maneja correctamente

## Verificación

Después de aplicar la migración, verifica que:

1. ✅ Los campos de firma en la BD son de tipo `TEXT`
2. ✅ Puedes marcar un ticket como entregado sin errores
3. ✅ Las firmas antiguas (archivos) siguen visualizándose correctamente
4. ✅ Las firmas nuevas (data URLs) se guardan y visualizan correctamente

## Rollback

Si necesitas revertir la migración:

```sql
-- CUIDADO: Esto puede truncar data URLs largos
ALTER TABLE tickets_guardados 
  MODIFY COLUMN firma_funcionario_entrega VARCHAR(500),
  MODIFY COLUMN firma_funcionario_recibe VARCHAR(500);

ALTER TABLE movimientos 
  MODIFY COLUMN firma_funcionario_entrega VARCHAR(500),
  MODIFY COLUMN firma_funcionario_recibe VARCHAR(500),
  MODIFY COLUMN firma_recepcion VARCHAR(255),
  MODIFY COLUMN firma_entrega VARCHAR(255),
  MODIFY COLUMN firma_recibe VARCHAR(255),
  MODIFY COLUMN firma_devuelve VARCHAR(255),
  MODIFY COLUMN firma_recibe_devolucion VARCHAR(255);
```

⚠️ **Nota**: Si ya tienes data URLs guardados, el rollback puede truncar los datos.

