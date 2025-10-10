# Sistema de Firmas Digitales - Documentación

## Funcionalidades Implementadas

### 1. Campos de Firma Digital
- **Formularios de Movimientos**: Los campos "quien entrega" y "quien recibe" ahora son campos de firma digital
- **Formularios de Tickets**: Los campos "funcionario entrega" y "funcionario recibe" ahora son campos de firma digital
- **Componente SignaturePad**: Permite capturar firmas digitales con canvas
- **Validación de Firmas**: Verifica que las firmas no estén vacías antes de guardar

### 2. Almacenamiento de Firmas
- **Directorio**: Las firmas se guardan en `public/signatures/`
- **Formato**: Archivos PNG con nombres únicos (prefijo_id_tipo_timestamp.png)
- **URLs**: Se almacenan las rutas relativas en la base de datos
- **Gestión**: Función para eliminar firmas cuando se borran registros

### 3. Visualización de Firmas
- **Componente SignatureDisplay**: Muestra firmas guardadas con opción de ver en modal
- **Listas de Movimientos**: Muestra botones para ver firmas de entrega y recibo
- **Listas de Tickets**: Muestra botones para ver firmas de funcionarios

### 4. Factura de Tickets
- **Diseño Profesional**: Layout tipo factura con información completa del ticket
- **Exportación PDF**: Genera PDF usando jsPDF y html2canvas
- **Información Incluida**:
  - Datos del ticket (número, fechas, orden)
  - Información del elemento (serie, marca, modelo, cantidad)
  - Dependencias de entrega y recibo
  - Firmas digitales de funcionarios
  - Motivo del préstamo
  - Fecha de generación y usuario

## Archivos Modificados

### Base de Datos
- `prisma/schema.prisma`: Actualizado para usar campos de firma
- Campos cambiados:
  - `funcionario_entrega` → `firma_funcionario_entrega`
  - `funcionario_recibe` → `firma_funcionario_recibe`

### Componentes Nuevos
- `src/components/ui/signature-pad.tsx`: Componente para capturar firmas
- `src/components/ui/signature-display.tsx`: Componente para mostrar firmas
- `src/components/tickets/ticket-invoice.tsx`: Componente de factura

### Servicios
- `src/lib/signature-storage.ts`: Servicio para manejar almacenamiento de firmas

### Formularios Actualizados
- `src/components/movimientos/movimiento-upsert-dialog.tsx`
- `src/components/tickets/ticket-upsert-dialog.tsx`

### Listas Actualizadas
- `src/components/movimientos/movimientos-list.tsx`
- `src/components/tickets/tickets-list.tsx`

### Acciones Actualizadas
- `src/modules/movimientos/actions.ts`
- `src/modules/tickets_guardados/actions.ts`

## Uso

### En Formularios
1. Los usuarios pueden firmar directamente en el canvas
2. Las firmas se validan antes de enviar
3. Se guardan como imágenes y se almacenan las URLs

### En Listas
1. Se muestran botones para ver las firmas guardadas
2. Las firmas se abren en un modal para visualización
3. Se puede verificar la autenticidad de las firmas

### Generación de Facturas
1. Botón "Ver Factura" en cada ticket
2. Preview de la factura en modal
3. Exportación a PDF con un clic
4. Archivo descargado con nombre: `ticket-{numero_ticket}.pdf`

## Dependencias Agregadas
- `jspdf`: Para generación de PDFs
- `html2canvas`: Para convertir HTML a imagen para PDF

## Consideraciones Técnicas
- Las firmas se validan por tamaño mínimo (1000 caracteres base64)
- Se usan nombres únicos con timestamp para evitar conflictos
- Las URLs se almacenan como strings en la base de datos
- El sistema maneja errores de almacenamiento sin interrumpir el flujo principal
