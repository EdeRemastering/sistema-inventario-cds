# Módulos del Sistema

## 📋 Arquitectura Modular

Los módulos encapsulan la lógica de negocio por entidad, siguiendo el patrón de separación de responsabilidades y facilitando el mantenimiento del código.

## 🏗️ Estructura de Módulos

Cada módulo contiene 4 archivos principales:

```
src/modules/[entidad]/
├── actions.ts      # Server Actions
├── services.ts     # Lógica de negocio
├── types.ts        # Definiciones de tipos
└── validations.ts  # Esquemas Zod
```

## 📦 Módulos Implementados

### **elementos/**
Gestión completa de elementos del inventario.

#### **types.ts**
```tsx
export interface Elemento {
  id: number;
  serie: string;
  marca: string;
  modelo: string;
  cantidad: number;
  ubicacion: string;
  estado_funcional: 'FUNCIONAL' | 'NO_FUNCIONAL';
  estado_fisico: 'BUENO' | 'REGULAR' | 'MALO';
  categoria_id: number;
  subcategoria_id?: number;
  created_at: Date;
  updated_at: Date;
}

export interface ElementoFormData {
  serie: string;
  marca: string;
  modelo: string;
  cantidad: number;
  ubicacion: string;
  estado_funcional: 'FUNCIONAL' | 'NO_FUNCIONAL';
  estado_fisico: 'BUENO' | 'REGULAR' | 'MALO';
  categoria_id: number;
  subcategoria_id?: number;
}
```

#### **validations.ts**
```tsx
export const elementoCreateSchema = z.object({
  serie: z.string().min(1, "Serie requerida").max(50),
  marca: z.string().min(1, "Marca requerida").max(100),
  modelo: z.string().min(1, "Modelo requerido").max(100),
  cantidad: z.number().int().min(1, "Cantidad debe ser mayor a 0"),
  ubicacion: z.string().min(1, "Ubicación requerida").max(200),
  estado_funcional: z.enum(['FUNCIONAL', 'NO_FUNCIONAL']),
  estado_fisico: z.enum(['BUENO', 'REGULAR', 'MALO']),
  categoria_id: z.number().int().positive(),
  subcategoria_id: z.number().int().positive().optional(),
});
```

#### **services.ts**
```tsx
// CRUD básico
export async function createElemento(data: ElementoFormData): Promise<Elemento>
export async function getElemento(id: number): Promise<Elemento | null>
export async function updateElemento(id: number, data: Partial<ElementoFormData>): Promise<Elemento>
export async function deleteElemento(id: number): Promise<void>
export async function listElementos(): Promise<Elemento[]>

// Funciones específicas
export async function getElementosByCategoria(categoriaId: number): Promise<Elemento[]>
export async function getElementosByEstado(estado: string): Promise<Elemento[]>
export async function searchElementos(query: string): Promise<Elemento[]>
export async function getStockInfo(elementoId: number): Promise<StockInfo>
```

#### **actions.ts**
```tsx
export async function actionCreateElemento(formData: FormData): Promise<ActionResult>
export async function actionUpdateElemento(id: number, formData: FormData): Promise<ActionResult>
export async function actionDeleteElemento(id: number): Promise<ActionResult>
export async function actionValidateSerie(serie: string): Promise<ValidationResult>
```

### **categorias/**
Gestión de categorías de elementos.

#### **Funcionalidades:**
- ✅ CRUD completo
- ✅ Validación de nombres únicos
- ✅ Estadísticas de elementos
- ✅ Soft delete

#### **Servicios principales:**
```tsx
export async function createCategoria(data: CategoriaFormData): Promise<Categoria>
export async function listCategorias(): Promise<Categoria[]>
export async function getCategoriaStats(id: number): Promise<CategoriaStats>
export async function validateCategoriaName(nombre: string, excludeId?: number): Promise<boolean>
```

### **subcategorias/**
Gestión de subcategorías.

#### **Funcionalidades:**
- ✅ CRUD con relación a categorías
- ✅ Validación de nombres únicos por categoría
- ✅ Estadísticas de elementos

### **movimientos/**
Gestión de movimientos de inventario (entradas/salidas).

#### **Funcionalidades:**
- ✅ Validación de stock disponible
- ✅ Generación automática de tickets
- ✅ Control de fechas
- ✅ Firmas digitales
- ✅ Estados de préstamo

#### **Servicios principales:**
```tsx
export async function createMovimiento(data: MovimientoFormData): Promise<Movimiento>
export async function validateStock(elementoId: number, cantidad: number): Promise<StockValidation>
export async function getMovimientosByElemento(elementoId: number): Promise<Movimiento[]>
export async function getPrestamosActivos(): Promise<Movimiento[]>
export async function procesarDevolucion(movimientoId: number): Promise<void>
```

### **tickets_guardados/**
Gestión de tickets de préstamo.

#### **Funcionalidades:**
- ✅ Generación de números únicos
- ✅ Firmas digitales
- ✅ Fechas de salida y devolución
- ✅ Dependencias de entrega/recepción

### **observaciones/**
Gestión de observaciones de elementos.

#### **Funcionalidades:**
- ✅ Relación con elementos
- ✅ Fechas de observación
- ✅ Descripciones detalladas
- ✅ Filtros por fecha

### **usuarios/**
Gestión de usuarios del sistema.

#### **Funcionalidades:**
- ✅ CRUD de usuarios
- ✅ Roles y permisos
- ✅ Validación de emails únicos
- ✅ Estados activo/inactivo

### **reportes/**
Generación de reportes del sistema.

#### **Funcionalidades:**
- ✅ 6 tipos de reportes
- ✅ Filtros de fecha
- ✅ Exportación PDF/Excel
- ✅ Historial de reportes generados

#### **Tipos de reportes:**
1. **Inventario Completo**
2. **Movimientos Recientes**
3. **Préstamos Activos**
4. **Categorías y Estadísticas**
5. **Observaciones**
6. **Tickets Guardados**

### **reportes_generados/**
Gestión del historial de reportes.

#### **Funcionalidades:**
- ✅ Almacenamiento de metadatos
- ✅ Historial de generación
- ✅ Limpieza automática
- ✅ Descarga de archivos

## 🔄 Patrones de Implementación

### Estructura de Server Actions

```tsx
export async function actionCreateEntity(formData: FormData) {
  try {
    // 1. Validar datos
    const parsed = schema.safeParse(formDataToObject(formData));
    if (!parsed.success) {
      throw new Error('Datos inválidos');
    }

    // 2. Ejecutar lógica de negocio
    const result = await createEntity(parsed.data);

    // 3. Revalidar cache
    revalidatePath('/entity');

    // 4. Log de auditoría
    await auditLog('CREATE', 'entity', result.id);

    return { success: true, data: result };
  } catch (error) {
    console.error('Error creating entity:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Error desconocido' 
    };
  }
}
```

### Validaciones con Zod

```tsx
// Esquemas base reutilizables
export const baseEntitySchema = z.object({
  id: z.number().int().positive().optional(),
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
});

// Esquemas específicos
export const entityCreateSchema = baseEntitySchema.extend({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
});

// Validaciones personalizadas
export const entityUpdateSchema = entityCreateSchema.partial().extend({
  id: z.number().int().positive(),
});
```

### Servicios con Prisma

```tsx
export async function createEntity(data: EntityFormData): Promise<Entity> {
  return await prisma.entity.create({
    data: {
      ...data,
      created_at: new Date(),
    },
    include: {
      // Relaciones necesarias
    },
  });
}

export async function listEntities(filters?: EntityFilters): Promise<Entity[]> {
  const where: Prisma.EntityWhereInput = {};
  
  if (filters?.status) {
    where.status = filters.status;
  }
  
  if (filters?.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  return await prisma.entity.findMany({
    where,
    include: {
      // Relaciones
    },
    orderBy: {
      created_at: 'desc',
    },
  });
}
```

## 🎯 Mejores Prácticas

### 1. **Separación de Responsabilidades**
```tsx
// ✅ Actions: Solo manejo de formularios y revalidación
export async function actionCreateEntity(formData: FormData) {
  const data = validateAndParse(formData);
  const result = await createEntity(data);
  revalidatePath('/entities');
  return result;
}

// ✅ Services: Lógica de negocio pura
export async function createEntity(data: EntityData): Promise<Entity> {
  await validateBusinessRules(data);
  return await prisma.entity.create({ data });
}
```

### 2. **Manejo de Errores**
```tsx
// ✅ Errores específicos y descriptivos
export async function validateStock(elementoId: number, cantidad: number) {
  const elemento = await getElemento(elementoId);
  if (!elemento) {
    throw new Error('Elemento no encontrado');
  }
  
  if (elemento.cantidad < cantidad) {
    throw new Error(`Stock insuficiente. Disponible: ${elemento.cantidad}`);
  }
  
  return { valid: true, disponible: elemento.cantidad };
}
```

### 3. **Validaciones de Negocio**
```tsx
// ✅ Validaciones complejas en servicios
export async function canDeleteCategoria(id: number): Promise<boolean> {
  const elementos = await getElementosByCategoria(id);
  return elementos.length === 0;
}

export async function validateUniqueSerie(serie: string, excludeId?: number): Promise<boolean> {
  const existing = await prisma.elemento.findFirst({
    where: {
      serie,
      ...(excludeId && { id: { not: excludeId } }),
    },
  });
  return !existing;
}
```

### 4. **Transacciones**
```tsx
// ✅ Operaciones atómicas
export async function createMovimientoWithTicket(data: MovimientoData) {
  return await prisma.$transaction(async (tx) => {
    // 1. Crear movimiento
    const movimiento = await tx.movimiento.create({ data });
    
    // 2. Actualizar stock
    await tx.elemento.update({
      where: { id: data.elemento_id },
      data: { cantidad: { decrement: data.cantidad } },
    });
    
    // 3. Crear ticket si es salida
    if (data.tipo === 'SALIDA') {
      await tx.ticket.create({
        data: {
          movimiento_id: movimiento.id,
          numero_ticket: generateTicketNumber(),
        },
      });
    }
    
    return movimiento;
  });
}
```

## 📊 Performance

### Optimizaciones de Consultas

```tsx
// ✅ Include selectivo
export async function listElementosWithRelations() {
  return await prisma.elemento.findMany({
    select: {
      id: true,
      serie: true,
      marca: true,
      modelo: true,
      categoria: {
        select: { nombre: true }
      },
      subcategoria: {
        select: { nombre: true }
      },
    },
  });
}

// ✅ Paginación
export async function listElementosPaginated(page: number, limit: number) {
  const skip = (page - 1) * limit;
  
  const [elementos, total] = await Promise.all([
    prisma.elemento.findMany({
      skip,
      take: limit,
      orderBy: { created_at: 'desc' },
    }),
    prisma.elemento.count(),
  ]);
  
  return {
    elementos,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}
```

## 🧪 Testing de Módulos

### Tests de Servicios
```tsx
describe('Elementos Service', () => {
  test('should create elemento', async () => {
    const data = {
      serie: 'TEST-001',
      marca: 'Test Brand',
      modelo: 'Test Model',
      cantidad: 5,
      ubicacion: 'Test Location',
      estado_funcional: 'FUNCIONAL',
      estado_fisico: 'BUENO',
      categoria_id: 1,
    };
    
    const elemento = await createElemento(data);
    
    expect(elemento.serie).toBe(data.serie);
    expect(elemento.id).toBeDefined();
  });
});
```

### Tests de Validaciones
```tsx
describe('Elemento Validations', () => {
  test('should validate required fields', () => {
    const result = elementoCreateSchema.safeParse({});
    
    expect(result.success).toBe(false);
    expect(result.error?.errors).toHaveLength(8); // Todos los campos requeridos
  });
});
```

## 🚀 Módulos Futuros

### Planificados para Implementar

1. **audit-logs**: Logs de auditoría
2. **notifications**: Sistema de notificaciones
3. **permissions**: Gestión de permisos
4. **settings**: Configuraciones del sistema
5. **backups**: Sistema de respaldos

### Consideraciones
- ✅ Mantener módulos pequeños y cohesivos
- ✅ Documentar APIs de cada módulo
- ✅ Incluir tests unitarios
- ✅ Seguir convenciones establecidas
- ✅ Optimizar consultas de base de datos

---

**Última actualización**: $(date)
**Módulos implementados**: 10
**Módulos planificados**: 5+
**Mantenido por**: Equipo CDS
