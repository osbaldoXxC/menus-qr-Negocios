import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { authService } from '../../services/auth';

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await authService.login(email, password);
      console.log('Login exitoso:', response);

      const rol = response.rol?.toString().toLowerCase() || localStorage.getItem('rol')?.toLowerCase();
      if (rol?.includes('restaurante')) {
        navigate('/dashboard/restaurante');
      } else if (rol?.includes('super')) {
        navigate('/admin');
      } else {
        navigate('/descubrir');
      }
    } catch (err: any) {
      setError(err.response?.data?.mensaje || 'Correo o contraseña incorrectos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <div className="flex items-center justify-center min-h-screen px-4 pt-20 pb-20">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="text-4xl mb-3">🌮</div>
            <h1 className="text-2xl font-bold mb-2">Bienvenido</h1>
            <p className="text-sm text-gray-500">Inicia sesión en tu cuenta</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-0 py-3 bg-transparent border-b border-white/10 text-white text-base placeholder-gray-600 focus:border-orange-500 focus:outline-none transition"
                placeholder="Correo electrónico"
                required
              />
            </div>

            <div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-0 py-3 bg-transparent border-b border-white/10 text-white text-base placeholder-gray-600 focus:border-orange-500 focus:outline-none transition pr-10"
                  placeholder="Contraseña"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-full font-semibold text-white hover:shadow-lg hover:shadow-orange-500/30 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            ¿No tienes cuenta?{' '}
            <button onClick={() => navigate('/register')} className="text-orange-400 hover:underline">
              Regístrate aquí
            </button>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}