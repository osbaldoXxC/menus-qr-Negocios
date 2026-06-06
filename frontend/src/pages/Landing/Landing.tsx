import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

export function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />

      {/* Hero Section */}
      <div className="pt-32 pb-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-orange-900/20 via-black to-black"></div>
        <div className="absolute inset-0 opacity-20 bg-repeat" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, #F05A28 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}></div>
        
        <div className="relative max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 text-orange-400 px-4 py-2 rounded-full text-sm font-semibold mb-6 backdrop-blur-sm">
            <span className="text-lg">🔥</span>
            Motor de Descubrimiento con IA
            <span className="text-xs bg-orange-500/20 px-2 py-0.5 rounded-full">Beta</span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
            ¿Antojo? <br />
            <span className="bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 bg-clip-text text-transparent">
              Nosotros te llevamos
            </span>
          </h1>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
            Desliza, haz match y descubre tu próximo platillo favorito. 
            IA que aprende de tus gustos como Netflix, pero para tu paladar mexicano.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate('/register?role=comensal')}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-4 px-10 rounded-full text-lg transition-all transform hover:scale-105 shadow-xl shadow-orange-500/30"
            >
              🌮 Quiero comer
            </button>
            <button 
              onClick={() => navigate('/register?role=restaurante')}
              className="border-2 border-orange-500 text-orange-500 hover:bg-orange-500/10 font-bold py-4 px-10 rounded-full text-lg transition-all transform hover:scale-105"
            >
              🍽️ Soy restaurante
            </button>
          </div>

          <div className="mt-16 flex flex-wrap justify-center gap-8 md:gap-16">
            <div>
              <div className="text-3xl font-bold text-orange-500">10K+</div>
              <div className="text-gray-500 text-sm">Comensales activos</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-500">500+</div>
              <div className="text-gray-500 text-sm">Restaurantes</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-500">50K+</div>
              <div className="text-gray-500 text-sm">Platillos recomendados</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-500">98%</div>
              <div className="text-gray-500 text-sm">Satisfacción</div>
            </div>
          </div>

          <div className="mt-16">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 text-white max-w-md mx-auto shadow-2xl border border-gray-700">
              <div className="flex justify-center space-x-8 mb-4">
                <span className="text-4xl animate-bounce">🌮</span>
                <span className="text-4xl animate-bounce" style={{animationDelay: '0.1s'}}>🥑</span>
                <span className="text-4xl animate-bounce" style={{animationDelay: '0.2s'}}>🌯</span>
                <span className="text-4xl animate-bounce" style={{animationDelay: '0.3s'}}>🍉</span>
              </div>
              <p className="text-center text-sm text-gray-400">
                ✨ Desliza para descubrir | 1,234 comensales activos ahora ✨
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Cómo funciona - Sección */}
      <div className="py-20 px-4 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              ¿Cómo funciona <span className="text-orange-500">MexxicanMX</span>?
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Tres pasos simples para encontrar tu platillo perfecto
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-20 h-20 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-orange-500/20 transition-all group-hover:scale-110">
                <span className="text-3xl">1️⃣</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Configura tus gustos</h3>
              <p className="text-gray-400">Selecciona tus preferencias, alergias y tipo de comida favorita en segundos</p>
            </div>
            <div className="text-center group">
              <div className="w-20 h-20 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-orange-500/20 transition-all group-hover:scale-110">
                <span className="text-3xl">2️⃣</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Desliza y descubre</h3>
              <p className="text-gray-400">Navega por platillos en formato vertical tipo TikTok, da like o next</p>
            </div>
            <div className="text-center group">
              <div className="w-20 h-20 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-orange-500/20 transition-all group-hover:scale-110">
                <span className="text-3xl">3️⃣</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Ordena y disfruta</h3>
              <p className="text-gray-400">Haz match con el platillo, ordena directo y recógelo o pide delivery</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="py-20 px-4 bg-black">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-16">
            Más que un menú, <span className="text-orange-500">una experiencia</span>
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-800 hover:border-orange-500/50 transition-all hover:transform hover:-translate-y-2">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-bold mb-2">IA que te conoce</h3>
              <p className="text-gray-400 text-sm">Aprende de tus swipes y te recomienda platillos que sí te van a gustar</p>
            </div>
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-800 hover:border-orange-500/50 transition-all hover:transform hover:-translate-y-2">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-xl font-bold mb-2">Formato TikTok</h3>
              <p className="text-gray-400 text-sm">Contenido vertical, rápido y adictivo. Un platillo a la vez</p>
            </div>
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-800 hover:border-orange-500/50 transition-all hover:transform hover:-translate-y-2">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-bold mb-2">QR instantáneo</h3>
              <p className="text-gray-400 text-sm">Menús digitales que cargan en menos de 1 segundo</p>
            </div>
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-800 hover:border-orange-500/50 transition-all hover:transform hover:-translate-y-2">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-bold mb-2">100% Seguro</h3>
              <p className="text-gray-400 text-sm">Tus datos protegidos con encriptación de nivel bancario</p>
            </div>
          </div>
        </div>
      </div>

      {/* Para restaurantes */}
      <div className="py-20 px-4 bg-gradient-to-r from-orange-900/20 to-red-900/20">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full text-sm mb-4">
                <span>🏢</span> Para restaurantes
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Llega a más comensales con <span className="text-orange-500">MexxicanMX SaaS</span>
              </h2>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <span className="text-orange-500 text-xl">✓</span>
                  <span className="text-gray-300">Panel administrativo completo para gestionar tu menú</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-orange-500 text-xl">✓</span>
                  <span className="text-gray-300">Códigos QR para cada mesa - Menús digitales interactivos</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-orange-500 text-xl">✓</span>
                  <span className="text-gray-300">IA que promociona tus platillos con comensales afines</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-orange-500 text-xl">✓</span>
                  <span className="text-gray-300">Analytics en tiempo real - Qué platillos venden más</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-orange-500 text-xl">✓</span>
                  <span className="text-gray-300">Soporte 24/7 y actualizaciones automáticas</span>
                </li>
              </ul>
              <button 
                onClick={() => navigate('/register?role=restaurante')}
                className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold py-3 px-8 rounded-full hover:shadow-xl transition-all"
              >
                Comenzar ahora → 
              </button>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 border border-gray-700">
                <div className="text-center">
                  <div className="text-6xl mb-4">📊</div>
                  <h3 className="text-2xl font-bold mb-2">Dashboard en tiempo real</h3>
                  <p className="text-gray-400 mb-4">Visualiza tus ventas, popularidad de platillos y más</p>
                  <div className="bg-black/50 rounded-xl p-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Tacos al pastor</span>
                      <span className="text-orange-500">🔥 234 ordenes</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-orange-500 h-2 rounded-full" style={{width: '85%'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}