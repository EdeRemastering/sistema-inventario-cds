# 🚨 ACCIÓN REQUERIDA: Configurar Acceso Público en R2

## ⚠️ Problema Actual

Las firmas se están guardando en R2, pero **NO son accesibles** porque falta configurar el dominio público.

**Error actual**: 
```
upstream image response failed for https://inventario-cds.cf1fe9ea5386c68d8f58c511f5d49d18.r2.cloudflarestorage.com/signatures/... 400
```

## ✅ Solución (5 minutos)

### Paso 1: Configurar Dominio R2.dev

1. **Abre Cloudflare Dashboard**: https://dash.cloudflare.com/

2. **Ve a R2**:
   - En el menú lateral, haz clic en **R2**

3. **Selecciona tu bucket**:
   - Haz clic en tu bucket **`inventario-cds`**

4. **Ve a Settings**:
   - Haz clic en la pestaña **Settings** (arriba)

5. **Configura Public Access**:
   - Busca la sección **"Public access"** o **"R2.dev subdomain"**
   - Haz clic en **"Connect Domain"** o **"Allow Access"**
   - Selecciona **"R2.dev subdomain"**
   - Confirma haciendo clic en **"Allow Access"** o **"Enable"**

6. **Copia la URL**:
   - Verás algo como: `https://pub-a1b2c3d4e5f6.r2.dev`
   - **COPIA ESTA URL COMPLETA**

### Paso 2: Actualizar tu archivo .env

Abre tu archivo `.env` y agrega/actualiza esta línea:

```env
R2_PUBLIC_URL=https://pub-a1b2c3d4e5f6.r2.dev
```

**⚠️ IMPORTANTE**: 
- Reemplaza con tu URL real de R2.dev
- NO incluyas `/signatures` al final
- NO incluyas barra final `/`

### Paso 3: Reiniciar el Servidor

```bash
# Detén el servidor (Ctrl+C en la terminal)
pnpm dev
```

## 🧪 Verificar que Funciona

### 1. Probar acceso directo

Abre esta URL en tu navegador (reemplaza con tu dominio real):

```
https://pub-xxxxx.r2.dev/signatures/ticket_24_recibe_1763869645771.png
```

✅ Si ves la imagen = ¡Funciona!  
❌ Si da error = Revisa que el dominio público esté activado

### 2. Crear un nuevo ticket

1. Ve a **Tickets** en tu aplicación
2. Crea un nuevo ticket con firmas
3. Guarda el ticket
4. Haz clic en **Ver Firma**
5. La imagen debería verse correctamente ✅

## 📸 Ayuda Visual

Si no encuentras dónde configurar el dominio público:

1. **En el Dashboard de R2**, verás algo como:
   ```
   Public Access
   [ ] Allow public access
   ```

2. O puede aparecer como:
   ```
   R2.dev Subdomain
   [Connect Domain]
   ```

3. O:
   ```
   Custom Domains
   [Add Custom Domain]
   ```

**Busca cualquiera de estas opciones** y actívala.

## ❓ Preguntas Frecuentes

### ¿Por qué no puedo usar la URL por defecto?

La URL `https://inventario-cds.cf1fe9ea5386c68d8f58c511f5d49d18.r2.cloudflarestorage.com` es la URL **interna** de R2 y NO es accesible públicamente. Cloudflare requiere que uses:
- Un dominio **R2.dev** (gratuito, automático)
- O un **dominio personalizado** (si tienes un dominio en Cloudflare)

### ¿Tiene costo el dominio R2.dev?

**NO**, es completamente gratuito. Es parte de tu plan de R2.

### ¿Qué pasa con las firmas que ya guardé?

Las firmas ya están en R2, solo que no son accesibles. Una vez que configures el dominio público:
- **Las nuevas firmas** funcionarán perfectamente ✅
- **Las firmas antiguas** necesitarás actualizarlas en la BD (o déjalas, no afectan)

### ¿Es seguro permitir acceso público?

Sí, estás permitiendo acceso **de solo lectura** a los archivos. Nadie puede:
- ❌ Subir archivos
- ❌ Eliminar archivos
- ❌ Modificar archivos
- ✅ Solo ver imágenes (lo que necesitas)

## 🔧 Si Sigues Teniendo Problemas

### Error: No encuentro la opción "Public Access"

**Solución**: Actualiza la página o busca "Custom Domains" y agrega un dominio R2.dev

### Error: El dominio R2.dev no se activa

**Solución**: 
1. Verifica que tu cuenta de Cloudflare esté verificada
2. Intenta crear un dominio personalizado en su lugar
3. Contacta al soporte de Cloudflare

### Las imágenes siguen sin verse

**Checklist**:
- [ ] Dominio público está activado en R2
- [ ] Variable `R2_PUBLIC_URL` está en tu `.env`
- [ ] Reiniciaste el servidor después de cambiar `.env`
- [ ] La URL en `R2_PUBLIC_URL` NO tiene `/` al final
- [ ] Creaste un **nuevo** ticket (los antiguos tienen la URL vieja)

## 📚 Más Información

Ver guía completa: `docs/setup/CONFIGURAR_ACCESO_PUBLICO_R2.md`

---

## ✅ Tu .env Debería Verse Así:

```env
# Base de datos
DATABASE_URL="mysql://..."

# NextAuth
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"

# Configuración de Firmas
USE_R2_STORAGE=true
USE_FILESYSTEM_SIGNATURES=false

# Cloudflare R2
R2_ACCOUNT_ID=cf1fe9ea5386c68d8f58c511f5d49d18
R2_ACCESS_KEY_ID=3c37bff821dd01ca87f9d209532c7bcb
R2_SECRET_ACCESS_KEY=e0b3170b1d9a0ceabaef8953cb76d7833bce201a86c37f5aca6715db89be4b92
R2_BUCKET_NAME=inventario-cds

# ⭐ ¡ESTA ES LA QUE FALTA! ⭐
R2_PUBLIC_URL=https://pub-xxxxx.r2.dev

# Entorno
NODE_ENV=development
```

---

**⏱️ Tiempo estimado**: 5 minutos  
**Dificultad**: Fácil  
**Resultado**: ✅ Firmas funcionando perfectamente

