import { NextResponse } from 'next/server';
import { getInventarioReporteData } from '../../../../modules/reportes/services';

export async function GET() {
  try {
    const data = await getInventarioReporteData();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error obteniendo datos de inventario:', error);
    return NextResponse.json(
      { error: 'Error al obtener datos de inventario' },
      { status: 500 }
    );
  }
}


