import { useState, useEffect, useMemo } from 'react'
import AdminLayout from '../components/AdminLayout'
import { obtenerTramites } from '../../../repositories/tramitesRepository'

const BRAND = '#410016'
const BRAND_MID = '#7a0028'

const GRUPO_CONFIG = {
  A: { label: 'Grupo A · Presencial', color: 'text-amber-700 bg-amber-100 border-amber-200' },
  B: { label: 'Grupo B · Genera documento', color: 'text-blue-700 bg-blue-100 border-blue-200' },
}

const MODALIDAD_CONFIG = {
  presencial: { label: 'Presencial', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  hibrido: { label: 'Híbrido', color: 'text-purple-700 bg-purple-50 border-purple-200' },
  virtual: { label: 'Virtual', color: 'text-sky-700 bg-sky-50 border-sky-200' },
}

function Badge({ label, color }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border ${color}`}>
      {label}
    </span>
  )
}

export default function AdminProgramas() {
  const [programas, setProgramas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [busqueda, setBusqueda] = useState('')
  const [filtroGrupo, setFiltroGrupo] = useState('todos')
  const [expandido, setExpandido] = useState(null)

  useEffect(() => {
    const cargar = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await obtenerTramites()
        const lista = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.tramites)
            ? res.data.tramites
            : Array.isArray(res.data?.programas)
              ? res.data.programas
              : []
        setProgramas(lista)
      } catch {
        setError('No se pudo cargar el catálogo de programas.')
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [])

  const programasFiltrados = useMemo(() => {
    return programas.filter((p) => {
      const matchBusqueda = busqueda.trim() === '' ||
        p.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.dependencia?.toLowerCase().includes(busqueda.toLowerCase())
      const matchGrupo = filtroGrupo === 'todos' || String(p.grupo) === filtroGrupo
      return matchBusqueda && matchGrupo
    })
  }, [programas, busqueda, filtroGrupo])

  const grupoACount = programas.filter((p) => String(p.grupo) === 'A').length
  const grupoBCount = programas.filter((p) => String(p.grupo) === 'B').length

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-black text-gray-900">Programas Sociales</h2>
          <p className="text-sm text-gray-500 font-medium mt-0.5">
            Catálogo completo de programas disponibles en el sistema
          </p>
        </div>
        <div className="flex gap-3">
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 text-center">
            <p className="text-2xl font-black text-amber-700">{grupoACount}</p>
            <p className="text-xs font-bold text-amber-600">Grupo A</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-2 text-center">
            <p className="text-2xl font-black text-blue-700">{grupoBCount}</p>
            <p className="text-xs font-bold text-blue-600">Grupo B</p>
          </div>
          <div className="rounded-xl px-4 py-2 text-center border border-gray-200 bg-gray-50">
            <p className="text-2xl font-black text-gray-700">{programas.length}</p>
            <p className="text-xs font-bold text-gray-500">Total</p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4 flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre o dependencia..."
          className="flex-1 text-sm border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:border-[#410016] bg-gray-50"
        />
        <div className="flex gap-2">
          {['todos', 'A', 'B'].map((g) => (
            <button
              key={g}
              onClick={() => setFiltroGrupo(g)}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                filtroGrupo === g
                  ? 'text-white border-transparent'
                  : 'border-gray-200 text-gray-600 bg-gray-50 hover:border-gray-300'
              }`}
              style={filtroGrupo === g ? { background: `linear-gradient(135deg, ${BRAND}, ${BRAND_MID})` } : {}}
            >
              {g === 'todos' ? 'Todos' : `Grupo ${g}`}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm font-semibold">
          {error}
        </div>
      )}

      {/* Lista */}
      {loading ? (
        <div className="flex items-center justify-center h-64 text-gray-400 gap-2">
          <svg className="animate-spin h-5 w-5" style={{ color: BRAND }} fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm">Cargando programas...</span>
        </div>
      ) : programasFiltrados.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center h-48 text-gray-400 gap-2">
          <svg className="w-10 h-10 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <p className="text-sm font-semibold">Sin resultados</p>
        </div>
      ) : (
        <div className="space-y-3">
          {programasFiltrados.map((programa) => {
            const isOpen = expandido === programa.id
            const grupoCfg = GRUPO_CONFIG[String(programa.grupo)] || { label: `Grupo ${programa.grupo}`, color: 'text-gray-600 bg-gray-100 border-gray-200' }
            const modalidadCfg = MODALIDAD_CONFIG[programa.modalidad?.toLowerCase()] || { label: programa.modalidad || '—', color: 'text-gray-600 bg-gray-100 border-gray-200' }
            const docsCount = programa.documentos_requeridos?.length || 0

            return (
              <div
                key={programa.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all"
              >
                {/* Fila principal - siempre visible */}
                <button
                  onClick={() => setExpandido(isOpen ? null : programa.id)}
                  className="w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50/50 transition-colors text-left"
                >
                  {/* ID badge */}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm flex-shrink-0"
                    style={{ background: `linear-gradient(135deg, ${BRAND}, ${BRAND_MID})` }}
                  >
                    {programa.id}
                  </div>

                  {/* Info principal */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-900 text-sm">{programa.nombre}</h3>
                      <Badge label={grupoCfg.label} color={grupoCfg.color} />
                      <Badge label={modalidadCfg.label} color={modalidadCfg.color} />
                      {programa.permite_envio_virtual && (
                        <Badge label="Envío virtual" color="text-purple-700 bg-purple-50 border-purple-200" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500 truncate">{programa.dependencia}</p>
                  </div>

                  {/* Meta compacta */}
                  <div className="hidden sm:flex items-center gap-4 flex-shrink-0">
                    <div className="text-center">
                      <p className="text-sm font-black text-gray-800">{docsCount}</p>
                      <p className="text-xs text-gray-400">docs</p>
                    </div>
                    {programa.monto && (
                      <div className="text-center">
                        <p className="text-sm font-black text-emerald-700">{programa.monto}</p>
                        <p className="text-xs text-gray-400">{programa.periodicidad || ''}</p>
                      </div>
                    )}
                  </div>

                  {/* Chevron */}
                  <svg
                    className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Panel expandido */}
                {isOpen && (
                  <div className="border-t border-gray-100 px-5 py-4 bg-gray-50/40">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                      {programa.descripcion && (
                        <div className="sm:col-span-2 lg:col-span-3">
                          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Descripción</p>
                          <p className="text-sm text-gray-700 leading-relaxed">{programa.descripcion}</p>
                        </div>
                      )}
                      {programa.monto && (
                        <InfoItem label="Monto" value={programa.monto} />
                      )}
                      {programa.periodicidad && (
                        <InfoItem label="Periodicidad" value={programa.periodicidad} />
                      )}
                      {programa.dependencia && (
                        <InfoItem label="Dependencia" value={programa.dependencia} />
                      )}
                      {programa.modulo_atencion && (
                        <InfoItem label="Módulo de atención" value={programa.modulo_atencion} />
                      )}
                      {programa.tipo_documento_generado && (
                        <InfoItem label="Documento generado" value={programa.tipo_documento_generado} />
                      )}
                      {programa.emite_constancia !== undefined && (
                        <InfoItem label="Emite constancia" value={programa.emite_constancia ? 'Sí' : 'No'} />
                      )}
                    </div>

                    {docsCount > 0 && (
                      <div>
                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-2">
                          Documentos requeridos ({docsCount})
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {programa.documentos_requeridos.map((doc, idx) => (
                            <span
                              key={doc.id || idx}
                              className="text-xs bg-white border border-gray-200 text-gray-700 font-medium px-2.5 py-1 rounded-lg"
                            >
                              {doc.nombre || doc.tipo || `Doc ${idx + 1}`}
                              {doc.opcional && <span className="text-gray-400 ml-1">(opcional)</span>}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {programa.url_oficial && (
                      <div className="mt-3">
                        <a
                          href={programa.url_oficial}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-bold hover:underline"
                          style={{ color: BRAND }}
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          Ver sitio oficial
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </AdminLayout>
  )
}

function InfoItem({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-sm font-bold text-gray-800">{value}</p>
    </div>
  )
}
