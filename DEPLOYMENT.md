# Guía de Despliegue - Sistema de Inventario CDS

## Variables de Entorno Requeridas

Crea un archivo `.env.local` o `.env.production` con las siguientes variables:

```bash
# Base de Datos MySQL
DATABASE_URL="mysql://usuario:contraseña@host:puerto/nombre_base_datos"

# NextAuth Configuration
NEXTAUTH_SECRET="tu-secreto-muy-seguro-de-al-menos-32-caracteres"
NEXTAUTH_URL="https://tu-dominio.com"

# Node Environment
NODE_ENV="production"
```

## Pasos para Despliegue

### 1. Preparación de la Base de Datos

```bash
# Ejecutar migraciones
npx prisma migrate deploy

# (Opcional) Poblar con datos iniciales
npm run seed
```

### 2. Build y Despliegue

```bash
# Instalar dependencias (esto ejecutará automáticamente `prisma generate`)
npm install

# Build de producción
npm run build

# Iniciar servidor
npm start
```

## Plataformas de Despliegue

### Vercel
1. Conectar repositorio
2. Configurar variables de entorno
3. El script `postinstall` se ejecutará automáticamente

### Railway
1. Conectar repositorio
2. Configurar variables de entorno
3. Railway ejecutará automáticamente `prisma generate`

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Problemas Comunes

### Error: Prisma Client not found
- Asegúrate de que `prisma generate` se ejecute durante el build
- Verifica que `DATABASE_URL` esté configurada correctamente

### Error: Database connection failed
- Verifica la URL de conexión a la base de datos
- Asegúrate de que la base de datos esté accesible desde tu plataforma de despliegue

### Error: NextAuth configuration
- Verifica que `NEXTAUTH_SECRET` esté configurado
- Asegúrate de que `NEXTAUTH_URL` coincida con tu dominio de producción
