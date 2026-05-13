import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { obtenerTramites } from '../repositories/tramitesRepository'

function formatModalidad(value) {
  if (!value) return 'No especificada'
  return value.replace(/_/g, ' ')
}

function resolveFlujo(tramite) {
  return tramite?.flujo === 'admin_virtual' ? 'admin_virtual' : 'solo_guia'
}

export default function Programas() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [tramites, setTramites] = useState([])

  useEffect(() => {
    const cargarProgramas = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await obtenerTramites()
        const catalogo = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data?.tramites)
            ? response.data.tramites
            : Array.isArray(response.data?.programas)
              ? response.data.programas
              : []
        setTramites(
          catalogo.map((tramite) => ({
            ...tramite,
            flujo_ui: resolveFlujo(tramite),
          }))
        )
      } catch (err) {
        console.error('No se pudieron cargar los programas:', err)
        setError('No se pudo cargar el catálogo de programas.')
      } finally {
        setLoading(false)
      }
    }

    cargarProgramas()
  }, [])

  const { grupoA, grupoB } = useMemo(() => ({
    grupoA: tramites.filter((tramite) => tramite.flujo_ui === 'solo_guia'),
    grupoB: tramites.filter((tramite) => tramite.flujo_ui === 'admin_virtual'),
  }), [tramites])

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-4 py-2 text-sm font-bold text-[#410016] border border-rose-100 mb-4">
          Catálogo completo
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
          Todos los programas disponibles
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl">
          Explora todos los apoyos y trámites disponibles en ACIPS. Puedes abrir la guía de cada programa y revisar sus documentos requeridos, modalidad y dependencia.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-10">
        <ResumenCard label="Total de programas" value={tramites.length} tone="rose" />
        <ResumenCard label="Grupo A" value={grupoA.length} helper="Atención presencial" tone="amber" />
        <ResumenCard label="Grupo B" value={grupoB.length} helper="Preparación digital" tone="emerald" />
      </div>

      {loading && (
        <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center shadow-sm">
          <div className="inline-block w-8 h-8 border-4 border-gray-200 rounded-full animate-spin mb-4" style={{ borderTopColor: '#410016' }} />
          <p className="text-gray-600">Cargando programas disponibles...</p>
        </div>
      )}

      {!loading && error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-700 mb-8">
          <p className="font-bold mb-2">{error}</p>
          <p className="text-sm">Intenta recargar la página o vuelve más tarde.</p>
        </div>
      )}

      {!loading && !error && tramites.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 text-yellow-800 mb-8">
          <p className="font-bold mb-2">No hay programas disponibles por ahora.</p>
          <p className="text-sm">Cuando el backend publique el catálogo, aparecerá aquí automáticamente.</p>
        </div>
      )}

      {!loading && !error && tramites.length > 0 && (
        <section className="mb-10">
          <div className="mb-5">
            <h2 className="text-2xl font-bold text-gray-900">Todos los programas</h2>
            <p className="text-gray-600">Catálogo completo con acceso directo a la ficha de cada trámite.</p>
          </div>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {tramites.map((tramite) => (
              <ProgramaCard key={tramite.id} tramite={tramite} />
            ))}
          </div>
        </section>
      )}

      {!loading && !error && grupoA.length > 0 && (
        <section className="mb-10">
          <div className="mb-5">
            <h2 className="text-2xl font-bold text-gray-900">Grupo A</h2>
            <p className="text-gray-600">Programas con atención presencial en módulo o dependencia.</p>
          </div>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {grupoA.map((tramite) => (
              <ProgramaCard key={tramite.id} tramite={tramite} />
            ))}
          </div>
        </section>
      )}

      {!loading && !error && grupoB.length > 0 && (
        <section className="mb-10">
          <div className="mb-5">
            <h2 className="text-2xl font-bold text-gray-900">Grupo B</h2>
            <p className="text-gray-600">Programas que permiten preparar documentos y avanzar digitalmente.</p>
          </div>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {grupoB.map((tramite) => (
              <ProgramaCard key={tramite.id} tramite={tramite} />
            ))}
          </div>
        </section>
      )}

      <div className="grid md:grid-cols-2 gap-4 mt-10">
        <Link
          to="/diagnostico"
          className="rounded-2xl border border-gray-200 bg-white px-6 py-4 text-center font-semibold text-gray-800 hover:bg-gray-50 transition-all"
        >
          Hacer diagnóstico personalizado
        </Link>
        <Link
          to="/chat"
          className="rounded-2xl px-6 py-4 text-center font-semibold text-white transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(to right, #410016, #7a0028)' }}
        >
          Preguntar al asistente sobre un programa
        </Link>
      </div>
    </div>
  )
}

function ResumenCard({ label, value, helper, tone }) {
  const tones = {
    rose: 'bg-rose-50 border-rose-200 text-[#410016]',
    amber: 'bg-amber-50 border-amber-200 text-amber-700',
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  }

  return (
    <div className={`rounded-2xl border p-5 ${tones[tone] || tones.rose}`}>
      <p className="text-sm font-semibold opacity-80 mb-2">{label}</p>
      <p className="text-3xl font-black">{value}</p>
      {helper && <p className="text-sm mt-1 opacity-80">{helper}</p>}
    </div>
  )
}

function ProgramaCard({ tramite }) {
  const flujo = tramite.flujo_ui || resolveFlujo(tramite)
  const esAdminVirtual = flujo === 'admin_virtual'

  return (
    <article className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all overflow-hidden h-full flex flex-col">
      <div className="p-6 flex-1">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-gray-100 text-gray-700 capitalize">
            {formatModalidad(tramite.modalidad)}
          </span>
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${esAdminVirtual ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
            {flujo === 'admin_virtual' ? 'Trámite en línea con revisión' : 'Solo guía'}
          </span>
        </div>

        <h3 className="text-xl font-black text-gray-900 mb-3 min-h-[3.5rem]">
          {tramite.nombre}
        </h3>
        <p className="text-sm text-gray-600 mb-5 leading-relaxed">
          {tramite.descripcion || 'Sin descripción disponible.'}
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          <InfoMini label="Monto" value={tramite.monto || 'No especificado'} />
          <InfoMini label="Periodicidad" value={tramite.periodicidad || 'No especificada'} capitalize />
          <InfoMini label="Dependencia" value={tramite.dependencia || 'No especificada'} full />
          {tramite.tipo_documento_generado && (
            <InfoMini label="Documento generado" value={tramite.tipo_documento_generado} full />
          )}
        </div>
      </div>

      <div className="px-6 pb-6 pt-2">
        <Link
          to={esAdminVirtual ? `/tramites/${tramite.id}?paso=documentos` : `/tramites/${tramite.id}`}
          className="block w-full rounded-xl px-4 py-3 text-center font-bold text-white transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(to right, #410016, #7a0028)' }}
        >
          {esAdminVirtual ? 'Preparar documentos' : 'Ver guía de trámite'}
        </Link>
      </div>
    </article>
  )
}

function InfoMini({ label, value, capitalize = false, full = false }) {
  return (
    <div className={`rounded-xl bg-gray-50 border border-gray-100 px-3 py-3 ${full ? 'sm:col-span-2' : ''}`}>
      <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">{label}</p>
      <p className={`text-sm font-semibold text-gray-900 ${capitalize ? 'capitalize' : ''}`}>
        {value}
      </p>
    </div>
  )
}
