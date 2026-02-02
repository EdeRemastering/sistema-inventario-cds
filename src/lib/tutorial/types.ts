import type { HowToFlow } from "@/components/tour/app-tour-provider";

export type TutorialItem = {
  id: string;
  title: string;
  description: string;
  flow?: HowToFlow;
  /**
   * Compatibilidad: items antiguos de 1 solo paso.
   * Idealmente migrarlos a `flow` para que el tutorial sea "completo".
   */
  howto?: {
    route: string;
    selector: string;
    title: string;
    description: string;
    side?: "top" | "right" | "bottom" | "left";
    align?: "start" | "center" | "end";
  };
};

