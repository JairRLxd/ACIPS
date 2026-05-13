import { useState, useEffect } from 'react'
import AdminLayout from '../components/AdminLayout'
import httpClient from '../../../infrastructure/httpClient'

const BRAND = '#410016'

export default function Programas() {
  const [programas, setProgramas] = useState([])
  const [loading, setLoading] = useState(true)
  const [mostrarModal, setMostrarModal] = useState(false)
  const [programaSeleccionado, setProgramaSeleccionado] = useState(null)
  const [modo, setModo] = useState('ver') // 'ver', 'editar', 'nuevo'

  useEffect(() => {
    cargarProgramas()
  }, [])

  const cargarProgramas = async () => {
    try {
      const response = await httpClient.get('/api/v1/tramites')
      setProgramas(response.data?.programas || [])
    } catch (error) {
      console.error('Error al cargar programas:', error)
      setProgramas([])
    } finally {
      setLoading(false)
    }
  }

  const abrirModal = (programa, modoModal) => {
    setProgramaSeleccionado(programa)
    setModo(modoModal)
    setMostrarModal(true)
  }

  const cerrarModal = () => {
    setMostrarModal(false)
    setProgramaSeleccionado(null)
    setModo('ver')
  }

  const handleNuevoPrograma = () => {
    abrirModal(null, 'nuevo')
  }

  return (
    <AdminLayout>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black text-gray-900 mb-2">Gestión de Programas</h2>
            <p className="text-gray-600">Administra los programas sociales disponibles</p>
          </div>
          <button
            onClick={handleNuevoPrograma}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all hover:shadow-lg"
            style={{ background: `linear-gradient(135deg, ${BRAND}, #7a0028)` }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nuevo programa
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total programas" value={programas.length} color="#410016" />
        <StatCard label="Activos" value={programas.length} color="#059669" />
        <StatCard label="Beneficiarios" value="8,200" color="#0891b2" />
        <StatCard label="Presupuesto" value="$45.2M" color="#7a0028" />
      </div>

      {/* Grid de programas */}
      {loading ? (
        <div className="flex items-center justify-center h-64 text-gray-400">
          <div className="text-center">
            <svg className="w-12 h-12 mx-auto mb-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <p>Cargando programas...</p>
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programas.map((programa) => (
            <ProgramaCard 
              key={programa.id} 
              programa={programa} 
              onVerDetalles={() => abrirModal(programa, 'ver')}
              onEditar={() => abrirModal(programa, 'editar')}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      {mostrarModal && (
        <ModalPrograma
          programa={programaSeleccionado}
          modo={modo}
          onCerrar={cerrarModal}
          onGuardar={() => {
            cargarProgramas()
            cerrarModal()
          }}
        />
      )}
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

function ProgramaCard({ programa, onVerDetalles, onEditar }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ background: `linear-gradient(135deg, ${BRAND}, #7a0028)` }}>
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <span className="text-xs font-bold px-3 py-1 rounded-full text-emerald-700 bg-emerald-100">
          Activo
        </span>
      </div>

      <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{programa.nombre}</h3>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Monto:</span>
          <span className="font-bold text-gray-900">{programa.monto}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Periodicidad:</span>
          <span className="font-semibold text-gray-700 capitalize">{programa.periodicidad}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Dependencia:</span>
          <span className="font-semibold text-gray-700 text-xs">{programa.dependencia}</span>
        </div>
      </div>

      <div className="flex gap-2 pt-4 border-t border-gray-100">
        <button 
          onClick={onEditar}
          className="flex-1 py-2 px-4 rounded-lg text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors">
          Editar
        </button>
        <button 
          onClick={onVerDetalles}
          className="flex-1 py-2 px-4 rounded-lg text-sm font-semibold text-white transition-colors hover:shadow-lg"
          style={{ background: `linear-gradient(135deg, ${BRAND}, #7a0028)` }}>
          Ver detalles
        </button>
      </div>
    </div>
  )
}

function ModalPrograma({ programa, modo, onCerrar, onGuardar }) {
  const [formData, setFormData] = useState(programa || {
    nombre: '',
    descripcion: '',
    monto: '',
    periodicidad: 'mensual',
    dependencia: '',
    telefono_informes: '',
    url_oficial: '',
  })

  const esLectura = modo === 'ver'
  const titulo = modo === 'nuevo' ? 'Nuevo Programa' : modo === 'editar' ? 'Editar Programa' : 'Detalles del Programa'

  const handleSubmit = (e) => {
    e.preventDefault()
    // Aquí iría la lógica para guardar en el backend
    console.log('Guardar programa:', formData)
    onGuardar()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between"
          style={{ background: `linear-gradient(135deg, ${BRAND}10, ${BRAND}05)` }}>
          <h3 className="text-2xl font-black text-gray-900">{titulo}</h3>
          <button
            onClick={onCerrar}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información básica */}
            <div>
              <h4 className="text-lg font-bold text-gray-900 mb-4">Información básica</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Nombre del programa</label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                    disabled={esLectura}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-rose-300 focus:outline-none disabled:bg-gray-50"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Descripción</label>
                  <textarea
                    value={formData.descripcion}
                    onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                    disabled={esLectura}
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-rose-300 focus:outline-none disabled:bg-gray-50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Monto</label>
                  <input
                    type="text"
                    value={formData.monto}
                    onChange={(e) => setFormData({...formData, monto: e.target.value})}
                    disabled={esLectura}
                    placeholder="$6,000 MXN"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-rose-300 focus:outline-none disabled:bg-gray-50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Periodicidad</label>
                  <select
                    value={formData.periodicidad}
                    onChange={(e) => setFormData({...formData, periodicidad: e.target.value})}
                    disabled={esLectura}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-rose-300 focus:outline-none disabled:bg-gray-50"
                  >
                    <option value="mensual">Mensual</option>
                    <option value="bimestral">Bimestral</option>
                    <option value="trimestral">Trimestral</option>
                    <option value="anual">Anual</option>
                    <option value="unico">Único</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Dependencia</label>
                  <input
                    type="text"
                    value={formData.dependencia}
                    onChange={(e) => setFormData({...formData, dependencia: e.target.value})}
                    disabled={esLectura}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-rose-300 focus:outline-none disabled:bg-gray-50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Teléfono de informes</label>
                  <input
                    type="tel"
                    value={formData.telefono_informes}
                    onChange={(e) => setFormData({...formData, telefono_informes: e.target.value})}
                    disabled={esLectura}
                    placeholder="800-000-0000"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-rose-300 focus:outline-none disabled:bg-gray-50"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">URL oficial</label>
                  <input
                    type="url"
                    value={formData.url_oficial}
                    onChange={(e) => setFormData({...formData, url_oficial: e.target.value})}
                    disabled={esLectura}
                    placeholder="https://www.gob.mx/..."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-rose-300 focus:outline-none disabled:bg-gray-50"
                  />
                </div>
              </div>
            </div>

            {/* Documentos requeridos (solo vista) */}
            {esLectura && programa?.documentos_requeridos && (
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-4">Documentos requeridos</h4>
                <div className="space-y-2">
                  {programa.documentos_requeridos.map((doc, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{doc.nombre}</p>
                        <p className="text-xs text-gray-600">{doc.descripcion}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pasos del trámite (solo vista) */}
            {esLectura && programa?.pasos_tramite && (
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-4">Pasos del trámite</h4>
                <div className="space-y-3">
                  {programa.pasos_tramite.map((paso, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                        style={{ background: `linear-gradient(135deg, ${BRAND}, #7a0028)` }}>
                        {index + 1}
                      </div>
                      <p className="text-sm text-gray-700 pt-1">{paso}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-gray-100 flex items-center justify-end gap-3">
          <button
            onClick={onCerrar}
            className="px-6 py-3 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            {esLectura ? 'Cerrar' : 'Cancelar'}
          </button>
          {!esLectura && (
            <button
              onClick={handleSubmit}
              className="px-6 py-3 rounded-xl font-semibold text-white transition-all hover:shadow-lg"
              style={{ background: `linear-gradient(135deg, ${BRAND}, #7a0028)` }}
            >
              Guardar cambios
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
