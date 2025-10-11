import { NextRequest, NextResponse } from 'next/server';
import { getPrestamosActivosReporteData } from '../../../../modules/reportes/services';

export async function GET() {
  try {
    const data = await getPrestamosActivosReporteData();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error obteniendo datos de préstamos activos:', error);
    return NextResponse.json(
      { error: 'Error al obtener datos de préstamos activos' },
      { status: 500 }
    );
  }
}


