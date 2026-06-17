import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HexColorPicker } from 'react-colorful';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { restauranteService } from '../../services/restaurante';

const LAYOUTS = [
  { value: 'LISTA_SIMPLE', icon: '📋', label: 'Lista simple', desc: 'Una columna' },
  { value: 'CUADRICULA_FOTOS', icon: '🖼️', label: 'Cuadrícula', desc: 'Fotos en grid' },
  { value: 'TARJETAS_DETALLADAS', icon: '✨', label: 'Tarjetas', desc: 'Estilo premium' },
];

const FUENTES = [
  { value: 'Sans-Serif', label: 'Sans-Serif (Moderno)', preview: 'Aa' },
  { value: 'Serif', label: 'Serif (Clásico)', preview: 'Aa' },
  { value: 'Mono', label: 'Mono (Técnico)', preview: 'Aa' },
];

export function Configuracion() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPicker, setShowPicker] = useState<'primario' | 'fondo' | null>(null);
  const [theme, setTheme] = useState({
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
      if (data.tema) {
        setTheme(data.tema);
      }
    } catch (error) {
      console.error('Error cargando configuración:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await restauranteService.updateTheme(theme);
      alert('Configuración guardada exitosamente');
    } catch (error) {
      console.error('Error guardando configuración:', error);
      alert('Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#000000] text-[#F5F5F7] min-h-screen flex items-center justify-center">
        <motion.div className="text-5xl" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2 }}>
          🎨
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-[#000000] text-[#F5F5F7] min-h-screen">
      <Header />
      
      <main className="pt-24 pb-20 px-6 max-w-[1400px] mx-auto">
        <div className="flex flex-col lg:flex-row gap-16">
          
          {/* ── SETTINGS COLUMN ──────────────────────────────────────────────── */}
          <div className="flex-1 max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-12"
            >
              <h1 className="text-4xl font-black tracking-tight mb-2">Identidad Visual</h1>
              <p className="text-[#A1A1A6] text-lg font-light">
                Define cómo el mundo percibe tu restaurante digitalmente.
              </p>
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-12">
              
              {/* Color primario */}
              <section>
                <h3 className="text-xs font-bold text-[#FF4A00] tracking-[0.2em] uppercase mb-6">Colores de Marca</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-sm font-medium text-[#A1A1A6] mb-3">Color de Acento</label>
                    <div className="flex items-center gap-4 p-4 rounded-3xl bg-white/5 border border-white/10">
                      <button
                        type="button"
                        onClick={() => setShowPicker(showPicker === 'primario' ? null : 'primario')}
                        className="w-12 h-12 rounded-2xl shadow-xl border border-white/20"
                        style={{ backgroundColor: theme.color_primario }}
                      />
                      <span className="font-mono text-sm tracking-widest">{theme.color_primario}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#A1A1A6] mb-3">Fondo del Menú</label>
                    <div className="flex items-center gap-4 p-4 rounded-3xl bg-white/5 border border-white/10">
                      <button
                        type="button"
                        onClick={() => setShowPicker(showPicker === 'fondo' ? null : 'fondo')}
                        className="w-12 h-12 rounded-2xl shadow-xl border border-white/20"
                        style={{ backgroundColor: theme.color_fondo }}
                      />
                      <span className="font-mono text-sm tracking-widest">{theme.color_fondo}</span>
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {showPicker && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-6 flex justify-center"
                    >
                      <HexColorPicker
                        color={showPicker === 'primario' ? theme.color_primario : theme.color_fondo}
                        onChange={(color) => setTheme({ ...theme, [showPicker === 'primario' ? 'color_primario' : 'color_fondo']: color })}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </section>

              {/* Layout */}
              <section>
                <h3 className="text-xs font-bold text-[#FF4A00] tracking-[0.2em] uppercase mb-6">Estructura del Menú</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {LAYOUTS.map((layout) => (
                    <motion.button
                      key={layout.value}
                      type="button"
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setTheme({ ...theme, layout_type: layout.value })}
                      className={`p-6 rounded-[2rem] border-2 transition-all text-center flex flex-col items-center gap-3 ${
                        theme.layout_type === layout.value
                          ? 'border-[#FF4A00] bg-[#FF4A00]/10 shadow-[0_0_20px_rgba(255,74,0,0.1)]'
                          : 'border-white/5 bg-white/5 text-[#A1A1A6] hover:border-white/20'
                      }`}
                    >
                      <div className="text-3xl">{layout.icon}</div>
                      <div>
                        <div className="text-sm font-bold text-white">{layout.label}</div>
                        <div className="text-[10px] uppercase tracking-widest opacity-50">{layout.desc}</div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </section>

              {/* Fuente */}
              <section>
                <h3 className="text-xs font-bold text-[#FF4A00] tracking-[0.2em] uppercase mb-6">Tipografía</h3>
                <div className="flex gap-4">
                  {FUENTES.map((fuente) => (
                    <motion.button
                      key={fuente.value}
                      type="button"
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setTheme({ ...theme, fuente_familia: fuente.value })}
                      className={`flex-1 p-6 rounded-[2rem] border-2 transition-all text-center ${
                        theme.fuente_familia === fuente.value
                          ? 'border-[#FF4A00] bg-[#FF4A00]/10'
                          : 'border-white/5 bg-white/5 text-[#A1A1A6] hover:border-white/20'
                      }`}
                    >
                      <span className="text-4xl font-black block mb-2" style={{ fontFamily: fuente.value }}>Aa</span>
                      <span className="text-xs font-bold uppercase tracking-widest">{fuente.label.split(' ')[0]}</span>
                    </motion.button>
                  ))}
                </div>
              </section>

              <motion.button
                whileTap={{ scale: 0.97 }}
                type="submit"
                disabled={saving}
                className="w-full py-5 bg-white text-black rounded-full font-black text-lg hover:scale-[1.02] transition-transform disabled:opacity-50 shadow-[0_20px_40px_rgba(255,255,255,0.1)]"
              >
                {saving ? 'Sincronizando...' : 'Guardar y Publicar'}
              </motion.button>
            </form>
          </div>

          {/* ── PREVIEW COLUMN (STICKY MOBILE MOCKUP) ────────────────────────── */}
          <div className="flex-1 flex justify-center items-start pt-12">
            <div className="sticky top-32 w-full max-w-[320px]">
               <h3 className="text-center text-[#6E6E73] text-[10px] uppercase tracking-[0.3em] mb-8">Vista Previa en Tiempo Real</h3>
               
               {/* Smartphone Mockup */}
               <div className="relative w-[300px] h-[600px] bg-[#050505] rounded-[3.5rem] border-[12px] border-[#1D1D1F] shadow-[0_50px_100px_rgba(0,0,0,0.5)] overflow-hidden">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#1D1D1F] rounded-b-3xl z-50" />
                  
                  {/* Mock Content */}
                  <div 
                    className="w-full h-full overflow-y-auto scrollbar-hide flex flex-col"
                    style={{ backgroundColor: theme.color_fondo, fontFamily: theme.fuente_familia }}
                  >
                    {/* Header */}
                    <div className="px-5 pt-10 pb-4 border-b border-white/5 flex items-center gap-3 bg-[#050505]/50 backdrop-blur-md sticky top-0 z-10">
                       <div className="w-8 h-8 rounded-lg bg-white/10" />
                       <div className="h-4 w-24 bg-white/20 rounded" />
                    </div>

                    {/* Menu Content */}
                    <div className="p-5 space-y-6">
                       <div className="h-6 w-32 bg-white/10 rounded" style={{ borderLeft: `4px solid ${theme.color_primario}`, paddingLeft: '8px' }} />
                       
                       {theme.layout_type === 'LISTA_SIMPLE' && (
                         <div className="space-y-4">
                           {[1,2,3].map(i => (
                             <div key={i} className="flex justify-between items-center py-2 border-b border-white/5">
                                <div className="space-y-1">
                                   <div className="h-3 w-24 bg-white/20 rounded" />
                                   <div className="h-2 w-32 bg-white/5 rounded" />
                                </div>
                                <div className="h-4 w-8 bg-white/20 rounded" style={{ backgroundColor: theme.color_primario }} />
                             </div>
                           ))}
                         </div>
                       )}

                       {theme.layout_type === 'CUADRICULA_FOTOS' && (
                         <div className="grid grid-cols-2 gap-3">
                           {[1,2,3,4].map(i => (
                             <div key={i} className="space-y-2">
                                <div className="aspect-square bg-white/5 rounded-2xl relative">
                                   <div className="absolute top-2 right-2 h-4 w-8 bg-black/50 rounded-full" />
                                </div>
                                <div className="h-2 w-16 bg-white/10 rounded mx-auto" />
                             </div>
                           ))}
                         </div>
                       )}

                       {theme.layout_type === 'TARJETAS_DETALLADAS' && (
                         <div className="space-y-6">
                           {[1,2].map(i => (
                             <div key={i} className="p-4 rounded-3xl bg-white/5 space-y-4">
                                <div className="aspect-video bg-white/10 rounded-2xl" />
                                <div className="flex justify-between">
                                   <div className="h-4 w-24 bg-white/20 rounded" />
                                   <div className="h-4 w-8 bg-white/20 rounded" style={{ backgroundColor: theme.color_primario }} />
                                </div>
                                <div className="h-2 w-full bg-white/5 rounded" />
                             </div>
                           ))}
                         </div>
                       )}
                    </div>
                  </div>
               </div>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}