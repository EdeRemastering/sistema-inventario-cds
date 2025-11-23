# 🔍 Configuración de ESLint

## Reglas Estrictas Configuradas

### ✅ Variables No Usadas = ERROR

```typescript
// ❌ ERROR: Variable declarada pero no usada
const nombre = "Juan";

// ✅ OK: Variable usada
const nombre = "Juan";
console.log(nombre);

// ✅ OK: Variable que empieza con _ (se permite no usar)
const _nombre = "Juan"; // No dará error aunque no se use
```

**Configuración**:
```javascript
"@typescript-eslint/no-unused-vars": [
  "error",
  {
    argsIgnorePattern: "^_",      // Permite _arg sin usar
    varsIgnorePattern: "^_",      // Permite _variable sin usar
    caughtErrorsIgnorePattern: "^_", // Permite _error sin usar
  },
]
```

### ✅ Tipo `any` = ERROR

```typescript
// ❌ ERROR: Usar any explícito
function ejemplo(data: any) {
  return data;
}

// ✅ OK: Usar tipos específicos
function ejemplo(data: string | number) {
  return data;
}

// ✅ OK: Usar unknown cuando no sabes el tipo
function ejemplo(data: unknown) {
  if (typeof data === 'string') {
    return data;
  }
}

// ✅ OK: Usar genéricos
function ejemplo<T>(data: T): T {
  return data;
}
```

### ✅ Otras Reglas Activadas

#### prefer-const = ERROR
```typescript
// ❌ ERROR: Usar let cuando puede ser const
let nombre = "Juan";
console.log(nombre);

// ✅ OK: Usar const
const nombre = "Juan";
console.log(nombre);
```

#### no-var = ERROR
```typescript
// ❌ ERROR: Usar var (obsoleto)
var nombre = "Juan";

// ✅ OK: Usar const o let
const nombre = "Juan";
let edad = 25;
```

## 🧪 Excepciones para Tests

En archivos de test, las reglas son más flexibles:

**Archivos afectados**:
- `**/*.test.ts`
- `**/*.test.tsx`
- `**/*.spec.ts`
- `**/*.spec.tsx`
- `src/test/**/*`

**Reglas modificadas**:
- `@typescript-eslint/no-explicit-any`: **OFF** (permitido)
- `@typescript-eslint/no-unused-vars`: **WARN** (solo advertencia)

```typescript
// En archivos de test, esto es VÁLIDO:
const mockData: any = { id: 1 };
const _unused = "no da error";
```

## 📁 Archivos Ignorados

ESLint NO revisará estos archivos/carpetas:

```
node_modules/**
.next/**
out/**
build/**
dist/**
next-env.d.ts
src/generated/**
**/prisma/**
**/*.generated.*
vitest.config.ts
```

## 🚀 Comandos

### Ejecutar ESLint
```bash
pnpm lint
```

### Arreglar automáticamente
```bash
pnpm lint --fix
```

### Ver solo errores
```bash
pnpm lint --quiet
```

## 🔧 Solucionar Errores Comunes

### Error: "variable is declared but never used"

**Opción 1**: Usa la variable
```typescript
const nombre = "Juan";
console.log(nombre); // ✅
```

**Opción 2**: Prefija con `_` si no la necesitas
```typescript
const _nombre = "Juan"; // ✅ No dará error
```

**Opción 3**: Elimina la variable
```typescript
// Simplemente borra la línea ✅
```

### Error: "Unexpected any. Specify a different type"

**Opción 1**: Usa un tipo específico
```typescript
function ejemplo(data: string) { } // ✅
```

**Opción 2**: Usa `unknown` y valida
```typescript
function ejemplo(data: unknown) {
  if (typeof data === 'string') {
    // Ahora data es string
  }
}
```

**Opción 3**: Usa genéricos
```typescript
function ejemplo<T>(data: T): T {
  return data;
}
```

**Opción 4**: Define un tipo o interfaz
```typescript
interface MisDatos {
  id: number;
  nombre: string;
}

function ejemplo(data: MisDatos) { } // ✅
```

## 💡 Buenas Prácticas

### ✅ Hacer

1. **Tipado explícito en funciones públicas**
   ```typescript
   export function calcular(a: number, b: number): number {
     return a + b;
   }
   ```

2. **Usar const por defecto**
   ```typescript
   const usuario = { nombre: "Juan" };
   ```

3. **Usar genéricos para flexibilidad**
   ```typescript
   function primero<T>(arr: T[]): T | undefined {
     return arr[0];
   }
   ```

4. **Prefijar con `_` variables intencionales sin usar**
   ```typescript
   function ejemplo(_id: number, nombre: string) {
     // Solo usamos nombre, _id es para documentación
     console.log(nombre);
   }
   ```

### ❌ Evitar

1. **No usar `any`**
   ```typescript
   // ❌ MAL
   function procesar(data: any) { }
   
   // ✅ BIEN
   function procesar(data: unknown) { }
   ```

2. **No declarar variables sin usar**
   ```typescript
   // ❌ MAL
   const nombre = "Juan";
   const apellido = "Pérez"; // No se usa
   console.log(nombre);
   
   // ✅ BIEN
   const nombre = "Juan";
   console.log(nombre);
   ```

3. **No usar `var`**
   ```typescript
   // ❌ MAL
   var contador = 0;
   
   // ✅ BIEN
   let contador = 0;
   ```

## 🎯 Beneficios

### 🐛 Menos Bugs
- Variables no usadas = código muerto que puede confundir
- Tipos explícitos = menos errores en runtime

### 📖 Código Más Claro
- El código es más fácil de entender
- El IDE te ayuda mejor con autocompletado

### 🚀 Mejor Performance
- Eliminar código muerto reduce el bundle size
- TypeScript optimiza mejor con tipos explícitos

### 🤝 Mejor Colaboración
- El código es más consistente
- Menos debates sobre estilo

## 📚 Referencias

- [TypeScript ESLint Rules](https://typescript-eslint.io/rules/)
- [ESLint Flat Config](https://eslint.org/docs/latest/use/configure/configuration-files-new)
- [Next.js ESLint](https://nextjs.org/docs/basic-features/eslint)

---

**Última actualización**: Noviembre 2025

