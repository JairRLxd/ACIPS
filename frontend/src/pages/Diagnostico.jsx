import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { evaluarElegibilidad } from '../repositories/elegibilidadRepository'

const FIXED_QUESTIONS = [
  {
    number: 1,
    field: 'edad',
    label: '¿Cuántos años tienes?',
    help: 'Esta información nos ayuda a identificar programas según tu edad.',
    type: 'number',
    min: 0,
    placeholder: 'Ejemplo: 22',
  },
  {
    number: 2,
    field: 'sexo',
    label: '¿Cuál es tu sexo?',
    help: 'Algunos apoyos tienen criterios específicos por sexo.',
    type: 'choice',
    options: [
      { value: 'M', label: 'Masculino' },
      { value: 'F', label: 'Femenino' },
    ],
  },
  {
    number: 3,
    field: 'zona_rural',
    label: '¿Vives en zona rural?',
    help: 'Esto activa programas pensados para comunidades rurales.',
    type: 'boolean',
  },
  {
    number: 4,
    field: 'tiene_seguridad_social',
    label: '¿Tienes seguridad social (IMSS/ISSSTE)?',
    help: 'Nos ayuda a distinguir apoyos complementarios o sustitutivos.',
    type: 'boolean',
  },
  {
    number: 5,
    field: 'nivel_ingreso',
    label: '¿Cuál es tu nivel de ingreso mensual?',
    help: 'Esto determina tu elegibilidad para ciertos programas.',
    type: 'choice',
    options: [
      { value: 'sin_ingreso', label: 'Sin ingreso' },
      { value: 'muy_bajo', label: 'Muy bajo' },
      { value: 'bajo', label: 'Bajo' },
      { value: 'medio', label: 'Medio' },
      { value: 'alto', label: 'Alto' },
    ],
  },
  {
    number: 6,
    field: 'tiene_discapacidad',
    label: '¿Tienes alguna discapacidad?',
    help: 'Hay apoyos especiales para personas con discapacidad.',
    type: 'boolean',
  },
  {
    number: 7,
    field: 'estudia_actualmente',
    label: '¿Estudias actualmente?',
    help: 'Existen becas y apoyos específicos para estudiantes.',
    type: 'boolean',
  },
  {
    number: 8,
    field: 'situacion_laboral',
    label: '¿Cuál es tu situación laboral?',
    help: 'Esto ayuda a evaluar programas de empleo y apoyo económico.',
    type: 'choice',
    options: [
      { value: 'empleado_formal', label: 'Empleado formal' },
      { value: 'empleado_informal', label: 'Empleado informal' },
      { value: 'desempleado', label: 'Desempleado' },
      { value: 'independiente', label: 'Independiente' },
    ],
  },
  {
    number: 9,
    field: 'hijos_menores_18',
    label: '¿Cuántos hijos menores de 18 años tienes?',
    help: 'Nos permite identificar apoyos familiares y de crianza.',
    type: 'number',
    min: 0,
    placeholder: 'Ejemplo: 0',
  },
  {
    number: 10,
    field: 'vivienda_precaria',
    label: '¿Tu vivienda es precaria o de autoconstrucción?',
    help: 'Esto activa programas de vivienda y mejoramiento.',
    type: 'boolean',
  },
]

const CONDITIONAL_QUESTIONS = [
  {
    number: 'C1',
    field: 'nivel_educativo',
    label: '¿Qué nivel educativo cursas actualmente?',
    help: 'Solo se solicita si actualmente estudias.',
    type: 'choice',
    condition: (data) => data.estudia_actualmente === true,
    options: [
      { value: 'primaria', label: 'Primaria' },
      { value: 'secundaria', label: 'Secundaria' },
      { value: 'media_superior', label: 'Media superior' },
      { value: 'superior', label: 'Superior' },
    ],
  },
  {
    number: 'C2',
    field: 'tiene_tierra_agricola',
    label: '¿Tienes tierra agrícola?',
    help: 'Solo aplica para personas que viven en zona rural.',
    type: 'boolean',
    condition: (data) => data.zona_rural === true,
  },
  {
    number: 'C3',
    field: 'produce_maiz_frijol',
    label: '¿Produces maíz o frijol?',
    help: 'Solo aplica para personas que viven en zona rural.',
    type: 'boolean',
    condition: (data) => data.zona_rural === true,
  },
  {
    number: 'C4',
    field: 'tiene_hijo_menor_6',
    label: '¿Tienes algún hijo menor de 6 años?',
    help: 'Solo se solicita si tienes hijos menores de 18 años.',
    type: 'boolean',
    condition: (data) => Number(data.hijos_menores_18) > 0,
  },
  {
    number: 'C5',
    field: 'es_jefa_hogar',
    label: '¿Eres jefa de hogar o el único sustento del hogar?',
    help: 'Solo aplica para mujeres con hijos menores de 18 años.',
    type: 'boolean',
    condition: (data) => data.sexo === 'F' && Number(data.hijos_menores_18) > 0,
  },
  {
    number: 'C6',
    field: 'recibio_subsidio_vivienda',
    label: '¿Has recibido antes un subsidio de vivienda?',
    help: 'Solo se solicita si tu vivienda es precaria o de autoconstrucción.',
    type: 'boolean',
    condition: (data) => data.vivienda_precaria === true,
  },
  {
    number: 'C7',
    field: 'tiene_micronegocio',
    label: '¿Tienes un micronegocio o actividad propia?',
    help: 'Ayuda a evaluar apoyos productivos o de autoempleo.',
    type: 'boolean',
    condition: (data) => ['empleado_informal', 'independiente'].includes(data.situacion_laboral),
  },
]

const INITIAL_FORM_DATA = {
  edad: '',
  sexo: '',
  zona_rural: null,
  tiene_seguridad_social: null,
  nivel_ingreso: '',
  tiene_discapacidad: null,
  estudia_actualmente: null,
  situacion_laboral: '',
  hijos_menores_18: '',
  vivienda_precaria: null,
  nivel_educativo: '',
  tiene_tierra_agricola: false,
  produce_maiz_frijol: false,
  tiene_hijo_menor_6: false,
  es_jefa_hogar: false,
  recibio_subsidio_vivienda: false,
  tiene_micronegocio: false,
}

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

function pruneConditionalAnswers(data) {
  const nextData = { ...data }

  if (nextData.estudia_actualmente !== true) nextData.nivel_educativo = ''
  if (nextData.zona_rural !== true) {
    nextData.tiene_tierra_agricola = false
    nextData.produce_maiz_frijol = false
  }
  if (!(Number(nextData.hijos_menores_18) > 0)) {
    nextData.tiene_hijo_menor_6 = false
  }
  if (!(nextData.sexo === 'F' && Number(nextData.hijos_menores_18) > 0)) {
    nextData.es_jefa_hogar = false
  }
  if (nextData.vivienda_precaria !== true) nextData.recibio_subsidio_vivienda = false
  if (!['empleado_informal', 'independiente'].includes(nextData.situacion_laboral)) {
    nextData.tiene_micronegocio = false
  }

  return nextData
}

function isAnswered(question, value) {
  if (question.type === 'number') return value !== '' && value !== null
  return value !== '' && value !== null
}

function buildPayload(data) {
  return {
    edad: Number(data.edad),
    sexo: data.sexo,
    zona_rural: data.zona_rural,
    tiene_seguridad_social: data.tiene_seguridad_social,
    nivel_ingreso: data.nivel_ingreso,
    tiene_discapacidad: data.tiene_discapacidad,
    estudia_actualmente: data.estudia_actualmente,
    situacion_laboral: data.situacion_laboral,
    hijos_menores_18: Number(data.hijos_menores_18),
    vivienda_precaria: data.vivienda_precaria,
    nivel_educativo: data.nivel_educativo,
    tiene_tierra_agricola: data.tiene_tierra_agricola,
    produce_maiz_frijol: data.produce_maiz_frijol,
    tiene_hijo_menor_6: data.tiene_hijo_menor_6,
    es_jefa_hogar: data.es_jefa_hogar,
    recibio_subsidio_vivienda: data.recibio_subsidio_vivienda,
    tiene_micronegocio: data.tiene_micronegocio,
  }
}

function formatBooleanLabel(value) {
  return value ? 'Sí' : 'No'
}

export default function Diagnostico() {
  const navigate = useNavigate()
  const { setPerfilUsuario, setResultados } = useApp()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState(INITIAL_FORM_DATA)

  const visibleConditionalQuestions = useMemo(
    () => CONDITIONAL_QUESTIONS.filter((question) => question.condition(formData)),
    [formData]
  )

  const fixedAnswered = FIXED_QUESTIONS.filter((question) =>
    isAnswered(question, formData[question.field])
  ).length
  const conditionalAnswered = visibleConditionalQuestions.filter((question) =>
    isAnswered(question, formData[question.field])
  ).length
  const totalVisibleQuestions = FIXED_QUESTIONS.length + visibleConditionalQuestions.length
  const totalAnsweredQuestions = fixedAnswered + conditionalAnswered

  const handleChange = (field, value) => {
    setFormData((current) => pruneConditionalAnswers({ ...current, [field]: value }))
    setError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    const missingFixed = FIXED_QUESTIONS.some((question) => !isAnswered(question, formData[question.field]))
    const missingConditional = visibleConditionalQuestions.some((question) => !isAnswered(question, formData[question.field]))

    if (missingFixed || missingConditional) {
      setError('Por favor completa todas las preguntas visibles antes de continuar.')
      return
    }

    setLoading(true)

    try {
      const payload = buildPayload(formData)
      const response = await evaluarElegibilidad(payload)

      if (response.data) {
        setPerfilUsuario({
          ...payload,
          _visibleFields: [
            ...FIXED_QUESTIONS.map((question) => question.field),
            ...visibleConditionalQuestions.map((question) => question.field),
          ],
        })
        setResultados(response.data)
        navigate('/resultados')
      } else {
        setError('No se pudo procesar el diagnóstico.')
      }
    } catch (err) {
      console.error('Error:', err)
      const errorMsg = err.response?.data?.error || 'Error de conexión. Verifica que el backend esté corriendo.'
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-pink-50 py-20 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-12 animate-fade-in-up">
          <div className="inline-block mb-6">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl"
              style={{ background: 'linear-gradient(135deg, #410016, #7a0028)' }}
            >
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-4 leading-tight">
            Diagnóstico de Elegibilidad
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Responde el diagnóstico guiado para descubrir qué apoyos te corresponden
          </p>

          <div className="mt-8 max-w-md mx-auto">
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span>Progreso</span>
              <span>{totalAnsweredQuestions}/{totalVisibleQuestions}</span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full transition-all duration-500 rounded-full"
                style={{
                  width: `${totalVisibleQuestions > 0 ? (totalAnsweredQuestions / totalVisibleQuestions) * 100 : 0}%`,
                  background: 'linear-gradient(to right, #410016, #7a0028)',
                }}
              />
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 md:p-12 border border-white">
          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="space-y-10">
              {FIXED_QUESTIONS.map((question) => (
                <QuestionCard
                  key={question.field}
                  question={question}
                  value={formData[question.field]}
                  onChange={handleChange}
                />
              ))}
            </div>

            {visibleConditionalQuestions.length > 0 && (
              <div className="rounded-3xl border border-rose-100 bg-rose-50/60 p-6 md:p-8">
                <div className="mb-8">
                  <p className="text-sm font-bold uppercase tracking-[0.25em] text-[#7a0028] mb-2">
                    Preguntas adicionales
                  </p>
                  <h2 className="text-3xl font-black text-gray-900 mb-2">
                    Ajustamos el diagnóstico a tu perfil
                  </h2>
                  <p className="text-gray-600">
                    Estas preguntas solo aparecen cuando aplican a tu situación.
                  </p>
                </div>

                <div className="space-y-10">
                  {visibleConditionalQuestions.map((question) => (
                    <QuestionCard
                      key={question.field}
                      question={question}
                      value={formData[question.field]}
                      onChange={handleChange}
                    />
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-2xl animate-fade-in">
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-700 font-medium">{error}</p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 px-8 text-white font-black text-xl rounded-2xl shadow-2xl hover:shadow-3xl transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              style={{ background: 'linear-gradient(135deg, #410016, #7a0028)' }}
            >
              {loading ? (
                <>
                  <svg className="inline w-6 h-6 mr-3 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Analizando tu perfil...
                </>
              ) : (
                <>
                  Ver programas compatibles
                  <svg className="inline w-6 h-6 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

function QuestionCard({ question, value, onChange }) {
  return (
    <div className="group animate-fade-in-up">
      <div className="flex items-start gap-4 mb-4">
        <div
          className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg"
          style={{ background: 'linear-gradient(135deg, #410016, #7a0028)' }}
        >
          {question.number}
        </div>
        <div className="flex-1">
          <label className="block text-2xl font-bold text-gray-900 mb-2">
            {question.label}
          </label>
          <p className="text-gray-500 text-sm">{question.help}</p>
        </div>
      </div>

      {question.type === 'number' && (
        <input
          type="number"
          min={question.min ?? 0}
          value={value}
          onChange={(e) => onChange(question.field, e.target.value)}
          className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:border-[#410016] focus:outline-none transition-all duration-300 hover:border-gray-300"
          placeholder={question.placeholder}
        />
      )}

      {question.type === 'choice' && (
        <div className="grid gap-4 sm:grid-cols-2">
          {question.options.map((option) => {
            const active = value === option.value
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onChange(question.field, option.value)}
                className={`py-5 px-6 text-lg font-bold rounded-2xl border-2 transition-all duration-300 text-left ${
                  active
                    ? 'text-white border-[#410016] shadow-lg scale-[1.02]'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-[#410016]'
                }`}
                style={active ? { background: 'linear-gradient(135deg, #410016, #7a0028)' } : {}}
              >
                {option.label}
              </button>
            )
          })}
        </div>
      )}

      {question.type === 'boolean' && (
        <div className="grid grid-cols-2 gap-4">
          {[true, false].map((option) => {
            const active = value === option
            return (
              <button
                key={String(option)}
                type="button"
                onClick={() => onChange(question.field, option)}
                className={`py-5 px-6 text-lg font-bold rounded-2xl border-2 transition-all duration-300 ${
                  active
                    ? 'text-white border-[#410016] shadow-lg scale-105'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-[#410016] hover:scale-105'
                }`}
                style={active ? { background: 'linear-gradient(135deg, #410016, #7a0028)' } : {}}
              >
                <svg className="w-6 h-6 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {option ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  )}
                </svg>
                {formatBooleanLabel(option)}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
