import {
  BrowserRouter,
  Routes,
  Route
} from 'react-router-dom'

import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Oli/Dashboard'
import { About, Articulate, Connect, Emergencies, Faq, Home, Report, Respond } from './pages/PublicPages'

import ProtectedRoute from './components/ProtectedRoute'
import RecoveryRedirect from './components/RecoveryRedirect'
import UpdatePassword from './pages/UpdatePassword'
import ProfileSettings from './pages/Oli/ProfileSettings'
import Volunteers from './pages/Oli/Volunteers'
import CollectionPoints from './pages/CollectionPoints'

function App() {
  return (
    <BrowserRouter>
      <RecoveryRedirect />
      <Routes>

        <Route
          path="/"
          element={<Home />}
        />
        <Route path="/nosotros" element={<About />} />
        <Route path="/responde" element={<Respond />} />
        <Route path="/articula" element={<Articulate />} />
        <Route path="/conecta" element={<Connect />} />
        <Route path="/emergencias" element={<Emergencies />} />
        <Route path="/puntos-acopio" element={<CollectionPoints />} />
        <Route path="/reporta" element={<Report />} />
        <Route path="/faq" element={<Faq />} />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route path="/actualizar-contrasena" element={<UpdatePassword />} />

        <Route path="/solicitud" element={<Register />} />

        <Route
          path="/oli"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route path="/oli/perfiles" element={<ProtectedRoute requiredRole="ADMIN"><ProfileSettings /></ProtectedRoute>} />
        <Route path="/oli/voluntarios" element={<ProtectedRoute requiredRole="ADMIN"><Volunteers /></ProtectedRoute>} />

      </Routes>
    </BrowserRouter>
  )
}

export default App
