import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { obtenerTramite, validarDocumento, generarDocumento, descargarDocumento } from '../repositories/tramitesRepository'
import { archivoABase64 } from '../utils/fileUtils'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'

// Ordered from most specific to least — first match wins
const TIPO_MAP = [
  ['constancia de estudios', 'constancia_estudios'],
  ['constancia de situación fiscal', 'constancia_situacion_fiscal'],
  ['constancia de situacion fiscal', 'constancia_situacion_fiscal'],
  ['situación fiscal', 'constancia_situacion_fiscal'],
  ['situacion fiscal', 'constancia_situacion_fiscal'],
  ['comprobante de domicilio', 'comprobante_domicilio'],
  ['acta de nacimiento', 'acta_certificada'],
  ['credencial de elector', 'ine'],
  ['ine', 'ine'],
  ['curp', 'curp'],
  ['domicilio', 'comprobante_domicilio'],
  ['nacimiento', 'acta_certificada'],
  ['acta', 'acta_certificada'],
  ['estudios', 'constancia_estudios'],
  ['fiscal', 'constancia_situacion_fiscal'],
  ['constancia', 'constancia_situacion_fiscal'],
  ['identificación', 'ine'],
  ['identificacion', 'ine'],
  ['credencial', 'ine'],
]

function getTipoEsperado(doc) {
  const texto = (doc.nombre + ' ' + (doc.tipo || '')).toLowerCase()
  for (const [clave, tipo] of TIPO_MAP) {
    if (texto.includes(clave)) return tipo
  }
  return doc.tipo || 'ine'
}

const MIME_VALIDOS = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']

const INSTRUCCIONES_ENTREGA = {
  solicitud_beca: 'Imprime, firma y sube al portal becasbenitojuarez.sep.gob.mx o entrégala en tu plantel.',
  declaracion_joven: 'Imprime, firma y preséntate a registrarte en jovenesconstruyendo.sep.gob.mx.',
  solicitud_empleo_temporal: 'Imprime y preséntalo en la oficina STPS o presidencia municipal de tu municipio.',
  declaracion_jefatura: 'Imprime, firma ante dos testigos y preséntala en el módulo DIF municipal.',
}

const CAMPOS_EXTRA = {
  solicitud_beca: [
    { key: 'plantel', label: 'Nombre del plantel educativo', placeholder: 'Ej. COBACH Plantel 5', type: 'text' },
  ],
  declaracion_jefatura: [
    { key: 'num_hijos', label: 'Número de hijos menores de 18 años', placeholder: 'Ej. 3', type: 'number', min: 1 },
  ],
}

export default function Tramite() {
  const { id } = useParams()
  const { currentUser } = useAuth()
  const { perfilUsuario } = useApp()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [tramite, setTramite] = useState(null)
  const [checklist, setChecklist] = useState({})
  const [modalDoc, setModalDoc] = useState(null)
  // Grupo B state
  const [formDatos, setFormDatos] = useState({})
  const [generando, setGenerando] = useState(false)
  const [archivoGenerado, setArchivoGenerado] = useState(null)
  const [errorGeneracion, setErrorGeneracion] = useState(null)

  const sesionId = `${currentUser?.uid || 'anon'}-tramite-${id}`

  useEffect(() => {
    const cargar = async () => {
      try {
        setLoading(true)
        const response = await obtenerTramite(id)
        const data = response.data
        setTramite(data)
        const inicial = {}
        data.documentos_requeridos?.forEach((doc) => {
          inicial[doc.id] = { listo: false, validado: false, resultado: null }
        })
        setChecklist(inicial)
        setFormDatos({
          nombre: currentUser?.displayName || '',
          municipio: perfilUsuario?.municipio || '',
          curp: '',
          clabe: '',
        })
      } catch {
        setError('No se pudo cargar el trámite')
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [id])

  const marcarManual = (docId) =>
    setChecklist((prev) => ({
      ...prev,
      [docId]: { ...prev[docId], listo: !prev[docId].listo },
    }))

  const guardarResultado = (docId, resultado) =>
    setChecklist((prev) => ({
      ...prev,
      [docId]: { listo: resultado.es_correcto, validado: true, resultado },
    }))

  const handleFormChange = (key, value) =>
    setFormDatos((prev) => ({ ...prev, [key]: value }))

  const handleGenerar = async (e) => {
    e.preventDefault()
    setGenerando(true)
    setErrorGeneracion(null)
    setArchivoGenerado(null)
    try {
      const res = await generarDocumento(tramite.tipo_documento_generado, formDatos)
      setArchivoGenerado(res.data.file_name || res.data.archivo || res.data.filename)
    } catch (err) {
      setErrorGeneracion(err.response?.data?.error || 'Error al generar el documento. Intenta de nuevo.')
    } finally {
      setGenerando(false)
    }
  }

  const handleDescargar = async () => {
    if (!archivoGenerado) return
    try {
      const res = await descargarDocumento(archivoGenerado)
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
      const a = document.createElement('a')
      a.href = url
      a.download = archivoGenerado
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch {
      setErrorGeneracion('No se pudo descargar el documento. Intenta de nuevo.')
    }
  }

  const completados = Object.values(checklist).filter((v) => v.listo).length
  const total = tramite?.documentos_requeridos?.length || 0
  const porcentaje = total > 0 ? Math.round((completados / total) * 100) : 0

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="inline-block w-8 h-8 border-4 border-gray-200 rounded-full animate-spin mb-4"
          style={{ borderTopColor: '#410016' }} />
        <p className="text-gray-600">Cargando información del trámite...</p>
      </div>
    )
  }

  if (error || !tramite) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-xl text-red-600 mb-4">{error || 'Programa no encontrado'}</p>
        <Link to="/" className="text-blue-600 hover:underline">← Volver al inicio</Link>
      </div>
    )
  }

  const esGrupoB = tramite.grupo === 'B'

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      {/* Breadcrumb */}
      <nav className="mb-6 text-gray-600 text-sm">
        <Link to="/" className="hover:text-gray-900">Inicio</Link>
        <span className="mx-2">›</span>
        <span className="text-gray-800">{tramite.nombre}</span>
      </nav>

      {/* Encabezado */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold text-gray-900">{tramite.nombre}</h1>
          {!esGrupoB && (
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
              Trámite presencial
            </span>
          )}
          {esGrupoB && (
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
              Documento digital
            </span>
          )}
        </div>
        <p className="text-gray-600">{tramite.descripcion}</p>
      </div>

      {/* Info del programa */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <p className="text-sm text-gray-500 mb-1">Monto</p>
          <p className="text-2xl font-bold text-green-700">{tramite.monto}</p>
          <p className="text-sm text-gray-500">{tramite.periodicidad}</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
          <p className="text-sm text-gray-500 mb-1">Dependencia</p>
          <p className="font-semibold text-blue-800 text-sm">{tramite.dependencia}</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-center">
          <p className="text-sm text-gray-500 mb-1">Modalidad</p>
          <p className="font-semibold text-purple-800 capitalize">{tramite.modalidad}</p>
          {tramite.url_oficial && (
            <a href={tramite.url_oficial} target="_blank" rel="noopener noreferrer"
              className="text-xs text-purple-600 hover:underline">Sitio oficial →</a>
          )}
        </div>
      </div>

      {/* Grupo A — banner de módulo presencial */}
      {!esGrupoB && tramite.modulo_atencion && (
        <GrupoABanner modulo={tramite.modulo_atencion} />
      )}

      {/* Checklist de documentos */}
      {tramite.documentos_requeridos?.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Documentos requeridos</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {esGrupoB
                  ? 'Valida los documentos con ✅ usando IA antes de generar tu solicitud'
                  : 'Verifica que tengas estos documentos listos para llevar al módulo'}
              </p>
            </div>
            <span className="text-sm font-bold px-3 py-1 rounded-full bg-rose-50 text-[#410016]">
              {completados}/{total}
            </span>
          </div>

          <div className="mb-5">
            <div className="w-full bg-gray-100 rounded-full h-2.5">
              <div
                className="h-2.5 rounded-full transition-all duration-700"
                style={{ width: `${porcentaje}%`, background: 'linear-gradient(to right, #410016, #7a0028)' }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1 text-right">{porcentaje}% completado</p>
          </div>

          <div className="space-y-3">
            {tramite.documentos_requeridos.map((doc) => {
              const estado = checklist[doc.id] || { listo: false, validado: false, resultado: null }
              return (
                <DocRow
                  key={doc.id}
                  doc={doc}
                  estado={estado}
                  onMarcar={() => marcarManual(doc.id)}
                  onValidar={doc.validable_ocr ? () => setModalDoc(doc) : null}
                />
              )
            })}
          </div>

          {completados === total && total > 0 && (
            <div className="mt-5 p-4 rounded-xl text-center font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200">
              {esGrupoB
                ? '¡Tienes todos los documentos listos! Ahora genera tu solicitud abajo.'
                : '¡Tienes todos los documentos listos! Dirígete al módulo para completar tu trámite.'}
            </div>
          )}
        </div>
      )}

      {/* Grupo B — generación de documento PDF */}
      {esGrupoB && tramite.tipo_documento_generado && (
        <GeneracionDocumentoPanel
          tipoDocumento={tramite.tipo_documento_generado}
          formDatos={formDatos}
          onChange={handleFormChange}
          onGenerar={handleGenerar}
          generando={generando}
          archivoGenerado={archivoGenerado}
          onDescargar={handleDescargar}
          onReset={() => setArchivoGenerado(null)}
          errorGeneracion={errorGeneracion}
        />
      )}

      {/* Requisitos de elegibilidad */}
      {tramite.requisitos && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Requisitos de elegibilidad</h2>
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            {tramite.requisitos.edad_minima && (
              <div className="flex gap-2 text-gray-700">
                <span className="font-semibold">Edad mínima:</span>
                <span>{tramite.requisitos.edad_minima} años</span>
              </div>
            )}
            {tramite.requisitos.edad_maxima && (
              <div className="flex gap-2 text-gray-700">
                <span className="font-semibold">Edad máxima:</span>
                <span>{tramite.requisitos.edad_maxima} años</span>
              </div>
            )}
            {tramite.requisitos.nivel_ingreso && (
              <div className="flex gap-2 text-gray-700">
                <span className="font-semibold">Nivel de ingreso:</span>
                <span className="capitalize">{tramite.requisitos.nivel_ingreso}</span>
              </div>
            )}
            {tramite.requisitos.municipios_rurales && (
              <div className="flex gap-2 text-gray-700">
                <span className="font-semibold">Zona:</span>
                <span>Municipios rurales</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Acciones */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link to="/"
          className="flex-1 bg-gray-100 text-gray-800 px-6 py-3 rounded-xl text-center font-semibold hover:bg-gray-200 transition-all">
          ← Volver al inicio
        </Link>
        <Link to="/chat"
          className="flex-1 text-white px-6 py-3 rounded-xl text-center font-semibold transition-all"
          style={{ background: 'linear-gradient(to right, #410016, #5a0020)' }}>
          Preguntar al asistente
        </Link>
        <button onClick={() => window.print()}
          className="flex-1 bg-gray-800 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-900 transition-all">
          Imprimir guía
        </button>
      </div>

      {/* Modal OCR */}
      {modalDoc && (
        <ValidacionModal
          doc={modalDoc}
          sesionId={sesionId}
          onClose={() => setModalDoc(null)}
          onResultado={(resultado) => {
            guardarResultado(modalDoc.id, resultado)
            setModalDoc(null)
          }}
        />
      )}
    </div>
  )
}

// ─── GrupoABanner ─────────────────────────────────────────────────────────────

function GrupoABanner({ modulo }) {
  return (
    <div className="mb-8 rounded-2xl border border-amber-200 overflow-hidden">
      <div className="bg-amber-50 px-6 py-5 flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <div>
          <h3 className="font-bold text-amber-900 mb-1">Este trámite requiere presencia física</h3>
          <p className="text-sm text-amber-800">
            Deberás acudir personalmente al módulo de atención con todos tus documentos. No se puede completar en línea.
          </p>
          <div className="mt-3 inline-flex items-center gap-2 bg-white border border-amber-300 rounded-lg px-4 py-2">
            <svg className="w-4 h-4 text-amber-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd"
                d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 01-1.581.814L10 14.468l-4.419 2.346A1 1 0 014 16V4z"
                clipRule="evenodd" />
            </svg>
            <span className="text-sm font-semibold text-amber-900">{modulo}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── GeneracionDocumentoPanel ─────────────────────────────────────────────────

function GeneracionDocumentoPanel({
  tipoDocumento, formDatos, onChange, onGenerar,
  generando, archivoGenerado, onDescargar, onReset, errorGeneracion,
}) {
  const instrucciones = INSTRUCCIONES_ENTREGA[tipoDocumento]
  const camposExtra = CAMPOS_EXTRA[tipoDocumento] || []

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #410016, #7a0028)' }}>
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Generar documento de solicitud</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            ACIPS pre-llena el documento con tus datos para que solo lo imprimas y firmes
          </p>
        </div>
      </div>

      {instrucciones && (
        <div className="mb-5 p-4 rounded-xl bg-blue-50 border border-blue-200 flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-blue-800">
            <span className="font-bold">¿Qué hago después?</span> {instrucciones}
          </p>
        </div>
      )}

      {archivoGenerado ? (
        <div className="flex flex-col items-center gap-4 py-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="text-center">
            <p className="font-bold text-emerald-800 text-lg">¡Documento generado!</p>
            <p className="text-sm text-gray-500 mt-1">Tu solicitud ha sido pre-llenada y está lista para descargar</p>
          </div>

          {errorGeneracion && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl w-full max-w-sm">
              <svg className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-xs text-red-700 font-medium">{errorGeneracion}</p>
            </div>
          )}

          <button
            onClick={onDescargar}
            className="flex items-center gap-2 px-8 py-3 rounded-xl text-white font-bold transition-all hover:opacity-90 hover:shadow-lg"
            style={{ background: 'linear-gradient(to right, #410016, #7a0028)' }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Descargar PDF
          </button>
          <button onClick={onReset} className="text-sm text-gray-400 hover:text-gray-600 underline">
            Generar de nuevo con otros datos
          </button>
        </div>
      ) : (
        <form onSubmit={onGenerar} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Nombre completo</label>
              <input
                type="text"
                value={formDatos.nombre || ''}
                onChange={(e) => onChange('nombre', e.target.value)}
                placeholder="Como aparece en tu CURP"
                required
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-[#410016] focus:outline-none text-sm transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">CURP</label>
              <input
                type="text"
                value={formDatos.curp || ''}
                onChange={(e) => onChange('curp', e.target.value.toUpperCase())}
                placeholder="18 caracteres"
                maxLength={18}
                required
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-[#410016] focus:outline-none text-sm transition-colors font-mono tracking-widest"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Municipio</label>
              <input
                type="text"
                value={formDatos.municipio || ''}
                onChange={(e) => onChange('municipio', e.target.value)}
                placeholder="Ej. Xalapa"
                required
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-[#410016] focus:outline-none text-sm transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">CLABE interbancaria</label>
              <input
                type="text"
                value={formDatos.clabe || ''}
                onChange={(e) => onChange('clabe', e.target.value.replace(/\D/g, ''))}
                placeholder="18 dígitos"
                maxLength={18}
                required
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-[#410016] focus:outline-none text-sm transition-colors font-mono tracking-widest"
              />
            </div>

            {camposExtra.map((campo) => (
              <div key={campo.key}>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">{campo.label}</label>
                <input
                  type={campo.type || 'text'}
                  min={campo.min}
                  value={formDatos[campo.key] || ''}
                  onChange={(e) => onChange(campo.key, e.target.value)}
                  placeholder={campo.placeholder}
                  required
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-[#410016] focus:outline-none text-sm transition-colors"
                />
              </div>
            ))}
          </div>

          {errorGeneracion && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
              <svg className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-xs text-red-700 font-medium">{errorGeneracion}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={generando}
            className="w-full py-3.5 rounded-xl text-white font-bold transition-all disabled:opacity-50 hover:opacity-90 hover:shadow-lg flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(to right, #410016, #7a0028)' }}
          >
            {generando ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Generando documento...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Generar documento PDF
              </>
            )}
          </button>
        </form>
      )}
    </div>
  )
}

// ─── DocRow ──────────────────────────────────────────────────────────────────

function DocRow({ doc, estado, onMarcar, onValidar }) {
  const { listo, validado, resultado } = estado

  let borderColor = 'border-gray-200'
  let bgColor = 'bg-gray-50'
  if (validado && listo) { borderColor = 'border-emerald-400'; bgColor = 'bg-emerald-50' }
  else if (validado && !listo) { borderColor = 'border-red-300'; bgColor = 'bg-red-50' }
  else if (listo) { borderColor = 'border-blue-300'; bgColor = 'bg-blue-50' }

  return (
    <div className={`rounded-xl border-2 ${borderColor} ${bgColor} transition-all duration-300`}>
      <div className="flex items-center gap-3 p-3">
        <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold ${
          validado && listo ? 'bg-emerald-500 text-white'
          : validado && !listo ? 'bg-red-500 text-white'
          : listo ? 'bg-blue-500 text-white'
          : 'border-2 border-gray-300 bg-white'
        }`}>
          {validado && listo && '✓'}
          {validado && !listo && '✗'}
          {!validado && listo && '✓'}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-800 text-sm">{doc.nombre}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-gray-400 capitalize">{doc.tipo}</span>
            {doc.validable_ocr && (
              <span className="text-xs text-[#410016] font-bold">✅ validable</span>
            )}
            {validado && (
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                listo ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
              }`}>
                {listo ? 'Validado por IA' : 'No válido'}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {onValidar && (
            <button
              onClick={onValidar}
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg text-white transition-all hover:opacity-90 hover:shadow-md"
              style={{ background: 'linear-gradient(to right, #410016, #7a0028)' }}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Validar IA
            </button>
          )}
          <button
            onClick={onMarcar}
            className={`text-xs font-bold px-3 py-1.5 rounded-lg border-2 transition-all ${
              listo && !validado
                ? 'border-blue-400 bg-blue-100 text-blue-700'
                : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400'
            }`}
          >
            {listo && !validado ? 'Lo tengo ✓' : 'Marcar'}
          </button>
        </div>
      </div>

      {validado && resultado && (
        <ResultadoOCR resultado={resultado} />
      )}
    </div>
  )
}

// ─── ResultadoOCR ─────────────────────────────────────────────────────────────

function ResultadoOCR({ resultado }) {
  const { es_correcto, legible, vigente, tipo_detectado, observacion,
    campos_faltantes, causas_rechazo, mensaje_correccion,
    ocr_confidence_avg, classification_confidence } = resultado

  return (
    <div className={`mx-3 mb-3 rounded-xl p-4 border ${
      es_correcto ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`text-lg ${es_correcto ? 'text-emerald-600' : 'text-red-600'}`}>
            {es_correcto ? '✅' : '❌'}
          </span>
          <div>
            <p className={`font-bold text-sm ${es_correcto ? 'text-emerald-800' : 'text-red-800'}`}>
              {es_correcto ? 'Documento válido' : 'Documento no válido'}
            </p>
            {tipo_detectado && (
              <p className="text-xs text-gray-500 capitalize">
                Detectado: {tipo_detectado.replace(/_/g, ' ')}
              </p>
            )}
          </div>
        </div>
        <div className="text-right">
          {classification_confidence != null && (
            <div className="text-xs text-gray-500">
              Confianza: <span className="font-bold text-gray-700">
                {Math.round(classification_confidence * 100)}%
              </span>
            </div>
          )}
          {ocr_confidence_avg != null && (
            <div className="text-xs text-gray-500">
              OCR: <span className="font-bold text-gray-700">
                {Math.round(ocr_confidence_avg * 100)}%
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        <Badge label="Legible" ok={legible} />
        <Badge label="Vigente" ok={vigente} />
      </div>

      {observacion && (
        <p className="text-xs text-gray-600 mb-3 leading-relaxed">{observacion}</p>
      )}

      {campos_faltantes?.length > 0 && (
        <div className="mb-2">
          <p className="text-xs font-bold text-red-700 mb-1">Campos faltantes:</p>
          <ul className="text-xs text-red-600 space-y-0.5">
            {campos_faltantes.map((c, i) => <li key={i}>• {c}</li>)}
          </ul>
        </div>
      )}

      {causas_rechazo?.length > 0 && (
        <div className="mb-2">
          <p className="text-xs font-bold text-red-700 mb-1">Causas de rechazo:</p>
          <ul className="text-xs text-red-600 space-y-0.5">
            {causas_rechazo.map((c, i) => <li key={i}>• {c}</li>)}
          </ul>
        </div>
      )}

      {mensaje_correccion && (
        <div className="mt-2 p-2.5 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-xs font-bold text-amber-700 mb-0.5">Cómo corregirlo:</p>
          <p className="text-xs text-amber-700">{mensaje_correccion}</p>
        </div>
      )}
    </div>
  )
}

function Badge({ label, ok }) {
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
      ok == null ? 'bg-gray-100 text-gray-500'
      : ok ? 'bg-emerald-100 text-emerald-700'
      : 'bg-red-100 text-red-700'
    }`}>
      {ok == null ? label : ok ? `${label} ✓` : `${label} ✗`}
    </span>
  )
}

// ─── ValidacionModal ──────────────────────────────────────────────────────────

function ValidacionModal({ doc, sesionId, onClose, onResultado }) {
  const [archivo, setArchivo] = useState(null)
  const [arrastrando, setArrastrando] = useState(false)
  const [validando, setValidando] = useState(false)
  const [errorLocal, setErrorLocal] = useState(null)
  const inputRef = useRef()

  const tipoEsperado = getTipoEsperado(doc)

  const procesarArchivo = (file) => {
    setErrorLocal(null)
    if (!MIME_VALIDOS.includes(file.type)) {
      setErrorLocal('Formato no válido. Usa PDF, JPG o PNG.')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorLocal('El archivo supera 10 MB.')
      return
    }
    setArchivo(file)
  }

  const onDrop = (e) => {
    e.preventDefault()
    setArrastrando(false)
    const file = e.dataTransfer.files[0]
    if (file) procesarArchivo(file)
  }

  const onFileChange = (e) => {
    const file = e.target.files[0]
    if (file) procesarArchivo(file)
  }

  const validar = async () => {
    if (!archivo) return
    setValidando(true)
    setErrorLocal(null)
    try {
      const base64 = await archivoABase64(archivo)
      const res = await validarDocumento({
        sesionId,
        requisitoId: doc.id,
        tipoEsperado,
        archivoBase64: base64,
        mimeType: archivo.type,
      })
      onResultado(res.data)
    } catch (err) {
      const status = err.response?.status
      if (status === 422) {
        setErrorLocal('No se pudo identificar el documento. Asegúrate de que sea legible y del tipo correcto.')
      } else if (status === 504) {
        setErrorLocal('El análisis tardó demasiado. Intenta con un archivo más pequeño.')
      } else {
        setErrorLocal(err.response?.data?.error || 'Error al validar. Verifica tu conexión.')
      }
    } finally {
      setValidando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fade-in-up">

        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h3 className="font-black text-gray-900">Validar documento</h3>
            <p className="text-sm text-gray-500 mt-0.5">{doc.nombre}</p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center gap-2 text-sm bg-rose-50 border border-rose-100 rounded-xl px-4 py-2.5">
            <svg className="w-4 h-4 text-[#410016] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-gray-700">
              Tipo esperado: <span className="font-bold text-[#410016] capitalize">{tipoEsperado.replace(/_/g, ' ')}</span>
            </span>
          </div>

          {!validando ? (
            <div
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setArrastrando(true) }}
              onDragLeave={() => setArrastrando(false)}
              onDrop={onDrop}
              className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                arrastrando ? 'border-[#410016] bg-rose-50 scale-[1.02]'
                : archivo ? 'border-emerald-400 bg-emerald-50'
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
              }`}
            >
              <input ref={inputRef} type="file" className="hidden"
                accept=".pdf,.jpg,.jpeg,.png" onChange={onFileChange} />

              {archivo ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="font-semibold text-emerald-700 text-sm truncate max-w-full px-4">{archivo.name}</p>
                  <p className="text-xs text-gray-400">{(archivo.size / 1024).toFixed(0)} KB — clic para cambiar</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-700 text-sm">Arrastra tu archivo aquí</p>
                    <p className="text-xs text-gray-400 mt-1">o haz clic para seleccionar</p>
                  </div>
                  <p className="text-xs text-gray-400">PDF, JPG, PNG · máx. 10 MB</p>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-xl border-2 p-8 text-center"
              style={{ borderColor: '#410016', backgroundColor: '#fff5f7' }}>
              <div className="flex flex-col items-center gap-4">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 rounded-full border-4 border-rose-100" />
                  <div className="absolute inset-0 rounded-full border-4 border-t-[#410016] animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-6 h-6 text-[#410016]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h16a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
                    </svg>
                  </div>
                </div>
                <div>
                  <p className="font-bold text-[#410016] text-sm">Analizando documento...</p>
                  <p className="text-xs text-gray-500 mt-1">Extracción OCR en proceso, puede tomar unos segundos</p>
                </div>
                <div className="flex gap-1.5">
                  {[0, 150, 300].map((d) => (
                    <span key={d} className="w-2 h-2 rounded-full bg-[#410016] animate-bounce"
                      style={{ animationDelay: `${d}ms` }} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {errorLocal && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
              <svg className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-xs text-red-700 font-medium">{errorLocal}</p>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button onClick={onClose} disabled={validando}
              className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-all disabled:opacity-50">
              Cancelar
            </button>
            <button
              onClick={validar}
              disabled={!archivo || validando}
              className="flex-1 py-3 rounded-xl text-white font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 hover:shadow-lg"
              style={{ background: 'linear-gradient(to right, #410016, #7a0028)' }}
            >
              {validando ? 'Analizando...' : 'Validar con IA'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
