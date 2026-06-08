import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Footer } from '../components/Footer';
import { restauranteService } from '../../services/restaurante';

export function MiMenu() {
  const navigate = useNavigate();
  const [platillos, setPlatillos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarPlatillos();
  }, []);

  const cargarPlatillos = async () => {
    try {
      const data = await restauranteService.getPlatillos();
      setPlatillos(data);
    } catch (error) {
      console.error('Error cargando platillos:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-4xl animate-pulse">🌮</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="fixed top-0 left-0 right-0 bg-black/90 backdrop-blur-md z-50 border-b border-gray-800">
        <div className="px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate('/dashboard/restaurante')} className="text-2xl">←</button>
          <span className="font-bold">Mi Menú</span>
          <button onClick={() => navigate('/dashboard/platillos/nuevo')} className="ml-auto text-orange-400 text-sm">
            + Nuevo
          </button>
        </div>
      </nav>

      <div className="pt-16 pb-20 px-4">
        <div className="max-w-2xl mx-auto space-y-3">
          {platillos.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-3">🍽️</div>
              <p className="text-gray-500">No tienes platillos registrados</p>
              <button
                onClick={() => navigate('/dashboard/platillos/nuevo')}
                className="mt-4 px-6 py-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-full text-sm"
              >
                Agregar primer platillo
              </button>
            </div>
          ) : (
            platillos.map((platillo) => (
              <div key={platillo.id} className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-4 border border-gray-800">
                <div className="flex items-center gap-4">
                  <div className="text-4xl">{platillo.url_imagen ? '🍽️' : '🌮'}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{platillo.nombre}</h3>
                    <p className="text-gray-500 text-xs">{platillo.categoria}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-orange-400 font-semibold">${platillo.precio}</div>
                    <button className="text-xs text-gray-500 hover:text-orange-400 mt-1">Editar</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}