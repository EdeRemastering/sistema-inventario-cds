"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AiAnalysisContent } from "@/components/kpis/ai-analysis-content";
import {
  generateAiAnalysis,
  type GenerateAiAnalysisParams,
} from "@/app/(main)/kpis/mantenimientos/actions";
import { Sparkles, Loader2 } from "lucide-react";

type MantenimientosAiCardProps = GenerateAiAnalysisParams & {
  selectedYear: number;
};

export function MantenimientosAiCard(props: MantenimientosAiCardProps) {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setAnalysis(null);
    try {
      const result = await generateAiAnalysis({
        from: props.from,
        to: props.to,
        selectedYear: props.selectedYear,
        sede_id: props.sede_id,
        ubicacion_id: props.ubicacion_id,
        categoria_id: props.categoria_id,
        subcategoria_id: props.subcategoria_id,
      });
      setAnalysis(result);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-2">
        <div className="text-sm font-medium">Análisis tendencial (IA)</div>
        <div className="text-xs text-muted-foreground">
          Basado en la serie mes a mes del año {props.selectedYear}. Haz clic en
          el botón para generar el análisis.
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!analysis && !loading && (
          <Button type="button" onClick={handleGenerate} className="gap-2">
            <Sparkles className="h-4 w-4" />
            Generar análisis con IA
          </Button>
        )}
        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Generando análisis…
          </div>
        )}
        {analysis && (
          <>
            <AiAnalysisContent text={analysis} />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleGenerate}
              className="gap-2"
            >
              <Sparkles className="h-3 w-3" />
              Regenerar análisis
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
