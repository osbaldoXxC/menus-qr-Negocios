import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ProtectedRoute } from './pages/components/ProtectedRoute';
import { authService } from './services/auth';
import { ThemeProvider } from './context/ThemeContext';
import { MainLayout } from './pages/components/MainLayout';
import { motion, AnimatePresence } from 'framer-motion';

// Lazy-loaded pages for better performance
const Landing = lazy(() => import('./pages/Landing/Landing').then(m => ({ default: m.Landing })));
const NoSabesQueComer = lazy(() => import('./pages/Landing/NoSabesQueComer').then(m => ({ default: m.NoSabesQueComer })));
const PublicMenu = lazy(() => import('./pages/PublicMenu/PublicMenu').then(m => ({ default: m.PublicMenu })));
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

// Smart home redirect: authenticated users go to their dashboard, guests see restaurant landing
function HomeRedirect() {
  const { isAuthenticated, rol } = authService.getCurrentUser();
  const userRol = rol?.toLowerCase() || '';

  if (!isAuthenticated) {
    return <Navigate to="/landing" replace />;
  }

  if (userRol === 'restaurante' || userRol === 'super_admin') {
    return <Navigate to="/dashboard/restaurante" replace />;
  }

  // If a comensal is logged in, they go to discovery
  return <Navigate to="/no-sabes-que-comer" replace />;
}

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
        className="w-full min-h-full"
      >
        <Suspense fallback={<PageLoader />}>
          <Routes location={location}>
            {/* Home - smart redirect based on auth status */}
            <Route path="/" element={<HomeRedirect />} />

            {/* Public marketing pages (no auth required) */}
            <Route path="/landing" element={<Landing />} />
            <Route path="/no-sabes-que-comer" element={<NoSabesQueComer />} />
            <Route path="/como-funciona" element={<ComoFunciona />} />
            <Route path="/para-restaurantes" element={<ParaRestaurantes />} />
            <Route path="/precios" element={<Precios />} />

            {/* Public Digital Menu (Real) */}
            <Route path="/menu/:restaurant_id" element={<PublicMenu />} />

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
      </motion.div>
    </AnimatePresence>
  );
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <MainLayout>
          <AnimatedRoutes />
        </MainLayout>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
