# Tests del Sistema de Inventario CDS

Este directorio contiene los tests unitarios e integración para el sistema de inventario CDS, utilizando Vitest como framework de testing.

## Estructura de Tests

```
src/test/
├── setup.ts                    # Configuración global de tests
├── actions/                    # Tests de Server Actions
│   ├── elementos.test.ts       # Tests de acciones de elementos
│   ├── movimientos.test.ts     # Tests de acciones de movimientos
│   └── reportes.test.ts        # Tests de acciones de reportes
├── integration/                # Tests de integración
│   └── actions-integration.test.ts
└── README.md                   # Este archivo
```

## Comandos de Testing

### Ejecutar todos los tests
```bash
pnpm test
```

### Ejecutar tests con interfaz gráfica
```bash
pnpm test:ui
```

### Ejecutar tests una sola vez (para CI/CD)
```bash
pnpm test:run
```

### Ejecutar tests con cobertura
```bash
pnpm test:coverage
```

## Configuración

Los tests están configurados en `vitest.config.ts` con las siguientes características:

- **Environment**: jsdom (para simular DOM del navegador)
- **Setup**: Archivo de configuración global en `src/test/setup.ts`
- **Alias**: Soporte para imports con `@/` apuntando a `src/`

## Mocks

El archivo `setup.ts` incluye mocks para:

- **Next.js**: `next/navigation`, `next/cache`
- **Prisma**: Cliente de base de datos
- **Librerías**: `audit-logger`, `signature-storage`, `stock-control`

## Tests de Actions

### Elementos (`elementos.test.ts`)
- ✅ `actionListElementos` - Listar elementos
- ✅ `actionGetElemento` - Obtener elemento específico
- ✅ `actionGetLowStockElementos` - Elementos con stock bajo
- ✅ `actionCreateElemento` - Crear elemento
- ✅ `actionUpdateElemento` - Actualizar elemento
- ✅ `actionDeleteElemento` - Eliminar elemento

### Movimientos (`movimientos.test.ts`)
- ✅ `actionCreateMovimiento` - Crear movimiento
- ✅ `actionUpdateMovimiento` - Actualizar movimiento
- ✅ `actionDeleteMovimiento` - Eliminar movimiento
- ✅ `actionValidateStock` - Validar stock

### Reportes (`reportes.test.ts`)
- ✅ `actionGetInventarioReporteData` - Datos de inventario
- ✅ `actionGetMovimientosReporteData` - Datos de movimientos
- ✅ `actionGetPrestamosActivosReporteData` - Préstamos activos
- ✅ `actionGetCategoriasReporteData` - Datos de categorías
- ✅ `actionGetObservacionesReporteData` - Datos de observaciones
- ✅ `actionGetTicketsReporteData` - Datos de tickets
- ✅ `actionGetReporteStats` - Estadísticas generales

## Tests de Integración

### Actions Integration (`actions-integration.test.ts`)
- ✅ Integración entre elementos y movimientos
- ✅ Cálculo de stock disponible
- ✅ Generación de reportes
- ✅ Manejo de errores en cascada

## Mejores Prácticas

1. **Mocking**: Todos los mocks están centralizados en `setup.ts`
2. **Datos de prueba**: Se usan datos mock consistentes y realistas
3. **Assertions**: Tests verifican tanto el resultado como las llamadas a funciones
4. **Error handling**: Se prueban casos de error y edge cases
5. **Integración**: Tests verifican la interacción entre módulos

## Agregar Nuevos Tests

Para agregar nuevos tests:

1. Crear archivo `*.test.ts` en el directorio apropiado
2. Importar las funciones a testear
3. Usar mocks existentes o agregar nuevos a `setup.ts`
4. Seguir el patrón de describe/it/expect
5. Ejecutar tests para verificar que funcionan

## Cobertura de Código

Los tests cubren:
- ✅ Todas las Server Actions principales
- ✅ Validación de datos
- ✅ Manejo de errores
- ✅ Integración entre módulos
- ✅ Cálculos de negocio (stock, reportes)

## Troubleshooting

### Error: "Cannot find module"
- Verificar que los alias de path estén configurados correctamente
- Asegurar que los imports usen rutas relativas o alias `@/`

### Error: "Mock not working"
- Verificar que el mock esté definido en `setup.ts`
- Asegurar que `vi.clearAllMocks()` se llame en `beforeEach`

### Error: "Database connection"
- Los tests usan mocks de Prisma, no conexión real a BD
- Verificar que los mocks estén configurados correctamente
