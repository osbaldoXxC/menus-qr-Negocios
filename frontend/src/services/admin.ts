import api from './api';

export const adminService = {
  getRestaurantes: async () => {
    const response = await api.get('/admin/restaurants');
    return response.data;
  },

  changeRestauranteStatus: async (id: string, estado_activo: boolean, motivo?: string) => {
    const response = await api.put(`/admin/restaurants/${id}/status`, { estado_activo, motivo });
    return response.data;
  },
};