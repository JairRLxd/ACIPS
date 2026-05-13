import { createContext, useContext, useState, useEffect } from 'react'

const AppContext = createContext()

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp debe usarse dentro de AppProvider')
  }
  return context
}

export const AppProvider = ({ children }) => {
  const [perfilUsuario, setPerfilUsuario] = useState(null)
  const [resultados, setResultados] = useState(null)
  const [modoAdultoMayor, setModoAdultoMayor] = useState(false)

  // Cargar modo adulto mayor de localStorage
  useEffect(() => {
    const modoGuardado = localStorage.getItem('modoAdultoMayor')
    if (modoGuardado === 'true') {
      setModoAdultoMayor(true)
      document.body.classList.add('modo-adulto-mayor')
    }
  }, [])

  const toggleModoAdultoMayor = () => {
    const nuevoModo = !modoAdultoMayor
    setModoAdultoMayor(nuevoModo)
    
    if (nuevoModo) {
      document.body.classList.add('modo-adulto-mayor')
      localStorage.setItem('modoAdultoMayor', 'true')
    } else {
      document.body.classList.remove('modo-adulto-mayor')
      localStorage.removeItem('modoAdultoMayor')
    }
  }

  const value = {
    perfilUsuario,
    setPerfilUsuario,
    resultados,
    setResultados,
    modoAdultoMayor,
    toggleModoAdultoMayor,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
