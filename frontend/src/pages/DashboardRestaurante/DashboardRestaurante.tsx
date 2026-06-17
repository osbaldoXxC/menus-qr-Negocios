import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { authService } from '../../services/auth';
import { restauranteService } from '../../services/restaurante';

export function DashboardRestaurante() {
  const navigate = useNavigate();
  const [restauranteInfo, setRestauranteInfo] = useState<any>(null);
  const [platillos, setPlatillos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [info, platillosData] = await Promise.all([
          restauranteService.getRestauranteInfo(),
          restauranteService.getPlatillos(),
        ]);
        setRestauranteInfo(info);
        setPlatillos(platillosData);
      } catch (error) {
        console.error('Error cargando datos:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="bg-[#000000] text-[#F5F5F7] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <motion.div className="text-4xl" animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 1 }}>
            🌮
          </motion.div>
          <p className="text-[#6E6E73] mt-2">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black text-[#F5F5F7] min-h-screen">
      <Header />

      <div className="pt-24 pb-20 px-5 md:px-8 min-h-screen">
        <div className="max-w-[1400px] mx-auto">
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-[2rem] md:text-[2.5rem] font-bold tracking-[-0.02em] mb-1">
              Bienvenido, {restauranteInfo?.nombre_dueño}
            </h1>
            <p className="text-[#A1A1A6] text-[15px] tracking-[-0.01em]">
              Gestiona tu menú, estadísticas y configuración aquí
            </p>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <motion.div
              className="glass rounded-lg p-6 border border-white/[0.08]"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
            >
              <div className="text-3xl mb-3">🍽️</div>
              <div className="text-[13px] text-[#A1A1A6] mb-1 font-500 tracking-[-0.01em]">Platillos activos</div>
              <div className="text-4xl font-bold text-[#2997FF] tracking-[-0.02em]">{platillos.length}</div>
            </motion.div>
            <motion.div
              className="glass rounded-lg p-6 border border-white/[0.08]"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="text-3xl mb-3">📊</div>
              <div className="text-[13px] text-[#A1A1A6] mb-1 font-500 tracking-[-0.01em]">Visualizaciones</div>
              <div className="text-4xl font-bold text-[#FF6B35] tracking-[-0.02em]">--</div>
            </motion.div>
            <motion.div
              className="glass rounded-lg p-6 border border-white/[0.08]"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <div className="text-3xl mb-3">📷</div>
              <div className="text-[13px] text-[#A1A1A6] mb-1 font-500 tracking-[-0.01em]">Código QR</div>
              <div className="text-4xl font-bold text-[#2997FF] tracking-[-0.02em]">1</div>
            </motion.div>
          </div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-[17px] font-600 tracking-[-0.015em] mb-4">Acciones rápidas</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => navigate('/dashboard/platillos/nuevo')}
                className="p-4 rounded-lg bg-[#2997FF] text-white font-500 text-[15px] tracking-[-0.01em] hover:bg-[#40A9FF] transition-all duration-200 hover:shadow-[0_4px_16px_rgba(41,151,255,0.2)] hover:translate-y-[-2px]"
              >
                ➕ Nuevo platillo
              </button>
              <button
                onClick={() => navigate('/dashboard/qr')}
                className="p-4 rounded-lg border border-white/[0.10] font-semibold text-sm text-[#A1A1A6] hover:border-[#2997FF]/40 hover:text-[#F5F5F7] transition-all duration-200"
              >
                📷 Ver mi QR
              </button>
              <button
                onClick={() => navigate('/dashboard/platillos')}
                className="p-4 rounded-lg border border-white/[0.10] font-semibold text-sm text-[#A1A1A6] hover:border-[#2997FF]/40 hover:text-[#F5F5F7] transition-all duration-200"
              >
                📋 Gestionar menú
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
}