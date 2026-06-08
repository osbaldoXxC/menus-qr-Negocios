import api from './api';

export const restauranteService = {
  getQR: async () => {
    const response = await api.get('/restaurants/qr');
    return response.data;
  },

  crearPlatillo: async (data: {
    nombre: string;
    descripcion: string;
    precio: number;
    categoria: string;
    url_imagen: string;
    ingredientes_principales: string[];
    complementos: string[];
  }) => {
    const response = await api.post('/menu/platillos', data);
    return response.data;
  },

  getPlatillos: async () => {
    const response = await api.get('/menu/platillos');
    return response.data;
  },

  updateTheme: async (data: {
    logo_url?: string;
    banner_url?: string;
    color_primario: string;
    color_fondo: string;
    fuente_familia: string;
    layout_type: string;
    banner_promocional_activo: boolean;
    banner_promocional_texto?: string;
  }) => {
    const response = await api.put('/restaurants/theme', data);
    return response.data;
  },

  getRestauranteInfo: async () => {
    const response = await api.get('/restaurants/info');
    return response.data;
  },
};