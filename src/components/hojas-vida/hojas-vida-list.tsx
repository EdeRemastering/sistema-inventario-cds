"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { HojaVidaUpsertDialog } from "./hoja-vida-upsert-dialog";
import { DeleteButton } from "../delete-button";
import type { HojaVida } from "../../modules/hojas_vida/types";
import { toast } from "sonner";
import { FileText, Search, X } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

type SedeOption = {
  id: number;
  nombre: string;
  ciudad: string;
  municipio: string | null;
};
type UbicacionOption = {
  id: number;
  codigo: string;
  nombre: string;
  sede_id: number;
};
type CategoriaOption = { id: number; nombre: string };
type SubcategoriaOption = { id: number; nombre: string; categoria_id: number };
type ElementoOption = {
  id: number;
  serie: string;
  marca: string | null;
  modelo: string | null;
  categoria_id: number;
  subcategoria_id: number | null;
  ubicacion_id: number | null;
  ubicacion_rel?: {
    id: number;
    codigo: string;
    nombre: string;
    sede?: {
      id: number;
      nombre: string;
      ciudad: string;
      municipio: string | null;
    } | null;
  } | null;
};

// Función para parsear fecha del servidor de forma segura
const parseServerDate = (dateValue: Date | string | null | undefined): Date => {
  if (!dateValue) return new Date();
  const dateStr =
    typeof dateValue === "string" ? dateValue : dateValue.toISOString();
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return new Date();
  const [, year, month, day] = match;
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
};

type Props = {
  hojasVida: HojaVida[];
  elementos: ElementoOption[];
  sedes: SedeOption[];
  ubicaciones: UbicacionOption[];
  categorias: CategoriaOption[];
  subcategorias: SubcategoriaOption[];
  onCreateHojaVida: (formData: FormData) => Promise<void>;
  onUpdateHojaVida: (formData: FormData) => Promise<void>;
  onDeleteHojaVida: (id: number) => Promise<void>;
  onCrearHojasVidaFaltantes?: () => Promise<{
    creadas: number;
    errores: string[];
  }>;
};

export function HojasVidaList({
  hojasVida,
  elementos,
  sedes,
  ubicaciones,
  categorias,
  subcategorias,
  onCreateHojaVida,
  onUpdateHojaVida,
  onDeleteHojaVida,
  onCrearHojasVidaFaltantes,
}: Props) {
  const [editingHojaVida, setEditingHojaVida] = useState<HojaVida | null>(null);
  const [creandoFaltantes, setCreandoFaltantes] = useState(false);

  // --- Filtros ---
  const [busqueda, setBusqueda] = useState("");
  const [filtroSede, setFiltroSede] = useState("all");
  const [filtroUbicacion, setFiltroUbicacion] = useState("all");
  const [filtroCategoria, setFiltroCategoria] = useState("all");
  const [filtroTipo, setFiltroTipo] = useState("all");
  const [filtroEstado, setFiltroEstado] = useState("all");

  // Mapa de elemento_id -> ElementoOption para búsqueda rápida
  const elementosMap = useMemo(() => {
    const map = new Map<number, ElementoOption>();
    for (const el of elementos) {
      map.set(el.id, el);
    }
    return map;
  }, [elementos]);

  // Ubicaciones filtradas por sede
  const ubicacionesFiltradas = useMemo(() => {
    if (filtroSede === "all") return ubicaciones;
    return ubicaciones.filter((u) => u.sede_id === parseInt(filtroSede));
  }, [ubicaciones, filtroSede]);

  // Filtrar hojas de vida
  const hojasFiltradas = useMemo(() => {
    return hojasVida.filter((hoja) => {
      const elemento = elementosMap.get(hoja.elemento_id);

      // Filtro de búsqueda por texto (serie, marca, modelo, responsable)
      if (busqueda.trim()) {
        const q = busqueda.toLowerCase();
        const serie = hoja.elemento?.serie?.toLowerCase() || "";
        const marca = hoja.elemento?.marca?.toLowerCase() || "";
        const modelo = hoja.elemento?.modelo?.toLowerCase() || "";
        const responsable = hoja.responsable?.toLowerCase() || "";
        if (
          !serie.includes(q) &&
          !marca.includes(q) &&
          !modelo.includes(q) &&
          !responsable.includes(q)
        ) {
          return false;
        }
      }

      // Filtro por sede
      if (filtroSede !== "all" && elemento) {
        const ubicacion = elemento.ubicacion_rel;
        if (!ubicacion?.sede || ubicacion.sede.id !== parseInt(filtroSede)) {
          return false;
        }
      }

      // Filtro por ubicación
      if (filtroUbicacion !== "all" && elemento) {
        if (elemento.ubicacion_id !== parseInt(filtroUbicacion)) {
          return false;
        }
      }

      // Filtro por categoría
      if (filtroCategoria !== "all" && elemento) {
        if (elemento.categoria_id !== parseInt(filtroCategoria)) {
          return false;
        }
      }

      // Filtro por tipo de elemento
      if (filtroTipo !== "all") {
        if (hoja.tipo_elemento !== filtroTipo) {
          return false;
        }
      }

      // Filtro por estado
      if (filtroEstado !== "all") {
        const esActivo = filtroEstado === "activo";
        if (hoja.activo !== esActivo) {
          return false;
        }
      }

      return true;
    });
  }, [
    hojasVida,
    busqueda,
    filtroSede,
    filtroUbicacion,
    filtroCategoria,
    filtroTipo,
    filtroEstado,
    elementosMap,
  ]);

  const hayFiltrosActivos =
    busqueda.trim() !== "" ||
    filtroSede !== "all" ||
    filtroUbicacion !== "all" ||
    filtroCategoria !== "all" ||
    filtroTipo !== "all" ||
    filtroEstado !== "all";

  const limpiarFiltros = () => {
    setBusqueda("");
    setFiltroSede("all");
    setFiltroUbicacion("all");
    setFiltroCategoria("all");
    setFiltroTipo("all");
    setFiltroEstado("all");
  };

  const handleCrearFaltantes = async () => {
    if (!onCrearHojasVidaFaltantes) return;
    setCreandoFaltantes(true);
    try {
      const { creadas, errores } = await onCrearHojasVidaFaltantes();
      if (creadas > 0) toast.success(`Se crearon ${creadas} hoja(s) de vida.`);
      if (errores.length > 0) toast.error(errores.slice(0, 2).join(" "));
      if (creadas === 0 && errores.length === 0)
        toast.info("Todos los elementos ya tienen hoja de vida.");
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Error al crear hojas de vida"
      );
    } finally {
      setCreandoFaltantes(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h1 className="text-2xl font-bold" data-tour="page-title">
          Hojas de Vida
        </h1>
        <div className="flex gap-2" data-tour="hojasvida-create">
          {onCrearHojasVidaFaltantes && (
            <Button
              variant="secondary"
              onClick={handleCrearFaltantes}
              disabled={creandoFaltantes}
            >
              <FileText className="h-4 w-4 mr-2" />
              Crear hojas de vida faltantes
            </Button>
          )}
          <HojaVidaUpsertDialog
            serverAction={onCreateHojaVida}
            create={true}
            elementos={elementos}
            sedes={sedes}
            ubicaciones={ubicaciones}
            categorias={categorias}
            subcategorias={subcategorias}
          />
        </div>
      </div>

      {/* --- Filtros --- */}
      <div className="rounded-lg border bg-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <Search className="h-4 w-4" />
            Filtros
          </h3>
          {hayFiltrosActivos && (
            <Button variant="ghost" size="sm" onClick={limpiarFiltros}>
              <X className="h-3 w-3 mr-1" />
              Limpiar filtros
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          {/* Búsqueda por texto */}
          <div className="space-y-1 xl:col-span-2">
            <Label className="text-xs">Buscar</Label>
            <Input
              placeholder="Serie, marca, modelo, responsable..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="h-9"
            />
          </div>

          {/* Sede */}
          <div className="space-y-1">
            <Label className="text-xs">Sede</Label>
            <Select
              value={filtroSede}
              onValueChange={(v) => {
                setFiltroSede(v);
                setFiltroUbicacion("all");
              }}
            >
              <SelectTrigger className="h-9 w-full">
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las sedes</SelectItem>
                {sedes.map((s) => (
                  <SelectItem key={s.id} value={s.id.toString()}>
                    {s.nombre} - {s.ciudad}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Ubicación */}
          <div className="space-y-1">
            <Label className="text-xs">Ubicación</Label>
            <Select value={filtroUbicacion} onValueChange={setFiltroUbicacion}>
              <SelectTrigger className="h-9 w-full">
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las ubicaciones</SelectItem>
                {ubicacionesFiltradas.map((u) => (
                  <SelectItem key={u.id} value={u.id.toString()}>
                    {u.codigo} - {u.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Categoría */}
          <div className="space-y-1">
            <Label className="text-xs">Categoría</Label>
            <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
              <SelectTrigger className="h-9 w-full">
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {categorias.map((c) => (
                  <SelectItem key={c.id} value={c.id.toString()}>
                    {c.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tipo + Estado en una fila */}
          <div className="space-y-1">
            <Label className="text-xs">Tipo</Label>
            <Select value={filtroTipo} onValueChange={setFiltroTipo}>
              <SelectTrigger className="h-9 w-full">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="EQUIPO">Equipo</SelectItem>
                <SelectItem value="RECURSO_DIDACTICO">
                  Recurso Didáctico
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Contador de resultados */}
        {hayFiltrosActivos && (
          <p className="text-xs text-muted-foreground">
            Mostrando {hojasFiltradas.length} de {hojasVida.length} hojas de
            vida
          </p>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Elemento</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Fecha Diligenciamiento</TableHead>
              <TableHead>Responsable</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {hojasFiltradas.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground"
                >
                  {hayFiltrosActivos
                    ? "No se encontraron hojas de vida con los filtros aplicados"
                    : "No hay hojas de vida registradas"}
                </TableCell>
              </TableRow>
            ) : (
              hojasFiltradas.map((hoja, idx) => (
                <TableRow key={hoja.id}>
                  <TableCell>
                    {hoja.elemento
                      ? `${hoja.elemento.serie} - ${
                          hoja.elemento.marca || ""
                        } ${hoja.elemento.modelo || ""}`.trim()
                      : `Elemento ID: ${hoja.elemento_id}`}
                  </TableCell>
                  <TableCell>
                    <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                      {hoja.tipo_elemento === "EQUIPO"
                        ? "Equipo"
                        : "Recurso Didáctico"}
                    </span>
                  </TableCell>
                  <TableCell>
                    {format(
                      parseServerDate(hoja.fecha_dilegenciamiento),
                      "dd/MM/yyyy",
                      { locale: es }
                    )}
                  </TableCell>
                  <TableCell>{hoja.responsable || "N/A"}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        hoja.activo
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {hoja.activo ? "Activo" : "Inactivo"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        data-tour={
                          idx === 0
                            ? "hojasvida-ver-historial-first"
                            : undefined
                        }
                      >
                        <Link href={`/hojas-vida/elemento/${hoja.elemento_id}`}>
                          Ver historial
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingHojaVida(hoja)}
                        data-tour={
                          idx === 0 ? "hojasvida-edit-first" : undefined
                        }
                      >
                        Editar
                      </Button>
                      <span
                        data-tour={
                          idx === 0 ? "hojasvida-delete-first" : undefined
                        }
                      >
                        <DeleteButton
                          onConfirm={() => onDeleteHojaVida(hoja.id)}
                        />
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {editingHojaVida && (
        <HojaVidaUpsertDialog
          serverAction={onUpdateHojaVida}
          create={false}
          defaultValues={editingHojaVida}
          elementos={elementos}
          sedes={sedes}
          ubicaciones={ubicaciones}
          categorias={categorias}
          subcategorias={subcategorias}
          hiddenFields={{ id: editingHojaVida.id }}
          onClose={() => setEditingHojaVida(null)}
        />
      )}
    </div>
  );
}
