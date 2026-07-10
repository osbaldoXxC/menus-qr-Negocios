import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../services/api';
import { ThemeContext } from '../../context/ThemeContext';
import { Logo } from '../components/Logo';

export function RecuperarContrasena() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
      setError('');
      setSuccessMsg('');
    } else {
      navigate('/login');
    }
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      await api.post('/auth/forgot-password', { email });
      setSuccessMsg('Código enviado con éxito. Revisa tu bandeja de entrada.');
      setStep(2);
    } catch (err: any) {
      setError(err.response?.data?.mensaje || 'Error al solicitar el código de recuperación.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      await api.post('/auth/reset-password', {
        email,
        code,
        new_password: newPassword
      });
      setSuccessMsg('Contraseña restablecida con éxito. Redirigiendo...');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.mensaje || 'Error al restablecer la contraseña.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = `
    w-full px-5 py-3.5 rounded-2xl text-[15px] outline-none transition-all duration-200
    bg-black/[0.04] dark:bg-white/[0.05]
    border border-black/[0.10] dark:border-white/[0.10]
    text-[#1D1D1F] dark:text-[#F5F5F7]
    placeholder-[#AEAEB2] dark:placeholder-[#6E6E73]
    focus:border-[#0071E3] dark:focus:border-[#2997FF]
    focus:bg-black/[0.02] dark:focus:bg-white/[0.07]
  `;

  return (
    <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center px-5 py-10 transition-colors duration-300 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[50%] rounded-full bg-[#0071E3]/[0.06] dark:bg-[#2997FF]/[0.08] blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[35%] h-[45%] rounded-full bg-[#FF4A00]/[0.05] dark:bg-[#FF4A00]/[0.07] blur-[90px]" />
      </div>

      {/* Back button */}
      <motion.button
        onClick={handleBack}
        whileHover={{ x: -4 }}
        whileTap={{ scale: 0.97 }}
        className="fixed top-5 left-5 px-4 py-2.5 rounded-full bg-black/[0.05] dark:bg-white/[0.06] border border-black/[0.08] dark:border-white/[0.08] text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white transition-all text-[14px] font-semibold flex items-center gap-2 z-10"
      >
        <span>←</span>
        <span>Volver</span>
      </motion.button>

      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        className="fixed top-5 right-5 p-2.5 rounded-full bg-black/[0.05] dark:bg-white/[0.06] border border-black/[0.08] dark:border-white/[0.08] text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white transition-colors z-10"
      >
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>

      <motion.div
        className="w-full max-w-[400px] relative z-10"
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-10 text-center">
          <Logo size={64} className="mb-4" />
          <h1 className="text-[1.8rem] font-black tracking-tighter text-[#1D1D1F] dark:text-[#F5F5F7] mb-1">
            Recuperar contraseña
          </h1>
          <p className="text-[14px] text-[#86868B] dark:text-[#A1A1A6]">
            {step === 1 
              ? 'Ingresa tu correo para recibir un código de verificación.' 
              : 'Ingresa el código que te enviamos y tu nueva contraseña.'}
          </p>
        </div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 p-4 rounded-2xl bg-red-500/[0.07] border border-red-500/20 text-red-500 dark:text-red-400 text-[13px] text-center font-medium"
          >
            {error}
          </motion.div>
        )}

        {/* Success Message */}
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 p-4 rounded-2xl bg-green-500/[0.07] border border-green-500/20 text-green-600 dark:text-green-400 text-[13px] text-center font-medium"
          >
            {successMsg}
          </motion.div>
        )}

        {step === 1 ? (
          /* Step 1: Send Code Form */
          <form onSubmit={handleSendCode} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              placeholder="Correo electrónico"
              required
              autoComplete="email"
            />

            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.97 }}
              className="w-full py-3.5 mt-2 bg-[#0071E3] dark:bg-[#2997FF] text-white rounded-full text-[15px] font-bold hover:bg-[#0077ED] dark:hover:bg-[#40A9FF] transition-all duration-200 hover:shadow-[0_0_28px_rgba(0,113,227,0.3)] dark:hover:shadow-[0_0_28px_rgba(41,151,255,0.25)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Enviando código...' : 'Enviar código de recuperación'}
            </motion.button>
          </form>
        ) : (
          /* Step 2: Verification Code and Reset Password Form */
          <form onSubmit={handleResetPassword} className="space-y-4">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className={inputClass}
              placeholder="Código de verificación (6 dígitos)"
              required
              maxLength={6}
            />

            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={inputClass}
              placeholder="Nueva contraseña"
              required
            />

            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={inputClass}
              placeholder="Confirmar nueva contraseña"
              required
            />

            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.97 }}
              className="w-full py-3.5 mt-2 bg-[#0071E3] dark:bg-[#2997FF] text-white rounded-full text-[15px] font-bold hover:bg-[#0077ED] dark:hover:bg-[#40A9FF] transition-all duration-200 hover:shadow-[0_0_28px_rgba(0,113,227,0.3)] dark:hover:shadow-[0_0_28px_rgba(41,151,255,0.25)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Restableciendo contraseña...' : 'Restablecer contraseña'}
            </motion.button>
          </form>
        )}

        <div className="my-6 text-center">
          <Link to="/login" className="text-[#0071E3] dark:text-[#2997FF] font-semibold hover:underline text-[14px]">
            Regresar a iniciar sesión
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
