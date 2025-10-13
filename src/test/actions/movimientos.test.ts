import { describe, it, expect, beforeEach, vi } from 'vitest'
import { prisma } from '../../lib/prisma'
import {
  actionCreateMovimiento,
  actionUpdateMovimiento,
  actionDeleteMovimiento,
  actionValidateStock
} from '../../modules/movimientos/actions'
import type { Movimiento } from '../../modules/movimientos/types'

// Mock data
const mockMovimiento: Movimiento = {
  id: 1,
  elemento_id: 1,
  cantidad: 2,
  orden_numero: 'ORD-001',
  fecha_movimiento: new Date('2024-01-01'),
  dependencia_entrega: 'Dependencia A',
  firma_funcionario_entrega: 'signature1.png',
  cargo_funcionario_entrega: 'Jefe',
  dependencia_recibe: 'Dependencia B',
  firma_funcionario_recibe: 'signature2.png',
  cargo_funcionario_recibe: 'Responsable',
  motivo: 'Préstamo temporal',
  fecha_estimada_devolucion: new Date('2024-01-15'),
  fecha_real_devolucion: null,
  tipo: 'SALIDA',
  numero_ticket: 'TICK-001',
  observaciones_entrega: 'Elemento en buen estado',
  observaciones_devolucion: null,
  firma_recepcion: null,
  firma_entrega: 'signature1.png',
  firma_recibe: 'signature2.png',
  codigo_equipo: null,
  serial_equipo: null,
  hora_entrega: null,
  hora_devolucion: null,
  firma_devuelve: null,
  firma_recibe_devolucion: null,
  devuelto_por: null,
  recibido_por: null,
  creado_en: new Date('2024-01-01'),
  elemento: {
    id: 1,
    serie: 'TEST-001',
    marca: 'Test Brand',
    modelo: 'Test Model',
    categoria: { nombre: 'Test Category' },
    subcategoria: { nombre: 'Test Subcategory' }
  }
}

describe('Movimientos Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('actionCreateMovimiento', () => {
    it('debería crear un nuevo movimiento con datos válidos', async () => {
      // Arrange
      const formData = new FormData()
      formData.append('elemento_id', '1')
      formData.append('cantidad', '2')
      formData.append('orden_numero', 'ORD-001')
      formData.append('fecha_movimiento', '2024-01-01')
      formData.append('dependencia_entrega', 'Dependencia A')
      formData.append('cargo_funcionario_entrega', 'Jefe')
      formData.append('dependencia_recibe', 'Dependencia B')
      formData.append('cargo_funcionario_recibe', 'Responsable')
      formData.append('motivo', 'Préstamo temporal')
      formData.append('fecha_estimada_devolucion', '2024-01-15')
      formData.append('tipo', 'SALIDA')
      formData.append('numero_ticket', 'TICK-001')
      formData.append('observaciones_entrega', 'Elemento en buen estado')

      vi.mocked(prisma.movimientos.create).mockResolvedValue(mockMovimiento)
      vi.mocked(prisma.movimientos.update).mockResolvedValue(mockMovimiento)

      // Act
      await actionCreateMovimiento(formData)

      // Assert
      expect(prisma.movimientos.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          elemento_id: 1,
          cantidad: 2,
          orden_numero: 'ORD-001',
          tipo: 'SALIDA',
          numero_ticket: 'TICK-001'
        })
      })
    })

    it('debería lanzar error con datos inválidos', async () => {
      // Arrange
      const formData = new FormData()
      // Datos incompletos - falta elemento_id, fecha_movimiento y tipo

      // Act & Assert
      await expect(actionCreateMovimiento(formData)).rejects.toThrow('Datos inválidos')
    })

    it('debería manejar firmas digitales correctamente', async () => {
      // Arrange
      const formData = new FormData()
      formData.append('elemento_id', '1')
      formData.append('cantidad', '2')
      formData.append('orden_numero', 'ORD-001')
      formData.append('fecha_movimiento', '2024-01-01')
      formData.append('dependencia_entrega', 'Dependencia A')
      formData.append('dependencia_recibe', 'Dependencia B')
      formData.append('motivo', 'Préstamo temporal')
      formData.append('fecha_estimada_devolucion', '2024-01-15')
      formData.append('tipo', 'SALIDA')
      formData.append('numero_ticket', 'TICK-001')
      formData.append('firma_entrega', 'data:image/png;base64,test-signature')
      formData.append('firma_recibe', 'data:image/png;base64,test-signature')

      vi.mocked(prisma.movimientos.create).mockResolvedValue(mockMovimiento)
      vi.mocked(prisma.movimientos.update).mockResolvedValue(mockMovimiento)

      // Act
      await actionCreateMovimiento(formData)

      // Assert
      expect(prisma.movimientos.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: expect.objectContaining({
          firma_funcionario_entrega: expect.any(String),
          firma_funcionario_recibe: expect.any(String)
        })
      })
    })
  })

  describe('actionUpdateMovimiento', () => {
    it('debería actualizar un movimiento existente', async () => {
      // Arrange
      const formData = new FormData()
      formData.append('id', '1')
      formData.append('elemento_id', '1')
      formData.append('cantidad', '3')
      formData.append('orden_numero', 'ORD-002')
      formData.append('fecha_movimiento', '2024-01-02')
      formData.append('dependencia_entrega', 'Dependencia A')
      formData.append('dependencia_recibe', 'Dependencia B')
      formData.append('motivo', 'Préstamo extendido')
      formData.append('fecha_estimada_devolucion', '2024-01-20')
      formData.append('tipo', 'SALIDA')
      formData.append('numero_ticket', 'TICK-001')

      const existingMovimiento = {
        ...mockMovimiento,
        firma_funcionario_entrega: 'old-signature1.png',
        firma_funcionario_recibe: 'old-signature2.png'
      }

      vi.mocked(prisma.movimientos.findUnique).mockResolvedValue(existingMovimiento)
      vi.mocked(prisma.movimientos.update).mockResolvedValue(mockMovimiento)

      // Act
      await actionUpdateMovimiento(formData)

      // Assert
      expect(prisma.movimientos.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: expect.objectContaining({
          cantidad: 3,
          orden_numero: 'ORD-002',
          motivo: 'Préstamo extendido'
        })
      })
    })
  })

  describe('actionDeleteMovimiento', () => {
    it('debería eliminar un movimiento y sus firmas', async () => {
      // Arrange
      const movimientoWithSignatures = {
        ...mockMovimiento,
        firma_funcionario_entrega: 'signature1.png',
        firma_funcionario_recibe: 'signature2.png'
      }

      vi.mocked(prisma.movimientos.findUnique).mockResolvedValue(movimientoWithSignatures)
      vi.mocked(prisma.movimientos.delete).mockResolvedValue(mockMovimiento)

      // Act
      await actionDeleteMovimiento(1)

      // Assert
      expect(prisma.movimientos.delete).toHaveBeenCalledWith({
        where: { id: 1 }
      })
    })

    it('debería manejar movimiento sin firmas', async () => {
      // Arrange
      const movimientoWithoutSignatures = {
        ...mockMovimiento,
        firma_funcionario_entrega: null,
        firma_funcionario_recibe: null
      }

      vi.mocked(prisma.movimientos.findUnique).mockResolvedValue(movimientoWithoutSignatures)
      vi.mocked(prisma.movimientos.delete).mockResolvedValue(mockMovimiento)

      // Act
      await actionDeleteMovimiento(1)

      // Assert
      expect(prisma.movimientos.delete).toHaveBeenCalledWith({
        where: { id: 1 }
      })
    })
  })

  describe('actionValidateStock', () => {
    it('debería validar stock disponible correctamente', async () => {
      // Arrange
      const mockValidationResult = {
        isValid: true,
        availableQuantity: 5,
        requestedQuantity: 3,
        message: 'Stock disponible'
      }

      const { validateStock } = await import('../../lib/stock-control')
      vi.mocked(validateStock).mockResolvedValue(mockValidationResult)

      // Act
      const result = await actionValidateStock(1, 3)

      // Assert
      expect(result).toEqual(mockValidationResult)
      expect(validateStock).toHaveBeenCalledWith(1, 3)
    })

    it('debería manejar errores de validación', async () => {
      // Arrange
      const { validateStock } = await import('../../lib/stock-control')
      vi.mocked(validateStock).mockRejectedValue(new Error('Error de base de datos'))

      // Act
      const result = await actionValidateStock(1, 3)

      // Assert
      expect(result).toEqual({
        isValid: false,
        availableQuantity: 0,
        requestedQuantity: 3,
        message: 'Error al validar stock'
      })
    })
  })
})
