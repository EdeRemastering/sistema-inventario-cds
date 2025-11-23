# Hooks Personalizados

## 🎣 Custom Hooks del Sistema

Los hooks personalizados encapsulan lógica reutilizable y permiten compartir estado y efectos entre componentes de manera limpia y eficiente.

## 📱 Hooks de UI/UX

### **use-mobile.ts**
Hook para detectar dispositivos móviles y adaptar la UI.

```tsx
// Ubicación: src/hooks/use-mobile.ts

export function useMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
}
```

**Uso:**
```tsx
function ResponsiveComponent() {
  const isMobile = useMobile();
  
  return (
    <div className={isMobile ? 'flex-col' : 'flex-row'}>
      {/* Contenido adaptativo */}
    </div>
  );
}
```

**Características:**
- ✅ Detección automática de breakpoint (768px)
- ✅ Listener de resize
- ✅ Cleanup automático
- ✅ SSR compatible

### **use-search.ts**
Hook para manejar búsquedas en tiempo real.

```tsx
// Ubicación: src/hooks/use-search.ts

interface UseSearchOptions<T> {
  data: T[];
  searchFields: (keyof T)[];
  debounceMs?: number;
}

export function useSearch<T>({
  data,
  searchFields,
  debounceMs = 300
}: UseSearchOptions<T>) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce del query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  // Filtrar datos
  const filteredData = useMemo(() => {
    if (!debouncedQuery) return data;

    return data.filter(item =>
      searchFields.some(field => {
        const value = item[field];
        return String(value).toLowerCase().includes(debouncedQuery.toLowerCase());
      })
    );
  }, [data, debouncedQuery, searchFields]);

  return {
    query,
    setQuery,
    filteredData,
    isSearching: query !== debouncedQuery
  };
}
```

**Uso:**
```tsx
function ElementosList({ elementos }) {
  const { query, setQuery, filteredData, isSearching } = useSearch({
    data: elementos,
    searchFields: ['serie', 'marca', 'modelo'],
    debounceMs: 500
  });

  return (
    <div>
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar elementos..."
      />
      {isSearching && <Spinner />}
      {filteredData.map(elemento => (
        <ElementoCard key={elemento.id} elemento={elemento} />
      ))}
    </div>
  );
}
```

**Características:**
- ✅ Debounce configurable
- ✅ Búsqueda en múltiples campos
- ✅ Indicador de búsqueda
- ✅ Tipado genérico

## 🔄 Hooks de Estado

### **use-toggle.ts** (Futuro)
Hook para manejar estados booleanos.

```tsx
export function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue);
  
  const toggle = useCallback(() => setValue(prev => !prev), []);
  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);
  
  return [value, { toggle, setTrue, setFalse }] as const;
}
```

### **use-counter.ts** (Futuro)
Hook para manejar contadores.

```tsx
export function useCounter(initialValue = 0) {
  const [count, setCount] = useState(initialValue);
  
  const increment = useCallback(() => setCount(prev => prev + 1), []);
  const decrement = useCallback(() => setCount(prev => prev - 1), []);
  const reset = useCallback(() => setCount(initialValue), [initialValue]);
  
  return [count, { increment, decrement, reset, setCount }] as const;
}
```

## 🌐 Hooks de API

### **use-api.ts** (Futuro)
Hook para manejar llamadas a API.

```tsx
interface UseApiOptions {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
}

export function useApi<T>(options: UseApiOptions) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(options.url, {
        method: options.method || 'GET',
        headers: options.headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [options]);

  return { data, loading, error, execute };
}
```

## 📊 Hooks de Datos

### **use-local-storage.ts** (Futuro)
Hook para manejar localStorage.

```tsx
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
}
```

### **use-debounce.ts** (Futuro)
Hook para debounce de valores.

```tsx
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

## 🎯 Hooks de Validación

### **use-form-validation.ts** (Futuro)
Hook para validación de formularios.

```tsx
export function useFormValidation<T>(
  schema: z.ZodSchema<T>,
  initialValues: Partial<T>
) {
  const [values, setValues] = useState<Partial<T>>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validate = useCallback((field?: keyof T) => {
    try {
      const result = schema.parse(values);
      setErrors({});
      return { isValid: true, data: result };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (field === undefined || err.path.includes(field)) {
            fieldErrors[err.path.join('.')] = err.message;
          }
        });
        setErrors(fieldErrors);
        return { isValid: false, errors: fieldErrors };
      }
      return { isValid: false, errors: {} };
    }
  }, [schema, values]);

  const setValue = useCallback((field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
    setTouched(prev => ({ ...prev, [field]: true }));
  }, []);

  return {
    values,
    errors,
    touched,
    setValue,
    validate,
    isValid: Object.keys(errors).length === 0
  };
}
```

## 🔧 Patrones de Implementación

### Estructura Base de Hook

```tsx
// 1. Importar dependencias
import { useState, useEffect, useCallback } from 'react';

// 2. Definir tipos
interface HookOptions {
  // Opciones del hook
}

interface HookReturn {
  // Valores retornados
}

// 3. Implementar hook
export function useCustomHook(options: HookOptions): HookReturn {
  // Estado interno
  const [state, setState] = useState(initialValue);

  // Efectos
  useEffect(() => {
    // Lógica del efecto
    return () => {
      // Cleanup
    };
  }, [dependencies]);

  // Callbacks memoizados
  const callback = useCallback(() => {
    // Lógica del callback
  }, [dependencies]);

  // Retornar valores
  return {
    state,
    callback
  };
}
```

### Hook con Cleanup

```tsx
export function useEventListener(
  event: string,
  handler: (event: Event) => void,
  element: Element | Window = window
) {
  useEffect(() => {
    element.addEventListener(event, handler);
    
    return () => {
      element.removeEventListener(event, handler);
    };
  }, [event, handler, element]);
}
```

### Hook con Dependencias Condicionales

```tsx
export function useConditionalEffect(
  effect: () => void | (() => void),
  deps: React.DependencyList,
  condition: boolean
) {
  useEffect(() => {
    if (condition) {
      return effect();
    }
  }, [condition, ...deps]);
}
```

## 🧪 Testing de Hooks

### Setup de Tests
```tsx
import { renderHook, act } from '@testing-library/react';

test('should toggle value', () => {
  const { result } = renderHook(() => useToggle());
  
  expect(result.current[0]).toBe(false);
  
  act(() => {
    result.current[1].toggle();
  });
  
  expect(result.current[0]).toBe(true);
});
```

### Tests con Wrapper
```tsx
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>{children}</ThemeProvider>
);

test('should use theme context', () => {
  const { result } = renderHook(() => useTheme(), { wrapper });
  
  expect(result.current.theme).toBeDefined();
});
```

## 📊 Performance

### Optimizaciones
```tsx
// ✅ Memoizar callbacks
const memoizedCallback = useCallback(() => {
  // Lógica
}, [dependency]);

// ✅ Evitar re-creación de objetos
const stableValue = useMemo(() => ({
  prop1: value1,
  prop2: value2
}), [value1, value2]);

// ✅ Cleanup de efectos
useEffect(() => {
  const subscription = subscribe();
  return () => subscription.unsubscribe();
}, []);
```

### Evitar Problemas Comunes
```tsx
// ❌ Dependencias faltantes
useEffect(() => {
  fetchData(userId); // userId no está en deps
}, []);

// ✅ Dependencias correctas
useEffect(() => {
  fetchData(userId);
}, [userId]);

// ❌ Re-creación en cada render
const handler = () => { /* lógica */ };

// ✅ Callback memoizado
const handler = useCallback(() => {
  /* lógica */
}, [dependencies]);
```

## 🚀 Hooks Futuros

### Planificados para Implementar

1. **use-infinite-scroll**: Scroll infinito
2. **use-keyboard**: Atajos de teclado
3. **use-clipboard**: Copiar al portapapeles
4. **use-geolocation**: Ubicación del usuario
5. **use-intersection-observer**: Observador de intersección
6. **use-previous**: Valor anterior
7. **use-timeout**: Timeout configurable
8. **use-interval**: Interval configurable

### Consideraciones
- ✅ Evaluar necesidad real vs over-engineering
- ✅ Mantener hooks simples y específicos
- ✅ Documentar casos de uso
- ✅ Incluir tests unitarios
- ✅ Optimizar performance

---

**Última actualización**: $(date)
**Hooks implementados**: 2
**Hooks planificados**: 10+
**Mantenido por**: Equipo CDS
