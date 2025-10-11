import { NextRequest, NextResponse } from 'next/server';
import { getTicketsReporteData } from '../../../../modules/reportes/services';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fechaInicio = searchParams.get('fechaInicio');
    const fechaFin = searchParams.get('fechaFin');

    const fechaInicioDate = fechaInicio ? new Date(fechaInicio) : undefined;
    const fechaFinDate = fechaFin ? new Date(fechaFin) : undefined;

    const data = await getTicketsReporteData(fechaInicioDate, fechaFinDate);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error obteniendo datos de tickets:', error);
    return NextResponse.json(
      { error: 'Error al obtener datos de tickets' },
      { status: 500 }
    );
  }
}


