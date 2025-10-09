import { Button } from "../ui/button";
import { Input } from "../ui/input";
// Nota: usamos <select> nativo para mantener este componente como Server Component

type ElementoItem = {
  id: number;
  categoria_id: number;
  subcategoria_id: number | null;
  serie: string;
  marca: string | null;
  modelo: string | null;
  cantidad: number;
};

type CategoriaOption = { id: number; nombre: string };
type SubcategoriaOption = { id: number; nombre: string };

type ElementoRowProps = {
  elemento: ElementoItem;
  categorias: CategoriaOption[];
  subcategorias: SubcategoriaOption[];
  onUpdate: (formData: FormData) => Promise<void>;
  onDelete: (formData: FormData) => Promise<void>;
};

export function ElementoRow({
  elemento,
  categorias,
  subcategorias,
  onUpdate,
  onDelete,
}: ElementoRowProps) {
  return (
    <div className="grid items-center gap-2 rounded border p-3 sm:grid-cols-8">
      <form action={onUpdate} className="contents">
        <input type="hidden" name="id" value={elemento.id} />
        <select
          name="categoria_id"
          defaultValue={String(elemento.categoria_id)}
          className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-primary/40 h-9 w-full min-w-0 rounded-md border-2 bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow,border-color] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-primary focus-visible:ring-primary/30 focus-visible:ring-[3px] hover:border-primary/60"
        >
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
        <select
          name="subcategoria_id"
          defaultValue={
            elemento.subcategoria_id ? String(elemento.subcategoria_id) : ""
          }
          className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-primary/40 h-9 w-full min-w-0 rounded-md border-2 bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow,border-color] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-primary focus-visible:ring-primary/30 focus-visible:ring-[3px] hover:border-primary/60"
        >
          <option value="">—</option>
          {subcategorias.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nombre}
            </option>
          ))}
        </select>
        <Input name="serie" defaultValue={elemento.serie} />
        <Input name="marca" defaultValue={elemento.marca ?? ""} />
        <Input name="modelo" defaultValue={elemento.modelo ?? ""} />
        <Input
          name="cantidad"
          type="number"
          defaultValue={String(elemento.cantidad)}
        />
        <div className="ml-auto flex gap-2">
          <Button type="submit">Guardar</Button>
        </div>
      </form>
      <form action={onDelete}>
        <input type="hidden" name="id" value={elemento.id} />
        <Button type="submit" variant="destructive">
          Eliminar
        </Button>
      </form>
    </div>
  );
}
