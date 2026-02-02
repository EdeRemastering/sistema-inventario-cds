"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Search } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { dispatchStartAppHowToFlow, type HowToFlow } from "@/components/tour/app-tour-provider";
import { TUTORIAL_ITEMS } from "@/lib/tutorial/items";

export function TutorialPage() {
  const router = useRouter();
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return TUTORIAL_ITEMS;
    return TUTORIAL_ITEMS.filter((it) =>
      `${it.title} ${it.description}`.toLowerCase().includes(query)
    );
  }, [q]);

  const startHowTo = (flow: HowToFlow) => {
    dispatchStartAppHowToFlow(flow);
    const first = flow.steps[0];
    if (first?.route) router.push(first.route);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold" data-tour="page-title">
            Tutorial
          </h1>
          <p className="text-sm text-muted-foreground">
            Elige una pregunta para ir al módulo y ver el tutorial en acción.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar en el tutorial (ej: categoría, ticket, KPI)..."
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            {filtered.map((it) => (
              <div
                key={it.id}
                className="rounded-lg border bg-card p-4 flex flex-col gap-2"
              >
                <div className="font-medium">{it.title}</div>
                <div className="text-sm text-muted-foreground">
                  {it.description}
                </div>
                <div className="pt-2">
                  <Button
                    type="button"
                    onClick={() => {
                      const flow =
                        it.flow ??
                        (it.howto
                          ? {
                              title: it.howto.title,
                              steps: [
                                {
                                  id: `howto-${it.id}`,
                                  route: it.howto.route,
                                  selector: it.howto.selector,
                                  title: it.howto.title,
                                  description: it.howto.description,
                                  side: it.howto.side,
                                  align: it.howto.align,
                                },
                              ],
                            }
                          : null);
                      if (flow) startHowTo(flow);
                    }}
                    className="w-full"
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Ver tutorial
                  </Button>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="text-sm text-muted-foreground">
                No se encontraron resultados para “{q}”.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

