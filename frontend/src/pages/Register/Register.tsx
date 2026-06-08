import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

export function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    nombre_dueño: '',     // ← IMPORTANTE: debe ser exactamente "nombre_dueño"
    email: '',
    password: '',
    nombre_negocio: '',   // ← IMPORTANTE: debe ser exactamente "nombre_negocio"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    console.log('Enviando al backend:', {
      nombre_dueño: formData.nombre_dueño,
      email: formData.email,
      password: formData.password,
      nombre_negocio: formData.nombre_negocio,
    });
    
    try {
      const response = await api.post('/auth/register', {
        nombre_dueño: formData.nombre_dueño,
        email: formData.email,
        password: formData.password,
        nombre_negocio: formData.nombre_negocio,
      });
      
      console.log('Respuesta:', response.data);
      alert('✅ Registro exitoso!');
      navigate('/login');
      
    } catch (err: any) {
      console.error('Error detallado:', err);
      
      if (err.response?.data?.mensaje) {
        setError(err.response.data.mensaje);
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Error al registrar. Intenta de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="text-4xl mb-3">🌮</div>
            <h1 className="text-2xl font-bold">Registra tu restaurante</h1>
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
                className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none transition"
                placeholder="Nombre del dueño"
                required
              />
            </div>

            <div>
              <input
                type="text"
                value={formData.nombre_negocio}
                onChange={(e) => setFormData({ ...formData, nombre_negocio: e.target.value })}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none transition"
                placeholder="Nombre del restaurante"
                required
              />
            </div>

            <div>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none transition"
                placeholder="Correo electrónico"
                required
              />
            </div>

            <div>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none transition"
                placeholder="Contraseña"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl font-semibold text-white hover:shadow-lg transition disabled:opacity-50"
            >
              {loading ? 'Registrando...' : 'Registrar restaurante'}
            </button>

            <p className="text-center text-sm text-gray-500">
              ¿Ya tienes cuenta?{' '}
              <button type="button" onClick={() => navigate('/login')} className="text-orange-400 hover:underline">
                Inicia sesión
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}