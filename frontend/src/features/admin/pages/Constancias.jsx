import { useState } from 'react'
import AdminLayout from '../components/AdminLayout'

const BRAND = '#410016'

export default function Constancias() {
  const [constancias] = useState([
    { id: 1, folio: 'CONST-2026-001', usuario: 'Juan Pérez', programa: 'Pensión Adultos Mayores', fecha: '2026-05-10', estado: 'emitida' },
    { id: 2, folio: 'CONST-2026-002', usuario: 'María García', programa: 'Beca Benito Juárez', fecha: '2026-05-11', estado: 'emitida' },
    { id: 3, folio: 'CONST-2026-003', usuario: 'Pedro López', programa: 'Sembrando Vida', fecha: '2026-05-12', estado: 'pendiente' },
  ])

  return (
    <AdminLayout>
      <div className="mb-8">
        <h2 className="text-3xl font-black text-gray-900 mb-2">Gestión de Constancias</h2>
        <p className="text-gray-600">Genera y administra constancias de trámites aprobados</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard label="Total emitidas" value={constancias.filter(c => c.estado === 'emitida').length} color="#059669" />
        <StatCard label="Pendientes" value={constancias.filter(c => c.estado === 'pendiente').length} color="#d97706" />
        <StatCard label="Este mes" value={constancias.length} color="#410016" />
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">Folio</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">Usuario</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">Programa</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">Fecha</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">Estado</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {constancias.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-gray-900">{c.folio}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-900">{c.usuario}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-600">{c.programa}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-600">{c.fecha}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                      c.estado === 'emitida' ? 'text-emerald-700 bg-emerald-100' : 'text-amber-700 bg-amber-100'
                    }`}>
                      {c.estado === 'emitida' ? 'Emitida' : 'Pendiente'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 rounded-lg text-blue-600 hover:bg-blue-50" title="Descargar PDF">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </button>
                      <button className="p-2 rounded-lg text-gray-600 hover:bg-gray-100" title="Ver detalles">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
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
