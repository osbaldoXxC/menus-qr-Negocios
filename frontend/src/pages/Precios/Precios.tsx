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

export function Precios() {
  const navigate = useNavigate();

  const planes = [
    {
      nombre: 'Comensal',
      precio: 'Gratis',
      periodo: '',
      descripcion: 'Perfecto para empezar',
      features: ['Descubrimiento ilimitado', 'Guardar favoritos', 'Reseñas'],
      role: 'comensal',
      destacado: false,
    },
    {
      nombre: 'Restaurante Pro',
      precio: '$29',
      periodo: '/mes',
      descripcion: 'Para negocios que crecen',
      features: ['Panel administrativo', 'QR ilimitados', 'Analytics', 'IA premium', 'Soporte 24/7'],
      role: 'restaurante',
      destacado: true,
    },
    {
      nombre: 'Enterprise',
      precio: 'Personalizado',
      periodo: '',
      descripcion: 'Para cadenas',
      features: ['Todo lo de Pro', 'API personalizada', 'Multi-sucursales', 'Soporte dedicado'],
      role: 'restaurante',
      destacado: false,
    },
  ];

  return (
    <div className="bg-[#000000] text-[#F5F5F7] min-h-screen">
      <Header />

      <div className="pt-28 pb-20 px-4">
        <div className="max-w-[1000px] mx-auto">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUpVariant}
            custom={0}
          >
            <span className="text-[13px] font-semibold text-[#2997FF] uppercase tracking-[0.05em] mb-4 block">
              Precios simples
            </span>
            <h1 className="text-[2.5rem] md:text-[3.5rem] font-bold tracking-[-0.02em] mb-4">
              Elige el plan <span className="text-gradient-apple">perfecto</span>
            </h1>
            <p className="text-[17px] text-[#A1A1A6] max-w-xl mx-auto">
              Sin contratos, sin sorpresas. Cancela cuando quieras.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {planes.map((plan, i) => (
              <motion.div
                key={plan.nombre}
                className={`rounded-apple-lg p-8 transition-all duration-300 hover:-translate-y-1 ${
                  plan.destacado
                    ? 'glass border-2 border-[#2997FF]/30 shadow-xl shadow-[#2997FF]/10'
                    : 'glass border border-white/[0.06]'
                }`}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUpVariant}
                custom={i + 1}
              >
                {plan.destacado && (
                  <div className="inline-block px-3 py-1 bg-[#2997FF] text-white text-xs font-semibold rounded-full mb-4">
                    Más popular
                  </div>
                )}
                <h3 className="text-2xl font-bold mb-2">{plan.nombre}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-[#F5F5F7]">{plan.precio}</span>
                  <span className="text-[#A1A1A6]">{plan.periodo}</span>
                </div>
                <p className="text-[#A1A1A6] text-sm mb-6">{plan.descripcion}</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-[#A1A1A6]">
                      <span className="text-[#2997FF]">✓</span> {feature}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => navigate(`/register?role=${plan.role}`)}
                  className={`w-full py-3 rounded-apple-full font-semibold transition-all duration-200 ${
                    plan.destacado
                      ? 'bg-[#2997FF] text-white hover:bg-[#40A9FF] hover:shadow-[0_0_24px_rgba(41,151,255,0.25)]'
                      : 'border border-white/[0.10] text-[#F5F5F7] hover:border-[#2997FF]/40'
                  }`}
                >
                  {plan.precio === 'Gratis' ? 'Comenzar' : plan.precio === 'Personalizado' ? 'Contactar' : 'Suscribirse'}
                </button>
              </motion.div>
            ))}
          </div>

          <motion.p
            className="text-center mt-16 text-[#6E6E73] text-sm"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUpVariant}
            custom={4}
          >
            ¿Necesitas un plan personalizado?{' '}
            <button className="text-[#2997FF] hover:text-[#40A9FF] hover:underline transition-colors">
              Contáctanos
            </button>
          </motion.p>
        </div>
      </div>

      <Footer />
    </div>
  );
}