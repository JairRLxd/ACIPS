import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Diagnostico from './pages/Diagnostico'
import Resultados from './pages/Resultados'
import Chatbot from './pages/Chatbot'
import WhatsAppChat from './pages/WhatsAppChat'
import Tramite from './pages/Tramite'
import MisSolicitudes from './pages/MisSolicitudes'
import Perfil from './pages/Perfil'
import Login from './pages/Login'
import Registro from './pages/Registro'
import AdminHome from './features/admin/pages/AdminHome'
import Solicitudes from './features/admin/pages/Solicitudes'
import ValidacionDocumentos from './features/admin/pages/ValidacionDocumentos'
import Usuarios from './features/admin/pages/Usuarios'
import Programas from './features/admin/pages/Programas'
import Constancias from './features/admin/pages/Constancias'
import Incidencias from './features/admin/pages/Incidencias'
import Reportes from './features/admin/pages/Reportes'

// Guard: solo admins pueden acceder a /admin
function AdminGuard({ children }) {
  const { currentUser, backendUser, loading } = useAuth()
  if (loading) return null
  if (!currentUser) return <Navigate to="/login" replace />
  if (backendUser && backendUser.rol !== 'admin') return <Navigate to="/" replace />
  return children
}

// Layout del cliente (Navbar + contenido)
function ClientLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-20">{children}</main>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          <Routes>
            {/* Rutas del cliente */}
            <Route path="/" element={<ClientLayout><Home /></ClientLayout>} />
            <Route path="/diagnostico" element={<ClientLayout><Diagnostico /></ClientLayout>} />
            <Route path="/resultados" element={<ClientLayout><Resultados /></ClientLayout>} />
            <Route path="/chat" element={<ClientLayout><Chatbot /></ClientLayout>} />
            <Route path="/whatsapp" element={<WhatsAppChat />} />
            <Route path="/tramite/:id" element={<ClientLayout><Tramite /></ClientLayout>} />
            <Route path="/mis-solicitudes" element={<ClientLayout><MisSolicitudes /></ClientLayout>} />
            <Route path="/perfil" element={<ClientLayout><Perfil /></ClientLayout>} />
            <Route path="/login" element={<ClientLayout><Login /></ClientLayout>} />
            <Route path="/registro" element={<ClientLayout><Registro /></ClientLayout>} />

            {/* Rutas del admin — protegidas por rol */}
            <Route path="/admin" element={<AdminGuard><AdminHome /></AdminGuard>} />
            <Route path="/admin/solicitudes" element={<AdminGuard><Solicitudes /></AdminGuard>} />
            <Route path="/admin/validacion" element={<AdminGuard><ValidacionDocumentos /></AdminGuard>} />
            <Route path="/admin/usuarios" element={<AdminGuard><Usuarios /></AdminGuard>} />
            <Route path="/admin/programas" element={<AdminGuard><Programas /></AdminGuard>} />
            <Route path="/admin/constancias" element={<AdminGuard><Constancias /></AdminGuard>} />
            <Route path="/admin/incidencias" element={<AdminGuard><Incidencias /></AdminGuard>} />
            <Route path="/admin/reportes" element={<AdminGuard><Reportes /></AdminGuard>} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  )
}

export default App
