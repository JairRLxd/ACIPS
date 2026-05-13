import AdminLayout from '../components/AdminLayout'

const BRAND = '#410016'
const BRAND_MID = '#7a0028'

export default function AdminReportes() {
  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-black text-gray-900">Reportes</h2>
          <p className="text-sm text-gray-500 font-medium mt-0.5">Estadísticas y exportación de datos del sistema</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center py-24 px-8 text-center">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-lg"
          style={{ background: `linear-gradient(135deg, ${BRAND}, ${BRAND_MID})` }}
        >
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 className="text-xl font-black text-gray-900 mb-2">Reportes</h3>
        <p className="text-gray-400 text-sm font-medium max-w-xs">
          Esta sección estará disponible próximamente.
        </p>
        <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          En desarrollo
        </div>
      </div>
    </AdminLayout>
  )
}
