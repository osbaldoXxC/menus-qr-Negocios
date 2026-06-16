import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Footer } from '../components/Footer';

const TOTAL_STEPS = 4;

const alergiasComunes = [
  '🥜 Cacahuate',
  '🍤 Camarón',
  '🥛 Lácteos',
  '🌾 Gluten',
  '🥚 Huevo',
  '🐟 Pescado',
  '🌰 Nueces',
  '🦀 Mariscos',
];

const dietas = [
  { value: 'ninguna', label: '🍽️ Sin restricciones', desc: 'Como de todo' },
  { value: 'vegetariana', label: '🥬 Vegetariana', desc: 'Sin carne' },
  { value: 'vegana', label: '🌱 Vegana', desc: 'Sin productos animales' },
  { value: 'sin_gluten', label: '🌾 Sin gluten', desc: 'Libre de trigo/gluten' },
  { value: 'keto', label: '🥑 Keto', desc: 'Baja en carbohidratos' },
];

const ocasiones = [
  { value: 'Solo', emoji: '🧑', label: 'Solo' },
  { value: 'Pareja', emoji: '💑', label: 'En pareja' },
  { value: 'Familia', emoji: '👨‍👩‍👧‍👦', label: 'Familia' },
  { value: 'Amigos', emoji: '🎉', label: 'Con amigos' },
];

const stepVariants = {
  enter: (direction: number) => ({ x: direction > 0 ? 40 : -40, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction < 0 ? 40 : -40, opacity: 0 }),
};

export function CuestionarioIA() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [respuestas, setRespuestas] = useState({
    sabor_antojo: '',
    dieta: 'ninguna',
    alergias: [] as string[],
    ocasion: 'Solo',
  });

  const toggleAlergia = (alergia: string) => {
    setRespuestas((prev) => ({
      ...prev,
      alergias: prev.alergias.includes(alergia)
        ? prev.alergias.filter((a) => a !== alergia)
        : [...prev.alergias, alergia],
    }));
  };

  const handleNext = () => {
    if (step < TOTAL_STEPS) {
      setDirection(1);
      setStep(step + 1);
    } else {
      localStorage.setItem('cuestionario', JSON.stringify(respuestas));
      navigate('/descubrir');
    }
  };

  const handlePrev = () => {
    setDirection(-1);
    setStep(step - 1);
  };

  const canAdvance = () => {
    if (step === 1) return respuestas.sabor_antojo.trim().length > 0;
    return true;
  };

  return (
    <div className="bg-[#000000] text-[#F5F5F7] min-h-screen">
      {/* Top Nav */}
      <nav className="fixed top-0 left-0 right-0 glass z-50 border-b border-white/[0.06]">
        <div className="px-4 py-3 flex items-center justify-between max-w-lg mx-auto">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌮</span>
            <span className="font-bold text-gradient-apple">
              MexxicanMX
            </span>
          </div>
          <div className="text-sm text-[#6E6E73]">
            <span className="text-[#2997FF] font-semibold">{step}</span> / {TOTAL_STEPS}
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-1 bg-white/[0.04]">
          <motion.div
            className="h-full bg-gradient-to-r from-[#2997FF] to-[#40A9FF]"
            initial={{ width: '0%' }}
            animate={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          />
        </div>
      </nav>

      <div className="pt-20 pb-24 px-4 min-h-screen flex items-center justify-center">
        <div className="w-full max-w-lg">
          <AnimatePresence mode="wait" custom={direction}>
            {step === 1 && (
              <motion.div
                key="step1"
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: 'easeInOut' }}
              >
                <div className="text-center mb-8">
                  <motion.div
                    className="text-6xl mb-4"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    🤤
                  </motion.div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-2">¿Qué antojo tienes?</h2>
                  <p className="text-[#A1A1A6] text-sm max-w-xs mx-auto">
                    Describe con tus propias palabras lo que se te antoja comer hoy
                  </p>
                </div>

                <textarea
                  value={respuestas.sabor_antojo}
                  onChange={(e) =>
                    setRespuestas({ ...respuestas, sabor_antojo: e.target.value })
                  }
                  rows={4}
                  className="w-full px-4 py-4 bg-white/[0.03] border border-white/[0.06] rounded-apple-lg text-[#F5F5F7] placeholder-[#6E6E73] focus:border-[#2997FF]/40 focus:outline-none focus:bg-white/[0.04] transition-all duration-200 resize-none text-base"
                  placeholder='Ej: "Quiero algo caldosito y muy picante para revivir el alma..."'
                  autoFocus
                />

                <div className="flex flex-wrap gap-2 mt-4">
                  {['🌶️ Picante', '🍜 Caldosito', '🍕 Italiana', '🍣 Japonesa', '🌮 Mexicana', '🍔 Rápida'].map(
                    (sug) => (
                      <button
                        key={sug}
                        onClick={() =>
                          setRespuestas({ ...respuestas, sabor_antojo: sug })
                        }
                        className="px-3 py-1.5 rounded-full bg-white/[0.04] text-[#A1A1A6] text-xs hover:bg-[#2997FF]/10 hover:text-[#2997FF] transition"
                      >
                        {sug}
                      </button>
                    )
                  )}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: 'easeInOut' }}
              >
                <div className="text-center mb-8">
                  <motion.div
                    className="text-6xl mb-4"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.4 }}
                  >
                    🥗
                  </motion.div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-2">Preferencias alimenticias</h2>
                  <p className="text-[#A1A1A6] text-sm">¿Sigues algún tipo de dieta?</p>
                </div>

                <div className="space-y-3">
                  {dietas.map((dieta) => (
                    <motion.button
                      key={dieta.value}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setRespuestas({ ...respuestas, dieta: dieta.value })}
                      className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center gap-3 ${
                        respuestas.dieta === dieta.value
                          ? 'border-[#2997FF]/40 bg-[#2997FF]/5 shadow-lg shadow-[#2997FF]/5'
                          : 'border-white/[0.06] text-[#A1A1A6] hover:border-white/[0.10]'
                      }`}
                    >
                      <span className="text-xl">{dieta.label.split(' ')[0]}</span>
                      <div>
                        <div className="font-semibold text-[#F5F5F7]">
                          {dieta.label.split(' ').slice(1).join(' ')}
                        </div>
                        <div className="text-xs text-[#6E6E73]">{dieta.desc}</div>
                      </div>
                      {respuestas.dieta === dieta.value && (
                        <motion.span
                          className="ml-auto text-[#2997FF]"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                        >
                          ✓
                        </motion.span>
                      )}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: 'easeInOut' }}
              >
                <div className="text-center mb-8">
                  <motion.div
                    className="text-6xl mb-4"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.4 }}
                  >
                    ⚠️
                  </motion.div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-2">Alergias e intolerancias</h2>
                  <p className="text-[#A1A1A6] text-sm">
                    Selecciona si tienes alguna (así la IA los descarta)
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  {alergiasComunes.map((alergia) => {
                    const selected = respuestas.alergias.includes(alergia);
                    return (
                      <motion.button
                        key={alergia}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => toggleAlergia(alergia)}
                        className={`px-4 py-2.5 rounded-full text-sm transition-all ${
                          selected
                            ? 'bg-[#FF453A]/5 border border-[#FF453A]/15 text-[#FF453A] shadow-lg shadow-[#FF453A]/5'
                            : 'bg-white/[0.03] border border-white/[0.06] text-[#A1A1A6] hover:bg-white/[0.05]'
                        }`}
                      >
                        {alergia}
                      </motion.button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-3 p-4 rounded-apple-lg glass border border-white/[0.06]">
                  <span className="text-xl">🤖</span>
                  <p className="text-xs text-[#A1A1A6]">
                    La IA usará esta información para recomendarte platillos seguros y
                    deliciosos. Tus alergias son prioridad #1.
                  </p>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: 'easeInOut' }}
              >
                <div className="text-center mb-8">
                  <motion.div
                    className="text-6xl mb-4"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.4 }}
                  >
                    🎯
                  </motion.div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-2">¿Con quién comes?</h2>
                  <p className="text-[#A1A1A6] text-sm">Así la IA ajusta las recomendaciones</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {ocasiones.map((ocasion) => (
                    <motion.button
                      key={ocasion.value}
                      whileTap={{ scale: 0.95 }}
                      onClick={() =>
                        setRespuestas({ ...respuestas, ocasion: ocasion.value })
                      }
                      className={`p-5 rounded-2xl border transition-all text-center ${
                        respuestas.ocasion === ocasion.value
                          ? 'border-[#2997FF]/40 bg-[#2997FF]/5 shadow-lg shadow-[#2997FF]/5'
                          : 'border-white/[0.06] text-[#A1A1A6] hover:border-white/[0.10]'
                      }`}
                    >
                      <div className="text-3xl mb-2">{ocasion.emoji}</div>
                      <div className="font-semibold text-[#F5F5F7] text-sm">
                        {ocasion.label}
                      </div>
                    </motion.button>
                  ))}
                </div>

                <motion.div
                  className="mt-8 p-5 rounded-apple-lg bg-gradient-to-br from-[#2997FF]/5 to-[#40A9FF]/5 border border-[#2997FF]/15 text-center"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="text-3xl mb-2">✨</div>
                  <p className="text-sm text-[#2997FF] font-semibold mb-1">
                    ¡Todo listo!
                  </p>
                  <p className="text-xs text-[#A1A1A6]">
                    Tu motor de recomendaciones te espera
                  </p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex gap-3 mt-8">
            {step > 1 ? (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handlePrev}
                className="flex-1 py-3.5 rounded-apple-full border border-white/[0.10] font-semibold text-[#A1A1A6] hover:border-[#2997FF]/40 hover:text-[#F5F5F7] transition-all duration-200"
              >
                Atrás
              </motion.button>
            ) : (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/landing')}
                className="flex-1 py-3.5 rounded-apple-full border border-white/[0.10] font-semibold text-[#A1A1A6] hover:border-[#2997FF]/40 hover:text-[#F5F5F7] transition-all duration-200"
              >
                Cancelar
              </motion.button>
            )}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleNext}
              disabled={!canAdvance()}
              className={`flex-1 py-3.5 rounded-apple-full font-semibold transition-all ${
                !canAdvance()
                  ? 'bg-white/[0.03] text-[#6E6E73] cursor-not-allowed'
                  : 'bg-[#2997FF] text-white hover:bg-[#40A9FF] hover:shadow-[0_0_24px_rgba(41,151,255,0.2)]'
              }`}
            >
              {step === TOTAL_STEPS ? '🚀 Descubrir platillos' : 'Continuar →'}
            </motion.button>
          </div>

          {/* Step indicators */}
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <motion.div
                key={i}
                className={`w-2 h-2 rounded-full ${
                  i + 1 <= step ? 'bg-[#2997FF]' : 'bg-white/[0.08]'
                }`}
                animate={i + 1 === step ? { scale: [1, 1.3, 1] } : {}}
                transition={{ duration: 0.4 }}
              />
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}