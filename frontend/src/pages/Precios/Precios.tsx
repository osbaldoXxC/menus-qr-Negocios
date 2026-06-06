import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

export function Precios() {
  const navigate = useNavigate();

  const planes = [
    { nombre: "Comensal", precio: "Gratis", periodo: "", descripcion: "Perfecto para empezar", features: ["Descubrimiento ilimitado", "Guardar favoritos", "Reseñas"], role: "comensal", destacado: false },
    { nombre: "Restaurante Pro", precio: "$29", periodo: "/mes", descripcion: "Para negocios que crecen", features: ["Panel administrativo", "QR ilimitados", "Analytics", "IA premium", "Soporte 24/7"], role: "restaurante", destacado: true },
    { nombre: "Enterprise", precio: "Personalizado", periodo: "", descripcion: "Para cadenas", features: ["Todo lo de Pro", "API personalizada", "Multi-sucursales", "Soporte dedicado"], role: "restaurante", destacado: false }
  ];

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-bl from-orange-900/20 via-black to-red-900/20 animate-gradient"></div>
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-orange-500 rounded-full blur-3xl animate-pulse-slow opacity-20"></div>
        <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-red-500 rounded-full blur-3xl animate-pulse-slow animation-delay-2000 opacity-15"></div>
      </div>
      <div className="absolute inset-0 opacity-10 animate-moveDots" style={{ backgroundImage: `radial-gradient(circle at 2px 2px, #F05A28 2px, transparent 2px)`, backgroundSize: '40px 40px' }}></div>

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-20 text-3xl animate-float-slow opacity-30">💰</div>
        <div className="absolute bottom-32 right-10 text-4xl animate-float-medium opacity-30">💳</div>
        <div className="absolute top-1/3 right-20 text-3xl animate-float-fast opacity-30">⭐</div>
      </div>

      <Header />

      <div className="relative z-10 pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fadeInUp">
            <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 text-orange-400 px-4 py-2 rounded-full text-sm font-semibold mb-6 backdrop-blur-sm">
              <span className="text-lg">💰</span> Precios simples
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-4">Elige el plan <span className="text-orange-500">perfecto</span></h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">Sin contratos, sin sorpresas. Cancela cuando quieras.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {planes.map((plan, index) => (
              <div key={index} className={`rounded-2xl p-8 transition-all transform hover:scale-105 animate-fadeInUp animation-delay-${200 + index * 200} ${plan.destacado ? 'bg-gradient-to-br from-orange-500/20 to-red-500/20 border-2 border-orange-500 shadow-xl shadow-orange-500/20' : 'bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-800'}`}>
                {plan.destacado && <div className="inline-block px-3 py-1 bg-orange-500 text-white text-xs font-semibold rounded-full mb-4 animate-pulse">Más popular</div>}
                <h3 className="text-2xl font-bold mb-2">{plan.nombre}</h3>
                <div className="mb-4"><span className="text-4xl font-bold">{plan.precio}</span><span className="text-gray-400">{plan.periodo}</span></div>
                <p className="text-gray-400 text-sm mb-6">{plan.descripcion}</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (<li key={i} className="flex items-center gap-2 text-sm text-gray-300"><span className="text-orange-500">✓</span> {feature}</li>))}
                </ul>
                <button onClick={() => navigate(`/register?role=${plan.role}`)} className={`w-full py-3 rounded-full font-semibold transition-all ${plan.destacado ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:shadow-lg' : 'border border-gray-600 text-white hover:border-orange-500'}`}>
                  {plan.precio === "Gratis" ? "Comenzar" : plan.precio === "Personalizado" ? "Contactar" : "Suscribirse"}
                </button>
              </div>
            ))}
          </div>

          <div className="text-center mt-16 animate-fadeInUp animation-delay-800">
            <p className="text-gray-500 text-sm">¿Necesitas un plan personalizado? <button className="text-orange-500 hover:underline">Contáctanos</button></p>
          </div>
        </div>
      </div>

      <Footer />

      <style>{`
        @keyframes gradient {0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
        @keyframes pulse-slow {0%,100%{opacity:0.2;transform:scale(1)}50%{opacity:0.4;transform:scale(1.1)}}
        @keyframes moveDots {0%{background-position:0 0}100%{background-position:40px 40px}}
        @keyframes fadeInUp {from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
        .animate-gradient{background-size:200% 200%;animation:gradient 8s ease infinite}
        .animate-pulse-slow{animation:pulse-slow 6s ease-in-out infinite}
        .animate-moveDots{animation:moveDots 20s linear infinite}
        .animate-float-slow{animation:float 12s ease-in-out infinite}
        .animate-float-medium{animation:float 8s ease-in-out infinite}
        .animate-float-fast{animation:float 5s ease-in-out infinite}
        .animate-fadeInUp{animation:fadeInUp 0.6s ease-out forwards;opacity:0}
        @keyframes float{0%,100%{transform:translateY(0px)}50%{transform:translateY(-15px)}}
        .animation-delay-200{animation-delay:0.2s}
        .animation-delay-400{animation-delay:0.4s}
        .animation-delay-600{animation-delay:0.6s}
        .animation-delay-800{animation-delay:0.8s}
        .animation-delay-2000{animation-delay:2s}
      `}</style>
    </div>
  );
}