import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Footer } from '../components/Footer';
import { authService } from '../../services/auth';
import { restauranteService } from '../../services/restaurante';

export function DashboardRestaurante() {
  const navigate = useNavigate();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [restauranteInfo, setRestauranteInfo] = useState<any>(null);
  const [platillos, setPlatillos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [info, platillosData] = await Promise.all([
          restauranteService.getRestauranteInfo(),
          restauranteService.getPlatillos(),
        ]);
        setRestauranteInfo(info);
        setPlatillos(platillosData);
      } catch (error) {
        console.error('Error cargando datos:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const menuItems = [
    { icon: '📊', nombre: 'Resumen', ruta: '/dashboard/restaurante' },
    { icon: '🍽️', nombre: 'Mi Menú', ruta: '/dashboard/platillos' },
    { icon: '➕', nombre: 'Nuevo Platillo', ruta: '/dashboard/platillos/nuevo' },
    { icon: '📷', nombre: 'Código QR', ruta: '/dashboard/qr' },
    { icon: '🎨', nombre: 'Configuración', ruta: '/dashboard/configuracion' },
    { icon: '👤', nombre: 'Perfil', ruta: '/perfil' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl animate-pulse">🌮</div>
          <p className="text-gray-500 mt-2">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="fixed top-0 left-0 right-0 bg-black/90 backdrop-blur-md z-50 border-b border-gray-800">
        <div className="px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <span className="text-2xl">🌮</span>
            <span className="font-bold text-lg bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              MexxicanMX
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400 hidden sm:inline">{restauranteInfo?.nombre_negocio}</span>
            <button 
              onClick={() => setMenuAbierto(!menuAbierto)}
              className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center"
            >
              <span className="text-sm">👤</span>
            </button>
          </div>
        </div>
      </nav>

      {menuAbierto && (
        <div className="fixed inset-0 z-40 bg-black/95 pt-16">
          <div className="flex flex-col p-4">
            {menuItems.map((item) => (
              <button
                key={item.ruta}
                onClick={() => {
                  navigate(item.ruta);
                  setMenuAbierto(false);
                }}
                className="flex items-center gap-3 p-4 text-gray-300 hover:text-orange-400 hover:bg-white/5 rounded-xl transition"
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.nombre}</span>
              </button>
            ))}
            <div className="border-t border-gray-800 my-4"></div>
            <button
              onClick={() => authService.logout()}
              className="flex items-center gap-3 p-4 text-red-400 hover:bg-red-500/10 rounded-xl transition"
            >
              <span className="text-xl">🚪</span>
              <span>Cerrar sesión</span>
            </button>
          </div>
        </div>
      )}

      <div className="pt-16 pb-20 px-4 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-1">Bienvenido, {restauranteInfo?.nombre_dueño}</h1>
            <p className="text-gray-500 text-sm">Aquí puedes gestionar tu restaurante</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-4 border border-gray-800">
              <div className="text-2xl mb-2">🍽️</div>
              <div className="text-2xl font-bold text-orange-500">{platillos.length}</div>
              <div className="text-xs text-gray-500">Platillos activos</div>
            </div>
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-4 border border-gray-800">
              <div className="text-2xl mb-2">📷</div>
              <div className="text-2xl font-bold text-orange-500">1</div>
              <div className="text-xs text-gray-500">Código QR</div>
            </div>
          </div>

          <h2 className="text-lg font-semibold mb-4">Acciones rápidas</h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate('/dashboard/platillos/nuevo')}
              className="p-4 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 font-semibold text-sm hover:shadow-lg transition"
            >
              ➕ Nuevo platillo
            </button>
            <button
              onClick={() => navigate('/dashboard/qr')}
              className="p-4 rounded-xl border border-gray-700 font-semibold text-sm hover:border-orange-500 transition"
            >
              📷 Ver mi QR
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}