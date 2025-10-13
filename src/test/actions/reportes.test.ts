import { describe, it, expect, beforeEach, vi } from 'vitest'
import { prisma } from '../../lib/prisma'
import {
  actionGetInventarioReporteData,
  actionGetMovimientosReporteData,
  actionGetPrestamosActivosReporteData,
  actionGetCategoriasReporteData,
  actionGetObservacionesReporteData,
  actionGetTicketsReporteData,
  actionGetReporteStats
} from '../../modules/reportes/actions'
// Tipos importados para referencias futuras
// import type { Elemento } from '../../modules/elementos/types'
// import type { Movimiento } from '../../modules/movimientos/types'

describe('Reportes Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('actionGetInventarioReporteData', () => {
    it('debería retornar datos del inventario', async () => {
      // Arrange
      const mockElementos = [
        {
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
          categoria: { nombre: 'Test Category' },
          subcategoria: { nombre: 'Test Subcategory' }
        }
      ]

      vi.mocked(prisma.elementos.findMany).mockResolvedValue(mockElementos as any)

      // Act
      const result = await actionGetInventarioReporteData()

      // Assert
      expect(result).toEqual({
        elementos: [
          {
            id: 1,
            serie: 'TEST-001',
            marca: 'Test Brand',
            modelo: 'Test Model',
            cantidad: 5,
            ubicacion: 'Test Location',
            estado_funcional: 'B',
            estado_fisico: 'B',
            categoria: { nombre: 'Test Category' },
            subcategoria: { nombre: 'Test Subcategory' }
          }
        ]
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

  describe('actionGetMovimientosReporteData', () => {
    it('debería retornar movimientos sin filtros de fecha', async () => {
      // Arrange
      const mockMovimientos = [
        {
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
          observaciones_entrega: null,
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
          creado_en: new Date('2024-01-01'),
          elemento: {
            serie: 'TEST-001',
            marca: 'Test Brand',
            modelo: 'Test Model'
          }
        }
      ]

      vi.mocked(prisma.movimientos.findMany).mockResolvedValue(mockMovimientos as any)

      // Act
      const result = await actionGetMovimientosReporteData()

      // Assert
      expect(result).toEqual({
        movimientos: [
          {
            id: 1,
            numero_ticket: 'TICK-001',
            fecha_movimiento: new Date('2024-01-01'),
            tipo: 'SALIDA',
            cantidad: 2,
            elemento: {
              serie: 'TEST-001',
              marca: 'Test Brand',
              modelo: 'Test Model'
            },
            dependencia_entrega: 'Dependencia A',
            funcionario_entrega: 'signature1.png',
            dependencia_recibe: 'Dependencia B',
            funcionario_recibe: 'signature2.png',
            fecha_estimada_devolucion: new Date('2024-01-15'),
            fecha_real_devolucion: null
          }
        ]
      })

      expect(prisma.movimientos.findMany).toHaveBeenCalledWith({
        where: {},
        include: {
          elemento: {
            select: {
              serie: true,
              marca: true,
              modelo: true
            }
          }
        },
        orderBy: { fecha_movimiento: 'desc' }
      })
    })

    it('debería retornar movimientos con filtros de fecha', async () => {
      // Arrange
      const fechaInicio = new Date('2024-01-01')
      const fechaFin = new Date('2024-01-31')
      const mockMovimientos: any[] = []

      vi.mocked(prisma.movimientos.findMany).mockResolvedValue(mockMovimientos)

      // Act
      const result = await actionGetMovimientosReporteData(fechaInicio, fechaFin)

      // Assert
      expect(result).toEqual({ movimientos: [] })

      expect(prisma.movimientos.findMany).toHaveBeenCalledWith({
        where: {
          fecha_movimiento: {
            gte: fechaInicio,
            lte: fechaFin
          }
        },
        include: {
          elemento: {
            select: {
              serie: true,
              marca: true,
              modelo: true
            }
          }
        },
        orderBy: { fecha_movimiento: 'desc' }
      })
    })
  })

  describe('actionGetPrestamosActivosReporteData', () => {
    it('debería retornar préstamos activos', async () => {
      // Arrange
      const mockPrestamos = [
        {
          id: 1,
          numero_ticket: 'TICK-001',
          fecha_movimiento: new Date('2024-01-01'),
          cantidad: 2,
          elemento: {
            serie: 'TEST-001',
            marca: 'Test Brand',
            modelo: 'Test Model'
          },
          dependencia_recibe: 'Dependencia B',
          firma_funcionario_recibe: 'signature2.png',
          fecha_estimada_devolucion: new Date('2024-01-15')
        }
      ]

      vi.mocked(prisma.movimientos.findMany).mockResolvedValue(mockPrestamos as any)

      // Act
      const result = await actionGetPrestamosActivosReporteData()

      // Assert
      expect(result).toEqual({
        prestamos: [
          {
            id: 1,
            numero_ticket: 'TICK-001',
            fecha_movimiento: new Date('2024-01-01'),
            cantidad: 2,
            elemento: {
              serie: 'TEST-001',
              marca: 'Test Brand',
              modelo: 'Test Model'
            },
            dependencia_recibe: 'Dependencia B',
            funcionario_recibe: 'signature2.png',
            fecha_estimada_devolucion: new Date('2024-01-15')
          }
        ]
      })

      expect(prisma.movimientos.findMany).toHaveBeenCalledWith({
        where: {
          tipo: 'SALIDA',
          fecha_real_devolucion: null
        },
        include: {
          elemento: {
            select: {
              serie: true,
              marca: true,
              modelo: true
            }
          }
        },
        orderBy: { fecha_movimiento: 'desc' }
      })
    })
  })

  describe('actionGetCategoriasReporteData', () => {
    it('debería retornar datos de categorías con estadísticas', async () => {
      // Arrange
      const mockCategorias = [
        {
          id: 1,
          nombre: 'Test Category',
          descripcion: 'Test Description',
          estado: 'ACTIVO',
          created_at: new Date('2024-01-01'),
          updated_at: new Date('2024-01-01'),
          _count: {
            elementos: 5,
            subcategorias: 2
          }
        }
      ]

      vi.mocked(prisma.categorias.findMany).mockResolvedValue(mockCategorias as any)

      // Act
      const result = await actionGetCategoriasReporteData()

      // Assert
      expect(result).toEqual([
        {
          id: 1,
          nombre: 'Test Category',
          descripcion: 'Test Description',
          estado: 'ACTIVO',
          total_elementos: 5,
          total_subcategorias: 2,
          creado_en: new Date('2024-01-01')
        }
      ])

      expect(prisma.categorias.findMany).toHaveBeenCalledWith({
        include: {
          _count: {
            select: {
              elementos: true,
              subcategorias: true
            }
          }
        },
        orderBy: { nombre: 'asc' }
      })
    })
  })

  describe('actionGetObservacionesReporteData', () => {
    it('debería retornar observaciones con filtros de fecha', async () => {
      // Arrange
      const fechaInicio = new Date('2024-01-01')
      const fechaFin = new Date('2024-01-31')
      const mockObservaciones = [
        {
          id: 1,
          elemento_id: 1,
          fecha_observacion: new Date('2024-01-15'),
          descripcion: 'Elemento dañado',
          creado_en: new Date('2024-01-15'),
          elemento: {
            serie: 'TEST-001',
            marca: 'Test Brand',
            modelo: 'Test Model',
            categoria: { nombre: 'Test Category' }
          }
        }
      ]

      vi.mocked(prisma.observaciones.findMany).mockResolvedValue(mockObservaciones as any)

      // Act
      const result = await actionGetObservacionesReporteData(fechaInicio, fechaFin)

      // Assert
      expect(result).toEqual([
        {
          id: 1,
          fecha_observacion: new Date('2024-01-15'),
          descripcion: 'Elemento dañado',
          elemento_serie: 'TEST-001',
          elemento_marca: 'Test Brand',
          elemento_modelo: 'Test Model',
          elemento_categoria: 'Test Category',
          creado_en: new Date('2024-01-15')
        }
      ])

      expect(prisma.observaciones.findMany).toHaveBeenCalledWith({
        where: {
          fecha_observacion: {
            gte: fechaInicio,
            lte: fechaFin
          }
        },
        include: {
          elemento: {
            select: {
              serie: true,
              marca: true,
              modelo: true,
              categoria: { select: { nombre: true } }
            }
          }
        },
        orderBy: { fecha_observacion: 'desc' }
      })
    })
  })

  describe('actionGetTicketsReporteData', () => {
    it('debería retornar tickets guardados', async () => {
      // Arrange
      const mockTickets = [
        {
          id: 1,
          numero_ticket: 'TICK-001',
          fecha_salida: new Date('2024-01-01'),
          fecha_estimada_devolucion: new Date('2024-01-15'),
          elemento: 'Test Element',
          serie: 'TEST-001',
          marca_modelo: 'Test Brand Model',
          cantidad: 2,
          dependencia_entrega: 'Dependencia A',
          dependencia_recibe: 'Dependencia B',
          motivo: 'Préstamo',
          orden_numero: 'ORD-001',
          fecha_guardado: new Date('2024-01-01'),
          usuario_guardado: 'admin',
          firma_funcionario_entrega: null,
          firma_funcionario_recibe: null
        }
      ]

      vi.mocked(prisma.tickets_guardados.findMany).mockResolvedValue(mockTickets as any)

      // Act
      const result = await actionGetTicketsReporteData()

      // Assert
      expect(result).toEqual([
        {
          id: 1,
          numero_ticket: 'TICK-001',
          fecha_salida: new Date('2024-01-01'),
          fecha_estimada_devolucion: new Date('2024-01-15'),
          elemento: 'Test Element',
          serie: 'TEST-001',
          marca_modelo: 'Test Brand Model',
          cantidad: 2,
          dependencia_entrega: 'Dependencia A',
          dependencia_recibe: 'Dependencia B',
          motivo: 'Préstamo',
          orden_numero: 'ORD-001',
          fecha_guardado: new Date('2024-01-01'),
          usuario_guardado: 'admin'
        }
      ])

      expect(prisma.tickets_guardados.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { fecha_salida: 'desc' }
      })
    })
  })

  describe('actionGetReporteStats', () => {
    it('debería retornar estadísticas generales', async () => {
      // Arrange
      const mockStats = {
        totalElementos: 100,
        totalMovimientos: 50,
        totalPrestamosActivos: 10,
        totalCategorias: 5,
        totalObservaciones: 25,
        totalTickets: 30
      }

      vi.mocked(prisma.elementos.count).mockResolvedValue(100)
      vi.mocked(prisma.movimientos.count).mockResolvedValueOnce(50).mockResolvedValueOnce(10)
      vi.mocked(prisma.categorias.count).mockResolvedValue(5)
      vi.mocked(prisma.observaciones.count).mockResolvedValue(25)
      vi.mocked(prisma.tickets_guardados.count).mockResolvedValue(30)

      // Act
      const result = await actionGetReporteStats()

      // Assert
      expect(result).toEqual(mockStats)

      expect(prisma.elementos.count).toHaveBeenCalled()
      expect(prisma.movimientos.count).toHaveBeenCalledTimes(2)
      expect(prisma.categorias.count).toHaveBeenCalled()
      expect(prisma.observaciones.count).toHaveBeenCalled()
      expect(prisma.tickets_guardados.count).toHaveBeenCalled()
    })
  })
})
