import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { authService } from '../services/auth';

interface RestaurantInfo {
  id: string;
  nombre_negocio: string;
  plan: string;
  estado: string;
  suscripcion_activa: boolean;
  dias_licencia: number;
}

interface Limits {
  maxMenus: number;
  maxCategorias: number;
  maxPlatillos: number;
  maxImagenes: number;
  soportePremium: boolean;
  personalizacionAvanzada: boolean;
}

interface RestaurantContextValue {
  restaurant: RestaurantInfo | null;
  limits: Limits;
  loading: boolean;
  refreshRestaurant: () => Promise<void>;
  isPremium: boolean;
}

const defaultLimits: Limits = {
  maxMenus: 1,
  maxCategorias: 5,
  maxPlatillos: 50,
  maxImagenes: 10,
  soportePremium: false,
  personalizacionAvanzada: false
};

const premiumLimits: Limits = {
  maxMenus: 10,
  maxCategorias: 50,
  maxPlatillos: 500,
  maxImagenes: 500,
  soportePremium: true,
  personalizacionAvanzada: true
};

export const RestaurantContext = createContext<RestaurantContextValue>({
  restaurant: null,
  limits: defaultLimits,
  loading: true,
  refreshRestaurant: async () => {},
  isPremium: false
});

export function RestaurantProvider({ children }: { children: ReactNode }) {
  const [restaurant, setRestaurant] = useState<RestaurantInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

  const refreshRestaurant = async () => {
    const user = authService.getCurrentUser();
    if (!user.isAuthenticated || (user.rol !== 'RESTAURANTE' && user.rol !== 'SUPER_ADMIN')) {
      setRestaurant(null);
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_BASE_URL}/restaurant/info`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setRestaurant({
          id: data.id,
          nombre_negocio: data.nombre_negocio,
          plan: data.plan || 'basico',
          estado: data.estado,
          suscripcion_activa: data.suscripcion_activa,
          dias_licencia: data.dias_licencia
        });
      } else {
        setRestaurant(null);
      }
    } catch (err) {
      console.error('Error fetching restaurant info:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshRestaurant();
    
    // Listen for auth changes to refetch
    const unsub = authService.onAuthChange(() => {
      refreshRestaurant();
    });
    
    return () => unsub();
  }, []);

  const isPremium = restaurant?.plan === 'premium' || restaurant?.plan === 'prueba';
  const limits = isPremium ? premiumLimits : defaultLimits;

  return (
    <RestaurantContext.Provider value={{ restaurant, limits, loading, refreshRestaurant, isPremium }}>
      {children}
    </RestaurantContext.Provider>
  );
}

export const useRestaurant = () => useContext(RestaurantContext);
