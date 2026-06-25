import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

const fadeUp = (i = 0) => ({
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.55, ease: [0.16, 1, 0.3, 1] as const } },
});

const planes = [
  {
    nombre: 'Comensal',
    precio: 'Gratis',
    periodo: '',
    descripcion: 'Perfecto para descubrir nuevos sabores',
    features: [
      'Descubrimiento ilimitado de platillos',
      'Recomendaciones personalizadas IA',
      'Guardar favoritos',
      'Reseñas y valoraciones',
    ],
    role: 'comensal',
    destacado: false,
    cta: 'Empezar gratis',
    icon: '🍽️',
  },
  {
    nombre: 'Restaurante Pro',
    precio: '$29',
    periodo: '/mes',
    descripcion: 'Para negocios que quieren crecer',
    features: [
      'Menú digital con QR ilimitados',
      'Panel administrativo completo',
      'Analytics en tiempo real',
      'IA de recomendación incluida',
      'Personalización de marca',
      'Soporte prioritario 24/7',
    ],
    role: 'restaurante',
    destacado: true,
    cta: 'Suscribirse',
    icon: '🚀',
  },
  {
    nombre: 'Enterprise',
    precio: 'A medida',
    periodo: '',
    descripcion: 'Para cadenas y múltiples sucursales',
    features: [
      'Todo lo de Restaurante Pro',
      'Multi-sucursales ilimitadas',
      'API personalizada',
      'Integraciones a medida',
      'Gerente de cuenta dedicado',
    ],
    role: 'restaurante',
    destacado: false,
    cta: 'Contactar ventas',
    icon: '🏢',
  },
];

const faqs = [
  { q: '¿Puedo cancelar en cualquier momento?', a: 'Sí, sin penalizaciones ni contratos de permanencia.' },
  { q: '¿El plan gratuito tiene límite de tiempo?', a: 'No, el plan Comensal es gratis para siempre.' },
  { q: '¿Cobran comisión por venta?', a: 'Nunca. Solo pagas tu suscripción fija mensual.' },
  { q: '¿Puedo cambiar de plan después?', a: 'Sí, puedes subir o bajar de plan cuando quieras.' },
];

export function Precios() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white dark:bg-black text-[#1D1D1F] dark:text-[#F5F5F7] transition-colors duration-300">
      <Header />

      {/* ── HERO ── */}
      <section className="pt-32 pb-20 px-6 text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#0071E3]/[0.06] dark:bg-[#2997FF]/[0.08] blur-[100px] pointer-events-none" />

        <motion.div
          initial="hidden" animate="visible" variants={fadeUp(0)}
          className="max-w-[680px] mx-auto relative z-10"
        >
          <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#0071E3] dark:text-[#2997FF] mb-4">
            Precios simples
          </p>
          <h1 className="text-[3rem] md:text-[4.5rem] font-black tracking-tighter leading-tight mb-5">
            El plan perfecto<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0071E3] to-[#40A9FF]">
              para cada uno.
            </span>
          </h1>
          <p className="text-[17px] text-[#86868B] dark:text-[#A1A1A6] leading-relaxed">
            Sin contratos. Sin sorpresas. Cancela cuando quieras.
          </p>
        </motion.div>
      </section>

      {/* ── PLANES ── */}
      <section className="pb-24 px-6">
        <div className="max-w-[1000px] mx-auto grid md:grid-cols-3 gap-5">
          {planes.map((plan, i) => (
            <motion.div
              key={plan.nombre}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
              variants={fadeUp(i + 1)}
              whileHover={{ y: -4 }}
              className={`relative flex flex-col rounded-[1.75rem] p-7 border transition-all duration-300 ${
                plan.destacado
                  ? 'bg-[#0071E3] dark:bg-[#2997FF] border-transparent shadow-[0_20px_60px_rgba(0,113,227,0.3)] dark:shadow-[0_20px_60px_rgba(41,151,255,0.25)]'
                  : 'bg-[#F5F5F7] dark:bg-[#161617] border-black/[0.06] dark:border-white/[0.07] hover:border-[#0071E3]/20 dark:hover:border-[#2997FF]/20'
              }`}
            >
              {plan.destacado && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-white rounded-full text-[11px] font-bold text-[#0071E3] tracking-wide shadow-md">
                  ⭐ Más popular
                </div>
              )}

              <div className="text-3xl mb-5">{plan.icon}</div>

              <p className={`text-[11px] font-bold uppercase tracking-[0.12em] mb-2 ${plan.destacado ? 'text-white/70' : 'text-[#86868B] dark:text-[#6E6E73]'}`}>
                {plan.nombre}
              </p>

              <div className="flex items-baseline gap-1 mb-2">
                <span className={`text-[3rem] font-black tracking-tighter leading-none ${plan.destacado ? 'text-white' : 'text-[#1D1D1F] dark:text-[#F5F5F7]'}`}>
                  {plan.precio}
                </span>
                {plan.periodo && (
                  <span className={`text-[15px] font-medium ${plan.destacado ? 'text-white/60' : 'text-[#86868B] dark:text-[#A1A1A6]'}`}>
                    {plan.periodo}
                  </span>
                )}
              </div>

              <p className={`text-[13px] mb-6 leading-relaxed ${plan.destacado ? 'text-white/80' : 'text-[#86868B] dark:text-[#A1A1A6]'}`}>
                {plan.descripcion}
              </p>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className={`flex items-start gap-2.5 text-[13px] ${plan.destacado ? 'text-white/90' : 'text-[#1D1D1F] dark:text-[#F5F5F7]'}`}>
                    <span className={`mt-0.5 flex-shrink-0 text-[15px] ${plan.destacado ? 'text-white' : 'text-[#0071E3] dark:text-[#2997FF]'}`}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => navigate(`/register?role=${plan.role}`)}
                className={`w-full py-3.5 rounded-full font-bold text-[14px] transition-all duration-200 active:scale-[0.97] ${
                  plan.destacado
                    ? 'bg-white text-[#0071E3] hover:bg-white/90 shadow-lg'
                    : 'bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F] hover:opacity-90'
                }`}
              >
                {plan.cta}
              </button>
            </motion.div>
          ))}
        </div>

        <motion.p
          className="text-center mt-10 text-[13px] text-[#86868B] dark:text-[#6E6E73]"
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          ¿Necesitas algo diferente?{' '}
          <button className="text-[#0071E3] dark:text-[#2997FF] font-semibold hover:underline transition-colors">
            Contáctanos
          </button>
        </motion.p>
      </section>

      {/* ── FAQ ── */}
      <section className="py-24 px-6 border-t border-black/[0.06] dark:border-white/[0.06] bg-[#F5F5F7] dark:bg-[#0A0A0A]">
        <div className="max-w-[680px] mx-auto">
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}
          >
            <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#0071E3] dark:text-[#2997FF] mb-3">FAQ</p>
            <h2 className="text-[2rem] md:text-[2.8rem] font-black tracking-tighter">Preguntas frecuentes.</h2>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <motion.div
                key={faq.q}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="p-6 rounded-[1.5rem] bg-white dark:bg-[#161617] border border-black/[0.06] dark:border-white/[0.07]"
              >
                <p className="font-bold text-[15px] mb-2">{faq.q}</p>
                <p className="text-[14px] text-[#86868B] dark:text-[#A1A1A6] leading-relaxed">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-6 text-center">
        <motion.div
          className="max-w-[560px] mx-auto"
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.7 }}
        >
          <h2 className="text-[2.5rem] md:text-[3.5rem] font-black tracking-tighter mb-5">
            Empieza hoy.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0071E3] to-[#40A9FF]">Es gratis.</span>
          </h2>
          <p className="text-[#86868B] dark:text-[#A1A1A6] mb-10 text-[16px]">
            Sin tarjeta de crédito. Listo en 5 minutos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/register')}
              className="px-10 py-4 bg-[#0071E3] dark:bg-[#2997FF] text-white font-bold rounded-full hover:bg-[#0077ED] dark:hover:bg-[#40A9FF] transition-all hover:scale-[1.03] shadow-[0_20px_40px_rgba(0,113,227,0.25)]"
            >
              Registrarme gratis
            </button>
            <button
              onClick={() => navigate('/para-restaurantes')}
              className="px-10 py-4 bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.08] dark:border-white/[0.10] font-semibold rounded-full hover:bg-black/[0.07] dark:hover:bg-white/[0.10] transition-all"
            >
              Ver más detalles
            </button>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
