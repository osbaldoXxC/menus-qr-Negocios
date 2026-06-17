import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

const fadeUpVariant = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  }),
};

export function ComoFunciona() {
  const navigate = useNavigate();

  return (
    <div className="bg-[var(--app-bg)] text-[var(--app-text)] min-h-screen transition-colors duration-500">
      <Header />

      <div className="pt-28 pb-20 px-4 relative overflow-hidden">
        {/* Background Accents */}
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-apple-blue/5 blur-[120px] -z-10" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-apple-accent/5 blur-[100px] -z-10" />

        <div className="max-w-[1200px] mx-auto">
          <motion.div
            className="text-center mb-20"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUpVariant}
            custom={0}
          >
            <span className="text-[13px] font-semibold text-[#2997FF] uppercase tracking-[0.05em] mb-4 block">
              Cómo funciona
            </span>
            <h1 className="text-[2.5rem] md:text-[3.5rem] font-bold tracking-[-0.02em] mb-4">
              Descubre tu <span className="text-gradient-apple">platillo perfecto</span>
            </h1>
            <p className="text-[17px] text-[#A1A1A6] max-w-xl mx-auto">
              Tres pasos simples, una experiencia increíble con IA
            </p>
          </motion.div>

          <div className="space-y-24">
            {[
              {
                step: '01',
                icon: '🎯',
                title: 'Configura tus gustos',
                desc: 'Selecciona tus preferencias, alergias y tipo de comida favorita. La IA aprende de ti desde el primer momento.',
              },
              {
                step: '02',
                icon: '💳',
                title: 'Desliza y descubre',
                desc: 'La IA te muestra platillos uno por uno como en TikTok. Dale like a los que te gustan, descarta los que no.',
              },
              {
                step: '03',
                icon: '🍽️',
                title: 'Disfruta tu elección',
                desc: 'Encuentra el match perfecto. Ve el menú completo del restaurante, escanea el QR y ordena al instante.',
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                className="flex flex-col md:flex-row items-center gap-8 md:gap-12"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-100px' }}
                variants={fadeUpVariant}
                custom={i + 1}
              >
                <div className="w-24 h-24 md:w-28 md:h-28 rounded-apple-xl bg-[#2997FF]/5 border border-[#2997FF]/10 flex items-center justify-center text-5xl flex-shrink-0">
                  {item.icon}
                </div>
                <div className="text-center md:text-left flex-1">
                  <div className="text-[#2997FF] text-sm font-semibold mb-2">PASO {item.step}</div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-3">{item.title}</h2>
                  <p className="text-[#A1A1A6] text-[15px] leading-relaxed max-w-lg">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="text-center mt-24"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUpVariant}
            custom={4}
          >
            <button
              onClick={() => navigate('/cuestionario')}
              className="btn-apple btn-apple-primary text-[15px] py-3.5 px-8"
            >
              🌮 Quiero descubrir
            </button>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
}