import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { restauranteService } from '../../services/restaurante';

export function NuevoPlatillo() {
  const navigate = useNavigate();
  const { id } = useParams(); // ID para edición
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [error, setError] = useState('');
  const [imagenPreview, setImagenPreview] = useState<string | null>(null);
  const [imagenFile, setImagenFile] = useState<File | null>(null);
  
  const [categorias, setCategorias] = useState<any[]>([]);
  const [cocinasCatalogo, setCocinasCatalogo] = useState<any[]>([]);
  const [porcionesCatalogo, setPorcionesCatalogo] = useState<any[]>([]);
  
  const [nivelPicante, setNivelPicante] = useState<number>(0);
  const [tamanoPorcionId, setTamanoPorcionId] = useState<string>('');
  const [cocinasSeleccionadas, setCocinasSeleccionadas] = useState<string[]>([]);
  const [customCocina, setCustomCocina] = useState<string>('');

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    categoria: '',
    ingredientes_principales: [''],
    complementos: [''],
  });

  useEffect(() => {
    const init = async () => {
      try {
        // Cargar catálogos iniciales
        const [cats, cocinas, porciones] = await Promise.all([
          restauranteService.getCategorias(),
          restauranteService.getCocinas(),
          restauranteService.getPorciones()
        ]);

        if (Array.isArray(cats)) setCategorias(cats);
        if (Array.isArray(cocinas)) setCocinasCatalogo(cocinas);
        if (Array.isArray(porciones)) setPorcionesCatalogo(porciones);

        // Si es edición, cargar datos del platillo
        if (isEdit) {
          const platillos = await restauranteService.getPlatillos();
          const platillo = platillos.find((p: any) => p.id === id);
          
          if (platillo) {
            setFormData({
              nombre: platillo.nombre,
              descripcion: platillo.descripcion,
              precio: platillo.precio.toString(),
              categoria: platillo.categoria || '',
              ingredientes_principales: Array.isArray(platillo.ingredientes_principales) && platillo.ingredientes_principales.length > 0 
                ? platillo.ingredientes_principales 
                : [''],
              complementos: Array.isArray(platillo.complementos) && platillo.complementos.length > 0 
                ? platillo.complementos 
                : [''],
            });
            setNivelPicante(platillo.nivel_picante !== undefined ? parseInt(platillo.nivel_picante) : 0);
            setTamanoPorcionId(platillo.tamano_porcion_id || '');
            
            if (Array.isArray(platillo.cocinas)) {
              // Mapear los IDs de las cocinas del platillo
              const ids = platillo.cocinas.map((c: any) => c.id).filter(Boolean);
              setCocinasSeleccionadas(ids);
            }
            if (platillo.url_imagen) setImagenPreview(platillo.url_imagen);
          } else {
            setError('No se encontró el platillo para editar.');
          }
        }
      } catch (err) {
        console.error('Error al inicializar:', err);
      } finally {
        setFetching(false);
      }
    };
    init();
  }, [id, isEdit]);

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
    setFormData({ ...formData, ingredientes_principales: nuevos.length ? nuevos : [''] });
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
    setFormData({ ...formData, complementos: nuevos.length ? nuevos : [''] });
  };

  const updateComplemento = (index: number, value: string) => {
    const nuevos = [...formData.complementos];
    nuevos[index] = value;
    setFormData({ ...formData, complementos: nuevos });
  };

  const toggleCocina = (idOrName: string) => {
    if (cocinasSeleccionadas.includes(idOrName)) {
      setCocinasSeleccionadas(cocinasSeleccionadas.filter(c => c !== idOrName));
    } else {
      setCocinasSeleccionadas([...cocinasSeleccionadas, idOrName]);
    }
  };

  const addCustomCocina = (e: React.FormEvent) => {
    e.preventDefault();
    if (customCocina.trim()) {
      const cleanName = customCocina.trim();
      // Evitar duplicados
      if (!cocinasSeleccionadas.includes(cleanName)) {
        setCocinasSeleccionadas([...cocinasSeleccionadas, cleanName]);
      }
      setCustomCocina('');
    }
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
      submitData.append('ingredientes_principales', JSON.stringify(formData.ingredientes_principales.filter(i => i.trim())));
      submitData.append('complementos', JSON.stringify(formData.complementos.filter(c => c.trim())));
      
      // Nuevos campos
      submitData.append('nivel_picante', nivelPicante.toString());
      submitData.append('tamano_porcion_id', tamanoPorcionId);
      submitData.append('cocinas', JSON.stringify(cocinasSeleccionadas));

      if (imagenFile) {
        submitData.append('imagen', imagenFile);
      }

      if (isEdit && id) {
        await restauranteService.actualizarPlatillo(id, submitData);
      } else {
        await restauranteService.crearPlatillo(submitData);
      }

      navigate('/dashboard/platillos');
    } catch (err: any) {
      console.error('Error:', err);
      setError(err.response?.data?.mensaje || `Error al ${isEdit ? 'actualizar' : 'crear'} el platillo`);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <div className="animate-pulse text-6xl">🌮</div>
      </div>
    );
  }

  return (
    <div className="bg-transparent text-apple-text dark:text-apple-dark-text min-h-[calc(100vh-64px)]">
      <div className="pt-10 pb-20 px-4 max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">{isEdit ? 'Editar platillo' : 'Nuevo platillo'}</h1>
          <p className="text-apple-text-secondary dark:text-apple-dark-text-secondary text-base">
            {isEdit ? 'Actualiza los detalles de tu platillo' : 'Agrega un platillo a tu menú digital'}
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <motion.div
              className="p-4 rounded-apple-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-[14px] text-center font-medium"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              {error}
            </motion.div>
          )}

          {/* Drag & Drop de imagen */}
          <div>
            <label className="block text-sm font-bold text-apple-text-secondary dark:text-apple-dark-text-secondary mb-3">
              Imagen del platillo
            </label>

            <div
              {...getRootProps()}
              className={`relative border-2 border-dashed rounded-[2rem] p-6 transition-all cursor-pointer text-center ${
                isDragActive
                  ? 'border-apple-blue bg-apple-blue/5'
                  : 'border-apple-border dark:border-apple-dark-border bg-apple-bg-secondary dark:bg-apple-dark-bg-secondary hover:border-apple-blue/30 active:scale-[0.98]'
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
                    className="w-full max-h-56 object-cover rounded-[1.5rem] mx-auto shadow-apple-md"
                  />
                  <p className="text-xs font-medium text-apple-text-secondary">
                    Arrastra otra imagen o haz clic para cambiar
                  </p>
                </div>
              ) : (
                <div className="py-8">
                  <motion.div
                    className="text-5xl mb-4"
                    animate={{ y: [0, -4, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    🖼️
                  </motion.div>
                  <p className="text-apple-text font-bold mb-1">
                    Arrastra y suelta tu imagen aquí
                  </p>
                  <p className="text-apple-text-secondary text-sm">
                    o haz clic para seleccionar
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Nombre */}
          <div>
            <label className="block text-sm font-bold text-apple-text-secondary dark:text-apple-dark-text-secondary mb-2">Nombre del platillo</label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              className="w-full px-5 py-4 bg-apple-bg-secondary dark:bg-apple-dark-bg-secondary border border-apple-border dark:border-apple-dark-border rounded-2xl text-[15px] focus:border-apple-blue/40 focus:ring-4 focus:ring-apple-blue/10 focus:outline-none transition-all duration-200"
              placeholder="Ej: Tacos al Pastor"
              required
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-bold text-apple-text-secondary dark:text-apple-dark-text-secondary mb-2">Descripción</label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              rows={3}
              className="w-full px-5 py-4 bg-apple-bg-secondary dark:bg-apple-dark-bg-secondary border border-apple-border dark:border-apple-dark-border rounded-2xl text-[15px] focus:border-apple-blue/40 focus:ring-4 focus:ring-apple-blue/10 focus:outline-none transition-all duration-200 resize-none"
              placeholder="Describe el platillo..."
              required
            />
          </div>

          {/* Precio y Categoría */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-apple-text-secondary dark:text-apple-dark-text-secondary mb-2">Precio</label>
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-apple-text-secondary font-medium">$</span>
                <input
                  type="number"
                  step="0.01"
                  value={formData.precio}
                  onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                  className="w-full pl-9 pr-5 py-4 bg-apple-bg-secondary dark:bg-apple-dark-bg-secondary border border-apple-border dark:border-apple-dark-border rounded-2xl text-[15px] focus:border-apple-blue/40 focus:ring-4 focus:ring-apple-blue/10 focus:outline-none transition-all duration-200"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-apple-text-secondary dark:text-apple-dark-text-secondary mb-2">Categoría</label>
              <input
                type="text"
                list="categorias-existentes"
                value={formData.categoria}
                onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                className="w-full px-5 py-4 bg-apple-bg-secondary dark:bg-apple-dark-bg-secondary border border-apple-border dark:border-apple-dark-border rounded-2xl text-[15px] focus:border-apple-blue/40 focus:ring-4 focus:ring-apple-blue/10 focus:outline-none transition-all duration-200"
                placeholder="Escribe o selecciona..."
                required
              />
              <datalist id="categorias-existentes">
                {categorias.map((cat, i) => (
                  <option key={i} value={cat.nombre} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Tipo de Cocina (Múltiple Selección + Personalizado) */}
          <div>
            <label className="block text-sm font-bold text-apple-text-secondary dark:text-apple-dark-text-secondary mb-2">
              Tipo de cocina
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {cocinasCatalogo.map((cocina) => {
                const isSelected = cocinasSeleccionadas.includes(cocina.id);
                return (
                  <button
                    key={cocina.id}
                    type="button"
                    onClick={() => toggleCocina(cocina.id)}
                    className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all ${
                      isSelected
                        ? 'bg-apple-blue text-white border-apple-blue shadow-apple-sm'
                        : 'bg-black/[0.03] dark:bg-white/[0.04] border-apple-border dark:border-apple-dark-border text-apple-text-secondary hover:text-apple-text hover:bg-black/[0.06] dark:hover:bg-white/[0.08]'
                    }`}
                  >
                    {cocina.nombre}
                  </button>
                );
              })}
              {/* Cocinas añadidas personalizadas */}
              {cocinasSeleccionadas.filter(c => !cocinasCatalogo.some(cat => cat.id === c)).map((c, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => toggleCocina(c)}
                  className="px-4 py-2 rounded-full text-xs font-semibold bg-emerald-500 text-white border border-emerald-500 shadow-apple-sm"
                >
                  {c} ✕
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={customCocina}
                onChange={(e) => setCustomCocina(e.target.value)}
                className="flex-1 px-4 py-2 bg-apple-bg-secondary dark:bg-apple-bg-secondary border border-apple-border dark:border-apple-dark-border rounded-xl text-xs focus:border-apple-blue/40 focus:outline-none transition-all duration-200"
                placeholder="Ej: Fusión, Vegana..."
              />
              <button
                type="button"
                onClick={addCustomCocina}
                className="px-4 py-2 bg-apple-blue text-white rounded-xl text-xs font-bold hover:bg-apple-blue-hover transition-colors"
              >
                + Añadir cocina
              </button>
            </div>
          </div>

          {/* Nivel de Picante */}
          <div>
            <label className="block text-sm font-bold text-apple-text-secondary dark:text-apple-dark-text-secondary mb-2">
              Nivel de picante
            </label>
            <div className="flex items-center gap-4 py-1.5">
              <button
                type="button"
                onClick={() => setNivelPicante(0)}
                className={`px-3.5 py-2 rounded-full text-xs font-bold transition-all border ${
                  nivelPicante === 0 
                    ? 'bg-apple-blue/10 text-apple-blue border-apple-blue/20' 
                    : 'bg-black/[0.03] dark:bg-white/[0.04] border-apple-border dark:border-apple-dark-border text-apple-text-secondary hover:text-apple-text'
                }`}
              >
                No pica (0)
              </button>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setNivelPicante(num)}
                    className="text-2xl transition-transform hover:scale-125 focus:outline-none select-none"
                  >
                    <span className={num <= nivelPicante ? 'opacity-100 filter drop-shadow-[0_0_8px_rgba(230,57,70,0.55)]' : 'opacity-20 grayscale'}>
                      🌶️
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tamaño de Porción */}
          <div>
            <label className="block text-sm font-bold text-apple-text-secondary dark:text-apple-dark-text-secondary mb-2">
              Tamaño de porción
            </label>
            <select
              value={tamanoPorcionId}
              onChange={(e) => setTamanoPorcionId(e.target.value)}
              className="w-full px-5 py-4 bg-apple-bg-secondary dark:bg-apple-dark-bg-secondary border border-apple-border dark:border-apple-dark-border rounded-2xl text-[15px] focus:border-apple-blue/40 focus:ring-4 focus:ring-apple-blue/10 focus:outline-none transition-all duration-200"
            >
              <option value="">Selecciona el tamaño...</option>
              {porcionesCatalogo.map((porc) => (
                <option key={porc.id} value={porc.id}>
                  {porc.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Ingredientes Principales */}
          <div className="pt-4">
            <label className="block text-sm font-bold text-apple-text-secondary dark:text-apple-dark-text-secondary mb-3">Ingredientes principales</label>
            <div className="space-y-3">
              {formData.ingredientes_principales.map((ing, index) => (
                <div key={index} className="flex gap-3">
                  <input
                    type="text"
                    value={ing}
                    onChange={(e) => updateIngrediente(index, e.target.value)}
                    className="flex-1 px-5 py-3.5 bg-apple-bg-secondary dark:bg-apple-dark-bg-secondary border border-apple-border dark:border-apple-dark-border rounded-xl text-[15px] focus:border-apple-blue/40 focus:ring-2 focus:ring-apple-blue/10 focus:outline-none transition-all duration-200"
                    placeholder={`Ingrediente ${index + 1}`}
                  />
                  {formData.ingredientes_principales.length > 1 && (
                    <button type="button" onClick={() => removeIngrediente(index)} className="px-4 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors font-bold">✖</button>
                  )}
                </div>
              ))}
            </div>
            <button type="button" onClick={addIngrediente} className="mt-4 text-sm font-bold text-apple-blue hover:text-apple-blue-hover transition-colors inline-flex items-center gap-1">
              + Agregar ingrediente
            </button>
          </div>

          {/* Complementos */}
          <div className="pt-4">
            <label className="block text-sm font-bold text-apple-text-secondary dark:text-apple-dark-text-secondary mb-3">Complementos</label>
            <div className="space-y-3">
              {formData.complementos.map((comp, index) => (
                <div key={index} className="flex gap-3">
                  <input
                    type="text"
                    value={comp}
                    onChange={(e) => updateComplemento(index, e.target.value)}
                    className="flex-1 px-5 py-3.5 bg-apple-bg-secondary dark:bg-apple-dark-bg-secondary border border-apple-border dark:border-apple-dark-border rounded-xl text-[15px] focus:border-apple-blue/40 focus:ring-2 focus:ring-apple-blue/10 focus:outline-none transition-all duration-200"
                    placeholder={`Complemento ${index + 1}`}
                  />
                  {formData.complementos.length > 1 && (
                    <button type="button" onClick={() => removeComplemento(index)} className="px-4 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors font-bold">✖</button>
                  )}
                </div>
              ))}
            </div>
            <button type="button" onClick={addComplemento} className="mt-4 text-sm font-bold text-apple-blue hover:text-apple-blue-hover transition-colors inline-flex items-center gap-1">
              + Agregar complemento
            </button>
          </div>

          {/* Botones */}
          <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-apple-border dark:border-apple-dark-border">
            <button
              type="button"
              onClick={() => navigate('/dashboard/platillos')}
              className="flex-1 py-4 rounded-full border-2 border-apple-border dark:border-apple-dark-border font-bold text-apple-text-secondary hover:border-apple-text-secondary hover:text-apple-text transition-all duration-200"
            >
              Cancelar
            </button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={loading}
              className="flex-1 py-4 bg-apple-blue text-white rounded-full font-bold hover:bg-apple-blue-hover transition-all duration-200 shadow-apple-md hover:shadow-apple-glow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Guardando...' : (isEdit ? 'Actualizar platillo' : 'Guardar platillo')}
            </motion.button>
          </div>
        </form>
      </div>
    </div>
  );
}