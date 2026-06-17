import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { comensalService } from '../../services/comensal';

const PLATILLOS_DUMMY = [
  {
    platillo_id: 'd1',
    nombre: 'Tacos al Pastor Especiales',
    restaurante_nombre: 'El Fogón de México',
    restaurante_id: '1',
    precio: 120,
    emoji: '🌮',
    porcentaje_match: 98,
    motivo_match: 'Te encantan los sabores picositos y este adobo es legendario. Preparado al carbón con piña miel.',
    ingredientes: ['Carne de cerdo', 'Piña', 'Cilantro', 'Cebolla', 'Tortilla a mano'],
    ubicacion: 'Av. Reforma 123, CDMX'
  },
  {
    platillo_id: 'd2',
    nombre: 'Bowl Keto Energético',
    restaurante_nombre: 'Green Point',
    restaurante_id: '2',
    precio: 185,
    emoji: '🥑',
    porcentaje_match: 92,
    motivo_match: 'Ideal para tu dieta baja en carbohidratos. Frescura y proteína en cada bocado.',
    ingredientes: ['Salmón', 'Aguacate', 'Espinacas', 'Huevo pochado', 'Semillas de cáñamo'],
    ubicacion: 'Colonia Roma Norte, CDMX'
  },
  {
    platillo_id: 'd3',
    nombre: 'Pizza de Masa Madre',
    restaurante_nombre: 'Pizza Nostra',
    restaurante_id: '3',
    precio: 210,
    emoji: '🍕',
    porcentaje_match: 85,
    motivo_match: 'Buscas algo para compartir y esta pizza artesanal es la mejor puntuada de la zona.',
    ingredientes: ['Harina integral', 'Mozzarella di bufala', 'Albahaca fresca', 'Tomate San Marzano'],
    ubicacion: 'Polanco, CDMX'
  },
  {
    platillo_id: 'd4',
    nombre: 'Hamburguesa Trufada',
    restaurante_nombre: 'Burger Lab',
    restaurante_id: '4',
    precio: 245,
    emoji: '🍔',
    porcentaje_match: 89,
    motivo_match: 'Un gusto culposo con ingredientes premium. La mayonesa de trufa es el toque secreto.',
    ingredientes: ['Carne Wagyu', 'Aceite de trufa', 'Queso Gouda', 'Pan Brioche'],
    ubicacion: 'Santa Fe, CDMX'
  }
];

export function Descubrir() {
  const navigate = useNavigate();
  const [platillos, setPlatillos] = useState<any[]>(PLATILLOS_DUMMY);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    // Intentar cargar datos pero sin bloquear el renderizado inicial
    const fetchReal = async () => {
      try {
        const respuestas = JSON.parse(localStorage.getItem('cuestionario') || '{}');
        const data = await comensalService.searchMatches({
          sabor_antojo: respuestas.sabor_antojo || 'Algo rico',
          dieta: respuestas.dieta || 'ninguna',
          alergias: respuestas.alergias || [],
          ocasion: respuestas.ocasion || 'Solo',
        }).catch(() => ({ resultados: [] }));
        
        if (data.resultados && data.resultados.length > 0) {
          // Fusionar reales con dummy para variedad
          setPlatillos(prev => [...data.resultados, ...prev.filter(d => !data.resultados.some((r: any) => r.platillo_id === d.platillo_id))]);
        }
      } catch (e) {
        console.error('Fetch error:', e);
      }
    };
    fetchReal();
  }, []);

  const nextPlatillo = () => {
    setCurrentIndex(prev => prev + 1);
    setExpandedId(null);
  };

  const currentPlatillo = platillos[currentIndex];

  if (!currentPlatillo) {
    return (
      <div className="bg-black text-[#F5F5F7] min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-7xl mb-6">🏜️</motion.div>
          <h2 className="text-2xl font-bold mb-4">¡Has explorado todo!</h2>
          <p className="text-[#A1A1A6] mb-8">No quedan más platillos por hoy. ¿Quieres volver a buscar?</p>
          <button
            onClick={() => navigate('/cuestionario')}
            className="px-10 py-4 bg-white text-black rounded-full font-bold hover:scale-105 transition-transform"
          >
            🔄 Volver a empezar
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  const isFlipped = expandedId === currentPlatillo.platillo_id;

  return (
    <div className="bg-black text-[#F5F5F7] min-h-screen flex flex-col overflow-hidden">
      <Header />
      
      <main className="flex-1 flex flex-col items-center justify-center p-6 relative">
        <div className="relative w-full max-w-[360px] aspect-[3/4.5] perspective-1000">
          <motion.div
            key={currentPlatillo.platillo_id}
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0, rotateY: isFlipped ? 180 : 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            style={{ transformStyle: 'preserve-3d', width: '100%', height: '100%' }}
            onClick={() => setExpandedId(isFlipped ? null : currentPlatillo.platillo_id)}
            className="cursor-pointer relative"
          >
            {/* FRONT SIDE */}
            <div 
              className="absolute inset-0 w-full h-full rounded-[2.5rem] bg-[#1C1C1E] border border-white/10 shadow-2xl overflow-hidden flex flex-col"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <div className="h-2/3 bg-gradient-to-br from-[#FF4A00]/20 to-[#FF8C00]/20 flex items-center justify-center relative">
                <span className="text-9xl select-none">{currentPlatillo.emoji || '🌮'}</span>
                <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-sm font-bold text-[#FF4A00]">
                  {currentPlatillo.porcentaje_match}% Match
                </div>
              </div>
              <div className="p-8 flex-1 flex flex-col justify-between">
                <div>
                  <h2 className="text-3xl font-black mb-1 leading-tight">{currentPlatillo.nombre}</h2>
                  <p className="text-[#FF4A00] font-bold text-sm uppercase tracking-wider">{currentPlatillo.restaurante_nombre}</p>
                </div>
                <p className="text-[#A1A1A6] text-sm leading-relaxed line-clamp-3">
                  {currentPlatillo.motivo_match}
                </p>
                <div className="text-center text-[10px] text-[#6E6E73] uppercase tracking-[0.2em] mt-4">
                  Toca para ver detalles
                </div>
              </div>
            </div>

            {/* BACK SIDE (Flip) */}
            <div 
              className="absolute inset-0 w-full h-full rounded-[2.5rem] bg-[#1C1C1E] border border-white/20 shadow-2xl p-10 flex flex-col"
              style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
            >
              <div className="flex-1">
                <h3 className="text-[#FF4A00] font-bold text-xs uppercase tracking-widest mb-2">Acerca de este plato</h3>
                <h2 className="text-2xl font-black mb-8">{currentPlatillo.nombre}</h2>
                
                <div className="space-y-6">
                  <div>
                    <span className="text-[#6E6E73] text-[10px] uppercase tracking-widest block mb-2">Ingredientes Clave</span>
                    <div className="flex flex-wrap gap-2">
                      {currentPlatillo.ingredientes?.map((ing: string) => (
                        <span key={ing} className="px-3 py-1.5 rounded-full bg-white/5 border border-white/5 text-xs text-[#F5F5F7]">{ing}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-[#6E6E73] text-[10px] uppercase tracking-widest block mb-1">Precio aproximado</span>
                    <p className="text-4xl font-black text-white">${currentPlatillo.precio}</p>
                  </div>
                  <div>
                    <span className="text-[#6E6E73] text-[10px] uppercase tracking-widest block mb-1">Ubicación</span>
                    <p className="text-sm font-medium">📍 {currentPlatillo.ubicacion}</p>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/menu/${currentPlatillo.restaurante_id}`);
                }}
                className="w-full py-5 bg-white text-black rounded-full font-black text-sm transition-transform active:scale-95 shadow-lg"
              >
                Ver menú completo
              </button>
            </div>
          </motion.div>
        </div>

        {/* CONTROLS */}
        <div className="mt-12 flex gap-10">
           <motion.button 
             whileTap={{ scale: 0.8 }}
             onClick={(e) => { e.stopPropagation(); nextPlatillo(); }} 
             className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-2xl hover:bg-white/10 transition-colors"
           >
             👎
           </motion.button>
           <motion.button 
             whileTap={{ scale: 0.8 }}
             onClick={(e) => { e.stopPropagation(); nextPlatillo(); }} 
             className="w-16 h-16 rounded-full bg-gradient-to-r from-[#FF2A54] to-[#FF4A00] flex items-center justify-center text-2xl shadow-xl shadow-[#FF2A54]/20 hover:scale-110 transition-transform"
           >
             ❤️
           </motion.button>
        </div>

        <p className="mt-8 text-[#6E6E73] text-[10px] uppercase tracking-[0.3em]">
          {platillos.length - currentIndex - 1} platillos restantes
        </p>
      </main>

      <Footer />
    </div>
  );
}
