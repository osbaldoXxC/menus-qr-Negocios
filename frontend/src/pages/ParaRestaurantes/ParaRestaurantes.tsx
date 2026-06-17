import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

const fadeUpVariant = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  }),
};

const beneficios = [
  { icon: '📊', title: 'Panel administrativo', desc: 'Gestiona todo tu menú desde un dashboard intuitivo.' },
  { icon: '📱', title: 'Códigos QR', desc: 'Menús digitales para cada mesa, sin contacto.' },
  { icon: '🤖', title: 'IA de recomendación', desc: 'Tus platillos llegan a los comensales ideales.' },
  { icon: '📈', title: 'Analytics en tiempo real', desc: 'Ventas, platillos populares y más.' },
  { icon: '💬', title: 'Soporte 24/7', desc: 'Ayuda cuando la necesites, siempre.' },
  { icon: '💰', title: 'Sin comisiones', desc: 'Paga solo tu suscripción, sin sorpresas.' },
];

export function ParaRestaurantes() {
  const navigate = useNavigate();

  return (
    <div className="bg-[var(--app-bg)] text-[var(--app-text)] min-h-screen transition-colors duration-500">
      <Header />

      <div className="pt-28 pb-20 px-4 relative overflow-hidden">
        {/* Background Accents */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-apple-blue/5 blur-[120px] -z-10" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-apple-accent/5 blur-[100px] -z-10" />
        
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
              Para restaurantes
            </span>
            <h1 className="text-[2.5rem] md:text-[3.5rem] font-bold tracking-[-0.02em] mb-4">
              Llega a más <span className="text-gradient-apple">comensales</span>
            </h1>
            <p className="text-[17px] text-[#A1A1A6] max-w-xl mx-auto">
              La plataforma que conecta tu restaurante con los clientes ideales mediante IA
            </p>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-20">
            {[
              { value: '+40%', label: 'Más clientes' },
              { value: '-25%', label: 'Menos tiempo muerto' },
              { value: '500+', label: 'Restaurantes activos' },
              { value: '4.9⭐', label: 'Calificación promedio' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                className="text-center p-6 rounded-apple-lg glass border border-white/[0.06] hover:border-[#2997FF]/20 transition-all"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUpVariant}
                custom={i + 1}
              >
                <div className="text-[28px] md:text-[32px] font-bold text-[#2997FF] tracking-[-0.015em] mb-1">
                  {stat.value}
                </div>
                <div className="text-[13px] text-[#6E6E73]">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Beneficios */}
          <motion.div
            className="text-center mb-14"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUpVariant}
            custom={0}
          >
            <h2 className="text-[2rem] md:text-[2.5rem] font-bold tracking-[-0.02em] mb-3">
              Todo lo que <span className="text-gradient-apple">necesitas</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {beneficios.map((beneficio, i) => (
              <motion.div
                key={beneficio.title}
                className="p-6 rounded-apple-lg glass border border-white/[0.06] hover:border-[#2997FF]/20 hover:-translate-y-1 transition-all duration-300"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUpVariant}
                custom={i + 5}
              >
                <div className="text-5xl mb-4">{beneficio.icon}</div>
                <h3 className="text-[17px] font-semibold mb-2">{beneficio.title}</h3>
                <p className="text-[14px] text-[#A1A1A6] leading-relaxed">{beneficio.desc}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="text-center mt-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUpVariant}
            custom={11}
          >
            <button
              onClick={() => navigate('/register')}
              className="btn-apple btn-apple-primary text-[15px] py-3.5 px-8"
            >
              Registrar mi restaurante →
            </button>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
}