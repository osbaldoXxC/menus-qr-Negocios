import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { comensalService } from '../../services/comensal';

export function EscanearQR() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [menuData, setMenuData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      cargarMenu();
    }
  }, [id]);

  const cargarMenu = async () => {
    try {
      const data = await comensalService.getMenuByQR(id!);
      setMenuData(data);
      
      // Aplicar tema (marca blanca)
      if (data.restaurante?.tema) {
        const tema = data.restaurante.tema;
        document.documentElement.style.setProperty('--color-primario', tema.color_primario);
        document.documentElement.style.setProperty('--color-fondo', tema.color_fondo);
      }
    } catch (err: any) {
      setError(err.response?.data?.mensaje || 'Error al cargar el menú');
    } finally {
      setLoading(false);
    }
  };

  // Simular escaneo (para pruebas sin QR real)
  const handleSimularEscaneo = () => {
    navigate('/escanear/restaurante-123');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl animate-pulse">📷</div>
          <p className="text-gray-500 mt-2">Cargando menú...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-120px)] pt-20 px-4">
          <div className="text-center">
            <div className="text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold mb-2">Error</h2>
            <p className="text-gray-400 text-sm mb-6">{error}</p>
            <button 
              onClick={() => navigate('/')} 
              className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-full text-sm font-semibold"
            >
              Volver al inicio
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!menuData) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-120px)] pt-20 px-4">
          <div className="text-center">
            <div className="relative bg-gray-900 rounded-2xl overflow-hidden border border-gray-700 mb-6">
              <div className="aspect-square flex flex-col items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                <div className="relative w-40 h-40">
                  <div className="absolute top-0 left-0 w-10 h-10 border-t-3 border-l-3 border-orange-500"></div>
                  <div className="absolute top-0 right-0 w-10 h-10 border-t-3 border-r-3 border-orange-500"></div>
                  <div className="absolute bottom-0 left-0 w-10 h-10 border-b-3 border-l-3 border-orange-500"></div>
                  <div className="absolute bottom-0 right-0 w-10 h-10 border-b-3 border-r-3 border-orange-500"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-5xl animate-pulse">📷</span>
                  </div>
                </div>
                <div className="absolute w-32 h-0.5 bg-orange-500 animate-scan"></div>
              </div>
            </div>

            <button
              onClick={handleSimularEscaneo}
              className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl font-semibold text-sm"
            >
              Simular escaneo 📷
            </button>

            <p className="text-center text-gray-500 text-xs mt-3">
              Ingresa un ID de restaurante para ver el menú
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />

      <div className="pt-20 pb-24 px-4 min-h-screen">
        <div className="w-full max-w-2xl mx-auto">
          {/* Cabecera del restaurante con tema */}
          <div 
            className="rounded-2xl p-6 text-center mb-6"
            style={{ backgroundColor: menuData.restaurante?.tema?.color_primario || '#F05A28' }}
          >
            <div className="text-5xl mb-2">🌮</div>
            <h1 className="text-2xl font-bold">{menuData.restaurante?.nombre}</h1>
          </div>

          {/* Menú */}
          <div className="space-y-6">
            {menuData.categorias?.map((categoria: any) => (
              <div key={categoria.nombre}>
                <h2 className="text-xl font-bold mb-3">{categoria.nombre}</h2>
                <div className="space-y-3">
                  {categoria.platillos?.map((platillo: any) => (
                    <div key={platillo.id} className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-4 border border-gray-800">
                      <div className="flex items-center gap-4">
                        <div className="text-4xl">{platillo.url_imagen ? '🍽️' : '🌮'}</div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{platillo.nombre}</h3>
                          <p className="text-gray-500 text-xs">{platillo.descripcion?.substring(0, 60)}...</p>
                        </div>
                        <div className="text-right">
                          <div className="text-orange-400 font-semibold">${platillo.precio}</div>
                          <button className="text-xs text-gray-500 hover:text-orange-400 mt-1">Ordenar</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />

      <style>{`
        @keyframes scan {
          0% { top: 30%; opacity: 1; }
          50% { top: 70%; opacity: 1; }
          100% { top: 30%; opacity: 1; }
        }
        .animate-scan {
          position: absolute;
          top: 30%;
          left: 50%;
          transform: translateX(-50%);
          animation: scan 2s ease-in-out infinite;
        }
        .border-t-3 { border-top-width: 3px; }
        .border-l-3 { border-left-width: 3px; }
        .border-r-3 { border-right-width: 3px; }
        .border-b-3 { border-bottom-width: 3px; }
      `}</style>
    </div>
  );
}