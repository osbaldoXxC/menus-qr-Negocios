import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';

const fadeUpVariant = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] },
  }),
};

export function Landing() {
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const opacityHero = useTransform(scrollY, [0, 400], [1, 0]);
  const scaleHero = useTransform(scrollY, [0, 400], [1, 0.95]);

  return (
    <div className="text-apple-text dark:text-apple-dark-text min-h-screen font-sans selection:bg-apple-blue/20">
      
      {/* ── HERO ────────────────────────────────────────────────── */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20 pb-16">
        <motion.div 
          style={{ opacity: opacityHero, scale: scaleHero }} 
          className="relative z-10 max-w-[1200px] mx-auto px-6 text-center"
        >
          <motion.div
            className="inline-flex items-center gap-3 mb-8 px-5 py-2.5 rounded-full border border-apple-border dark:border-apple-dark-border bg-apple-bg-secondary/50 dark:bg-apple-dark-bg-secondary/50 backdrop-blur-xl shadow-apple-sm"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-apple-blue animate-pulse shadow-apple-glow" />
            <span className="text-sm font-medium tracking-wide">MexxicanMX V3 Ya Disponible</span>
          </motion.div>

          <motion.h1
            className="text-[3.5rem] md:text-[5.5rem] lg:text-[7rem] font-bold leading-[1.05] tracking-tight mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            El menú que <br/>
            <span className="text-apple-blue dark:text-apple-blue-hover">
              sabe lo que quieres
            </span>
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl text-apple-text-secondary dark:text-apple-dark-text-secondary leading-relaxed max-w-[650px] mx-auto mb-12 font-medium"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Descubre tu próximo antojo con Inteligencia Artificial o crea el menú digital más rápido y elegante para tu restaurante.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <button
              onClick={() => navigate('/register')}
              className="px-8 py-4 bg-apple-blue text-white text-[1.05rem] font-bold rounded-2xl shadow-apple-md hover:bg-apple-blue-hover transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              🚀 Registrar mi Restaurante
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-4 bg-apple-bg-secondary dark:bg-apple-dark-bg-secondary text-apple-text dark:text-apple-dark-text border border-apple-border dark:border-apple-dark-border text-[1.05rem] font-semibold rounded-2xl hover:bg-apple-bg-tertiary transition-all duration-300"
            >
              🔑 Acceso Negocios
            </button>
          </motion.div>
          
          <motion.div 
            className="mt-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <button 
              onClick={() => navigate('/no-sabes-que-comer')}
              className="text-apple-text-tertiary hover:text-apple-blue text-[15px] font-medium transition-colors group flex items-center gap-2 mx-auto"
            >
              ¿Buscas comida? Prueba nuestro recomendador IA 
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* ── CÓMO FUNCIONA ──────────────────────────────────────── */}
      <section className="relative py-32 border-t border-apple-border dark:border-apple-dark-border bg-apple-bg-secondary/30 dark:bg-apple-dark-bg-secondary/30 backdrop-blur-sm">
        <div className="max-w-[1200px] mx-auto px-6">
          <motion.div
            className="text-center mb-24"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeUpVariant}
            custom={0}
          >
            <h2 className="text-[2.5rem] md:text-[4rem] font-bold tracking-tight mb-4">
              Encuentra tu match perfecto.
            </h2>
            <p className="text-xl text-apple-text-secondary">Cero búsquedas aburridas. Cero indecisión.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: '🧠', title: '1. Tu perfil de sabor', desc: 'Dinos qué se te antoja, tus alergias y tu dieta actual.' },
              { icon: '✨', title: '2. Magia en el Feed', desc: 'Nuestra IA analiza miles de recetas y te muestra solo lo que te hará feliz.' },
              { icon: '🔥', title: '3. Match & Disfruta', desc: 'Desliza como en Tinder, haz match con el platillo y encuentra dónde comerlo.' }
            ].map((step, i) => (
              <motion.div
                key={step.title}
                className="group relative p-10 rounded-[2.5rem] bg-apple-bg dark:bg-apple-dark-bg border border-apple-border dark:border-apple-dark-border hover:border-apple-blue transition-all duration-500 shadow-apple hover:shadow-apple-lg"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-100px' }}
                variants={fadeUpVariant}
                custom={i + 1}
              >
                <div className="text-5xl mb-8 transform group-hover:scale-110 transition-transform duration-500">{step.icon}</div>
                <h3 className="text-2xl font-bold mb-4 tracking-tight">{step.title}</h3>
                <p className="text-apple-text-secondary text-lg leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── RESTAURANTES ──────────────────────────────────── */}
      <section className="py-32 relative overflow-hidden bg-apple-bg dark:bg-apple-dark-bg">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUpVariant}
              custom={0}
            >
              <div className="inline-block px-4 py-1.5 rounded-full bg-apple-blue/10 text-apple-blue font-bold text-xs uppercase tracking-widest mb-6">
                SaaS Para Negocios
              </div>
              <h2 className="text-[3rem] md:text-[4.5rem] font-bold leading-[1] tracking-tight mb-8">
                Tu menú digital en <br/><span className="text-apple-blue">modo automático</span>.
              </h2>
              <p className="text-xl text-apple-text-secondary mb-10 leading-relaxed font-medium">
                Olvídate de los PDFs estáticos. Crea menús interactivos, genera códigos QR al instante y deja que nuestra IA recomiende tus platillos.
              </p>
              
              <ul className="space-y-5 mb-12">
                {['Panel de control intuitivo', 'Códigos QR únicos por sucursal', 'Exposición en el Feed Público con IA', 'Soporte para alergias y dietas'].map((item) => (
                  <li key={item} className="flex items-center gap-4 text-lg font-medium">
                    <div className="w-6 h-6 rounded-full bg-apple-blue/10 flex items-center justify-center text-apple-blue">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    {item}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => navigate('/register')}
                className="px-10 py-5 bg-apple-text dark:bg-apple-dark-text text-apple-bg dark:text-apple-dark-bg hover:opacity-90 text-[1.1rem] font-bold rounded-2xl transition-all duration-300 shadow-apple-md hover:scale-[1.02]"
              >
                Crear cuenta de Restaurante
              </button>
            </motion.div>

            {/* Visual representation */}
            <motion.div
              className="relative"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUpVariant}
              custom={1}
            >
              <div className="absolute inset-0 bg-apple-blue/10 blur-[120px] rounded-full" />
              <div className="relative rounded-[2.5rem] bg-apple-bg dark:bg-apple-dark-bg border border-apple-border dark:border-apple-dark-border shadow-apple-xl p-10 transform rotate-1 hover:rotate-0 transition-transform duration-700 backdrop-blur-md">
                <div className="flex justify-between items-center mb-10 pb-6 border-b border-apple-border dark:border-apple-dark-border">
                  <div>
                    <h4 className="text-2xl font-bold tracking-tight">Dashboard</h4>
                    <p className="text-apple-text-secondary">Tacos El Inge</p>
                  </div>
                  <div className="px-4 py-1.5 bg-green-500/10 text-green-500 rounded-full text-[12px] font-bold tracking-wider">ONLINE</div>
                </div>
                <div className="space-y-5">
                  {[
                    { n: 'Tacos al Pastor', p: '$120.00' },
                    { n: 'Volcán de Asada', p: '$180.00' },
                    { n: 'Quesadilla Especial', p: '$140.00' },
                  ].map((platillo) => (
                    <div key={platillo.n} className="flex justify-between items-center p-5 rounded-[1.25rem] bg-apple-bg-secondary dark:bg-apple-dark-bg-secondary border border-apple-border dark:border-apple-dark-border group hover:border-apple-blue/30 transition-colors">
                      <span className="font-bold text-lg">{platillo.n}</span>
                      <span className="text-apple-blue font-bold text-lg">{platillo.p}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}