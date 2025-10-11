# Componentes del Sistema

## 📦 Estructura de Componentes

Los componentes están organizados por funcionalidad y siguen el patrón de diseño de shadcn/ui con personalizaciones específicas para el sistema CDS.

## 🎨 Componentes Base (UI)

### Componentes shadcn/ui Personalizados
Ubicación: `src/components/ui/`

#### **generic-date-picker.tsx**
Selector de fecha y hora genérico reutilizable.

```tsx
// Uso básico
<GenericDatePicker
  label="Fecha de Movimiento"
  value={fecha}
  onChange={setFecha}
  required
/>

// Con hora
<GenericDateTimePicker
  label="Fecha y Hora"
  value={fecha}
  onChange={setFecha}
  timeValue={hora}
  onTimeChange={setHora}
/>
```

**Props:**
- `label`: Etiqueta del campo
- `value`: Fecha seleccionada
- `onChange`: Callback al cambiar fecha
- `timeValue`: Hora seleccionada (opcional)
- `onTimeChange`: Callback al cambiar hora (opcional)
- `error`: Mensaje de error
- `required`: Campo obligatorio
- `disabled`: Campo deshabilitado

#### **signature-pad.tsx**
Componente para captura de firmas digitales.

```tsx
<SignaturePadComponent
  label="Firma del Funcionario"
  onSignatureChange={setFirma}
  defaultValue={firmaExistente}
  required
/>
```

#### **date-time-picker.tsx**
Selector de fecha y hora (legacy, usar generic-date-picker).

## 📋 Componentes de Formularios

### Upsert Dialogs
Componentes para crear y editar entidades.

#### **ticket-upsert-dialog.tsx**
Formulario para crear/editar tickets de préstamo.

**Características:**
- ✅ Validación con Zod
- ✅ Selectores de fecha y hora
- ✅ Firmas digitales
- ✅ Campos condicionales
- ✅ Generación automática de números de ticket

**Uso:**
```tsx
<TicketUpsertDialog
  serverAction={actionCreateTicket}
  create={true}
  defaultValues={ticketData}
  trigger={<Button>Crear Ticket</Button>}
/>
```

#### **movimiento-upsert-dialog.tsx**
Formulario para crear/editar movimientos de inventario.

**Características:**
- ✅ Validación de stock disponible
- ✅ Selectores de fecha y hora
- ✅ Firmas digitales
- ✅ Generación automática de tickets
- ✅ Validación de elementos

**Uso:**
```tsx
<MovimientoUpsertDialog
  serverAction={actionCreateMovimiento}
  create={true}
  elementos={elementosList}
  defaultValues={movimientoData}
/>
```

#### **elemento-upsert-dialog.tsx**
Formulario para crear/editar elementos del inventario.

**Características:**
- ✅ Categorías y subcategorías
- ✅ Validación de series únicas
- ✅ Generación de códigos QR
- ✅ Estados funcional y físico

#### **categoria-upsert-dialog.tsx**
Formulario para crear/editar categorías.

#### **subcategoria-upsert-dialog.tsx**
Formulario para crear/editar subcategorías.

#### **usuario-upsert-dialog.tsx**
Formulario para crear/editar usuarios.

#### **observacion-upsert-dialog.tsx**
Formulario para crear/editar observaciones.

## 📊 Componentes de Lista

### Listas con Funcionalidades Avanzadas

#### **tickets-list.tsx**
Lista de tickets con filtros y acciones.

**Características:**
- ✅ Filtros por estado y fecha
- ✅ Búsqueda en tiempo real
- ✅ Paginación
- ✅ Acciones por ticket (editar, eliminar, ver)

#### **movimientos-list.tsx**
Lista de movimientos con filtros avanzados.

**Características:**
- ✅ Filtros por tipo, fecha, elemento
- ✅ Búsqueda por ticket o elemento
- ✅ Paginación
- ✅ Acciones de devolución

#### **elementos-list.tsx**
Lista de elementos del inventario.

**Características:**
- ✅ Filtros por categoría, estado
- ✅ Búsqueda por serie, marca, modelo
- ✅ Vista de códigos QR
- ✅ Control de stock

#### **categorias-list.tsx**
Lista de categorías con estadísticas.

#### **subcategorias-list.tsx**
Lista de subcategorías.

#### **usuarios-list.tsx**
Lista de usuarios del sistema.

#### **observaciones-list.tsx**
Lista de observaciones con filtros.

## 🏠 Componentes de Dashboard

### **dashboard-stats.tsx**
Estadísticas generales del sistema.

**Métricas mostradas:**
- Total de elementos
- Total de movimientos
- Préstamos activos
- Categorías disponibles

### **advanced-charts.tsx**
Gráficos avanzados para el dashboard.

### **low-stock-alerts.tsx**
Alertas de stock bajo.

### **recent-activity.tsx**
Actividad reciente del sistema.

## 📄 Componentes de Reportes

### **reporte-generator.tsx**
Generador de reportes con selector de tipo.

**Características:**
- ✅ 6 tipos de reportes
- ✅ Filtros de fecha
- ✅ Exportación PDF y Excel
- ✅ Validación de parámetros

### **reportes-list.tsx**
Lista del historial de reportes generados.

### **reporte-stats.tsx**
Estadísticas de reportes.

### **reporte-form.tsx**
Formulario para crear reportes manuales.

## 🎭 Componentes de Layout

### **sidebar.tsx**
Barra lateral de navegación.

**Características:**
- ✅ Navegación responsive
- ✅ Iconos de Lucide
- ✅ Indicadores de estado
- ✅ Colapso en móvil

### **sidebar-header.tsx**
Encabezado de la barra lateral.

### **error-boundary.tsx**
Manejo de errores de componentes.

## 🔧 Componentes Utilitarios

### **delete-button.tsx**
Botón de eliminación con confirmación.

### **status-change-button.tsx**
Botón para cambiar estado de elementos.

### **devolucion-dialog.tsx**
Dialog para procesar devoluciones.

## 📱 Skeletons

Componentes de carga para mejorar UX.

### **index.ts**
Exportaciones centralizadas de skeletons.

### **dashboard.tsx**
Skeleton para el dashboard.

### **elementos.tsx**
Skeleton para lista de elementos.

### **movimientos.tsx**
Skeleton para lista de movimientos.

### **tickets.tsx**
Skeleton para lista de tickets.

## 🎯 Patrones de Diseño

### Convenciones de Naming
- **Upsert Dialogs**: `[entidad]-upsert-dialog.tsx`
- **Listas**: `[entidad]-list.tsx`
- **Formularios**: `[entidad]-form.tsx`
- **Acciones**: `[entidad]-actions.tsx`

### Props Comunes
```tsx
interface BaseUpsertProps {
  serverAction: (formData: FormData) => Promise<void>;
  create?: boolean;
  defaultValues?: Partial<EntityData>;
  trigger?: React.ReactNode;
}

interface BaseListProps {
  items: Entity[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  loading?: boolean;
}
```

### Manejo de Estados
```tsx
// Estados comunes en componentes
const [open, setOpen] = useState(false);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
```

### Validación
```tsx
// Esquemas Zod comunes
const baseEntitySchema = z.object({
  id: z.number().optional(),
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
});
```

## 🔄 Reutilización

### Componentes Reutilizables
- **GenericDatePicker**: Para todos los selectores de fecha
- **SignaturePadComponent**: Para todas las firmas
- **DeleteButton**: Para todas las eliminaciones
- **ErrorBoundary**: Para manejo de errores

### Hooks Personalizados
- **useSearch**: Para búsquedas en listas
- **useMobile**: Para detección de dispositivos móviles

## 📝 Mejores Prácticas

### 1. **Composición sobre Herencia**
```tsx
// ✅ Bueno
<GenericDatePicker {...props} />

// ❌ Evitar
<CustomDatePicker extends GenericDatePicker />
```

### 2. **Props Tipadas**
```tsx
// ✅ Siempre tipar props
interface Props {
  title: string;
  onSave: (data: FormData) => void;
}

// ❌ Evitar any
interface Props {
  title: any;
  onSave: any;
}
```

### 3. **Manejo de Errores**
```tsx
// ✅ Usar ErrorBoundary
<ErrorBoundary fallback={<ErrorFallback />}>
  <Component />
</ErrorBoundary>

// ✅ Mostrar errores al usuario
{error && <p className="text-red-500">{error}</p>}
```

### 4. **Accesibilidad**
```tsx
// ✅ Labels asociados
<Label htmlFor="input-id">Etiqueta</Label>
<Input id="input-id" />

// ✅ Estados de carga
<Button disabled={loading}>
  {loading ? "Guardando..." : "Guardar"}
</Button>
```

---

**Última actualización**: $(date)
**Total de componentes**: 50+
**Mantenido por**: Equipo CDS
