# Configuración de Cloudflare R2 para Firmas

Este documento explica cómo configurar Cloudflare R2 para almacenar las firmas digitales del sistema de inventario.

## 📋 Requisitos Previos

- Cuenta de Cloudflare
- Acceso a Cloudflare R2

## 🚀 Pasos de Configuración

### 1. Crear un Bucket en Cloudflare R2

1. Inicia sesión en tu cuenta de Cloudflare
2. Ve a **R2** en el menú lateral
3. Haz clic en **Create bucket**
4. Ingresa un nombre para tu bucket (ej: `inventario-firmas`)
5. Selecciona la ubicación (recomendado: automático)
6. Haz clic en **Create bucket**

### 2. Obtener las Credenciales de API

1. En la página de R2, ve a **Manage R2 API Tokens**
2. Haz clic en **Create API token**
3. Configura los permisos:
   - **Token name**: `inventario-api-token` (o el nombre que prefieras)
   - **Permissions**: Selecciona **Object Read & Write**
   - **TTL**: Selecciona la duración (recomendado: sin límite o 1 año)
4. Haz clic en **Create API Token**
5. **¡IMPORTANTE!** Copia y guarda de forma segura:
   - Access Key ID
   - Secret Access Key
   - (No podrás ver el Secret Access Key nuevamente)

### 3. Obtener el Account ID

1. El Account ID se encuentra en:
   - **Dashboard de Cloudflare** > **R2** > URL de la página
   - O en el menú lateral bajo el nombre de tu cuenta

### 4. Configurar Dominio Público (Opcional pero Recomendado)

Para que las firmas sean accesibles públicamente:

#### Opción A: Usar un dominio personalizado
1. Ve a tu bucket en R2
2. Haz clic en **Settings** > **Public access**
3. Haz clic en **Connect domain**
4. Ingresa un subdominio de uno de tus dominios en Cloudflare (ej: `cdn.tudominio.com`)
5. Confirma la configuración DNS

#### Opción B: Permitir acceso público directo
1. Ve a tu bucket en R2
2. Haz clic en **Settings** > **Public access**
3. Haz clic en **Allow Access**
4. Confirma que entiendes las implicaciones de seguridad

### 5. Configurar Variables de Entorno

1. Copia el archivo `.env.example` y renómbralo a `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edita el archivo `.env` y completa las siguientes variables:

```env
# Activar almacenamiento en R2
USE_R2_STORAGE=true
USE_FILESYSTEM_SIGNATURES=false

# Credenciales de Cloudflare R2
R2_ACCOUNT_ID=tu-account-id-aqui
R2_ACCESS_KEY_ID=tu-access-key-id-aqui
R2_SECRET_ACCESS_KEY=tu-secret-access-key-aqui
R2_BUCKET_NAME=inventario-firmas

# URL pública (si configuraste dominio personalizado)
R2_PUBLIC_URL=https://cdn.tudominio.com
# O déjalo vacío si usas acceso público directo
```

### 6. Probar la Configuración

1. Reinicia tu servidor de desarrollo:
   ```bash
   pnpm dev
   ```

2. Crea un movimiento o ticket con firma
3. Verifica en el dashboard de R2 que el archivo se haya subido
4. Verifica que la firma se muestre correctamente en la aplicación

## 🔒 Seguridad

- **NUNCA** compartas tus credenciales de R2
- **NUNCA** subas el archivo `.env` a repositorios públicos
- El archivo `.env` ya está incluido en `.gitignore`
- Rota tus API tokens periódicamente
- Usa diferentes tokens para desarrollo y producción

## 📊 Costos

Cloudflare R2 ofrece:
- **10 GB de almacenamiento gratis** por mes
- **Sin cargos por transferencia de datos**
- Costos adicionales muy bajos después del límite gratuito

Para un sistema de inventario con firmas, es muy probable que te mantengas en el nivel gratuito.

## 🔄 Migración de Firmas Existentes

Si ya tienes firmas guardadas localmente y quieres migrarlas a R2:

1. Asegúrate de tener `USE_R2_STORAGE=true` en tu `.env`
2. Las nuevas firmas se guardarán automáticamente en R2
3. Las firmas antiguas seguirán funcionando desde el filesystem local
4. Opcionalmente, puedes ejecutar un script de migración (no incluido aún)

## ⚙️ Opciones de Configuración

### Prioridad de Almacenamiento

El sistema sigue esta prioridad:

1. **R2** (si `USE_R2_STORAGE=true` y credenciales configuradas)
2. **FileSystem** (si `USE_FILESYSTEM_SIGNATURES=true`)
3. **Data URL** (fallback, guarda base64 en la base de datos)

### Configuraciones Recomendadas

**Desarrollo Local:**
```env
USE_R2_STORAGE=false
USE_FILESYSTEM_SIGNATURES=true
```

**Producción:**
```env
USE_R2_STORAGE=true
USE_FILESYSTEM_SIGNATURES=false
```

## 🐛 Solución de Problemas

### Error: "Configuración de R2 incompleta"
- Verifica que todas las variables de entorno estén configuradas
- Verifica que no haya espacios extra en las variables

### Error: "Access Denied"
- Verifica que el API token tenga permisos de lectura/escritura
- Verifica que el token no haya expirado

### Las firmas no se muestran
- Verifica que el bucket tenga acceso público configurado
- Verifica que la URL pública esté correctamente configurada

### Error de conexión a R2
- Verifica que el Account ID sea correcto
- Verifica tu conexión a internet
- Verifica el estado de Cloudflare R2: https://www.cloudflarestatus.com/

## 📚 Referencias

- [Documentación oficial de Cloudflare R2](https://developers.cloudflare.com/r2/)
- [API de R2](https://developers.cloudflare.com/r2/api/s3/api/)
- [Precios de R2](https://www.cloudflare.com/products/r2/)

## ✅ Checklist de Configuración

- [ ] Crear bucket en Cloudflare R2
- [ ] Crear API token con permisos de lectura/escritura
- [ ] Obtener Account ID
- [ ] Configurar acceso público al bucket
- [ ] Copiar `.env.example` a `.env`
- [ ] Completar todas las variables de R2 en `.env`
- [ ] Reiniciar el servidor
- [ ] Probar creando una firma
- [ ] Verificar que la firma se suba a R2
- [ ] Verificar que la firma se muestre correctamente

