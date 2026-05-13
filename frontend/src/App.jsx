import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Diagnostico from './pages/Diagnostico'
import Resultados from './pages/Resultados'
import Chatbot from './pages/Chatbot'
import Tramite from './pages/Tramite'
import MisSolicitudes from './pages/MisSolicitudes'
import Login from './pages/Login'
import Registro from './pages/Registro'

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="pt-20">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/diagnostico" element={<Diagnostico />} />
                <Route path="/resultados" element={<Resultados />} />
                <Route path="/chat" element={<Chatbot />} />
                <Route path="/tramite/:id" element={<Tramite />} />
                <Route path="/mis-solicitudes" element={<MisSolicitudes />} />
                <Route path="/login" element={<Login />} />
                <Route path="/registro" element={<Registro />} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  )
}

export default App
