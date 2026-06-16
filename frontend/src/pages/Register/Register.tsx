import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import api from '../../services/api';

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
      await api.post('/auth/register', {
        nombre_dueño: formData.nombre_dueño,
        email: formData.email,
        password: formData.password,
        nombre_negocio: formData.nombre_negocio,
      });

      navigate('/login', { state: { registered: true } });
    } catch (err: any) {
      setError(
        err.response?.data?.mensaje ||
          err.response?.data?.error ||
          'Error al registrar. Intenta de nuevo.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#000000] text-[#F5F5F7] min-h-screen flex flex-col">
      <Header />

      <div className="flex-1 flex items-center justify-center px-5 py-20">
        <motion.div
          className="w-full max-w-[440px]"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Header */}
          <div className="text-center mb-10">
            <motion.span
              className="text-4xl mb-5 block"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, duration: 0.4, ease: 'easeOut' }}
            >
              🍽️
            </motion.span>
            <h1 className="text-2xl font-bold mb-2 tracking-[-0.015em]">
              Registra tu restaurante
            </h1>
            <p className="text-[15px] text-[#A1A1A6]">
              Únete a 500+ restaurantes que ya usan MexxicanMX
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <motion.div
                className="p-4 rounded-apple-lg bg-[#FF453A]/5 border border-[#FF453A]/15 text-[#FF453A] text-[14px] text-center"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                {error}
              </motion.div>
            )}

            {/* Dueño */}
            <div>
              <label className="sr-only">Nombre del dueño</label>
              <input
                type="text"
                value={formData.nombre_dueño}
                onChange={(e) =>
                  setFormData({ ...formData, nombre_dueño: e.target.value })
                }
                className="w-full px-5 py-3.5 bg-white/[0.03] border border-white/[0.06] rounded-apple-lg text-[15px] text-[#F5F5F7] placeholder-[#6E6E73] focus:border-[#2997FF]/40 focus:outline-none focus:bg-white/[0.04] transition-all duration-200"
                placeholder="Nombre del dueño"
                required
              />
            </div>

            {/* Restaurante */}
            <div>
              <label className="sr-only">Nombre del restaurante</label>
              <input
                type="text"
                value={formData.nombre_negocio}
                onChange={(e) =>
                  setFormData({ ...formData, nombre_negocio: e.target.value })
                }
                className="w-full px-5 py-3.5 bg-white/[0.03] border border-white/[0.06] rounded-apple-lg text-[15px] text-[#F5F5F7] placeholder-[#6E6E73] focus:border-[#2997FF]/40 focus:outline-none focus:bg-white/[0.04] transition-all duration-200"
                placeholder="Nombre del restaurante"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="sr-only">Correo electrónico</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-5 py-3.5 bg-white/[0.03] border border-white/[0.06] rounded-apple-lg text-[15px] text-[#F5F5F7] placeholder-[#6E6E73] focus:border-[#2997FF]/40 focus:outline-none focus:bg-white/[0.04] transition-all duration-200"
                placeholder="Correo electrónico"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="sr-only">Contraseña</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full px-5 py-3.5 bg-white/[0.03] border border-white/[0.06] rounded-apple-lg text-[15px] text-[#F5F5F7] placeholder-[#6E6E73] focus:border-[#2997FF]/40 focus:outline-none focus:bg-white/[0.04] transition-all duration-200"
                placeholder="Contraseña"
                required
              />
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.97 }}
              className="w-full py-3.5 bg-[#2997FF] text-white rounded-full text-[15px] font-medium hover:bg-[#40A9FF] transition-all duration-250 hover:shadow-[0_0_24px_rgba(41,151,255,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Registrando...' : 'Registrar restaurante'}
            </motion.button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/[0.06]" />
              </div>
              <div className="relative flex justify-center text-[12px]">
                <span className="px-4 bg-[#000000] text-[#6E6E73]">o</span>
              </div>
            </div>

            {/* Login link */}
            <p className="text-center text-[14px] text-[#A1A1A6]">
              ¿Ya tienes cuenta?{' '}
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-[#2997FF] hover:text-[#40A9FF] font-medium transition-colors"
              >
                Inicia sesión
              </button>
            </p>

            <p className="text-center mt-4 text-[12px] text-[#6E6E73]">
              Al registrarte aceptas nuestros términos y política de privacidad.
            </p>
          </form>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}