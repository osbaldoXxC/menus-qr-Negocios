import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { restauranteService } from '../../services/restaurante';
import { Plus, Search, MoreVertical, Edit2, Trash2, Eye, EyeOff } from 'lucide-react';

export function MiMenu() {
  const navigate = useNavigate();
  const [platillos, setPlatillos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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

  const filteredPlatillos = platillos.filter(p => 
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.categoria && p.categoria.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <motion.div className="text-4xl" animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 1 }}>
          🌮
        </motion.div>
      </div>
    );
  }

  return (
    <div className="py-12 px-6 lg:px-12 max-w-[1400px] mx-auto min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">Mi Menú</h1>
          <p className="text-lg text-apple-text-secondary dark:text-apple-dark-text-secondary font-medium">
            Administra tus platillos, precios y disponibilidad.
          </p>
        </div>
        <button
          onClick={() => navigate('/dashboard/platillos/nuevo')}
          className="flex items-center gap-2 px-6 py-4 bg-apple-blue text-white font-bold rounded-2xl shadow-apple-md hover:bg-apple-blue-hover transition-all active:scale-95"
        >
          <Plus size={20} />
          Nuevo Platillo
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-apple-text-tertiary" size={20} />
          <input 
            type="text" 
            placeholder="Buscar platillo o categoría..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-apple-bg-secondary dark:bg-apple-dark-bg-secondary border border-apple-border dark:border-apple-dark-border rounded-2xl focus:ring-2 focus:ring-apple-blue outline-none transition-all font-medium"
          />
        </div>
      </div>

      {filteredPlatillos.length === 0 ? (
        <motion.div
          className="py-24 text-center rounded-[3rem] bg-apple-bg-secondary/50 dark:bg-apple-dark-bg-secondary/50 border-2 border-dashed border-apple-border"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="w-20 h-20 bg-apple-bg-tertiary rounded-full flex items-center justify-center mx-auto mb-6">
            <Search size={32} className="text-apple-text-tertiary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">No se encontraron platillos</h2>
          <p className="text-apple-text-secondary mb-8 font-medium">Prueba con otro término o agrega uno nuevo.</p>
          <button
            onClick={() => navigate('/dashboard/platillos/nuevo')}
            className="text-apple-blue font-bold text-lg"
          >
            Agregar platillo ahora →
          </button>
        </motion.div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence mode='popLayout'>
            {filteredPlatillos.map((platillo, i) => (
              <motion.div
                key={platillo.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
                className="group flex flex-col overflow-hidden rounded-[2.5rem] bg-apple-bg-secondary dark:bg-apple-dark-bg-secondary border border-apple-border dark:border-apple-dark-border shadow-apple-sm transition-all duration-500 hover:shadow-apple-xl hover:border-apple-blue/30"
              >
                <div className="relative h-64 overflow-hidden bg-apple-bg-tertiary">
                  {platillo.url_imagen ? (
                    <img
                      src={platillo.url_imagen}
                      alt={platillo.nombre}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-apple-text-tertiary bg-apple-bg-tertiary">
                      <Utensils size={64} />
                    </div>
                  )}
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button className="p-2.5 rounded-xl bg-black/40 backdrop-blur-md text-white border border-white/20 hover:bg-black/60 transition-colors">
                      <Edit2 size={18} />
                    </button>
                    <button className="p-2.5 rounded-xl bg-black/40 backdrop-blur-md text-white border border-white/20 hover:bg-red-500/80 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <div className="absolute bottom-4 left-4">
                    <span className="px-3 py-1.5 rounded-lg bg-apple-blue text-white text-[12px] font-bold tracking-wider uppercase shadow-apple-glow">
                      {platillo.categoria || 'General'}
                    </span>
                  </div>
                </div>

                <div className="p-8 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-2xl font-bold tracking-tight group-hover:text-apple-blue transition-colors">{platillo.nombre}</h3>
                    <span className="text-xl font-black text-apple-blue">
                      {platillo.precio.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                    </span>
                  </div>
                  
                  <p className="text-apple-text-secondary dark:text-apple-dark-text-secondary font-medium leading-relaxed mb-8 flex-1">
                    {platillo.descripcion || 'Sin descripción disponible.'}
                  </p>

                  <div className="flex items-center justify-between pt-6 border-t border-apple-border dark:border-apple-dark-border">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${platillo.activo !== false ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span className="text-[13px] font-bold uppercase tracking-wider text-apple-text-tertiary">
                        {platillo.activo !== false ? 'Disponible' : 'Pausado'}
                      </span>
                    </div>
                    <button className="flex items-center gap-2 text-apple-text-secondary hover:text-apple-blue transition-colors font-bold text-sm">
                      {platillo.activo !== false ? <EyeOff size={16} /> : <Eye size={16} />}
                      {platillo.activo !== false ? 'Pausar' : 'Activar'}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

import { Utensils } from 'lucide-react';