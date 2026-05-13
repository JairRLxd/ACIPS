import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { obtenerTramites } from '../repositories/tramitesRepository'

const PROFILE_LABELS = {
  edad: 'Edad',
  sexo: 'Sexo',
  zona_rural: 'Zona rural',
  tiene_seguridad_social: 'Seguridad social',
  nivel_ingreso: 'Ingreso mensual',
  tiene_discapacidad: 'Discapacidad',
  estudia_actualmente: 'Estudia actualmente',
  situacion_laboral: 'Situación laboral',
  hijos_menores_18: 'Hijos menores de 18',
  vivienda_precaria: 'Vivienda precaria',
  nivel_educativo: 'Nivel educativo',
  tiene_tierra_agricola: 'Tierra agrícola',
  produce_maiz_frijol: 'Produce maíz o frijol',
  tiene_hijo_menor_6: 'Hijo menor de 6 años',
  es_jefa_hogar: 'Jefa de hogar',
  recibio_subsidio_vivienda: 'Subsidio de vivienda previo',
  tiene_micronegocio: 'Micronegocio',
}

const PROFILE_VALUE_LABELS = {
  sexo: { M: 'Masculino', F: 'Femenino' },
  nivel_ingreso: {
    sin_ingreso: 'Sin ingreso',
    muy_bajo: 'Muy bajo',
    bajo: 'Bajo',
    medio: 'Medio',
    alto: 'Alto',
  },
  situacion_laboral: {
    empleado_formal: 'Empleado formal',
    empleado_informal: 'Empleado informal',
    desempleado: 'Desempleado',
    independiente: 'Independiente',
  },
  nivel_educativo: {
    primaria: 'Primaria',
    secundaria: 'Secundaria',
    media_superior: 'Media superior',
    superior: 'Superior',
  },
}

function formatProfileValue(key, value) {
  if (typeof value === 'boolean') return value ? 'Sí' : 'No'
  if (PROFILE_VALUE_LABELS[key]?.[value]) return PROFILE_VALUE_LABELS[key][value]
  return value === '' ? 'No aplica' : value
}

function resolveFlujo(programa) {
  return programa?.grupo === 'B' || programa?.permite_envio_virtual ? 'admin_virtual' : 'solo_guia'
}

export default function Resultados() {
  const navigate = useNavigate()
  const { resultados, perfilUsuario } = useApp()
  const [tramitesSecundarios, setTramitesSecundarios] = useState([])
  const programas = useMemo(
    () => (resultados?.programas || []).map((programa) => ({ ...programa, flujo_ui: resolveFlujo(programa) })),
    [resultados]
  )
  const recomendadosPresenciales = useMemo(
    () => (resultados?.recomendados_presenciales || []).map((programa) => ({ ...programa, flujo_ui: resolveFlujo(programa) })),
    [resultados]
  )
  const resumenRecomendacion = resultados?.resumen_recomendacion || null
  const programasGrupoA = programas.filter((programa) => programa.flujo_ui === 'solo_guia')
  const programasGrupoB = programas.filter((programa) => programa.flujo_ui === 'admin_virtual')
  const visibleProfileFields = useMemo(() => {
    if (!perfilUsuario) return []
    const explicitFields = Array.isArray(perfilUsuario._visibleFields) ? perfilUsuario._visibleFields : []
    if (explicitFields.length > 0) return explicitFields
    return Object.keys(perfilUsuario).filter((key) => !key.startsWith('_'))
  }, [perfilUsuario])

  useEffect(() => {
    if (!resultados || !Array.isArray(resultados.programas)) {
      navigate('/diagnostico')
    }
  }, [resultados, navigate])

  useEffect(() => {
    const cargarSecundarios = async () => {
      if (!Array.isArray(resultados?.programas)) return
      try {
        const response = await obtenerTramites()
        const catalogo = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data?.tramites)
            ? response.data.tramites
          : Array.isArray(response.data?.programas)
            ? response.data.programas
            : []

        const idsPrincipales = new Set(programas.map((programa) => programa.id))
        const secundarios = catalogo
          .filter((tramite) => tramite?.id && !idsPrincipales.has(tramite.id))
          .slice(0, 6)

        setTramitesSecundarios(secundarios)
      } catch (error) {
        console.error('No se pudieron cargar los trámites secundarios:', error)
        setTramitesSecundarios([])
      }
    }

    cargarSecundarios()
  }, [resultados, programas])

  if (!resultados || !Array.isArray(resultados.programas)) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="text-center mb-8 fade-in">
        <h1 className="text-4xl font-bold mb-4" style={{ color: '#410016' }}>
          Tus Resultados
        </h1>
        <p className="text-xl text-gray-700">
          Basado en tu perfil, estos son los programas sociales compatibles contigo
        </p>
      </div>

      {perfilUsuario && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8 fade-in shadow-sm">
          <h3 className="text-xl font-bold text-gray-800 mb-3">
            Tu perfil evaluado
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-gray-700">
            {visibleProfileFields.map((key) => (
              <div key={key} className="rounded-xl bg-gray-50 px-4 py-3 border border-gray-100">
                <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                  {PROFILE_LABELS[key] || key}
                </p>
                <p className="font-semibold text-gray-900">
                  {formatProfileValue(key, perfilUsuario[key])}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {programas.length > 0 ? (
        <>
          <div className="bg-green-50 border border-green-200 text-green-800 px-6 py-4 rounded-2xl mb-8 fade-in">
            <p className="text-lg font-semibold">
              Encontramos {resultados.total ?? programas.length} programa(s) para ti.
            </p>
          </div>

          {recomendadosPresenciales.length > 0 && (
            <section className="mb-10">
              <div className="mb-5">
                <h2 className="text-2xl font-bold text-gray-900">Trámites recomendados para iniciar</h2>
                <p className="text-gray-600">
                  {resumenRecomendacion?.descripcion || 'Priorizamos las opciones más simples para comenzar tu proceso.'}
                </p>
              </div>
              <div className="space-y-6">
                {recomendadosPresenciales.map((programa) => (
                  <ResultadoCard key={programa.id} resultado={programa} />
                ))}
              </div>
            </section>
          )}

          <section className="mb-10">
            <div className="mb-5">
              <h2 className="text-2xl font-bold text-gray-900">Todos los programas elegibles</h2>
              <p className="text-gray-600">Aquí tienes el catálogo completo de opciones compatibles con tu perfil.</p>
            </div>
            <div className="space-y-6">
              {programas.map((programa) => (
                <ResultadoCard key={`all-${programa.id}`} resultado={programa} />
              ))}
            </div>
          </section>

          {programasGrupoA.length > 0 && (
            <section className="mb-10">
              <div className="mb-5">
                <h2 className="text-2xl font-bold text-gray-900">Grupo A</h2>
                <p className="text-gray-600">Programas con atención presencial en módulo.</p>
              </div>
              <div className="space-y-6">
                {programasGrupoA.map((programa) => (
                  <ResultadoCard key={programa.id} resultado={programa} />
                ))}
              </div>
            </section>
          )}

          {programasGrupoB.length > 0 && (
            <section>
              <div className="mb-5">
                <h2 className="text-2xl font-bold text-gray-900">Grupo B</h2>
                <p className="text-gray-600">Programas que permiten avanzar con generación de documento.</p>
              </div>
              <div className="space-y-6">
                {programasGrupoB.map((programa) => (
                  <ResultadoCard key={programa.id} resultado={programa} />
                ))}
              </div>
            </section>
          )}

          {tramitesSecundarios.length > 0 && (
            <section className="mt-10">
              <div className="mb-5">
                <h2 className="text-2xl font-bold text-gray-900">Otras opciones que podrían interesarte</h2>
                <p className="text-gray-600">
                  Estas alternativas no son tu coincidencia principal, pero pueden servirte como trámites relacionados o complementarios.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {tramitesSecundarios.map((tramite) => (
                  <SecondaryOptionCard key={tramite.id} tramite={tramite} />
                ))}
              </div>
            </section>
          )}
        </>
      ) : (
        <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 px-6 py-4 rounded-2xl mb-8">
          <p className="text-lg font-semibold">
            No encontramos programas compatibles con tu perfil actual.
          </p>
          <p className="mt-2">
            Te recomendamos hablar con nuestro asistente para explorar otras opciones.
          </p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4 mt-8">
        <Link
          to="/diagnostico"
          className="bg-gray-100 text-gray-800 px-6 py-3 rounded-2xl text-center font-semibold hover:bg-gray-200 transition-all"
        >
          ← Nuevo diagnóstico
        </Link>
        <Link
          to="/chat"
          className="text-white px-6 py-3 rounded-2xl text-center font-semibold transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #410016, #7a0028)' }}
        >
          Consultar con asistente
        </Link>
      </div>
    </div>
  )
}

function ResultadoCard({ resultado }) {
  const flujo = resultado.flujo_ui || resolveFlujo(resultado)
  const esAdminVirtual = flujo === 'admin_virtual'

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden fade-in hover:shadow-xl transition-all">
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
          <h3 className="text-2xl font-bold text-gray-800 mb-2 md:mb-0">
            {resultado.nombre}
          </h3>
          <div className="flex flex-wrap gap-2">
            {resultado.modalidad && (
              <span className="inline-block px-4 py-2 rounded-full bg-gray-100 text-gray-700 font-semibold capitalize">
                {resultado.modalidad}
              </span>
            )}
            <span className={`inline-block px-4 py-2 rounded-full font-semibold ${esAdminVirtual ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
              {esAdminVirtual ? 'Genera tu documento' : 'Trámite presencial'}
            </span>
          </div>
        </div>

        <p className="text-gray-700 text-lg mb-4">{resultado.descripcion}</p>

        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-gray-500 mb-1">Monto</p>
            <p className="text-green-800 font-semibold text-lg">
              {resultado.monto || 'No especificado'}
            </p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-gray-500 mb-1">Periodicidad</p>
            <p className="text-blue-800 font-semibold text-lg capitalize">
              {resultado.periodicidad || 'No especificada'}
            </p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-500 mb-1">Dependencia</p>
            <p className="text-gray-800 font-semibold text-lg">
              {resultado.dependencia || 'No especificada'}
            </p>
          </div>
        </div>

        {resultado.tipo_documento_generado && (
          <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
            <p className="font-semibold text-blue-900">
              Documento que se generará: {resultado.tipo_documento_generado}
            </p>
          </div>
        )}

        {resultado.modulo_atencion && !esAdminVirtual && (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="font-semibold text-amber-900">
              Acude al módulo: {resultado.modulo_atencion}
            </p>
          </div>
        )}

        {resultado.documentos_requeridos && resultado.documentos_requeridos.length > 0 && (
          <div className="mb-4">
            <h4 className="font-semibold text-gray-800 mb-2">
              Documentos requeridos
            </h4>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              {resultado.documentos_requeridos.map((documento, idx) => (
                <li key={documento.id || idx}>
                  {documento.nombre || documento.tipo || 'Documento requerido'}
                </li>
              ))}
            </ul>
          </div>
        )}

        {resultado.url_oficial && (
          <div className="mb-4 text-gray-700">
            <a
              href={resultado.url_oficial}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-blue-700 hover:underline"
            >
              Ver sitio oficial
            </a>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to={`/tramites/${resultado.id}`}
            className="flex-1 text-white px-6 py-3 rounded-lg text-center font-semibold transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #410016, #7a0028)' }}
          >
            {esAdminVirtual ? 'Generar documento' : 'Iniciar trámite'}
          </Link>
          <Link
            to="/chat"
            className="flex-1 bg-white text-gray-700 border-2 border-gray-200 px-6 py-3 rounded-lg text-center font-semibold hover:bg-gray-50 transition-all"
          >
            Consultar con asistente
          </Link>
        </div>
      </div>
    </div>
  )
}

function SecondaryOptionCard({ tramite }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center justify-between gap-3 mb-3">
        <h3 className="text-lg font-bold text-gray-900">{tramite.nombre}</h3>
        {tramite.grupo && (
          <span className="inline-block px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm font-semibold">
            Grupo {tramite.grupo}
          </span>
        )}
      </div>

      <p className="text-gray-600 text-sm mb-4">
        {tramite.descripcion || 'Trámite adicional disponible en el catálogo.'}
      </p>

      <div className="space-y-1 text-sm text-gray-500 mb-4">
        {tramite.dependencia && <p>Dependencia: {tramite.dependencia}</p>}
        {tramite.monto && <p>Monto: {tramite.monto}</p>}
      </div>

      <Link
        to={`/tramites/${tramite.id}`}
        className="inline-flex items-center justify-center w-full bg-white text-blue-600 border-2 border-blue-600 px-4 py-3 rounded-lg text-center font-semibold hover:bg-blue-50 transition-all"
      >
        Ver esta opción
      </Link>
    </div>
  )
}
