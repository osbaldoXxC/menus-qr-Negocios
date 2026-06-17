import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './pages/components/ProtectedRoute';
import { authService } from './services/auth';
import { ThemeProvider } from './context/ThemeContext';

// Lazy-loaded pages for better performance
const Landing = lazy(() => import('./pages/Landing/Landing').then(m => ({ default: m.Landing })));
const Register = lazy(() => import('./pages/Register/Register').then(m => ({ default: m.Register })));
const Login = lazy(() => import('./pages/Login/Login').then(m => ({ default: m.Login })));
const ComoFunciona = lazy(() => import('./pages/ComoFunciona/ComoFunciona').then(m => ({ default: m.ComoFunciona })));
const ParaRestaurantes = lazy(() => import('./pages/ParaRestaurantes/ParaRestaurantes').then(m => ({ default: m.ParaRestaurantes })));
const Precios = lazy(() => import('./pages/Precios/Precios').then(m => ({ default: m.Precios })));
const EscanearQR = lazy(() => import('./pages/EscanearQR/EscanearQR').then(m => ({ default: m.EscanearQR })));
const Descubrir = lazy(() => import('./pages/Descubrir/Descubrir').then(m => ({ default: m.Descubrir })));
const CuestionarioIA = lazy(() => import('./pages/CuestionarioIA/CuestionarioIA').then(m => ({ default: m.CuestionarioIA })));
const DashboardRestaurante = lazy(() => import('./pages/DashboardRestaurante/DashboardRestaurante').then(m => ({ default: m.DashboardRestaurante })));
const MiMenu = lazy(() => import('./pages/MiMenu/MiMenu').then(m => ({ default: m.MiMenu })));
const NuevoPlatillo = lazy(() => import('./pages/NuevoPlatillo/NuevoPlatillo').then(m => ({ default: m.NuevoPlatillo })));
const CodigoQR = lazy(() => import('./pages/CodigoQR/CodigoQR').then(m => ({ default: m.CodigoQR })));
const Configuracion = lazy(() => import('./pages/Configuracion/Configuracion').then(m => ({ default: m.Configuracion })));
const Perfil = lazy(() => import('./pages/Perfil/Perfil').then(m => ({ default: m.Perfil })));
const NotFound = lazy(() => import('./pages/NotFound/NotFound').then(m => ({ default: m.NotFound })));

// Loading spinner for lazy-loaded pages
function PageLoader() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl animate-pulse">🌮</div>
        <p className="text-gray-500 mt-2">Cargando...</p>
      </div>
    </div>
  );
}

// Smart home redirect: authenticated users go to their dashboard, guests see landing
function HomeRedirect() {
  const { isAuthenticated, rol } = authService.getCurrentUser();
  const userRol = rol?.toLowerCase() || '';

  if (!isAuthenticated) {
    return <Navigate to="/landing" replace />;
  }

  if (userRol === 'restaurante' || userRol === 'super_admin') {
    return <Navigate to="/dashboard/restaurante" replace />;
  }

  return <Navigate to="/descubrir" replace />;
}

function App() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-[var(--app-bg)] text-[var(--app-text)] transition-colors duration-300">
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
          {/* Home - smart redirect based on auth status */}
          <Route path="/" element={<HomeRedirect />} />

          {/* Public marketing pages (no auth required) */}
          <Route path="/landing" element={<Landing />} />
          <Route path="/como-funciona" element={<ComoFunciona />} />
          <Route path="/para-restaurantes" element={<ParaRestaurantes />} />
          <Route path="/precios" element={<Precios />} />

          {/* QR scanning (public, optional restaurant ID) */}
          <Route path="/escanear/:id?" element={<EscanearQR />} />

          {/* Auth pages (redirect to dashboard if already logged in) */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Comensal pages (auth recommended) */}
          <Route path="/descubrir" element={<Descubrir />} />
          <Route path="/cuestionario" element={<CuestionarioIA />} />

          {/* Profile (shared - any authenticated user) */}
          <Route path="/perfil" element={
            <ProtectedRoute allowedRoles={['COMENSAL', 'RESTAURANTE', 'SUPER_ADMIN']}>
              <Perfil />
            </ProtectedRoute>
          } />

          {/* Restaurant dashboard routes */}
          <Route path="/dashboard/restaurante" element={
            <ProtectedRoute allowedRoles={['RESTAURANTE', 'SUPER_ADMIN']}>
              <DashboardRestaurante />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/platillos" element={
            <ProtectedRoute allowedRoles={['RESTAURANTE', 'SUPER_ADMIN']}>
              <MiMenu />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/platillos/nuevo" element={
            <ProtectedRoute allowedRoles={['RESTAURANTE', 'SUPER_ADMIN']}>
              <NuevoPlatillo />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/qr" element={
            <ProtectedRoute allowedRoles={['RESTAURANTE', 'SUPER_ADMIN']}>
              <CodigoQR />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/configuracion" element={
            <ProtectedRoute allowedRoles={['RESTAURANTE', 'SUPER_ADMIN']}>
              <Configuracion />
            </ProtectedRoute>
          } />

          {/* Super Admin route */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
              <DashboardRestaurante />
            </ProtectedRoute>
          } />

          {/* Catch-all 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </div>
    </ThemeProvider>
  );
}

export default App;