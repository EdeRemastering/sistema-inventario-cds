# 🔐 Instrucciones para Configurar .env con Cloudflare R2

## Variables que DEBES agregar a tu archivo `.env`

Abre tu archivo `.env` y agrega las siguientes líneas al final:

```env
# ====================================
# Configuración de Firmas Digitales
# ====================================

# Activar almacenamiento en Cloudflare R2
USE_R2_STORAGE=true

# Desactivar almacenamiento en filesystem local (no funciona en producción)
USE_FILESYSTEM_SIGNATURES=false

# ====================================
# Cloudflare R2 - Credenciales
# ====================================

# Tu Account ID de Cloudflare
# Lo encuentras en: Dashboard de Cloudflare > R2 > Overview (en la URL o en el sidebar)
R2_ACCOUNT_ID=

# Access Key ID del API Token
# Lo obtienes al crear un API Token en: R2 > Manage R2 API Tokens
R2_ACCESS_KEY_ID=

# Secret Access Key del API Token
# ¡IMPORTANTE! Solo se muestra UNA VEZ al crear el token
R2_SECRET_ACCESS_KEY=

# Nombre de tu bucket en R2
# El nombre que le diste al crear el bucket (ej: inventario-firmas)
R2_BUCKET_NAME=

# URL pública de tu bucket (OPCIONAL)
# Si configuraste un dominio personalizado, ponlo aquí
# Ejemplo: https://cdn.tudominio.com
# Si NO configuraste dominio personalizado, déjalo VACÍO
R2_PUBLIC_URL=
```

## 📋 Pasos para Obtener las Credenciales

### 1️⃣ Obtener el Account ID

**Opción A**: Desde la URL
- Ve a tu Dashboard de Cloudflare
- Observa la URL: `https://dash.cloudflare.com/XXXXXX/r2`
- El `XXXXXX` es tu Account ID

**Opción B**: Desde el menú
- En el Dashboard, mira la barra lateral izquierda
- Debajo del nombre de tu cuenta verás el Account ID

### 2️⃣ Crear un Bucket (si no lo has hecho)

1. Ve a **R2** en el menú de Cloudflare
2. Haz clic en **Create bucket**
3. Ponle un nombre (ej: `inventario-firmas`)
4. Selecciona la ubicación (puedes dejar "Automatic")
5. Haz clic en **Create bucket**
6. Copia el nombre exacto del bucket

### 3️⃣ Crear API Token y Obtener Credenciales

1. En la página de R2, haz clic en **Manage R2 API Tokens**
2. Haz clic en **Create API token**
3. Configura el token:
   - **Token name**: `inventario-api-token` (o el que prefieras)
   - **Permissions**: Selecciona **Object Read & Write**
   - **TTL**: Selecciona la duración (recomendado: 1 año o "Never expire")
   - **Specify bucket(s)**: Puedes especificar solo tu bucket o "Apply to all buckets"
4. Haz clic en **Create API Token**
5. **¡MUY IMPORTANTE!** Verás una pantalla con:
   - **Access Key ID**: Cópialo
   - **Secret Access Key**: Cópialo (¡SOLO SE MUESTRA UNA VEZ!)
   - Guarda ambos en un lugar seguro

### 4️⃣ Configurar Acceso Público al Bucket

Para que las firmas sean accesibles desde tu aplicación:

1. Ve a tu bucket en R2
2. Haz clic en **Settings**
3. En la sección **Public access**, haz clic en **Allow Access**
4. Lee y acepta las advertencias
5. Confirma

**Opcional**: Si quieres usar un dominio personalizado:
1. En **Settings** > **Public access**
2. Haz clic en **Connect domain**
3. Ingresa un subdominio de tu dominio en Cloudflare (ej: `cdn.tudominio.com`)
4. Confirma la configuración
5. Copia la URL completa y ponla en `R2_PUBLIC_URL`

## ✅ Ejemplo de Configuración Final

Tu archivo `.env` debería verse así (con tus valores reales):

```env
# Base de datos (tu configuración existente)
DATABASE_URL="mysql://..."

# NextAuth (tu configuración existente)
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"

# ====================================
# Configuración de Firmas Digitales
# ====================================
USE_R2_STORAGE=true
USE_FILESYSTEM_SIGNATURES=false

# ====================================
# Cloudflare R2 - Credenciales
# ====================================
R2_ACCOUNT_ID=abc123def456
R2_ACCESS_KEY_ID=1234567890abcdef1234567890abcdef
R2_SECRET_ACCESS_KEY=abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOP
R2_BUCKET_NAME=inventario-firmas
R2_PUBLIC_URL=https://cdn.tudominio.com

# Entorno
NODE_ENV=development
```

## 🧪 Verificar la Configuración

Después de agregar las variables:

1. **Reinicia tu servidor de desarrollo**:
   ```bash
   # Detén el servidor (Ctrl+C)
   pnpm dev
   ```

2. **Prueba crear una firma**:
   - Ve a Movimientos o Tickets
   - Crea un registro con firma digital
   - Verifica en el Dashboard de R2 que el archivo se haya subido

3. **Revisa los logs**:
   - En la consola del servidor deberías ver:
     ```
     Firma guardada en R2: https://...
     ```

## ⚠️ Solución de Problemas

### Error: "Configuración de R2 incompleta"
- Verifica que TODAS las variables estén configuradas
- Asegúrate de que no haya espacios extra
- Verifica que los valores sean correctos

### Error: "Access Denied"
- Verifica que el API Token tenga permisos de Read & Write
- Verifica que el token no haya expirado
- Verifica que el bucket especificado exista

### Las firmas no se muestran
- Verifica que el bucket tenga acceso público habilitado
- Verifica que `R2_PUBLIC_URL` esté correctamente configurado
- Intenta dejar `R2_PUBLIC_URL` vacío para usar la URL por defecto

## 📞 Más Información

Para una guía completa paso a paso con capturas de pantalla, consulta:
[`docs/setup/CLOUDFLARE_R2_SETUP.md`](docs/setup/CLOUDFLARE_R2_SETUP.md)

---

**¡Importante!** Una vez que configures las credenciales:
- ❌ NUNCA subas el archivo `.env` a git
- ❌ NUNCA compartas tus credenciales
- ✅ El archivo `.env` ya está en `.gitignore`
- ✅ Rota tus tokens periódicamente

