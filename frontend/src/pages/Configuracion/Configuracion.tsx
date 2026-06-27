import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HexColorPicker } from 'react-colorful';
import { restauranteService } from '../../services/restaurante';
import { Palette, Layout, Type, Globe, CheckCircle2, AlertCircle, Upload, Image as ImageIcon, Moon, Sun, Sliders, Sparkles, Eye, EyeOff, Megaphone, MapPin, Store } from 'lucide-react';

const LAYOUTS = [
  { value: 'LISTA_SIMPLE', icon: '📋', label: 'Lista simple', desc: 'Minimalista y directo' },
  { value: 'CUADRICULA_FOTOS', icon: '🖼️', label: 'Cuadrícula', desc: 'Visual e impactante' },
  { value: 'TARJETAS_DETALLADAS', icon: '✨', label: 'Tarjetas', desc: 'Experiencia premium' },
];

const FUENTES = [
  { value: 'Sans-Serif', label: 'Sans-Serif', preview: 'Aa' },
  { value: 'Serif', label: 'Serif', preview: 'Aa' },
  { value: 'Mono', label: 'Mono', preview: 'Aa' },
  { value: 'Poppins', label: 'Poppins', preview: 'Aa' },
  { value: 'Outfit', label: 'Outfit', preview: 'Aa' },
];

// Presets de gradientes modernos
const PRESETS_GRADIENTES = [
  { name: 'Fuego Mexicano', value: 'linear-gradient(135deg, #FF416C 0%, #FF4B2B 100%)' },
  { name: 'Noche Oscura', value: 'linear-gradient(135deg, #111827 0%, #030712 100%)' },
  { name: 'Atardecer Dorado', value: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' },
  { name: 'Menta Fresca', value: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' },
  { name: 'Elegancia Azul', value: 'linear-gradient(135deg, #1d4ed8 0%, #1e3a8a 100%)' },
  { name: 'Rosa Cacao', value: 'linear-gradient(135deg, #db2777 0%, #9d174d 100%)' },
  { name: 'Aurora Boreal', value: 'linear-gradient(135deg, #0284c7 0%, #10b981 100%)' },
  { name: 'Atardecer Morado', value: 'linear-gradient(135deg, #7c3aed 0%, #db2777 100%)' },
  { name: 'Caramelo Dulce', value: 'linear-gradient(135deg, #f97316 0%, #e11d48 100%)' },
];

const extraerColoresDeGradiente = (gradientStr: string) => {
  if (!gradientStr) return { color1: '#FF416C', color2: '#FF4B2B' };
  const hexColors = gradientStr.match(/#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}/g);
  if (hexColors && hexColors.length >= 2) {
    return { color1: hexColors[0], color2: hexColors[1] };
  }
  return { color1: '#FF416C', color2: '#FF4B2B' };
};

function isColorDark(hex: string): boolean {
  const clean = hex.replace('#', '');
  if (clean.length < 6) return true;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
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

export function Configuracion() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [showPicker, setShowPicker] = useState<'primario' | 'fondo' | 'badge' | 'texto' | 'text_hover' | 'descripcion' | null>(null);
  const [success, setSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [gradienteColor1, setGradienteColor1] = useState('#FF416C');
  const [gradienteColor2, setGradienteColor2] = useState('#FF4B2B');
  const [gradienteAngulo, setGradienteAngulo] = useState('135deg');

  const handleGradientColorChange = (c1: string, c2: string, angulo: string) => {
    const nuevoGradiente = `linear-gradient(${angulo}, ${c1} 0%, ${c2} 100%)`;
    updateDisenoApariencia('fondo_valor', nuevoGradiente);
  };

  const [theme, setTheme] = useState<any>({
    logo_url: '',
    color_primario: '#2997FF',
    color_fondo: '#000000',
    fuente_familia: 'Sans-Serif',
    layout_type: 'TARJETAS_DETALLADAS',
    banner_promocional_activo: false,
    banner_promocional_texto: '',
    config_diseno: {
      apariencia: {
        fondo_tipo: 'solido',
        fondo_valor: '#000000',
        fondo_blur: '0px',
        fuente_familia: 'Sans-Serif',
        color_normal: '#ffffff',
        color_descripcion: '#8e8e93',
        color_hover: '#e63946',
        color_primario: '#2997FF',
        color_fondo: '#000000',
        modo_oscuro: true,
        border_radius_botones: '12px',
        border_radius_tarjetas: '24px'
      },
      layout: {
        layout_type: 'TARJETAS_DETALLADAS',
        categorias_sticky: true
      },
      elementos_visuales: {
        glassmorphism: false,
        sombras_habilitadas: true,
        badge_color: '#ffbe0b'
      },
      informacion: {
        direccion: '',
        ambiente: 'Familiar'
      }
    }
  });

  useEffect(() => {
    cargarConfiguracion();
    
    // Inyectar fuentes dinámicas en la página de admin para la vista previa
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&family=Outfit:wght@300;400;500;600;700;800;900&display=swap';
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  const cargarConfiguracion = async () => {
    setLoading(true);
    try {
      const data = await restauranteService.getRestauranteInfo();
      const config = data.config_diseno || {};
      const apariencia = config.apariencia || {};
      const layout = config.layout || {};
      const elementos = config.elementos_visuales || {};

      const primario = data.color_primario || '#2997FF';
      const fondo = data.color_fondo || '#000000';
      const fuente = data.fuente_familia || 'Sans-Serif';
      const layoutType = data.layout_type || 'TARJETAS_DETALLADAS';
      const dark = apariencia.modo_oscuro !== undefined ? apariencia.modo_oscuro : isColorDark(fondo);

      setTheme({
        logo_url: data.logo_url || '',
        color_primario: primario,
        color_fondo: fondo,
        fuente_familia: fuente,
        layout_type: layoutType,
        banner_promocional_activo: data.banner_promocional_activo ?? false,
        banner_promocional_texto: data.banner_promocional_texto || '',
        config_diseno: {
          apariencia: {
            fondo_tipo: apariencia.fondo_tipo || 'solido',
            fondo_valor: apariencia.fondo_valor || fondo,
            fondo_blur: apariencia.fondo_blur || '0px',
            fuente_familia: apariencia.fuente_familia || fuente,
            color_normal: apariencia.color_normal || (dark ? '#ffffff' : '#1D1D1F'),
            color_descripcion: apariencia.color_descripcion || '#8e8e93',
            color_hover: apariencia.color_hover || '#e63946',
            color_primario: apariencia.color_primario || primario,
            color_fondo: apariencia.color_fondo || fondo,
            modo_oscuro: dark,
            border_radius_botones: apariencia.border_radius_botones || '12px',
            border_radius_tarjetas: apariencia.border_radius_tarjetas || '24px'
          },
          layout: {
            layout_type: layout.layout_type || layoutType,
            categorias_sticky: layout.categorias_sticky !== undefined ? layout.categorias_sticky : true
          },
          elementos_visuales: {
            glassmorphism: elementos.glassmorphism || false,
            sombras_habilitadas: elementos.sombras_habilitadas !== undefined ? elementos.sombras_habilitadas : true,
            badge_color: elementos.badge_color || '#ffbe0b'
          },
          informacion: {
            direccion: config.informacion?.direccion || '',
            ambiente: config.informacion?.ambiente || 'Familiar'
          }
        }
      });

      const fondoValor = apariencia.fondo_valor || fondo;
      if (apariencia.fondo_tipo === 'gradiente' && fondoValor && fondoValor.startsWith('linear-gradient')) {
        const { color1, color2 } = extraerColoresDeGradiente(fondoValor);
        setGradienteColor1(color1);
        setGradienteColor2(color2);
        const anguloMatch = fondoValor.match(/\d+deg/);
        if (anguloMatch) {
          setGradienteAngulo(anguloMatch[0]);
        }
      }
    } catch (error) {
      console.error('Error cargando configuración:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateDisenoApariencia = (key: string, value: any) => {
    setTheme((prev: any) => {
      const config = prev.config_diseno || { apariencia: {}, layout: {}, elementos_visuales: {} };
      const apariencia = { ...config.apariencia, [key]: value };
      
      let extra: any = {};
      if (key === 'color_primario') extra.color_primario = value;
      if (key === 'color_fondo') extra.color_fondo = value;
      if (key === 'fuente_familia') extra.fuente_familia = value;
      if (key === 'fondo_valor' && apariencia.fondo_tipo === 'solido') extra.color_fondo = value;

      return {
        ...prev,
        ...extra,
        config_diseno: {
          ...config,
          apariencia
        }
      };
    });
  };

  const updateDisenoLayout = (key: string, value: any) => {
    setTheme((prev: any) => {
      const config = prev.config_diseno || { apariencia: {}, layout: {}, elementos_visuales: {} };
      const layout = { ...config.layout, [key]: value };
      
      let extra: any = {};
      if (key === 'layout_type') extra.layout_type = value;

      return {
        ...prev,
        ...extra,
        config_diseno: {
          ...config,
          layout
        }
      };
    });
  };

  const updateDisenoElementos = (key: string, value: any) => {
    setTheme((prev: any) => {
      const config = prev.config_diseno || { apariencia: {}, layout: {}, elementos_visuales: {} };
      const elementos = { ...config.elementos_visuales, [key]: value };

      return {
        ...prev,
        config_diseno: {
          ...config,
          elementos_visuales: elementos
        }
      };
    });
  const updateInformacion = (key: string, value: any) => {
    setTheme((prev: any) => {
      const config = prev.config_diseno || { apariencia: {}, layout: {}, elementos_visuales: {}, informacion: {} };
      const informacion = { ...config.informacion, [key]: value };
      return {
        ...prev,
        config_diseno: {
          ...config,
          informacion
        }
      };
    });
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const res = await restauranteService.uploadBrandingImage(file);
      if (res.url_imagen) {
        setTheme((prev: any) => ({ ...prev, logo_url: res.url_imagen }));
      }
    } catch (error) {
      console.error('Error al subir logo:', error);
      alert('Hubo un error al subir la imagen. Intenta de nuevo.');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setSaveError('');
    try {
      await restauranteService.updateTheme(theme);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error: any) {
      const msg = error?.response?.data?.mensaje || '';
      setSaveError(msg || 'Error al guardar. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <motion.div 
          className="text-5xl" 
          animate={{ rotate: 360, scale: [1, 1.2, 1] }} 
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          🎨
        </motion.div>
      </div>
    );
  }

  return (
    <div className="py-12 px-6 lg:px-12 max-w-[1400px] mx-auto min-h-screen">
      <div className="flex flex-col xl:flex-row gap-16">
        
        {/* Settings Column */}
        <div className="flex-1 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2 text-apple-text dark:text-apple-dark-text">Identidad Visual</h1>
            <p className="text-lg text-apple-text-secondary dark:text-apple-dark-text-secondary font-medium">
              Define el estilo único de tu menú digital.
            </p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-12">
            
            {/* Branding / Logo */}
            <section className="p-8 rounded-[2.5rem] bg-apple-bg-secondary dark:bg-apple-dark-bg-secondary border border-apple-border dark:border-apple-dark-border shadow-apple-sm">
              <h3 className="text-[11px] font-bold text-apple-blue tracking-[0.2em] uppercase mb-8 flex items-center gap-2">
                <ImageIcon size={16} /> Logotipo del Negocio
              </h3>
              
              <div className="flex items-center gap-8">
                <div className="relative w-32 h-32 rounded-3xl bg-apple-bg dark:bg-apple-dark-bg border-2 border-dashed border-apple-border dark:border-apple-dark-border flex items-center justify-center overflow-hidden group">
                  {theme.logo_url ? (
                    <img src={theme.logo_url} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl opacity-50">🏪</span>
                  )}
                  
                  <div className={`absolute inset-0 bg-black/50 flex flex-col items-center justify-center transition-opacity ${theme.logo_url ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      ref={fileInputRef}
                      onChange={handleLogoUpload}
                    />
                    <button 
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="p-3 bg-white/20 hover:bg-white/30 rounded-full text-white backdrop-blur-sm transition-colors"
                      disabled={uploadingLogo}
                    >
                      {uploadingLogo ? (
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                          <Upload size={20} />
                        </motion.div>
                      ) : (
                        <Upload size={20} />
                      )}
                    </button>
                    {!theme.logo_url && <span className="text-xs text-white font-medium mt-2">Subir logo</span>}
                  </div>
                </div>
                
                <div className="flex-1 space-y-2">
                  <h4 className="text-base font-bold">Logo principal</h4>
                  <p className="text-sm text-apple-text-secondary">Recomendado: 500x500px, formato PNG o JPG transparente. Se mostrará en el encabezado de tu menú digital.</p>
                  {theme.logo_url && (
                    <button 
                      type="button" 
                      onClick={() => setTheme((prev: any) => ({ ...prev, logo_url: '' }))}
                      className="text-sm text-red-500 hover:text-red-600 font-medium"
                    >
                      Eliminar logo
                    </button>
                  )}
                </div>
              </div>
            </section>

            {/* Personalización Estética Avanzada */}
            
            {/* 1. Colores y Fondos */}
            <section className="p-8 rounded-[2.5rem] bg-apple-bg-secondary dark:bg-apple-dark-bg-secondary border border-apple-border dark:border-apple-dark-border shadow-apple-sm space-y-8">
              <div className="flex items-center justify-between border-b border-apple-border dark:border-apple-dark-border pb-4">
                <h3 className="text-[11px] font-bold text-apple-blue tracking-[0.2em] uppercase flex items-center gap-2">
                  <Palette size={16} /> Colores & Fondo
                </h3>
                {/* Switch Modo Claro / Oscuro */}
                <div className="flex items-center gap-2 bg-apple-bg dark:bg-apple-dark-bg border border-apple-border dark:border-apple-dark-border rounded-full p-1 shadow-apple-xs">
                  <button
                    type="button"
                    onClick={() => {
                      const isDark = false;
                      const config = theme.config_diseno || { apariencia: {} };
                      updateDisenoApariencia('modo_oscuro', isDark);
                      updateDisenoApariencia('color_normal', '#1D1D1F');
                      if (config.apariencia?.fondo_tipo === 'solido') {
                        updateDisenoApariencia('color_fondo', '#FFFFFF');
                        updateDisenoApariencia('fondo_valor', '#FFFFFF');
                      }
                    }}
                    className={`p-2 rounded-full transition-all ${!theme.config_diseno?.apariencia?.modo_oscuro ? 'bg-apple-blue text-white shadow-apple-sm' : 'text-apple-text-secondary opacity-60'}`}
                  >
                    <Sun size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const isDark = true;
                      const config = theme.config_diseno || { apariencia: {} };
                      updateDisenoApariencia('modo_oscuro', isDark);
                      updateDisenoApariencia('color_normal', '#ffffff');
                      if (config.apariencia?.fondo_tipo === 'solido') {
                        updateDisenoApariencia('color_fondo', '#000000');
                        updateDisenoApariencia('fondo_valor', '#000000');
                      }
                    }}
                    className={`p-2 rounded-full transition-all ${theme.config_diseno?.apariencia?.modo_oscuro ? 'bg-apple-blue text-white shadow-apple-sm' : 'text-apple-text-secondary opacity-60'}`}
                  >
                    <Moon size={14} />
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Color primario */}
                <div className="space-y-3">
                  <label className="text-sm font-bold text-apple-text-secondary ml-1">Color de Acento (Botones/Picante)</label>
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-apple-bg dark:bg-apple-dark-bg border border-apple-border dark:border-apple-dark-border shadow-apple-sm group hover:border-apple-blue/50 transition-colors">
                    <button
                      type="button"
                      onClick={() => setShowPicker(showPicker === 'primario' ? null : 'primario')}
                      className="w-12 h-12 rounded-xl shadow-apple-md border border-white/20 transition-transform active:scale-95 flex-shrink-0"
                      style={{ backgroundColor: theme.color_primario }}
                    />
                    <div className="flex flex-col">
                      <span className="font-mono text-sm font-bold tracking-widest uppercase">{theme.color_primario}</span>
                      <span className="text-[10px] text-apple-text-tertiary">Botones y acentos visuales</span>
                    </div>
                  </div>
                </div>

                {/* Color del texto del menú */}
                <div className="space-y-3">
                  <label className="text-sm font-bold text-apple-text-secondary ml-1">Color del Texto del Menú</label>
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-apple-bg dark:bg-apple-dark-bg border border-apple-border dark:border-apple-dark-border shadow-apple-sm group hover:border-apple-blue/50 transition-colors">
                    <button
                      type="button"
                      onClick={() => setShowPicker(showPicker === 'texto' ? null : 'texto')}
                      className="w-12 h-12 rounded-xl shadow-apple-md border border-white/20 transition-transform active:scale-95 flex-shrink-0"
                      style={{ backgroundColor: theme.config_diseno?.apariencia?.color_normal || '#ffffff' }}
                    />
                    <div className="flex flex-col">
                      <span className="font-mono text-sm font-bold tracking-widest uppercase">{theme.config_diseno?.apariencia?.color_normal || '#ffffff'}</span>
                      <span className="text-[10px] text-apple-text-tertiary">Títulos y textos principales</span>
                    </div>
                  </div>
                </div>

                {/* Color de las descripciones */}
                <div className="space-y-3">
                  <label className="text-sm font-bold text-apple-text-secondary ml-1">Color de Descripciones</label>
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-apple-bg dark:bg-apple-dark-bg border border-apple-border dark:border-apple-dark-border shadow-apple-sm group hover:border-apple-blue/50 transition-colors">
                    <button
                      type="button"
                      onClick={() => setShowPicker(showPicker === 'descripcion' ? null : 'descripcion')}
                      className="w-12 h-12 rounded-xl shadow-apple-md border border-white/20 transition-transform active:scale-95 flex-shrink-0"
                      style={{ backgroundColor: theme.config_diseno?.apariencia?.color_descripcion || '#8e8e93' }}
                    />
                    <div className="flex flex-col">
                      <span className="font-mono text-sm font-bold tracking-widest uppercase">{theme.config_diseno?.apariencia?.color_descripcion || '#8E8E93'}</span>
                      <span className="text-[10px] text-apple-text-tertiary">Descripciones y textos secundarios</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tipo de Fondo */}
              <div className="space-y-4">
                <label className="text-sm font-bold text-apple-text-secondary ml-1">Tipo de Fondo del Menú</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      updateDisenoApariencia('fondo_tipo', 'solido');
                      updateDisenoApariencia('fondo_valor', theme.color_fondo);
                    }}
                    className={`py-3.5 px-6 rounded-2xl border-2 font-bold text-sm transition-all ${
                      theme.config_diseno?.apariencia?.fondo_tipo === 'solido'
                        ? 'border-apple-blue bg-apple-blue/5 text-apple-blue'
                        : 'border-apple-border dark:border-apple-dark-border bg-apple-bg dark:bg-apple-dark-bg text-apple-text-secondary'
                    }`}
                  >
                    Color Sólido
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      updateDisenoApariencia('fondo_tipo', 'gradiente');
                      updateDisenoApariencia('fondo_valor', PRESETS_GRADIENTES[0].value);
                    }}
                    className={`py-3.5 px-6 rounded-2xl border-2 font-bold text-sm transition-all ${
                      theme.config_diseno?.apariencia?.fondo_tipo === 'gradiente'
                        ? 'border-apple-blue bg-apple-blue/5 text-apple-blue'
                        : 'border-apple-border dark:border-apple-dark-border bg-apple-bg dark:bg-apple-dark-bg text-apple-text-secondary'
                    }`}
                  >
                    Degradado Premium
                  </button>
                </div>
              </div>

              {/* Selector de fondo específico */}
              {theme.config_diseno?.apariencia?.fondo_tipo === 'solido' ? (
                <div className="space-y-3">
                  <label className="text-sm font-bold text-apple-text-secondary ml-1 font-medium">Color de Fondo</label>
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-apple-bg dark:bg-apple-dark-bg border border-apple-border dark:border-apple-dark-border shadow-apple-sm group hover:border-apple-blue/50 transition-colors">
                    <button
                      type="button"
                      onClick={() => setShowPicker(showPicker === 'fondo' ? null : 'fondo')}
                      className="w-12 h-12 rounded-xl shadow-apple-md border border-white/20 transition-transform active:scale-95 flex-shrink-0"
                      style={{ backgroundColor: theme.color_fondo }}
                    />
                    <div className="flex flex-col">
                      <span className="font-mono text-sm font-bold tracking-widest uppercase">{theme.color_fondo}</span>
                      <span className="text-[10px] text-apple-text-tertiary">Color base del fondo del menú</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 pt-2">
                  <label className="text-sm font-bold text-apple-text-secondary ml-1">Degradados Predeterminados</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {PRESETS_GRADIENTES.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => updateDisenoApariencia('fondo_valor', preset.value)}
                        className={`h-16 rounded-xl border-2 transition-all text-left p-3 relative flex items-end ${
                          theme.config_diseno?.apariencia?.fondo_valor === preset.value
                            ? 'border-apple-blue ring-2 ring-apple-blue/30 scale-[1.02]'
                            : 'border-transparent hover:scale-[1.01]'
                        }`}
                        style={{ background: preset.value }}
                      >
                        <span className="text-[10px] font-black text-white bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-xs">
                          {preset.name}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="space-y-4 pt-4 border-t border-apple-border dark:border-apple-dark-border mt-4">
                    <label className="text-sm font-bold text-apple-text-secondary ml-1">Diseña tu Degradado Personalizado</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <span className="text-xs text-apple-text-tertiary ml-1 font-medium">Color Inicial</span>
                        <div className="flex items-center gap-3 p-3 rounded-2xl bg-apple-bg dark:bg-apple-dark-bg border border-apple-border dark:border-apple-dark-border shadow-apple-sm">
                          <input 
                            type="color" 
                            value={gradienteColor1}
                            onChange={(e) => {
                              const newColor = e.target.value;
                              setGradienteColor1(newColor);
                              handleGradientColorChange(newColor, gradienteColor2, gradienteAngulo);
                            }}
                            className="w-12 h-12 rounded-xl cursor-pointer border border-apple-border dark:border-apple-dark-border bg-transparent flex-shrink-0"
                          />
                          <span className="font-mono text-sm uppercase font-bold tracking-widest">{gradienteColor1}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <span className="text-xs text-apple-text-tertiary ml-1 font-medium">Color Final</span>
                        <div className="flex items-center gap-3 p-3 rounded-2xl bg-apple-bg dark:bg-apple-dark-bg border border-apple-border dark:border-apple-dark-border shadow-apple-sm">
                          <input 
                            type="color" 
                            value={gradienteColor2}
                            onChange={(e) => {
                              const newColor = e.target.value;
                              setGradienteColor2(newColor);
                              handleGradientColorChange(gradienteColor1, newColor, gradienteAngulo);
                            }}
                            className="w-12 h-12 rounded-xl cursor-pointer border border-apple-border dark:border-apple-dark-border bg-transparent flex-shrink-0"
                          />
                          <span className="font-mono text-sm uppercase font-bold tracking-widest">{gradienteColor2}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div className="space-y-2">
                        <span className="text-xs text-apple-text-tertiary ml-1 font-medium">Dirección / Ángulo</span>
                        <select
                          value={gradienteAngulo}
                          onChange={(e) => {
                            const newAngle = e.target.value;
                            setGradienteAngulo(newAngle);
                            handleGradientColorChange(gradienteColor1, gradienteColor2, newAngle);
                          }}
                          className="w-full px-4 py-3.5 rounded-2xl bg-apple-bg dark:bg-apple-dark-bg border border-apple-border dark:border-apple-dark-border text-sm font-bold shadow-apple-sm outline-none focus:border-apple-blue"
                        >
                          <option value="135deg">Diagonal (Derecha abajo)</option>
                          <option value="45deg">Diagonal (Derecha arriba)</option>
                          <option value="90deg">Horizontal (Derecha)</option>
                          <option value="180deg">Vertical (Abajo)</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <span className="text-xs text-apple-text-tertiary ml-1 font-medium">Previsualización</span>
                        <div 
                          className="h-[46px] w-full rounded-2xl border border-apple-border dark:border-apple-dark-border shadow-inner"
                          style={{ background: `linear-gradient(${gradienteAngulo}, ${gradienteColor1} 0%, ${gradienteColor2} 100%)` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Color Pickers Popup Animados */}
              <AnimatePresence>
                {showPicker && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-6 flex flex-col items-center p-6 rounded-3xl bg-apple-bg dark:bg-apple-dark-bg border border-apple-border dark:border-apple-dark-border"
                  >
                    <HexColorPicker
                      color={
                        showPicker === 'primario' ? theme.color_primario :
                        showPicker === 'fondo' ? theme.color_fondo :
                        showPicker === 'texto' ? (theme.config_diseno?.apariencia?.color_normal || '#ffffff') :
                        showPicker === 'descripcion' ? (theme.config_diseno?.apariencia?.color_descripcion || '#8e8e93') :
                        showPicker === 'badge' ? (theme.config_diseno?.elementos_visuales?.badge_color || '#ffbe0b') :
                        '#ffffff'
                      }
                      onChange={(color) => {
                        if (showPicker === 'primario') {
                           updateDisenoApariencia('color_primario', color);
                        } else if (showPicker === 'fondo') {
                          updateDisenoApariencia('color_fondo', color);
                          if (theme.config_diseno?.apariencia?.fondo_tipo === 'solido') {
                            updateDisenoApariencia('fondo_valor', color);
                          }
                        } else if (showPicker === 'texto') {
                          updateDisenoApariencia('color_normal', color);
                        } else if (showPicker === 'descripcion') {
                          updateDisenoApariencia('color_descripcion', color);
                        } else if (showPicker === 'badge') {
                          updateDisenoElementos('badge_color', color);
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPicker(null)}
                      className="mt-4 px-4 py-1.5 bg-apple-blue text-white rounded-full text-xs font-bold"
                    >
                      Listo
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            {/* 2. Estructura y Comportamiento (Layout) */}
            <section className="p-8 rounded-[2.5rem] bg-apple-bg-secondary dark:bg-apple-dark-bg-secondary border border-apple-border dark:border-apple-dark-border shadow-apple-sm space-y-6">
              <h3 className="text-[11px] font-bold text-apple-blue tracking-[0.2em] uppercase flex items-center gap-2 border-b border-apple-border dark:border-apple-dark-border pb-4">
                <Layout size={16} /> Estructura del Menú
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {LAYOUTS.map((layout) => (
                  <button
                    key={layout.value}
                    type="button"
                    onClick={() => {
                      setTheme((prev: any) => ({ ...prev, layout_type: layout.value }));
                      updateDisenoLayout('layout_type', layout.value);
                    }}
                    className={`p-6 rounded-3xl border-2 transition-all text-center flex flex-col items-center gap-3 active:scale-95 ${
                      theme.layout_type === layout.value
                        ? 'border-apple-blue bg-apple-blue/5 shadow-apple-glow'
                        : 'border-apple-border dark:border-apple-dark-border bg-apple-bg dark:bg-apple-dark-bg text-apple-text-secondary hover:border-apple-blue/30'
                    }`}
                  >
                    <div className="text-3xl mb-1">{layout.icon}</div>
                    <div>
                      <div className={`text-sm font-bold ${theme.layout_type === layout.value ? 'text-apple-blue' : 'text-apple-text'}`}>{layout.label}</div>
                      <div className="text-[10px] font-bold uppercase tracking-wider opacity-60 mt-1">{layout.desc}</div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Categorías Sticky */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-apple-bg dark:bg-apple-dark-bg border border-apple-border dark:border-apple-dark-border mt-4">
                <div className="space-y-1 pr-4">
                  <h4 className="text-sm font-bold">Barra de Categorías Flotante (Sticky)</h4>
                  <p className="text-xs text-apple-text-secondary">Permite que el menú de categorías se quede pegado arriba al hacer scroll para un rápido acceso.</p>
                </div>
                <button
                  type="button"
                  onClick={() => updateDisenoLayout('categorias_sticky', !theme.config_diseno?.layout?.categorias_sticky)}
                  className={`w-14 h-8 rounded-full transition-colors relative flex items-center px-1 flex-shrink-0 ${
                    theme.config_diseno?.layout?.categorias_sticky ? 'bg-apple-blue' : 'bg-apple-border dark:bg-apple-dark-border'
                  }`}
                >
                  <motion.div
                    layout
                    className="w-6 h-6 rounded-full bg-white shadow-apple-sm"
                    animate={{ x: theme.config_diseno?.layout?.categorias_sticky ? 24 : 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>
            </section>

            {/* 3. Componentes y Bordes */}
            <section className="p-8 rounded-[2.5rem] bg-apple-bg-secondary dark:bg-apple-dark-bg-secondary border border-apple-border dark:border-apple-dark-border shadow-apple-sm space-y-8">
              <h3 className="text-[11px] font-bold text-apple-blue tracking-[0.2em] uppercase flex items-center gap-2 border-b border-apple-border dark:border-apple-dark-border pb-4">
                <Sliders size={16} /> Estilo de Componentes
              </h3>

              {/* Redondeado Botones */}
              <div className="space-y-4">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-sm font-bold text-apple-text-secondary">Esquinas de Botones</label>
                  <span className="text-xs font-mono font-bold bg-apple-bg dark:bg-apple-dark-bg border border-apple-border dark:border-apple-dark-border px-2 py-0.5 rounded-md">
                    {theme.config_diseno?.apariencia?.border_radius_botones === '0px' ? 'Recto (0px)' :
                     theme.config_diseno?.apariencia?.border_radius_botones === '8px' ? 'Suave (8px)' :
                     theme.config_diseno?.apariencia?.border_radius_botones === '16px' ? 'Redondo (16px)' : 'Circular (Píldora)'}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: 'Recto', value: '0px' },
                    { label: 'Suave', value: '8px' },
                    { label: 'Fuerte', value: '16px' },
                    { label: 'Píldora', value: '9999px' }
                  ].map((btn) => (
                    <button
                      key={btn.value}
                      type="button"
                      onClick={() => updateDisenoApariencia('border_radius_botones', btn.value)}
                      className={`py-3.5 px-2 rounded-xl text-xs font-bold transition-all border ${
                        theme.config_diseno?.apariencia?.border_radius_botones === btn.value
                          ? 'bg-apple-blue border-apple-blue text-white shadow-apple-xs'
                          : 'bg-apple-bg dark:bg-apple-dark-bg border-apple-border dark:border-apple-dark-border text-apple-text-secondary hover:border-apple-blue/30'
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Redondeado Tarjetas */}
              <div className="space-y-4">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-sm font-bold text-apple-text-secondary">Esquinas de Tarjetas de Platillos</label>
                  <span className="text-xs font-mono font-bold bg-apple-bg dark:bg-apple-dark-bg border border-apple-border dark:border-apple-dark-border px-2 py-0.5 rounded-md">
                    {theme.config_diseno?.apariencia?.border_radius_tarjetas === '0px' ? 'Recto (0px)' :
                     theme.config_diseno?.apariencia?.border_radius_tarjetas === '12px' ? 'Suave (12px)' :
                     theme.config_diseno?.apariencia?.border_radius_tarjetas === '24px' ? 'Redondo (24px)' : 'Extra Redondo (32px)'}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: 'Recto', value: '0px' },
                    { label: 'Suave', value: '12px' },
                    { label: 'Fuerte', value: '24px' },
                    { label: 'Circular', value: '32px' }
                  ].map((card) => (
                    <button
                      key={card.value}
                      type="button"
                      onClick={() => updateDisenoApariencia('border_radius_tarjetas', card.value)}
                      className={`py-3.5 px-2 rounded-xl text-xs font-bold transition-all border ${
                        theme.config_diseno?.apariencia?.border_radius_tarjetas === card.value
                          ? 'bg-apple-blue border-apple-blue text-white shadow-apple-xs'
                          : 'bg-apple-bg dark:bg-apple-dark-bg border-apple-border dark:border-apple-dark-border text-apple-text-secondary hover:border-apple-blue/30'
                      }`}
                    >
                      {card.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Switches para Sombras y Glassmorphism */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Switch Glassmorphism */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-apple-bg dark:bg-apple-dark-bg border border-apple-border dark:border-apple-dark-border">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold flex items-center gap-1.5"><Sparkles size={12} className="text-purple-500" /> Glassmorphism</h4>
                    <p className="text-[10px] text-apple-text-secondary">Efecto translúcido esmerilado en las tarjetas</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const active = !theme.config_diseno?.elementos_visuales?.glassmorphism;
                      updateDisenoElementos('glassmorphism', active);
                      updateDisenoApariencia('fondo_blur', active ? '12px' : '0px');
                    }}
                    className={`w-12 h-7 rounded-full transition-colors relative flex items-center px-1 flex-shrink-0 ${
                      theme.config_diseno?.elementos_visuales?.glassmorphism ? 'bg-apple-blue' : 'bg-apple-border dark:bg-apple-dark-border'
                    }`}
                  >
                    <motion.div
                      layout
                      className="w-5 h-5 rounded-full bg-white shadow-apple-xs"
                      animate={{ x: theme.config_diseno?.elementos_visuales?.glassmorphism ? 20 : 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  </button>
                </div>

                {/* Switch Sombras */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-apple-bg dark:bg-apple-dark-bg border border-apple-border dark:border-apple-dark-border">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold">Sombras Premium</h4>
                    <p className="text-[10px] text-apple-text-secondary">Añade volumen 3D en tarjetas y botones</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateDisenoElementos('sombras_habilitadas', !theme.config_diseno?.elementos_visuales?.sombras_habilitadas)}
                    className={`w-12 h-7 rounded-full transition-colors relative flex items-center px-1 flex-shrink-0 ${
                      theme.config_diseno?.elementos_visuales?.sombras_habilitadas ? 'bg-apple-blue' : 'bg-apple-border dark:bg-apple-dark-border'
                    }`}
                  >
                    <motion.div
                      layout
                      className="w-5 h-5 rounded-full bg-white shadow-apple-xs"
                      animate={{ x: theme.config_diseno?.elementos_visuales?.sombras_habilitadas ? 20 : 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  </button>
                </div>
              </div>

              {/* Color del Badge de Ofertas */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-apple-text-secondary ml-1">Color del Badge de Ofertas/Destacados</label>
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-apple-bg dark:bg-apple-dark-bg border border-apple-border dark:border-apple-dark-border shadow-apple-sm group hover:border-apple-blue/50 transition-colors">
                  <button
                    type="button"
                    onClick={() => setShowPicker(showPicker === 'badge' ? null : 'badge')}
                    className="w-12 h-12 rounded-xl shadow-apple-md border border-white/20 transition-transform active:scale-95 flex-shrink-0"
                    style={{ backgroundColor: theme.config_diseno?.elementos_visuales?.badge_color || '#ffbe0b' }}
                  />
                  <div className="flex flex-col">
                    <span className="font-mono text-sm font-bold tracking-widest uppercase">{theme.config_diseno?.elementos_visuales?.badge_color || '#ffbe0b'}</span>
                    <span className="text-[10px] text-apple-text-tertiary">Color usado en etiquetas de "Oferta" o "Nuevo"</span>
                  </div>
                </div>
              </div>
            </section>

            {/* 4. Fuentes */}
            <section className="p-8 rounded-[2.5rem] bg-apple-bg-secondary dark:bg-apple-dark-bg-secondary border border-apple-border dark:border-apple-dark-border shadow-apple-sm">
              <h3 className="text-[11px] font-bold text-apple-blue tracking-[0.2em] uppercase mb-8 flex items-center gap-2 border-b border-apple-border dark:border-apple-dark-border pb-4">
                <Type size={16} /> Tipografía del Menú
              </h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {FUENTES.map((fuente) => (
                  <button
                    key={fuente.value}
                    type="button"
                    onClick={() => {
                      setTheme((prev: any) => ({ ...prev, fuente_familia: fuente.value }));
                      updateDisenoApariencia('fuente_familia', fuente.value);
                    }}
                    className={`p-5 rounded-2xl border transition-all text-center active:scale-95 flex flex-col justify-center items-center ${
                      theme.fuente_familia === fuente.value
                        ? 'border-apple-blue bg-apple-blue/5 shadow-apple-glow text-apple-blue'
                        : 'border-apple-border dark:border-apple-dark-border bg-apple-bg dark:bg-apple-dark-bg text-apple-text-secondary hover:border-apple-blue/30'
                    }`}
                  >
                    <span className="text-2xl font-black block mb-1" style={{ fontFamily: fuente.value === 'Sans-Serif' ? 'Inter, sans-serif' : fuente.value }}>Aa</span>
                    <span className="text-[10px] font-black uppercase tracking-wider">{fuente.label}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* 5. Banner Promocional */}
            <section className="p-8 rounded-[2.5rem] bg-apple-bg-secondary dark:bg-apple-dark-bg-secondary border border-apple-border dark:border-apple-dark-border shadow-apple-sm space-y-6">
              <h3 className="text-[11px] font-bold text-apple-blue tracking-[0.2em] uppercase flex items-center gap-2 border-b border-apple-border dark:border-apple-dark-border pb-4">
                <Megaphone size={16} /> Banner Promocional
              </h3>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-apple-bg dark:bg-apple-dark-bg border border-apple-border dark:border-apple-dark-border">
                <div className="space-y-1 pr-4">
                  <h4 className="text-sm font-bold">Activar Banner Promocional</h4>
                  <p className="text-xs text-apple-text-secondary">Muestra un banner informativo destacado al principio del menú para avisar a tus clientes sobre ofertas especiales o anuncios.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setTheme((prev: any) => ({ ...prev, banner_promocional_activo: !prev.banner_promocional_activo }))}
                  className={`w-14 h-8 rounded-full transition-colors relative flex items-center px-1 flex-shrink-0 ${
                    theme.banner_promocional_activo ? 'bg-apple-blue' : 'bg-apple-border dark:bg-apple-dark-border'
                  }`}
                >
                  <motion.div
                    layout
                    className="w-6 h-6 rounded-full bg-white shadow-apple-sm"
                    animate={{ x: theme.banner_promocional_activo ? 24 : 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>

              {theme.banner_promocional_activo && (
                <motion.div 
                  className="space-y-3"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                >
                  <label className="text-sm font-bold text-apple-text-secondary ml-1">Mensaje del Banner</label>
                  <input
                    type="text"
                    value={theme.banner_promocional_texto || ''}
                    onChange={(e) => setTheme((prev: any) => ({ ...prev, banner_promocional_texto: e.target.value }))}
                    placeholder="Ej. ¡Hoy 2x1 en toda la coctelería a partir de las 6:00 PM!"
                    className="w-full px-5 py-3.5 rounded-2xl bg-apple-bg dark:bg-apple-dark-bg border border-apple-border dark:border-apple-dark-border text-sm font-medium focus:border-apple-blue"
                  />
                </motion.div>
              )}
            </section>

            {/* 6. Datos del Establecimiento */}
            <section className="p-8 rounded-[2.5rem] bg-apple-bg-secondary dark:bg-apple-dark-bg-secondary border border-apple-border dark:border-apple-dark-border shadow-apple-sm space-y-6">
              <h3 className="text-[11px] font-bold text-apple-blue tracking-[0.2em] uppercase flex items-center gap-2 border-b border-apple-border dark:border-apple-dark-border pb-4">
                <Store size={16} /> Datos del Establecimiento
              </h3>

              {/* Dirección Física */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-apple-text-secondary ml-1 flex items-center gap-1.5">
                  <MapPin size={16} className="text-apple-blue" /> Dirección física del restaurante
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={theme.config_diseno?.informacion?.direccion || ''}
                    onChange={(e) => updateInformacion('direccion', e.target.value)}
                    placeholder="Ej. Av. Reforma 123, Col. Centro, CDMX"
                    className="flex-1 px-5 py-3.5 rounded-2xl bg-apple-bg dark:bg-apple-dark-bg border border-apple-border dark:border-apple-dark-border text-sm font-medium focus:border-apple-blue outline-none"
                  />
                  <button
                    type="submit"
                    className="sm:w-auto px-6 py-3.5 bg-apple-blue text-white rounded-2xl font-bold text-sm hover:bg-apple-blue-hover active:scale-95 transition-all shadow-apple-sm"
                  >
                    Guardar Dirección
                  </button>
                </div>
                <p className="text-[10px] text-apple-text-tertiary ml-1">Esta dirección se mostrará de forma destacada en el pie de página de tu menú digital.</p>
              </div>

              {/* Ambiente del Restaurante */}
              <div className="space-y-4 pt-2">
                <label className="text-sm font-bold text-apple-text-secondary ml-1">Ambiente / Concepto del Restaurante</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { value: 'Familiar', icon: '👨‍👩‍👧‍👦', label: 'Familiar' },
                    { value: 'Citas Románticas', icon: '💖', label: 'Romántico / Parejas' },
                    { value: 'Negocios', icon: '💼', label: 'Negocios / Trabajo' },
                    { value: 'Amigos y Grupos', icon: '🍻', label: 'Amigos / Grupos' },
                    { value: 'Rápido', icon: '⚡', label: 'Rápido / Express' },
                    { value: 'Premium', icon: '✨', label: 'Premium / Gourmet' }
                  ].map((amb) => (
                    <button
                      key={amb.value}
                      type="button"
                      onClick={() => updateInformacion('ambiente', amb.value)}
                      className={`p-4 rounded-2xl border transition-all text-center flex flex-col items-center gap-2 active:scale-95 ${
                        theme.config_diseno?.informacion?.ambiente === amb.value
                          ? 'border-apple-blue bg-apple-blue/5 text-apple-blue shadow-apple-glow'
                          : 'border-apple-border dark:border-apple-dark-border bg-apple-bg dark:bg-apple-dark-bg text-apple-text-secondary hover:border-apple-blue/30'
                      }`}
                    >
                      <span className="text-2xl">{amb.icon}</span>
                      <span className="text-[11px] font-black uppercase tracking-wider">{amb.label}</span>
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-apple-text-tertiary ml-1">Selecciona el ambiente que mejor represente tu establecimiento para que tus clientes lo identifiquen.</p>
              </div>
            </section>

            {/* Botón Guardar */}
            <div className="flex flex-col gap-4 pt-4">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full sm:w-auto flex-1 py-5 bg-apple-blue text-white rounded-full font-bold text-lg hover:bg-apple-blue-hover active:scale-95 transition-all disabled:opacity-50 shadow-apple-glow flex items-center justify-center gap-2"
                >
                  {saving ? 'Publicando cambios...' : (
                    <>
                      <Globe size={20} />
                      Guardar y Publicar Menú
                    </>
                  )}
                </button>

                <AnimatePresence>
                  {success && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex items-center gap-2 text-green-500 font-bold"
                    >
                      <CheckCircle2 size={24} />
                      <span>¡Cambios publicados!</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <AnimatePresence>
                {saveError && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 text-red-500 text-sm font-medium p-4 rounded-2xl bg-red-500/5 border border-red-500/20"
                  >
                    <AlertCircle size={16} />
                    {saveError}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </form>
        </div>

        {/* Real-time Preview Column */}
        <div className="flex-1 flex justify-center items-start">
<div className="sticky top-12 w-full max-w-[360px]">
             <div className="text-center mb-8">
               <h3 className="text-apple-text-tertiary text-[11px] font-black uppercase tracking-[0.3em] inline-flex items-center gap-2 px-4 py-2 rounded-full border border-apple-border dark:border-apple-dark-border">
                 <div className="w-1.5 h-1.5 rounded-full bg-apple-blue animate-pulse" />
                 Vista Previa Real
               </h3>
             </div>
             
             {/* Smartphone Mockup */}
             <div className="relative w-full aspect-[9/18.5] rounded-[3.5rem] border-[10px] border-[#1D1D1F] shadow-apple-2xl overflow-hidden ring-1 ring-white/10"
               style={{ 
                 background: theme.config_diseno?.apariencia?.fondo_tipo === 'gradiente' 
                   ? theme.config_diseno?.apariencia?.fondo_valor 
                   : theme.color_fondo,
                 backgroundColor: theme.color_fondo
               }}
             >
                 <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-6 bg-[#1D1D1F] rounded-b-3xl z-50 shadow-sm" />
                 
                 {/* Mock Content */}
                 {(() => {
                   const isDark = theme.config_diseno?.apariencia?.modo_oscuro !== undefined
                     ? theme.config_diseno.apariencia.modo_oscuro
                     : isColorDark(theme.color_fondo);
                     
                    const textOpHigh = theme.config_diseno?.apariencia?.color_normal || (isDark ? 'rgba(255,255,255,0.9)' : 'rgba(29,29,31,0.9)');
                    const textOpLow  = colorWithOpacity(textOpHigh, 0.55);
                   const borderOp   = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
                   const headerBg   = isDark ? 'rgba(10,10,10,0.5)' : 'rgba(255,255,255,0.5)';
                   
                   const btnRadius = theme.config_diseno?.apariencia?.border_radius_botones || '12px';
                   const cardRadius = theme.config_diseno?.apariencia?.border_radius_tarjetas || '24px';
                   
                   const isGlass = theme.config_diseno?.elementos_visuales?.glassmorphism || false;
                   const showShadow = theme.config_diseno?.elementos_visuales?.sombras_habilitadas !== undefined
                     ? theme.config_diseno.elementos_visuales.sombras_habilitadas
                     : true;
                   const badgeColor = theme.config_diseno?.elementos_visuales?.badge_color || '#ffbe0b';
                   
                   const surfaceOp = isGlass
                     ? (isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)')
                     : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)');

                   const fontFam = theme.fuente_familia || 'Sans-Serif';
                   const font = 
                     fontFam === 'Serif' ? 'Georgia, serif' :
                     fontFam === 'Mono' ? 'monospace' :
                     fontFam === 'Poppins' ? 'Poppins, sans-serif' :
                     fontFam === 'Outfit' ? 'Outfit, sans-serif' :
                     'Inter, sans-serif';

                   return (
                 <div
                   className="w-full h-full overflow-y-auto scrollbar-hide flex flex-col"
                   style={{ fontFamily: font }}
                 >
                   {/* Header mock */}
                   <div 
                     className="px-5 pt-12 pb-3.5 flex items-center gap-2.5 sticky top-0 z-10 backdrop-blur-xl transition-all" 
                     style={{ 
                       backgroundColor: headerBg, 
                       borderBottom: `1px solid ${borderOp}` 
                     }}
                   >
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm flex-shrink-0" style={{ backgroundColor: `${theme.color_primario}25` }}>
                        {theme.logo_url
                          ? <img src={theme.logo_url} alt="" className="w-full h-full object-cover rounded-xl" />
                          : <span style={{ color: theme.color_primario }}>🌮</span>}
                      </div>
                      <div className="h-3.5 w-24 rounded-full" style={{ backgroundColor: textOpHigh }} />
                   </div>
 
                   {/* Nav mock */}
                   <div 
                     className="px-4 py-2.5 flex gap-2 overflow-x-hidden backdrop-blur-xl" 
                     style={{ 
                       position: theme.config_diseno?.layout?.categorias_sticky ? 'sticky' : 'relative',
                       top: theme.config_diseno?.layout?.categorias_sticky ? '47px' : '0px',
                       zIndex: 9,
                       backgroundColor: headerBg,
                       borderBottom: `1px solid ${borderOp}` 
                     }}
                   >
                     {['Entradas','Tacos','Postres'].map((n, idx) => (
                       <div 
                         key={n} 
                         className="h-7 px-3 flex-shrink-0 flex items-center gap-1.5 transition-all" 
                         style={{ 
                           backgroundColor: idx === 0 ? `${theme.color_primario}20` : surfaceOp, 
                           border: `1px solid ${idx === 0 ? theme.color_primario : borderOp}`,
                           borderRadius: btnRadius
                         }}
                       >
                         {idx === 0 && <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: theme.color_primario }} />}
                         <div className="h-2 w-10 rounded-full" style={{ backgroundColor: idx === 0 ? theme.color_primario : textOpLow }} />
                       </div>
                     ))}
                   </div>
 
                    {/* Tarjeta de Presentación en Mockup */}
                    <div className="mx-4 mt-4 p-3.5 rounded-2xl border transition-all"
                      style={{ 
                        backgroundColor: surfaceOp, 
                        borderColor: borderOp,
                        borderRadius: cardRadius 
                      }}
                    >
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <div className="h-3 w-16 rounded-full" style={{ backgroundColor: textOpHigh }} />
                          {theme.config_diseno?.informacion?.ambiente && (
                            <span 
                              className="px-1.5 py-0.5 rounded-full text-[6px] font-black uppercase tracking-wider"
                              style={{ backgroundColor: `${theme.color_primario}1a`, color: theme.color_primario, border: `1px solid ${theme.color_primario}20` }}
                            >
                              {theme.config_diseno.informacion.ambiente}
                            </span>
                          )}
                        </div>
                        <div className="space-y-1">
                          <div className="h-1.5 w-full rounded-full" style={{ backgroundColor: textOpLow }} />
                          <div className="h-1.5 w-5/6 rounded-full" style={{ backgroundColor: textOpLow }} />
                        </div>
                        {theme.config_diseno?.informacion?.direccion && (
                          <div className="flex items-center gap-1 text-[7px]" style={{ color: textOpLow }}>
                            <span>📍</span>
                            <span className="truncate max-w-[180px]">{theme.config_diseno.informacion.direccion}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-6">
                     <div className="h-4 w-28 pl-2 flex items-center" style={{ borderLeft: `3px solid ${theme.color_primario}` }}>
                       <span className="text-[11px] font-black uppercase tracking-wider" style={{ color: textOpHigh }}>Entradas</span>
                     </div>
 
                     {theme.layout_type === 'LISTA_SIMPLE' && (
                       <div className="space-y-4">
                         {[1,2,3].map(i => (
                           <div key={i} className="flex justify-between items-center py-2" style={{ borderBottom: `1px solid ${borderOp}` }}>
                             <div className="space-y-1.5 flex-1 pr-4">
                               <div className="h-3 w-28 rounded-full" style={{ backgroundColor: textOpHigh }} />
                               <div className="h-2 w-44 rounded-full" style={{ backgroundColor: textOpLow }} />
                             </div>
                             <div className="h-6 px-2.5 rounded-lg font-bold text-[10px] flex items-center justify-center" style={{ color: theme.color_primario, border: `1px solid ${theme.color_primario}40`, borderRadius: btnRadius }}>
                               $65
                             </div>
                           </div>
                         ))}
                       </div>
                     )}
 
                     {theme.layout_type === 'CUADRICULA_FOTOS' && (
                       <div className="grid grid-cols-2 gap-3">
                         {[1,2,3,4].map(i => (
                           <div 
                             key={i} 
                             className="space-y-2 p-2 rounded-2xl transition-all"
                             style={{ 
                               backgroundColor: surfaceOp, 
                               borderRadius: cardRadius,
                               border: `1px solid ${borderOp}`,
                               boxShadow: showShadow ? '0 4px 10px rgba(0,0,0,0.1)' : 'none'
                             }}
                           >
                             <div className="aspect-square relative overflow-hidden bg-black/10" style={{ borderRadius: `calc(${cardRadius} - 8px)` }}>
                               <div className="w-full h-full flex items-center justify-center text-xl">🌮</div>
                               <div className="absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded-full text-[8px] font-black shadow-sm" style={{ backgroundColor: theme.color_primario, color: '#fff' }}>$75</div>
                             </div>
                             <div className="h-2 w-14 rounded-full mx-auto" style={{ backgroundColor: textOpHigh }} />
                           </div>
                         ))}
                       </div>
                     )}
 
                     {theme.layout_type === 'TARJETAS_DETALLADAS' && (
                       <div className="space-y-4">
                         {[1,2].map(i => (
                           <div 
                             key={i} 
                             className="p-3.5 space-y-3 transition-all relative overflow-hidden" 
                             style={{ 
                               backgroundColor: surfaceOp, 
                               border: `1px solid ${borderOp}`,
                               borderRadius: cardRadius,
                               boxShadow: showShadow ? '0 8px 20px rgba(0,0,0,0.12)' : 'none',
                               backdropFilter: isGlass ? 'blur(10px)' : 'none',
                               WebkitBackdropFilter: isGlass ? 'blur(10px)' : 'none'
                             }}
                           >
                             {/* Badge de Oferta (Fase 2) */}
                             {i === 1 && (
                               <div 
                                 className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[8px] font-black text-white uppercase tracking-wider shadow-sm animate-pulse" 
                                 style={{ backgroundColor: badgeColor }}
                               >
                                 Oferta
                               </div>
                             )}
                             <div className="h-24 rounded-xl flex items-center justify-center text-3xl bg-black/10" style={{ borderRadius: `calc(${cardRadius} - 8px)` }}>
                               🥗
                             </div>
                             <div className="flex justify-between items-center">
                               <div className="h-3 w-28 rounded-full" style={{ backgroundColor: textOpHigh }} />
                               <div className="h-5 w-12 rounded-full font-black text-[10px] flex items-center justify-center text-white" style={{ backgroundColor: theme.color_primario }}>$85</div>
                             </div>
                             <div className="space-y-1.5">
                               <div className="h-1.5 w-full rounded-full" style={{ backgroundColor: textOpLow }} />
                               <div className="h-1.5 w-3/4 rounded-full" style={{ backgroundColor: textOpLow }} />
                             </div>
                           </div>
                         ))}
                       </div>
                     )}
                   </div>
                 </div>
                   );
                 })()}
             </div>
             
             <p className="mt-8 text-center text-apple-text-tertiary text-xs font-medium flex items-center justify-center gap-1.5">
               <AlertCircle size={14} />
               Esto es una representación visual aproximada.
             </p>
          </div>
        </div>

      </div>
    </div>
  );
}