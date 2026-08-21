'use client';

import { useEffect, useState } from 'react';
import { Patient, CancerCellReading } from '@/types';

export default function Home() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [recentReadings, setRecentReadings] = useState<(CancerCellReading & { patient_name: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<number | null>(null);
  const [patientReadings, setPatientReadings] = useState<CancerCellReading[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [patientsRes, readingsRes] = await Promise.all([
        fetch('/api/data?type=patients'),
        fetch('/api/data?type=recent&limit=10')
      ]);

      if (patientsRes.ok) {
        const patientsData = await patientsRes.json();
        setPatients(patientsData);
      }

      if (readingsRes.ok) {
        const readingsData = await readingsRes.json();
        setRecentReadings(readingsData);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatientReadings = async (patientId: number) => {
    try {
      const res = await fetch(`/api/data?type=readings&patientId=${patientId}`);
      if (res.ok) {
        const data = await res.json();
        setPatientReadings(data);
        setSelectedPatient(patientId);
      }
    } catch (error) {
      console.error('Error fetching patient readings:', error);
    }
  };

  const getRiskLevel = (cellCount: number) => {
    if (cellCount < 100) return { level: 'Baixo', color: 'text-emerald-400', bg: 'bg-emerald-500/20' };
    if (cellCount < 500) return { level: 'Moderado', color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
    return { level: 'Alto', color: 'text-red-400', bg: 'bg-red-500/20' };
  };

  const totalPatients = patients.length;
  const avgCellCount = recentReadings.length > 0 
    ? Math.round(recentReadings.reduce((sum, r) => sum + r.cell_count, 0) / recentReadings.length)
    : 0;
  const highRiskPatients = recentReadings.filter(r => r.cell_count >= 500).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-cyan-400 text-2xl neon-text">Carregando SolarBoard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-cyan-400 neon-text mb-2">SolarBoard</h1>
        <p className="text-slate-400">Monitoramento de Células Cancerígenas em Oncologia</p>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card-gradient rounded-xl p-6 stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm mb-1">Total de Pacientes</p>
              <p className="text-3xl font-bold text-cyan-400">{totalPatients}</p>
            </div>
            <div className="w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="card-gradient rounded-xl p-6 stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm mb-1">Média de Células</p>
              <p className="text-3xl font-bold text-purple-400">{avgCellCount}</p>
            </div>
            <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="card-gradient rounded-xl p-6 stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm mb-1">Pacientes em Risco</p>
              <p className="text-3xl font-bold text-red-400">{highRiskPatients}</p>
            </div>
            <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Patients List */}
        <div className="card-gradient rounded-xl p-6">
          <h2 className="text-xl font-semibold text-cyan-400 mb-4">Pacientes</h2>
          <div className="space-y-3">
            {patients.map((patient) => (
              <div
                key={patient.id}
                onClick={() => fetchPatientReadings(patient.id)}
                className="bg-slate-800/50 rounded-lg p-4 cursor-pointer hover:bg-slate-700/50 transition-all border border-slate-700 hover:border-cyan-500/50"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium text-white">{patient.name}</h3>
                    <p className="text-sm text-slate-400">{patient.age} anos • {patient.cancer_type}</p>
                    <p className="text-xs text-slate-500">Diagnóstico: {new Date(patient.diagnosis_date).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            ))}
            {patients.length === 0 && (
              <p className="text-slate-400 text-center py-4">Nenhum paciente cadastrado</p>
            )}
          </div>
        </div>

        {/* Recent Readings or Patient Details */}
        <div className="card-gradient rounded-xl p-6">
          <h2 className="text-xl font-semibold text-cyan-400 mb-4">
            {selectedPatient ? 'Histórico do Paciente' : 'Leituras Recentes'}
          </h2>
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {(selectedPatient ? patientReadings : recentReadings).map((reading: any) => {
              const risk = getRiskLevel(reading.cell_count);
              return (
                <div key={reading.id} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      {!selectedPatient && reading.patient_name && (
                        <p className="text-sm text-cyan-400 mb-1">{reading.patient_name}</p>
                      )}
                      <p className="text-xs text-slate-500">
                        {new Date(reading.reading_date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${risk.bg} ${risk.color}`}>
                      Risco {risk.level}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div>
                      <p className="text-xs text-slate-400">Contagem de Células</p>
                      <p className="text-lg font-bold text-white">{reading.cell_count}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Marcador Tumoral</p>
                      <p className="text-lg font-bold text-white">{reading.tumor_marker}</p>
                    </div>
                  </div>
                  {reading.notes && (
                    <p className="text-xs text-slate-400 mt-2 pt-2 border-t border-slate-700">
                      {reading.notes}
                    </p>
                  )}
                </div>
              );
            })}
            {(selectedPatient ? patientReadings : recentReadings).length === 0 && (
              <p className="text-slate-400 text-center py-4">
                {selectedPatient ? 'Selecione um paciente para ver o histórico' : 'Nenhuma leitura recente'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-8 text-center text-slate-500 text-sm">
        <p>SolarBoard © {new Date().getFullYear()} - Dashboard gratuito para oncologistas</p>
      </footer>
    </div>
  );
}
