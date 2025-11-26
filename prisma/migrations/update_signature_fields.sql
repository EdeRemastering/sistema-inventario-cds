-- Migración: Actualizar campos de firma para soportar data URLs (base64)
-- Fecha: 2025-11-22
-- Descripción: Cambiar campos de firma de VARCHAR a TEXT para soportar firmas en base64

-- Actualizar tabla tickets_guardados
ALTER TABLE tickets_guardados 
  MODIFY COLUMN firma_funcionario_entrega TEXT,
  MODIFY COLUMN firma_funcionario_recibe TEXT;

-- Actualizar tabla movimientos
ALTER TABLE movimientos 
  MODIFY COLUMN firma_funcionario_entrega TEXT,
  MODIFY COLUMN firma_funcionario_recibe TEXT,
  MODIFY COLUMN firma_recepcion TEXT,
  MODIFY COLUMN firma_entrega TEXT,
  MODIFY COLUMN firma_recibe TEXT,
  MODIFY COLUMN firma_devuelve TEXT,
  MODIFY COLUMN firma_recibe_devolucion TEXT;

