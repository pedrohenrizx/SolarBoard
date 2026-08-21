const NEON_API_URL = process.env.NEON_DATABASE_URL!;

async function neonQuery(query: string) {
  try {
    const response = await fetch(NEON_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sql: query }),
    });

    if (!response.ok) {
      throw new Error(`Database error: ${response.statusText}`);
    }

    const result = await response.json();
    return result.rows || [];
  } catch (error) {
    console.error('Query error:', error);
    return [];
  }
}

export async function getPatients() {
  try {
    const patients = await neonQuery('SELECT * FROM patients ORDER BY name');
    return patients;
  } catch (error) {
    console.error('Error fetching patients:', error);
    return [];
  }
}

export async function getCancerCellData(patientId: number) {
  try {
    const data = await neonQuery(
      `SELECT * FROM cancer_cell_readings WHERE patient_id = ${patientId} ORDER BY reading_date DESC`
    );
    return data;
  } catch (error) {
    console.error('Error fetching cancer cell data:', error);
    return [];
  }
}

export async function getRecentReadings(limit: number = 10) {
  try {
    const readings = await neonQuery(
      `SELECT r.*, p.name as patient_name FROM cancer_cell_readings r JOIN patients p ON r.patient_id = p.id ORDER BY r.reading_date DESC LIMIT ${limit}`
    );
    return readings;
  } catch (error) {
    console.error('Error fetching recent readings:', error);
    return [];
  }
}
