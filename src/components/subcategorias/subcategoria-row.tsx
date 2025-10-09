import { Button } from "../ui/button";
import { Input } from "../ui/input";
// Nota: usamos <select> nativo para mantener este componente como Server Component

type CategoriaOption = { id: number; nombre: string };
type SubcategoriaItem = {
  id: number;
  nombre: string;
  descripcion: string | null;
  categoria_id: number;
};

type SubcategoriaRowProps = {
  subcategoria: SubcategoriaItem;
  categorias: CategoriaOption[];
  onUpdate: (formData: FormData) => Promise<void>;
  onDelete: (formData: FormData) => Promise<void>;
};

export function SubcategoriaRow({
  subcategoria,
  categorias,
  onUpdate,
  onDelete,
}: SubcategoriaRowProps) {
  return (
    <div className="flex items-center gap-2 rounded border p-3">
      <form action={onUpdate} className="contents">
        <input type="hidden" name="id" value={subcategoria.id} />
        <Input
          name="nombre"
          defaultValue={subcategoria.nombre}
          className="w-48"
        />
        <Input
          name="descripcion"
          defaultValue={subcategoria.descripcion ?? ""}
          className="flex-1"
        />
        <select
          name="categoria_id"
          defaultValue={String(subcategoria.categoria_id)}
          className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-primary/40 h-9 w-full min-w-0 rounded-md border-2 bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow,border-color] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-primary focus-visible:ring-primary/30 focus-visible:ring-[3px] hover:border-primary/60"
        >
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
        <div className="ml-auto flex gap-2">
          <Button type="submit" variant="default">
            Guardar
          </Button>
        </div>
      </form>
      <form action={onDelete}>
        <input type="hidden" name="id" value={subcategoria.id} />
        <Button type="submit" variant="destructive">
          Eliminar
        </Button>
      </form>
    </div>
  );
}
