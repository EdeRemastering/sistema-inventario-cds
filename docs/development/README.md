# Sistema de Inventario CDS - Documentación General

## 📋 Descripción del Proyecto

El **Sistema de Inventario CDS** es una aplicación web desarrollada con Next.js 15 que permite gestionar el inventario de equipos, movimientos de entrada y salida, tickets de préstamo, y generar reportes del sistema.

## 🏗️ Arquitectura del Sistema

### Stack Tecnológico
- **Frontend**: Next.js 15 con App Router
- **Backend**: Next.js API Routes
- **Base de Datos**: MySQL con Prisma ORM
- **UI**: Tailwind CSS + shadcn/ui
- **Autenticación**: NextAuth.js
- **Validación**: Zod + React Hook Form
- **Notificaciones**: Sonner
- **Reportes**: jsPDF + xlsx

### Estructura del Proyecto
```
src/
├── app/                    # Rutas de la aplicación
├── components/             # Componentes reutilizables
├── contexts/              # Contextos de React
├── hooks/                 # Custom hooks
├── lib/                   # Utilidades y configuraciones
├── modules/               # Lógica de negocio por entidad
├── types/                 # Definiciones de tipos TypeScript
└── utils/                 # Funciones utilitarias
```

## 🎯 Funcionalidades Principales

### 1. **Gestión de Inventario**
- ✅ CRUD de elementos del inventario
- ✅ Categorías y subcategorías
- ✅ Control de stock
- ✅ Estados funcional y físico
- ✅ Generación de códigos QR

### 2. **Movimientos**
- ✅ Entradas y salidas de inventario
- ✅ Validación de stock disponible
- ✅ Generación automática de tickets
- ✅ Fechas de movimiento y devolución
- ✅ Firmas digitales

### 3. **Tickets de Préstamo**
- ✅ Creación de tickets de préstamo
- ✅ Seguimiento de préstamos activos
- ✅ Fechas de salida y devolución estimada
- ✅ Firmas de funcionarios
- ✅ Dependencias de entrega y recepción

### 4. **Reportes**
- ✅ Inventario completo
- ✅ Movimientos recientes
- ✅ Préstamos activos
- ✅ Categorías y estadísticas
- ✅ Observaciones
- ✅ Tickets guardados
- ✅ Exportación PDF y Excel

### 5. **Usuarios y Logs**
- ✅ Gestión de usuarios
- ✅ Sistema de autenticación
- ✅ Logs de auditoría
- ✅ Control de acceso

## 🔧 Configuración y Desarrollo

### Requisitos Previos
- Node.js 18+
- MySQL 8.0+
- pnpm (recomendado)

### Instalación
```bash
# Clonar el repositorio
git clone <repository-url>
cd sistema-inventario-cds

# Instalar dependencias
pnpm install

# Configurar variables de entorno
cp .env.example .env.local

# Ejecutar migraciones
pnpm db:push

# Ejecutar seeders
pnpm db:seed

# Iniciar desarrollo
pnpm dev
```

### Scripts Disponibles
```bash
pnpm dev          # Desarrollo
pnpm build        # Producción
pnpm start        # Iniciar producción
pnpm lint         # Linter
pnpm db:push      # Migraciones
pnpm db:seed      # Datos iniciales
```

## 📊 Base de Datos

### Entidades Principales
- **elementos**: Inventario de equipos
- **categorias**: Categorías de elementos
- **subcategorias**: Subcategorías
- **movimientos**: Entradas/salidas
- **tickets_guardados**: Tickets de préstamo
- **observaciones**: Observaciones de elementos
- **usuarios**: Usuarios del sistema
- **reportes_generados**: Historial de reportes

## 🎨 UI/UX

### Design System
- **shadcn/ui**: Componentes base
- **Tailwind CSS**: Estilos
- **Lucide Icons**: Iconografía
- **Responsive Design**: Mobile-first

### Temas
- ✅ Tema claro y oscuro
- ✅ Colores corporativos CDS
- ✅ Componentes consistentes

## 🔐 Seguridad

### Autenticación
- NextAuth.js con proveedores configurables
- Sesiones seguras
- Protección de rutas

### Validación
- Zod para validación de esquemas
- React Hook Form para formularios
- Sanitización de datos

## 📈 Performance

### Optimizaciones
- Server Components cuando es posible
- Client Components solo cuando necesario
- Lazy loading de componentes
- Optimización de imágenes
- Caching estratégico

## 🧪 Testing

### Estrategia de Testing
- Unit tests para utilidades
- Integration tests para APIs
- E2E tests para flujos críticos

## 🚀 Deployment

### Producción
- Vercel (recomendado)
- Variables de entorno configuradas
- Base de datos MySQL en producción
- CDN para assets estáticos

## 📝 Convenciones de Código

### Naming
- **Componentes**: PascalCase
- **Archivos**: kebab-case
- **Funciones**: camelCase
- **Constantes**: UPPER_SNAKE_CASE

### Estructura de Archivos
- Un componente por archivo
- Barrel exports (index.ts)
- Separación de lógica y presentación

## 🔄 Flujo de Desarrollo

### Git Flow
- **main**: Producción
- **develop**: Desarrollo
- **feature/**: Nuevas funcionalidades
- **hotfix/**: Correcciones urgentes

### Pull Requests
- Revisión de código obligatoria
- Tests pasando
- Documentación actualizada

## 📚 Documentación Específica

Para documentación detallada de cada parte del sistema:

- [📦 Componentes](./components/README.md)
- [🔄 Contextos](./contexts/README.md)
- [🎣 Hooks](./hooks/README.md)
- [📋 Módulos](./modules/README.md)
- [⚙️ Servicios](./services/README.md)

## 🤝 Contribución

### Cómo Contribuir
1. Fork del repositorio
2. Crear rama feature
3. Implementar cambios
4. Crear Pull Request
5. Revisión y merge

### Estándares
- Código limpio y comentado
- Tests incluidos
- Documentación actualizada
- Commits descriptivos

---

**Última actualización**: $(date)
**Versión**: 1.0.0
**Mantenido por**: Equipo CDS
