import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

export function NoSabesQueComer() {
  const navigate = useNavigate();

  return (
    <div className="bg-[#050505] text-[#FAFAFA] min-h-screen font-sans selection:bg-[#FF4A00] selection:text-white overflow-hidden">
      <Header />

      {/* ── BACKGROUND ANIMADO ────────────────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none">
        <motion.div 
          className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#FF2A54] opacity-[0.08] blur-[120px]"
          animate={{ x: [0, 100, 0], y: [0, 50, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[#FF8C00] opacity-[0.08] blur-[150px]"
          animate={{ x: [0, -80, 0], y: [0, -60, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <main className="relative z-10 pt-32 pb-20 px-6 max-w-[1440px] mx-auto min-h-screen flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-[900px]"
        >
          <motion.div
            className="inline-flex items-center gap-2 mb-8 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <span className="flex h-2 w-2 rounded-full bg-[#FF4A00] animate-pulse" />
            <span className="text-xs font-semibold tracking-widest uppercase text-white/60">Experiencia IA Activada</span>
          </motion.div>

          <motion.h1 
            className="text-[4.5rem] md:text-[7rem] font-black leading-[0.9] tracking-tighter mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            Tu próximo <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF2A54] via-[#FF4A00] to-[#FF8C00]">
              gran antojo
            </span>
            <br/>está aquí.
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-[#A1A1A6] font-light max-w-[650px] mx-auto mb-12 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            Dinos qué traes en mente y nuestra IA encontrará el platillo perfecto en los mejores restaurantes de la ciudad.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <button
              onClick={() => navigate('/cuestionario')}
              className="px-10 py-5 bg-[#FF4A00] text-white text-lg font-bold rounded-full transition-transform hover:scale-105 active:scale-95 shadow-[0_20px_40px_rgba(255,74,0,0.2)]"
            >
              🌮 Empezar a Descubrir
            </button>
            
            <button
              onClick={() => navigate('/login')}
              className="text-[#86868B] hover:text-white transition-colors text-sm font-medium tracking-wide border-b border-white/5 hover:border-white/20 pb-1"
            >
              Acceso Comensales
            </button>
          </motion.div>
          
          <motion.div 
            className="mt-16 text-[#6E6E73] text-xs font-medium uppercase tracking-[0.2em]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            Simulado con IA • 60+ Platillos recomendados hoy
          </motion.div>
        </motion.div>

        {/* ── DECORATIVE ELEMENTS ─────────────────────────────────────────────── */}
        <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-4 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
           {[1, 2, 3, 4].map(i => (
             <div key={i} className="w-32 h-40 rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-white/10 to-transparent animate-pulse" />
             </div>
           ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}