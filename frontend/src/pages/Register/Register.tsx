import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { authService } from '../../services/auth';

export function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    nombre_dueño: '',
    email: '',
    password: '',
    nombre_negocio: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await authService.register(formData);
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.mensaje || 'Error al registrar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <div className="flex items-center justify-center min-h-screen px-4 pt-20 pb-20">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="text-4xl mb-3">🌮</div>
            <h1 className="text-2xl font-bold mb-2">Registra tu restaurante</h1>
            <p className="text-sm text-gray-500">Comienza a vender más</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            <div>
              <input
                type="text"
                value={formData.nombre_dueño}
                onChange={(e) => setFormData({ ...formData, nombre_dueño: e.target.value })}
                className="w-full px-0 py-3 bg-transparent border-b border-white/10 text-white text-base placeholder-gray-600 focus:border-orange-500 focus:outline-none transition"
                placeholder="Nombre del dueño"
                required
              />
            </div>

            <div>
              <input
                type="text"
                value={formData.nombre_negocio}
                onChange={(e) => setFormData({ ...formData, nombre_negocio: e.target.value })}
                className="w-full px-0 py-3 bg-transparent border-b border-white/10 text-white text-base placeholder-gray-600 focus:border-orange-500 focus:outline-none transition"
                placeholder="Nombre del restaurante"
                required
              />
            </div>

            <div>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-0 py-3 bg-transparent border-b border-white/10 text-white text-base placeholder-gray-600 focus:border-orange-500 focus:outline-none transition"
                placeholder="Correo electrónico"
                required
              />
            </div>

            <div>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-0 py-3 bg-transparent border-b border-white/10 text-white text-base placeholder-gray-600 focus:border-orange-500 focus:outline-none transition"
                placeholder="Contraseña"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-full font-semibold text-white hover:shadow-lg transition disabled:opacity-50"
            >
              {loading ? 'Registrando...' : 'Registrar restaurante'}
            </button>

            <p className="text-center text-sm text-gray-500">
              ¿Ya tienes cuenta?{' '}
              <button onClick={() => navigate('/login')} className="text-orange-400 hover:underline">
                Inicia sesión
              </button>
            </p>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}