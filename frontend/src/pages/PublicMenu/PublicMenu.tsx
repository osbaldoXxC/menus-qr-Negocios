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
  color_fondo: string;
  fuente_familia: string;
  layout_type: 'LISTA_SIMPLE' | 'CUADRICULA_FOTOS' | 'TARJETAS_DETALLADAS';
}

// Detecta si un color hex es oscuro o claro
function isColorDark(hex: string): boolean {
  const clean = hex.replace('#', '');
  if (clean.length < 6) return true;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  // Luminancia relativa (fórmula WCAG)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.5;
}

const MENU_DUMMY: { restaurante: RestaurantInfo; categorias: Categoria[] } = {
  restaurante: {
    nombre: 'La Taquería Imperial',
    logo_url: '',
    color_primario: '#FF4A00',
    color_fondo: '#0A0A0A',
    fuente_familia: 'Sans-Serif',
    layout_type: 'TARJETAS_DETALLADAS',
  },
  categorias: [
    {
      id: 'c1', nombre: 'Entradas', orden: 1,
      platillos: [
        { id: 'p1', nombre: 'Guacamole Tradicional', descripcion: 'Aguacate hass con pico de gallo y totopos crujientes.', precio: 85, url_imagen: '', activo: true },
        { id: 'p2', nombre: 'Queso Fundido', descripcion: 'Mezcla de quesos con chorizo o champiñones al horno.', precio: 110, url_imagen: '', activo: true },
      ],
    },
    {
      id: 'c2', nombre: 'Tacos Especiales', orden: 2,
      platillos: [
        { id: 'p3', nombre: 'Taco de Rib Eye', descripcion: 'Corte premium con cebolla caramelizada y salsa verde.', precio: 65, url_imagen: '', activo: true },
        { id: 'p4', nombre: 'Taco de Camarón', descripcion: 'Camarón tempura con aderezo chipotle y aguacate.', precio: 75, url_imagen: '', activo: true },
      ],
    },
  ],
};

export function PublicMenu() {
  const { restaurant_id } = useParams<{ restaurant_id: string }>();
  const [loading, setLoading] = useState(true);
  const [menuData, setMenuData] = useState<{ restaurante: RestaurantInfo; categorias: Categoria[] } | null>(null);

  useEffect(() => {
    async function fetchMenu() {
      if (!restaurant_id) return;

      if (restaurant_id === '1' || restaurant_id === 'restaurante-123') {
        setMenuData(MENU_DUMMY);
        setLoading(false);
        return;
      }

      try {
        const data = await comensalService.getMenuByQR(restaurant_id);
        if (!data?.categorias) throw new Error('No data');

        const temaBackend = data.restaurante?.tema || {};
        const restaurante: RestaurantInfo = {
          nombre: data.restaurante?.nombre || MENU_DUMMY.restaurante.nombre,
          logo_url: temaBackend.logo_url || '',
          color_primario: temaBackend.color_primario || MENU_DUMMY.restaurante.color_primario,
          color_fondo: temaBackend.color_fondo || '#0A0A0A',
          fuente_familia: temaBackend.fuente_familia || 'Sans-Serif',
          layout_type: temaBackend.layout_type || MENU_DUMMY.restaurante.layout_type,
        };

        const cleanCategorias = data.categorias
          .map((cat: any) => ({ ...cat, platillos: (cat.platillos || []).filter((p: any) => p.activo !== false) }))
          .filter((cat: any) => cat.platillos.length > 0)
          .sort((a: any, b: any) => (a.orden || 0) - (b.orden || 0));

        setMenuData({ restaurante, categorias: cleanCategorias });
      } catch {
        setMenuData(MENU_DUMMY);
      } finally {
        setLoading(false);
      }
    }
    fetchMenu();
  }, [restaurant_id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          className="text-5xl"
        >
          🌮
        </motion.div>
      </div>
    );
  }

  if (!menuData) return null;

  const { restaurante, categorias } = menuData;

  // Paleta adaptativa basada en el color de fondo elegido
  const dark = isColorDark(restaurante.color_fondo);
  const primary = restaurante.color_primario || '#FF4A00';
  const bg = restaurante.color_fondo || '#0A0A0A';

  // Colores de texto, bordes y superficies derivados del modo
  const textMain    = dark ? 'rgba(245,245,247,1)'   : 'rgba(29,29,31,1)';
  const textSub     = dark ? 'rgba(161,161,166,1)'   : 'rgba(134,134,139,1)';
  const textMuted   = dark ? 'rgba(110,110,115,1)'   : 'rgba(174,174,178,1)';
  const surface     = dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)';
  const surfaceHover= dark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.07)';
  const border      = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const headerBg    = dark ? `${bg}cc`               : `${bg}cc`;
  const priceBadge  = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';

  const fontFamily =
    restaurante.fuente_familia === 'Serif' ? 'Georgia, "Times New Roman", serif' :
    restaurante.fuente_familia === 'Mono'  ? '"SF Mono", "JetBrains Mono", monospace' :
    'Inter, -apple-system, BlinkMacSystemFont, sans-serif';

  const css = { '--bg': bg, '--primary': primary, '--text': textMain, '--text-sub': textSub, '--text-muted': textMuted, '--surface': surface, '--surface-hover': surfaceHover, '--border': border } as React.CSSProperties;

  return (
    <div style={{ ...css, backgroundColor: bg, color: textMain, fontFamily }} className="min-h-screen pb-24 transition-colors">

      {/* ── HEADER ── */}
      <header
        className="sticky top-0 z-50 px-5 py-3.5 flex items-center justify-between backdrop-blur-xl"
        style={{ backgroundColor: headerBg, borderBottom: `1px solid ${border}` }}
      >
        <div className="flex items-center gap-3">
          {restaurante.logo_url ? (
            <img src={restaurante.logo_url} alt={restaurante.nombre} className="h-9 w-9 rounded-xl object-cover flex-shrink-0" />
          ) : (
            <div
              className="h-9 w-9 rounded-xl flex items-center justify-center font-black text-base flex-shrink-0"
              style={{ backgroundColor: `${primary}20`, color: primary }}
            >
              {restaurante.nombre.charAt(0)}
            </div>
          )}
          <span className="font-bold text-[15px] tracking-tight" style={{ color: textMain }}>
            {restaurante.nombre}
          </span>
        </div>
        <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: primary, boxShadow: `0 0 8px ${primary}` }} />
      </header>

      {/* ── NAV CATEGORÍAS ── */}
      <nav
        className="sticky top-[57px] z-40 px-5 py-3 overflow-x-auto scrollbar-hide backdrop-blur-xl"
        style={{ backgroundColor: headerBg, borderBottom: `1px solid ${border}` }}
      >
        <div className="flex gap-2 w-max">
          {categorias.map(cat => (
            <a
              key={cat.id}
              href={`#cat-${cat.id}`}
              className="px-4 py-1.5 rounded-full text-[13px] font-semibold transition-all whitespace-nowrap"
              style={{ backgroundColor: surface, color: textSub, border: `1px solid ${border}` }}
              onMouseEnter={e => { (e.target as HTMLElement).style.backgroundColor = surfaceHover; (e.target as HTMLElement).style.color = textMain; }}
              onMouseLeave={e => { (e.target as HTMLElement).style.backgroundColor = surface; (e.target as HTMLElement).style.color = textSub; }}
            >
              {cat.nombre}
            </a>
          ))}
        </div>
      </nav>

      {/* ── CONTENIDO ── */}
      <main className="max-w-[900px] mx-auto px-5 pt-10 space-y-16">
        {categorias.map((cat) => (
          <section key={cat.id} id={`cat-${cat.id}`}>
            <motion.h2
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-[1.6rem] font-black tracking-tight mb-7 pl-4"
              style={{ color: textMain, borderLeft: `4px solid ${primary}` }}
            >
              {cat.nombre}
            </motion.h2>

            <div className={
              restaurante.layout_type === 'LISTA_SIMPLE'       ? 'flex flex-col' :
              restaurante.layout_type === 'CUADRICULA_FOTOS'   ? 'grid grid-cols-2 sm:grid-cols-3 gap-4' :
              'flex flex-col gap-5'
            }>
              {cat.platillos.map((p, i) => (
                <PlatilloCard
                  key={p.id}
                  platillo={p}
                  layout={restaurante.layout_type}
                  index={i}
                  colors={{ primary, textMain, textSub, textMuted, surface, surfaceHover, border, priceBadge, dark }}
                />
              ))}
            </div>
          </section>
        ))}
      </main>

      {/* ── FOOTER ── */}
      <footer className="mt-20 py-10 text-center" style={{ borderTop: `1px solid ${border}` }}>
        <p className="text-[11px] font-semibold tracking-[0.18em] uppercase mb-3" style={{ color: textMuted }}>
          Menú digital por MexxicanMX
        </p>
        <div className="flex justify-center gap-3 text-xl opacity-40">
          <span>🌮</span><span>⚡</span><span>🤖</span>
        </div>
      </footer>
    </div>
  );
}

interface CardColors {
  primary: string; textMain: string; textSub: string; textMuted: string;
  surface: string; surfaceHover: string; border: string; priceBadge: string; dark: boolean;
}

function PlatilloCard({ platillo, layout, index, colors }: {
  platillo: Platillo; layout: string; index: number; colors: CardColors;
}) {
  const { primary, textMain, textSub, surface, surfaceHover, border, priceBadge, dark } = colors;

  const anim = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { delay: index * 0.05, duration: 0.45 } },
  };

  const Placeholder = () => (
    <div className="w-full h-full flex items-center justify-center text-4xl" style={{ backgroundColor: `${primary}12` }}>
      🍽️
    </div>
  );

  // ── LISTA SIMPLE ──
  if (layout === 'LISTA_SIMPLE') {
    return (
      <motion.div
        variants={anim} initial="hidden" whileInView="visible" viewport={{ once: true }}
        className="flex items-center justify-between py-4 px-2 transition-colors rounded-xl"
        style={{ color: textMain, borderBottom: `1px solid ${border}` }}
        onMouseEnter={e => (e.currentTarget.style.backgroundColor = surface)}
        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
      >
        {platillo.url_imagen && (
          <img src={platillo.url_imagen} alt={platillo.nombre} className="w-14 h-14 rounded-xl object-cover flex-shrink-0 mr-4" />
        )}
        <div className="flex-1 min-w-0 pr-4">
          <h3 className="font-bold text-[15px] truncate" style={{ color: textMain }}>{platillo.nombre}</h3>
          <p className="text-[12px] mt-0.5 truncate" style={{ color: textSub }}>{platillo.descripcion}</p>
        </div>
        <span className="font-black text-[16px] flex-shrink-0" style={{ color: primary }}>${platillo.precio}</span>
      </motion.div>
    );
  }

  // ── CUADRÍCULA ──
  if (layout === 'CUADRICULA_FOTOS') {
    return (
      <motion.div
        variants={anim} initial="hidden" whileInView="visible" viewport={{ once: true }}
        className="group flex flex-col gap-2.5"
      >
        <div className="aspect-square rounded-[1.4rem] overflow-hidden relative" style={{ border: `1px solid ${border}` }}>
          {platillo.url_imagen
            ? <img src={platillo.url_imagen} alt={platillo.nombre} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            : <Placeholder />
          }
          <div
            className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-full text-[12px] font-bold backdrop-blur-md"
            style={{ backgroundColor: `${primary}dd`, color: '#fff' }}
          >
            ${platillo.precio}
          </div>
        </div>
        <h3 className="font-bold text-[14px] text-center px-1 line-clamp-1" style={{ color: textMain }}>{platillo.nombre}</h3>
      </motion.div>
    );
  }

  // ── TARJETAS DETALLADAS ──
  return (
    <motion.div
      variants={anim} initial="hidden" whileInView="visible" viewport={{ once: true }}
      className="flex flex-col sm:flex-row gap-5 p-5 rounded-[1.5rem] group transition-all duration-300"
      style={{ backgroundColor: surface, border: `1px solid ${border}` }}
      onMouseEnter={e => (e.currentTarget.style.backgroundColor = surfaceHover)}
      onMouseLeave={e => (e.currentTarget.style.backgroundColor = surface)}
    >
      <div
        className="w-full sm:w-44 h-44 rounded-2xl overflow-hidden flex-shrink-0"
        style={{ border: `1px solid ${border}` }}
      >
        {platillo.url_imagen
          ? <img src={platillo.url_imagen} alt={platillo.nombre} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          : <Placeholder />
        }
      </div>

      <div className="flex-1 flex flex-col justify-between py-1">
        <div>
          <h3 className="text-[1.15rem] font-black tracking-tight mb-2" style={{ color: textMain }}>
            {platillo.nombre}
          </h3>
          <p className="text-[13px] leading-relaxed line-clamp-3" style={{ color: textSub }}>
            {platillo.descripcion}
          </p>
        </div>
        <div className="flex items-center justify-between mt-4">
          <span
            className="text-[1.3rem] font-black"
            style={{ color: primary }}
          >
            ${platillo.precio}
          </span>
          <span
            className="px-3 py-1 rounded-full text-[11px] font-semibold"
            style={{ backgroundColor: priceBadge, color: textSub, border: `1px solid ${border}` }}
          >
            Disponible
          </span>
        </div>
      </div>
    </motion.div>
  );
}
