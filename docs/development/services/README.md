# Servicios del Sistema

## ⚙️ Servicios de Infraestructura

Los servicios encapsulan la lógica de infraestructura y utilidades del sistema, proporcionando funcionalidades transversales a toda la aplicación.

## 🗄️ Servicios de Base de Datos

### **prisma.ts**
Configuración y conexión a la base de datos MySQL.

```tsx
// Ubicación: src/lib/prisma.ts

import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ['query'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

**Características:**
- ✅ Singleton pattern para desarrollo
- ✅ Logging de consultas en desarrollo
- ✅ Configuración optimizada para producción
- ✅ Manejo de conexiones

### **db-connection.ts**
Utilidades para manejo de conexiones de base de datos.

```tsx
export async function testConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

export async function closeConnection(): Promise<void> {
  await prisma.$disconnect();
}
```

## 🔐 Servicios de Autenticación

### **auth.ts**
Configuración de NextAuth.js y manejo de autenticación.

```tsx
// Ubicación: src/lib/auth.ts

import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import { prisma } from './prisma';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.usuarios.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !(await compare(credentials.password, user.password))) {
          return null;
        }

        return {
          id: user.id.toString(),
          email: user.email,
          name: user.nombre,
        };
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
});
```

**Características:**
- ✅ Autenticación con credenciales
- ✅ Hash de contraseñas con bcrypt
- ✅ Sesiones JWT
- ✅ Páginas personalizadas

## 📊 Servicios de Reportes

### **report-generator.ts**
Generación de reportes en PDF y Excel.

```tsx
// Ubicación: src/lib/report-generator.ts

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

// Generación de PDFs
export async function generateInventarioReport(data: InventarioReporteData): Promise<string> {
  const doc = new jsPDF();
  
  // Logo CDS
  const logoUrl = '/cds-logo.png';
  try {
    const logoData = await fetch(logoUrl).then(res => res.blob());
    const logoBase64 = await blobToBase64(logoData);
    doc.addImage(logoBase64, 'PNG', 10, 10, 30, 15);
  } catch (error) {
    console.warn('Logo not found, using fallback');
  }
  
  // Título
  doc.setFontSize(18);
  doc.text('Reporte de Inventario Completo', 50, 20);
  
  // Tabla de datos
  autoTable(doc, {
    head: [['ID', 'Serie', 'Marca', 'Modelo', 'Cantidad', 'Ubicación', 'Estado']],
    body: data.elementos.map(e => [
      e.id,
      e.serie,
      e.marca,
      e.modelo,
      e.cantidad,
      e.ubicacion,
      e.estado_funcional
    ]),
    startY: 40,
  });
  
  return doc.output('datauristring');
}

// Exportación a Excel
export function exportInventarioToExcel(data: InventarioReporteData): string {
  const worksheet = XLSX.utils.json_to_sheet(
    data.elementos.map(e => ({
      'ID': e.id,
      'Serie': e.serie,
      'Marca': e.marca,
      'Modelo': e.modelo,
      'Cantidad': e.cantidad,
      'Ubicación': e.ubicacion,
      'Estado Funcional': e.estado_funcional,
      'Estado Físico': e.estado_fisico,
      'Categoría': e.categoria.nombre,
      'Subcategoría': e.subcategoria?.nombre || 'N/A'
    }))
  );
  
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventario');
  
  return XLSX.write(workbook, { bookType: 'xlsx', type: 'base64' });
}
```

**Tipos de reportes soportados:**
- ✅ Inventario Completo
- ✅ Movimientos Recientes
- ✅ Préstamos Activos
- ✅ Categorías y Estadísticas
- ✅ Observaciones
- ✅ Tickets Guardados

### **report-handler.ts**
Manejo centralizado de generación de reportes.

```tsx
// Ubicación: src/lib/report-handler.ts

export type ReporteType = 
  | "inventario"
  | "movimientos" 
  | "prestamos-activos"
  | "categorias"
  | "observaciones"
  | "tickets";

export async function generateReport(
  tipoReporte: ReporteType,
  formato: 'pdf' | 'excel',
  fechaInicio?: string,
  fechaFin?: string
) {
  try {
    switch (tipoReporte) {
      case 'inventario':
        return await generateInventarioReport(formato, fechaInicio, fechaFin);
      case 'movimientos':
        return await generateMovimientosReport(formato, fechaInicio, fechaFin);
      // ... otros casos
    }
  } catch (error) {
    console.error("Error generando reporte:", error);
    return { success: false, message: "Error al generar el reporte" };
  }
}
```

## 🎫 Servicios de Tickets

### **ticket-generator.ts**
Generación de números de ticket únicos.

```tsx
// Ubicación: src/lib/ticket-generator.ts

export function generateUniqueTicketNumber(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `TICK-${timestamp}-${random}`;
}

export function validateTicketNumber(ticketNumber: string): boolean {
  const pattern = /^TICK-\d{13}-\d{3}$/;
  return pattern.test(ticketNumber);
}
```

## ✍️ Servicios de Firmas

### **signature-storage.ts**
Almacenamiento y manejo de firmas digitales.

```tsx
// Ubicación: src/lib/signature-storage.ts

export async function saveSignature(
  signatureData: string,
  filename: string
): Promise<string> {
  const base64Data = signatureData.split(',')[1];
  const buffer = Buffer.from(base64Data, 'base64');
  
  // Guardar en sistema de archivos o storage
  const filePath = `public/signatures/${filename}`;
  await fs.writeFile(filePath, buffer);
  
  return `/signatures/${filename}`;
}

export async function getSignature(filename: string): Promise<string | null> {
  try {
    const filePath = `public/signatures/${filename}`;
    const buffer = await fs.readFile(filePath);
    return buffer.toString('base64');
  } catch (error) {
    return null;
  }
}
```

## 📈 Servicios de Control de Stock

### **stock-control.ts**
Validación y control de stock de elementos.

```tsx
// Ubicación: src/lib/stock-control.ts

export interface StockInfo {
  disponible: number;
  total: number;
  reservado: number;
  en_prestamo: number;
}

export async function getStockInfo(elementoId: number): Promise<StockInfo> {
  const elemento = await prisma.elementos.findUnique({
    where: { id: elementoId },
  });

  if (!elemento) {
    throw new Error('Elemento no encontrado');
  }

  // Calcular stock en préstamo
  const prestamosActivos = await prisma.movimientos.aggregate({
    where: {
      elemento_id: elementoId,
      tipo: 'SALIDA',
      fecha_real_devolucion: null,
    },
    _sum: {
      cantidad: true,
    },
  });

  const enPrestamo = prestamosActivos._sum.cantidad || 0;

  return {
    disponible: elemento.cantidad - enPrestamo,
    total: elemento.cantidad,
    reservado: 0, // Implementar lógica de reservas
    en_prestamo: enPrestamo,
  };
}

export async function validateStockAvailable(
  elementoId: number,
  cantidadRequerida: number
): Promise<{ valid: boolean; disponible: number }> {
  const stockInfo = await getStockInfo(elementoId);
  
  return {
    valid: stockInfo.disponible >= cantidadRequerida,
    disponible: stockInfo.disponible,
  };
}
```

## 📝 Servicios de Logs

### **audit-logger.ts**
Sistema de logs de auditoría.

```tsx
// Ubicación: src/lib/audit-logger.ts

export interface AuditLogEntry {
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW';
  entity: string;
  entityId: number;
  userId?: number;
  changes?: Record<string, any>;
  timestamp: Date;
  ip?: string;
  userAgent?: string;
}

export async function logAuditEvent(entry: Omit<AuditLogEntry, 'timestamp'>): Promise<void> {
  await prisma.audit_logs.create({
    data: {
      ...entry,
      timestamp: new Date(),
    },
  });
}

export async function getAuditLogs(
  entity?: string,
  entityId?: number,
  limit = 100
): Promise<AuditLogEntry[]> {
  return await prisma.audit_logs.findMany({
    where: {
      ...(entity && { entity }),
      ...(entityId && { entityId }),
    },
    orderBy: {
      timestamp: 'desc',
    },
    take: limit,
  });
}
```

## 🔔 Servicios de Notificaciones

### **notifications.ts**
Sistema de notificaciones del usuario.

```tsx
// Ubicación: src/lib/notifications.ts

import { toast } from 'sonner';

export interface NotificationOptions {
  title?: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function showNotification(
  message: string,
  type: 'success' | 'error' | 'warning' | 'info' = 'info',
  options?: NotificationOptions
): void {
  switch (type) {
    case 'success':
      toast.success(message, {
        description: options?.description,
        duration: options?.duration,
        action: options?.action,
      });
      break;
    case 'error':
      toast.error(message, {
        description: options?.description,
        duration: options?.duration,
      });
      break;
    case 'warning':
      toast.warning(message, {
        description: options?.description,
        duration: options?.duration,
      });
      break;
    default:
      toast(message, {
        description: options?.description,
        duration: options?.duration,
        action: options?.action,
      });
  }
}

// Notificaciones específicas del sistema
export function notifyStockLow(elemento: string, cantidad: number): void {
  showNotification(
    `Stock bajo: ${elemento}`,
    'warning',
    {
      description: `Solo quedan ${cantidad} unidades disponibles`,
    }
  );
}

export function notifyMovementCreated(ticketNumber: string): void {
  showNotification(
    'Movimiento creado exitosamente',
    'success',
    {
      description: `Ticket: ${ticketNumber}`,
    }
  );
}
```

## 🛠️ Servicios de Utilidades

### **utils.ts**
Funciones utilitarias generales.

```tsx
// Ubicación: src/lib/utils.ts

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Combinar clases de Tailwind
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Formateo de fechas
export function formatDate(date: Date, locale = 'es-ES'): string {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export function formatDateTime(date: Date, locale = 'es-ES'): string {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

// Validación de emails
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Generación de códigos QR
export function generateQRCode(data: string): Promise<string> {
  // Implementación con librería QR
  return new Promise((resolve) => {
    // Lógica de generación
    resolve('data:image/png;base64,...');
  });
}

// Conversión de archivos
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
```

## 🔄 Patrones de Implementación

### Servicios con Cache

```tsx
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

export async function getCachedData<T>(
  key: string,
  fetcher: () => Promise<T>
): Promise<T> {
  const cached = cache.get(key);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  
  const data = await fetcher();
  cache.set(key, { data, timestamp: Date.now() });
  
  return data;
}
```

### Servicios con Retry

```tsx
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
  }
  
  throw lastError!;
}
```

## 🧪 Testing de Servicios

### Setup de Tests
```tsx
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TEST_DATABASE_URL,
    },
  },
});

beforeEach(async () => {
  // Limpiar base de datos de test
  await prisma.$transaction([
    prisma.audit_logs.deleteMany(),
    prisma.movimientos.deleteMany(),
    prisma.elementos.deleteMany(),
  ]);
});

afterAll(async () => {
  await prisma.$disconnect();
});
```

### Tests de Servicios
```tsx
describe('Stock Control Service', () => {
  test('should calculate stock correctly', async () => {
    // Setup
    const elemento = await createTestElemento({ cantidad: 10 });
    await createTestMovimiento({ 
      elemento_id: elemento.id, 
      tipo: 'SALIDA', 
      cantidad: 3 
    });
    
    // Test
    const stockInfo = await getStockInfo(elemento.id);
    
    expect(stockInfo.total).toBe(10);
    expect(stockInfo.en_prestamo).toBe(3);
    expect(stockInfo.disponible).toBe(7);
  });
});
```

## 📊 Performance

### Optimizaciones
```tsx
// ✅ Cache de consultas frecuentes
const statsCache = new Map();

export async function getSystemStats() {
  const cacheKey = 'system-stats';
  const cached = statsCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < 60000) {
    return cached.data;
  }
  
  const stats = await calculateSystemStats();
  statsCache.set(cacheKey, { data: stats, timestamp: Date.now() });
  
  return stats;
}

// ✅ Consultas optimizadas
export async function getDashboardData() {
  return await prisma.$transaction([
    prisma.elementos.count(),
    prisma.movimientos.count(),
    prisma.tickets_guardados.count(),
    prisma.categorias.count(),
  ]);
}
```

## 🚀 Servicios Futuros

### Planificados para Implementar

1. **email-service**: Envío de emails
2. **file-storage**: Almacenamiento de archivos
3. **backup-service**: Respaldos automáticos
4. **monitoring-service**: Monitoreo del sistema
5. **cache-service**: Sistema de cache distribuido

### Consideraciones
- ✅ Mantener servicios pequeños y específicos
- ✅ Implementar logging y monitoreo
- ✅ Incluir tests unitarios
- ✅ Documentar APIs de servicios
- ✅ Optimizar performance

---

**Última actualización**: $(date)
**Servicios implementados**: 8
**Servicios planificados**: 5+
**Mantenido por**: Equipo CDS
