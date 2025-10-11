import { NextRequest, NextResponse } from 'next/server';
import { getCategoriasReporteData } from '../../../../modules/reportes/services';

export async function GET() {
  try {
    const data = await getCategoriasReporteData();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error obteniendo datos de categorías:', error);
    return NextResponse.json(
      { error: 'Error al obtener datos de categorías' },
      { status: 500 }
    );
  }
}


