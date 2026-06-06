import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

export function ComoFunciona() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Fondo con gradiente animado */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-900/30 via-black to-red-900/30 animate-gradient"></div>
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500 rounded-full blur-3xl animate-pulse-slow opacity-20"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-500 rounded-full blur-3xl animate-pulse-slow animation-delay-1000 opacity-20"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-orange-600 rounded-full blur-3xl animate-pulse-slow animation-delay-2000 opacity-10"></div>
      </div>
      <div className="absolute inset-0 opacity-10 animate-moveDots" style={{
        backgroundImage: `radial-gradient(circle at 2px 2px, #F05A28 2px, transparent 2px)`,
        backgroundSize: '40px 40px'
      }}></div>

      {/* Emojis flotantes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 text-3xl animate-float-slow opacity-30">🌮</div>
        <div className="absolute bottom-32 right-20 text-4xl animate-float-medium opacity-30">🥑</div>
        <div className="absolute top-1/3 right-10 text-3xl animate-float-fast opacity-30">🌯</div>
        <div className="absolute bottom-1/4 left-20 text-2xl animate-float-slow opacity-30">🍉</div>
        <div className="absolute top-2/3 left-1/4 text-3xl animate-float-medium opacity-25">🍕</div>
        <div className="absolute top-40 right-1/3 text-2xl animate-float-fast opacity-20">🍜</div>
        <div className="absolute bottom-40 left-1/3 text-3xl animate-float-slow opacity-25">🍔</div>
      </div>

      <Header />

      <div className="relative z-10 pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fadeInUp">
            <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 text-orange-400 px-4 py-2 rounded-full text-sm font-semibold mb-6 backdrop-blur-sm">
              <span className="text-lg">📖</span>
              Cómo funciona
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              Descubre tu <span className="text-orange-500">platillo perfecto</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Tres pasos simples, una experiencia increíble
            </p>
          </div>

          <div className="space-y-20">
            <div className="flex flex-col md:flex-row items-center gap-12 animate-fadeInUp animation-delay-200">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center text-5xl border border-orange-500/30 animate-float">
                🎯
              </div>
              <div className="flex-1 text-center md:text-left">
                <div className="text-orange-500 text-sm font-semibold mb-2">PASO 01</div>
                <h2 className="text-3xl font-bold mb-4">Configura tus gustos</h2>
                <p className="text-gray-400 text-lg">
                  Selecciona tus preferencias, alergias y tipo de comida favorita. 
                  La IA aprende de ti desde el primer momento.
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row-reverse items-center gap-12 animate-fadeInUp animation-delay-400">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center text-5xl border border-orange-500/30 animate-float animation-delay-500">
                👆
              </div>
              <div className="flex-1 text-center md:text-right">
                <div className="text-orange-500 text-sm font-semibold mb-2">PASO 02</div>
                <h2 className="text-3xl font-bold mb-4">Desliza y descubre</h2>
                <p className="text-gray-400 text-lg">
                  Navega por platillos en formato vertical tipo TikTok. 
                  Da like ❤️ o next ⏭️ y la IA aprende de cada decisión.
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-12 animate-fadeInUp animation-delay-600">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center text-5xl border border-orange-500/30 animate-float animation-delay-1000">
                🍽️
              </div>
              <div className="flex-1 text-center md:text-left">
                <div className="text-orange-500 text-sm font-semibold mb-2">PASO 03</div>
                <h2 className="text-3xl font-bold mb-4">Ordena y disfruta</h2>
                <p className="text-gray-400 text-lg">
                  Haz match con el platillo que se ve increíble, 
                  ordena directo al restaurante y ve a disfrutar.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center mt-20 animate-fadeInUp animation-delay-800">
            <button 
              onClick={() => navigate('/register?role=comensal')}
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold py-4 px-10 rounded-full text-lg transition-all transform hover:scale-105 shadow-xl shadow-orange-500/30 hover:shadow-orange-500/50"
            >
              Comenzar ahora
            </button>
          </div>
        </div>
      </div>

      <Footer />

      <style>{`
        @keyframes gradient { 0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
        @keyframes pulse-slow {0%,100%{opacity:0.2;transform:scale(1)}50%{opacity:0.4;transform:scale(1.1)}}
        @keyframes moveDots {0%{background-position:0 0}100%{background-position:40px 40px}}
        @keyframes float {0%,100%{transform:translateY(0px) translateX(0px)}25%{transform:translateY(-15px) translateX(8px)}75%{transform:translateY(15px) translateX(-8px)}}
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
        .animation-delay-2000{animation-delay:2s}
      `}</style>
    </div>
  );
}