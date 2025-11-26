# Sistema de Inventario CDS

## Descripción
Sistema web integral para la gestión completa del inventario del Centro de Sistemas de Urabá (CDS). Incluye módulos para la administración de elementos, categorías, movimientos, tickets, reportes y toda la estructura organizacional del inventario institucional.

## Características Principales

### 📦 **Gestión de Inventario**
- Administración completa de elementos
- Control de stock en tiempo real
- Seguimiento de ubicaciones
- Estados funcionales y físicos

### 🏷️ **Organización por Categorías**
- Gestión de categorías principales
- Subcategorías especializadas
- Clasificación jerárquica
- Filtros avanzados

### 📋 **Control de Movimientos**
- Registro de entradas y salidas
- Préstamos y devoluciones
- Firmas digitales
- Tickets de movimientos

### 📊 **Sistema de Reportes**
- Reportes de inventario completo
- Análisis de movimientos
- Préstamos activos
- Exportación a PDF y Excel

### 👥 **Gestión de Usuarios**
- Control de acceso por roles
- Auditoría de acciones
- Historial de cambios
- Sistema de autenticación

### 🔍 **Observaciones y Logs**
- Registro de observaciones
- Logs de auditoría
- Seguimiento de cambios
- Historial completo

## Tecnologías Utilizadas

### Frontend
- **Next.js 15** - Framework de React
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Framework de estilos
- **Shadcn/ui** - Componentes de UI
- **React Hook Form** - Manejo de formularios
- **Zod** - Validación de esquemas

### Backend
- **Next.js API Routes** - API del servidor
- **Prisma** - ORM para base de datos
- **MySQL** - Base de datos principal
- **NextAuth.js** - Autenticación

### Servicios de Reportes
- **jsPDF** - Generación de PDFs
- **SheetJS** - Exportación a Excel
- **QR Code Generator** - Códigos QR para elementos

## Estructura del Proyecto

```
src/
├── app/                    # Aplicación Next.js
│   ├── (main)/            # Rutas principales
│   │   ├── api/           # Endpoints de API
│   │   ├── dashboard/     # Panel principal
│   │   ├── elementos/     # Módulo de elementos
│   │   ├── categorias/    # Módulo de categorías
│   │   ├── subcategorias/ # Módulo de subcategorías
│   │   ├── movimientos/   # Módulo de movimientos
│   │   ├── tickets/       # Módulo de tickets
│   │   ├── reportes/      # Módulo de reportes
│   │   ├── observaciones/ # Módulo de observaciones
│   │   ├── logs/          # Módulo de logs
│   │   └── usuarios/      # Módulo de usuarios
│   ├── login/             # Autenticación
│   └── layout.tsx         # Layout principal
├── components/            # Componentes reutilizables
│   ├── ui/               # Componentes base de UI
│   ├── dashboard/        # Componentes del dashboard
│   ├── elementos/        # Componentes de elementos
│   ├── categorias/       # Componentes de categorías
│   ├── subcategorias/    # Componentes de subcategorías
│   ├── movimientos/      # Componentes de movimientos
│   ├── tickets/          # Componentes de tickets
│   ├── reportes/         # Componentes de reportes
│   ├── observaciones/    # Componentes de observaciones
│   ├── logs/            # Componentes de logs
│   ├── usuarios/         # Componentes de usuarios
│   └── skeletons/        # Componentes de carga
├── modules/              # Lógica de negocio
│   ├── elementos/
│   ├── categorias/
│   ├── subcategorias/
│   ├── movimientos/
│   ├── tickets_guardados/
│   ├── observaciones/
│   ├── logs/
│   ├── reportes/
│   ├── reportes_generados/
│   └── usuario/
├── hooks/                # Hooks personalizados
├── contexts/             # Contextos de React
├── lib/                  # Utilidades y configuración
├── utils/                # Funciones utilitarias
└── types/                # Definiciones de tipos
```

## Instalación y Configuración

### Prerrequisitos
- Node.js 18+ 
- pnpm (recomendado) o npm
- MySQL 8.0+

### Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd sistema-inventario-cds
```

2. **Instalar dependencias**
```bash
pnpm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
```

Editar `.env` con las configuraciones necesarias:
```env
# Base de datos
DATABASE_URL="mysql://usuario:password@localhost:3306/sistema_inventario_cds"

# NextAuth
NEXTAUTH_SECRET="tu-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Configuración de firmas (opcional: Cloudflare R2)
USE_R2_STORAGE=false
USE_FILESYSTEM_SIGNATURES=true

# Si usas Cloudflare R2 para firmas (ver docs/setup/CLOUDFLARE_R2_SETUP.md)
# R2_ACCOUNT_ID="tu-account-id"
# R2_ACCESS_KEY_ID="tu-access-key"
# R2_SECRET_ACCESS_KEY="tu-secret-access-key"
# R2_BUCKET_NAME="nombre-bucket"
# R2_PUBLIC_URL=""
```

Para más detalles sobre la configuración, consulta la [documentación](./docs/README.md)

4. **Configurar la base de datos**
```bash
# Generar cliente de Prisma
pnpm prisma generate

# Ejecutar migraciones
pnpm prisma migrate dev

# Poblar datos iniciales
pnpm prisma db seed
```

5. **Ejecutar en desarrollo**
```bash
pnpm dev
```

## Scripts Disponibles

```bash
# Desarrollo
pnpm dev                 # Servidor de desarrollo
pnpm build              # Construir para producción
pnpm start              # Servidor de producción
pnpm lint               # Linter de código
pnpm type-check         # Verificación de tipos

# Base de datos
pnpm prisma generate    # Generar cliente de Prisma
pnpm prisma migrate dev # Ejecutar migraciones
pnpm prisma db seed     # Poblar datos iniciales
pnpm prisma studio      # Interfaz visual de la BD

# Testing
pnpm test               # Ejecutar tests
pnpm test:watch         # Tests en modo watch
pnpm test:coverage      # Tests con cobertura
```

## Módulos Principales

### 📦 Elementos
- **Gestión de Elementos**: Administración completa del inventario
- **Códigos QR**: Generación automática de códigos QR
- **Control de Stock**: Seguimiento en tiempo real
- **Estados**: Control de estado funcional y físico

### 🏷️ Categorías y Subcategorías
- **Categorías**: Organización principal del inventario
- **Subcategorías**: Clasificación especializada
- **Jerarquía**: Estructura organizacional
- **Filtros**: Búsqueda avanzada

### 📋 Movimientos
- **Entradas y Salidas**: Registro de movimientos
- **Préstamos**: Sistema de préstamos con devolución
- **Firmas Digitales**: Autenticación de movimientos
- **Tickets**: Generación automática de tickets

### 📊 Reportes
- **Inventario Completo**: Reporte detallado del inventario
- **Movimientos**: Análisis de movimientos por período
- **Préstamos Activos**: Seguimiento de préstamos pendientes
- **Exportación**: PDF y Excel

### 🔍 Auditoría
- **Observaciones**: Registro de observaciones sobre elementos
- **Logs**: Historial completo de acciones
- **Auditoría**: Seguimiento de cambios
- **Trazabilidad**: Rastro completo de movimientos

### 👥 Usuarios
- **Gestión de Usuarios**: Administración de acceso
- **Roles y Permisos**: Control granular de acceso
- **Autenticación**: Sistema seguro de login
- **Perfiles**: Gestión de información de usuarios

## Base de Datos

### Modelos Principales

- **Usuario**: Usuarios del sistema
- **Elementos**: Elementos del inventario
- **Categorias**: Categorías principales
- **Subcategorias**: Subcategorías especializadas
- **Movimientos**: Registro de movimientos
- **TicketsGuardados**: Tickets de movimientos
- **Observaciones**: Observaciones sobre elementos
- **Logs**: Logs de auditoría
- **ReportesGenerados**: Historial de reportes

## API Endpoints

### Autenticación
- `POST /api/auth/signin` - Iniciar sesión
- `POST /api/auth/signout` - Cerrar sesión
- `GET /api/auth/session` - Obtener sesión

### Elementos
- `GET /api/elementos` - Listar elementos
- `POST /api/elementos` - Crear elemento
- `PUT /api/elementos/[id]` - Actualizar elemento
- `DELETE /api/elementos/[id]` - Eliminar elemento

### Categorías
- `GET /api/categorias` - Listar categorías
- `POST /api/categorias` - Crear categoría
- `PUT /api/categorias/[id]` - Actualizar categoría

### Movimientos
- `GET /api/movimientos` - Listar movimientos
- `POST /api/movimientos` - Crear movimiento
- `PUT /api/movimientos/[id]` - Actualizar movimiento

### Reportes
- `GET /api/reportes/inventario` - Reporte de inventario
- `GET /api/reportes/movimientos` - Reporte de movimientos
- `GET /api/reportes/prestamos-activos` - Reporte de préstamos activos

## Características Avanzadas

### 🎨 **Interfaz Moderna**
- Diseño responsive y accesible
- Tema claro/oscuro
- Componentes reutilizables
- Animaciones suaves

### 🔒 **Seguridad**
- Autenticación robusta
- Validación de datos
- Auditoría completa
- Control de acceso

### 📱 **Responsive Design**
- Optimizado para móviles
- Tablet-friendly
- Desktop-first
- Accesibilidad WCAG

### ⚡ **Performance**
- Carga rápida
- Optimización de imágenes
- Lazy loading
- Caching inteligente

## Despliegue

### Vercel (Recomendado)

1. **Conectar repositorio a Vercel**
2. **Configurar variables de entorno**
3. **Configurar base de datos (MySQL/PostgreSQL)**
4. **Desplegar automáticamente**

### Variables de Entorno de Producción

```env
DATABASE_URL="mysql://..."
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="https://tu-dominio.com"

# Configuración de firmas (recomendado para producción)
USE_R2_STORAGE=true
USE_FILESYSTEM_SIGNATURES=false
R2_ACCOUNT_ID="..."
R2_ACCESS_KEY_ID="..."
R2_SECRET_ACCESS_KEY="..."
R2_BUCKET_NAME="..."
R2_PUBLIC_URL="https://cdn.tu-dominio.com"
```

**Nota**: Para producción, se recomienda usar Cloudflare R2 para almacenar firmas. Consulta la [guía de configuración de R2](./docs/setup/CLOUDFLARE_R2_SETUP.md) y la [guía de migración](./docs/guides/MIGRATION_GUIDE.md)

## Contribución

### Flujo de Trabajo

1. **Fork del repositorio**
2. **Crear rama feature**: `git checkout -b feature/nueva-funcionalidad`
3. **Realizar cambios**
4. **Commit**: `git commit -m "feat: agregar nueva funcionalidad"`
5. **Push**: `git push origin feature/nueva-funcionalidad`
6. **Crear Pull Request**

### Convenciones

- **Commits**: Usar Conventional Commits
- **Código**: Seguir ESLint y Prettier
- **Tipos**: Usar TypeScript estricto
- **Componentes**: Documentar props y ejemplos
- **Tests**: Escribir tests para funcionalidades críticas

## 📚 Documentación

La documentación completa está organizada en el directorio [`docs/`](./docs/):

### 📖 Guías y Configuración
- **[Setup y Configuración](./docs/setup/)** - Guías de configuración inicial
  - [Cloudflare R2](./docs/setup/CLOUDFLARE_R2_SETUP.md) - Configuración de almacenamiento en la nube
- **[Guías de Migración](./docs/guides/)** - Guías para actualizaciones y migraciones
  - [Migración de Firmas](./docs/guides/MIGRATION_GUIDE.md) - Migración del sistema de firmas

### 💻 Documentación Técnica
- **[Documentación de Desarrollo](./docs/development/)** - Documentación del código
  - [Módulos](./docs/development/modules/) - Lógica de negocio
  - [Componentes](./docs/development/components/) - Componentes de React
  - [Hooks](./docs/development/hooks/) - Custom hooks
  - [Contextos](./docs/development/contexts/) - Context API
  - [Servicios](./docs/development/services/) - Utilidades y servicios

Para más información, consulta el [README de documentación](./docs/README.md)

## Licencia

Este proyecto es propiedad del Centro de Sistemas de Urabá (CDS) y está protegido por derechos de autor.

---

**Desarrollado con ❤️ para el Centro de Sistemas de Urabá (CDS)**