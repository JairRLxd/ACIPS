import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix para los iconos de Leaflet en React
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Icono personalizado para la oficina (rojo)
const oficinaIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

// Icono personalizado para el usuario (azul)
const usuarioIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

// Componente para ajustar el mapa automáticamente
function MapBounds({ userLocation, officeLocation }) {
  const map = useMap()
  
  useEffect(() => {
    if (userLocation && officeLocation) {
      const bounds = L.latLngBounds([
        [userLocation.lat, userLocation.lng],
        [officeLocation.lat, officeLocation.lng]
      ])
      map.fitBounds(bounds, { padding: [50, 50] })
    } else if (officeLocation) {
      map.setView([officeLocation.lat, officeLocation.lng], 13)
    }
  }, [userLocation, officeLocation, map])
  
  return null
}

export default function MapaOficina({ modulo }) {
  const [mostrarMapa, setMostrarMapa] = useState(false)
  const [ubicacionUsuario, setUbicacionUsuario] = useState(null)
  const [cargandoUbicacion, setCargandoUbicacion] = useState(false)
  const [errorUbicacion, setErrorUbicacion] = useState(null)
  const [distancia, setDistancia] = useState(null)
  
  const direccion = modulo.direccion || 'Oficina de atención'
  const coordenadas = modulo.coordenadas || { lat: 19.432608, lng: -99.133209 }
  
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccion)}`
  
  const direccionesUrl = ubicacionUsuario 
    ? `https://www.google.com/maps/dir/${ubicacionUsuario.lat},${ubicacionUsuario.lng}/${coordenadas.lat},${coordenadas.lng}`
    : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(direccion)}`

  // Calcular distancia entre dos puntos (fórmula de Haversine)
  const calcularDistancia = (lat1, lon1, lat2, lon2) => {
    const R = 6371 // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  // Obtener ubicación del usuario
  const obtenerUbicacion = () => {
    if (!navigator.geolocation) {
      setErrorUbicacion('Tu navegador no soporta geolocalización')
      return
    }

    setCargandoUbicacion(true)
    setErrorUbicacion(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const ubicacion = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }
        setUbicacionUsuario(ubicacion)
        
        const dist = calcularDistancia(
          ubicacion.lat,
          ubicacion.lng,
          coordenadas.lat,
          coordenadas.lng
        )
        setDistancia(dist)
        
        setCargandoUbicacion(false)
      },
      (error) => {
        setCargandoUbicacion(false)
        switch(error.code) {
          case error.PERMISSION_DENIED:
            setErrorUbicacion('Permiso de ubicación denegado. Actívalo en la configuración de tu navegador.')
            break
          case error.POSITION_UNAVAILABLE:
            setErrorUbicacion('Ubicación no disponible.')
            break
          case error.TIMEOUT:
            setErrorUbicacion('Tiempo de espera agotado.')
            break
          default:
            setErrorUbicacion('Error al obtener ubicación.')
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  }

  // Obtener ubicación automáticamente al montar
  useEffect(() => {
    obtenerUbicacion()
  }, [])

  return (
    <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-3xl shadow-xl border-2 border-blue-100 p-8 mb-8">
      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
          style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}>
          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-2xl font-black text-gray-900 mb-2">📍 Ubicación del Módulo</h3>
          <p className="text-gray-600 font-medium">
            Encuentra la oficina más cercana y obtén direcciones
          </p>
          
          {/* Distancia */}
          {distancia && (
            <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-green-100 border-2 border-green-300 rounded-full animate-fade-in">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <span className="text-green-800 font-bold">
                A {distancia < 1 ? `${Math.round(distancia * 1000)} metros` : `${distancia.toFixed(1)} km`} de tu ubicación
              </span>
            </div>
          )}
          
          {/* Error de ubicación */}
          {errorUbicacion && (
            <div className="mt-3 flex items-center gap-2 text-sm text-amber-700 animate-fade-in">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{errorUbicacion}</span>
              <button
                onClick={obtenerUbicacion}
                className="ml-2 text-blue-600 hover:text-blue-700 font-semibold underline"
              >
                Reintentar
              </button>
            </div>
          )}
          
          {/* Cargando ubicación */}
          {cargandoUbicacion && (
            <div className="mt-3 flex items-center gap-2 text-sm text-blue-600 animate-fade-in">
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Obteniendo tu ubicación...</span>
            </div>
          )}
        </div>
      </div>

      {/* Información del módulo */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-blue-200">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <h4 className="font-bold text-gray-900">Dirección</h4>
            </div>
            <p className="text-gray-700 leading-relaxed">{direccion}</p>
          </div>

          {modulo.horario && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h4 className="font-bold text-gray-900">Horario de Atención</h4>
              </div>
              <p className="text-gray-700 leading-relaxed">{modulo.horario}</p>
            </div>
          )}

          {modulo.telefono && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <h4 className="font-bold text-gray-900">Teléfono</h4>
              </div>
              <a href={`tel:${modulo.telefono}`} className="text-blue-600 hover:text-blue-700 font-semibold">
                {modulo.telefono}
              </a>
            </div>
          )}

          {modulo.contacto && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <h4 className="font-bold text-gray-900">Contacto</h4>
              </div>
              <p className="text-gray-700">{modulo.contacto}</p>
            </div>
          )}
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => setMostrarMapa(!mostrarMapa)}
          className="flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-bold text-white transition-all duration-300 hover:shadow-xl hover:scale-105"
          style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          {mostrarMapa ? 'Ocultar Mapa' : 'Ver en Mapa'}
        </button>

        <a
          href={direccionesUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-bold text-white transition-all duration-300 hover:shadow-xl hover:scale-105"
          style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
          Cómo Llegar
        </a>

        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-bold bg-white border-2 border-blue-200 text-blue-600 hover:bg-blue-50 transition-all duration-300 hover:shadow-lg hover:scale-105"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          Abrir en Google Maps
        </a>
      </div>

      {/* Mapa interactivo con Leaflet */}
      {mostrarMapa && (
        <div className="mt-6 animate-fade-in">
          <div className="bg-white rounded-2xl p-4 shadow-lg border-2 border-blue-200">
            <div className="relative w-full h-[400px] rounded-xl overflow-hidden">
              <MapContainer
                center={[coordenadas.lat, coordenadas.lng]}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
                className="rounded-xl"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {/* Marcador de la oficina (rojo) */}
                <Marker position={[coordenadas.lat, coordenadas.lng]} icon={oficinaIcon}>
                  <Popup>
                    <div className="text-center">
                      <p className="font-bold text-red-700">📍 Oficina</p>
                      <p className="text-sm text-gray-700">{direccion}</p>
                    </div>
                  </Popup>
                </Marker>
                
                {/* Marcador del usuario (azul) */}
                {ubicacionUsuario && (
                  <Marker position={[ubicacionUsuario.lat, ubicacionUsuario.lng]} icon={usuarioIcon}>
                    <Popup>
                      <div className="text-center">
                        <p className="font-bold text-blue-700">📍 Tu ubicación</p>
                        <p className="text-sm text-gray-700">Estás aquí</p>
                      </div>
                    </Popup>
                  </Marker>
                )}
                
                {/* Ajustar vista automáticamente */}
                <MapBounds userLocation={ubicacionUsuario} officeLocation={coordenadas} />
              </MapContainer>
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                💡 <span className="font-semibold">Tip:</span> Haz clic en "Cómo Llegar" para obtener direcciones desde tu ubicación actual
              </p>
              {ubicacionUsuario && (
                <div className="mt-2 flex items-center justify-center gap-2">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-xs text-gray-600">Tu ubicación</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-xs text-gray-600">Oficina</span>
                  </div>
                </div>
              )}
              {ubicacionUsuario && (
                <p className="text-xs text-green-600 mt-2">
                  ✓ Tu ubicación está siendo usada para calcular la ruta más rápida
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Información adicional */}
      <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-gray-700">
            <p className="font-bold mb-1">Recomendaciones:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>Llega con 15 minutos de anticipación</li>
              <li>Lleva todos los documentos originales y copias</li>
              <li>Verifica el horario de atención antes de acudir</li>
              <li>Puedes llamar para confirmar disponibilidad</li>
              {distancia && distancia > 10 && (
                <li className="text-amber-600 font-semibold">⚠️ La oficina está a más de 10 km, considera el tiempo de traslado</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
