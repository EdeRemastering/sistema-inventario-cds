"use client";

import * as React from "react";
import {
  Legend,
  ResponsiveContainer,
  Tooltip,
  type LegendProps,
  type TooltipProps,
} from "recharts";
import { cn } from "../../lib/utils";

export type ChartConfig = Record<
  string,
  {
    label?: React.ReactNode;
    color?: string; // e.g. "hsl(var(--chart-1))" or "#2563eb"
    icon?: React.ComponentType<{ className?: string }>;
  }
>;

type ChartContextValue = {
  config: ChartConfig;
};

const ChartContext = React.createContext<ChartContextValue | null>(null);

function useChart() {
  const ctx = React.useContext(ChartContext);
  if (!ctx) throw new Error("Chart components must be used within <ChartContainer />");
  return ctx;
}

type ChartContainerProps = Omit<React.ComponentProps<"div">, "children"> & {
  config: ChartConfig;
  // ResponsiveContainer requiere un ReactElement como hijo.
  children: React.ReactElement;
};

export function ChartContainer({
  config,
  className,
  children,
  ...props
}: ChartContainerProps) {
  // Map config colors to CSS variables: --color-${key}
  const styleVars = React.useMemo(() => {
    const vars: Record<string, string> = {};
    for (const [key, value] of Object.entries(config)) {
      if (value?.color) vars[`--color-${key}`] = value.color;
    }
    return vars as React.CSSProperties;
  }, [config]);

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        className={cn("w-full", className)}
        style={styleVars}
        {...props}
      >
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}

export function ChartTooltip(props: TooltipProps<number, string>) {
  return <Tooltip cursor={false} {...props} />;
}

type ChartTooltipContentProps = {
  labelKey?: string;
  nameKey?: string;
  hideLabel?: boolean;
  hideIndicator?: boolean;
  indicator?: "dot" | "line" | "dashed";
};

export function ChartTooltipContent({
  active,
  label,
  payload,
  labelKey,
  nameKey,
  hideLabel,
  hideIndicator,
  indicator = "dot",
}: ChartTooltipContentProps & {
  active?: boolean;
  // Recharts tipa distinto entre versiones; usamos tipos flexibles aquí.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  label?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: any[];
}) {
  const { config } = useChart();

  if (!active || !payload?.length) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const firstPayload = payload?.[0] as any;
  const resolvedLabel =
    labelKey && firstPayload?.payload?.[labelKey] ? firstPayload.payload[labelKey] : label;

  return (
    <div className="rounded-lg border bg-background p-2 shadow-sm">
      {!hideLabel && (
        <div className="mb-2 text-xs font-medium text-muted-foreground">
          {String(resolvedLabel ?? "")}
        </div>
      )}
      <div className="space-y-1">
        {payload.map((item) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const it: any = item;
          const dataKey = nameKey ? it?.payload?.[nameKey] : it?.dataKey ?? it?.name;
          const key = String(dataKey ?? it?.dataKey ?? it?.name ?? "value");
          const conf = config[key] ?? config[it?.dataKey] ?? undefined;
          const displayName =
            (conf?.label ? String(conf.label) : undefined) ??
            String(it?.name ?? it?.dataKey ?? key);

          return (
            <div key={`${key}-${it?.dataKey ?? it?.name ?? ""}`} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                {!hideIndicator && (
                  <span
                    className={cn(
                      "shrink-0",
                      indicator === "dot" && "h-2 w-2 rounded-full",
                      indicator === "line" && "h-[2px] w-3 rounded",
                      indicator === "dashed" && "h-[2px] w-3 border-t border-dashed"
                    )}
                    style={{
                      background:
                        indicator === "dot" || indicator === "line"
                          ? (it?.color ?? "currentColor")
                          : undefined,
                      borderColor: indicator === "dashed" ? (it?.color ?? "currentColor") : undefined,
                    }}
                  />
                )}
                <span className="text-xs">{displayName}</span>
              </div>
              <span className="text-xs font-medium tabular-nums">
                {typeof it?.value === "number" ? it.value.toLocaleString() : String(it?.value ?? "")}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ChartLegend(props: LegendProps) {
  return <Legend {...props} />;
}

type ChartLegendContentProps = {
  nameKey?: string;
};

export function ChartLegendContent({
  payload,
  nameKey,
}: ChartLegendContentProps & {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: any[];
}) {
  const { config } = useChart();

  if (!payload?.length) return null;
  return (
    <div className="flex flex-wrap gap-3 pt-2 text-xs">
      {payload.map((item) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const it: any = item;
        const key = String(nameKey ? it?.payload?.[nameKey] : it?.dataKey ?? it?.value ?? it?.name);
        const conf = config[key] ?? config[it?.dataKey] ?? undefined;
        const displayName =
          (conf?.label ? String(conf.label) : undefined) ?? String(it?.value ?? it?.name ?? key);

        return (
          <div key={key} className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ background: it?.color ?? "currentColor" }} />
            <span className="text-muted-foreground">{displayName}</span>
          </div>
        );
      })}
    </div>
  );
}

