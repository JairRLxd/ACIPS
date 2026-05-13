import { useState, useEffect, useRef } from 'react'
import { useParams, Link, useLocation } from 'react-router-dom'
import { obtenerTramite, validarDocumento, generarDocumento, descargarDocumento, crearTramiteVirtual, obtenerMisSolicitudes } from '../repositories/tramitesRepository'
import { archivoABase64 } from '../utils/fileUtils'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'
import { obtenerWalletParaPrograma } from '../repositories/walletRepository'

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
  declaracion_no_trabajo: 'Imprime, firma y preséntate a registrarte en jovenesconstruyendo.sep.gob.mx.',
  solicitud_empleo_temporal: 'Imprime y preséntalo en la oficina STPS o presidencia municipal de tu municipio.',
  declaracion_jefatura_hogar: 'Imprime, firma ante dos testigos y preséntala en el modulo DIF municipal.',
}

const CAMPOS_EXTRA = {
  solicitud_beca: [
    { key: 'plantel', label: 'Nombre del plantel educativo', placeholder: 'Ej. COBACH Plantel 5', type: 'text' },
  ],
  declaracion_jefatura_hogar: [
    { key: 'num_hijos', label: 'Número de hijos menores de 18 años', placeholder: 'Ej. 3', type: 'number', min: 1 },
  ],
}

const VALIDACION_TTL_MS = 1000 * 60 * 60 * 24 * 30
const FIELD_LABELS = {
  nombre: 'Nombre(s)',
  primer_apellido: 'Primer apellido',
  segundo_apellido: 'Segundo apellido',
  curp: 'CURP',
  clave_elector: 'Clave de elector',
  vigencia: 'Vigencia',
  domicilio: 'Domicilio',
  fecha_nacimiento: 'Fecha de nacimiento',
  fecha_registro: 'Fecha de registro',
  sexo: 'Sexo',
  lugar_nacimiento: 'Lugar de nacimiento',
  rfc: 'RFC',
  folio: 'Folio',
  certificacion: 'Certificación',
  entidad_registro: 'Entidad de registro',
  municipio_registro: 'Municipio de registro',
  oficialia: 'Oficialía',
  libro: 'Libro',
  numero_acta: 'Número de acta',
  municipio: 'Municipio',
  codigo_postal: 'Código postal',
  titular: 'Titular',
  fecha_emision: 'Fecha de emisión',
  periodo_facturado: 'Periodo facturado',
  emisor: 'Emisor',
  sat: 'SAT',
  cedula_fiscal: 'Cédula fiscal',
  plantel: 'Plantel',
  ciclo_escolar: 'Ciclo escolar',
  inscripcion: 'Inscripción',
  fecha_vencimiento: 'Fecha de vencimiento',
  nacionalidad: 'Nacionalidad',
  numero_pasaporte: 'Número de pasaporte',
  categoria: 'Categoría',
  numero_licencia: 'Número de licencia',
  diagnostico: 'Diagnóstico',
  institucion: 'Institución',
  fecha: 'Fecha',
  banco: 'Banco',
  clabe: 'CLABE',
  cuenta: 'Cuenta',
  propietario: 'Propietario',
  predio: 'Predio',
  autoridad: 'Autoridad',
  parcela: 'Parcela',
  ejido: 'Ejido',
  comunidad: 'Comunidad',
  numero_servicio: 'Número de servicio',
}

const EXPECTED_FIELDS_BY_TYPE = {
  curp: ['curp', 'nombre'],
  ine: ['nombre', 'curp', 'clave_elector', 'vigencia'],
  acta_certificada: [
    'nombre',
    'primer_apellido',
    'segundo_apellido',
    'sexo',
    'fecha_nacimiento',
    'lugar_nacimiento',
    'fecha_registro',
    'entidad_registro',
    'municipio_registro',
    'oficialia',
    'libro',
    'numero_acta',
    'folio',
    'certificacion',
  ],
  comprobante_domicilio: ['titular', 'domicilio', 'codigo_postal', 'periodo_facturado', 'emisor'],
  constancia_situacion_fiscal: ['rfc', 'nombre', 'sat', 'cedula_fiscal'],
  constancia_estudios: ['nombre', 'plantel', 'ciclo_escolar', 'inscripcion'],
  pasaporte: ['nombre', 'fecha_nacimiento', 'fecha_vencimiento', 'nacionalidad'],
  licencia_conducir: ['nombre', 'fecha_vencimiento', 'categoria'],
  certificado_discapacidad: ['nombre', 'diagnostico', 'institucion', 'fecha'],
  estado_cuenta: ['nombre', 'banco', 'clabe', 'cuenta'],
  escritura_o_posesion: ['propietario', 'predio', 'folio', 'autoridad'],
  constancia_posesion_tierra: ['nombre', 'parcela', 'ejido', 'autoridad'],
  constancia_comunidad_indigena: ['nombre', 'comunidad', 'autoridad', 'fecha'],
}

function getStorageKey(userId, tramiteId) {
  return `acips_tramite_docs_${userId || 'anon'}_${tramiteId}`
}

function normalizeChecklist(data, documentos = []) {
  const inicial = {}
  documentos.forEach((doc) => {
    const previo = data?.[doc.id]
    inicial[doc.id] = {
      listo: Boolean(previo?.listo),
      validado: Boolean(previo?.validado),
      resultado: previo?.resultado || null,
      updatedAt: previo?.updatedAt || null,
      archivoNombre: previo?.archivoNombre || null,
    }
  })
  return inicial
}

function isEstadoVigente(estado) {
  if (!estado?.updatedAt) return false
  return Date.now() - estado.updatedAt < VALIDACION_TTL_MS
}

function getGuideSteps(tramite) {
  const requisitos = tramite.requisitos_elegibilidad || {}
  const steps = []
  const flujo = resolveFlujo(tramite)

  steps.push('Revisa si cumples con el perfil solicitado y prepara tus datos personales.')
  if (tramite.documentos_requeridos?.length) {
    steps.push(`Reúne los ${tramite.documentos_requeridos.length} documentos requeridos para este trámite.`)
  }
  if (flujo === 'admin_virtual') {
    steps.push('Sube y valida tus documentos en ACIPS para confirmar que sean legibles, vigentes y correctos.')
    if (tramite.tipo_documento_generado) {
      steps.push('Genera tu documento de solicitud con tus datos ya verificados.')
    }
    steps.push('Envía tu expediente para revisión administrativa desde la plataforma.')
    if (tramite.url_destino) {
      steps.push(`Entrega o registra tu solicitud en: ${tramite.url_destino}.`)
    }
  } else {
    if (tramite.modulo_atencion) {
      steps.push(`Acude al módulo indicado: ${tramite.modulo_atencion}`)
    } else {
      steps.push('Acude al módulo o dependencia correspondiente con tus documentos.')
    }
    steps.push('Presenta tus documentos para revisión y sigue las indicaciones del personal de atención.')
  }

  if (requisitos.municipios_rurales) {
    steps.push('Este trámite prioriza zonas rurales, así que pueden solicitar verificación de domicilio o actividad local.')
  }

  return steps
}

function crearMensajeSoporte(tramite, docNombre, motivo) {
  return `Tuve un problema al subir o validar el documento "${docNombre}" para el trámite "${tramite.nombre}". Error detectado: ${motivo}. ¿Me puedes explicar cómo corregirlo y qué revisar antes de volver a subirlo?`
}

function getFriendlyValidationError(error) {
  const status = error.response?.status
  const backendMessage = error.response?.data?.error || ''

  if (status === 422) {
    return 'No se pudo identificar el documento. Asegúrate de que sea legible, completo y del tipo correcto.'
  }

  if (status === 504) {
    return 'El análisis tardó demasiado. Intenta con un archivo más pequeño o una imagen más clara.'
  }

  if (
    backendMessage.includes('readtext_locked') ||
    backendMessage.includes('canvas_size') ||
    backendMessage.includes('OCR configured') ||
    backendMessage.includes('OCR')
  ) {
    return 'No fue posible verificar el documento en este momento. Intenta de nuevo en unos minutos o abre el chat para recibir ayuda.'
  }

  return backendMessage || 'Error al validar. Verifica tu conexión e intenta nuevamente.'
}

function getExpectedFieldKeys(tipoEsperado, validationResponse = null) {
  const canonical = EXPECTED_FIELDS_BY_TYPE[tipoEsperado] || ['nombre', 'curp']
  if (!validationResponse) return canonical

  const expected = Array.isArray(validationResponse.campos_esperados)
    ? validationResponse.campos_esperados
    : []
  const extracted = validationResponse.datos_extraidos || {}

  // Campos extra del backend que no están en el canónico solo se muestran
  // si tienen un valor real extraído — evita mostrar campos vacíos heredados
  const extras = [...new Set([...expected, ...Object.keys(extracted)])].filter(
    f => !canonical.includes(f) && extracted[f]
  )
  return [...canonical, ...extras]
}

function buildEditableData(tipoEsperado, validationResponse = null) {
  const keys = getExpectedFieldKeys(tipoEsperado, validationResponse)
  const extracted = validationResponse?.datos_extraidos || {}
  return keys.reduce((acc, key) => {
    acc[key] = extracted[key] ?? ''
    return acc
  }, {})
}

function formatTipoDocumento(tipo) {
  if (!tipo) return ''
  return tipo.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

function normalizeConfidence(value) {
  if (value == null || Number.isNaN(Number(value))) return null
  const numeric = Number(value)
  return numeric <= 1 ? Math.round(numeric * 100) : Math.round(numeric)
}

function resolveFlujo(tramite) {
  return tramite?.flujo === 'admin_virtual' ? 'admin_virtual' : 'solo_guia'
}

function isAdminVirtualFlow(tramite) {
  return resolveFlujo(tramite) === 'admin_virtual'
}

function isSoloGuiaFlow(tramite) {
  return resolveFlujo(tramite) === 'solo_guia'
}

function canUseOCR(documento) {
  return documento?.validable_ocr === true
}

function mapEstadoSolicitudPayload(documentos = [], checklist = {}) {
  return documentos.map((doc) => {
    const estado = checklist[doc.id] || {}
    return {
      requisito_id: doc.id,
      tipo_esperado: getTipoEsperado(doc),
      tipo_detectado: estado.resultado?.tipo_detectado || null,
      es_correcto: estado.resultado?.es_correcto === true,
      observacion: estado.resultado?.observacion || estado.resultado?.mensaje_correccion || '',
      datos_extraidos: estado.resultado?.datos_extraidos || estado.resultado?.datos_corregidos || {},
      archivo_base64_preview: estado.resultado?.archivo_base64_preview || null,
      archivo_nombre: estado.archivoNombre || null,
      es_pdf: estado.resultado?.es_pdf || false,
    }
  })
}

async function resizeToThumbnailBase64(file, maxDim = 200) {
  if (!file || !file.type.startsWith('image/')) return null
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        try {
          const ratio = Math.min(maxDim / img.width, maxDim / img.height, 1)
          const w = Math.round(img.width * ratio)
          const h = Math.round(img.height * ratio)
          const canvas = document.createElement('canvas')
          canvas.width = w
          canvas.height = h
          canvas.getContext('2d').drawImage(img, 0, 0, w, h)
          resolve(canvas.toDataURL('image/jpeg', 0.65).split(',')[1])
        } catch {
          resolve(null)
        }
      }
      img.onerror = () => resolve(null)
      img.src = e.target.result
    }
    reader.onerror = () => resolve(null)
    reader.readAsDataURL(file)
  })
}

export default function Tramite() {
  const { id } = useParams()
  const location = useLocation()
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
  const [supportMessage, setSupportMessage] = useState(null)
  const [enviandoSolicitud, setEnviandoSolicitud] = useState(false)
  const [errorSolicitud, setErrorSolicitud] = useState(null)
  const [solicitudExitosa, setSolicitudExitosa] = useState(null)
  const [expedienteActual, setExpedienteActual] = useState(null)
  const [walletParaPrograma, setWalletParaPrograma] = useState(null)

  const sesionId = `${currentUser?.uid || 'anon'}-tramite-${id}`

  useEffect(() => {
    const cargar = async () => {
      try {
        setLoading(true)
        const response = await obtenerTramite(id)
        const data = response.data
        setTramite(data)
        const storageKey = getStorageKey(currentUser?.uid, id)
        let inicial = normalizeChecklist(null, data.documentos_requeridos || [])
        try {
          const guardadoRaw = localStorage.getItem(storageKey)
          if (guardadoRaw) {
            const guardado = JSON.parse(guardadoRaw)
            inicial = normalizeChecklist(guardado?.checklist, data.documentos_requeridos || [])
            Object.keys(inicial).forEach((docId) => {
              if (!isEstadoVigente(inicial[docId])) {
                inicial[docId] = {
                  listo: false,
                  validado: false,
                  resultado: null,
                  updatedAt: null,
                  archivoNombre: null,
                }
              }
            })
          }
        } catch (error) {
          console.error('Error al cargar documentos guardados:', error)
        }
        // Pre-llenar desde wallet si hay documentos reutilizables disponibles
        if (currentUser) {
          try {
            const walletRes = await obtenerWalletParaPrograma(data.id)
            const walletData = walletRes.data
            setWalletParaPrograma(walletData)
            walletData?.documentos_requeridos?.forEach((req) => {
              if (req.wallet_disponible && req.wallet_documento) {
                const wd = req.wallet_documento
                if (inicial[req.requisito_id] && !inicial[req.requisito_id].validado) {
                  inicial[req.requisito_id] = {
                    listo: true,
                    validado: true,
                    resultado: {
                      es_correcto: wd.es_correcto,
                      legible: true,
                      vigente: wd.vigente,
                      requiere_revision: false,
                      tipo_detectado: wd.tipo_detectado,
                      observacion: wd.observacion || 'Documento reutilizado desde tu wallet documental.',
                      errores_detectados: [],
                      campos_faltantes: [],
                      causas_rechazo: [],
                      mensaje_correccion: '',
                      datos_extraidos: wd.datos_extraidos || {},
                      senales_detectadas: [],
                      causas_revision_manual: [],
                    },
                    updatedAt: Date.now(),
                    archivoNombre: `[wallet] ${wd.nombre_documento}`,
                    desdeWallet: true,
                  }
                }
              }
            })
          } catch {
            // silencioso — el wallet es opcional
          }
        }

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
  }, [id, currentUser?.uid, currentUser?.displayName, perfilUsuario?.municipio])

  useEffect(() => {
    if (!tramite) return
    try {
      localStorage.setItem(
        getStorageKey(currentUser?.uid, id),
        JSON.stringify({ checklist })
      )
    } catch (error) {
      console.error('Error al guardar documentos del trámite:', error)
    }
  }, [checklist, currentUser?.uid, id, tramite])

  useEffect(() => {
    const cargarExpediente = async () => {
      if (!currentUser || !tramite) return
      if (!isAdminVirtualFlow(tramite)) return
      try {
        const response = await obtenerMisSolicitudes()
        const solicitudes = response.data?.tramites_virtuales || []
        const expediente = solicitudes.find((item) => Number(item.programa_id) === Number(tramite.id))
        setExpedienteActual(expediente || null)
      } catch (err) {
        console.error('No se pudo cargar el historial del expediente:', err)
      }
    }

    cargarExpediente()
  }, [currentUser, tramite])

  useEffect(() => {
    const cargarWallet = async () => {
      if (!currentUser || !tramite) return
      try {
        const res = await obtenerWalletParaPrograma(tramite.id)
        setWalletParaPrograma(res.data)
      } catch {
        // silencioso — el wallet es opcional
      }
    }
    cargarWallet()
  }, [currentUser, tramite])

  const marcarManual = (docId) =>
    setChecklist((prev) => ({
      ...prev,
      [docId]: {
        ...prev[docId],
        listo: !prev[docId].listo,
        updatedAt: Date.now(),
      },
    }))

  const guardarResultado = (docId, resultado, archivoNombre = null) => {
    const doc = tramite?.documentos_requeridos?.find((item) => item.id === docId)
    if (resultado && !resultado.es_correcto && doc) {
      setSupportMessage(
        crearMensajeSoporte(
          tramite,
          doc.nombre,
          resultado.mensaje_correccion || resultado.observacion || 'El documento no pasó la validación.'
        )
      )
    } else {
      setSupportMessage(null)
    }
    setChecklist((prev) => ({
      ...prev,
      [docId]: {
        listo: resultado.es_correcto,
        validado: true,
        resultado,
        updatedAt: Date.now(),
        archivoNombre,
      },
    }))
  }

  const handleFormChange = (key, value) =>
    setFormDatos((prev) => ({ ...prev, [key]: value }))

  const handleGenerar = async (e) => {
    e.preventDefault()
    if (completados !== total || total === 0) {
      setErrorGeneracion('Antes de generar el documento debes cargar y validar todos los documentos de este trámite.')
      return
    }
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

  const handleEnviarSolicitud = async () => {
    if (!tramite) return
    if (!currentUser) {
      setErrorSolicitud('Necesitas iniciar sesión para enviar tu solicitud a revisión.')
      return
    }
    if (!todoListo) {
      setErrorSolicitud('Antes de enviar, necesitas completar y validar todos los documentos requeridos.')
      return
    }

    setEnviandoSolicitud(true)
    setErrorSolicitud(null)
    setSolicitudExitosa(null)
    try {
      const documentos = mapEstadoSolicitudPayload(tramite.documentos_requeridos || [], checklist)
      const response = await crearTramiteVirtual({
        programaId: tramite.id,
        perfilUsuario: perfilUsuario || {},
        documentos,
        evaluacionPrevia: {
          flujo: resolveFlujo(tramite),
        },
      })

      const expediente =
        response.data?.tramite_virtual ||
        response.data?.expediente ||
        response.data?.expediente_id
          ? response.data
          : null

      setExpedienteActual(expediente)
      setSolicitudExitosa('Tu solicitud fue enviada correctamente a revisión administrativa.')
    } catch (err) {
      const raw = err.response?.data?.error
      const msg = typeof raw === 'string'
        ? raw
        : raw && typeof raw === 'object'
          ? Object.values(raw).flat().join(' ')
          : 'No se pudo enviar la solicitud. Intenta nuevamente.'
      setErrorSolicitud(msg)
    } finally {
      setEnviandoSolicitud(false)
    }
  }

  const completados = Object.values(checklist).filter((v) => v.listo).length
  const total = tramite?.documentos_requeridos?.length || 0
  const porcentaje = total > 0 ? Math.round((completados / total) * 100) : 0
  const todoListo = total > 0 && completados === total
  const guideSteps = tramite ? getGuideSteps(tramite) : []
  const pasoDocumentos = new URLSearchParams(location.search).get('paso') === 'documentos'
  const primerDocumentoPendiente = tramite?.documentos_requeridos?.find((doc) => {
    const estado = checklist[doc.id]
    return !estado?.listo
  }) || null

  const abrirChatConSoporte = () => {
    if (!supportMessage) return
    localStorage.setItem('acips_chat_prefill', supportMessage)
    window.location.href = '/chat'
  }

  const flujo = resolveFlujo(tramite)
  const esAdminVirtual = isAdminVirtualFlow(tramite)
  const esSoloGuia = isSoloGuiaFlow(tramite)

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
          {esSoloGuia && (
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
              Solo guía
            </span>
          )}
          {esAdminVirtual && (
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
              Trámite en línea con revisión
            </span>
          )}
          {tramite.tipo_documento_generado && (
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
              Genera: {formatTipoDocumento(tramite.tipo_documento_generado)}
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
      {esSoloGuia && tramite.modulo_atencion && (
        <GrupoABanner modulo={tramite.modulo_atencion} />
      )}

      {esAdminVirtual && (
        <div className={`bg-white rounded-2xl shadow-sm border p-6 mb-8 ${pasoDocumentos ? 'border-[#410016]' : 'border-gray-100'}`}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#410016] mb-2">
                Flujo del trámite
              </p>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {todoListo ? 'Paso 2: Generar documento' : 'Paso 1: Subir y validar documentos'}
              </h2>
              <p className="text-sm text-gray-600">
                {todoListo
                  ? 'Tus documentos de este trámite ya están listos. Ahora puedes llenar y generar tu documento.'
                  : 'Antes de generar el documento, necesitas cargar y validar exclusivamente los archivos requeridos para este trámite.'}
              </p>
            </div>

            {!todoListo && canUseOCR(primerDocumentoPendiente) && (
              <button
                onClick={() => setModalDoc(primerDocumentoPendiente)}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-white font-semibold transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(to right, #410016, #7a0028)' }}
              >
                Subir primer documento
              </button>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-3 mt-5">
            <div className={`rounded-xl border px-4 py-3 ${!todoListo ? 'border-[#410016] bg-rose-50' : 'border-gray-200 bg-gray-50'}`}>
              <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">Paso 1</p>
              <p className="font-semibold text-gray-900">Documentos del trámite</p>
              <p className="text-sm text-gray-600 mt-1">
                {completados}/{total} listos o validados.
              </p>
            </div>
            <div className={`rounded-xl border px-4 py-3 ${todoListo ? 'border-emerald-300 bg-emerald-50' : 'border-gray-200 bg-gray-50'}`}>
              <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">Paso 2</p>
              <p className="font-semibold text-gray-900">Generar documento</p>
              <p className="text-sm text-gray-600 mt-1">
                {todoListo ? 'Desbloqueado' : 'Se habilita al completar todos los documentos.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Guía del trámite */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #410016, #7a0028)' }}>
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Guía del trámite</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Sigue estos pasos para completar este programa correctamente.
            </p>
          </div>
        </div>
        <div className="space-y-3">
          {guideSteps.map((step, index) => (
            <div key={index} className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
              <div className="w-7 h-7 rounded-full text-white text-sm font-bold flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #410016, #7a0028)' }}>
                {index + 1}
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{step}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Checklist de documentos */}
      {tramite.documentos_requeridos?.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Documentos requeridos</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {esAdminVirtual
                  ? 'Valida los documentos con IA y prepara el expediente antes de enviarlo a revisión.'
                  : 'Revisa tus documentos y usa validación local si necesitas confirmar legibilidad o datos.'}
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
                  onValidar={canUseOCR(doc) ? () => setModalDoc(doc) : null}
                />
              )
            })}
          </div>

          {completados === total && total > 0 && (
            <div className="mt-5 p-4 rounded-xl text-center font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200">
              {esAdminVirtual
                ? '¡Tus documentos de este trámite ya quedaron cargados y validados! Ahora sí puedes avanzar con tu solicitud.'
                : '¡Tienes todos los documentos listos! Dirígete al módulo para completar tu trámite.'}
            </div>
          )}
        </div>
      )}

      {supportMessage && (
        <ChatbotSupportCard
          message={supportMessage}
          onOpenChat={abrirChatConSoporte}
        />
      )}

      {/* Estado del expediente ya enviado */}
      {esAdminVirtual && expedienteActual && (
        <ExpedienteStatusCard expediente={expedienteActual} />
      )}

      {/* Envío al admin — el admin es quien genera la constancia, no el ciudadano */}
      {esAdminVirtual && !expedienteActual && (
        <EnvioSolicitudPanel
          tipoDocumentoGenerado={tramite.tipo_documento_generado}
          requiereRevisionAdmin={tramite.requiere_revision_admin}
          todoListo={todoListo}
          enviando={enviandoSolicitud}
          error={errorSolicitud}
          success={solicitudExitosa}
          onEnviar={handleEnviarSolicitud}
        />
      )}

      {/* Requisitos de elegibilidad */}
      {tramite.requisitos_elegibilidad && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Requisitos de elegibilidad</h2>
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            {tramite.requisitos_elegibilidad.edad_minima != null && (
              <div className="flex gap-2 text-gray-700">
                <span className="font-semibold">Edad mínima:</span>
                <span>{tramite.requisitos_elegibilidad.edad_minima} años</span>
              </div>
            )}
            {tramite.requisitos_elegibilidad.edad_maxima != null && (
              <div className="flex gap-2 text-gray-700">
                <span className="font-semibold">Edad máxima:</span>
                <span>{tramite.requisitos_elegibilidad.edad_maxima} años</span>
              </div>
            )}
            {tramite.requisitos_elegibilidad.nivel_ingreso && (
              <div className="flex gap-2 text-gray-700">
                <span className="font-semibold">Nivel de ingreso:</span>
                <span className="capitalize">{tramite.requisitos_elegibilidad.nivel_ingreso}</span>
              </div>
            )}
            {tramite.requisitos_elegibilidad.municipios_rurales && (
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
          tramiteNombre={tramite.nombre}
          onResultado={(resultado, archivoNombre) => {
            guardarResultado(modalDoc.id, resultado, archivoNombre)
            setModalDoc(null)
          }}
          onErrorInfo={(message) => {
            setSupportMessage(crearMensajeSoporte(tramite, modalDoc.nombre, message))
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

function ExpedienteStatusCard({ expediente }) {
  const estado = expediente?.estado || 'pendiente'
  const tone = {
    pendiente: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    aprobado: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    rechazado: 'bg-red-50 border-red-200 text-red-800',
  }[estado] || 'bg-gray-50 border-gray-200 text-gray-800'

  return (
    <div className={`rounded-2xl border p-6 mb-8 ${tone}`}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] mb-2">Estado del expediente</p>
          <h2 className="text-2xl font-bold mb-1 capitalize">{estado}</h2>
          <p className="text-sm opacity-90">
            {expediente?.expediente_id ? `Expediente ${expediente.expediente_id}` : 'Ya existe una solicitud asociada a este programa.'}
          </p>
        </div>
        <div className="text-sm opacity-90">
          {expediente?.fecha_creacion && (
            <p>Enviado: {new Date(expediente.fecha_creacion).toLocaleDateString('es-MX')}</p>
          )}
        </div>
      </div>
    </div>
  )
}

function EnvioSolicitudPanel({
  tipoDocumentoGenerado,
  todoListo,
  enviando,
  error,
  success,
  onEnviar,
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Enviar solicitud al administrador</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Un administrador revisará tu expediente y emitirá tu {formatTipoDocumento(tipoDocumentoGenerado) || 'documento'}.
          </p>
        </div>
      </div>

      {/* Pasos del proceso */}
      <div className="flex items-center gap-2 mb-5 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold ${todoListo ? 'bg-emerald-500' : 'bg-gray-300'}`}>1</span>
          <span className={todoListo ? 'text-emerald-700 font-semibold' : ''}>Documentos validados</span>
        </div>
        <div className="flex-1 h-px bg-gray-200" />
        <div className="flex items-center gap-1.5">
          <span className="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center text-white text-xs font-bold">2</span>
          <span>Envío a revisión</span>
        </div>
        <div className="flex-1 h-px bg-gray-200" />
        <div className="flex items-center gap-1.5">
          <span className="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center text-white text-xs font-bold">3</span>
          <span>Admin emite {formatTipoDocumento(tipoDocumentoGenerado) || 'constancia'}</span>
        </div>
      </div>

      {!todoListo && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Valida todos los documentos requeridos para habilitar el envío.
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 font-semibold">
          {success} Puedes revisar el estado en <span className="underline">Mis solicitudes</span>.
        </div>
      )}

      {!success && (
        <button
          onClick={onEnviar}
          disabled={!todoListo || enviando}
          className="w-full py-3 rounded-xl text-white font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 flex items-center justify-center gap-2"
          style={{ background: 'linear-gradient(to right, #410016, #7a0028)' }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
          {enviando ? 'Enviando expediente...' : 'Enviar expediente a revisión'}
        </button>
      )}
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
            {estado.desdeWallet && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                Wallet ♻
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
          {!onValidar && (
            <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-gray-100 text-gray-500">
              Carga manual
            </span>
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

function sanitizarObservacion(texto) {
  if (!texto) return texto
  return texto
    .replace(/\bpymupdf[_\w]*/gi, '')
    .replace(/\bpaddleocr\b/gi, '')
    .replace(/\bocr\b/gi, '')
    .replace(/\bgroq\b/gi, '')
    .replace(/\bsobre archivo \w+\./gi, '')
    .replace(/usando [\w+]+/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

function ResultadoOCR({ resultado }) {
  const { es_correcto, legible, vigente, observacion,
    campos_faltantes, causas_rechazo, mensaje_correccion,
    datos_corregidos, datos_extraidos } = resultado
  const dataToShow = datos_corregidos || datos_extraidos || {}
  const obs = sanitizarObservacion(observacion)

  return (
    <div className={`mx-3 mb-3 rounded-xl p-4 border ${
      es_correcto ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'
    }`}>
      <div className="flex items-center gap-2 mb-3">
        <span className={`text-lg ${es_correcto ? 'text-emerald-600' : 'text-red-600'}`}>
          {es_correcto ? '✅' : '❌'}
        </span>
        <p className={`font-bold text-sm ${es_correcto ? 'text-emerald-800' : 'text-red-800'}`}>
          {es_correcto ? 'Documento aceptado' : 'Documento no aceptado'}
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        <Badge label="Legible" ok={legible} />
        <Badge label="Vigente" ok={vigente} />
      </div>

      {obs && (
        <p className="text-xs text-gray-600 mb-3 leading-relaxed">{obs}</p>
      )}

      {campos_faltantes?.length > 0 && (
        <div className="mb-2">
          <p className="text-xs font-bold text-red-700 mb-1">Información que falta:</p>
          <ul className="text-xs text-red-600 space-y-0.5">
            {campos_faltantes.map((c, i) => <li key={i}>• {FIELD_LABELS[c] || c}</li>)}
          </ul>
        </div>
      )}

      {causas_rechazo?.length > 0 && (
        <div className="mb-2">
          <p className="text-xs font-bold text-red-700 mb-1">Motivo:</p>
          <ul className="text-xs text-red-600 space-y-0.5">
            {causas_rechazo.map((c, i) => <li key={i}>• {c}</li>)}
          </ul>
        </div>
      )}

      {mensaje_correccion && (
        <div className="mt-2 p-2.5 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-xs font-bold text-amber-700 mb-0.5">¿Cómo mejorar el documento?</p>
          <p className="text-xs text-amber-700">{mensaje_correccion}</p>
        </div>
      )}

      {Object.keys(dataToShow).length > 0 && (
        <div className="mt-3 rounded-lg border border-gray-200 bg-white/80 p-3">
          <p className="text-xs font-bold text-gray-700 mb-2">Datos encontrados</p>
          <div className="grid sm:grid-cols-2 gap-2">
            {Object.entries(dataToShow).map(([key, value]) => (
              <div key={key} className="rounded-md bg-gray-50 px-2.5 py-2">
                <p className="text-[11px] uppercase tracking-wide text-gray-500">
                  {FIELD_LABELS[key] || key.replace(/_/g, ' ')}
                </p>
                <p className="text-xs font-semibold text-gray-800 break-words">
                  {String(value || '—')}
                </p>
              </div>
            ))}
          </div>
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

function ChatbotSupportCard({ message, onOpenChat }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-6 mb-8">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16h6m-7 5l-4-4a1 1 0 01-.293-.707V5a2 2 0 012-2h14a2 2 0 012 2v11a2 2 0 01-2 2H7.414a1 1 0 00-.707.293L3 21z" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 mb-1">¿Falló la carga o validación?</h3>
          <p className="text-sm text-gray-600 mb-3">
            Podemos abrir el chat con una recomendación automática para explicarte el error y cómo mejorar el archivo antes de volver a subirlo.
          </p>
          <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 mb-3">
            <p className="text-sm text-red-700">{message}</p>
          </div>
          <button
            onClick={onOpenChat}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white font-semibold transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(to right, #410016, #7a0028)' }}
          >
            Abrir chat con recomendación
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── ValidacionModal ──────────────────────────────────────────────────────────

function ValidacionModal({ doc, sesionId, tramiteNombre, onClose, onResultado, onErrorInfo }) {
  const [archivo, setArchivo] = useState(null)
  const [arrastrando, setArrastrando] = useState(false)
  const [validando, setValidando] = useState(false)
  const [errorLocal, setErrorLocal] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [validationResponse, setValidationResponse] = useState(null)
  const [editableFields, setEditableFields] = useState([])
  const [editableData, setEditableData] = useState({})
  const [thumbnailBase64, setThumbnailBase64] = useState(null)
  const inputRef = useRef()
  const { currentUser } = useAuth()

  const tipoEsperado = getTipoEsperado(doc)

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const procesarArchivo = async (file) => {
    setErrorLocal(null)
    setValidationResponse(null)
    if (!MIME_VALIDOS.includes(file.type)) {
      setErrorLocal('Formato no válido. Usa PDF, JPG o PNG.')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorLocal('El archivo supera 10 MB.')
      return
    }
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setArchivo(file)
    setPreviewUrl(URL.createObjectURL(file))
    const fields = getExpectedFieldKeys(tipoEsperado)
    setEditableFields(fields)
    setEditableData(buildEditableData(tipoEsperado))
    const thumb = await resizeToThumbnailBase64(file, 200)
    setThumbnailBase64(thumb)
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
        usuarioUid: currentUser?.uid || undefined,
      })
      const fields = getExpectedFieldKeys(tipoEsperado, res.data)
      setValidationResponse(res.data)
      setEditableFields(fields)
      setEditableData(
        fields.reduce((acc, key) => {
          acc[key] = res.data?.datos_extraidos?.[key] ?? ''
          return acc
        }, {})
      )
    } catch (err) {
      const friendlyMessage = getFriendlyValidationError(err)
      setErrorLocal(friendlyMessage)
      setValidationResponse({
        es_correcto: false,
        legible: null,
        vigente: null,
        requiere_revision: true,
        tipo_detectado: tipoEsperado,
        mensaje_correccion: friendlyMessage,
        datos_extraidos: {},
        campos_esperados: getExpectedFieldKeys(tipoEsperado),
      })
      const fields = getExpectedFieldKeys(tipoEsperado)
      setEditableFields(fields)
      setEditableData(
        fields.reduce((acc, key) => {
          acc[key] = ''
          return acc
        }, {})
      )
      const detalle = err.response?.data?.error || friendlyMessage
      onErrorInfo?.(`No se pudo validar "${doc.nombre}" para "${tramiteNombre}". ${detalle}`)
    } finally {
      setValidando(false)
    }
  }

  const confirmarDatos = () => {
    if (!archivo) return
    const payload = {
      ...(validationResponse || {
        es_correcto: true,
        tipo_detectado: tipoEsperado,
      }),
      es_correcto: true,
      requiere_revision: true,
      datos_extraidos: editableData,
      datos_corregidos: editableData,
      tipo_detectado: validationResponse?.tipo_detectado || tipoEsperado,
      observacion: validationResponse?.observacion || 'Datos confirmados manualmente por la persona usuaria.',
      archivo_base64_preview: thumbnailBase64 || null,
      es_pdf: archivo.type === 'application/pdf',
    }
    onResultado(payload, archivo.name)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl animate-fade-in-up max-h-[92vh] overflow-y-auto">

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
            <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-6">
              <div className="space-y-4">
                <div
                  onClick={() => inputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setArrastrando(true) }}
                  onDragLeave={() => setArrastrando(false)}
                  onDrop={onDrop}
                  className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
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

                <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                  <p className="text-sm font-bold text-gray-800 mb-3">Vista previa del archivo</p>
                  {previewUrl ? (
                    archivo?.type === 'application/pdf' ? (
                      <iframe
                        title="Vista previa PDF"
                        src={previewUrl}
                        className="w-full h-[420px] rounded-lg bg-white"
                      />
                    ) : (
                      <img
                        src={previewUrl}
                        alt={`Vista previa de ${doc.nombre}`}
                        className="w-full max-h-[420px] object-contain rounded-lg bg-white"
                      />
                    )
                  ) : (
                    <div className="h-[220px] rounded-lg border border-dashed border-gray-300 bg-white flex items-center justify-center text-sm text-gray-400">
                      La vista previa aparecerá aquí al subir un archivo
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div>
                      <p className="text-sm font-bold text-gray-900">Campos detectados y editables</p>
                      <p className="text-xs text-gray-500">
                        Puedes editar cualquier dato si algo no está correcto.
                      </p>
                    </div>
                    {validationResponse?.tipo_detectado && (
                      <span className="text-xs font-bold px-2 py-1 rounded-full bg-gray-100 text-gray-700 capitalize">
                        {validationResponse.tipo_detectado.replace(/_/g, ' ')}
                      </span>
                    )}
                  </div>

                  <div className="space-y-3">
                    {editableFields.length > 0 ? (
                      editableFields.map((key) => {
                        const missing = (validationResponse?.campos_faltantes || []).includes(key)
                        const value = editableData[key] ?? ''
                        return (
                        <div key={key}>
                          <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1.5">
                            {FIELD_LABELS[key] || key}
                          </label>
                          <input
                            type="text"
                            value={value}
                            onChange={(e) => setEditableData((current) => ({ ...current, [key]: e.target.value }))}
                            className={`w-full px-3 py-2.5 border-2 rounded-xl focus:border-[#410016] focus:outline-none text-sm transition-colors ${
                              missing ? 'border-amber-300 bg-amber-50' : 'border-gray-200'
                            }`}
                            placeholder={`Captura ${FIELD_LABELS[key] || key}`}
                          />
                          {missing && (
                            <p className="text-[11px] text-amber-700 mt-1">Este dato no fue detectado, por favor complétalo</p>
                          )}
                        </div>
                      )})
                    ) : (
                      <div className="rounded-lg border border-dashed border-gray-300 p-5 text-sm text-gray-400 text-center">
                        Sube el archivo y usa “Validar con IA” para rellenar los campos automáticamente.
                      </div>
                    )}
                  </div>
                </div>

                {validationResponse && (
                  <ResultadoOCR resultado={validationResponse} />
                )}
              </div>
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
                  <p className="font-bold text-[#410016] text-sm">Verificando tu documento...</p>
                  <p className="text-xs text-gray-500 mt-1">Estamos revisando la información, puede tomar unos segundos</p>
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
              {validando ? 'Verificando...' : 'Verificar documento'}
            </button>
            <button
              onClick={confirmarDatos}
              disabled={!archivo || Object.keys(editableData).length === 0}
              className="flex-1 py-3 rounded-xl text-white font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 hover:shadow-lg"
              style={{ background: 'linear-gradient(to right, #0f766e, #10b981)' }}
            >
              Confirmar datos
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
