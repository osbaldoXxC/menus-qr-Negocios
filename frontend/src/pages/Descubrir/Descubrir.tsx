import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { comensalService } from '../../services/comensal';

export function Descubrir() {
  const navigate = useNavigate();
  const [platillos, setPlatillos] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [loading, setLoading] = useState(true);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  useEffect(() => {
    cargarRecomendaciones();
  }, []);

  const cargarRecomendaciones = async () => {
    try {
      // Obtener respuestas del cuestionario del localStorage
      const respuestas = JSON.parse(localStorage.getItem('cuestionario') || '{}');
      const data = await comensalService.searchMatches({
        sabor_antojo: respuestas.sabor_antojo || 'Quiero algo delicioso',
        dieta: respuestas.dieta || 'ninguna',
        alergias: respuestas.alergias || [],
        ocasion: respuestas.ocasion || 'Solo',
      });
      setPlatillos(data.resultados || []);
    } catch (error) {
      console.error('Error cargando recomendaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 50) {
      handleDislike();
    }
    if (touchEnd - touchStart > 50) {
      handleLike();
    }
    setTouchStart(0);
    setTouchEnd(0);
  };

  const handleLike = async () => {
    const platillo = platillos[currentIndex];
    if (platillo) {
      try {
        await comensalService.registrarInteraccion(platillo.platillo_id, 'like');
      } catch (error) {
        console.error('Error registrando like:', error);
      }
    }
    setSwipeDirection('right');
    setTimeout(() => {
      if (currentIndex < platillos.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        setCurrentIndex(platillos.length);
      }
      setSwipeDirection(null);
    }, 300);
  };

  const handleDislike = async () => {
    const platillo = platillos[currentIndex];
    if (platillo) {
      try {
        await comensalService.registrarInteraccion(platillo.platillo_id, 'dislike');
      } catch (error) {
        console.error('Error registrando dislike:', error);
      }
    }
    setSwipeDirection('left');
    setTimeout(() => {
      if (currentIndex < platillos.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        setCurrentIndex(platillos.length);
      }
      setSwipeDirection(null);
    }, 300);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-120px)] pt-20">
          <div className="text-center">
            <div className="text-4xl animate-pulse">🤖</div>
            <p className="text-gray-500 mt-2">Buscando los mejores platillos...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const currentPlatillo = platillos[currentIndex];

  if (!currentPlatillo || platillos.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-120px)] pt-20 px-4">
          <div className="text-center">
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-xl font-bold mb-2">¡No hay más platillos!</h2>
            <p className="text-gray-400 text-sm mb-6">Ya viste todos los platillos recomendados</p>
            <button 
              onClick={() => navigate('/cuestionario')} 
              className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-full text-sm font-semibold"
            >
              Volver a empezar
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      
      <div className="pt-20 pb-24 px-4 min-h-screen flex items-center justify-center">
        <div className="w-full max-w-sm mx-auto">
          <div 
            className={`relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl overflow-hidden shadow-2xl border border-gray-700 transition-all duration-300 ${
              swipeDirection === 'right' ? 'animate-swipe-right' : swipeDirection === 'left' ? 'animate-swipe-left' : ''
            }`}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="h-64 flex items-center justify-center text-7xl bg-gradient-to-br from-orange-500/20 to-red-500/20">
              {currentPlatillo.url_imagen ? '🍽️' : '🌮'}
            </div>
            
            <div className="p-5">
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-xl font-bold">{currentPlatillo.nombre}</h2>
                <div className="flex items-center gap-1 bg-orange-500/20 px-2 py-0.5 rounded-full">
                  <span className="text-orange-500 text-xs">★</span>
                  <span className="text-xs font-semibold">{currentPlatillo.porcentaje_match}%</span>
                </div>
              </div>
              
              <p className="text-orange-400 font-semibold text-sm mb-2">{currentPlatillo.restaurante_nombre}</p>
              
              <div className="flex gap-3 mb-3 text-xs text-gray-400">
                <span>💰 {currentPlatillo.precio}</span>
              </div>
              
              <p className="text-gray-300 text-xs leading-relaxed">{currentPlatillo.motivo_match}</p>
            </div>
          </div>

          <div className="flex justify-center gap-6 mt-6">
            <button 
              onClick={handleDislike}
              className="w-14 h-14 rounded-full bg-gray-800 hover:bg-red-500/20 border border-gray-700 text-2xl transition-all transform active:scale-95"
            >
              ✖️
            </button>
            <button 
              onClick={handleLike}
              className="w-14 h-14 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-2xl transition-all transform active:scale-95 shadow-lg shadow-orange-500/30"
            >
              ❤️
            </button>
          </div>

          <div className="text-center mt-5">
            <p className="text-gray-500 text-xs mb-1">👆 Desliza → para dar like | ← para pasar</p>
            <p className="text-gray-600 text-xs mt-2">{platillos.length - currentIndex - 1} platillos restantes</p>
          </div>
        </div>
      </div>

      <Footer />

      <style>{`
        @keyframes swipeRight {
          0% { transform: translateX(0) rotate(0deg); opacity: 1; }
          100% { transform: translateX(200%) rotate(30deg); opacity: 0; }
        }
        @keyframes swipeLeft {
          0% { transform: translateX(0) rotate(0deg); opacity: 1; }
          100% { transform: translateX(-200%) rotate(-30deg); opacity: 0; }
        }
        .animate-swipe-right { animation: swipeRight 0.3s ease-out forwards; }
        .animate-swipe-left { animation: swipeLeft 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
}