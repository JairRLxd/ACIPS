import { useState } from 'react'
import AdminLayout from '../components/AdminLayout'

const BRAND = '#410016'

export default function Reportes() {
  const [tipoReporte, setTipoReporte] = useState('solicitudes')
  const [periodo, setPeriodo] = useState('mes')

  const reportes = [
    { id: 'solicitudes', nombre: 'Solicitudes por programa', descripcion: 'Estadísticas de solicitudes recibidas por cada programa social' },
    { id: 'usuarios', nombre: 'Usuarios registrados', descripcion: 'Reporte de nuevos usuarios y actividad en el sistema' },
    { id: 'aprobaciones', nombre: 'Tasa de aprobación', descripcion: 'Porcentaje de solicitudes aprobadas vs rechazadas' },
    { id: 'constancias', nombre: 'Constancias emitidas', descripcion: 'Total de constancias generadas por período' },
    { id: 'incidencias', nombre: 'Incidencias reportadas', descripcion: 'Problemas reportados y su estado de resolución' },
    { id: 'financiero', nombre: 'Reporte financiero', descripcion: 'Presupuesto asignado y ejecutado por programa' },
  ]

  return (
    <AdminLayout>
      <div className="mb-8">
        <h2 className="text-3xl font-black text-gray-900 mb-2">Reportes y Estadísticas</h2>
        <p className="text-gray-600">Genera reportes detallados y exporta datos del sistema</p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Tipo de reporte</label>
            <select
              value={tipoReporte}
              onChange={(e) => setTipoReporte(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-rose-300 focus:outline-none font-semibold"
            >
              {reportes.map((r) => (
                <option key={r.id} value={r.id}>{r.nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Período</label>
            <select
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-rose-300 focus:outline-none font-semibold"
            >
              <option value="semana">Última semana</option>
              <option value="mes">Último mes</option>
              <option value="trimestre">Último trimestre</option>
              <option value="año">Último año</option>
              <option value="personalizado">Personalizado</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all hover:shadow-lg"
              style={{ background: `linear-gradient(135deg, ${BRAND}, #7a0028)` }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Generar reporte
            </button>
          </div>
        </div>
      </div>

      {/* Grid de reportes disponibles */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {reportes.map((reporte) => (
          <ReporteCard key={reporte.id} reporte={reporte} />
        ))}
      </div>

      {/* Gráficas de ejemplo */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Solicitudes por mes</h3>
          <div className="h-64 flex items-end justify-around gap-2">
            {[65, 85, 72, 90, 78, 95].map((height, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-lg transition-all hover:opacity-80"
                  style={{ height: `${height}%`, background: `linear-gradient(to top, ${BRAND}, #7a0028)` }}
                />
                <span className="text-xs font-semibold text-gray-500">
                  {['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'][i]}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Distribución por programa</h3>
          <div className="space-y-3">
            {[
              { nombre: 'Pensión Adultos Mayores', porcentaje: 35, color: '#410016' },
              { nombre: 'Beca Benito Juárez', porcentaje: 28, color: '#7a0028' },
              { nombre: 'Sembrando Vida', porcentaje: 20, color: '#a0003a' },
              { nombre: 'Jóvenes Construyendo', porcentaje: 12, color: '#c0004a' },
              { nombre: 'Otros', porcentaje: 5, color: '#e0005a' },
            ].map((item, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-gray-700">{item.nombre}</span>
                  <span className="text-sm font-bold" style={{ color: item.color }}>{item.porcentaje}%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${item.porcentaje}%`, backgroundColor: item.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

function ReporteCard({ reporte }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
        style={{ background: `linear-gradient(135deg, ${BRAND}, #7a0028)` }}>
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">{reporte.nombre}</h3>
      <p className="text-sm text-gray-600 mb-4">{reporte.descripcion}</p>
      <button
        className="w-full py-2 px-4 rounded-lg text-sm font-semibold text-white transition-colors hover:shadow-lg"
        style={{ background: `linear-gradient(135deg, ${BRAND}, #7a0028)` }}
      >
        Generar
      </button>
    </div>
  )
}
