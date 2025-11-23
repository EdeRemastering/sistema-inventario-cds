# 🌐 Configurar Acceso Público en Cloudflare R2

## ⚠️ Problema: Las imágenes no se ven

Si las firmas se están guardando en R2 pero no se pueden visualizar, es porque el bucket **no tiene acceso público configurado**.

## ✅ Solución: Configurar Dominio Público de R2

Cloudflare R2 requiere que configures un **dominio público** para poder acceder a los archivos desde tu aplicación.

### Opción 1: Usar Dominio R2.dev (Más Fácil) ⭐ Recomendado

1. **Ve a tu bucket en Cloudflare Dashboard**
   - Dashboard > R2 > Selecciona tu bucket `inventario-cds`

2. **Ve a Settings**
   - Haz clic en la pestaña **Settings**

3. **Configura Public Access**
   - En la sección **Public access**, haz clic en **Connect Domain**
   - Selecciona **R2.dev subdomain**

4. **Confirma el dominio**
   - Cloudflare generará un dominio automático como: `pub-xxxxx.r2.dev`
   - Haz clic en **Allow Access** o **Enable Public Access**

5. **Copia la URL pública**
   - Verás algo como: `https://pub-a1b2c3d4e5f6.r2.dev`
   - **Copia esta URL completa**

6. **Actualiza tu archivo `.env`**
   ```env
   R2_PUBLIC_URL=https://pub-a1b2c3d4e5f6.r2.dev
   ```

7. **Reinicia tu servidor**
   ```bash
   # Detén el servidor (Ctrl+C)
   pnpm dev
   ```

### Opción 2: Usar Dominio Personalizado (Más Profesional)

Si tienes un dominio en Cloudflare:

1. **Ve a tu bucket > Settings > Public access**

2. **Haz clic en Connect Domain**

3. **Selecciona Custom Domain**

4. **Ingresa un subdominio**
   - Ejemplo: `cdn.tudominio.com` o `archivos.tudominio.com`

5. **Confirma la configuración**
   - Cloudflare configurará automáticamente el DNS

6. **Actualiza tu `.env`**
   ```env
   R2_PUBLIC_URL=https://cdn.tudominio.com
   ```

7. **Reinicia el servidor**

## 🔍 Verificar que Funciona

### 1. Probar el acceso directo

Abre tu navegador y prueba acceder directamente a una firma:

```
https://pub-xxxxx.r2.dev/signatures/ticket_23_entrega_1763869447461.png
```

Si ves la imagen, ¡está funcionando! ✅

### 2. Probar en la aplicación

1. Ve a **Tickets** en tu aplicación
2. Crea un nuevo ticket con firmas
3. Haz clic en **Ver Firma**
4. La imagen debería mostrarse correctamente

## 🛠️ Solución de Problemas

### Error: "Access Denied" o 403

**Causa**: El bucket no tiene acceso público habilitado

**Solución**:
1. Ve a Settings del bucket
2. En **Public access**, asegúrate de que esté activado
3. Verifica que el dominio R2.dev esté conectado

### Error: Las imágenes antiguas no se ven

**Causa**: Las imágenes se guardaron con la URL antigua

**Solución**: Las nuevas firmas usarán la URL correcta. Para las antiguas:
- Opción 1: Déjalas como están (solo afecta a registros viejos)
- Opción 2: Migra las URLs antiguas en la base de datos

### La URL en .env no tiene efecto

**Causa**: El servidor no se reinició

**Solución**:
```bash
# Detén el servidor completamente (Ctrl+C)
pnpm dev
```

### Siguen sin verse las imágenes

**Causa**: Puede ser un problema de CORS

**Solución**:
1. Ve a tu bucket > Settings > CORS policy
2. Agrega esta configuración:

```json
[
  {
    "AllowedOrigins": ["*"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

## 📋 Checklist de Configuración

- [ ] Bucket tiene acceso público habilitado
- [ ] Dominio R2.dev está conectado (o dominio personalizado)
- [ ] Variable `R2_PUBLIC_URL` está configurada en `.env`
- [ ] Servidor reiniciado después de actualizar `.env`
- [ ] Puedes acceder a una imagen directamente en el navegador
- [ ] Las imágenes se muestran en la aplicación

## 🎯 Configuración Recomendada Final

Tu archivo `.env` debería verse así:

```env
# Base de datos
DATABASE_URL="mysql://..."

# NextAuth
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"

# Configuración de Firmas
USE_R2_STORAGE=true
USE_FILESYSTEM_SIGNATURES=false

# Cloudflare R2 - Credenciales
R2_ACCOUNT_ID=cf1fe9ea5386c68d8f58c511f5d49d18
R2_ACCESS_KEY_ID=3c37bff821dd01ca87f9d209532c7bcb
R2_SECRET_ACCESS_KEY=e0b3170b1d9a0ceabaef8953cb76d7833bce201a86c37f5aca6715db89be4b92
R2_BUCKET_NAME=inventario-cds

# ⭐ URL pública de R2 (IMPORTANTE)
R2_PUBLIC_URL=https://pub-xxxxx.r2.dev

# Entorno
NODE_ENV=development
```

## 📚 Más Información

- [Documentación oficial de R2 Public Access](https://developers.cloudflare.com/r2/buckets/public-buckets/)
- [R2.dev domains](https://developers.cloudflare.com/r2/buckets/public-buckets/#r2dev-subdomain)

---

**¡Importante!** Una vez configurado el dominio público, todas las nuevas firmas serán accesibles correctamente. 🎉

