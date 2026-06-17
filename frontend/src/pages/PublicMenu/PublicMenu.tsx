import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { comensalService } from '../../services/comensal';

interface Platillo {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  url_imagen: string;
  activo: boolean;
}

interface Categoria {
  id: string;
  nombre: string;
  orden: number;
  platillos: Platillo[];
}

interface RestaurantInfo {
  nombre: string;
  logo_url: string;
  color_primario: string;
  layout_type: 'LISTA_SIMPLE' | 'CUADRICULA_FOTOS' | 'TARJETAS_DETALLADAS';
}

const MENU_DUMMY = {
  restaurante: {
    nombre: 'La Taquería Imperial',
    logo_url: '',
    color_primario: '#FF4A00',
    layout_type: 'TARJETAS_DETALLADAS' as const
  },
  categorias: [
    {
      id: 'c1',
      nombre: 'Entradas',
      orden: 1,
      platillos: [
        { id: 'p1', nombre: 'Guacamole Tradicional', descripcion: 'Aguacate hass con pico de gallo y totopos.', precio: 85, url_imagen: '', activo: true },
        { id: 'p2', nombre: 'Queso Fundido', descripcion: 'Mezcla de quesos con chorizo o champiñones.', precio: 110, url_imagen: '', activo: true }
      ]
    },
    {
      id: 'c2',
      nombre: 'Tacos Especiales',
      orden: 2,
      platillos: [
        { id: 'p3', nombre: 'Taco de Rib Eye', descripcion: 'Corte premium con cebolla caramelizada.', precio: 65, url_imagen: '', activo: true },
        { id: 'p4', nombre: 'Taco de Camaron Roca', descripcion: 'Camarón tempura con aderezo chipotle.', precio: 75, url_imagen: '', activo: true }
      ]
    }
  ]
};

export function PublicMenu() {
  const { restaurant_id } = useParams<{ restaurant_id: string }>();
  const [loading, setLoading] = useState(true);
  const [menuData, setMenuData] = useState<{ restaurante: RestaurantInfo; categorias: Categoria[] } | null>(null);

  useEffect(() => {
    async function fetchMenu() {
      if (!restaurant_id) return;
      
      // Simulación instantánea para el ID 1 o fallbacks
      if (restaurant_id === '1' || restaurant_id === 'restaurante-123') {
        setMenuData(MENU_DUMMY);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await comensalService.getMenuByQR(restaurant_id);
        
        if (!data || !data.categorias) {
          throw new Error('No data');
        }

        const cleanCategorias = data.categorias
          .map((cat: any) => ({
            ...cat,
            platillos: (cat.platillos || []).filter((p: any) => p.activo)
          }))
          .filter((cat: any) => cat.platillos.length > 0)
          .sort((a: any, b: any) => (a.orden || 0) - (b.orden || 0));

        setMenuData({
          restaurante: data.restaurante || MENU_DUMMY.restaurante,
          categorias: cleanCategorias
        });
      } catch (err) {
        console.warn('Usando menú simulado por error en red/id');
        setMenuData(MENU_DUMMY);
      } finally {
        setLoading(false);
      }
    }

    fetchMenu();
  }, [restaurant_id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, 360] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-5xl"
        >
          🌮
        </motion.div>
      </div>
    );
  }

  if (!menuData) return null;

  const { restaurante, categorias } = menuData;
  const primaryColor = restaurante.color_primario || '#FF4A00';

  return (
    <div 
      className="min-h-screen bg-[var(--app-bg)] text-[var(--app-text)] font-sans pb-20 transition-colors duration-500"
      style={{ '--primary-color': primaryColor } as any}
    >
      <header className="sticky top-0 z-50 bg-[var(--app-bg)]/80 backdrop-blur-xl border-b border-[var(--app-border)] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {restaurante.logo_url ? (
            <img src={restaurante.logo_url} alt={restaurante.nombre} className="h-10 w-10 object-contain rounded-lg" />
          ) : (
            <div className="h-10 w-10 bg-[var(--app-bg-secondary)] rounded-lg flex items-center justify-center font-bold text-xl border border-[var(--app-border)]">
              {restaurante.nombre.charAt(0)}
            </div>
          )}
          <h1 className="text-xl font-black tracking-tight">{restaurante.nombre}</h1>
        </div>
        <div className="h-2 w-2 rounded-full animate-pulse shadow-[0_0_10px_var(--primary-color)]" style={{ backgroundColor: primaryColor }} />
      </header>

      <nav className="sticky top-[73px] z-40 bg-[var(--app-bg)]/90 backdrop-blur-md py-4 px-6 overflow-x-auto whitespace-nowrap scrollbar-hide border-b border-[var(--app-border)]">
        <div className="flex gap-4">
          {categorias.map(cat => (
            <a 
              key={cat.id} 
              href={`#cat-${cat.id}`}
              className="px-4 py-2 rounded-full bg-[var(--app-bg-secondary)] border border-[var(--app-border)] text-sm font-medium hover:border-apple-blue/40 transition-colors"
            >
              {cat.nombre}
            </a>
          ))}
        </div>
      </nav>

      <main className="max-w-[1200px] mx-auto px-6 pt-12">
        {categorias.map((cat) => (
          <section key={cat.id} id={`cat-${cat.id}`} className="mb-16">
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-3xl font-black mb-8 border-l-4 pl-4"
              style={{ borderColor: primaryColor }}
            >
              {cat.nombre}
            </motion.h2>

            <div className={`
              ${restaurante.layout_type === 'LISTA_SIMPLE' ? 'flex flex-col gap-4' : ''}
              ${restaurante.layout_type === 'CUADRICULA_FOTOS' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6' : ''}
              ${restaurante.layout_type === 'TARJETAS_DETALLADAS' ? 'flex flex-col gap-8' : ''}
            `}>
              {cat.platillos.map((platillo, pIdx) => (
                <PlatilloItem 
                  key={platillo.id} 
                  platillo={platillo} 
                  layout={restaurante.layout_type} 
                  color={primaryColor}
                  index={pIdx}
                />
              ))}
            </div>
          </section>
        ))}
      </main>

      <footer className="mt-20 px-6 py-12 text-center border-t border-white/5">
        <p className="text-[#86868B] text-sm tracking-widest uppercase mb-4">Potenciado por MexxicanMX</p>
        <div className="flex justify-center gap-4 grayscale opacity-50 text-2xl">
           <span>🌮</span>
           <span>⚡</span>
           <span>🤖</span>
        </div>
      </footer>
    </div>
  );
}

function PlatilloItem({ platillo, layout, color, index }: { platillo: Platillo, layout: string, color: string, index: number }) {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { delay: index * 0.05, duration: 0.5 } }
  };

  if (layout === 'LISTA_SIMPLE') {
    return (
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="flex items-center justify-between py-4 border-b border-white/5 hover:bg-white/5 transition-colors px-2 rounded-xl"
      >
        <div className="flex-1 pr-4">
          <h3 className="text-lg font-bold">{platillo.nombre}</h3>
          <p className="text-[#86868B] text-sm line-clamp-1">{platillo.descripcion}</p>
        </div>
        <div className="text-xl font-black" style={{ color }}>${platillo.precio}</div>
      </motion.div>
    );
  }

  if (layout === 'CUADRICULA_FOTOS') {
    return (
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="group flex flex-col gap-3"
      >
        <div className="aspect-square rounded-[2rem] overflow-hidden bg-white/5 border border-white/5 relative">
          {platillo.url_imagen ? (
            <img src={platillo.url_imagen} alt={platillo.nombre} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
          ) : (
             <div className="w-full h-full flex items-center justify-center text-4xl opacity-20">🍽️</div>
          )}
          <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-sm font-bold border border-white/10">
            ${platillo.precio}
          </div>
        </div>
        <h3 className="text-center font-bold px-2">{platillo.nombre}</h3>
      </motion.div>
    );
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="flex flex-col md:flex-row gap-6 p-6 rounded-[2.5rem] bg-white/5 border border-white/5 hover:border-white/20 transition-all group overflow-hidden"
    >
      <div className="w-full md:w-64 h-64 rounded-3xl overflow-hidden flex-shrink-0 bg-white/5">
        {platillo.url_imagen ? (
          <img src={platillo.url_imagen} alt={platillo.nombre} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
        ) : (
           <div className="w-full h-full flex items-center justify-center text-5xl opacity-20">🍽️</div>
        )}
      </div>
      <div className="flex-1 flex flex-col justify-center">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-2xl md:text-3xl font-black">{platillo.nombre}</h3>
          <div className="text-2xl font-black px-4 py-1 rounded-full bg-white/5 border border-white/10" style={{ color }}>
            ${platillo.precio}
          </div>
        </div>
        <p className="text-lg text-[#A1A1A6] leading-relaxed mb-6">{platillo.descripcion}</p>
        <div className="flex gap-2">
           <span className="px-3 py-1 rounded-full bg-white/5 text-[10px] font-bold tracking-widest uppercase text-[#86868B]">Fresco</span>
           <span className="px-3 py-1 rounded-full bg-white/5 text-[10px] font-bold tracking-widest uppercase text-[#86868B]">Local</span>
        </div>
      </div>
    </motion.div>
  );
}
