import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
      
      const rol = (response.rol || '').toString().toUpperCase();

      if (rol.includes('RESTAURANTE')) {
        navigate('/dashboard/restaurante');
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
    <div className="bg-[#000000] text-[#F5F5F7] min-h-screen flex flex-col">
      <Header />

      <div className="flex-1 flex items-center justify-center px-5 py-20">
        <motion.div
          className="w-full max-w-[400px]"
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
              🌮
            </motion.span>
            <h1 className="text-2xl font-bold mb-2 tracking-[-0.015em]">Bienvenido de vuelta</h1>
            <p className="text-[15px] text-[#A1A1A6]">
              Inicia sesión para continuar descubriendo
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <motion.div
                className="p-4 rounded-apple-lg bg-[#FF453A]/5 border border-[#FF453A]/15 text-[#FF453A] text-[14px] text-center"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                {error}
              </motion.div>
            )}

            {/* Email */}
            <div>
              <label className="sr-only">Correo electrónico</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-3.5 bg-white/[0.03] border border-white/[0.06] rounded-apple-lg text-[15px] text-[#F5F5F7] placeholder-[#6E6E73] focus:border-[#2997FF]/40 focus:outline-none focus:bg-white/[0.04] transition-all duration-200"
                placeholder="Correo electrónico"
                required
              />
            </div>

            {/* Password */}
            <div className="relative">
              <label className="sr-only">Contraseña</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-3.5 pr-12 bg-white/[0.03] border border-white/[0.06] rounded-apple-lg text-[15px] text-[#F5F5F7] placeholder-[#6E6E73] focus:border-[#2997FF]/40 focus:outline-none focus:bg-white/[0.04] transition-all duration-200"
                placeholder="Contraseña"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6E6E73] hover:text-[#A1A1A6] transition-colors select-none"
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.97 }}
              className="w-full py-3.5 bg-[#2997FF] text-white rounded-full text-[15px] font-medium hover:bg-[#40A9FF] transition-all duration-250 hover:shadow-[0_0_24px_rgba(41,151,255,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </motion.button>
          </form>

          {/* Footer link */}
          <p className="text-center mt-8 text-[14px] text-[#A1A1A6]">
            ¿No tienes cuenta?{' '}
            <button
              onClick={() => navigate('/register')}
              className="text-[#2997FF] hover:text-[#40A9FF] font-medium transition-colors"
            >
              Regístrate gratis
            </button>
          </p>

          <p className="text-center mt-6 text-[12px] text-[#6E6E73]">
            Tus datos se procesan de forma segura con encriptación bancaria.
          </p>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}