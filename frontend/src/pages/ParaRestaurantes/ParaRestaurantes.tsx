import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

export function ParaRestaurantes() {
  const navigate = useNavigate();

  const beneficios = [
    { icon: "📊", title: "Panel administrativo", desc: "Gestiona todo tu menú desde un dashboard intuitivo" },
    { icon: "📱", title: "Códigos QR", desc: "Menús digitales para cada mesa, sin contacto" },
    { icon: "🤖", title: "IA de recomendación", desc: "Tus platillos llegan a los comensales ideales" },
    { icon: "📈", title: "Analytics en tiempo real", desc: "Ventas, platillos populares y más" },
    { icon: "💬", title: "Soporte 24/7", desc: "Ayuda cuando la necesites, siempre" },
    { icon: "💰", title: "Sin comisiones", desc: "Paga solo tu suscripción, sin sorpresas" }
  ];

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-tr from-red-900/20 via-black to-orange-900/20 animate-gradient"></div>
      <div className="absolute inset-0">
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-red-500 rounded-full blur-3xl animate-pulse-slow opacity-20"></div>
        <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-orange-500 rounded-full blur-3xl animate-pulse-slow animation-delay-1500 opacity-20"></div>
      </div>
      <div className="absolute inset-0 opacity-10 animate-moveDots" style={{
        backgroundImage: `radial-gradient(circle at 2px 2px, #F05A28 2px, transparent 2px)`,
        backgroundSize: '40px 40px'
      }}></div>

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 right-20 text-3xl animate-float-slow opacity-30">🏢</div>
        <div className="absolute bottom-32 left-10 text-4xl animate-float-medium opacity-30">🍽️</div>
        <div className="absolute top-1/2 left-10 text-3xl animate-float-fast opacity-30">📊</div>
        <div className="absolute bottom-40 right-32 text-2xl animate-float-slow opacity-25">📱</div>
      </div>

      <Header />

      <div className="relative z-10 pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fadeInUp">
            <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 text-orange-400 px-4 py-2 rounded-full text-sm font-semibold mb-6 backdrop-blur-sm">
              <span className="text-lg">🏢</span> Para restaurantes
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              Llega a más <span className="text-orange-500">comensales</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              La plataforma SaaS que conecta tu restaurante con los clientes ideales
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
            {[
              { value: "+40%", label: "Más clientes" },
              { value: "-25%", label: "Menos tiempo muerto" },
              { value: "500+", label: "Restaurantes activos" },
              { value: "4.9⭐", label: "Calificación promedio" }
            ].map((stat, i) => (
              <div key={i} className="text-center p-6 rounded-2xl border border-gray-800 bg-gradient-to-br from-gray-900/50 to-transparent animate-fadeInUp animation-delay-200 hover:border-orange-500/50 transition-all transform hover:scale-105">
                <div className="text-3xl font-bold text-orange-500">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 animate-fadeInUp animation-delay-400">
            Todo lo que <span className="text-orange-500">necesitas</span>
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {beneficios.map((beneficio, index) => (
              <div key={index} className="p-6 rounded-2xl border border-gray-800 bg-gradient-to-br from-gray-900/50 to-transparent hover:border-orange-500/50 transition-all hover:transform hover:-translate-y-2 animate-fadeInUp" style={{animationDelay: `${0.5 + index * 0.1}s`}}>
                <div className="text-5xl mb-4 animate-float">{beneficio.icon}</div>
                <h3 className="text-xl font-bold mb-2">{beneficio.title}</h3>
                <p className="text-gray-400 text-sm">{beneficio.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-16 animate-fadeInUp animation-delay-1000">
            <button onClick={() => navigate('/register?role=restaurante')} className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold py-4 px-10 rounded-full text-lg transition-all transform hover:scale-105 shadow-xl shadow-orange-500/30 hover:shadow-orange-500/50">
              Registrar mi restaurante →
            </button>
          </div>
        </div>
      </div>

      <Footer />

      <style>{`
        @keyframes gradient {0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
        @keyframes pulse-slow {0%,100%{opacity:0.2;transform:scale(1)}50%{opacity:0.4;transform:scale(1.1)}}
        @keyframes moveDots {0%{background-position:0 0}100%{background-position:40px 40px}}
        @keyframes float {0%,100%{transform:translateY(0px)}50%{transform:translateY(-15px)}}
        @keyframes fadeInUp {from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
        .animate-gradient{background-size:200% 200%;animation:gradient 8s ease infinite}
        .animate-pulse-slow{animation:pulse-slow 6s ease-in-out infinite}
        .animate-moveDots{animation:moveDots 20s linear infinite}
        .animate-float{animation:float 4s ease-in-out infinite}
        .animate-float-slow{animation:float 12s ease-in-out infinite}
        .animate-float-medium{animation:float 8s ease-in-out infinite}
        .animate-float-fast{animation:float 5s ease-in-out infinite}
        .animate-fadeInUp{animation:fadeInUp 0.6s ease-out forwards;opacity:0}
        .animation-delay-200{animation-delay:0.2s}
        .animation-delay-400{animation-delay:0.4s}
        .animation-delay-500{animation-delay:0.5s}
        .animation-delay-600{animation-delay:0.6s}
        .animation-delay-800{animation-delay:0.8s}
        .animation-delay-1000{animation-delay:1s}
        .animation-delay-1500{animation-delay:1.5s}
      `}</style>
    </div>
  );
}