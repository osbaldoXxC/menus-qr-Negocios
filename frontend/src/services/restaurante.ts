import api from './api';

export const restauranteService = {
  getQR: async () => {
    try {
      const response = await api.get('/restaurants/qr');
      return response.data;
    } catch (error) {
      console.warn('Error fetching QR, using mock data:', error);
      return {
        qr_base64: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://mexxicanmx.com/menu/1',
        url_menu_local: 'http://localhost:3001/menu/1'
      };
    }
  },

  // Recibe FormData con el archivo de imagen
  crearPlatillo: async (formData: FormData) => {
    const response = await api.post('/menu/platillos', formData);
    return response.data;
  },

  // Actualizar platillo
  actualizarPlatillo: async (id: string | number, formData: FormData) => {
    const response = await api.put(`/menu/platillos/${id}`, formData);
    return response.data;
  },

  // Eliminar platillo
  eliminarPlatillo: async (id: string | number) => {
    const response = await api.delete(`/menu/platillos/${id}`);
    return response.data;
  },

  getPlatillos: async () => {
    try {
      // Usar la ruta privada para ver TODOS los platillos (incluyendo inactivos)
      const response = await api.get('/menu/platillos');
      const platillos = response.data;

      const normalizeImageUrl = (url: string | null | undefined) => {
        if (!url) return '';
        const trimmed = url.trim();
        if (!trimmed) return '';

        // Si ya es una URL absoluta (S3/CloudFront), devolverla tal cual
        if (/^https?:\/\//i.test(trimmed)) return trimmed;
        
        // Fallback para imágenes locales servidas por el backend
        const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:4000';
        return `${baseUrl}${trimmed.startsWith('/') ? '' : '/'}${trimmed}`;
      };

      return platillos.map((p: any) => ({
        ...p,
        url_imagen: normalizeImageUrl(p.url_imagen),
        categoria: p.categoria_nombre // El backend devuelve categoria_nombre en la ruta privada
      }));
    } catch (error) {
      console.error('Error fetching platillos:', error);
      throw error;
    }
  },

  updateTheme: async (data: any) => {
    try {
      const response = await api.put('/restaurants/theme', data);
      return response.data;
    } catch (error) {
      console.warn('Error updating theme, simulating success:', error);
      return { mensaje: 'Tema actualizado (Simulado)' };
    }
  },

  getRestauranteInfo: async () => {
    try {
      const response = await api.get('/restaurants/info');
      return response.data;
    } catch (error) {
      console.warn('Error fetching restaurante info, using mock data:', error);
      return {
        nombre_negocio: 'Restaurante de Prueba',
        tema: {
          color_primario: '#2997FF',
          color_fondo: '#000000',
          layout_type: 'TARJETAS_DETALLADAS'
        }
      };
    }
  },

  uploadBrandingImage: async (file: File) => {
    const formData = new FormData();
    formData.append('imagen', file);
    const response = await api.post('/restaurants/upload-branding', formData);
    return response.data;
  },

  getCategorias: async () => {
    try {
      const response = await api.get('/categories');
      return response.data;
    } catch (error) {
      console.warn('Error fetching categories:', error);
      return [];
    }
  }
};