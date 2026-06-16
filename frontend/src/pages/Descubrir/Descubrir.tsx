import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { comensalService } from '../../services/comensal';

const SWIPE_THRESHOLD = 80;
const SWIPE_VELOCITY = 500;

export function Descubrir() {
  const navigate = useNavigate();
  const [platillos, setPlatillos] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [exitX, setExitX] = useState(0);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    cargarRecomendaciones();
  }, []);

  const cargarRecomendaciones = async () => {
    try {
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

  const handleSwipe = (direction: 'like' | 'dislike') => {
    const platillo = platillos[currentIndex];
    if (!platillo) return;

    if (direction === 'like') {
      setExitX(500);
      comensalService.registrarInteraccion(platillo.platillo_id, 'like').catch(() => {});
    } else {
      setExitX(-500);
      comensalService.registrarInteraccion(platillo.platillo_id, 'dislike').catch(() => {});
    }

    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
      setExitX(0);
      setExpandedId(null);
    }, 250);
  };

  const handleDragEnd = (_: any, info: { offset: { x: number }; velocity: { x: number } }) => {
    if (Math.abs(info.offset.x) > SWIPE_THRESHOLD || Math.abs(info.velocity.x) > SWIPE_VELOCITY) {
      handleSwipe(info.offset.x > 0 ? 'like' : 'dislike');
    }
  };

  if (loading) {
    return (
      <div className="bg-[#000000] text-[#F5F5F7] min-h-screen">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-120px)] pt-20">
          <div className="text-center">
            <motion.div
              className="text-5xl"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
            >
              🤖
            </motion.div>
            <p className="text-[#6E6E73] mt-3">IA buscando tus platillos ideales...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const currentPlatillo = platillos[currentIndex];

  if (!currentPlatillo || platillos.length === 0) {
    return (
      <div className="bg-[#000000] text-[#F5F5F7] min-h-screen">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-120px)] pt-20 px-4">
          <div className="text-center">
            <motion.div
              className="text-6xl mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              🎉
            </motion.div>
            <h2 className="text-xl font-bold mb-2">¡No hay más platillos!</h2>
            <p className="text-[#A1A1A6] text-sm mb-6">Ya viste todos los platillos recomendados</p>
            <button
              onClick={() => navigate('/cuestionario')}
              className="btn-apple btn-apple-primary text-sm py-3 px-6"
            >
              Volver a empezar
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const isExpanded = expandedId === currentPlatillo.platillo_id;

  return (
    <div className="bg-[#000000] text-[#F5F5F7] min-h-screen overflow-hidden">
      <Header />

      <div className="pt-20 pb-24 px-4 min-h-screen flex flex-col items-center justify-center relative">
        {/* Background stacked cards */}
        {platillos[currentIndex + 1] && (
          <div className="absolute top-1/2 -translate-y-1/2 w-full max-w-sm aspect-[3/4] opacity-30 scale-95 rotate-1">
            <div className="w-full h-full rounded-apple-lg bg-[#1D1D1F] border border-white/[0.06]" />
          </div>
        )}
        {platillos[currentIndex + 2] && (
          <div className="absolute top-1/2 -translate-y-1/2 w-full max-w-sm aspect-[3/4] opacity-15 scale-90 rotate-2">
            <div className="w-full h-full rounded-apple-lg bg-[#1D1D1F] border border-white/[0.06]" />
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={currentPlatillo.platillo_id + (isExpanded ? '-expanded' : '')}
            drag={isExpanded ? false : 'x'}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.9}
            onDragEnd={handleDragEnd}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{
              scale: 1,
              opacity: 1,
              x: exitX,
              rotate: exitX * 0.05,
            }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className={`relative bg-[#1D1D1F] rounded-apple-lg overflow-hidden shadow-2xl border border-white/[0.06] cursor-grab active:cursor-grabbing w-full max-w-sm ${
              isExpanded ? 'aspect-auto' : 'aspect-[3/4]'
            }`}
            onClick={() => {
              if (!exitX) setExpandedId(isExpanded ? null : currentPlatillo.platillo_id);
            }}
          >
            {/* Swipe indicators */}
            <motion.div
              className="absolute top-4 left-4 z-10 bg-[#FF453A]/80 text-white px-3 py-1 rounded-full text-xs font-bold"
              style={{ opacity: exitX < 0 ? Math.abs(exitX) / 80 : 0 }}
            >
              NOPE
            </motion.div>
            <motion.div
              className="absolute top-4 right-4 z-10 bg-[#2997FF]/80 text-white px-3 py-1 rounded-full text-xs font-bold"
              style={{ opacity: exitX > 0 ? exitX / 80 : 0 }}
            >
              LIKE
            </motion.div>

            {/* Image area */}
            <div className={`${isExpanded ? 'h-56' : 'h-3/5'} flex items-center justify-center bg-gradient-to-br from-[#2997FF]/10 to-[#40A9FF]/10 relative`}>
              <motion.span
                className="text-8xl"
                animate={isExpanded ? {} : { y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 3 }}
              >
                🌮
              </motion.span>
              {/* Match badge */}
              <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-[#2997FF]/20">
                <span className="text-[#2997FF] text-xs">★</span>
                <span className="text-xs font-bold">{currentPlatillo.porcentaje_match}%</span>
              </div>
            </div>

            {/* Info area */}
            <div className={`${isExpanded ? 'p-5' : 'p-4 flex-1 flex flex-col justify-between'}`}>
              <div>
                <h2 className="text-xl font-bold mb-1">{currentPlatillo.nombre}</h2>
                <p className="text-[#2997FF] font-semibold text-sm mb-2">{currentPlatillo.restaurante_nombre}</p>

                {isExpanded ? (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-4 mt-4"
                  >
                    <div className="flex gap-4 text-sm">
                      <div>
                        <span className="text-[#6E6E73] block text-xs">Precio</span>
                        <span className="font-semibold text-[#F5F5F7]">💰 ${currentPlatillo.precio}</span>
                      </div>
                      <div>
                        <span className="text-[#6E6E73] block text-xs">Match</span>
                        <span className="font-semibold text-[#2997FF]">{currentPlatillo.porcentaje_match}%</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[#6E6E73] block text-xs mb-1">¿Por qué te lo recomendamos?</span>
                      <p className="text-[#A1A1A6] text-sm leading-relaxed">{currentPlatillo.motivo_match}</p>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/escanear/${currentPlatillo.restaurante_id}`);
                      }}
                      className="w-full py-3 rounded-apple-full bg-[#2997FF] text-white font-semibold text-sm hover:bg-[#40A9FF] transition-all duration-200 hover:shadow-[0_0_20px_rgba(41,151,255,0.2)]"
                    >
                      Ver menú completo
                    </button>

                    <p className="text-center text-[#6E6E73] text-xs">
                      Toca fuera para seguir descubriendo
                    </p>
                  </motion.div>
                ) : (
                  <p className="text-[#A1A1A6] text-xs leading-relaxed line-clamp-2 mt-1">
                    {currentPlatillo.motivo_match}
                  </p>
                )}
              </div>

              {!isExpanded && (
                <div className="text-[#6E6E73] text-xs text-center mt-2">
                  Toca para ver más detalles
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Action buttons */}
        {!isExpanded && (
          <div className="flex justify-center gap-5 mt-5">
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() => handleSwipe('dislike')}
              className="w-16 h-16 rounded-full bg-white/[0.04] hover:bg-[#FF453A]/10 border-2 border-white/[0.06] hover:border-[#FF453A]/30 text-2xl transition-all shadow-lg"
            >
              ✖️
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() => handleSwipe('like')}
              className="w-16 h-16 rounded-full bg-[#2997FF] hover:bg-[#40A9FF] text-2xl transition-all shadow-lg shadow-[#2997FF]/20 hover:shadow-[0_0_24px_rgba(41,151,255,0.3)]"
            >
              ❤️
            </motion.button>
          </div>
        )}

        {/* Counter */}
        <div className="text-center mt-4">
          <p className="text-[#A1A1A6] text-xs">
            👆 {isExpanded ? 'Toca fuera de la tarjeta' : 'Desliza → like | ← pasar'}
          </p>
          <p className="text-[#6E6E73] text-xs mt-1">
            {platillos.length - currentIndex - 1} platillos restantes
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}