import { useState } from 'react'
import AdminLayout from '../components/AdminLayout'

const BRAND = '#410016'

export default function Incidencias() {
  const [incidencias] = useState([
    { id: 1, titulo: 'Error al subir documentos', usuario: 'Juan Pérez', prioridad: 'alta', estado: 'abierta', fecha: '2026-05-13' },
    { id: 2, titulo: 'No puedo ver mis solicitudes', usuario: 'María García', prioridad: 'media', estado: 'en_proceso', fecha: '2026-05-12' },
    { id: 3, titulo: 'Problema con el chatbot', usuario: 'Pedro López', prioridad: 'baja', estado: 'resuelta', fecha: '2026-05-11' },
    { id: 4, titulo: 'Error en el cálculo de probabilidad', usuario: 'Ana Martínez', prioridad: 'alta', estado: 'abierta', fecha: '2026-05-13' },
  ])

  const stats = {
    total: incidencias.length,
    abiertas: incidencias.filter(i => i.estado === 'abierta').length,
    enProceso: incidencias.filter(i => i.estado === 'en_proceso').length,
    resueltas: incidencias.filter(i => i.estado === 'resuelta').length,
  }

  return (
    <AdminLayout>
      <div className="mb-8">
        <h2 className="text-3xl font-black text-gray-900 mb-2">Gestión de Incidencias</h2>
        <p className="text-gray-600">Administra y resuelve los reportes de problemas de los usuarios</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total" value={stats.total} color="#410016" />
        <StatCard label="Abiertas" value={stats.abiertas} color="#dc2626" />
        <StatCard label="En proceso" value={stats.enProceso} color="#d97706" />
        <StatCard label="Resueltas" value={stats.resueltas} color="#059669" />
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">ID</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">Título</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">Usuario</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">Prioridad</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">Estado</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">Fecha</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {incidencias.map((inc) => (
                <tr key={inc.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-gray-900">#{inc.id}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-semibold text-gray-900">{inc.titulo}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-600">{inc.usuario}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                      inc.prioridad === 'alta' ? 'text-red-700 bg-red-100' :
                      inc.prioridad === 'media' ? 'text-amber-700 bg-amber-100' :
                      'text-blue-700 bg-blue-100'
                    }`}>
                      {inc.prioridad === 'alta' ? 'Alta' : inc.prioridad === 'media' ? 'Media' : 'Baja'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                      inc.estado === 'abierta' ? 'text-red-700 bg-red-100' :
                      inc.estado === 'en_proceso' ? 'text-amber-700 bg-amber-100' :
                      'text-emerald-700 bg-emerald-100'
                    }`}>
                      {inc.estado === 'abierta' ? 'Abierta' : inc.estado === 'en_proceso' ? 'En proceso' : 'Resuelta'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-600">{inc.fecha}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 rounded-lg text-blue-600 hover:bg-blue-50" title="Responder">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                        </svg>
                      </button>
                      <button className="p-2 rounded-lg text-emerald-600 hover:bg-emerald-50" title="Marcar como resuelta">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  )
}

function StatCard({ label, value, color }) {
  return (
    <div className="p-5 rounded-2xl border border-gray-100 bg-white">
      <p className="text-3xl font-black mb-1" style={{ color }}>{value}</p>
      <p className="text-sm font-semibold text-gray-600">{label}</p>
    </div>
  )
}
