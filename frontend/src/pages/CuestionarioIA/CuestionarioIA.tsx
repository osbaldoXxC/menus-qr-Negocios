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
      const finalRespuestas = {
        ...respuestas,
        sabor_antojo: respuestas.sabor_antojo || 'Algo delicioso'
      };
      localStorage.setItem('cuestionario', JSON.stringify(finalRespuestas));
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
    <div className="bg-white dark:bg-black text-[#1D1D1F] dark:text-[#F5F5F7] min-h-screen transition-colors duration-300">
      {/* Top Nav */}
      <nav className="fixed top-0 left-0 right-0 glass z-50 border-b border-[var(--app-border)]">
        <div className="px-4 py-3 flex items-center justify-between max-w-lg mx-auto">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌮</span>
            <span className="font-bold text-gradient-apple">
              MexxicanMX
            </span>
          </div>
          <div className="text-sm text-[var(--app-text-secondary)]">
            <span className="text-apple-blue font-semibold">{step}</span> / {TOTAL_STEPS}
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-1 bg-black/5 dark:bg-white/5">
          <motion.div
            className="h-full bg-gradient-to-r from-apple-blue to-apple-blue-hover"
            initial={{ width: '0%' }}
            animate={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          />
        </div>
      </nav>

      <div className="pt-20 pb-24 px-4 min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Background mesh */}
        <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-apple-blue/5 blur-[100px] -z-10" />

        <div className="w-full max-w-lg relative z-10">
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
                  <p className="text-[var(--app-text-secondary)] text-sm max-w-xs mx-auto">
                    Describe con tus propias palabras lo que se te antoja comer hoy
                  </p>
                </div>

                <textarea
                  value={respuestas.sabor_antojo}
                  onChange={(e) =>
                    setRespuestas({ ...respuestas, sabor_antojo: e.target.value })
                  }
                  rows={4}
                  className="w-full px-4 py-4 bg-black/5 dark:bg-white/[0.03] border border-[var(--app-border)] rounded-apple-lg text-[var(--app-text)] placeholder-[var(--app-text-tertiary)] focus:border-apple-blue/40 focus:outline-none transition-all duration-200 resize-none text-base"
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
                        className="px-3 py-1.5 rounded-full bg-apple-bg-secondary dark:bg-white/[0.04] text-[var(--app-text-secondary)] text-xs hover:bg-apple-blue/10 hover:text-apple-blue transition"
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
                  <p className="text-[var(--app-text-secondary)] text-sm">¿Sigues algún tipo de dieta?</p>
                </div>

                <div className="space-y-3">
                  {dietas.map((dieta) => (
                    <motion.button
                      key={dieta.value}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setRespuestas({ ...respuestas, dieta: dieta.value })}
                      className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center gap-3 ${
                        respuestas.dieta === dieta.value
                          ? 'border-apple-blue/40 bg-apple-blue/5 shadow-apple-sm'
                          : 'border-[var(--app-border)] text-[var(--app-text-secondary)] hover:border-apple-blue/20'
                      }`}
                    >
                      <span className="text-xl">{dieta.label.split(' ')[0]}</span>
                      <div>
                        <div className="font-semibold text-[var(--app-text)]">
                          {dieta.label.split(' ').slice(1).join(' ')}
                        </div>
                        <div className="text-xs text-[var(--app-text-tertiary)]">{dieta.desc}</div>
                      </div>
                      {respuestas.dieta === dieta.value && (
                        <motion.span
                          className="ml-auto text-apple-blue"
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
                  <p className="text-[var(--app-text-secondary)] text-sm">
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
                            ? 'bg-red-500/10 border border-red-500/20 text-red-500'
                            : 'bg-black/5 dark:bg-white/[0.03] border border-[var(--app-border)] text-[var(--app-text-secondary)] hover:bg-black/10'
                        }`}
                      >
                        {alergia}
                      </motion.button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-3 p-4 rounded-apple-lg glass border border-[var(--app-border)]">
                  <span className="text-xl">🤖</span>
                  <p className="text-xs text-[var(--app-text-secondary)]">
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
                  <p className="text-[var(--app-text-secondary)] text-sm">Así la IA ajusta las recomendaciones</p>
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
                          ? 'border-apple-blue/40 bg-apple-blue/5 shadow-apple-sm'
                          : 'border-[var(--app-border)] text-[var(--app-text-secondary)] hover:border-apple-blue/20'
                      }`}
                    >
                      <div className="text-3xl mb-2">{ocasion.emoji}</div>
                      <div className="font-semibold text-[var(--app-text)] text-sm">
                        {ocasion.label}
                      </div>
                    </motion.button>
                  ))}
                </div>

                <motion.div
                  className="mt-8 p-5 rounded-apple-lg bg-gradient-to-br from-apple-blue/5 to-apple-blue-hover/5 border border-apple-blue/15 text-center"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="text-3xl mb-2">✨</div>
                  <p className="text-sm text-apple-blue font-semibold mb-1">
                    ¡Todo listo!
                  </p>
                  <p className="text-xs text-[var(--app-text-secondary)]">
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
                className="flex-1 py-3.5 rounded-apple-full border border-[var(--app-border)] font-semibold text-[var(--app-text-secondary)] hover:border-apple-blue/40 hover:text-[var(--app-text)] transition-all duration-200"
              >
                Atrás
              </motion.button>
            ) : (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/no-sabes-que-comer')}
                className="flex-1 py-3.5 rounded-apple-full border border-[var(--app-border)] font-semibold text-[var(--app-text-secondary)] hover:border-apple-blue/40 hover:text-[var(--app-text)] transition-all duration-200"
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
                  ? 'bg-black/5 dark:bg-white/5 text-[var(--app-text-tertiary)] cursor-not-allowed'
                  : 'bg-apple-blue text-white hover:bg-apple-blue-hover shadow-apple'
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
                  i + 1 <= step ? 'bg-apple-blue' : 'bg-black/10 dark:bg-white/10'
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
