# 📚 Documentación del Sistema de Inventario CDS

Bienvenido a la documentación completa del Sistema de Inventario CDS. Esta documentación está organizada en diferentes secciones para facilitar la navegación.

## 📂 Estructura de la Documentación

### 🚀 [Setup / Configuración](./setup/)

Guías de configuración inicial y servicios externos:

- **[Configuración de Cloudflare R2](./setup/CLOUDFLARE_R2_SETUP.md)** - Guía completa para configurar el almacenamiento de firmas en Cloudflare R2
  - Creación de buckets
  - Configuración de API tokens
  - Variables de entorno
  - Solución de problemas

### 📖 [Guías](./guides/)

Guías paso a paso para tareas específicas:

- **[Guía de Migración de Firmas](./guides/MIGRATION_GUIDE.md)** - Migración del sistema de firmas a base de datos
  - Compatibilidad con producción
  - Scripts de migración
  - Verificación y testing

### 💻 [Desarrollo](./development/)

Documentación técnica del código:

- **[README Principal](./development/README.md)** - Visión general de la arquitectura
- **[Componentes](./development/components/README.md)** - Componentes de React
- **[Contextos](./development/contexts/README.md)** - Context API de React
- **[Hooks](./development/hooks/README.md)** - Custom hooks
- **[Módulos](./development/modules/README.md)** - Módulos de backend
- **[Servicios](./development/services/README.md)** - Servicios y utilidades

## 🎯 Inicio Rápido

### Para nuevos desarrolladores:

1. Lee el [README del proyecto](../README.md) en la raíz
2. Configura tu entorno con la [Guía de Configuración de R2](./setup/CLOUDFLARE_R2_SETUP.md)
3. Revisa la [Documentación de Desarrollo](./development/README.md)

### Para configurar el proyecto en producción:

1. Sigue la [Guía de Configuración de R2](./setup/CLOUDFLARE_R2_SETUP.md)
2. Aplica las migraciones con la [Guía de Migración](./guides/MIGRATION_GUIDE.md)
3. Configura las variables de entorno según las guías

## 🔍 Buscar en la Documentación

- **Configuración de servicios externos** → [Setup](./setup/)
- **Problemas con firmas** → [Guía de Migración](./guides/MIGRATION_GUIDE.md)
- **Almacenamiento en la nube** → [Cloudflare R2](./setup/CLOUDFLARE_R2_SETUP.md)
- **Arquitectura del código** → [Desarrollo](./development/)
- **Componentes React** → [Componentes](./development/components/README.md)
- **Backend y API** → [Módulos](./development/modules/README.md)

## 📝 Contribuir a la Documentación

Si encuentras información faltante o desactualizada:

1. Crea un issue describiendo el problema
2. O mejor aún, actualiza la documentación y envía un PR
3. Mantén el formato y la estructura consistente

## 🛠️ Tecnologías Principales

- **Framework**: Next.js 15
- **Base de datos**: MySQL con Prisma ORM
- **UI**: React 19 + Tailwind CSS + Radix UI
- **Autenticación**: NextAuth.js
- **Almacenamiento**: Cloudflare R2 (compatible con S3)
- **Testing**: Vitest + Testing Library

## 📞 Soporte

Para preguntas o problemas:

1. Consulta esta documentación primero
2. Revisa los issues existentes en el repositorio
3. Crea un nuevo issue si es necesario

---

**Última actualización**: Noviembre 2025

