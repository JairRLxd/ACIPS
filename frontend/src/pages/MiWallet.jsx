import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { obtenerMiWallet } from '../repositories/walletRepository'

function capitalizar(str) {
  if (!str) return ''
  return str.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function formatFecha(iso) {
  if (!iso) return null
  return new Date(iso).toLocaleDateString('es-MX', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}

const CAMPOS_RELEVANTES = [
  'nombre', 'curp', 'vigencia', 'fecha_vencimiento', 'rfc', 'clabe',
  'domicilio', 'clave_elector', 'plantel', 'ciclo_escolar', 'banco',
]

export default function MiWallet() {
  const { currentUser } = useAuth()
  const [documentos, setDocumentos] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!currentUser) return
    const cargar = async () => {
      try {
        setLoading(true)
        const res = await obtenerMiWallet()
        setDocumentos(res.data?.documentos || [])
        setTotal(res.data?.total || 0)
      } catch (err) {
        setError(err.response?.data?.error || 'No se pudo cargar tu wallet. Intenta de nuevo.')
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [currentUser])

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-rose-50/30 to-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-xl p-12 text-center max-w-md w-full">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Inicia sesión para ver tu wallet</h2>
          <p className="text-gray-500 text-sm mb-6">Tu wallet documental requiere una cuenta activa.</p>
          <Link to="/login"
            className="inline-block px-8 py-3 rounded-xl text-white font-bold transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #410016, #7a0028)' }}>
            Iniciar sesión
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-rose-50/30 to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 mx-auto mb-4" style={{ color: '#410016' }} fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-gray-600 font-semibold">Cargando tu wallet...</p>
        </div>
      </div>
    )
  }

  const reutilizables = documentos.filter((d) => d.reusable && !d.expirado).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-rose-50/30 to-gray-50 py-12 px-4">
      <div className="container mx-auto max-w-4xl">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 shadow-xl"
            style={{ background: 'linear-gradient(135deg, #410016, #7a0028)' }}>
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <h1 className="text-5xl font-black mb-3"
            style={{
              background: 'linear-gradient(to right, #410016, #7a0028)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
            Mi Wallet Documental
          </h1>
          <p className="text-gray-600 font-medium text-lg mb-3">
            Documentos validados que se reutilizan automáticamente en tus trámites
          </p>
          {total > 0 && (
            <div className="inline-flex items-center gap-3 bg-white rounded-full px-5 py-2 shadow-sm border border-gray-100 text-sm font-semibold text-gray-700">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-gray-400 inline-block" />
                {total} documento{total !== 1 ? 's' : ''}
              </span>
              <span className="text-gray-300">·</span>
              <span className="flex items-center gap-1.5 text-emerald-700">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                {reutilizables} reutilizable{reutilizables !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 text-red-700 px-6 py-4 rounded-2xl mb-6 flex items-center gap-3">
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="font-semibold text-sm">{error}</span>
          </div>
        )}

        {/* Estado vacío */}
        {!error && documentos.length === 0 && (
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl p-12 text-center border border-white">
            <div className="w-24 h-24 rounded-full bg-purple-50 flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-700 mb-3">Tu wallet está vacía</h3>
            <p className="text-gray-500 max-w-sm mx-auto leading-relaxed">
              Los documentos válidos que subas en tus trámites quedan guardados aquí para
              reutilizarse automáticamente la próxima vez que los necesites.
            </p>
            <Link to="/diagnostico"
              className="inline-block mt-6 px-8 py-3 rounded-2xl font-bold text-white transition-all hover:opacity-90 hover:shadow-lg"
              style={{ background: 'linear-gradient(135deg, #410016, #7a0028)' }}>
              Hacer un diagnóstico
            </Link>
          </div>
        )}

        {/* Lista de documentos */}
        {documentos.length > 0 && (
          <div className="space-y-4">
            {documentos.map((doc) => (
              <DocumentoWalletCard key={doc.wallet_documento_id} doc={doc} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function DocumentoWalletCard({ doc }) {
  const estaExpirado = doc.expirado
  const esReutilizable = doc.reusable && !estaExpirado
  const sinValidar = !doc.es_correcto

  const badge = estaExpirado
    ? { label: 'Expirado', bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-400' }
    : sinValidar
    ? { label: 'Pendiente', bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' }
    : { label: 'Reutilizable', bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-400' }

  const datosRelevantes = Object.entries(doc.datos_extraidos || {})
    .filter(([key]) => CAMPOS_RELEVANTES.includes(key))
    .filter(([, val]) => val)
    .slice(0, 6)

  return (
    <div className={`bg-white/90 backdrop-blur-lg rounded-2xl shadow-sm border-2 transition-all duration-300 hover:shadow-md ${
      esReutilizable ? 'border-emerald-100' : estaExpirado ? 'border-red-100' : 'border-gray-100'
    }`}>
      {/* Header de la tarjeta */}
      <div className="flex items-center justify-between p-5 border-b border-gray-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #410016, #7a0028)' }}>
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-gray-900">{capitalizar(doc.tipo_documento)}</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Actualizado: {formatFecha(doc.updated_at)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${badge.bg} ${badge.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
            {badge.label}
          </span>
          {esReutilizable && (
            <span className="text-xs font-bold px-2 py-1 rounded-full bg-purple-100 text-purple-700">
              ♻ Wallet
            </span>
          )}
        </div>
      </div>

      {/* Datos extraídos */}
      {datosRelevantes.length > 0 && (
        <div className="px-5 py-4">
          <div className="grid grid-cols-2 gap-x-6 gap-y-2">
            {datosRelevantes.map(([key, val]) => (
              <div key={key} className="min-w-0">
                <p className="text-xs text-gray-400 font-medium capitalize">{capitalizar(key)}</p>
                <p className="text-sm font-semibold text-gray-800 truncate">{String(val)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="px-5 py-3 bg-gray-50/60 rounded-b-2xl flex items-center justify-between">
        {doc.reusable_until ? (
          <p className="text-xs text-gray-500">
            <span className="font-semibold">Válido hasta:</span> {formatFecha(doc.reusable_until)}
          </p>
        ) : (
          <p className="text-xs text-gray-400">Sin fecha de vencimiento</p>
        )}
        {doc.observacion && (
          <p className="text-xs text-gray-400 italic truncate max-w-xs">{doc.observacion}</p>
        )}
      </div>
    </div>
  )
}
