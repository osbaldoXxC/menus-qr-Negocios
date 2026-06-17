import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

const fadeUpVariant = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  }),
};

const features = [
  { icon: '🤖', title: 'IA que te conoce', desc: 'Aprende de tus gustos y recomienda platillos que realmente quieres probar.' },
  { icon: '📱', title: 'Experiencia inmersiva', desc: 'Formato vertical tipo TikTok. Un platillo a la vez, sin distracciones.' },
  { icon: '⚡', title: 'QR instantáneo', desc: 'Menús digitales que cargan en milisegundos. Sin apps, sin fricción.' },
  { icon: '🔒', title: 'Privacidad total', desc: 'Tus datos protegidos. Sin anuncios, sin trackers invasivos.' },
];

const stats = [
  { value: '10K+', label: 'Comensales activos' },
  { value: '500+', label: 'Restaurantes' },
  { value: '50K+', label: 'Platillos recomendados' },
  { value: '98%', label: 'Satisfacción' },
];

export function Landing() {
  const navigate = useNavigate();

  return (
    <div className="bg-[#000000] text-[#F5F5F7] min-h-screen">
      <Header />

      {/* ── Hero ────────────────────────────────────────────────── */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden">
        {/* Background gradients */}
        <div className="absolute inset-0 bg-mesh" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[#2997FF] opacity-[0.03] blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[400px] bg-[#FF6B35] opacity-[0.03] blur-[100px] rounded-full" />

        <div className="relative z-10 max-w-[1200px] mx-auto px-5 md:px-8 pt-20 pb-10">
          <div className="text-center max-w-[680px] mx-auto">
            {/* Badge */}
            <motion.div
              className="inline-flex items-center gap-2 mb-8 px-4 py-2 glass-light rounded-full text-sm font-medium text-[#A1A1A6]"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              <span className="w-2 h-2 rounded-full bg-[#2997FF] animate-pulse" />
              Motor de Descubrimiento con IA
              <span className="text-[11px] px-2 py-0.5 bg-[#2997FF]/10 text-[#2997FF] rounded-full font-semibold">Beta</span>
            </motion.div>

            {/* Heading */}
            <motion.h1
              className="text-[3.25rem] md:text-[5rem] lg:text-[5.5rem] font-extrabold leading-[1.02] tracking-[-0.025em] mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              ¿Antojo?
              <br />
              <span className="text-gradient-apple">
                Nosotros te llevamos
              </span>
            </motion.h1>

            <motion.p
              className="text-[17px] md:text-[19px] text-[#A1A1A6] leading-relaxed max-w-[520px] mx-auto mb-10"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25, ease: 'easeOut' }}
            >
              Desliza, haz match y descubre tu próximo platillo favorito.
              IA que aprende de tus gustos como Netflix, pero para tu paladar mexicano.
            </motion.p>

            {/* CTAs */}
            <motion.div
              className="flex flex-col sm:flex-row gap-3 justify-center"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4, ease: 'easeOut' }}
            >
              <button
                onClick={() => navigate('/cuestionario')}
                className="btn-apple btn-apple-primary text-[15px] py-3.5 px-8"
              >
                🌮 Quiero comer
              </button>
              <button
                onClick={() => navigate('/register')}
                className="btn-apple btn-apple-outline text-[15px] py-3.5 px-8"
              >
                🍽️ Soy restaurante
              </button>
            </motion.div>

            {/* Stats */}
            <motion.div
              className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-[28px] md:text-[32px] font-bold text-[#2997FF] tracking-[-0.015em] mb-1">
                    {stat.value}
                  </div>
                  <div className="text-[13px] text-[#86868B]">{stat.label}</div>
                </div>
              ))}
            </motion.div>

            {/* Floating emoji cards */}
            <motion.div
              className="mt-16 glass rounded-apple-lg p-6 flex justify-center gap-6 max-w-md mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              {['🌮', '🥑', '🌯', '🍉'].map((emoji, i) => (
                <motion.span
                  key={emoji}
                  className="text-4xl"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ repeat: Infinity, duration: 3, delay: i * 0.2 }}
                >
                  {emoji}
                </motion.span>
              ))}
            </motion.div>
            <p className="text-[12px] text-[#6E6E73] mt-3">
              ✨ {Intl.NumberFormat().format(1234)} comensales activos ahora
            </p>
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#000000] to-transparent pointer-events-none" />
      </section>

      {/* ── Cómo funciona ──────────────────────────────────────── */}
      <section className="bg-[#000000]">
        <div className="max-w-[1200px] mx-auto px-5 md:px-8 py-24 md:py-32">
          <motion.div
            className="text-center mb-16 md:mb-20"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeUpVariant}
            custom={0}
          >
            <span className="text-[13px] font-semibold text-[#2997FF] uppercase tracking-[0.05em] mb-4 block">
              Así funciona
            </span>
            <h2 className="text-[2.25rem] md:text-[3rem] font-bold tracking-[-0.02em] mb-4">
              Descubre en segundos
            </h2>
            <p className="text-[17px] text-[#A1A1A6] max-w-[520px] mx-auto">
              Tres pasos simples para encontrar el platillo que tu paladar merece
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {[
              { step: '01', title: 'Cuéntanos tu antojo', desc: 'Responde 4 preguntas rápidas sobre tus gustos, dieta y alergias.' },
              { step: '02', title: 'Desliza y descubre', desc: 'La IA te muestra platillos uno por uno. Dale like o pasa al siguiente.' },
              { step: '03', title: 'Disfruta tu match', desc: 'Encuentra el platillo perfecto, ve el menú completo y ordena.' },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                className="text-center group"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-100px' }}
                variants={fadeUpVariant}
                custom={i + 1}
              >
                <div className="w-20 h-20 mx-auto mb-6 rounded-apple-xl bg-[#2997FF]/5 border border-[#2997FF]/10 flex items-center justify-center text-2xl font-bold text-[#2997FF] group-hover:scale-105 group-hover:bg-[#2997FF]/10 transition-all duration-300">
                  {item.step}
                </div>
                <h3 className="text-[19px] font-semibold mb-3 tracking-[-0.01em]">{item.title}</h3>
                <p className="text-[15px] text-[#A1A1A6] leading-relaxed max-w-[260px] mx-auto">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────── */}
      <section className="bg-[#1D1D1F]">
        <div className="max-w-[1200px] mx-auto px-5 md:px-8 py-24 md:py-32">
          <motion.div
            className="text-center mb-16 md:mb-20"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeUpVariant}
            custom={0}
          >
            <h2 className="text-[2.25rem] md:text-[3rem] font-bold tracking-[-0.02em] mb-4">
              Más que un menú, <span className="text-gradient-apple">una experiencia</span>
            </h2>
            <p className="text-[17px] text-[#A1A1A6]">
              Tecnología de punta para que comer sea extraordinario
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                className="bg-[#000000] rounded-apple-lg p-8 border border-white/[0.04] hover:border-white/[0.08] hover:-translate-y-1 transition-all duration-300 cursor-default"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-50px' }}
                variants={fadeUpVariant}
                custom={i}
              >
                <span className="text-4xl mb-5 block">{feature.icon}</span>
                <h3 className="text-[17px] font-semibold mb-2">{feature.title}</h3>
                <p className="text-[14px] text-[#A1A1A6] leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Para restaurantes ──────────────────────────────────── */}
      <section className="bg-[#000000]">
        <div className="max-w-[1200px] mx-auto px-5 md:px-8 py-24 md:py-32">
          <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={fadeUpVariant}
              custom={0}
            >
              <span className="text-[13px] font-semibold text-[#FF6B35] uppercase tracking-[0.05em] mb-4 block">
                Para restaurantes
              </span>
              <h2 className="text-[2rem] md:text-[2.5rem] font-bold tracking-[-0.02em] mb-6 leading-[1.15]">
                Llega a más comensales con{' '}
                <span className="text-gradient-apple">MexxicanMX</span>
              </h2>
              <ul className="space-y-5 mb-10">
                {[
                  'Panel administrativo completo para gestionar tu menú',
                  'Códigos QR para cada mesa con menús digitales interactivos',
                  'IA que promociona tus platillos con comensales afines',
                  'Analytics en tiempo real de popularidad y tendencias',
                  'Personalización white-label con tus colores y marca',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-[15px] text-[#A1A1A6]">
                    <span className="text-[#2997FF] mt-0.5 flex-shrink-0">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => navigate('/register')}
                className="btn-apple btn-apple-primary text-[15px] py-3.5 px-8"
              >
                Comenzar ahora →
              </button>
            </motion.div>

            <motion.div
              className="glass rounded-apple-lg p-8 md:p-10"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={fadeUpVariant}
              custom={1}
            >
              <div className="text-center">
                <div className="text-7xl mb-6">📊</div>
                <h3 className="text-[19px] font-semibold mb-3">Dashboard en tiempo real</h3>
                <p className="text-[14px] text-[#A1A1A6] mb-6">
                  Visualiza tus ventas, popularidad de platillos y más
                </p>
                <div className="bg-[#000000]/50 rounded-apple-lg p-5">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[14px] font-medium">Tacos al pastor</span>
                    <span className="text-[13px] text-[#FF6B35] font-semibold">🔥 234 órdenes</span>
                  </div>
                  <div className="w-full bg-white/[0.06] rounded-full h-1.5 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-[#2997FF] to-[#40A9FF]"
                      initial={{ width: 0 }}
                      whileInView={{ width: '85%' }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
                    />
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-[14px] font-medium">Pozole rojo</span>
                    <span className="text-[13px] text-[#FF6B35] font-semibold">🔥 189 órdenes</span>
                  </div>
                  <div className="w-full bg-white/[0.06] rounded-full h-1.5 overflow-hidden mt-2">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-[#2997FF] to-[#40A9FF]"
                      initial={{ width: 0 }}
                      whileInView={{ width: '72%' }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── CTA Final ───────────────────────────────────────────── */}
      <section className="bg-gradient-to-b from-[#1D1D1F] to-[#000000]">
        <div className="max-w-[1200px] mx-auto px-5 md:px-8 py-24 md:py-32 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeUpVariant}
            custom={0}
          >
            <h2 className="text-[2.25rem] md:text-[3.5rem] font-bold tracking-[-0.02em] mb-4">
              ¿Listo para descubrir tu{' '}
              <span className="text-gradient-apple">próximo antojo</span>?
            </h2>
            <p className="text-[17px] text-[#A1A1A6] mb-10 max-w-[500px] mx-auto">
              Miles de platillos te esperan. Comienza ahora mismo gratis.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => navigate('/cuestionario')}
                className="btn-apple btn-apple-primary text-[15px] py-3.5 px-8"
              >
                🌮 Descubrir platillos
              </button>
              <button
                onClick={() => navigate('/register')}
                className="btn-apple btn-apple-outline text-[15px] py-3.5 px-8"
              >
                🍽️ Registrar restaurante
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}