import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Footer } from '../components/Footer';
import { restauranteService } from '../../services/restaurante';

export function Configuracion() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [theme, setTheme] = useState({
    color_primario: '#F05A28',
    color_fondo: '#FFFFFF',
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
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-4xl animate-pulse">🎨</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="fixed top-0 left-0 right-0 bg-black/90 backdrop-blur-md z-50 border-b border-gray-800">
        <div className="px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate('/dashboard/restaurante')} className="text-2xl">←</button>
          <span className="font-bold">Configuración</span>
        </div>
      </nav>

      <div className="pt-16 pb-20 px-4 max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Color principal</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={theme.color_primario}
                onChange={(e) => setTheme({ ...theme, color_primario: e.target.value })}
                className="w-12 h-10 rounded border border-gray-700"
              />
              <span className="text-sm text-gray-500">{theme.color_primario}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Color de fondo del menú</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={theme.color_fondo}
                onChange={(e) => setTheme({ ...theme, color_fondo: e.target.value })}
                className="w-12 h-10 rounded border border-gray-700"
              />
              <span className="text-sm text-gray-500">{theme.color_fondo}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Fuente</label>
            <select
              value={theme.fuente_familia}
              onChange={(e) => setTheme({ ...theme, fuente_familia: e.target.value })}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white focus:border-orange-500 focus:outline-none"
            >
              <option value="Sans-Serif">Sans-Serif (Moderno)</option>
              <option value="Serif">Serif (Clásico)</option>
              <option value="Mono">Mono (Técnico)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Diseño del menú</label>
            <div className="grid grid-cols-3 gap-2">
              {['LISTA_SIMPLE', 'CUADRICULA_FOTOS', 'TARJETAS_DETALLADAS'].map((layout) => (
                <button
                  key={layout}
                  type="button"
                  onClick={() => setTheme({ ...theme, layout_type: layout })}
                  className={`p-3 rounded-xl text-xs border transition ${
                    theme.layout_type === layout
                      ? 'border-orange-500 bg-orange-500/10 text-orange-400'
                      : 'border-gray-800 text-gray-500'
                  }`}
                >
                  {layout === 'LISTA_SIMPLE' && '📋 Lista'}
                  {layout === 'CUADRICULA_FOTOS' && '🖼️ Cuadrícula'}
                  {layout === 'TARJETAS_DETALLADAS' && '✨ Tarjetas'}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-800 pt-6">
            <label className="flex items-center gap-3 cursor-pointer mb-4">
              <input
                type="checkbox"
                checked={theme.banner_promocional_activo}
                onChange={(e) => setTheme({ ...theme, banner_promocional_activo: e.target.checked })}
                className="w-5 h-5 rounded border-gray-700 bg-gray-900 text-orange-500"
              />
              <span className="text-sm">Mostrar banner promocional</span>
            </label>

            {theme.banner_promocional_activo && (
              <input
                type="text"
                value={theme.banner_promocional_texto}
                onChange={(e) => setTheme({ ...theme, banner_promocional_texto: e.target.value })}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:border-orange-500 focus:outline-none"
                placeholder="Ej: ¡2x1 en todos los tacos!"
              />
            )}
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl font-semibold hover:shadow-lg transition disabled:opacity-50"
          >
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>
      </div>

      <Footer />
    </div>
  );
}