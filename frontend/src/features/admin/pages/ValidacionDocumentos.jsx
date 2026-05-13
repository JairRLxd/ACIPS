import { useState, useEffect } from 'react'
import AdminLayout from '../components/AdminLayout'
import { obtenerDocumentos, validarDocumentoAdmin } from '../../../repositories/documentosRepository'

const BRAND = '#410016'

export default function ValidacionDocumentos() {
  const [documentos, setDocumentos] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('pendiente')
  const [documentoSeleccionado, setDocumentoSeleccionado] = useState(null)
  const [mostrarModal, setMostrarModal] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    cargarDocumentos()
  }, [filtro])

  const cargarDocumentos = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await obtenerDocumentos(filtro === 'todos' ? null : filtro)
      
      // El backend devuelve {data: [...]} y Axios lo envuelve en response.data
      // Por lo tanto necesitamos response.data.data
      const docs = Array.isArray(response.data?.data) ? response.data.data : []
      setDocumentos(docs)
      
      console.log('Documentos cargados:', docs.length)
    } catch (err) {
      console.error('Error al cargar documentos:', err)
      setError('No se pudieron cargar los documentos. Intenta de nuevo.')
      setDocumentos([])
    } finally {
      setLoading(false)
    }
  }

  const stats = {
    total: Array.isArray(documentos) ? documentos.length : 0,
    pendientes: Array.isArray(documentos) ? documentos.filter(d => d.estado === 'pendiente').length : 0,
    aprobados: Array.isArray(documentos) ? documentos.filter(d => d.estado === 'aprobado').length : 0,
    rechazados: Array.isArray(documentos) ? documentos.filter(d => d.estado === 'rechazado').length : 0,
  }

  const abrirModal = (documento) => {
    setDocumentoSeleccionado(documento)
    setMostrarModal(true)
  }

  const cerrarModal = () => {
    setDocumentoSeleccionado(null)
    setMostrarModal(false)
  }

  const handleValidar = async (documentoId, nuevoEstado, comentario = '') => {
    try {
      await validarDocumentoAdmin(documentoId, nuevoEstado, comentario)
      await cargarDocumentos()
      cerrarModal()
    } catch (err) {
      console.error('Error al validar documento:', err)
      alert('Error al validar el documento. Intenta de nuevo.')
    }
  }

  return (
    <AdminLayout>
      {/* Header mejorado con gradiente */}
      <div className="mb-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-rose-50 via-pink-50 to-rose-50 opacity-50 rounded-3xl"></div>
        <div className="relative px-8 py-6">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
              style={{ background: 'linear-gradient(135deg, #410016, #7a0028)' }}>
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-4xl font-black text-gray-900 tracking-tight">Validación de Documentos</h2>
              <p className="text-gray-600 font-medium mt-1">Revisa y valida los documentos subidos por los usuarios con OCR</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats mejorados con animaciones */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          label="Total documentos" 
          value={stats.total} 
          color="#410016" 
          onClick={() => setFiltro('todos')} 
          active={filtro === 'todos'}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        />
        <StatCard 
          label="Pendientes" 
          value={stats.pendientes} 
          color="#d97706" 
          onClick={() => setFiltro('pendiente')} 
          active={filtro === 'pendiente'}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard 
          label="Aprobados" 
          value={stats.aprobados} 
          color="#059669" 
          onClick={() => setFiltro('aprobado')} 
          active={filtro === 'aprobado'}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard 
          label="Rechazados" 
          value={stats.rechazados} 
          color="#dc2626" 
          onClick={() => setFiltro('rechazado')} 
          active={filtro === 'rechazado'}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
          <svg className="w-6 h-6 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-red-900">{error}</p>
            <button 
              onClick={cargarDocumentos}
              className="text-sm text-red-700 hover:text-red-800 font-semibold underline mt-1"
            >
              Reintentar
            </button>
          </div>
        </div>
      )}

      {/* Tabla mejorada */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64 text-gray-400">
            <div className="text-center">
              <div className="relative w-16 h-16 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
                <div className="absolute inset-0 rounded-full border-4 border-t-rose-600 animate-spin"></div>
              </div>
              <p className="text-lg font-semibold text-gray-600">Cargando documentos...</p>
              <p className="text-sm text-gray-400 mt-2">Esto puede tomar unos segundos</p>
            </div>
          </div>
        ) : documentos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <div className="w-24 h-24 rounded-full bg-gray-50 flex items-center justify-center mb-6">
              <svg className="w-12 h-12 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-xl font-bold text-gray-600 mb-2">No hay documentos</p>
            <p className="text-sm text-gray-400">No se encontraron documentos con este filtro</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-700 uppercase tracking-wider">Usuario</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-700 uppercase tracking-wider">Programa</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-700 uppercase tracking-wider">Tipo Doc</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-700 uppercase tracking-wider">Archivo</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-700 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-700 uppercase tracking-wider">OCR</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-700 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-4 text-right text-xs font-black text-gray-700 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {documentos.map((doc) => (
                  <DocumentoRow key={doc.id} documento={doc} onVerDetalles={() => abrirModal(doc)} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {mostrarModal && documentoSeleccionado && (
        <ModalDocumento
          documento={documentoSeleccionado}
          onCerrar={cerrarModal}
          onValidar={handleValidar}
        />
      )}
    </AdminLayout>
  )
}

function StatCard({ label, value, color, onClick, active, icon }) {
  return (
    <button
      onClick={onClick}
      className={`group relative p-6 rounded-3xl border-2 transition-all duration-300 text-left overflow-hidden ${
        active 
          ? 'border-transparent shadow-2xl scale-105 -translate-y-1' 
          : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-xl hover:-translate-y-0.5'
      }`}
      style={active ? { 
        background: `linear-gradient(135deg, ${color}15, ${color}05)`,
        boxShadow: `0 20px 40px ${color}20`
      } : {}}
    >
      {/* Efecto de brillo en hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `linear-gradient(135deg, ${color}08, transparent)` }}></div>
      
      <div className="relative">
        {/* Icono */}
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 ${
          active ? 'scale-110' : 'group-hover:scale-105'
        }`}
          style={{ 
            background: active 
              ? `linear-gradient(135deg, ${color}, ${color}dd)` 
              : `${color}15`,
            color: active ? 'white' : color
          }}>
          {icon}
        </div>
        
        {/* Valor con animación */}
        <div className="flex items-baseline gap-2 mb-2">
          <p className={`text-5xl font-black transition-all duration-300 ${
            active ? 'scale-110' : 'group-hover:scale-105'
          }`} 
            style={{ color }}>
            {value}
          </p>
          {active && (
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: color }}></div>
          )}
        </div>
        
        {/* Label */}
        <p className={`text-sm font-bold uppercase tracking-wide transition-colors ${
          active ? 'text-gray-900' : 'text-gray-600 group-hover:text-gray-900'
        }`}>
          {label}
        </p>
        
        {/* Indicador de selección */}
        {active && (
          <div className="absolute top-4 right-4">
            <div className="w-3 h-3 rounded-full animate-ping" style={{ backgroundColor: color, opacity: 0.5 }}></div>
            <div className="absolute top-0 right-0 w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
          </div>
        )}
      </div>
    </button>
  )
}

function DocumentoRow({ documento, onVerDetalles }) {
  const estadoConfig = {
    pendiente: { label: 'Pendiente', color: 'text-amber-700 bg-amber-100 border-amber-200' },
    aprobado: { label: 'Aprobado', color: 'text-emerald-700 bg-emerald-100 border-emerald-200' },
    rechazado: { label: 'Rechazado', color: 'text-red-700 bg-red-100 border-red-200' },
  }

  const cfg = estadoConfig[documento.estado] || estadoConfig.pendiente
  
  // Manejar diferentes formatos de fecha
  const fecha = documento.fecha_subida 
    ? new Date(documento.fecha_subida).toLocaleDateString('es-MX', { 
        day: '2-digit', 
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'N/A'

  const confianzaOCR = documento.confianza_ocr || documento.confianza || 0
  const confianzaColor = confianzaOCR >= 0.9 ? 'text-emerald-600' : 
                         confianzaOCR >= 0.7 ? 'text-amber-600' : 'text-red-600'

  // Obtener nombre del usuario (puede venir como objeto o string)
  const nombreUsuario = typeof documento.usuario === 'object' 
    ? (documento.usuario.nombre || documento.usuario.email || 'Usuario')
    : (documento.usuario || 'Usuario')
  
  const usuarioUID = typeof documento.usuario === 'object'
    ? (documento.usuario.uid || documento.usuario_uid || '')
    : (documento.usuario_uid || '')

  // Obtener nombre del programa
  const nombrePrograma = typeof documento.programa === 'object'
    ? (documento.programa.nombre || documento.programa)
    : (documento.programa || 'N/A')

  return (
    <tr className="group hover:bg-gradient-to-r hover:from-rose-50/30 hover:to-transparent transition-all duration-200 cursor-pointer">
      <td className="px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-sm font-black shadow-md group-hover:shadow-lg transition-all duration-200 group-hover:scale-110"
              style={{ background: `linear-gradient(135deg, ${BRAND}, #7a0028)` }}>
              {nombreUsuario[0].toUpperCase()}
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 group-hover:text-rose-900 transition-colors">{nombreUsuario}</p>
            {usuarioUID && <p className="text-xs text-gray-400 font-mono">{usuarioUID.slice(0, 12)}...</p>}
          </div>
        </div>
      </td>
      <td className="px-6 py-5">
        <p className="text-sm font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">{nombrePrograma}</p>
      </td>
      <td className="px-6 py-5">
        <span className="inline-flex items-center gap-2 text-xs font-black px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md group-hover:shadow-lg transition-all duration-200 uppercase tracking-wide">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          {documento.tipo_documento || documento.tipo || 'N/A'}
        </span>
      </td>
      <td className="px-6 py-5">
        <p className="text-sm text-gray-600 font-medium truncate max-w-[150px] group-hover:text-gray-900 transition-colors">
          {documento.nombre_archivo || 'archivo'}
        </p>
      </td>
      <td className="px-6 py-5">
        <p className="text-sm text-gray-500 font-medium">{fecha}</p>
      </td>
      <td className="px-6 py-5">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${confianzaColor.replace('text-', 'bg-')} animate-pulse`}></div>
          <span className={`text-sm font-black ${confianzaColor}`}>
            {(confianzaOCR * 100).toFixed(0)}%
          </span>
        </div>
      </td>
      <td className="px-6 py-5">
        <span className={`inline-flex items-center gap-2 text-xs font-black px-4 py-2 rounded-full border-2 ${cfg.color} shadow-sm group-hover:shadow-md transition-all duration-200 uppercase tracking-wide`}>
          <span className="w-2 h-2 rounded-full bg-current animate-pulse"></span>
          {cfg.label}
        </span>
      </td>
      <td className="px-6 py-5">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={onVerDetalles}
            className="group/btn p-3 rounded-xl text-blue-600 hover:bg-blue-50 transition-all duration-200 hover:scale-110 hover:shadow-lg"
            title="Ver detalles y validar"
          >
            <svg className="w-5 h-5 group-hover/btn:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
        </div>
      </td>
    </tr>
  )
}

function ModalDocumento({ documento, onCerrar, onValidar }) {
  const [comentario, setComentario] = useState('')
  const [procesando, setProcesando] = useState(false)

  const handleValidar = async (estado) => {
    setProcesando(true)
    await onValidar(documento.id, estado, comentario)
    setProcesando(false)
  }

  const esPDF = documento.nombre_archivo?.toLowerCase().endsWith('.pdf')
  const textoOCR = documento.texto_ocr || documento.texto_extraido || 'No se pudo extraer texto del documento'
  const confianzaOCR = documento.confianza_ocr || documento.confianza || documento.ocr_confidence_avg || 0
  
  // Obtener URL del documento - buscar en diferentes campos posibles
  let urlDocumento = documento.url || documento.base64 || documento.archivo_url || documento.archivo_base64
  
  // Si el base64 no tiene el prefijo data:, agregarlo
  if (urlDocumento && !urlDocumento.startsWith('data:')) {
    // Determinar el tipo MIME basado en el tipo de archivo
    const tipoArchivo = documento.tipo_archivo || 'image'
    if (tipoArchivo === 'image' || documento.nombre_archivo?.match(/\.(jpg|jpeg|png|gif)$/i)) {
      urlDocumento = `data:image/jpeg;base64,${urlDocumento}`
    } else if (tipoArchivo === 'pdf' || documento.nombre_archivo?.toLowerCase().endsWith('.pdf')) {
      urlDocumento = `data:application/pdf;base64,${urlDocumento}`
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-scale-in">
        {/* Header mejorado */}
        <div className="relative px-8 py-6 border-b border-gray-100 overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #fff5f7, #ffffff)' }}>
          {/* Decoración de fondo */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-rose-100 to-transparent opacity-30 rounded-full blur-3xl"></div>
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
                style={{ background: 'linear-gradient(135deg, #410016, #7a0028)' }}>
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-3xl font-black text-gray-900 tracking-tight">Validación de Documento</h3>
                <p className="text-sm text-gray-600 font-semibold mt-1">
                  {documento.tipo_documento || documento.tipo || 'Documento'} - {
                    typeof documento.usuario === 'object' 
                      ? (documento.usuario.nombre || documento.usuario.email)
                      : documento.usuario
                  }
                </p>
              </div>
            </div>
            <button
              onClick={onCerrar}
              className="p-3 rounded-xl hover:bg-gray-100 transition-all duration-200 hover:rotate-90 group"
            >
              <svg className="w-6 h-6 text-gray-600 group-hover:text-gray-900 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content mejorado */}
        <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Vista del documento */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h4 className="text-xl font-black text-gray-900">Documento Original</h4>
              </div>
              <div className="bg-white rounded-2xl p-6 min-h-[400px] flex items-center justify-center shadow-lg border border-gray-100">
                {esPDF ? (
                  <div className="text-center">
                    <div className="w-32 h-32 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-xl">
                      <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
                        <path d="M14 2v6h6" />
                      </svg>
                    </div>
                    <p className="text-lg font-bold text-gray-900 mb-2">{documento.nombre_archivo}</p>
                    <p className="text-sm text-gray-500 mb-4">Documento PDF</p>
                    {urlDocumento && (
                      <a 
                        href={urlDocumento} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-xl hover:shadow-lg transition-all duration-200 hover:scale-105"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Descargar PDF
                      </a>
                    )}
                  </div>
                ) : urlDocumento ? (
                  <img 
                    src={urlDocumento} 
                    alt={documento.nombre_archivo}
                    className="max-w-full max-h-[500px] rounded-xl shadow-2xl border-4 border-white"
                    onError={(e) => {
                      e.target.style.display = 'none'
                      e.target.parentElement.innerHTML = '<p class="text-gray-500 font-semibold">No se pudo cargar la imagen</p>'
                    }}
                  />
                ) : (
                  <p className="text-gray-500 font-semibold">No hay vista previa disponible</p>
                )}
              </div>
              <div className="mt-6 p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-black text-blue-900 uppercase tracking-wide">Información del archivo</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-blue-800">Nombre:</span>
                    <span className="text-blue-900 font-medium">{documento.nombre_archivo || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-blue-800">Subido:</span>
                    <span className="text-blue-900 font-medium">{
                      documento.fecha_subida || documento.created_at
                        ? new Date(documento.fecha_subida || documento.created_at).toLocaleString('es-MX')
                        : 'N/A'
                    }</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-blue-800">Confianza OCR:</span>
                    <span className={`font-black ${confianzaOCR >= 0.9 ? 'text-emerald-600' : confianzaOCR >= 0.7 ? 'text-amber-600' : 'text-red-600'}`}>
                      {(confianzaOCR * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-blue-800">Tipo:</span>
                    <span className="text-blue-900 font-medium uppercase">{documento.tipo_detectado || documento.tipo_documento || documento.tipo_esperado || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Texto extraído por OCR */}
            <div>
              <h4 className="text-lg font-bold text-gray-900 mb-4">Texto Extraído (OCR)</h4>
              <div className="bg-gray-50 rounded-2xl p-6 min-h-[400px] font-mono text-sm">
                <pre className="whitespace-pre-wrap text-gray-700">{textoOCR}</pre>
              </div>

              {/* Comentarios */}
              {documento.estado === 'pendiente' && (
                <div className="mt-6">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Comentarios (opcional)
                  </label>
                  <textarea
                    value={comentario}
                    onChange={(e) => setComentario(e.target.value)}
                    rows={3}
                    placeholder="Agrega comentarios sobre la validación..."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-rose-300 focus:outline-none"
                  />
                </div>
              )}

              {/* Estado actual */}
              {documento.estado !== 'pendiente' && (
                <div className="mt-6 p-4 bg-gray-100 rounded-xl">
                  <p className="text-sm font-bold text-gray-700 mb-2">Estado: {documento.estado}</p>
                  {documento.validado_por && (
                    <p className="text-sm text-gray-600">Validado por: {documento.validado_por}</p>
                  )}
                  {documento.fecha_validacion && (
                    <p className="text-sm text-gray-600">
                      Fecha: {new Date(documento.fecha_validacion).toLocaleString('es-MX')}
                    </p>
                  )}
                  {documento.comentario && (
                    <p className="text-sm text-gray-600 mt-2">
                      <span className="font-semibold">Comentario:</span> {documento.comentario}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-gray-100 flex items-center justify-between">
          <button
            onClick={onCerrar}
            className="px-6 py-3 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            Cerrar
          </button>
          
          {documento.estado === 'pendiente' && (
            <div className="flex gap-3">
              <button
                onClick={() => handleValidar('rechazado')}
                disabled={procesando}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Rechazar
              </button>
              <button
                onClick={() => handleValidar('aprobado')}
                disabled={procesando}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-colors hover:shadow-lg disabled:opacity-50"
                style={{ background: `linear-gradient(135deg, #059669, #047857)` }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Aprobar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
