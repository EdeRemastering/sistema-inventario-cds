import { describe, it, expect, beforeEach, vi } from 'vitest'
import { prisma } from '../../lib/prisma'
import { actionListElementos, actionGetLowStockElementos } from '../../modules/elementos/actions'
import { actionCreateMovimiento } from '../../modules/movimientos/actions'
import { actionGetInventarioReporteData } from '../../modules/reportes/actions'
// Tipos importados para referencias futuras
// import type { Elemento } from '../../modules/elementos/types'
// import type { Movimiento } from '../../modules/movimientos/types'

describe('Actions Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Elementos y Movimientos Integration', () => {
    it('debería crear un movimiento y actualizar stock disponible', async () => {
      // Arrange
      const mockElemento = {
        id: 1,
        serie: 'TEST-001',
        marca: 'Test Brand',
        modelo: 'Test Model',
        cantidad: 10,
        ubicacion: 'Test Location',
        estado_funcional: 'B' as any,
        estado_fisico: 'B' as any,
        categoria_id: 1,
        subcategoria_id: 1,
        codigo_equipo: null,
        observaciones: null,
        fecha_entrada: new Date('2024-01-01'),
        creado_en: new Date('2024-01-01'),
        actualizado_en: new Date('2024-01-01'),
        categoria: {
          id: 1,
          nombre: 'Test Category',
          descripcion: 'Test Description',
          estado: 'ACTIVO',
          created_at: new Date('2024-01-01'),
          updated_at: new Date('2024-01-01'),
        },
        subcategoria: {
          id: 1,
          nombre: 'Test Subcategory',
          descripcion: 'Test Sub Description',
          categoria_id: 1,
          estado: 'ACTIVO',
          created_at: new Date('2024-01-01'),
          updated_at: new Date('2024-01-01'),
        }
      }

      const mockMovimiento = {
        id: 1,
        elemento_id: 1,
        cantidad: 3,
        orden_numero: 'ORD-001',
        fecha_movimiento: new Date('2024-01-01'),
        dependencia_entrega: 'Dependencia A',
        firma_funcionario_entrega: null,
        cargo_funcionario_entrega: 'Jefe',
        dependencia_recibe: 'Dependencia B',
        firma_funcionario_recibe: null,
        cargo_funcionario_recibe: 'Responsable',
        motivo: 'Préstamo temporal',
        fecha_estimada_devolucion: new Date('2024-01-15'),
        fecha_real_devolucion: null,
        tipo: 'SALIDA' as any,
        numero_ticket: 'TICK-001',
        observaciones_entrega: 'Elemento en buen estado',
        observaciones_devolucion: null,
        firma_recepcion: null,
        firma_entrega: null,
        firma_recibe: null,
        codigo_equipo: null,
        serial_equipo: null,
        hora_entrega: null,
        hora_devolucion: null,
        firma_devuelve: null,
        firma_recibe_devolucion: null,
        devuelto_por: null,
        recibido_por: null,
        creado_en: new Date('2024-01-01')
      }

      // Mock para listElementos
      vi.mocked(prisma.elementos.findMany).mockResolvedValue([mockElemento])
      
      // Mock para createMovimiento
      vi.mocked(prisma.movimientos.create).mockResolvedValue(mockMovimiento)
      
      // Mock para updateMovimiento
      vi.mocked(prisma.movimientos.update).mockResolvedValue(mockMovimiento)
      
      // Mock para aggregate (cálculo de stock)
      vi.mocked(prisma.movimientos.aggregate).mockResolvedValue({
        _sum: { cantidad: 3 },
        _count: { _all: 0 },
        _avg: { cantidad: null },
        _min: { cantidad: null },
        _max: { cantidad: null }
      } as any)

      // Act - Crear movimiento
      const formData = new FormData()
      formData.append('elemento_id', '1')
      formData.append('cantidad', '3')
      formData.append('fecha_movimiento', '2024-01-01')
      formData.append('tipo', 'SALIDA')
      formData.append('numero_ticket', 'TICK-001')
      formData.append('dependencia_entrega', 'Dependencia A')
      formData.append('dependencia_recibe', 'Dependencia B')
      formData.append('motivo', 'Préstamo temporal')
      formData.append('fecha_estimada_devolucion', '2024-01-15')

      await actionCreateMovimiento(formData)

      // Act - Verificar stock disponible
      const lowStockElements = await actionGetLowStockElementos()

      // Assert
      expect(prisma.movimientos.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          elemento_id: 1,
          cantidad: 3,
          tipo: 'SALIDA'
        })
      })

      // El elemento tiene 10 unidades totales, se prestaron 3, quedan 7 disponibles
      expect(lowStockElements).toHaveLength(0) // No está en stock bajo (>3)
      
      // Verificar que se llamó a aggregate para calcular stock
      expect(prisma.movimientos.aggregate).toHaveBeenCalled()
    })

    it('debería detectar elementos con stock bajo después de movimientos', async () => {
      // Arrange
      const mockElemento = {
        id: 1,
        serie: 'TEST-002',
        marca: 'Test Brand',
        modelo: 'Test Model',
        cantidad: 5, // Stock total bajo
        ubicacion: 'Test Location',
        estado_funcional: 'B' as any,
        estado_fisico: 'B' as any,
        categoria_id: 1,
        subcategoria_id: 1,
        codigo_equipo: null,
        observaciones: null,
        fecha_entrada: new Date('2024-01-01'),
        creado_en: new Date('2024-01-01'),
        actualizado_en: new Date('2024-01-01'),
        categoria: {
          id: 1,
          nombre: 'Test Category',
          descripcion: 'Test Description',
          estado: 'ACTIVO',
          created_at: new Date('2024-01-01'),
          updated_at: new Date('2024-01-01'),
        },
        subcategoria: {
          id: 1,
          nombre: 'Test Subcategory',
          descripcion: 'Test Sub Description',
          categoria_id: 1,
          estado: 'ACTIVO',
          created_at: new Date('2024-01-01'),
          updated_at: new Date('2024-01-01'),
        }
      }

      // Mock para listElementos - filtrar elementos con cantidad < 3
      vi.mocked(prisma.elementos.findMany).mockResolvedValue([mockElemento])
      
      // Mock para aggregate - 4 unidades prestadas
      vi.mocked(prisma.movimientos.aggregate).mockResolvedValue({
        _sum: { cantidad: 4 },
        _count: { _all: 0 },
        _avg: { cantidad: null },
        _min: { cantidad: null },
        _max: { cantidad: null }
      } as any)

      // Act
      const lowStockElements = await actionGetLowStockElementos()

      // Assert
      expect(lowStockElements).toHaveLength(1)
      expect(lowStockElements[0].availableStock).toBe(1) // 5 - 4 = 1
      expect(lowStockElements[0].totalPrestado).toBe(4)
      expect(lowStockElements[0].serie).toBe('TEST-002')
    })
  })

  describe('Reportes Integration', () => {
    it('debería generar reporte de inventario con datos completos', async () => {
      // Arrange
      const mockElementos = [
        {
          id: 1,
          serie: 'TEST-001',
          marca: 'Test Brand',
          modelo: 'Test Model',
          cantidad: 10,
          ubicacion: 'Test Location',
          estado_funcional: 'B',
          estado_fisico: 'B',
          categoria_id: 1,
          subcategoria_id: 1,
          codigo_equipo: 'CODE-001',
          observaciones: null,
          fecha_entrada: new Date('2024-01-01'),
          creado_en: new Date('2024-01-01'),
          actualizado_en: new Date('2024-01-01'),
          categoria: { nombre: 'Computadoras' },
          subcategoria: { nombre: 'Laptops' }
        },
        {
          id: 2,
          serie: 'TEST-002',
          marca: 'Test Brand 2',
          modelo: 'Test Model 2',
          cantidad: 5,
          ubicacion: 'Test Location 2',
          estado_funcional: 'R' as any,
          estado_fisico: 'B',
          categoria_id: 2,
          subcategoria_id: null,
          codigo_equipo: 'CODE-002',
          observaciones: null,
          fecha_entrada: new Date('2024-01-01'),
          creado_en: new Date('2024-01-01'),
          actualizado_en: new Date('2024-01-01'),
          categoria: { nombre: 'Equipos' },
          subcategoria: null
        }
      ]

      vi.mocked(prisma.elementos.findMany).mockResolvedValue(mockElementos as any)

      // Act
      const reporteData = await actionGetInventarioReporteData()

      // Assert
      expect(reporteData.elementos).toHaveLength(2)
      expect(reporteData.elementos[0]).toEqual({
        id: 1,
        serie: 'TEST-001',
        marca: 'Test Brand',
        modelo: 'Test Model',
        cantidad: 10,
        ubicacion: 'Test Location',
        estado_funcional: 'B' as any,
        estado_fisico: 'B' as any,
        categoria: { nombre: 'Computadoras' },
        subcategoria: { nombre: 'Laptops' }
      })
      expect(reporteData.elementos[1]).toEqual({
        id: 2,
        serie: 'TEST-002',
        marca: 'Test Brand 2',
        modelo: 'Test Model 2',
        cantidad: 5,
        ubicacion: 'Test Location 2',
        estado_funcional: 'R' as any,
        estado_fisico: 'B',
        categoria: { nombre: 'Equipos' },
        subcategoria: null
      })

      expect(prisma.elementos.findMany).toHaveBeenCalledWith({
        include: {
          categoria: { select: { nombre: true } },
          subcategoria: { select: { nombre: true } }
        },
        orderBy: { id: 'asc' }
      })
    })
  })

  describe('Error Handling Integration', () => {
    it('debería manejar errores de base de datos en cascada', async () => {
      // Arrange
      const dbError = new Error('Database connection failed')
      vi.mocked(prisma.elementos.findMany).mockRejectedValue(dbError)

      // Act & Assert
      await expect(actionListElementos()).rejects.toThrow('Database connection failed')
    })

    it('debería manejar datos faltantes correctamente', async () => {
      // Arrange
      vi.mocked(prisma.elementos.findMany).mockResolvedValue([])
      vi.mocked(prisma.movimientos.aggregate).mockResolvedValue({
        _sum: { cantidad: null },
        _count: { _all: 0 },
        _avg: { cantidad: null },
        _min: { cantidad: null },
        _max: { cantidad: null }
      } as any)

      // Act
      const lowStockElements = await actionGetLowStockElementos()

      // Assert
      expect(lowStockElements).toHaveLength(0)
    })
  })
})
