import type { PrismaClient } from "@prisma/client";

/** Código de equipo único por ubicación y tipo. */
function codigo(ubicacionCodigo: string, prefijo: string, index: number): string {
  return `${ubicacionCodigo}-${prefijo}-${String(index).padStart(2, "0")}`;
}

/**
 * Seed mínimo de elementos: solo 2 ubicaciones, pocos elementos por tipo.
 * Suficiente para que la app se vea presentable sin saturar la base.
 */
export async function seedElementos(prisma: PrismaClient) {
  console.log("🌱 Sembrando elementos...");
  const ubicaciones = await prisma.ubicaciones.findMany({ take: 2 });
  const categorias = await prisma.categorias.findMany({ include: { subcategorias: true } });
  if (ubicaciones.length === 0) {
    console.log("⚠️  No hay ubicaciones para crear elementos");
    return;
  }
  const cat = (n: string) => categorias.find((c) => c.nombre === n);
  const sub = (c: { subcategorias: { id: number; nombre: string }[] } | undefined, n: string) =>
    c?.subcategorias.find((s) => s.nombre === n);
  const fechaBase = new Date(2024, 0, 1);
  let count = 0;

  // Solo primera ubicación: sala de sistemas (pocos equipos)
  const u1 = ubicaciones[0];
  const comp = cat("COMPUTO");
  const seg = cat("SEGURIDAD");
  const apoyo = cat("APOYO");
  if (comp) {
    const mon = sub(comp, "MONITOR");
    const tor = sub(comp, "TORRE");
    const tec = sub(comp, "TECLADO");
    const mou = sub(comp, "MOUSE");
    const reg = sub(comp, "REGULADOR");
    for (let i = 1; i <= 2; i++) {
      if (mon) {
        await prisma.elementos.upsert({
          where: { codigo_equipo: codigo(u1.codigo, "MON", i) },
          update: {},
          create: {
            categoria_id: comp.id,
            subcategoria_id: mon.id,
            cantidad: 1,
            serie: `MON-${u1.codigo}-${String(i).padStart(2, "0")}`,
            marca: ["HP", "Dell"][i - 1],
            modelo: `24" ${2023 + i}`,
            ubicacion_id: u1.id,
            estado_funcional: "B",
            estado_fisico: "B",
            fecha_entrada: fechaBase,
            codigo_equipo: codigo(u1.codigo, "MON", i),
          },
        });
        count++;
      }
      if (tor) {
        await prisma.elementos.upsert({
          where: { codigo_equipo: codigo(u1.codigo, "CPU", i) },
          update: {},
          create: {
            categoria_id: comp.id,
            subcategoria_id: tor.id,
            cantidad: 1,
            serie: `CPU-${u1.codigo}-${String(i).padStart(2, "0")}`,
            marca: "HP",
            modelo: "ProDesk",
            ubicacion_id: u1.id,
            estado_funcional: "B",
            estado_fisico: "B",
            fecha_entrada: fechaBase,
            codigo_equipo: codigo(u1.codigo, "CPU", i),
            especificaciones: { ram: "8GB", almacenamiento: "256GB SSD" },
          },
        });
        count++;
      }
    }
    if (tec) {
      await prisma.elementos.upsert({
        where: { codigo_equipo: codigo(u1.codigo, "TEC", 1) },
        update: {},
        create: {
          categoria_id: comp.id,
          subcategoria_id: tec.id,
          cantidad: 1,
          serie: `TECL-${u1.codigo}-01`,
          marca: "Logitech",
          modelo: "K120",
          ubicacion_id: u1.id,
          estado_funcional: "B",
          estado_fisico: "B",
          fecha_entrada: fechaBase,
          codigo_equipo: codigo(u1.codigo, "TEC", 1),
        },
      });
      count++;
    }
    if (mou) {
      await prisma.elementos.upsert({
        where: { codigo_equipo: codigo(u1.codigo, "MOU", 1) },
        update: {},
        create: {
          categoria_id: comp.id,
          subcategoria_id: mou.id,
          cantidad: 1,
          serie: `MOU-${u1.codigo}-01`,
          marca: "Logitech",
          modelo: "M185",
          ubicacion_id: u1.id,
          estado_funcional: "B",
          estado_fisico: "B",
          fecha_entrada: fechaBase,
          codigo_equipo: codigo(u1.codigo, "MOU", 1),
        },
      });
      count++;
    }
    if (reg) {
      await prisma.elementos.upsert({
        where: { codigo_equipo: codigo(u1.codigo, "REG", 1) },
        update: {},
        create: {
          categoria_id: comp.id,
          subcategoria_id: reg.id,
          cantidad: 1,
          serie: `REG-${u1.codigo}-01`,
          marca: "APC",
          modelo: "800VA",
          ubicacion_id: u1.id,
          estado_funcional: "B",
          estado_fisico: "B",
          fecha_entrada: fechaBase,
          codigo_equipo: codigo(u1.codigo, "REG", 1),
        },
      });
      count++;
    }
  }
  if (seg) {
    const ext = sub(seg, "EXTINTOR");
    if (ext) {
      await prisma.elementos.upsert({
        where: { codigo_equipo: codigo(u1.codigo, "EXT", 1) },
        update: {},
        create: {
          categoria_id: seg.id,
          subcategoria_id: ext.id,
          cantidad: 2,
          serie: `EXT-${u1.codigo}-01`,
          marca: "First Alert",
          modelo: "10lb ABC",
          ubicacion_id: u1.id,
          estado_funcional: "B",
          estado_fisico: "B",
          fecha_entrada: fechaBase,
          codigo_equipo: codigo(u1.codigo, "EXT", 1),
        },
      });
      count++;
    }
  }
  if (apoyo) {
    const vb = sub(apoyo, "VIDEOBEAMS");
    if (vb) {
      await prisma.elementos.upsert({
        where: { codigo_equipo: codigo(u1.codigo, "VB", 1) },
        update: {},
        create: {
          categoria_id: apoyo.id,
          subcategoria_id: vb.id,
          cantidad: 1,
          serie: `VB-${u1.codigo}-01`,
          marca: "Epson",
          modelo: "HD 3000 Lúmenes",
          ubicacion_id: u1.id,
          estado_funcional: "B",
          estado_fisico: "B",
          fecha_entrada: fechaBase,
          codigo_equipo: codigo(u1.codigo, "VB", 1),
        },
      });
      count++;
    }
  }

  // Segunda ubicación: muebles y refrigeración mínimos
  if (ubicaciones.length > 1) {
    const u2 = ubicaciones[1];
    const muebles = cat("MUEBLES Y ENSERES");
    const refrig = cat("REFRIGERACION");
    if (muebles) {
      const silla = sub(muebles, "SILLA PLASTICA");
      const mesas = sub(muebles, "MESAS INSTITUCIONAL");
      if (silla) {
        await prisma.elementos.upsert({
          where: { codigo_equipo: codigo(u2.codigo, "SIL", 1) },
          update: {},
          create: {
            categoria_id: muebles.id,
            subcategoria_id: silla.id,
            cantidad: 8,
            serie: `SIL-${u2.codigo}-01`,
            marca: "Rimax",
            modelo: "Institucional",
            ubicacion_id: u2.id,
            estado_funcional: "B",
            estado_fisico: "B",
            fecha_entrada: fechaBase,
            codigo_equipo: codigo(u2.codigo, "SIL", 1),
          },
        });
        count++;
      }
      if (mesas) {
        await prisma.elementos.upsert({
          where: { codigo_equipo: codigo(u2.codigo, "MES", 1) },
          update: {},
          create: {
            categoria_id: muebles.id,
            subcategoria_id: mesas.id,
            cantidad: 2,
            serie: `MES-${u2.codigo}-01`,
            marca: "Alfa",
            modelo: "Institucional",
            ubicacion_id: u2.id,
            estado_funcional: "B",
            estado_fisico: "B",
            fecha_entrada: fechaBase,
            codigo_equipo: codigo(u2.codigo, "MES", 1),
          },
        });
        count++;
      }
    }
    if (refrig) {
      const minisplit = sub(refrig, "MINISPLIT");
      if (minisplit) {
        await prisma.elementos.upsert({
          where: { codigo_equipo: codigo(u2.codigo, "AC", 1) },
          update: {},
          create: {
            categoria_id: refrig.id,
            subcategoria_id: minisplit.id,
            cantidad: 1,
            serie: `AC-${u2.codigo}-01`,
            marca: "LG",
            modelo: "12000 BTU",
            ubicacion_id: u2.id,
            estado_funcional: "B",
            estado_fisico: "B",
            fecha_entrada: fechaBase,
            codigo_equipo: codigo(u2.codigo, "AC", 1),
          },
        });
        count++;
      }
    }
  }

  console.log(`✅ ${count} elementos sembrados correctamente`);
}
