import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export function LoginCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const rol = searchParams.get('rol');
    const restauranteId = searchParams.get('restaurante_id');

    if (token && rol) {
      // Guardar sesión localmente
      localStorage.setItem('access_token', token);
      localStorage.setItem('user_role', rol.toUpperCase());
      if (restauranteId) {
        localStorage.setItem('restaurante_id', restauranteId);
      }
      
      // Indicar que se requiere mostrar el splash
      sessionStorage.setItem('splash_shown', 'pending');

      // Disparar evento para actualizar el estado global de la app
      window.dispatchEvent(new Event('storage'));

      // Redirigir al dashboard correspondiente
      const userRol = rol.toUpperCase();
      if (userRol.includes('RESTAURANTE') || userRol.includes('SUPER_ADMIN')) {
        navigate('/dashboard/restaurante');
      } else {
        navigate('/descubrir');
      }
    } else {
      // Redirigir a login si faltan parámetros
      navigate('/login?error=callback_missing_params');
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-white dark:bg-black flex flex-col items-center justify-center transition-colors duration-300">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-[#0071E3] dark:border-[#2997FF] border-t-transparent rounded-full animate-spin" />
        <p className="text-[15px] font-medium text-[#86868B] dark:text-[#A1A1A6]">
          Verificando tu sesión de Cognito...
        </p>
      </div>
    </div>
  );
}
