import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { restauranteService } from '../../services/restaurante';

export function MiMenu() {
  const navigate = useNavigate();
  const [platillos, setPlatillos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarPlatillos();
  }, []);

  const cargarPlatillos = async () => {
    try {
      const data = await restauranteService.getPlatillos();
      setPlatillos(data);
    } catch (error) {
      console.error('Error cargando platillos:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#000000] text-[#F5F5F7] min-h-screen flex items-center justify-center">
        <motion.div className="text-4xl" animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 1 }}>
          🌮
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-[#000000] text-[#F5F5F7] min-h-screen">
      <Header />
      <div className="pt-16 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="glass rounded-apple-lg p-6 md:p-8 mb-10 border border-white/[0.06]">
            <div className="flex flex-col md:flex-row gap-6 justify-between items-center">
              <div className="space-y-2 text-center md:text-left">
                <span className="inline-flex items-center rounded-apple-full bg-[#2997FF]/10 px-3 py-1 text-sm font-semibold text-[#2997FF]">
                  🌮 Menú del restaurante
                </span>
                <h1 className="text-3xl font-bold sm:text-4xl">Mi Menú</h1>
                <p className="text-[#A1A1A6] max-w-xl leading-7">
                  Aquí aparecen tus platillos registrados. Mira las imágenes, descripciones y precios, y administra tu menú con estilo.
                </p>
              </div>
              <button
                onClick={() => navigate('/dashboard/platillos/nuevo')}
                className="btn-apple btn-apple-primary text-sm py-3 px-6 whitespace-nowrap"
              >
                + Agregar platillo
              </button>
            </div>
          </div>

          {platillos.length === 0 ? (
            <motion.div
              className="glass rounded-apple-lg p-14 text-center border border-white/[0.06]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="text-6xl mb-4">🍽️</div>
              <h2 className="text-2xl font-semibold mb-2">No tienes platillos registrados</h2>
              <p className="text-[#A1A1A6] mb-6">Agrega tu primer platillo para que los clientes puedan empezar a ver tu menú.</p>
              <button
                onClick={() => navigate('/dashboard/platillos/nuevo')}
                className="btn-apple btn-apple-primary text-sm py-3 px-6"
              >
                Agregar primer platillo
              </button>
            </motion.div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {platillos.map((platillo) => (
                <motion.div
                  key={platillo.id}
                  className="group flex flex-col overflow-hidden rounded-apple-lg bg-[#1D1D1F] border border-white/[0.06] shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:border-[#2997FF]/20 hover:shadow-[#2997FF]/5"
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <div className="relative h-56 sm:h-64 bg-white/[0.02]">
                    {platillo.url_imagen ? (
                      <img
                        src={platillo.url_imagen}
                        alt={platillo.nombre}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        loading="lazy"
                        onError={(event) => {
                          event.currentTarget.onerror = null;
                          event.currentTarget.src = 'https://via.placeholder.com/600x400?text=Imagen+no+disponible';
                        }}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-5xl text-[#6E6E73]">🌮</div>
                    )}
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h3 className="text-xl font-semibold text-[#F5F5F7]">{platillo.nombre}</h3>
                          <p className="mt-1 text-sm text-[#A1A1A6]">{platillo.categoria || 'Sin categoría'}</p>
                        </div>
                        <span className="inline-flex rounded-apple-full bg-[#2997FF]/10 px-3 py-1 text-sm font-semibold text-[#2997FF]">
                          ${platillo.precio}
                        </span>
                      </div>
                      <p className="mt-4 min-h-[4rem] text-sm leading-6 text-[#A1A1A6]">
                        {platillo.descripcion || 'Sin descripción disponible aún.'}
                      </p>
                    </div>
                    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                      <button className="w-full rounded-apple-full border border-white/[0.10] bg-white/[0.02] px-4 py-3 text-sm text-[#F5F5F7] hover:border-[#2997FF]/40 hover:text-[#2997FF] transition-all duration-200">
                        Editar
                      </button>
                      <button className="w-full rounded-apple-full border border-white/[0.10] bg-white/[0.02] px-4 py-3 text-sm text-[#A1A1A6] hover:border-white/[0.20] hover:text-[#F5F5F7] transition-all duration-200">
                        Duplicar
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}