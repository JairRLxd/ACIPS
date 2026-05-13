import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Programas from './pages/Programas'
import Diagnostico from './pages/Diagnostico'
import Resultados from './pages/Resultados'
import Chatbot from './pages/Chatbot'
import Tramite from './pages/Tramite'
import MisSolicitudes from './pages/MisSolicitudes'
import MiWallet from './pages/MiWallet'
import Login from './pages/Login'
import Registro from './pages/Registro'
import Perfil from './pages/Perfil'
import AdminHome from './features/admin/pages/AdminHome'
import AdminSolicitudes from './features/admin/pages/AdminSolicitudes'
import AdminUsuarios from './features/admin/pages/AdminUsuarios'
import AdminProgramas from './features/admin/pages/AdminProgramas'
import AdminConstancias from './features/admin/pages/AdminConstancias'
import AdminIncidencias from './features/admin/pages/AdminIncidencias'
import AdminReportes from './features/admin/pages/AdminReportes'

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
            <Route path="/programas" element={<ClientLayout><Programas /></ClientLayout>} />
            <Route path="/diagnostico" element={<ClientLayout><Diagnostico /></ClientLayout>} />
            <Route path="/resultados" element={<ClientLayout><Resultados /></ClientLayout>} />
            <Route path="/chat" element={<ClientLayout><Chatbot /></ClientLayout>} />
            <Route path="/tramite/:id" element={<ClientLayout><Tramite /></ClientLayout>} />
            <Route path="/tramites/:id" element={<ClientLayout><Tramite /></ClientLayout>} />
            <Route path="/mis-solicitudes" element={<ClientLayout><MisSolicitudes /></ClientLayout>} />
            <Route path="/mi-wallet" element={<ClientLayout><MiWallet /></ClientLayout>} />
            <Route path="/login" element={<ClientLayout><Login /></ClientLayout>} />
            <Route path="/registro" element={<ClientLayout><Registro /></ClientLayout>} />
            <Route path="/perfil" element={<ClientLayout><Perfil /></ClientLayout>} />

            {/* Rutas del admin — protegidas por rol */}
            <Route path="/admin" element={<AdminGuard><AdminHome /></AdminGuard>} />
            <Route path="/admin/solicitudes" element={<AdminGuard><AdminSolicitudes /></AdminGuard>} />
            <Route path="/admin/usuarios" element={<AdminGuard><AdminUsuarios /></AdminGuard>} />
            <Route path="/admin/programas" element={<AdminGuard><AdminProgramas /></AdminGuard>} />
            <Route path="/admin/constancias" element={<AdminGuard><AdminConstancias /></AdminGuard>} />
            <Route path="/admin/incidencias" element={<AdminGuard><AdminIncidencias /></AdminGuard>} />
            <Route path="/admin/reportes" element={<AdminGuard><AdminReportes /></AdminGuard>} />
            <Route path="/admin/*" element={<AdminGuard><AdminHome /></AdminGuard>} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  )
}

export default App
