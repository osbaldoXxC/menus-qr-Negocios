import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Footer } from '../components/Footer';
import { restauranteService } from '../../services/restaurante';

export function NuevoPlatillo() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    categoria: '',
    url_imagen: '',
    ingredientes_principales: [''],
    complementos: ['']
  });

  const addIngrediente = () => {
    setFormData({ ...formData, ingredientes_principales: [...formData.ingredientes_principales, ''] });
  };

  const removeIngrediente = (index: number) => {
    const nuevos = formData.ingredientes_principales.filter((_, i) => i !== index);
    setFormData({ ...formData, ingredientes_principales: nuevos });
  };

  const updateIngrediente = (index: number, value: string) => {
    const nuevos = [...formData.ingredientes_principales];
    nuevos[index] = value;
    setFormData({ ...formData, ingredientes_principales: nuevos });
  };

  const addComplemento = () => {
    setFormData({ ...formData, complementos: [...formData.complementos, ''] });
  };

  const removeComplemento = (index: number) => {
    const nuevos = formData.complementos.filter((_, i) => i !== index);
    setFormData({ ...formData, complementos: nuevos });
  };

  const updateComplemento = (index: number, value: string) => {
    const nuevos = [...formData.complementos];
    nuevos[index] = value;
    setFormData({ ...formData, complementos: nuevos });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await restauranteService.crearPlatillo({
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        precio: parseFloat(formData.precio),
        categoria: formData.categoria,
        url_imagen: formData.url_imagen,
        ingredientes_principales: formData.ingredientes_principales.filter(i => i),
        complementos: formData.complementos.filter(c => c),
      });
      navigate('/dashboard/platillos');
    } catch (err: any) {
      setError(err.response?.data?.mensaje || 'Error al crear el platillo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="fixed top-0 left-0 right-0 bg-black/90 backdrop-blur-md z-50 border-b border-gray-800">
        <div className="px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate('/dashboard/restaurante')} className="text-2xl">←</button>
          <span className="font-bold">Nuevo Platillo</span>
        </div>
      </nav>

      <div className="pt-16 pb-20 px-4 max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Nombre del platillo</label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white focus:border-orange-500 focus:outline-none transition"
              placeholder="Ej: Tacos al Pastor"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Descripción</label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white focus:border-orange-500 focus:outline-none transition"
              placeholder="Describe el platillo..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Precio</label>
              <input
                type="number"
                step="0.01"
                value={formData.precio}
                onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white focus:border-orange-500 focus:outline-none transition"
                placeholder="$0.00"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Categoría</label>
              <select
                value={formData.categoria}
                onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white focus:border-orange-500 focus:outline-none transition"
                required
              >
                <option value="">Seleccionar</option>
                <option value="Plato Fuerte">Plato Fuerte</option>
                <option value="Entrada">Entrada</option>
                <option value="Bebida">Bebida</option>
                <option value="Postre">Postre</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">URL de la imagen</label>
            <input
              type="url"
              value={formData.url_imagen}
              onChange={(e) => setFormData({ ...formData, url_imagen: e.target.value })}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white focus:border-orange-500 focus:outline-none transition"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Ingredientes principales</label>
            {formData.ingredientes_principales.map((ing, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={ing}
                  onChange={(e) => updateIngrediente(index, e.target.value)}
                  className="flex-1 px-4 py-2 bg-gray-900 border border-gray-800 rounded-xl text-white focus:border-orange-500 focus:outline-none transition"
                  placeholder={`Ingrediente ${index + 1}`}
                />
                {formData.ingredientes_principales.length > 1 && (
                  <button type="button" onClick={() => removeIngrediente(index)} className="px-3 text-red-400">✖️</button>
                )}
              </div>
            ))}
            <button type="button" onClick={addIngrediente} className="text-sm text-orange-400 hover:text-orange-300">
              + Agregar ingrediente
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Complementos</label>
            {formData.complementos.map((comp, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={comp}
                  onChange={(e) => updateComplemento(index, e.target.value)}
                  className="flex-1 px-4 py-2 bg-gray-900 border border-gray-800 rounded-xl text-white focus:border-orange-500 focus:outline-none transition"
                  placeholder={`Complemento ${index + 1}`}
                />
                {formData.complementos.length > 1 && (
                  <button type="button" onClick={() => removeComplemento(index)} className="px-3 text-red-400">✖️</button>
                )}
              </div>
            ))}
            <button type="button" onClick={addComplemento} className="text-sm text-orange-400 hover:text-orange-300">
              + Agregar complemento
            </button>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard/restaurante')}
              className="flex-1 py-3 rounded-xl border border-gray-700 font-semibold hover:border-orange-500 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl font-semibold hover:shadow-lg transition disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Guardar platillo'}
            </button>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  );
}