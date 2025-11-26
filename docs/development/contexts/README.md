# Contextos del Sistema

## 🔄 Gestión de Estado Global

Los contextos de React se utilizan para compartir estado entre componentes de manera eficiente y mantener la consistencia de datos en toda la aplicación.

## 🎨 Contexto de Tema

### **theme-context.tsx**
Maneja el tema claro/oscuro de la aplicación.

```tsx
// Ubicación: src/contexts/theme-context.tsx

interface ThemeContextType {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
}
```

**Características:**
- ✅ Persistencia en localStorage
- ✅ Detección de preferencia del sistema
- ✅ Toggle entre temas
- ✅ Aplicación automática a toda la app

**Uso:**
```tsx
import { useTheme } from '@/contexts/theme-context';

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <Button onClick={toggleTheme}>
      {theme === 'light' ? '🌙' : '☀️'}
    </Button>
  );
}
```

**Provider:**
```tsx
// En el layout principal
<ThemeProvider>
  <App />
</ThemeProvider>
```

## 🔐 Contexto de Autenticación

### **auth-context.tsx** (Futuro)
Contexto para manejar el estado de autenticación.

```tsx
interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (credentials: LoginCredentials) => Promise<void>;
  signOut: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
}
```

**Funcionalidades planificadas:**
- ✅ Estado del usuario autenticado
- ✅ Permisos y roles
- ✅ Sesión persistente
- ✅ Redirect automático

## 📊 Contexto de Notificaciones

### **notification-context.tsx** (Futuro)
Contexto para manejar notificaciones globales.

```tsx
interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}
```

**Tipos de notificaciones:**
- ✅ Éxito (verde)
- ✅ Error (rojo)
- ✅ Advertencia (amarillo)
- ✅ Información (azul)

## 🏠 Contexto del Dashboard

### **dashboard-context.tsx** (Futuro)
Contexto para datos del dashboard.

```tsx
interface DashboardContextType {
  stats: DashboardStats;
  refreshStats: () => Promise<void>;
  filters: DashboardFilters;
  setFilters: (filters: Partial<DashboardFilters>) => void;
}
```

**Datos incluidos:**
- ✅ Estadísticas generales
- ✅ Gráficos de actividad
- ✅ Alertas de stock
- ✅ Filtros aplicados

## 📋 Contexto de Formularios

### **form-context.tsx** (Futuro)
Contexto para manejo avanzado de formularios.

```tsx
interface FormContextType {
  currentForm: string | null;
  formData: Record<string, any>;
  setFormData: (formId: string, data: any) => void;
  clearForm: (formId: string) => void;
  hasUnsavedChanges: boolean;
}
```

**Funcionalidades:**
- ✅ Persistencia de formularios
- ✅ Detección de cambios no guardados
- ✅ Validación global
- ✅ Auto-guardado

## 🔄 Patrones de Implementación

### Estructura Base de Contexto

```tsx
// 1. Definir tipos
interface ContextType {
  // Estado
  // Acciones
}

// 2. Crear contexto
const Context = createContext<ContextType | undefined>(undefined);

// 3. Hook personalizado
export function useContext(): ContextType {
  const context = useContext(Context);
  if (!context) {
    throw new Error('useContext must be used within Provider');
  }
  return context;
}

// 4. Provider component
export function ContextProvider({ children }: { children: React.ReactNode }) {
  // Estado y lógica
  return (
    <Context.Provider value={value}>
      {children}
    </Context.Provider>
  );
}
```

### Hook Personalizado con Validación

```tsx
export function useTheme() {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
}
```

### Provider Compuesto

```tsx
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <DashboardProvider>
            {children}
          </DashboardProvider>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
```

## 🎯 Mejores Prácticas

### 1. **Separación de Responsabilidades**
```tsx
// ✅ Un contexto por dominio
const ThemeContext = createContext<ThemeContextType>();
const AuthContext = createContext<AuthContextType>();

// ❌ Un contexto gigante
const AppContext = createContext<EverythingContextType>();
```

### 2. **Validación de Contexto**
```tsx
// ✅ Siempre validar que el hook se use dentro del provider
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
```

### 3. **Optimización con useMemo**
```tsx
// ✅ Memoizar valores del contexto
const value = useMemo(() => ({
  theme,
  setTheme,
  toggleTheme
}), [theme]);
```

### 4. **Persistencia de Estado**
```tsx
// ✅ Persistir estado importante
useEffect(() => {
  localStorage.setItem('theme', theme);
}, [theme]);

useEffect(() => {
  const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
  if (savedTheme) {
    setTheme(savedTheme);
  }
}, []);
```

### 5. **Lazy Loading de Contextos**
```tsx
// ✅ Cargar contextos pesados solo cuando se necesiten
const LazyDashboardProvider = lazy(() => import('./dashboard-context'));
```

## 🔧 Herramientas de Desarrollo

### React DevTools
- ✅ Inspeccionar contextos
- ✅ Ver cambios de estado
- ✅ Debug de providers

### Extensión de Contexto
```tsx
// Para debugging
if (process.env.NODE_ENV === 'development') {
  (window as any).__THEME_CONTEXT__ = ThemeContext;
}
```

## 📊 Performance

### Optimizaciones
```tsx
// ✅ Dividir contextos grandes
const UserContext = createContext<UserContextType>();
const UserPreferencesContext = createContext<UserPreferencesContextType>();

// ✅ Usar React.memo en componentes consumidores
const ExpensiveComponent = React.memo(() => {
  const { theme } = useTheme();
  // Renderizado costoso
});
```

### Evitar Re-renders
```tsx
// ✅ Separar estado que cambia frecuentemente
const StaticContext = createContext<StaticData>();
const DynamicContext = createContext<DynamicData>();
```

## 🧪 Testing de Contextos

### Setup de Tests
```tsx
// Mock del contexto para tests
const mockThemeContext = {
  theme: 'light',
  setTheme: jest.fn(),
  toggleTheme: jest.fn(),
};

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeContext.Provider value={mockThemeContext}>
      {component}
    </ThemeContext.Provider>
  );
};
```

### Tests de Contexto
```tsx
test('should toggle theme', () => {
  const { result } = renderHook(() => useTheme(), {
    wrapper: ThemeProvider,
  });
  
  act(() => {
    result.current.toggleTheme();
  });
  
  expect(result.current.theme).toBe('dark');
});
```

## 🚀 Contextos Futuros

### Planificados para Implementar

1. **SearchContext**: Búsqueda global
2. **FilterContext**: Filtros aplicados
3. **ModalContext**: Gestión de modales
4. **LoadingContext**: Estados de carga
5. **ErrorContext**: Manejo global de errores

### Consideraciones
- ✅ Evaluar necesidad real vs over-engineering
- ✅ Mantener contextos pequeños y específicos
- ✅ Documentar decisiones de arquitectura
- ✅ Monitorear performance

---

**Última actualización**: $(date)
**Contextos implementados**: 1
**Contextos planificados**: 5+
**Mantenido por**: Equipo CDS
