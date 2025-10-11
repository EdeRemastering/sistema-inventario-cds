"use server";

// Este archivo se mantiene para compatibilidad con imports existentes
// La lógica principal de reportes se movió a src/lib/report-handler.ts

// Función legacy - usar generateReport desde report-handler.ts en su lugar
export async function actionGenerateReporte() {
  return { 
    success: false, 
    message: "Esta función está deprecada. Use generateReport desde report-handler.ts" 
  };
}