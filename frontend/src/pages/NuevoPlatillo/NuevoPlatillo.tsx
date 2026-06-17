import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { restauranteService } from '../../services/restaurante';

export function NuevoPlatillo() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imagenPreview, setImagenPreview] = useState<string | null>(null);
  const [imagenFile, setImagenFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    categoria: '',
    ingredientes_principales: [''],
    complementos: [''],
  });

  // ── Drag & drop zone ──────────────────────────────────────────
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    setImagenFile(file);
    const preview = URL.createObjectURL(file);
    setImagenPreview(preview);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'] },
    maxFiles: 1,
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
      const submitData = new FormData();
      submitData.append('nombre', formData.nombre);
      submitData.append('descripcion', formData.descripcion);
      submitData.append('precio', formData.precio);
      submitData.append('categoria', formData.categoria);
      submitData.append('ingredientes_principales', JSON.stringify(formData.ingredientes_principales.filter(i => i)));
      submitData.append('complementos', JSON.stringify(formData.complementos.filter(c => c)));

      if (imagenFile) {
        submitData.append('imagen', imagenFile);
      }

      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No autenticado. Inicia sesión de nuevo.');
      }

      const response = await restauranteService.crearPlatillo(submitData);

      console.log('Platillo creado:', response);
      navigate('/dashboard/platillos');

    } catch (err: any) {
      console.error('Error:', err);
      setError(err.response?.data?.mensaje || 'Error al crear el platillo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#000000] text-[#F5F5F7] min-h-screen">
      <Header />
      <div className="pt-16 pb-20 px-4 max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold mb-1">Nuevo platillo</h1>
          <p className="text-[#A1A1A6] text-sm">
            Agrega un platillo a tu menú digital
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <motion.div
              className="p-4 rounded-apple-lg bg-[#FF453A]/5 border border-[#FF453A]/15 text-[#FF453A] text-[14px] text-center"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              {error}
            </motion.div>
          )}

          {/* Drag & Drop de imagen */}
          <div>
            <label className="block text-sm font-medium text-[#A1A1A6] mb-2">
              Imagen del platillo
            </label>

            <div
              {...getRootProps()}
              className={`relative border-2 border-dashed rounded-apple-lg p-6 transition-all cursor-pointer text-center ${
                isDragActive
                  ? 'border-[#2997FF] bg-[#2997FF]/5'
                  : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] active:scale-[0.98]'
              }`}
            >
              <input {...getInputProps()} />

              {imagenPreview ? (
                <div className="space-y-4">
                  <motion.img
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    src={imagenPreview}
                    alt="Preview"
                    className="w-full max-h-56 object-cover rounded-apple-lg mx-auto"
                  />
                  <p className="text-xs text-[#6E6E73]">
                    Arrastra otra imagen o haz clic para cambiar
                  </p>
                </div>
              ) : isDragActive ? (
                <div className="py-8">
                  <motion.div
                    className="text-5xl mb-3"
                    animate={{ y: [0, -8, 0] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                  >
                    📸
                  </motion.div>
                  <p className="text-[#2997FF] font-semibold">¡Suelta la imagen aquí!</p>
                </div>
              ) : (
                <div className="py-8">
                  <motion.div
                    className="text-5xl mb-3"
                    animate={{ y: [0, -4, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    🖼️
                  </motion.div>
                  <p className="text-[#A1A1A6] font-semibold mb-1">
                    Arrastra y suelta tu imagen aquí
                  </p>
                  <p className="text-[#6E6E73] text-sm">
                    o haz clic para seleccionar
                  </p>
                  <p className="text-xs text-[#6E6E73] mt-2">
                    PNG, JPG, GIF, WebP • Máx 5MB
                  </p>
                </div>
              )}
            </div>

            {imagenPreview && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                type="button"
                onClick={() => {
                  setImagenPreview(null);
                  setImagenFile(null);
                }}
                className="mt-2 text-xs text-[#FF453A] hover:text-[#FF6B6B] transition-colors"
              >
                Eliminar imagen
              </motion.button>
            )}
          </div>

          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-[#A1A1A6] mb-1">Nombre del platillo</label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              className="w-full px-5 py-3.5 bg-white/[0.03] border border-white/[0.06] rounded-apple-lg text-[15px] text-[#F5F5F7] placeholder-[#6E6E73] focus:border-[#2997FF]/40 focus:outline-none focus:bg-white/[0.04] transition-all duration-200"
              placeholder="Ej: Tacos al Pastor"
              required
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-[#A1A1A6] mb-1">Descripción</label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              rows={3}
              className="w-full px-5 py-3.5 bg-white/[0.03] border border-white/[0.06] rounded-apple-lg text-[15px] text-[#F5F5F7] placeholder-[#6E6E73] focus:border-[#2997FF]/40 focus:outline-none focus:bg-white/[0.04] transition-all duration-200 resize-none"
              placeholder="Describe el platillo..."
              required
            />
          </div>

          {/* Precio y Categoría */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#A1A1A6] mb-1">Precio</label>
              <input
                type="number"
                step="0.01"
                value={formData.precio}
                onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                className="w-full px-5 py-3.5 bg-white/[0.03] border border-white/[0.06] rounded-apple-lg text-[15px] text-[#F5F5F7] placeholder-[#6E6E73] focus:border-[#2997FF]/40 focus:outline-none focus:bg-white/[0.04] transition-all duration-200"
                placeholder="$0.00"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#A1A1A6] mb-1">Categoría</label>
              <select
                value={formData.categoria}
                onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                className="w-full px-5 py-3.5 bg-white/[0.03] border border-white/[0.06] rounded-apple-lg text-[15px] text-[#F5F5F7] focus:border-[#2997FF]/40 focus:outline-none focus:bg-white/[0.04] transition-all duration-200 appearance-none"
                required
              >
                <option value="" className="bg-[#1D1D1F]">Seleccionar</option>
                <option value="Plato Fuerte" className="bg-[#1D1D1F]">Plato Fuerte</option>
                <option value="Entrada" className="bg-[#1D1D1F]">Entrada</option>
                <option value="Bebida" className="bg-[#1D1D1F]">Bebida</option>
                <option value="Postre" className="bg-[#1D1D1F]">Postre</option>
              </select>
            </div>
          </div>

          {/* Ingredientes Principales */}
          <div>
            <label className="block text-sm font-medium text-[#A1A1A6] mb-2">Ingredientes principales</label>
            {formData.ingredientes_principales.map((ing, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={ing}
                  onChange={(e) => updateIngrediente(index, e.target.value)}
                  className="flex-1 px-5 py-3 bg-white/[0.03] border border-white/[0.06] rounded-apple-lg text-[15px] text-[#F5F5F7] placeholder-[#6E6E73] focus:border-[#2997FF]/40 focus:outline-none focus:bg-white/[0.04] transition-all duration-200"
                  placeholder={`Ingrediente ${index + 1}`}
                />
                {formData.ingredientes_principales.length > 1 && (
                  <button type="button" onClick={() => removeIngrediente(index)} className="px-3 text-[#FF453A] hover:text-[#FF6B6B] transition-colors">✖️</button>
                )}
              </div>
            ))}
            <button type="button" onClick={addIngrediente} className="text-sm text-[#2997FF] hover:text-[#40A9FF] transition-colors">
              + Agregar ingrediente
            </button>
          </div>

          {/* Complementos */}
          <div>
            <label className="block text-sm font-medium text-[#A1A1A6] mb-2">Complementos</label>
            {formData.complementos.map((comp, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={comp}
                  onChange={(e) => updateComplemento(index, e.target.value)}
                  className="flex-1 px-5 py-3 bg-white/[0.03] border border-white/[0.06] rounded-apple-lg text-[15px] text-[#F5F5F7] placeholder-[#6E6E73] focus:border-[#2997FF]/40 focus:outline-none focus:bg-white/[0.04] transition-all duration-200"
                  placeholder={`Complemento ${index + 1}`}
                />
                {formData.complementos.length > 1 && (
                  <button type="button" onClick={() => removeComplemento(index)} className="px-3 text-[#FF453A] hover:text-[#FF6B6B] transition-colors">✖️</button>
                )}
              </div>
            ))}
            <button type="button" onClick={addComplemento} className="text-sm text-[#2997FF] hover:text-[#40A9FF] transition-colors">
              + Agregar complemento
            </button>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard/restaurante')}
              className="flex-1 py-3.5 rounded-apple-full border border-white/[0.10] font-semibold text-[#A1A1A6] hover:border-[#2997FF]/40 hover:text-[#F5F5F7] transition-all duration-200"
            >
              Cancelar
            </button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={loading}
              className="flex-1 py-3.5 bg-[#2997FF] text-white rounded-apple-full font-semibold hover:bg-[#40A9FF] transition-all duration-200 hover:shadow-[0_0_24px_rgba(41,151,255,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Guardando...' : 'Guardar platillo'}
            </motion.button>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  );
}