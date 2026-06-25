import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HexColorPicker } from 'react-colorful';
import { restauranteService } from '../../services/restaurante';
import { Palette, Layout, Type, Globe, CheckCircle2, AlertCircle, Upload, Image as ImageIcon } from 'lucide-react';

const LAYOUTS = [
  { value: 'LISTA_SIMPLE', icon: '📋', label: 'Lista simple', desc: 'Minimalista y directo' },
  { value: 'CUADRICULA_FOTOS', icon: '🖼️', label: 'Cuadrícula', desc: 'Visual e impactante' },
  { value: 'TARJETAS_DETALLADAS', icon: '✨', label: 'Tarjetas', desc: 'Experiencia premium' },
];

const FUENTES = [
  { value: 'Sans-Serif', label: 'Sans-Serif', preview: 'Aa' },
  { value: 'Serif', label: 'Serif', preview: 'Aa' },
  { value: 'Mono', label: 'Mono', preview: 'Aa' },
];

export function Configuracion() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [showPicker, setShowPicker] = useState<'primario' | 'fondo' | null>(null);
  const [success, setSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [theme, setTheme] = useState({
    logo_url: '',
    color_primario: '#2997FF',
    color_fondo: '#000000',
    fuente_familia: 'Sans-Serif',
    layout_type: 'TARJETAS_DETALLADAS',
    banner_promocional_activo: false,
    banner_promocional_texto: '',
  });

  useEffect(() => {
    cargarConfiguracion();
  }, []);

  const cargarConfiguracion = async () => {
    setLoading(true);
    try {
      const data = await restauranteService.getRestauranteInfo();
      // El backend devuelve los campos del tema aplanados en la raíz del objeto
      // (logo_url, color_primario, color_fondo, etc. directamente en data)
      setTheme(prev => ({
        ...prev,
        logo_url: data.logo_url || prev.logo_url,
        color_primario: data.color_primario || prev.color_primario,
        color_fondo: data.color_fondo || prev.color_fondo,
        fuente_familia: data.fuente_familia || prev.fuente_familia,
        layout_type: data.layout_type || prev.layout_type,
        banner_promocional_activo: data.banner_promocional_activo ?? prev.banner_promocional_activo,
        banner_promocional_texto: data.banner_promocional_texto || prev.banner_promocional_texto,
      }));
    } catch (error) {
      console.error('Error cargando configuración:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const res = await restauranteService.uploadBrandingImage(file);
      if (res.url_imagen) {
        setTheme(prev => ({ ...prev, logo_url: res.url_imagen }));
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
                      onClick={() => setTheme(prev => ({ ...prev, logo_url: '' }))}
                      className="text-sm text-red-500 hover:text-red-600 font-medium"
                    >
                      Eliminar logo
                    </button>
                  )}
                </div>
              </div>
            </section>

            {/* Colores */}
            <section className="p-8 rounded-[2.5rem] bg-apple-bg-secondary dark:bg-apple-dark-bg-secondary border border-apple-border dark:border-apple-dark-border shadow-apple-sm">
              <h3 className="text-[11px] font-bold text-apple-blue tracking-[0.2em] uppercase mb-8 flex items-center gap-2">
                <Palette size={16} /> Colores de Marca
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-sm font-bold text-apple-text-secondary ml-1">Color de Acento</label>
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-apple-bg dark:bg-apple-dark-bg border border-apple-border dark:border-apple-dark-border shadow-apple-sm group hover:border-apple-blue/50 transition-colors">
                    <button
                      type="button"
                      onClick={() => setShowPicker(showPicker === 'primario' ? null : 'primario')}
                      className="w-12 h-12 rounded-xl shadow-apple-md border border-white/20 transition-transform active:scale-95"
                      style={{ backgroundColor: theme.color_primario }}
                    />
                    <span className="font-mono text-sm font-bold tracking-widest">{theme.color_primario}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-bold text-apple-text-secondary ml-1">Fondo del Menú</label>
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-apple-bg dark:bg-apple-dark-bg border border-apple-border dark:border-apple-dark-border shadow-apple-sm group hover:border-apple-blue/50 transition-colors">
                    <button
                      type="button"
                      onClick={() => setShowPicker(showPicker === 'fondo' ? null : 'fondo')}
                      className="w-12 h-12 rounded-xl shadow-apple-md border border-white/20 transition-transform active:scale-95"
                      style={{ backgroundColor: theme.color_fondo }}
                    />
                    <span className="font-mono text-sm font-bold tracking-widest">{theme.color_fondo}</span>
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {showPicker && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-8 flex justify-center p-6 rounded-3xl bg-apple-bg dark:bg-apple-dark-bg border border-apple-border dark:border-apple-dark-border"
                  >
                    <HexColorPicker
                      color={showPicker === 'primario' ? theme.color_primario : theme.color_fondo}
                      onChange={(color) => setTheme({ ...theme, [showPicker === 'primario' ? 'color_primario' : 'color_fondo']: color })}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            {/* Layouts */}
            <section className="p-8 rounded-[2.5rem] bg-apple-bg-secondary dark:bg-apple-dark-bg-secondary border border-apple-border dark:border-apple-dark-border shadow-apple-sm">
              <h3 className="text-[11px] font-bold text-apple-blue tracking-[0.2em] uppercase mb-8 flex items-center gap-2">
                <Layout size={16} /> Estructura del Menú
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {LAYOUTS.map((layout) => (
                  <button
                    key={layout.value}
                    type="button"
                    onClick={() => setTheme({ ...theme, layout_type: layout.value })}
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
            </section>

            {/* Fuentes */}
            <section className="p-8 rounded-[2.5rem] bg-apple-bg-secondary dark:bg-apple-dark-bg-secondary border border-apple-border dark:border-apple-dark-border shadow-apple-sm">
              <h3 className="text-[11px] font-bold text-apple-blue tracking-[0.2em] uppercase mb-8 flex items-center gap-2">
                <Type size={16} /> Tipografía
              </h3>
              
              <div className="flex flex-wrap gap-4">
                {FUENTES.map((fuente) => (
                  <button
                    key={fuente.value}
                    type="button"
                    onClick={() => setTheme({ ...theme, fuente_familia: fuente.value })}
                    className={`flex-1 min-w-[120px] p-6 rounded-3xl border-2 transition-all text-center active:scale-95 ${
                      theme.fuente_familia === fuente.value
                        ? 'border-apple-blue bg-apple-blue/5 shadow-apple-glow'
                        : 'border-apple-border dark:border-apple-dark-border bg-apple-bg dark:bg-apple-dark-bg text-apple-text-secondary hover:border-apple-blue/30'
                    }`}
                  >
                    <span className="text-4xl font-black block mb-2" style={{ fontFamily: fuente.value }}>Aa</span>
                    <span className="text-xs font-black uppercase tracking-widest">{fuente.label}</span>
                  </button>
                ))}
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
               style={{ backgroundColor: theme.color_fondo }}
             >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-6 bg-[#1D1D1F] rounded-b-3xl z-50 shadow-sm" />
                
                {/* Mock Content */}
                {(() => {
                  const isDark = (() => {
                    const hex = theme.color_fondo.replace('#', '');
                    if (hex.length < 6) return true;
                    const r = parseInt(hex.slice(0,2),16), g = parseInt(hex.slice(2,4),16), b = parseInt(hex.slice(4,6),16);
                    return (0.299*r + 0.587*g + 0.114*b)/255 < 0.5;
                  })();
                  const textOpHigh = isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.80)';
                  const textOpLow  = isDark ? 'rgba(255,255,255,0.20)' : 'rgba(0,0,0,0.12)';
                  const surfaceOp  = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)';
                  const borderOp   = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
                  const headerBg   = isDark ? `${theme.color_fondo}cc` : `${theme.color_fondo}cc`;
                  return (
                <div
                  className="w-full h-full overflow-y-auto scrollbar-hide flex flex-col"
                  style={{ backgroundColor: theme.color_fondo, fontFamily: theme.fuente_familia }}
                >
                  {/* Header mock */}
                  <div className="px-5 pt-12 pb-3.5 flex items-center gap-2.5 sticky top-0 z-10 backdrop-blur-md" style={{ backgroundColor: headerBg, borderBottom: `1px solid ${borderOp}` }}>
                     <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm flex-shrink-0" style={{ backgroundColor: `${theme.color_primario}25` }}>
                       {theme.logo_url
                         ? <img src={theme.logo_url} alt="" className="w-full h-full object-cover rounded-xl" />
                         : <span style={{ color: theme.color_primario }}>🌮</span>}
                     </div>
                     <div className="h-3 w-20 rounded-full" style={{ backgroundColor: textOpHigh }} />
                  </div>

                  {/* Nav mock */}
                  <div className="px-4 py-2.5 flex gap-2 overflow-x-hidden" style={{ borderBottom: `1px solid ${borderOp}` }}>
                    {['Entradas','Tacos','Postres'].map(n => (
                      <div key={n} className="h-6 px-3 rounded-full flex-shrink-0 flex items-center" style={{ backgroundColor: surfaceOp, border: `1px solid ${borderOp}` }}>
                        <div className="h-2 w-10 rounded-full" style={{ backgroundColor: textOpHigh }} />
                      </div>
                    ))}
                  </div>

                  {/* Content */}
                  <div className="p-4 space-y-6">
                    <div className="h-4 w-24 rounded-full pl-2" style={{ backgroundColor: textOpHigh, borderLeft: `3px solid ${theme.color_primario}` }} />

                    {theme.layout_type === 'LISTA_SIMPLE' && (
                      <div className="space-y-4">
                        {[1,2,3,4].map(i => (
                          <div key={i} className="flex justify-between items-center py-2" style={{ borderBottom: `1px solid ${borderOp}` }}>
                            <div className="space-y-1.5">
                              <div className="h-3 w-24 rounded-full" style={{ backgroundColor: textOpHigh }} />
                              <div className="h-2 w-32 rounded-full" style={{ backgroundColor: textOpLow }} />
                            </div>
                            <div className="h-5 w-10 rounded-lg font-bold text-[10px] flex items-center justify-center" style={{ color: theme.color_primario, border: `1px solid ${theme.color_primario}60` }}>
                              $65
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {theme.layout_type === 'CUADRICULA_FOTOS' && (
                      <div className="grid grid-cols-2 gap-3">
                        {[1,2,3,4].map(i => (
                          <div key={i} className="space-y-2">
                            <div className="aspect-square rounded-2xl relative overflow-hidden" style={{ backgroundColor: surfaceOp, border: `1px solid ${borderOp}` }}>
                              <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded-full text-[8px] font-bold" style={{ backgroundColor: `${theme.color_primario}dd`, color: '#fff' }}>$75</div>
                            </div>
                            <div className="h-2 w-14 rounded-full mx-auto" style={{ backgroundColor: textOpLow }} />
                          </div>
                        ))}
                      </div>
                    )}

                    {theme.layout_type === 'TARJETAS_DETALLADAS' && (
                      <div className="space-y-4">
                        {[1,2].map(i => (
                          <div key={i} className="rounded-2xl p-3 space-y-3" style={{ backgroundColor: surfaceOp, border: `1px solid ${borderOp}` }}>
                            <div className="h-20 rounded-xl" style={{ backgroundColor: textOpLow }} />
                            <div className="flex justify-between items-center">
                              <div className="h-3 w-24 rounded-full" style={{ backgroundColor: textOpHigh }} />
                              <div className="h-4 w-10 rounded-full font-bold text-[10px] flex items-center justify-center" style={{ color: theme.color_primario }}>$85</div>
                            </div>
                            <div className="space-y-1">
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