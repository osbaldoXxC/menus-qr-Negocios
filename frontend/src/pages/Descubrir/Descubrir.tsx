import { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { ThemeContext } from '../../context/ThemeContext';
import { Logo } from '../components/Logo';
import { comensalService } from '../../services/comensal';

const PLATILLOS_DUMMY = [
  {
    platillo_id: 'd1',
    nombre: 'Dumplings al Vapor (Jiaozi)',
    restaurante_nombre: 'Gran Dragón Dorado',
    restaurante_id: '22222222-2222-2222-2222-222222222222',
    precio: 125,
    emoji: '🥟',
    porcentaje_match: 99,
    motivo_match: 'Tu antojo de comida oriental y sabores auténticos coincide al 99% con esta receta tradicional del chef.',
    ingredientes: ['Cerdo molido', 'Cebollín chino', 'Jengibre fresco', 'Salsa de soya', 'Masa artesanal'],
    ubicacion: 'Barrio Chino, Centro Histórico, CDMX',
    tag: 'Oriental',
  },
  {
    platillo_id: 'd2',
    nombre: 'Filete Mignon al Oporto',
    restaurante_nombre: "L'Étoile Gourmet",
    restaurante_id: '33333333-3333-3333-3333-333333333333',
    precio: 480,
    emoji: '🥩',
    porcentaje_match: 97,
    motivo_match: 'Ideal para una ocasión especial. La reducción al Oporto y el puré trufado ofrecen una experiencia culinaria inigualable.',
    ingredientes: ['Corte Filete Mignon', 'Vino Oporto', 'Mantequilla trufada', 'Espárragos', 'Papas selectas'],
    ubicacion: 'Campos Elíseos, Polanco, CDMX',
    tag: 'Premium',
  },
  {
    platillo_id: 'd3',
    nombre: 'Pato Pekín Laminado',
    restaurante_nombre: 'Gran Dragón Dorado',
    restaurante_id: '22222222-2222-2222-2222-222222222222',
    precio: 450,
    emoji: '🦆',
    porcentaje_match: 95,
    motivo_match: 'Un clásico de la cocina imperial. Su piel laqueada ultra crujiente te fascinará al primer bocado.',
    ingredientes: ['Pato entero', 'Crepas chinas', 'Salsa Hoisin', 'Puerro', 'Pepino'],
    ubicacion: 'Barrio Chino, Centro Histórico, CDMX',
    tag: 'Oriental',
  },
  {
    platillo_id: 'd4',
    nombre: 'Tártara de Atún Aleta Azul',
    restaurante_nombre: "L'Étoile Gourmet",
    restaurante_id: '33333333-3333-3333-3333-333333333333',
    precio: 285,
    emoji: '🐟',
    porcentaje_match: 93,
    motivo_match: 'Buscas frescura y sofisticación. El marinado cítrico resalta la textura premium del atún fresco.',
    ingredientes: ['Atún fresco', 'Aguacate', 'Rábano sandía', 'Aceite de sésamo', 'Cebollín'],
    ubicacion: 'Campos Elíseos, Polanco, CDMX',
    tag: 'Premium',
  },
  {
    platillo_id: 'd5',
    nombre: 'Tacos al Pastor Especiales',
    restaurante_nombre: 'El Fogón de México',
    restaurante_id: '1',
    precio: 120,
    emoji: '🌮',
    porcentaje_match: 92,
    motivo_match: 'Te encantan los sabores picositos y este adobo es legendario. Preparado al carbón con piña miel.',
    ingredientes: ['Carne de cerdo', 'Piña', 'Cilantro', 'Cebolla', 'Tortilla a mano'],
    ubicacion: 'Av. Reforma 123, CDMX',
    tag: 'Mexicana',
  },
  {
    platillo_id: 'd6',
    nombre: 'Bowl Keto Energético',
    restaurante_nombre: 'Green Point',
    restaurante_id: '2',
    precio: 185,
    emoji: '🥑',
    porcentaje_match: 90,
    motivo_match: 'Ideal para tu dieta baja en carbohidratos. Frescura y proteína en cada bocado.',
    ingredientes: ['Salmón', 'Aguacate', 'Espinacas', 'Huevo pochado', 'Semillas de cáñamo'],
    ubicacion: 'Colonia Roma Norte, CDMX',
    tag: 'Saludable',
  },
  {
    platillo_id: 'd7',
    nombre: 'Pizza de Masa Madre',
    restaurante_nombre: 'Pizza Nostra',
    restaurante_id: '3',
    precio: 210,
    emoji: '🍕',
    porcentaje_match: 85,
    motivo_match: 'Buscas algo para compartir y esta pizza artesanal es la mejor puntuada de la zona.',
    ingredientes: ['Harina integral', 'Mozzarella di bufala', 'Albahaca fresca', 'Tomate San Marzano'],
    ubicacion: 'Polanco, CDMX',
    tag: 'Italiana',
  },
];

const GRADIENT_MAP: Record<string, string> = {
  Mexicana:  'from-[#FF4A00]/25 via-[#FF8C00]/15 to-[#FFD700]/10',
  Saludable: 'from-[#22C55E]/20 via-[#16A34A]/10 to-[#86EFAC]/10',
  Italiana:  'from-[#EF4444]/20 via-[#F97316]/10 to-[#FDE047]/10',
  Premium:   'from-[#D4AF37]/20 via-[#C4B5FD]/10 to-[#8B5CF6]/10',
  Japonesa:  'from-[#EC4899]/20 via-[#F43F5E]/15 to-[#FDA4AF]/10',
  Oriental:  'from-[#D92B2B]/20 via-[#FF5722]/15 to-[#FFC107]/10',
};

function SwipeCard({
  platillo,
  onSwipe,
  onViewMenu,
}: {
  platillo: any;
  onSwipe: (dir: 'left' | 'right') => void;
  onViewMenu: () => void;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-160, 160], [-18, 18]);
  const likeOpacity = useTransform(x, [20, 100], [0, 1]);
  const nopeOpacity = useTransform(x, [-100, -20], [1, 0]);
  const cardScale = useTransform(x, [-160, 0, 160], [0.95, 1, 0.95]);

  const gradient = GRADIENT_MAP[platillo.tag] || GRADIENT_MAP['Mexicana'];

  function handleDragEnd(_: any, info: PanInfo) {
    if (info.offset.x > 100) onSwipe('right');
    else if (info.offset.x < -100) onSwipe('left');
  }

  return (
    <motion.div
      style={{ x, rotate, scale: cardScale }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.8}
      onDragEnd={handleDragEnd}
      initial={{ scale: 0.92, opacity: 0, y: 24 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ opacity: 0, transition: { duration: 0.15 } }}
      transition={{ type: 'spring', stiffness: 280, damping: 22 }}
      className="absolute inset-0 cursor-grab active:cursor-grabbing select-none"
    >
      {/* Like / Nope overlays */}
      <motion.div
        style={{ opacity: likeOpacity }}
        className="absolute top-8 left-8 z-20 px-5 py-2 rounded-2xl border-[3px] border-[#22C55E] rotate-[-12deg]"
      >
        <span className="text-[#22C55E] font-black text-2xl tracking-widest">ME GUSTA</span>
      </motion.div>
      <motion.div
        style={{ opacity: nopeOpacity }}
        className="absolute top-8 right-8 z-20 px-5 py-2 rounded-2xl border-[3px] border-[#EF4444] rotate-[12deg]"
      >
        <span className="text-[#EF4444] font-black text-2xl tracking-widest">NOPE</span>
      </motion.div>

      {/* Card body */}
      <div className="w-full h-full rounded-[2rem] overflow-hidden bg-white dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] shadow-2xl dark:shadow-black/60 flex flex-col">
        {/* Image area */}
        <div className={`relative flex-1 bg-gradient-to-br ${gradient} flex items-center justify-center`}>
          {/* Glow */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

          <motion.span
            className="text-[110px] leading-none drop-shadow-2xl"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            {platillo.emoji}
          </motion.span>

          {/* Match badge */}
          <div className="absolute top-5 right-5 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/50 dark:bg-black/60 backdrop-blur-xl border border-white/10">
            <div className="w-1.5 h-1.5 rounded-full bg-[#FF4A00] animate-pulse" />
            <span className="text-white font-bold text-[13px]">{platillo.porcentaje_match}% match</span>
          </div>

          {/* Tag */}
          <div className="absolute top-5 left-5 px-3 py-1 rounded-full bg-white/15 dark:bg-white/10 backdrop-blur-md border border-white/20">
            <span className="text-white text-[11px] font-semibold tracking-wide">{platillo.tag}</span>
          </div>

          {/* Bottom info overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/70 via-black/30 to-transparent">
            <h2 className="text-white text-2xl font-black leading-tight mb-1 drop-shadow">{platillo.nombre}</h2>
            <p className="text-white/70 text-[13px] font-semibold">📍 {platillo.restaurante_nombre}</p>
          </div>
        </div>

        {/* Info area */}
        <div className="flex-shrink-0 p-5 space-y-4">
          <p className="text-[#6E6E73] dark:text-[#A1A1A6] text-[13px] leading-relaxed line-clamp-2">
            {platillo.motivo_match}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-1.5">
              {platillo.ingredientes.slice(0, 3).map((ing: string) => (
                <span key={ing} className="px-2.5 py-1 rounded-full bg-black/[0.05] dark:bg-white/[0.06] text-[#1D1D1F] dark:text-[#F5F5F7] text-[11px] font-medium border border-black/[0.06] dark:border-white/[0.06]">
                  {ing}
                </span>
              ))}
            </div>
            <span className="text-[20px] font-black text-[#FF4A00] flex-shrink-0 ml-2">${platillo.precio}</span>
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); onViewMenu(); }}
            className="w-full py-3 rounded-2xl bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F] text-[14px] font-bold transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
          >
            Ver menú completo →
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export function Descubrir() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const [platillos, setPlatillos] = useState<any[]>(PLATILLOS_DUMMY);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lastAction, setLastAction] = useState<'like' | 'nope' | null>(null);

  useEffect(() => {
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
          setPlatillos(prev => [...data.resultados, ...prev.filter((d: any) => !data.resultados.some((r: any) => r.platillo_id === d.platillo_id))]);
        }
      } catch {}
    };
    fetchReal();
  }, []);

  const currentPlatillo = platillos[currentIndex];
  const nextPlatillo = platillos[currentIndex + 1];

  function handleSwipe(dir: 'left' | 'right') {
    setLastAction(dir === 'right' ? 'like' : 'nope');
    setTimeout(() => setLastAction(null), 700);
    setCurrentIndex(i => i + 1);
  }

  // Empty state
  if (!currentPlatillo) {
    return (
      <div className="min-h-screen bg-white dark:bg-black text-[#1D1D1F] dark:text-[#F5F5F7] flex flex-col transition-colors duration-300">
        <nav className="fixed top-0 left-0 right-0 z-50 h-[60px] flex items-center justify-between px-6 border-b border-black/[0.06] dark:border-white/[0.06] backdrop-blur-xl bg-white/80 dark:bg-black/80">
          <Link to="/" className="flex items-center gap-2"><Logo size={24} /><span className="font-semibold text-[15px]">MexxicanMX</span></Link>
          <button onClick={toggleTheme} className="p-2 text-[#86868B] dark:text-[#A1A1A6] hover:text-[#1D1D1F] dark:hover:text-white rounded-lg transition-colors">{theme === 'dark' ? '☀️' : '🌙'}</button>
        </nav>
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center pt-20">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1, rotate: [0, 10, -10, 0] }} transition={{ duration: 0.6 }} className="text-8xl mb-8">🎉</motion.div>
          <h2 className="text-3xl font-black mb-3 tracking-tight">¡Exploraste todo!</h2>
          <p className="text-[#86868B] dark:text-[#A1A1A6] mb-10 max-w-xs">Has visto todos los platillos disponibles. ¿Volvemos a empezar?</p>
          <button onClick={() => navigate('/cuestionario')} className="px-10 py-4 bg-[#FF4A00] text-white rounded-full font-bold hover:bg-[#FF5722] transition-all hover:scale-[1.03] shadow-[0_16px_32px_rgba(255,74,0,0.25)]">
            🔄 Nuevo descubrimiento
          </button>
        </main>
      </div>
    );
  }

  const remaining = platillos.length - currentIndex - 1;

  return (
    <div className="min-h-screen bg-[#F5F5F7] dark:bg-[#050505] text-[#1D1D1F] dark:text-[#F5F5F7] transition-colors duration-300 overflow-hidden">

      {/* ── NAVBAR ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-[60px] flex items-center justify-between px-5 md:px-8 border-b border-black/[0.06] dark:border-white/[0.06] backdrop-blur-xl bg-[#F5F5F7]/80 dark:bg-[#050505]/80 transition-colors duration-300">
        <Link to="/" className="flex items-center gap-2 group select-none">
          <Logo size={24} className="group-hover:rotate-12 transition-transform duration-300" />
          <span className="font-semibold text-[15px] tracking-tight">MexxicanMX</span>
        </Link>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/[0.05] dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.06]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF4A00] animate-pulse" />
          <span className="text-[12px] font-semibold text-[#86868B] dark:text-[#A1A1A6]">{remaining} platillos restantes</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/cuestionario')}
            className="hidden sm:flex items-center gap-1.5 px-4 py-2 text-[12px] font-semibold rounded-full border border-black/[0.08] dark:border-white/[0.10] hover:bg-black/[0.05] dark:hover:bg-white/[0.06] transition-all"
          >
            🎯 Refinar búsqueda
          </button>
          <button onClick={toggleTheme} className="p-2 text-[#86868B] dark:text-[#A1A1A6] hover:text-[#1D1D1F] dark:hover:text-white rounded-lg transition-colors">
            {isDark ? '☀️' : '🌙'}
          </button>
        </div>
      </nav>

      {/* ── MAIN LAYOUT ── */}
      <div className="pt-[60px] min-h-screen flex flex-col lg:flex-row">

        {/* Left panel — desktop only */}
        <div className="hidden lg:flex flex-col justify-center px-12 xl:px-20 w-[380px] xl:w-[440px] flex-shrink-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPlatillo.platillo_id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.4 }}
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#FF4A00] mb-4">
                Recomendado por IA
              </p>
              <h1 className="text-[2.8rem] font-black tracking-tighter leading-tight mb-4">
                {currentPlatillo.nombre}
              </h1>
              <p className="text-[15px] text-[#86868B] dark:text-[#A1A1A6] leading-relaxed mb-8">
                {currentPlatillo.motivo_match}
              </p>

              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-[#FF4A00]/10 dark:bg-[#FF4A00]/15 flex items-center justify-center text-sm">📍</span>
                  <span className="text-[14px] text-[#86868B] dark:text-[#A1A1A6]">{currentPlatillo.ubicacion}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-[#FF4A00]/10 dark:bg-[#FF4A00]/15 flex items-center justify-center text-sm">🏪</span>
                  <span className="text-[14px] font-semibold">{currentPlatillo.restaurante_nombre}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-[#FF4A00]/10 dark:bg-[#FF4A00]/15 flex items-center justify-center text-sm">💰</span>
                  <span className="text-[18px] font-black text-[#FF4A00]">${currentPlatillo.precio}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {currentPlatillo.ingredientes.map((ing: string) => (
                  <span key={ing} className="px-3 py-1.5 rounded-full bg-black/[0.05] dark:bg-white/[0.06] text-[12px] font-medium border border-black/[0.06] dark:border-white/[0.06]">
                    {ing}
                  </span>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Center — card stack */}
        <div className="flex-1 flex flex-col items-center justify-center py-8 px-4 relative">

          {/* Background blob */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPlatillo.platillo_id + '-bg'}
              className={`absolute inset-0 pointer-events-none bg-gradient-to-br ${GRADIENT_MAP[currentPlatillo.tag] || GRADIENT_MAP['Mexicana']} opacity-30 dark:opacity-20 blur-[80px]`}
              initial={{ opacity: 0 }}
              animate={{ opacity: isDark ? 0.2 : 0.3 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
            />
          </AnimatePresence>

          {/* Card stack */}
          <div className="relative w-full max-w-[340px] sm:max-w-[380px]" style={{ height: '560px' }}>
            {/* Next card shadow behind */}
            {nextPlatillo && (
              <div className="absolute inset-x-4 bottom-0 top-4 rounded-[2rem] bg-black/[0.06] dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.04]" />
            )}

            {/* Current card */}
            <AnimatePresence mode="wait">
              <SwipeCard
                key={currentPlatillo.platillo_id}
                platillo={currentPlatillo}
                onSwipe={handleSwipe}
                onViewMenu={() => navigate(`/menu/${currentPlatillo.restaurante_id}`)}
              />
            </AnimatePresence>

            {/* Action feedback flash */}
            <AnimatePresence>
              {lastAction && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.2 }}
                  transition={{ duration: 0.25 }}
                  className="absolute inset-0 rounded-[2rem] flex items-center justify-center z-30 pointer-events-none"
                  style={{ background: lastAction === 'like' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)' }}
                >
                  <span className="text-7xl">{lastAction === 'like' ? '❤️' : '💨'}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-6 mt-8">
            <motion.button
              whileTap={{ scale: 0.85, rotate: -8 }}
              whileHover={{ scale: 1.08 }}
              onClick={() => handleSwipe('left')}
              className="w-[60px] h-[60px] rounded-full bg-white dark:bg-[#1C1C1E] border border-black/[0.08] dark:border-white/[0.10] flex items-center justify-center text-2xl shadow-lg dark:shadow-black/40 transition-all"
            >
              👎
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.85 }}
              whileHover={{ scale: 1.08 }}
              onClick={() => navigate(`/menu/${currentPlatillo.restaurante_id}`)}
              className="w-[52px] h-[52px] rounded-full bg-black/[0.05] dark:bg-white/[0.06] border border-black/[0.08] dark:border-white/[0.10] flex items-center justify-center text-xl shadow-md dark:shadow-black/30 transition-all"
              title="Ver menú"
            >
              📋
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.85, rotate: 8 }}
              whileHover={{ scale: 1.08 }}
              onClick={() => handleSwipe('right')}
              className="w-[60px] h-[60px] rounded-full bg-gradient-to-br from-[#FF2A54] to-[#FF4A00] flex items-center justify-center text-2xl shadow-xl shadow-[#FF4A00]/30 transition-all"
            >
              ❤️
            </motion.button>
          </div>

          <p className="mt-5 text-[11px] uppercase tracking-[0.18em] text-[#AEAEB2] dark:text-[#6E6E73] font-medium">
            Arrastra o usa los botones
          </p>
        </div>

        {/* Right panel — desktop only */}
        <div className="hidden lg:flex flex-col justify-center px-12 xl:px-16 w-[340px] xl:w-[400px] flex-shrink-0 gap-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#86868B] dark:text-[#6E6E73]">
            Próximos platillos
          </p>

          <div className="space-y-3">
            {platillos.slice(currentIndex + 1, currentIndex + 4).map((p, i) => (
              <motion.div
                key={p.platillo_id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1 - i * 0.2, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-[#1C1C1E] border border-black/[0.05] dark:border-white/[0.06]"
              >
                <span className="text-3xl">{p.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[14px] truncate">{p.nombre}</p>
                  <p className="text-[12px] text-[#86868B] dark:text-[#A1A1A6] truncate">{p.restaurante_nombre}</p>
                </div>
                <span className="text-[13px] font-bold text-[#FF4A00] flex-shrink-0">{p.porcentaje_match}%</span>
              </motion.div>
            ))}
          </div>

          <div className="p-5 rounded-2xl bg-[#FF4A00]/[0.06] dark:bg-[#FF4A00]/[0.08] border border-[#FF4A00]/15">
            <p className="text-[12px] font-semibold text-[#FF4A00] mb-1">💡 ¿No es lo que buscas?</p>
            <p className="text-[12px] text-[#86868B] dark:text-[#A1A1A6] leading-relaxed mb-3">Afina tu búsqueda con el cuestionario IA.</p>
            <button
              onClick={() => navigate('/cuestionario')}
              className="text-[12px] font-bold text-[#FF4A00] hover:underline transition-all"
            >
              Refinar ahora →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
