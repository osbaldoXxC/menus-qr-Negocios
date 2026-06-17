import api from './api';

export const restauranteService = {
  getQR: async () => {
    const response = await api.get('/restaurants/qr');
    return response.data;
  },

  // Recibe FormData con el archivo de imagen
  crearPlatillo: async (formData: FormData) => {
    const response = await api.post('/menu/platillos', formData);
    return response.data;
  },

  getPlatillos: async () => {
    const restaurante_id = localStorage.getItem('restaurante_id');
    if (!restaurante_id) {
      throw new Error('Restaurante no autenticado');
    }
    const response = await api.get(`/public/menu/${restaurante_id}`);
    const data = response.data;

    const normalizeImageUrl = (url: string | null | undefined) => {
      if (!url) return '';
      const trimmed = url.trim();
      if (!trimmed) return '';

      // Descarta rutas de API o rutas de menú que no son imágenes
      if (/\/public\/menu\//i.test(trimmed) || /\/api\/public\/menu\//i.test(trimmed)) {
        console.warn('Invalid image URL detected, ignoring:', trimmed);
        return '';
      }

      if (/^https?:\/\//i.test(trimmed)) return trimmed;
      if (/^\/\//.test(trimmed)) return `http:${trimmed}`;
      return `http://localhost:4000${trimmed.startsWith('/') ? '' : '/'}${trimmed}`;
    };

    // Transformar la respuesta pública en una lista plana de platillos
    const platillos = data.categorias?.flatMap((categoria: any) =>
      categoria.platillos.map((platillo: any) => {
        const normalizedUrl = normalizeImageUrl(platillo.url_imagen);
        return {
          id: platillo.id,
          nombre: platillo.nombre,
          descripcion: platillo.descripcion,
          precio: platillo.precio,
          url_imagen: normalizedUrl,
          categoria: categoria.nombre,
        };
      })
    ) || [];

    console.log('🍽️ Platillos obtenidos:', platillos);
    return platillos;
  },

  updateTheme: async (data: any) => {
    const response = await api.put('/restaurants/theme', data);
    return response.data;
  },

  getRestauranteInfo: async () => {
    const response = await api.get('/restaurants/info');
    return response.data;
  },
};