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
  ingredientes_principales?: string[];
  complementos?: string[];
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
  config_diseno?: any;
  banner_promocional_activo?: boolean;
  banner_promocional_texto?: string;
  descripcion?: string;
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

function colorWithOpacity(colorStr: string, opacity: number): string {
  if (!colorStr) return `rgba(255,255,255,${opacity})`;
  if (colorStr.startsWith('rgba')) {
    return colorStr.replace(/[\d\.]+\)$/, `${opacity})`);
  }
  if (colorStr.startsWith('rgb')) {
    return colorStr.replace('rgb', 'rgba').replace(/\)$/, `, ${opacity})`);
  }
  const clean = colorStr.replace('#', '');
  if (clean.length === 3) {
    const r = clean[0];
    const g = clean[1];
    const b = clean[2];
    return `rgba(${parseInt(r+r, 16)}, ${parseInt(g+g, 16)}, ${parseInt(b+b, 16)}, ${opacity})`;
  }
  if (clean.length === 6) {
    const r = clean.slice(0, 2);
    const g = clean.slice(2, 4);
    const b = clean.slice(4, 6);
    return `rgba(${parseInt(r, 16)}, ${parseInt(g, 16)}, ${parseInt(b, 16)}, ${opacity})`;
  }
  return colorStr;
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
  const [error, setError] = useState<string | null>(null);

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
          config_diseno: temaBackend.config_diseno || {},
          banner_promocional_activo: temaBackend.banner_promocional_activo ?? false,
          banner_promocional_texto: temaBackend.banner_promocional_texto || '',
          descripcion: data.restaurante?.descripcion || '',
        };

        // Inyectar fuentes premium dinámicamente si se requieren
        const customFont = temaBackend.config_diseno?.apariencia?.fuente_familia || temaBackend.fuente_familia;
        if (customFont === 'Poppins' || customFont === 'Outfit') {
          if (!document.getElementById(`font-${customFont}`)) {
            const link = document.createElement('link');
            link.id = `font-${customFont}`;
            link.rel = 'stylesheet';
            link.href = `https://fonts.googleapis.com/css2?family=${customFont}:wght@300;400;500;600;700;800;900&display=swap`;
            document.head.appendChild(link);
          }
        }

        const cleanCategorias = data.categorias
          .map((cat: any) => ({ ...cat, platillos: (cat.platillos || []).filter((p: any) => p.activo !== false) }))
          .filter((cat: any) => cat.platillos.length > 0)
          .sort((a: any, b: any) => (a.orden || 0) - (b.orden || 0));

        setMenuData({ restaurante, categorias: cleanCategorias });
      } catch (err: any) {
        console.error('Error fetching menu:', err);
        const errMsg = err.response?.data?.mensaje || 'Menú no disponible o cuenta suspendida';
        setError(errMsg);
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

  if (error) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-5 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-[400px] p-8 rounded-[2rem] bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl"
        >
          <span className="text-5xl block mb-6">🔒</span>
          <h2 className="text-2xl font-black tracking-tight text-white mb-3">Menú no disponible</h2>
          <p className="text-[14px] text-[#A1A1A6] leading-relaxed mb-6 font-medium">
            {error}
          </p>
          <div className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#6E6E73]">
            MexxicanMX
          </div>
        </motion.div>
      </div>
    );
  }

  if (!menuData) return null;

  const { restaurante, categorias } = menuData;

  // Extraer config_diseno
  const diseno = restaurante.config_diseno || {};
  const apariencia = diseno.apariencia || {};
  const layoutObj = diseno.layout || {};
  const elementos = diseno.elementos_visuales || {};

  // Paleta adaptativa basada en el color de fondo elegido o config_diseno
  const bg = apariencia.color_fondo || restaurante.color_fondo || '#0A0A0A';
  const primary = apariencia.color_primario || restaurante.color_primario || '#FF4A00';
  const dark = apariencia.modo_oscuro !== undefined ? apariencia.modo_oscuro : isColorDark(bg);

  // Colores de texto, bordes y superficies derivados del modo o config_diseno
  const textMain    = apariencia.color_normal || (dark ? 'rgba(245,245,247,1)' : 'rgba(29,29,31,1)');
  const textSub     = colorWithOpacity(textMain, 0.7);
  const textMuted   = colorWithOpacity(textMain, 0.55);
  
  // Glassmorphism
  const isGlass = elementos.glassmorphism || false;
  const showShadow = elementos.sombras_habilitadas !== undefined ? elementos.sombras_habilitadas : true;
  const blurVal = apariencia.fondo_blur || (isGlass ? '12px' : '0px');

  const surface     = isGlass
    ? (dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)')
    : (dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)');
  const surfaceHover= isGlass
    ? (dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)')
    : (dark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.07)');
    
  const border      = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const priceBadge  = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';

  // Border radius para botones y tarjetas
  const btnRadius = apariencia.border_radius_botones || '12px';
  const cardRadius = apariencia.border_radius_tarjetas || '24px';

  // Cabecera
  const headerBg = isGlass 
    ? (dark ? 'rgba(10,10,10,0.4)' : 'rgba(255,255,255,0.4)')
    : (dark ? `${bg}cc` : `${bg}cc`);

  const fontFam = apariencia.fuente_familia || restaurante.fuente_familia || 'Sans-Serif';
  const fontFamily =
    fontFam === 'Serif' ? 'Georgia, "Times New Roman", serif' :
    fontFam === 'Mono'  ? '"SF Mono", "JetBrains Mono", monospace' :
    fontFam === 'Poppins' ? 'Poppins, Inter, sans-serif' :
    fontFam === 'Outfit' ? 'Outfit, Inter, sans-serif' :
    'Inter, -apple-system, BlinkMacSystemFont, sans-serif';

  // Fondo tipo gradiente o sólido
  const isGradient = apariencia.fondo_tipo === 'gradiente';
  const bgValue = isGradient ? (apariencia.fondo_valor || `linear-gradient(to bottom, ${bg}, #000)`) : bg;
  
  // Layout actual
  const layoutType = layoutObj.layout_type || restaurante.layout_type || 'TARJETAS_DETALLADAS';
  const categoriesSticky = layoutObj.categorias_sticky !== undefined ? layoutObj.categorias_sticky : true;

  const css = { 
    '--bg': bg, 
    '--primary': primary, 
    '--text': textMain, 
    '--text-sub': textSub, 
    '--text-muted': textMuted, 
    '--surface': surface, 
    '--surface-hover': surfaceHover, 
    '--border': border 
  } as React.CSSProperties;

  return (
    <div 
      style={{ 
        ...css, 
        background: isGradient ? bgValue : bg,
        backgroundColor: bg, 
        color: textMain, 
        fontFamily 
      }} 
      className="min-h-screen pb-24 transition-colors"
    >

      {/* ── HEADER ── */}
      <header
        className="sticky top-0 z-50 px-5 py-3.5 flex items-center justify-between backdrop-blur-xl transition-all"
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
        className="z-40 px-5 py-3 overflow-x-auto scrollbar-hide backdrop-blur-xl transition-all"
        style={{ 
          position: categoriesSticky ? 'sticky' : 'relative',
          top: categoriesSticky ? '57px' : 'auto',
          backgroundColor: headerBg, 
          borderBottom: `1px solid ${border}` 
        }}
      >
        <div className="flex gap-2 w-max">
          {categorias.map((cat: Categoria) => (
            <a
              key={cat.id}
              href={`#cat-${cat.id}`}
              className="px-4 py-1.5 text-[13px] font-semibold transition-all whitespace-nowrap"
              style={{ 
                backgroundColor: surface, 
                color: textSub, 
                border: `1px solid ${border}`,
                borderRadius: btnRadius
              }}
              onMouseEnter={e => { (e.target as HTMLElement).style.backgroundColor = surfaceHover; (e.target as HTMLElement).style.color = textMain; }}
              onMouseLeave={e => { (e.target as HTMLElement).style.backgroundColor = surface; (e.target as HTMLElement).style.color = textSub; }}
            >
              {cat.nombre}
            </a>
          ))}
        </div>
      </nav>

      {/* ── CONTENIDO ── */}
      <main className="max-w-[900px] mx-auto px-5 pt-10 space-y-8">
        {/* Presentación del Restaurante */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-[2.5rem] border shadow-xs flex flex-col gap-4 justify-between transition-all"
          style={{ 
            backgroundColor: surface, 
            borderColor: border,
            borderRadius: cardRadius
          }}
        >
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-3xl font-black tracking-tight" style={{ color: textMain }}>{restaurante.nombre}</h1>
              {restaurante.config_diseno?.informacion?.ambiente && (
                <span 
                  className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider"
                  style={{ backgroundColor: `${primary}1a`, color: primary, border: `1px solid ${primary}20` }}
                >
                  Concepto: {restaurante.config_diseno.informacion.ambiente}
                </span>
              )}
            </div>
            {restaurante.descripcion && (
              <p className="text-[13px] leading-relaxed max-w-xl" style={{ color: textSub }}>
                {restaurante.descripcion}
              </p>
            )}
            {restaurante.config_diseno?.informacion?.direccion && (
              <div className="flex items-center gap-1.5 text-[12px] font-medium" style={{ color: textMuted }}>
                <span className="text-sm">📍</span>
                <span>{restaurante.config_diseno.informacion.direccion}</span>
              </div>
            )}
          </div>
        </motion.div>

        {restaurante.banner_promocional_activo && restaurante.banner_promocional_texto && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-3xl flex items-center gap-3 border shadow-xs"
            style={{ 
              backgroundColor: `${primary}10`, 
              borderColor: `${primary}20`,
              color: textMain,
              borderRadius: cardRadius
            }}
          >
            <span className="text-xl">📢</span>
            <div className="text-[13px] font-bold tracking-tight leading-relaxed">
              {restaurante.banner_promocional_texto}
            </div>
          </motion.div>
        )}

        {categorias.map((cat: Categoria) => (
          <section key={cat.id} id={`cat-${cat.id}`} className="pt-6">
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
              layoutType === 'LISTA_SIMPLE'       ? 'flex flex-col' :
              layoutType === 'CUADRICULA_FOTOS'   ? 'grid grid-cols-2 sm:grid-cols-3 gap-4' :
              'flex flex-col gap-5'
            }>
              {cat.platillos.map((p: Platillo, i: number) => (
                <PlatilloCard
                  key={p.id}
                  platillo={p}
                  layout={layoutType}
                  index={i}
                  themeOptions={{
                    primary,
                    textMain,
                    textSub,
                    textMuted,
                    surface,
                    surfaceHover,
                    border,
                    priceBadge,
                    dark,
                    btnRadius,
                    cardRadius,
                    isGlass,
                    blurVal,
                    showShadow,
                    badgeColor: elementos.badge_color || '#ffbe0b'
                  }}
                />
              ))}
            </div>
          </section>
        ))}
      </main>

      {/* ── FOOTER ── */}
      <footer className="mt-20 py-10 text-center" style={{ borderTop: `1px solid ${border}` }}>
        {restaurante.config_diseno?.informacion?.direccion && (
          <p className="text-[12px] font-medium mb-4 max-w-md mx-auto px-5" style={{ color: textSub }}>
            📍 {restaurante.config_diseno.informacion.direccion}
          </p>
        )}
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

interface ThemeOptions {
  primary: string; textMain: string; textSub: string; textMuted: string;
  surface: string; surfaceHover: string; border: string; priceBadge: string; dark: boolean;
  btnRadius: string; cardRadius: string; isGlass: boolean; blurVal: string; showShadow: boolean;
  badgeColor: string;
}

function PlatilloCard({ platillo, layout, index, themeOptions }: {
  platillo: Platillo; layout: string; index: number; themeOptions: ThemeOptions;
}) {
  const { 
    primary, textMain, textSub, textMuted, surface, surfaceHover, border, priceBadge, 
    dark, btnRadius, cardRadius, isGlass, blurVal, showShadow, badgeColor 
  } = themeOptions;

  const anim = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { delay: index * 0.05, duration: 0.45 } },
  };

  const Placeholder = () => (
    <div className="w-full h-full flex items-center justify-center text-4xl" style={{ backgroundColor: `${primary}12` }}>
      🍽️
    </div>
  );

  // Auto-detección inteligente de etiquetas
  const detectBadge = () => {
    const desc = platillo.descripcion?.toLowerCase() || '';
    const name = platillo.nombre?.toLowerCase() || '';
    if (desc.includes('nuevo') || name.includes('nuevo')) return 'Nuevo';
    if (desc.includes('oferta') || name.includes('oferta') || desc.includes('descuento') || desc.includes('promo')) return 'Oferta';
    if (desc.includes('🌶️') || desc.includes('picante') || name.includes('🌶️') || desc.includes('jalapeño') || desc.includes('chile')) return 'Picante';
    return null;
  };
  const badgeLabel = detectBadge();

  // ── LISTA SIMPLE ──
  if (layout === 'LISTA_SIMPLE') {
    return (
      <motion.div
        variants={anim} initial="hidden" whileInView="visible" viewport={{ once: true }}
        className="flex items-center justify-between py-4 px-3 transition-colors duration-200 group relative overflow-hidden"
        style={{ 
          color: textMain, 
          borderBottom: `1px solid ${border}`,
          borderRadius: btnRadius
        }}
        onMouseEnter={e => (e.currentTarget.style.backgroundColor = surface)}
        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
      >
        {platillo.url_imagen && (
          <img src={platillo.url_imagen} alt={platillo.nombre} className="w-14 h-14 object-cover flex-shrink-0 mr-4" style={{ borderRadius: btnRadius }} />
        )}
        <div className="flex-1 min-w-0 pr-4">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-[15px] truncate" style={{ color: textMain }}>{platillo.nombre}</h3>
            {badgeLabel && (
              <span className="px-1.5 py-0.5 rounded-full text-[8px] font-black text-white uppercase tracking-wider scale-90" style={{ backgroundColor: badgeColor }}>
                {badgeLabel}
              </span>
            )}
          </div>
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
        className="group flex flex-col gap-2.5 transition-transform hover:scale-[1.01]"
      >
        <div 
          className="aspect-square overflow-hidden relative transition-all duration-300" 
          style={{ 
            border: `1px solid ${border}`,
            borderRadius: cardRadius,
            boxShadow: showShadow ? '0 6px 16px -4px rgba(0,0,0,0.12)' : 'none',
            backgroundColor: surface
          }}
        >
          {platillo.url_imagen
            ? <img src={platillo.url_imagen} alt={platillo.nombre} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            : <Placeholder />
          }
          {badgeLabel && (
            <div 
              className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-[8px] font-black text-white uppercase tracking-widest shadow-sm" 
              style={{ backgroundColor: badgeColor }}
            >
              {badgeLabel}
            </div>
          )}
          <div
            className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-full text-[12px] font-bold backdrop-blur-md shadow-sm"
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
      className="flex flex-col sm:flex-row gap-5 p-5 group transition-all duration-300 relative overflow-hidden"
      style={{ 
        backgroundColor: surface, 
        border: `1px solid ${border}`,
        borderRadius: cardRadius,
        boxShadow: showShadow ? '0 10px 30px -10px rgba(0,0,0,0.15)' : 'none',
        backdropFilter: isGlass ? `blur(${blurVal})` : 'none',
        WebkitBackdropFilter: isGlass ? `blur(${blurVal})` : 'none'
      }}
      onMouseEnter={e => (e.currentTarget.style.backgroundColor = surfaceHover)}
      onMouseLeave={e => (e.currentTarget.style.backgroundColor = surface)}
    >
      {badgeLabel && (
        <div 
          className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[8px] font-black text-white uppercase tracking-widest shadow-sm" 
          style={{ backgroundColor: badgeColor }}
        >
          {badgeLabel}
        </div>
      )}

      <div
        className="w-full sm:w-44 h-44 overflow-hidden flex-shrink-0 transition-all"
        style={{ 
          border: `1px solid ${border}`,
          borderRadius: `calc(${cardRadius} - 8px)`
        }}
      >
        {platillo.url_imagen
          ? <img src={platillo.url_imagen} alt={platillo.nombre} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          : <Placeholder />
        }
      </div>

      <div className="flex-1 flex flex-col justify-between py-1">
        <div>
          <h3 className="text-[1.15rem] font-black tracking-tight mb-2 pr-12" style={{ color: textMain }}>
            {platillo.nombre}
          </h3>
          <p className="text-[13px] leading-relaxed mb-3" style={{ color: textSub }}>
            {platillo.descripcion}
          </p>

          {/* Ingredientes Principales */}
          {platillo.ingredientes_principales && platillo.ingredientes_principales.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2.5 items-center">
              <span className="text-[9px] font-black tracking-wider uppercase opacity-60 mr-1">Ingredientes:</span>
              {platillo.ingredientes_principales.map((ing, idx) => (
                <span 
                  key={idx} 
                  className="px-2 py-0.5 rounded-md text-[9px] font-bold"
                  style={{ backgroundColor: `${primary}12`, color: primary, border: `1px solid ${primary}20` }}
                >
                  {ing}
                </span>
              ))}
            </div>
          )}

          {/* Complementos Opcionales */}
          {platillo.complementos && platillo.complementos.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3 items-center">
              <span className="text-[9px] font-black tracking-wider uppercase opacity-60 mr-1">Extras:</span>
              {platillo.complementos.map((comp, idx) => (
                <span 
                  key={idx} 
                  className="px-2 py-0.5 rounded-md text-[9px] font-bold"
                  style={{ backgroundColor: `${textMuted}1c`, color: textSub, border: `1px solid ${border}` }}
                >
                  {comp}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center justify-between mt-4">
          <span
            className="text-[1.3rem] font-black"
            style={{ color: primary }}
          >
            ${platillo.precio}
          </span>
          <span
            className="px-3 py-1 rounded-full text-[11px] font-semibold transition-all"
            style={{ 
              backgroundColor: priceBadge, 
              color: textSub, 
              border: `1px solid ${border}`,
              borderRadius: btnRadius
            }}
          >
            Disponible
          </span>
        </div>
      </div>
    </motion.div>
  );
}
