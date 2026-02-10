import type { TutorialItem } from "../types";
import { CATEGORIAS_ITEMS } from "./categorias";
import { SUBCATEGORIAS_ITEMS } from "./subcategorias";
import { UBICACIONES_ITEMS } from "./ubicaciones";
import { ELEMENTOS_ITEMS } from "./elementos";
import { PRESTAMOS_ITEMS } from "./prestamos";
import { USUARIOS_ITEMS } from "./usuarios";
import { OBSERVACIONES_ITEMS } from "./observaciones";
import { MANTENIMIENTOS_ITEMS } from "./mantenimientos";
import { KPIS_ITEMS } from "./kpis";

export const TUTORIAL_ITEMS: TutorialItem[] = [
  ...CATEGORIAS_ITEMS,
  ...SUBCATEGORIAS_ITEMS,
  ...UBICACIONES_ITEMS,
  ...ELEMENTOS_ITEMS,
  ...PRESTAMOS_ITEMS,
  ...USUARIOS_ITEMS,
  ...OBSERVACIONES_ITEMS,
  ...MANTENIMIENTOS_ITEMS,
  ...KPIS_ITEMS,
];

