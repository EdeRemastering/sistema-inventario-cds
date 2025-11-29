import type { PrismaClient } from "@prisma/client";

// Función auxiliar para generar código de equipo
function generateCodigo(ubicacionCodigo: string, categoria: string, index: number): string {
  return `${ubicacionCodigo}-${categoria}-${String(index).padStart(3, '0')}`;
}

export async function seedElementos(prisma: PrismaClient) {
  console.log("🌱 Sembrando elementos...");
  
  const ubicaciones = await prisma.ubicaciones.findMany();
  const categorias = await prisma.categorias.findMany({ include: { subcategorias: true } });
  
  let elementosCount = 0;
  
  // Marcas comunes por categoría
  const marcas = {
    COMPUTO: ["HP", "Dell", "Lenovo", "Asus", "Acer"],
    MUEBLES: ["Rimax", "Alfa", "Corona", "Nacional"],
    REFRIGERACION: ["LG", "Samsung", "Challenger", "Haceb"],
    SEGURIDAD: ["ADT", "Honeywell", "First Alert"],
    APOYO: ["Epson", "Sony", "Samsung", "LG", "BenQ"],
  };
  
  // Para cada ubicación, crear elementos de diferentes categorías
  let ubicacionIndex = 0;
  for (const ubicacion of ubicaciones) {
    ubicacionIndex++;
    console.log(`  → Procesando ubicación ${ubicacionIndex}/${ubicaciones.length}: ${ubicacion.nombre}...`);
    
    // COMPUTO - Equipos de cómputo (más equipos en salas de sistemas)
    const categoriaComputo = categorias.find(c => c.nombre === "COMPUTO");
    if (categoriaComputo) {
      const cantidadPC = ubicacion.nombre.includes("SISTEMAS") ? 10 : 
                        ubicacion.nombre.includes("ADMIN") ? 5 : 2;
      
      // Monitores
      const subcatMonitor = categoriaComputo.subcategorias.find(s => s.nombre === "MONITOR");
      if (subcatMonitor) {
        for (let i = 1; i <= cantidadPC; i++) {
          const codigo = generateCodigo(ubicacion.codigo, "MON", i);
          
          await prisma.elementos.upsert({
            where: { codigo_equipo: codigo },
            update: {},
            create: {
              categoria_id: categoriaComputo.id,
              subcategoria_id: subcatMonitor.id,
              cantidad: 1,
              serie: `MON-${ubicacion.codigo}-${String(i).padStart(3, '0')}`,
              marca: marcas.COMPUTO[i % marcas.COMPUTO.length],
              modelo: `MON-${2020 + (i % 5)}`,
              ubicacion_id: ubicacion.id,
              estado_funcional: i % 10 === 0 ? "D" : "B",
              estado_fisico: i % 15 === 0 ? "R" : "B",
              fecha_entrada: new Date(2020 + (i % 5), (i % 12), 1),
              codigo_equipo: codigo,
              observaciones: i % 10 === 0 ? "Requiere mantenimiento" : "En buen estado",
            },
          });
          elementosCount++;
        }
      }
      
      // Torres
      const subcatTorre = categoriaComputo.subcategorias.find(s => s.nombre === "TORRE");
      if (subcatTorre) {
        for (let i = 1; i <= cantidadPC; i++) {
          const codigo = generateCodigo(ubicacion.codigo, "CPU", i);
          
          await prisma.elementos.upsert({
            where: { codigo_equipo: codigo },
            update: {},
            create: {
              categoria_id: categoriaComputo.id,
              subcategoria_id: subcatTorre.id,
              cantidad: 1,
              serie: `CPU-${ubicacion.codigo}-${String(i).padStart(3, '0')}`,
              marca: marcas.COMPUTO[i % marcas.COMPUTO.length],
              modelo: `i${3 + (i % 3)}-Gen${8 + (i % 5)}`,
              ubicacion_id: ubicacion.id,
              estado_funcional: i % 12 === 0 ? "D" : "B",
              estado_fisico: "B",
              fecha_entrada: new Date(2020 + (i % 5), (i % 12), 1),
              codigo_equipo: codigo,
              especificaciones: {
                procesador: `Intel Core i${3 + (i % 3)}`,
                ram: `${4 + (i % 3) * 4}GB`,
                almacenamiento: `${256 + (i % 3) * 256}GB SSD`,
              },
            },
          });
          elementosCount++;
        }
      }
      
      // Teclados
      const subcatTeclado = categoriaComputo.subcategorias.find(s => s.nombre === "TECLADO");
      if (subcatTeclado) {
        for (let i = 1; i <= cantidadPC; i++) {
          const codigo = generateCodigo(ubicacion.codigo, "TEC", i);
          
          await prisma.elementos.upsert({
            where: { codigo_equipo: codigo },
            update: {},
            create: {
              categoria_id: categoriaComputo.id,
              subcategoria_id: subcatTeclado.id,
              cantidad: 1,
              serie: `TECL-${ubicacion.codigo}-${String(i).padStart(3, '0')}`,
              marca: ["Logitech", "HP", "Microsoft", "Genius"][i % 4],
              modelo: `K${100 + i}`,
              ubicacion_id: ubicacion.id,
              estado_funcional: "B",
              estado_fisico: i % 8 === 0 ? "R" : "B",
              fecha_entrada: new Date(2020 + (i % 5), (i % 12), 1),
              codigo_equipo: codigo,
            },
          });
          elementosCount++;
        }
      }
      
      // Mouse
      const subcatMouse = categoriaComputo.subcategorias.find(s => s.nombre === "MOUSE");
      if (subcatMouse) {
        for (let i = 1; i <= cantidadPC; i++) {
          const codigo = generateCodigo(ubicacion.codigo, "MOU", i);
          
          await prisma.elementos.upsert({
            where: { codigo_equipo: codigo },
            update: {},
            create: {
              categoria_id: categoriaComputo.id,
              subcategoria_id: subcatMouse.id,
              cantidad: 1,
              serie: `MOU-${ubicacion.codigo}-${String(i).padStart(3, '0')}`,
              marca: ["Logitech", "HP", "Microsoft", "Genius"][i % 4],
              modelo: `M${200 + i}`,
              ubicacion_id: ubicacion.id,
              estado_funcional: i % 6 === 0 ? "D" : "B",
              estado_fisico: "B",
              fecha_entrada: new Date(2020 + (i % 5), (i % 12), 1),
              codigo_equipo: codigo,
            },
          });
          elementosCount++;
        }
      }
      
      // Reguladores
      const subcatRegulador = categoriaComputo.subcategorias.find(s => s.nombre === "REGULADOR");
      if (subcatRegulador) {
        for (let i = 1; i <= Math.ceil(cantidadPC / 2); i++) {
          const codigo = generateCodigo(ubicacion.codigo, "REG", i);
          
          await prisma.elementos.upsert({
            where: { codigo_equipo: codigo },
            update: {},
            create: {
              categoria_id: categoriaComputo.id,
              subcategoria_id: subcatRegulador.id,
              cantidad: 1,
              serie: `REG-${ubicacion.codigo}-${String(i).padStart(3, '0')}`,
              marca: ["Forza", "CDP", "APC"][i % 3],
              modelo: `${800 + i * 200}VA`,
              ubicacion_id: ubicacion.id,
              estado_funcional: "B",
              estado_fisico: "B",
              fecha_entrada: new Date(2021 + (i % 4), (i % 12), 1),
              codigo_equipo: codigo,
            },
          });
          elementosCount++;
        }
      }
    }
    
    // MUEBLES Y ENSERES
    const categoriaMuebles = categorias.find(c => c.nombre === "MUEBLES Y ENSERES");
    if (categoriaMuebles) {
      const cantidadSillas = ubicacion.nombre.includes("SISTEMAS") ? 30 : 
                            ubicacion.nombre.includes("AUDITORIO") ? 80 : 20;
      
      // Sillas
      const subcatSilla = categoriaMuebles.subcategorias.find(s => s.nombre.includes("SILLA"));
      if (subcatSilla) {
        const codigo = generateCodigo(ubicacion.codigo, "SIL", 1);
        
        await prisma.elementos.upsert({
          where: { codigo_equipo: codigo },
          update: {},
          create: {
            categoria_id: categoriaMuebles.id,
            subcategoria_id: subcatSilla.id,
            cantidad: cantidadSillas,
            serie: `SIL-${ubicacion.codigo}-001`,
            marca: marcas.MUEBLES[0],
            modelo: "Institucional",
            ubicacion_id: ubicacion.id,
            estado_funcional: "B",
            estado_fisico: "B",
            fecha_entrada: new Date(2019, 0, 1),
            codigo_equipo: codigo,
            observaciones: `Conjunto de ${cantidadSillas} sillas`,
          },
        });
        elementosCount++;
      }
      
      // Mesas
      const subcatMesa = categoriaMuebles.subcategorias.find(s => s.nombre.includes("MESA"));
      if (subcatMesa) {
        const cantidadMesas = Math.ceil(cantidadSillas / 4);
        const codigo = generateCodigo(ubicacion.codigo, "MES", 1);
        
        await prisma.elementos.upsert({
          where: { codigo_equipo: codigo },
          update: {},
          create: {
            categoria_id: categoriaMuebles.id,
            subcategoria_id: subcatMesa.id,
            cantidad: cantidadMesas,
            serie: `MES-${ubicacion.codigo}-001`,
            marca: marcas.MUEBLES[1],
            modelo: "Institucional",
            ubicacion_id: ubicacion.id,
            estado_funcional: "B",
            estado_fisico: "B",
            fecha_entrada: new Date(2019, 0, 1),
            codigo_equipo: codigo,
            observaciones: `Conjunto de ${cantidadMesas} mesas`,
          },
        });
        elementosCount++;
      }
    }
    
    // REFRIGERACIÓN
    const categoriaRefrig = categorias.find(c => c.nombre === "REFRIGERACION");
    if (categoriaRefrig) {
      // Aires acondicionados para salas grandes
      if (ubicacion.nombre.includes("SISTEMAS") || ubicacion.nombre.includes("AUDITORIO") || ubicacion.nombre.includes("BIBLIOTECA")) {
        const subcatAire = categoriaRefrig.subcategorias.find(s => s.nombre === "MINISPLIT");
        if (subcatAire) {
          const cantidadAires = ubicacion.nombre.includes("AUDITORIO") ? 3 : 2;
          for (let i = 1; i <= cantidadAires; i++) {
            const codigo = generateCodigo(ubicacion.codigo, "AC", i);
            
            await prisma.elementos.upsert({
              where: { codigo_equipo: codigo },
              update: {},
              create: {
                categoria_id: categoriaRefrig.id,
                subcategoria_id: subcatAire.id,
                cantidad: 1,
                serie: `AC-${ubicacion.codigo}-${String(i).padStart(2, '0')}`,
                marca: marcas.REFRIGERACION[i % marcas.REFRIGERACION.length],
                modelo: `${12000 + i * 6000}BTU`,
                ubicacion_id: ubicacion.id,
                estado_funcional: "B",
                estado_fisico: "B",
                fecha_entrada: new Date(2021, (i % 12), 1),
                codigo_equipo: codigo,
                especificaciones: {
                  capacidad: `${12000 + i * 6000} BTU`,
                  tipo: "Split",
                },
              },
            });
            elementosCount++;
          }
        }
      }
      
      // Ventiladores
      const subcatVentilador = categoriaRefrig.subcategorias.find(s => s.nombre.includes("VENTILADOR"));
      if (subcatVentilador) {
        const cantidadVent = ubicacion.nombre.includes("TALLER") ? 4 : 2;
        for (let i = 1; i <= cantidadVent; i++) {
          const codigo = generateCodigo(ubicacion.codigo, "VEN", i);
          
          await prisma.elementos.upsert({
            where: { codigo_equipo: codigo },
            update: {},
            create: {
              categoria_id: categoriaRefrig.id,
              subcategoria_id: subcatVentilador.id,
              cantidad: 1,
              serie: `VEN-${ubicacion.codigo}-${String(i).padStart(2, '0')}`,
              marca: ["Samurai", "Oster", "Kalley"][i % 3],
              modelo: "Industrial",
              ubicacion_id: ubicacion.id,
              estado_funcional: "B",
              estado_fisico: "B",
              fecha_entrada: new Date(2020, (i % 12), 1),
              codigo_equipo: codigo,
            },
          });
          elementosCount++;
        }
      }
    }
    
    // SEGURIDAD
    const categoriaSeguridad = categorias.find(c => c.nombre === "SEGURIDAD");
    if (categoriaSeguridad) {
      // Extintores
      const subcatExtintor = categoriaSeguridad.subcategorias.find(s => s.nombre === "EXTINTOR");
      if (subcatExtintor) {
        const codigo = generateCodigo(ubicacion.codigo, "EXT", 1);
        
        await prisma.elementos.upsert({
          where: { codigo_equipo: codigo },
          update: {},
          create: {
            categoria_id: categoriaSeguridad.id,
            subcategoria_id: subcatExtintor.id,
            cantidad: 2,
            serie: `EXT-${ubicacion.codigo}-001`,
            marca: "First Alert",
            modelo: "10lb ABC",
            ubicacion_id: ubicacion.id,
            estado_funcional: "B",
            estado_fisico: "B",
            fecha_entrada: new Date(2022, 0, 1),
            codigo_equipo: codigo,
            observaciones: "Revisión anual",
          },
        });
        elementosCount++;
      }
      
      // Botiquín
      const subcatBotiquin = categoriaSeguridad.subcategorias.find(s => s.nombre === "BOTIQUIN");
      if (subcatBotiquin) {
        const codigo = generateCodigo(ubicacion.codigo, "BOT", 1);
        
        await prisma.elementos.upsert({
          where: { codigo_equipo: codigo },
          update: {},
          create: {
            categoria_id: categoriaSeguridad.id,
            subcategoria_id: subcatBotiquin.id,
            cantidad: 1,
            serie: `BOT-${ubicacion.codigo}-001`,
            marca: "Cruz Roja",
            modelo: "Estándar",
            ubicacion_id: ubicacion.id,
            estado_funcional: "B",
            estado_fisico: "B",
            fecha_entrada: new Date(2022, 0, 1),
            codigo_equipo: codigo,
          },
        });
        elementosCount++;
      }
    }
    
    // APOYO - Equipos audiovisuales
    const categoriaApoyo = categorias.find(c => c.nombre === "APOYO");
    if (categoriaApoyo && (ubicacion.nombre.includes("AUDITORIO") || ubicacion.nombre.includes("SISTEMA") || ubicacion.nombre.includes("LAB"))) {
      // Video Beam
      const subcatVideobeam = categoriaApoyo.subcategorias.find(s => s.nombre === "VIDEOBEAMS");
      if (subcatVideobeam) {
        const codigo = generateCodigo(ubicacion.codigo, "VB", 1);
        
        await prisma.elementos.upsert({
          where: { codigo_equipo: codigo },
          update: {},
          create: {
            categoria_id: categoriaApoyo.id,
            subcategoria_id: subcatVideobeam.id,
            cantidad: 1,
            serie: `VB-${ubicacion.codigo}-001`,
            marca: ["Epson", "BenQ", "Sony"][ubicacion.id % 3],
            modelo: "HD 3000 Lúmenes",
            ubicacion_id: ubicacion.id,
            estado_funcional: "B",
            estado_fisico: "B",
            fecha_entrada: new Date(2022, 6, 1),
            codigo_equipo: codigo,
          },
        });
        elementosCount++;
      }
      
      // Tablero
      const subcatTablero = categoriaApoyo.subcategorias.find(s => s.nombre === "TABLERO");
      if (subcatTablero) {
        const codigo = generateCodigo(ubicacion.codigo, "TAB", 1);
        
        await prisma.elementos.upsert({
          where: { codigo_equipo: codigo },
          update: {},
          create: {
            categoria_id: categoriaApoyo.id,
            subcategoria_id: subcatTablero.id,
            cantidad: 1,
            serie: `TAB-${ubicacion.codigo}-001`,
            marca: "Nacional",
            modelo: "Acrílico 2x1m",
            ubicacion_id: ubicacion.id,
            estado_funcional: "B",
            estado_fisico: "B",
            fecha_entrada: new Date(2019, 0, 1),
            codigo_equipo: codigo,
          },
        });
        elementosCount++;
      }
      
      // Parlantes
      const subcatParlantes = categoriaApoyo.subcategorias.find(s => s.nombre === "PARLANTES");
      if (subcatParlantes && ubicacion.nombre.includes("AUDITORIO")) {
        const codigo = generateCodigo(ubicacion.codigo, "PAR", 1);
        
        await prisma.elementos.upsert({
          where: { codigo_equipo: codigo },
          update: {},
          create: {
            categoria_id: categoriaApoyo.id,
            subcategoria_id: subcatParlantes.id,
            cantidad: 4,
            serie: `PAR-${ubicacion.codigo}-001`,
            marca: "JBL",
            modelo: "Professional",
            ubicacion_id: ubicacion.id,
            estado_funcional: "B",
            estado_fisico: "B",
            fecha_entrada: new Date(2021, 3, 1),
            codigo_equipo: codigo,
          },
        });
        elementosCount++;
      }
      
      // Televisor
      const subcatTV = categoriaApoyo.subcategorias.find(s => s.nombre.includes("TELEVISOR"));
      if (subcatTV && !ubicacion.nombre.includes("TALLER")) {
        const codigo = generateCodigo(ubicacion.codigo, "TV", 1);
        
        await prisma.elementos.upsert({
          where: { codigo_equipo: codigo },
          update: {},
          create: {
            categoria_id: categoriaApoyo.id,
            subcategoria_id: subcatTV.id,
            cantidad: 1,
            serie: `TV-${ubicacion.codigo}-001`,
            marca: ["Samsung", "LG", "Sony"][ubicacion.id % 3],
            modelo: "Smart TV 55\"",
            ubicacion_id: ubicacion.id,
            estado_funcional: "B",
            estado_fisico: "B",
            fecha_entrada: new Date(2023, 0, 1),
            codigo_equipo: codigo,
            especificaciones: {
              tamano: "55 pulgadas",
              resolucion: "4K UHD",
              tipo: "Smart TV",
            },
          },
        });
        elementosCount++;
      }
    }
  }
  
  console.log(`✅ ${elementosCount} elementos sembrados correctamente`);
}
