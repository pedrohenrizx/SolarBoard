import { NextResponse } from 'next/server';
import { getPatients, getCancerCellData, getRecentReadings } from '@/lib/database';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const patientId = searchParams.get('patientId');

  try {
    if (type === 'patients') {
      const patients = await getPatients();
      return NextResponse.json(patients);
    }

    if (type === 'readings' && patientId) {
      const readings = await getCancerCellData(parseInt(patientId));
      return NextResponse.json(readings);
    }

    if (type === 'recent') {
      const limit = parseInt(searchParams.get('limit') || '10');
      const readings = await getRecentReadings(limit);
      return NextResponse.json(readings);
    }

    return NextResponse.json({ error: 'Invalid request type' }, { status: 400 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
