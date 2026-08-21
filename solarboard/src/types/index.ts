export interface Patient {
  id: number;
  name: string;
  age: number;
  diagnosis_date: string;
  cancer_type: string;
}

export interface CancerCellReading {
  id: number;
  patient_id: number;
  reading_date: string;
  cell_count: number;
  tumor_marker: number;
  notes?: string;
}
