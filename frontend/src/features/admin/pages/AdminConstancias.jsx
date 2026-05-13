import { useState, useEffect, useCallback } from 'react'
import AdminLayout from '../components/AdminLayout'
import { listarExpedientesAdmin, revisarExpediente } from '../../../repositories/tramitesRepository'
import { generarDocumento, descargarDocumento } from '../../../repositories/tramitesRepository'

const BRAND = '#410016'
const BRAND_MID = '#7a0028'

const ESTADO_CONFIG = {
  aprobado: { label: 'Aprobado', color: 'text-emerald-700 bg-emerald-100 border-emerald-200' },
  constancia_emitida: { label: 'Constancia emitida', color: 'text-blue-700 bg-blue-100 border-blue-200' },
}

function EstadoBadge({ estado }) {
  const cfg = ESTADO_CONFIG[estado] || { label: estado, color: 'text-gray-600 bg-gray-100 border-gray-200' }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${cfg.color}`}>
      {cfg.label}
    </span>
  )
}

function formatFecha(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
}

function getCiudadano(expediente) {
  const perfil = expediente.perfil_usuario || {}
  return perfil.nombre || perfil.displayName || expediente.usuario_uid || 'Ciudadano'
}

export default function AdminConstancias() {
  const [expedientes, setExpedientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filtroPrograma, setFiltroPrograma] = useState('todos')
  const [generando, setGenerando] = useState({})
  const [descargando, setDescargando] = useState({})
  const [resultados, setResultados] = useState({})
  const [modalExpediente, setModalExpediente] = useState(null)
  const [obsAdmin, setObsAdmin] = useState('')

  const cargar = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [aprobadosRes, constanciasRes] = await Promise.all([
        listarExpedientesAdmin('aprobado'),
        listarExpedientesAdmin('constancia_emitida'),
      ])
      const aprobados = aprobadosRes.data?.tramites_virtuales || []
      const conConstancia = constanciasRes.data?.tramites_virtuales || []
      setExpedientes([...conConstancia, ...aprobados])
    } catch {
      setError('No se pudieron cargar los expedientes.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { cargar() }, [cargar])

  const programasUnicos = ['todos', ...new Set(expedientes.map((e) => e.programa_nombre).filter(Boolean))]

  const expedientesFiltrados = filtroPrograma === 'todos'
    ? expedientes
    : expedientes.filter((e) => e.programa_nombre === filtroPrograma)

  const abrirModal = (expediente) => {
    setModalExpediente(expediente)
    setObsAdmin(expediente.observaciones_admin || 'Constancia emitida correctamente.')
  }

  const handleGenerarConstancia = async () => {
    if (!modalExpediente) return
    const exp = modalExpediente
    setModalExpediente(null)
    setGenerando((prev) => ({ ...prev, [exp.expediente_id]: true }))

    try {
      const ciudadano = getCiudadano(exp)
      const perfil = exp.perfil_usuario || {}

      const res = await generarDocumento('constancia', {
        ciudadano_nombre: ciudadano,
        folio: exp.expediente_id,
        tramite_nombre: exp.programa_nombre,
        dependencia: perfil.dependencia || 'ACIPS',
        observaciones: obsAdmin || exp.observaciones_admin || 'Aprobado.',
        emitido_por: 'Administrador ACIPS',
        cargo_emisor: 'Sistema ACIPS',
      })

      const fileName = res.data?.file_name
      const downloadUrl = res.data?.download_url

      if (fileName) {
        await revisarExpediente(
          exp.expediente_id,
          'constancia_emitida',
          obsAdmin || 'Constancia emitida.',
          downloadUrl || `/api/v1/documentos/${fileName}`,
        )
        setResultados((prev) => ({ ...prev, [exp.expediente_id]: { fileName, downloadUrl } }))
        setExpedientes((prev) =>
          prev.map((e) =>
            e.expediente_id === exp.expediente_id
              ? { ...e, estado: 'constancia_emitida', constancia_url: downloadUrl }
              : e
          )
        )
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'Error al generar la constancia.'
      setResultados((prev) => ({ ...prev, [exp.expediente_id]: { error: msg } }))
    } finally {
      setGenerando((prev) => ({ ...prev, [exp.expediente_id]: false }))
    }
  }

  const handleDescargar = async (expediente) => {
    const res = resultados[expediente.expediente_id]
    const fileName = res?.fileName || expediente.constancia_url?.split('/').pop()
    if (!fileName) return

    setDescargando((prev) => ({ ...prev, [expediente.expediente_id]: true }))
    try {
      const blob = await descargarDocumento(fileName)
      const url = window.URL.createObjectURL(new Blob([blob.data], { type: 'application/pdf' }))
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      link.click()
      window.URL.revokeObjectURL(url)
    } catch {
      alert('No se pudo descargar el PDF.')
    } finally {
      setDescargando((prev) => ({ ...prev, [expediente.expediente_id]: false }))
    }
  }

  const aprobadosCount = expedientes.filter((e) => e.estado === 'aprobado').length
  const emitidosCount = expedientes.filter((e) => e.estado === 'constancia_emitida').length

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-black text-gray-900">Constancias</h2>
          <p className="text-sm text-gray-500 font-medium mt-0.5">
            Genera y descarga constancias para expedientes aprobados
          </p>
        </div>
        <div className="flex gap-3">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2 text-center">
            <p className="text-2xl font-black text-emerald-700">{aprobadosCount}</p>
            <p className="text-xs font-bold text-emerald-600">Por emitir</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-2 text-center">
            <p className="text-2xl font-black text-blue-700">{emitidosCount}</p>
            <p className="text-xs font-bold text-blue-600">Emitidas</p>
          </div>
        </div>
      </div>

      {/* Filtro por programa */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <label className="text-sm font-bold text-gray-700 whitespace-nowrap">Filtrar por programa:</label>
          <select
            value={filtroPrograma}
            onChange={(e) => setFiltroPrograma(e.target.value)}
            className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#410016] bg-gray-50"
          >
            {programasUnicos.map((p) => (
              <option key={p} value={p}>{p === 'todos' ? 'Todos los programas' : p}</option>
            ))}
          </select>
          <p className="text-xs text-gray-400 font-medium whitespace-nowrap">
            {expedientesFiltrados.length} expediente{expedientesFiltrados.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm font-semibold">
          {error}
        </div>
      )}

      {/* Tabla */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64 text-gray-400 text-sm gap-2">
            <svg className="animate-spin h-5 w-5" style={{ color: BRAND }} fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Cargando expedientes...
          </div>
        ) : expedientesFiltrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400 gap-3">
            <svg className="w-12 h-12 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm font-semibold">No hay expedientes aprobados</p>
            <p className="text-xs text-gray-400">Aprueba solicitudes en la sección de Solicitudes primero</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-5 py-3 text-xs font-black text-gray-500 uppercase tracking-wide">Folio</th>
                  <th className="text-left px-5 py-3 text-xs font-black text-gray-500 uppercase tracking-wide">Ciudadano</th>
                  <th className="text-left px-5 py-3 text-xs font-black text-gray-500 uppercase tracking-wide">Programa</th>
                  <th className="text-left px-5 py-3 text-xs font-black text-gray-500 uppercase tracking-wide">Fecha</th>
                  <th className="text-left px-5 py-3 text-xs font-black text-gray-500 uppercase tracking-wide">Estado</th>
                  <th className="text-right px-5 py-3 text-xs font-black text-gray-500 uppercase tracking-wide">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {expedientesFiltrados.map((exp) => {
                  const isGenerando = generando[exp.expediente_id]
                  const isDescargando = descargando[exp.expediente_id]
                  const resultado = resultados[exp.expediente_id]
                  const tieneConstancia = exp.estado === 'constancia_emitida' || resultado?.fileName
                  const ciudadano = getCiudadano(exp)

                  return (
                    <tr key={exp.expediente_id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-4">
                        <span className="font-mono text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                          {exp.expediente_id.slice(0, 10)}...
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                            style={{ background: `linear-gradient(135deg, ${BRAND}, ${BRAND_MID})` }}>
                            {ciudadano[0]?.toUpperCase()}
                          </div>
                          <span className="font-semibold text-gray-800 text-sm">{ciudadano}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-medium text-gray-700">{exp.programa_nombre}</span>
                      </td>
                      <td className="px-5 py-4 text-gray-500 text-xs">{formatFecha(exp.updated_at)}</td>
                      <td className="px-5 py-4">
                        <EstadoBadge estado={exp.estado} />
                        {resultado?.error && (
                          <p className="text-xs text-red-600 mt-1 font-semibold">{resultado.error}</p>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {tieneConstancia && (
                            <button
                              onClick={() => handleDescargar(exp)}
                              disabled={isDescargando}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 text-xs font-bold hover:bg-blue-100 transition-colors disabled:opacity-50"
                            >
                              {isDescargando ? (
                                <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                              ) : (
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                              )}
                              Descargar
                            </button>
                          )}
                          {exp.estado === 'aprobado' && (
                            <button
                              onClick={() => abrirModal(exp)}
                              disabled={isGenerando}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-xs font-bold transition-all hover:opacity-90 disabled:opacity-50"
                              style={{ background: `linear-gradient(135deg, ${BRAND}, ${BRAND_MID})` }}
                            >
                              {isGenerando ? (
                                <>
                                  <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                  </svg>
                                  Generando...
                                </>
                              ) : (
                                <>
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  Emitir constancia
                                </>
                              )}
                            </button>
                          )}
                          {exp.estado === 'constancia_emitida' && !resultado?.fileName && (
                            <button
                              onClick={() => abrirModal(exp)}
                              disabled={isGenerando}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-600 text-xs font-bold hover:bg-gray-100 transition-colors disabled:opacity-50"
                            >
                              Regenerar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal confirmación */}
      {modalExpediente && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-black text-gray-900 mb-1">Emitir constancia</h3>
            <p className="text-sm text-gray-500 mb-4">
              Programa: <span className="font-bold text-gray-700">{modalExpediente.programa_nombre}</span>
            </p>

            <div className="bg-gray-50 rounded-xl px-4 py-3 mb-4 text-xs font-mono text-gray-500">
              Folio: {modalExpediente.expediente_id}
            </div>

            <label className="block text-xs font-black text-gray-700 uppercase tracking-wide mb-2">
              Observaciones del revisor
            </label>
            <textarea
              value={obsAdmin}
              onChange={(e) => setObsAdmin(e.target.value)}
              rows={3}
              className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#410016] resize-none"
              placeholder="Ej: Documentos verificados, expediente completo..."
            />

            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setModalExpediente(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleGenerarConstancia}
                className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold transition-all hover:opacity-90"
                style={{ background: `linear-gradient(135deg, ${BRAND}, ${BRAND_MID})` }}
              >
                Generar PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
