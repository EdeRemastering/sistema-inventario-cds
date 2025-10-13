import { describe, it, expect, beforeEach, vi } from 'vitest'
import { prisma } from '../../lib/prisma'
import {
  actionListElementos,
  actionGetElemento,
  actionGetLowStockElementos,
  actionCreateElemento,
  actionUpdateElemento,
  actionDeleteElemento
} from '../../modules/elementos/actions'
import type { Elemento } from '../../modules/elementos/types'

// Mock data
const mockElemento: Elemento = {
  id: 1,
  serie: 'TEST-001',
  marca: 'Test Brand',
  modelo: 'Test Model',
  cantidad: 5,
  ubicacion: 'Test Location',
  estado_funcional: 'B',
  estado_fisico: 'B',
  categoria_id: 1,
  subcategoria_id: 1,
  codigo_equipo: 'CODE-001',
  observaciones: 'Test observations',
  fecha_entrada: new Date('2024-01-01'),
  creado_en: new Date('2024-01-01'),
  actualizado_en: new Date('2024-01-01'),
}

const mockElementos: Elemento[] = [mockElemento]

describe('Elementos Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('actionListElementos', () => {
    it('debería retornar una lista de elementos', async () => {
      // Arrange
      vi.mocked(prisma.elementos.findMany).mockResolvedValue(mockElementos)

      // Act
      const result = await actionListElementos()

      // Assert
      expect(result).toEqual(mockElementos)
      expect(prisma.elementos.findMany).toHaveBeenCalledWith({
        orderBy: { id: 'desc' }
      })
    })

    it('debería manejar errores correctamente', async () => {
      // Arrange
      const error = new Error('Database error')
      vi.mocked(prisma.elementos.findMany).mockRejectedValue(error)

      // Act & Assert
      await expect(actionListElementos()).rejects.toThrow('Database error')
    })
  })

  describe('actionGetElemento', () => {
    it('debería retornar un elemento específico', async () => {
      // Arrange
      vi.mocked(prisma.elementos.findUnique).mockResolvedValue(mockElemento)

      // Act
      const result = await actionGetElemento(1)

      // Assert
      expect(result).toEqual(mockElemento)
      expect(prisma.elementos.findUnique).toHaveBeenCalledWith({
        where: { id: 1 }
      })
    })

    it('debería retornar null si no encuentra el elemento', async () => {
      // Arrange
      vi.mocked(prisma.elementos.findUnique).mockResolvedValue(null)

      // Act
      const result = await actionGetElemento(999)

      // Assert
      expect(result).toBeNull()
    })
  })

  describe('actionGetLowStockElementos', () => {
    it('debería retornar elementos con stock bajo', async () => {
      // Arrange
      const lowStockElement = { ...mockElemento, cantidad: 2 }
      vi.mocked(prisma.elementos.findMany).mockResolvedValue([lowStockElement])
      vi.mocked(prisma.movimientos.aggregate).mockResolvedValue({
        _sum: { cantidad: 1 },
        _count: { _all: 0 },
        _avg: { cantidad: null },
        _min: { cantidad: null },
        _max: { cantidad: null }
      } as any)

      // Act
      const result = await actionGetLowStockElementos()

      // Assert
      expect(result).toHaveLength(1)
      expect(result[0].availableStock).toBe(1) // 2 - 1 = 1
      expect(result[0].totalPrestado).toBe(1)
    })

    it('debería filtrar elementos con cantidad >= 3', async () => {
      // Arrange
      const highStockElement = { ...mockElemento, cantidad: 5 }
      vi.mocked(prisma.elementos.findMany).mockResolvedValue([highStockElement])

      // Act
      const result = await actionGetLowStockElementos()

      // Assert
      expect(result).toHaveLength(0)
    })
  })

  describe('actionCreateElemento', () => {
    it('debería crear un nuevo elemento con datos válidos', async () => {
      // Arrange
      const formData = new FormData()
      formData.append('serie', 'NEW-001')
      formData.append('marca', 'New Brand')
      formData.append('modelo', 'New Model')
      formData.append('cantidad', '3')
      formData.append('ubicacion', 'New Location')
      formData.append('estado_funcional', 'B')
      formData.append('estado_fisico', 'B')
      formData.append('categoria_id', '1')
      formData.append('fecha_entrada', '2024-01-01')

      vi.mocked(prisma.elementos.create).mockResolvedValue(mockElemento)

      // Act
      await actionCreateElemento(formData)

      // Assert
      expect(prisma.elementos.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          serie: 'NEW-001',
          marca: 'New Brand',
          modelo: 'New Model',
          cantidad: 3,
          ubicacion: 'New Location',
          estado_funcional: 'B',
          estado_fisico: 'B',
          categoria_id: 1,
          fecha_entrada: expect.any(Date)
        })
      })
    })

    it('debería manejar campos vacíos como null', async () => {
      // Arrange
      const formData = new FormData()
      formData.append('serie', 'NEW-002')
      formData.append('marca', '')
      formData.append('modelo', '')
      formData.append('cantidad', '1')
      formData.append('ubicacion', '')
      formData.append('estado_funcional', 'B')
      formData.append('estado_fisico', 'B')
      formData.append('categoria_id', '1')
      formData.append('fecha_entrada', '2024-01-01')

      vi.mocked(prisma.elementos.create).mockResolvedValue(mockElemento)

      // Act
      await actionCreateElemento(formData)

      // Assert
      expect(prisma.elementos.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          marca: null,
          modelo: null,
          ubicacion: null
        })
      })
    })

    it('debería lanzar error con datos inválidos', async () => {
      // Arrange
      const formData = new FormData()
      // Datos incompletos - falta serie y categoria_id

      // Act & Assert
      await expect(actionCreateElemento(formData)).rejects.toThrow('Datos inválidos')
    })
  })

  describe('actionUpdateElemento', () => {
    it('debería actualizar un elemento existente', async () => {
      // Arrange
      const formData = new FormData()
      formData.append('id', '1')
      formData.append('serie', 'UPDATED-001')
      formData.append('marca', 'Updated Brand')
      formData.append('modelo', 'Updated Model')
      formData.append('cantidad', '5')
      formData.append('ubicacion', 'Updated Location')
      formData.append('estado_funcional', 'B')
      formData.append('estado_fisico', 'B')
      formData.append('categoria_id', '1')
      formData.append('fecha_entrada', '2024-01-01')

      vi.mocked(prisma.elementos.update).mockResolvedValue(mockElemento)

      // Act
      await actionUpdateElemento(formData)

      // Assert
      expect(prisma.elementos.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: expect.objectContaining({
          serie: 'UPDATED-001',
          marca: 'Updated Brand',
          modelo: 'Updated Model'
        })
      })
    })
  })

  describe('actionDeleteElemento', () => {
    it('debería eliminar un elemento', async () => {
      // Arrange
      vi.mocked(prisma.elementos.delete).mockResolvedValue(mockElemento)

      // Act
      await actionDeleteElemento(1)

      // Assert
      expect(prisma.elementos.delete).toHaveBeenCalledWith({
        where: { id: 1 }
      })
    })
  })
})
