"use server";

import {
  getInventarioReporteData,
  getMovimientosReporteData,
  getPrestamosActivosReporteData,
  getCategoriasReporteData,
  getObservacionesReporteData,
  getTicketsReporteData,
  getReporteStats
} from "./services";

export async function actionGetInventarioReporteData() {
  return await getInventarioReporteData();
}

export async function actionGetMovimientosReporteData(fechaInicio?: Date, fechaFin?: Date) {
  return await getMovimientosReporteData(fechaInicio, fechaFin);
}

export async function actionGetPrestamosActivosReporteData() {
  return await getPrestamosActivosReporteData();
}

export async function actionGetCategoriasReporteData() {
  return await getCategoriasReporteData();
}

export async function actionGetObservacionesReporteData(fechaInicio?: Date, fechaFin?: Date) {
  return await getObservacionesReporteData(fechaInicio, fechaFin);
}

export async function actionGetTicketsReporteData(fechaInicio?: Date, fechaFin?: Date) {
  return await getTicketsReporteData(fechaInicio, fechaFin);
}

export async function actionGetReporteStats() {
  return await getReporteStats();
}