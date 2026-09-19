/**
 * Retorna la URL pública del menú usando VITE_PUBLIC_MENU_URL de las variables de entorno si existe.
 */
export function getPublicMenuUrl(restaurantId?: string, serverUrl?: string): string {
  if (serverUrl) return serverUrl;
  if (!restaurantId) return '';
  
  const envUrl = import.meta.env.VITE_PUBLIC_MENU_URL;
  if (envUrl) {
    const base = envUrl.endsWith('/') ? envUrl : `${envUrl}/`;
    return `${base}${restaurantId}`;
  }
  
  return `${window.location.origin}/menu/${restaurantId}`;
}
