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
      <div className="pt-16 pb-20 px-4 max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold mb-1">Personaliza tu marca</h1>
          <p className="text-[#A1A1A6] text-sm">
            Configura los colores, fuente y diseño de tu menú digital
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Preview en vivo */}
          <motion.div
            className="rounded-apple-lg glass border border-white/[0.06] p-6 space-y-3"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <p className="text-xs text-[#6E6E73] text-center mb-3">Vista previa</p>
            <div
              className="rounded-apple-lg p-4 text-center"
              style={{ backgroundColor: theme.color_primario, fontFamily: theme.fuente_familia }}
            >
              <span className="text-white font-bold text-lg">🌮 Tu Restaurante</span>
            </div>
            <div
              className="rounded-apple-lg p-4 border border-white/[0.06]"
              style={{
                backgroundColor: theme.color_fondo,
                fontFamily: theme.fuente_familia,
              }}
            >
              <div className="flex justify-between items-center text-[#F5F5F7]">
                <span style={{ fontFamily: theme.fuente_familia }}>Platillo ejemplo</span>
                <span
                  className="px-3 py-1 rounded-apple-full text-xs font-bold text-white"
                  style={{ backgroundColor: theme.color_primario }}
                >
                  $120
                </span>
              </div>
            </div>
          </motion.div>

          {/* Color primario */}
          <div>
            <label className="block text-sm font-medium text-[#A1A1A6] mb-2">
              Color principal
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  setShowPicker(showPicker === 'primario' ? null : 'primario')
                }
                className="w-12 h-12 rounded-apple-lg border-2 border-white/[0.10] shadow-lg transition hover:scale-105"
                style={{ backgroundColor: theme.color_primario }}
              />
              <span className="text-sm text-[#A1A1A6] font-mono">{theme.color_primario}</span>
            </div>
            {showPicker === 'primario' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-3"
              >
                <HexColorPicker
                  color={theme.color_primario}
                  onChange={(color) => setTheme({ ...theme, color_primario: color })}
                />
              </motion.div>
            )}
          </div>

          {/* Color fondo */}
          <div>
            <label className="block text-sm font-medium text-[#A1A1A6] mb-2">
              Color de fondo del menú
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  setShowPicker(showPicker === 'fondo' ? null : 'fondo')
                }
                className="w-12 h-12 rounded-apple-lg border-2 border-white/[0.10] shadow-lg transition hover:scale-105"
                style={{ backgroundColor: theme.color_fondo }}
              />
              <span className="text-sm text-[#A1A1A6] font-mono">{theme.color_fondo}</span>
            </div>
            {showPicker === 'fondo' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-3"
              >
                <HexColorPicker
                  color={theme.color_fondo}
                  onChange={(color) => setTheme({ ...theme, color_fondo: color })}
                />
              </motion.div>
            )}
          </div>

          {/* Fuente */}
          <div>
            <label className="block text-sm font-medium text-[#A1A1A6] mb-2">
              Tipografía
            </label>
            <div className="flex gap-2">
              {FUENTES.map((fuente) => (
                <motion.button
                  key={fuente.value}
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setTheme({ ...theme, fuente_familia: fuente.value })}
                  className={`flex-1 p-4 rounded-apple-lg border transition-all text-center ${
                    theme.fuente_familia === fuente.value
                      ? 'border-[#2997FF]/40 bg-[#2997FF]/5'
                      : 'border-white/[0.06] text-[#A1A1A6] hover:border-white/[0.10]'
                  }`}
                >
                  <span
                    className="text-2xl font-bold block mb-1"
                    style={{ fontFamily: fuente.value }}
                  >
                    {fuente.preview}
                  </span>
                  <span className="text-xs">{fuente.label.split(' ')[0]}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Layout */}
          <div>
            <label className="block text-sm font-medium text-[#A1A1A6] mb-2">
              Diseño del menú
            </label>
            <div className="grid grid-cols-3 gap-2">
              {LAYOUTS.map((layout) => (
                <motion.button
                  key={layout.value}
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setTheme({ ...theme, layout_type: layout.value })}
                  className={`p-4 rounded-apple-lg border transition-all text-center ${
                    theme.layout_type === layout.value
                      ? 'border-[#2997FF]/40 bg-[#2997FF]/5'
                      : 'border-white/[0.06] text-[#A1A1A6] hover:border-white/[0.10]'
                  }`}
                >
                  <div className="text-2xl mb-1">{layout.icon}</div>
                  <div className="text-xs font-semibold text-[#F5F5F7]">{layout.label}</div>
                  <div className="text-xs text-[#6E6E73]">{layout.desc}</div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Banner promocional */}
          <div className="border-t border-white/[0.06] pt-6">
            <label className="flex items-center gap-3 cursor-pointer mb-4">
              <input
                type="checkbox"
                checked={theme.banner_promocional_activo}
                onChange={(e) =>
                  setTheme({ ...theme, banner_promocional_activo: e.target.checked })
                }
                className="w-5 h-5 rounded border-white/[0.10] bg-white/[0.03] text-[#2997FF] accent-[#2997FF]"
              />
              <span className="text-sm text-[#F5F5F7]">Mostrar banner promocional en el menú</span>
            </label>

            {theme.banner_promocional_activo && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
              >
                <input
                  type="text"
                  value={theme.banner_promocional_texto}
                  onChange={(e) =>
                    setTheme({ ...theme, banner_promocional_texto: e.target.value })
                  }
                  className="w-full px-5 py-3.5 bg-white/[0.03] border border-white/[0.06] rounded-apple-lg text-[15px] text-[#F5F5F7] placeholder-[#6E6E73] focus:border-[#2997FF]/40 focus:outline-none focus:bg-white/[0.04] transition-all duration-200"
                  placeholder="Ej: ¡2x1 en todos los tacos!"
                />
              </motion.div>
            )}
          </div>

          {/* Preview del banner */}
          {theme.banner_promocional_activo && theme.banner_promocional_texto && (
            <motion.div
              className="rounded-apple-lg p-3 text-center font-semibold text-sm text-white"
              style={{ backgroundColor: theme.color_primario }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {theme.banner_promocional_texto}
            </motion.div>
          )}

          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={saving}
            className="w-full py-3.5 bg-[#2997FF] text-white rounded-apple-full font-semibold hover:bg-[#40A9FF] transition-all duration-200 hover:shadow-[0_0_24px_rgba(41,151,255,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </motion.button>
        </form>
      </div>

      <Footer />
    </div>
  );
}