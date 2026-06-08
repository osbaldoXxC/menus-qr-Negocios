import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Landing } from './pages/Landing/Landing';
import { Register } from './pages/Register/Register';
import { Login } from './pages/Login/Login';
import { ComoFunciona } from './pages/ComoFunciona/ComoFunciona';
import { ParaRestaurantes } from './pages/ParaRestaurantes/ParaRestaurantes';
import { Precios } from './pages/Precios/Precios';
import { Descubrir } from './pages/Descubrir/Descubrir';
import { EscanearQR } from './pages/EscanearQR/EscanearQR';
import { CuestionarioIA } from './pages/CuestionarioIA/CuestionarioIA';
import { DashboardRestaurante } from './pages/DashboardRestaurante/DashboardRestaurante';
import { MiMenu } from './pages/MiMenu/MiMenu';
import { NuevoPlatillo } from './pages/NuevoPlatillo/NuevoPlatillo';
import { CodigoQR } from './pages/CodigoQR/CodigoQR';
import { Configuracion } from './pages/Configuracion/Configuracion';
import { Perfil } from './pages/Perfil/Perfil';
import { AdminPanel } from './pages/AdminPanel/AdminPanel';
import { ProtectedRoute } from './pages/components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Públicas */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/landing" element={<Landing />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/como-funciona" element={<ComoFunciona />} />
        <Route path="/para-restaurantes" element={<ParaRestaurantes />} />
        <Route path="/precios" element={<Precios />} />
        <Route path="/escanear/:id?" element={<EscanearQR />} />
        
        {/* Rutas protegidas para usuarios autenticados */}
        <Route path="/descubrir" element={
          <ProtectedRoute allowedRoles={['Comensal', 'Restaurante', 'Super_Admin']}>
            <Descubrir />
          </ProtectedRoute>
        } />
        <Route path="/cuestionario" element={
          <ProtectedRoute allowedRoles={['Comensal', 'Restaurante', 'Super_Admin']}>
            <CuestionarioIA />
          </ProtectedRoute>
        } />
        <Route path="/perfil" element={
          <ProtectedRoute allowedRoles={['Comensal', 'Restaurante', 'Super_Admin']}>
            <Perfil />
          </ProtectedRoute>
        } />

        {/* Rutas exclusivas para restaurante */}
        <Route path="/dashboard/restaurante" element={
          <ProtectedRoute allowedRoles={['Restaurante']}>
            <DashboardRestaurante />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/platillos" element={
          <ProtectedRoute allowedRoles={['Restaurante']}>
            <MiMenu />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/platillos/nuevo" element={
          <ProtectedRoute allowedRoles={['Restaurante']}>
            <NuevoPlatillo />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/qr" element={
          <ProtectedRoute allowedRoles={['Restaurante']}>
            <CodigoQR />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/configuracion" element={
          <ProtectedRoute allowedRoles={['Restaurante']}>
            <Configuracion />
          </ProtectedRoute>
        } />

        {/* Ruta exclusiva para administrador */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['Super_Admin']}>
            <AdminPanel />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;