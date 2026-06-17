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

  getPlatillos: async () => {
    try {
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
    } catch (error) {
      console.warn('Error fetching platillos, using mock data:', error);
      return [
        { id: 'm1', nombre: 'Taco de Asada Mock', descripcion: 'Simulación de platillo.', precio: 45, categoria: 'Tacos' },
        { id: 'm2', nombre: 'Agua de Horchata Mock', descripcion: 'Bebida refrescante simulada.', precio: 30, categoria: 'Bebidas' }
      ];
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
};