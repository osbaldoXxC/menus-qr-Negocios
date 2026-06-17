import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { authService } from '../../services/auth';
import { ThemeContext } from '../../context/ThemeContext';

const menuVariants = {
  hidden: { opacity: 0, y: -12, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.25, ease: 'easeOut' } },
  exit: { opacity: 0, y: -8, scale: 0.98, transition: { duration: 0.2 } },
};

export function Header() {
  const navigate = useNavigate();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [user, setUser] = useState(authService.getCurrentUser());

  useEffect(() => {
    const handleStorageChange = () => setUser(authService.getCurrentUser());
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const { theme, toggleTheme } = useContext(ThemeContext);
  const rol = user.rol?.toLowerCase() || '';
  const isRestaurante = rol === 'restaurante';
  const isSuperAdmin = rol === 'super_admin';
  const isDashboardUser = isRestaurante || isSuperAdmin;

  const menuItems = isDashboardUser
    ? [
        { nombre: 'Dashboard', ruta: '/dashboard/restaurante' },
        { nombre: 'Mi menú', ruta: '/dashboard/platillos' },
        { nombre: 'Nuevo platillo', ruta: '/dashboard/platillos/nuevo' },
        { nombre: 'QR restaurante', ruta: '/dashboard/qr' },
        { nombre: 'Configuración', ruta: '/dashboard/configuracion' },
        { nombre: 'Perfil', ruta: '/perfil' },
        ...(isSuperAdmin ? [{ nombre: 'Admin Panel', ruta: '/admin' }] : []),
      ]
    : [
        { nombre: 'Inicio', ruta: '/landing' },
        { nombre: 'Cómo funciona', ruta: '/como-funciona' },
        { nombre: 'Para restaurantes', ruta: '/para-restaurantes' },
        { nombre: 'Precios', ruta: '/precios' },
        { nombre: 'Descubrir', ruta: '/descubrir' },
        { nombre: 'Cuestionario', ruta: '/cuestionario' },
        { nombre: 'Escanear QR', ruta: '/escanear' },
        ...(user.isAuthenticated ? [{ nombre: 'Perfil', ruta: '/perfil' }] : []),
      ];

  const handleNavigation = (ruta: string) => {
    navigate(ruta);
    setMenuAbierto(false);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--app-border)] backdrop-blur-xl bg-[var(--app-bg)]/80">
        <div className="mx-auto max-w-[1400px] px-5 md:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-[60px]">
            {/* Logo */}
            <motion.div
              className="flex items-center gap-2 cursor-pointer select-none"
              onClick={() =>
                handleNavigation(isDashboardUser ? '/dashboard/restaurante' : '/landing')
              }
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <span className="text-xl leading-none">🌮</span>
              <span className="text-[15px] font-semibold tracking-[-0.015em] text-[#F5F5F7]">
                MexxicanMX
              </span>
            </motion.div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-0.5">
              {menuItems.map((item) => (
                <motion.button
                  key={item.ruta}
                  onClick={() => handleNavigation(item.ruta)}
                  className="px-4 py-2 text-[13px] font-500 text-[#A1A1A6] hover:text-[#F5F5F7] rounded-md transition-colors duration-200"
                  whileHover={{ y: -1 }}
                  whileTap={{ y: 0 }}
                >
                  {item.nombre}
                </motion.button>
              ))}
            </nav>

            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={toggleTheme}
                className="px-3.5 py-2 text-[13px] font-medium text-[#A1A1A6] hover:text-[#F5F5F7] rounded-lg transition-colors duration-200"
                aria-label="Alternar tema"
              >
                {theme === 'dark' ? '☀️ Día' : '🌙 Noche'}
              </button>
              {!user.isAuthenticated ? (
                <>
                  <button
                    onClick={() => handleNavigation('/login')}
                    className="px-4 py-1.5 text-[13px] font-500 text-[#A1A1A6] hover:text-[#F5F5F7] transition-colors duration-200"
                  >
                    Iniciar sesión
                  </button>
                  <button
                    onClick={() => handleNavigation('/register')}
                    className="px-6 py-1.5 text-[13px] font-500 bg-[#2997FF] text-white rounded-lg hover:bg-[#40A9FF] transition-all duration-200 hover:shadow-[0_4px_16px_rgba(41,151,255,0.2)]"
                  >
                    Registrarse
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => handleNavigation('/perfil')}
                    className="px-3.5 py-2 text-[13px] font-medium text-[#A1A1A6] hover:text-[#F5F5F7] rounded-lg transition-colors duration-200"
                  >
                    Perfil
                  </button>
                  <button
                    onClick={() => {
                      authService.logout();
                      setUser(authService.getCurrentUser());
                    }}
                    className="px-4 py-2 text-[13px] font-medium text-[#FF453A] hover:text-[#FF6B6B] rounded-lg transition-colors duration-200"
                  >
                    Cerrar sesión
                  </button>
                </>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMenuAbierto(!menuAbierto)}
              className="md:hidden p-2 -mr-2 text-[#A1A1A6] hover:text-[#F5F5F7] transition-colors"
              aria-label="Menú"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                {menuAbierto ? (
                  <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {menuAbierto && (
            <motion.div
              variants={menuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="md:hidden border-t border-white/[0.06] bg-[#000000]/95 backdrop-blur-xl"
            >
              <div className="px-5 py-4 space-y-1">
                {menuItems.map((item) => (
                  <button
                    key={item.ruta}
                    onClick={() => handleNavigation(item.ruta)}
                    className="w-full text-left px-4 py-3 text-[15px] font-medium text-[#A1A1A6] hover:text-[#F5F5F7] hover:bg-white/[0.04] rounded-xl transition-all duration-200"
                  >
                    {item.nombre}
                  </button>
                ))}
                <div className="h-px bg-white/[0.06] my-3" />
                {!user.isAuthenticated ? (
                  <div className="space-y-2 pt-1">
                    <button
                      onClick={() => handleNavigation('/login')}
                      className="w-full px-4 py-3 text-[15px] font-medium text-[#F5F5F7] hover:bg-white/[0.04] rounded-xl transition-all duration-200 text-center"
                    >
                      Iniciar sesión
                    </button>
                    <button
                      onClick={() => handleNavigation('/register')}
                      className="w-full px-4 py-3 text-[15px] font-medium bg-[#2997FF] text-white rounded-full hover:bg-[#40A9FF] transition-all duration-250"
                    >
                      Registrarse
                    </button>
                    <button
                      onClick={() => {
                        toggleTheme();
                        setMenuAbierto(false);
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 text-[15px] font-medium text-[#F5F5F7] bg-white/[0.04] rounded-xl hover:bg-white/[0.08] transition-all duration-200"
                    >
                      {theme === 'dark' ? '☀️ Modo día' : '🌙 Modo noche'}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 pt-1">
                    <button
                      onClick={() => handleNavigation('/perfil')}
                      className="w-full text-left px-4 py-3 text-[15px] font-medium text-[#F5F5F7] hover:bg-white/[0.04] rounded-xl transition-all duration-200"
                    >
                      Perfil
                    </button>
                    <button
                      onClick={() => {
                        authService.logout();
                        setUser(authService.getCurrentUser());
                        setMenuAbierto(false);
                      }}
                      className="w-full px-4 py-3 text-[15px] font-medium text-[#FF453A] hover:bg-white/[0.04] rounded-xl transition-all duration-200"
                    >
                      Cerrar sesión
                    </button>
                    <button
                      onClick={() => {
                        toggleTheme();
                        setMenuAbierto(false);
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 text-[15px] font-medium text-[#F5F5F7] bg-white/[0.04] rounded-xl hover:bg-white/[0.08] transition-all duration-200"
                    >
                      {theme === 'dark' ? '☀️ Modo día' : '🌙 Modo noche'}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Spacer */}
      <div className="h-14 md:h-16" />
    </>
  );
}