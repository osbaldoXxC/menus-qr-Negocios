import { motion } from 'framer-motion'
import { Utensils, Zap, Search, User } from 'lucide-react'

function App() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-mexxican-red selection:text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Utensils className="text-mexxican-red w-8 h-8" />
            <span className="font-bold text-xl tracking-tight">Mexxican<span className="text-mexxican-red">MX</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/60">
            <a href="#" className="hover:text-white transition-colors">Explorar</a>
            <a href="#" className="hover:text-white transition-colors">SaaS para Negocios</a>
            <a href="#" className="hover:text-white transition-colors">IA Engine</a>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <Search className="w-5 h-5" />
            </button>
            <button className="flex items-center gap-2 bg-mexxican-red hover:bg-mexxican-red/90 px-4 py-2 rounded-lg font-semibold transition-all transform active:scale-95">
              <User className="w-4 h-4" />
              <span>Ingresar</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block px-4 py-1.5 mb-6 text-xs font-bold tracking-widest uppercase bg-mexxican-red/10 text-mexxican-red rounded-full border border-mexxican-red/20">
              Impulsado por Inteligencia Artificial
            </span>
            <h1 className="text-5xl md:text-7xl font-black mb-8 leading-[1.1]">
              El futuro del <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-mexxican-red to-mexxican-gold">
                Descubrimiento Gastronómico
              </span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-white/50 mb-12">
              MexxicanMX conecta restaurantes con comensales ideales mediante un motor de recomendación visual inmersivo. Olvida la fatiga de decisión.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button className="w-full sm:w-auto px-8 py-4 bg-white text-black font-black text-lg rounded-xl hover:bg-white/90 transition-all flex items-center justify-center gap-2">
                <Zap className="w-5 h-5 fill-black" />
                Empezar a Explorar
              </button>
              <button className="w-full sm:w-auto px-8 py-4 bg-white/5 text-white font-bold text-lg rounded-xl border border-white/10 hover:bg-white/10 transition-all">
                Registrar mi Negocio
              </button>
            </div>
          </motion.div>

          {/* Feature Grid */}
          <div className="grid md:grid-cols-3 gap-8 mt-32">
            {[
              { title: 'IA Recommendation', desc: 'Aprende de tus gustos y swipes para mostrarte solo lo que te encanta.' },
              { title: 'SaaS para Menús', desc: 'Digitaliza tu restaurante con herramientas de gestión avanzadas.' },
              { title: 'Experiencia Visual', desc: 'Formato inmersivo tipo TikTok para antojarse antes de pedir.' }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + idx * 0.1 }}
                className="p-8 bg-white/5 rounded-2xl border border-white/10 text-left hover:border-mexxican-red/30 transition-colors group"
              >
                <div className="w-12 h-12 bg-mexxican-red/20 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Utensils className="text-mexxican-red w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                <p className="text-white/40 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 text-center text-white/20 text-sm">
          &copy; 2026 MexxicanMX. Todos los derechos reservados. Hecho con 🌶️ para el mundo.
        </div>
      </footer>
    </div>
  )
}

export default App
