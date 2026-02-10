"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { APP_TOUR_STEPS, type AppTourStep } from "@/lib/tour/steps";

const STORAGE_KEY = "cds_app_tour_v1";
const START_EVENT = "cds-tour:start";

export type HowToFlow = {
  title: string;
  steps: AppTourStep[];
};

type StartTourDetail = {
  stepId?: string;
  howto?: HowToFlow;
};

type TourState = {
  active: boolean;
  index: number;
  mode?: "full" | "howto";
  howto?: { title: string; index: number; steps: AppTourStep[] };
};

function readState(): TourState {
  if (typeof window === "undefined") return { active: false, index: 0 };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { active: false, index: 0 };
    const parsed = JSON.parse(raw) as Partial<TourState>;
    return {
      active: Boolean(parsed.active),
      index: Number.isFinite(parsed.index) ? Number(parsed.index) : 0,
      mode: parsed.mode === "howto" ? "howto" : "full",
      howto: parsed.howto as TourState["howto"],
    };
  } catch {
    return { active: false, index: 0, mode: "full" };
  }
}

function writeState(next: TourState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}

function stopTour() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

async function waitForElement(selector: string, tries = 30, intervalMs = 100) {
  if (selector === "body") return true;
  for (let i = 0; i < tries; i++) {
    const el = document.querySelector(selector);
    if (el) return true;
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  return false;
}

export function AppTourProvider() {
  const router = useRouter();
  const pathname = usePathname();
  const driverRef = useRef<any>(null);
  const showingRef = useRef(false);
  const ignoreNextDestroyedRef = useRef(false);
  const beforeClickDoneRef = useRef<Set<string>>(new Set());
  const autoAdvanceCleanupRef = useRef<null | (() => void)>(null);

  const totalSteps = APP_TOUR_STEPS.length;

  const ensureDriver = useCallback(async () => {
    const mod = await import("driver.js");
    // driver.js exporta `driver`
    return mod.driver;
  }, []);

  const hardStop = useCallback(() => {
    // Importante: si solo removemos localStorage pero NO destruimos Driver,
    // el overlay puede quedarse y el usuario siente que “no cierra”.
    writeState({ active: false, index: 0, mode: "full" });
    beforeClickDoneRef.current.clear();
    try {
      ignoreNextDestroyedRef.current = true;
      driverRef.current?.destroy?.();
    } catch {
      // ignore
    }
  }, []);

  const goToIndex = useCallback(
    async (nextIndex: number) => {
      const clamped = Math.max(0, Math.min(totalSteps - 1, nextIndex));
      if (clamped === nextIndex && nextIndex >= totalSteps) {
        hardStop();
        return;
      }
      writeState({ active: true, index: clamped });
      const step = APP_TOUR_STEPS[clamped];
      if (step && step.route && step.route !== pathname) {
        router.push(step.route);
        return;
      }
      // si estamos en la misma ruta, mostramos en este mismo tick
      await new Promise((r) => setTimeout(r, 0));
      await showCurrentStep();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [hardStop, pathname, router, totalSteps]
  );

  const showCurrentStep = useCallback(async () => {
    if (typeof window === "undefined") return;
    if (showingRef.current) return;

    const state = readState();
    if (!state.active) return;

    const mode = state.mode ?? "full";
    const step =
      mode === "howto"
        ? state.howto?.steps?.[state.howto.index ?? 0]
        : APP_TOUR_STEPS[state.index];
    if (!step) {
      stopTour();
      return;
    }

    // Si no estamos en la ruta correcta, navegamos.
    if (step.route !== pathname) {
      router.push(step.route);
      return;
    }

    showingRef.current = true;
    try {
      // Limpiar listener de auto-advance del step anterior.
      try {
        autoAdvanceCleanupRef.current?.();
      } catch {
        // ignore
      }
      autoAdvanceCleanupRef.current = null;

      // Si el step requiere click previo (abrir modal), hacerlo una sola vez por step.id
      if (step.beforeClickSelector && !beforeClickDoneRef.current.has(step.id)) {
        const btn = document.querySelector(step.beforeClickSelector) as HTMLElement | null;
        if (btn) {
          btn.click();
          beforeClickDoneRef.current.add(step.id);
          // Dar tiempo a que el modal renderice y quede por encima del overlay del tour
          await new Promise((r) => setTimeout(r, 200));
        }
      }

      // Esperar a que el DOM esté listo y el elemento exista
      const found = await waitForElement(step.selector);
      const targetSelector =
        step.selector === "body"
          ? "body"
          : found
            ? step.selector
            : "body";

      // Destruir tour anterior
      try {
        ignoreNextDestroyedRef.current = true;
        driverRef.current?.destroy?.();
      } catch {
        // ignore
      }

      const driver = await ensureDriver();
      const howtoTotal = state.howto?.steps?.length ?? 1;
      const howtoIdx = (state.howto?.index ?? 0) + 1;
      const idxLabel = mode === "howto" ? `${howtoIdx}/${howtoTotal}` : `${state.index + 1}/${totalSteps}`;

      // Siguiente con estado fresco (sirve para auto-advance por click y botón "Siguiente").
      const advanceNext = async () => {
        const fresh = readState();
        const freshMode = fresh.mode ?? "full";
        if (freshMode === "howto") {
          const next = (fresh.howto?.index ?? 0) + 1;
          const total = fresh.howto?.steps?.length ?? 1;
          if (next >= total) {
            hardStop();
            try {
              ignoreNextDestroyedRef.current = true;
              driverRef.current?.destroy?.();
            } catch {
              // ignore
            }
            return;
          }
          writeState({
            ...fresh,
            active: true,
            mode: "howto",
            howto: {
              title: fresh.howto?.title ?? "Tutorial",
              index: next,
              steps: fresh.howto?.steps ?? [],
            },
          });
          const nextStep = fresh.howto?.steps?.[next];
          if (nextStep?.route && nextStep.route !== pathname) {
            router.push(nextStep.route);
            return;
          }
          await showCurrentStep();
          return;
        }

        if (fresh.index >= totalSteps - 1) {
          hardStop();
          try {
            ignoreNextDestroyedRef.current = true;
            driverRef.current?.destroy?.();
          } catch {
            // ignore
          }
          return;
        }
        await goToIndex(fresh.index + 1);
      };

      driverRef.current = driver({
        allowClose: true,
        showProgress: true,
        progressText: `Paso ${idxLabel}`,
        // Hace que el foco sea más cómodo de leer (incluye labels/ayuda alrededor).
        stagePadding: 12,
        stageRadius: 12,
        steps: [
          {
            element: targetSelector,
            popover: {
              title: `${idxLabel} · ${step.title}`,
              description: step.description,
              side: step.side ?? "bottom",
              align: step.align ?? "start",
              nextBtnText: (() => {
                if (mode === "howto") {
                  const last = (state.howto?.index ?? 0) >= (state.howto?.steps?.length ?? 1) - 1;
                  return last ? "Finalizar" : "Siguiente";
                }
                return state.index >= totalSteps - 1 ? "Finalizar" : "Siguiente";
              })(),
              prevBtnText: (() => {
                if (mode === "howto") return (state.howto?.index ?? 0) <= 0 ? " " : "Anterior";
                return state.index <= 0 ? " " : "Anterior";
              })(),
              onNextClick: async () => {
                await advanceNext();
              },
              onPrevClick: async () => {
                if (mode === "howto") {
                  const prev = (state.howto?.index ?? 0) - 1;
                  if (prev < 0) return;
                  writeState({
                    ...state,
                    active: true,
                    mode: "howto",
                    howto: {
                      title: state.howto?.title ?? "Tutorial",
                      index: prev,
                      steps: state.howto?.steps ?? [],
                    },
                  });
                  const prevStep = state.howto?.steps?.[prev];
                  if (prevStep?.route && prevStep.route !== pathname) {
                    router.push(prevStep.route);
                    return;
                  }
                  await showCurrentStep();
                  return;
                }
                if (state.index <= 0) return;
                await goToIndex(state.index - 1);
              },
              onCloseClick: () => {
                hardStop();
              },
            },
          },
        ],
        onDestroyed: () => {
          if (ignoreNextDestroyedRef.current) {
            ignoreNextDestroyedRef.current = false;
            return;
          }
          // Si el usuario cierra manualmente (X/ESC/click afuera), apagamos todo.
          hardStop();
        },
      });

      driverRef.current.drive();

      // Auto-avance por click: útil para pasos tipo "haz click en Crear/Editar/Eliminar".
      if (step.autoAdvanceOnClick) {
        const clickSelector = step.autoAdvanceClickSelector || targetSelector;
        if (clickSelector && clickSelector !== "body") {
          const handler = (ev: MouseEvent) => {
            const el = document.querySelector(clickSelector);
            const t = ev.target as Node | null;
            if (!el || !t) return;
            if (!el.contains(t)) return;
            // Evitar múltiples avances
            try {
              autoAdvanceCleanupRef.current?.();
            } catch {
              // ignore
            }
            autoAdvanceCleanupRef.current = null;
            void advanceNext();
          };
          document.addEventListener("click", handler, true);
          autoAdvanceCleanupRef.current = () => {
            document.removeEventListener("click", handler, true);
          };
        }
      }

      // Auto-avance por "desaparición": útil para pasos finales (Guardar) donde el modal se cierra al éxito.
      if (step.autoAdvanceOnGone) {
        const goneSelector = step.autoAdvanceGoneSelector || step.selector;
        if (goneSelector && goneSelector !== "body") {
          // Solo observamos si al inicio existe; así evitamos disparos instantáneos.
          const existsNow = Boolean(document.querySelector(goneSelector));
          if (existsNow) {
            const observer = new MutationObserver(() => {
              const stillThere = Boolean(document.querySelector(goneSelector));
              if (stillThere) return;

              try {
                autoAdvanceCleanupRef.current?.();
              } catch {
                // ignore
              }
              autoAdvanceCleanupRef.current = null;
              observer.disconnect();
              void advanceNext();
            });

            observer.observe(document.body, { childList: true, subtree: true });
            const prevCleanup = autoAdvanceCleanupRef.current;
            autoAdvanceCleanupRef.current = () => {
              try {
                prevCleanup?.();
              } catch {
                // ignore
              }
              observer.disconnect();
            };
          }
        }
      }
    } finally {
      showingRef.current = false;
    }
  }, [ensureDriver, goToIndex, pathname, router, totalSteps]);

  const startAt = useCallback(
    async (stepId?: string) => {
      const idx =
        stepId && APP_TOUR_STEPS.some((s) => s.id === stepId)
          ? Math.max(0, APP_TOUR_STEPS.findIndex((s) => s.id === stepId))
          : 0;

      writeState({ active: true, index: idx, mode: "full" });
      const step = APP_TOUR_STEPS[idx];
      if (step?.route && step.route !== pathname) {
        router.push(step.route);
        return;
      }
      await showCurrentStep();
    },
    [pathname, router, showCurrentStep]
  );

  const startHowTo = useCallback(
    async (flow: HowToFlow) => {
      beforeClickDoneRef.current.clear();
      writeState({
        active: true,
        index: 0,
        mode: "howto",
        howto: { title: flow.title, index: 0, steps: flow.steps },
      });
      const first = flow.steps[0];
      if (first?.route && first.route !== pathname) {
        router.push(first.route);
        return;
      }
      await showCurrentStep();
    },
    [pathname, router, showCurrentStep]
  );

  // Escucha el evento global (botón "Tutorial")
  useEffect(() => {
    const handler = (ev: Event) => {
      const detail = (ev as CustomEvent<StartTourDetail>).detail;
      if (detail?.howto) startHowTo(detail.howto);
      else startAt(detail?.stepId);
    };
    window.addEventListener(START_EVENT, handler as EventListener);
    return () => window.removeEventListener(START_EVENT, handler as EventListener);
  }, [startAt, startHowTo]);

  // Re-mostrar al cambiar de ruta si el tour está activo
  useEffect(() => {
    const s = readState();
    if (!s.active) return;
    // pequeño delay para permitir pintar la UI de la página
    const t = window.setTimeout(() => {
      showCurrentStep();
    }, 50);
    return () => window.clearTimeout(t);
  }, [pathname, showCurrentStep]);

  // No renderiza UI; solo controla el tour.
  return null;
}

export function dispatchStartAppTour() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<StartTourDetail>(START_EVENT, { detail: {} }));
}

export function dispatchStartAppTourAt(stepId: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<StartTourDetail>(START_EVENT, { detail: { stepId } }));
}

export function dispatchStartAppHowTo(step: AppTourStep) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<StartTourDetail>(START_EVENT, { detail: { howto: { title: step.title, steps: [step] } } })
  );
}

export function dispatchStartAppHowToFlow(flow: HowToFlow) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<StartTourDetail>(START_EVENT, { detail: { howto: flow } }));
}

