import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth';

export function Header() {
  const navigate = useNavigate();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [user, setUser] = useState(authService.getCurrentUser());

  useEffect(() => {
    const handleStorageChange = () => setUser(authService.getCurrentUser());
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const menuItems = [
    { nombre: 'Inicio', ruta: '/landing' },
    { nombre: 'Cómo funciona', ruta: '/como-funciona' },
    { nombre: 'Para restaurantes', ruta: '/para-restaurantes' },
    { nombre: 'Precios', ruta: '/precios' },
    { nombre: '📷 Escanear QR', ruta: '/escanear' },
    ...(user.isAuthenticated
      ? [
          { nombre: 'Descubrir', ruta: '/descubrir' },
          { nombre: 'Cuestionario', ruta: '/cuestionario' },
          { nombre: 'Perfil', ruta: '/perfil' },
        ]
      : []),
    ...(user.rol?.toLowerCase() === 'restaurante'
      ? [
          { nombre: 'Mi restaurante', ruta: '/dashboard/restaurante' },
          { nombre: 'Mi menú', ruta: '/dashboard/platillos' },
          { nombre: 'Nuevo platillo', ruta: '/dashboard/platillos/nuevo' },
          { nombre: 'QR restaurante', ruta: '/dashboard/qr' },
          { nombre: 'Configuración', ruta: '/dashboard/configuracion' },
        ]
      : []),
    ...(user.rol?.toLowerCase() === 'super_admin'
      ? [{ nombre: 'Admin', ruta: '/admin' }]
      : []),
  ];

  const handleNavigation = (ruta: string) => {
    navigate(ruta);
    setMenuAbierto(false);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 bg-black/90 backdrop-blur-md z-50 border-b border-gray-800">
        <div className="px-4 py-3 flex justify-between items-center">
          {/* Logo */}
<div className="flex items-center gap-2 cursor-pointer" onClick={() => handleNavigation('/landing')}> 
            <span className="text-2xl md:text-3xl">🌮</span>
            <span className="font-bold text-lg md:text-xl bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              MexxicanMX
            </span>
          </div>

          {/* Botón menú hamburguesa (móvil) */}
          <button 
            onClick={() => setMenuAbierto(!menuAbierto)}
            className="md:hidden text-gray-300 hover:text-white focus:outline-none"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuAbierto ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* Navegación Desktop */}
          <div className="hidden md:flex gap-6">
            {menuItems.map((item) => (
              <button
                key={item.ruta}
                onClick={() => handleNavigation(item.ruta)}
                className="text-gray-300 hover:text-orange-500 transition text-sm"
              >
                {item.nombre}
              </button>
            ))}
          </div>

          {/* Botones de usuario Desktop */}
          <div className="hidden md:flex gap-2">
            {!user.isAuthenticated ? (
              <>
                <button 
                  onClick={() => handleNavigation('/login')}
                  className="px-4 py-1.5 text-gray-300 hover:text-white text-sm font-semibold transition"
                >
                  Ingresar
                </button>
                <button 
                  onClick={() => handleNavigation('/register')}
                  className="px-4 py-1.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full text-sm font-semibold hover:shadow-lg transition-all"
                >
                  Registrarse
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleNavigation('/perfil')}
                  className="px-4 py-1.5 text-gray-300 hover:text-white text-sm font-semibold transition"
                >
                  Perfil
                </button>
                <button
                  onClick={() => {
                    authService.logout();
                    setUser(authService.getCurrentUser());
                  }}
                  className="px-4 py-1.5 bg-red-600 text-white rounded-full text-sm font-semibold hover:bg-red-500 transition-all"
                >
                  Cerrar sesión
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Menú móvil desplegable */}
      {menuAbierto && (
        <div className="fixed top-14 left-0 right-0 bg-black/95 backdrop-blur-md z-40 border-b border-gray-800 md:hidden">
          <div className="flex flex-col py-4">
            {menuItems.map((item) => (
              <button
                key={item.ruta}
                onClick={() => handleNavigation(item.ruta)}
                className="px-6 py-3 text-left text-gray-300 hover:text-orange-500 hover:bg-white/5 transition"
              >
                {item.nombre}
              </button>
            ))}
            <div className="border-t border-gray-800 my-2"></div>
            {!user.isAuthenticated ? (
              <>
                <button 
                  onClick={() => handleNavigation('/login')}
                  className="px-6 py-3 text-left text-gray-300 hover:text-orange-500 hover:bg-white/5 transition"
                >
                  Ingresar
                </button>
                <button 
                  onClick={() => handleNavigation('/register')}
                  className="mx-4 mt-2 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full font-semibold text-center"
                >
                  Registrarse
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => handleNavigation('/perfil')}
                  className="px-6 py-3 text-left text-gray-300 hover:text-orange-500 hover:bg-white/5 transition"
                >
                  Perfil
                </button>
                <button 
                  onClick={() => {
                    authService.logout();
                    setUser(authService.getCurrentUser());
                  }}
                  className="mx-4 mt-2 py-2 bg-red-600 text-white rounded-full font-semibold text-center"
                >
                  Cerrar sesión
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}