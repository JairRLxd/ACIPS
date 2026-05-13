import { useState, useEffect, useCallback } from 'react'
import AdminLayout from '../components/AdminLayout'
import { listarExpedientesAdmin, revisarExpediente, generarDocumento } from '../../../repositories/tramitesRepository'
import { obtenerExpedienteAdmin } from '../../../repositories/adminRepository'

const BRAND = '#410016'
const BRAND_MID = '#7a0028'

const TABS = [
  { key: 'todos', label: 'Todos', estado: null },
  { key: 'enviado', label: 'Pendientes', estado: 'enviado' },
  { key: 'aprobado', label: 'Aprobados', estado: 'aprobado' },
  { key: 'rechazado', label: 'Rechazados', estado: 'rechazado' },
  { key: 'constancia_emitida', label: 'Con constancia', estado: 'constancia_emitida' },
]

const ESTADO_CONFIG = {
  enviado: { label: 'Pendiente', color: 'text-amber-700 bg-amber-100 border-amber-200' },
  aprobado: { label: 'Aprobado', color: 'text-emerald-700 bg-emerald-100 border-emerald-200' },
  rechazado: { label: 'Rechazado', color: 'text-red-700 bg-red-100 border-red-200' },
  constancia_emitida: { label: 'Con constancia', color: 'text-blue-700 bg-blue-100 border-blue-200' },
}

function EstadoBadge({ estado }) {
  const cfg = ESTADO_CONFIG[estado] || { label: estado, color: 'text-gray-600 bg-gray-100 border-gray-200' }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${cfg.color}`}>
      {cfg.label}
    </span>
  )
}

function Spinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <svg className="animate-spin h-10 w-10" style={{ color: BRAND }} fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
    </div>
  )
}

export default function AdminSolicitudes() {
  const [tabActual, setTabActual] = useState('todos')
  const [solicitudes, setSolicitudes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [drawerAbierto, setDrawerAbierto] = useState(false)
  const [expediente, setExpediente] = useState(null)
  const [loadingDetalle, setLoadingDetalle] = useState(false)

  const [observaciones, setObservaciones] = useState('')
  const [constanciaUrl, setConstanciaUrl] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [generandoConstancia, setGenerandoConstancia] = useState(false)
  const [mensajeAccion, setMensajeAccion] = useState(null)

  const cargar = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const tab = TABS.find((t) => t.key === tabActual)
      const res = await listarExpedientesAdmin(tab?.estado || null)
      setSolicitudes(res.data?.tramites_virtuales || [])
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar solicitudes')
    } finally {
      setLoading(false)
    }
  }, [tabActual])

  useEffect(() => {
    cargar()
  }, [cargar])

  const abrirDetalle = async (id) => {
    setDrawerAbierto(true)
    setExpediente(null)
    setObservaciones('')
    setConstanciaUrl('')
    setMensajeAccion(null)
    setLoadingDetalle(true)
    try {
      const res = await obtenerExpedienteAdmin(id)
      setExpediente(res.data?.tramite_virtual || res.data || null)
    } catch {
      setExpediente(null)
    } finally {
      setLoadingDetalle(false)
    }
  }

  const cerrarDrawer = () => {
    setDrawerAbierto(false)
    setExpediente(null)
    setMensajeAccion(null)
  }

  const handleRevision = async (decision) => {
    if (!expediente) return
    setEnviando(true)
    setMensajeAccion(null)
    try {
      await revisarExpediente(
        expediente.expediente_id || expediente.id,
        decision,
        observaciones,
        constanciaUrl || null
      )
      const labels = { aprobado: 'aprobado', rechazado: 'rechazado', constancia_emitida: 'constancia emitida' }
      setMensajeAccion({ tipo: 'exito', texto: `Expediente ${labels[decision] ?? decision} correctamente.` })
      await cargar()
    } catch (err) {
      const raw = err.response?.data?.error
      const texto = typeof raw === 'string'
        ? raw
        : raw && typeof raw === 'object'
          ? Object.values(raw).flat().join(' ')
          : 'Error al procesar la revisión.'
      setMensajeAccion({ tipo: 'error', texto })
    } finally {
      setEnviando(false)
    }
  }

  const handleGenerarConstancia = async () => {
    if (!expediente?.tipo_documento_generado) return
    setGenerandoConstancia(true)
    setMensajeAccion(null)
    try {
      const nombre = expediente.perfil_usuario?.nombre || expediente.perfil_usuario?.nombre_completo || ''
      const res = await generarDocumento(expediente.tipo_documento_generado, {
        nombre,
        curp: expediente.perfil_usuario?.curp || '',
        municipio: expediente.perfil_usuario?.municipio || '',
      })
      const fileName = res.data?.file_name || res.data?.filename
      if (fileName) {
        const baseUrl = window.location.origin
        setConstanciaUrl(`${baseUrl}/api/v1/documentos/${fileName}`)
        setMensajeAccion({ tipo: 'exito', texto: 'Constancia generada. Revisa la URL y haz clic en "Emitir constancia".' })
      }
    } catch (err) {
      const raw = err.response?.data?.error
      const texto = typeof raw === 'string' ? raw : 'No se pudo generar la constancia.'
      setMensajeAccion({ tipo: 'error', texto })
    } finally {
      setGenerandoConstancia(false)
    }
  }

  const pendientes = solicitudes.filter((s) => s.estado === 'enviado').length

  return (
    <AdminLayout>
      <div className="flex gap-6 h-full relative">
        {/* Contenido principal */}
        <div className={`flex-1 min-w-0 transition-all duration-300 ${drawerAbierto ? 'mr-[420px]' : ''}`}>
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-black text-gray-900">Solicitudes</h2>
              {pendientes > 0 && (
                <p className="text-sm text-amber-600 font-semibold mt-0.5">
                  {pendientes} pendiente{pendientes !== 1 ? 's' : ''} de revisión
                </p>
              )}
            </div>
            <button
              onClick={cargar}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200 bg-white hover:bg-gray-50 transition-all disabled:opacity-50"
            >
              <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Actualizar
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setTabActual(tab.key)}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                  tabActual === tab.key
                    ? 'bg-white shadow-sm text-gray-900'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          {/* Tabla */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {loading ? (
              <Spinner />
            ) : solicitudes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <svg className="w-14 h-14 mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-sm font-semibold">Sin solicitudes en esta categoría</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wide px-6 py-3">Programa</th>
                    <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wide px-4 py-3">Solicitante</th>
                    <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wide px-4 py-3">Fecha</th>
                    <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wide px-4 py-3">Estado</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {solicitudes.map((s) => {
                    const fecha = s.created_at || s.fecha_creacion
                    const fechaStr = fecha
                      ? new Date(fecha).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
                      : '—'
                    const id = s.expediente_id || s.id

                    return (
                      <tr
                        key={id}
                        className="hover:bg-rose-50/40 transition-colors cursor-pointer group"
                        onClick={() => abrirDetalle(id)}
                      >
                        <td className="px-6 py-4">
                          <p className="text-sm font-semibold text-gray-900 truncate max-w-[200px]">
                            {s.programa_nombre || `Programa #${s.programa_id}`}
                          </p>
                          <p className="text-xs text-gray-400 font-mono truncate max-w-[200px]">{id}</p>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-sm text-gray-600 font-medium truncate max-w-[160px]">
                            {s.usuario_nombre || s.usuario_uid || '—'}
                          </p>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-sm text-gray-500">{fechaStr}</p>
                        </td>
                        <td className="px-4 py-4">
                          <EstadoBadge estado={s.estado} />
                        </td>
                        <td className="px-4 py-4 text-right">
                          <span className="text-xs font-semibold text-gray-400 group-hover:text-gray-700 transition-colors">
                            Ver →
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Drawer lateral */}
        {drawerAbierto && (
          <>
            {/* Overlay semitransparente */}
            <div
              className="fixed inset-0 z-20 bg-black/10 backdrop-blur-[1px]"
              onClick={cerrarDrawer}
            />
            <aside className="fixed right-0 top-0 h-full w-[420px] bg-white shadow-2xl border-l border-gray-100 z-30 flex flex-col overflow-hidden">
              {/* Header del drawer */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100"
                style={{ background: `linear-gradient(135deg, ${BRAND}, ${BRAND_MID})` }}>
                <div>
                  <p className="text-white/60 text-xs font-medium uppercase tracking-widest">Detalle</p>
                  <h3 className="text-white font-black text-lg">Expediente</h3>
                </div>
                <button
                  onClick={cerrarDrawer}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Contenido del drawer */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {loadingDetalle ? (
                  <Spinner />
                ) : !expediente ? (
                  <div className="text-center text-gray-400 py-12 text-sm">No se pudo cargar el expediente.</div>
                ) : (
                  <>
                    {/* Info principal */}
                    <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
                      <div>
                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-0.5">Programa</p>
                        <p className="text-base font-bold text-gray-900">
                          {expediente.programa_nombre || `Programa #${expediente.programa_id}`}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-0.5">ID Expediente</p>
                        <p className="text-xs font-mono text-gray-600 break-all">
                          {expediente.expediente_id || expediente.id}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-0.5">Estado actual</p>
                        <EstadoBadge estado={expediente.estado} />
                      </div>
                      {(expediente.usuario_uid || expediente.usuario_nombre) && (
                        <div>
                          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-0.5">Solicitante</p>
                          <p className="text-sm text-gray-700">{expediente.usuario_nombre || expediente.usuario_uid}</p>
                        </div>
                      )}
                    </div>

                    {/* Checklist de documentos */}
                    {expediente.checklist && expediente.checklist.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-2">
                          Documentos del expediente ({expediente.checklist.length})
                        </p>
                        <div className="space-y-2">
                          {expediente.checklist.map((item, i) => (
                            <div key={i} className="flex items-start gap-3 bg-gray-50 rounded-xl px-3 py-2.5">
                              <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold ${item.estado === 'aprobado' ? 'bg-emerald-500' : 'bg-amber-400'}`}>
                                {item.estado === 'aprobado' ? '✓' : '!'}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-gray-700 truncate">{item.nombre}</p>
                                {item.observacion && (
                                  <p className="text-xs text-gray-400 truncate">{item.observacion}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tipo documento generado */}
                    {expediente.tipo_documento_generado && (
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                        <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-0.5">Documento a generar</p>
                        <p className="text-sm font-bold text-blue-900">
                          {expediente.tipo_documento_generado.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                        </p>
                      </div>
                    )}

                    {/* Observaciones previas del admin */}
                    {expediente.observaciones_admin && (
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                        <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1">Observaciones previas</p>
                        <p className="text-sm text-amber-800">{expediente.observaciones_admin}</p>
                      </div>
                    )}

                    {/* Formulario de revisión */}
                    <div className="space-y-3 pt-2 border-t border-gray-100">
                      <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Nueva revisión</p>

                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                          Observaciones <span className="text-red-500">*</span>
                          <span className="text-gray-400 font-normal ml-1">(mín. 3 caracteres)</span>
                        </label>
                        <textarea
                          rows={4}
                          value={observaciones}
                          onChange={(e) => setObservaciones(e.target.value)}
                          placeholder="Escribe un comentario para el ciudadano..."
                          className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 resize-none"
                          style={{ focusRingColor: BRAND }}
                        />
                      </div>

                      {/* Generar constancia automáticamente */}
                      {expediente.tipo_documento_generado && (
                        <div className="rounded-xl border border-blue-200 bg-blue-50 p-3">
                          <p className="text-xs font-bold text-blue-800 mb-2 uppercase tracking-wide">
                            Generar constancia con ACIPS
                          </p>
                          <p className="text-xs text-blue-700 mb-3">
                            Genera el PDF de <span className="font-semibold">{expediente.tipo_documento_generado.replace(/_/g, ' ')}</span> automáticamente y se llenará la URL abajo.
                          </p>
                          <button
                            onClick={handleGenerarConstancia}
                            disabled={generandoConstancia || enviando}
                            className="w-full py-2 rounded-lg text-xs font-bold text-white disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5"
                            style={{ background: `linear-gradient(to right, ${BRAND}, ${BRAND_MID})` }}
                          >
                            {generandoConstancia ? (
                              <>
                                <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Generando...
                              </>
                            ) : (
                              <>
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Generar PDF de constancia
                              </>
                            )}
                          </button>
                        </div>
                      )}

                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                          URL de constancia
                          <span className="text-gray-400 font-normal ml-1">(se llena automáticamente al generar, o pega un link externo)</span>
                        </label>
                        <input
                          type="text"
                          value={constanciaUrl}
                          onChange={(e) => setConstanciaUrl(e.target.value)}
                          placeholder="Se llenará aquí al generar, o pega un link..."
                          className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2"
                        />
                        {constanciaUrl && (
                          <a href={constanciaUrl} target="_blank" rel="noopener noreferrer"
                            className="text-xs font-semibold underline mt-1 inline-block" style={{ color: BRAND }}>
                            Previsualizar documento →
                          </a>
                        )}
                      </div>

                      {/* Mensaje de resultado */}
                      {mensajeAccion && (
                        <div className={`px-3 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 ${
                          mensajeAccion.tipo === 'exito'
                            ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                            : 'bg-red-50 border border-red-200 text-red-700'
                        }`}>
                          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            {mensajeAccion.tipo === 'exito'
                              ? <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              : <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            }
                          </svg>
                          {mensajeAccion.texto}
                        </div>
                      )}

                      {/* Botones */}
                      <div className="flex gap-3 pt-1">
                        <button
                          onClick={() => handleRevision('aprobado')}
                          disabled={enviando}
                          className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5"
                        >
                          {enviando ? (
                            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                          Aprobar
                        </button>
                        <button
                          onClick={() => handleRevision('rechazado')}
                          disabled={enviando}
                          className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5"
                        >
                          {enviando ? (
                            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )}
                          Rechazar
                        </button>
                      </div>

                      {/* Botón emitir constancia — solo cuando hay URL y el programa genera documento */}
                      {constanciaUrl.trim() && expediente.tipo_documento_generado && (
                        <button
                          onClick={() => handleRevision('constancia_emitida')}
                          disabled={enviando}
                          className="w-full py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5"
                          style={{ background: `linear-gradient(to right, ${BRAND}, ${BRAND_MID})` }}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Emitir constancia
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </aside>
          </>
        )}
      </div>
    </AdminLayout>
  )
}
