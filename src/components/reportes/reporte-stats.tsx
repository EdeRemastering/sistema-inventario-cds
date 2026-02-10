"use client";

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Ticket } from "lucide-react";

interface ReporteStatsProps {
  stats: {
    totalTickets: number;
  };
}

export function ReporteStats({ stats }: ReporteStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-1 max-w-xs">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tickets</CardTitle>
          <Ticket className="h-4 w-4 text-pink-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalTickets}</div>
          <p className="text-xs text-muted-foreground">Guardados</p>
        </CardContent>
      </Card>
    </div>
  );
}
