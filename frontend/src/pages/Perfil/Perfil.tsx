import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { authService } from '../../services/auth';
import { restauranteService } from '../../services/restaurante';

export function Perfil() {
  const navigate = useNavigate();
  const [editando, setEditando] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userData, setUserData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    restaurante: '',
    plan: 'Pro',
  });
  const [passwordData, setPasswordData] = useState({
    actual: '',
    nueva: '',
    confirmar: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    cargarPerfil();
  }, []);

  const cargarPerfil = async () => {
    try {
      const info = await restauranteService.getRestauranteInfo();
      setUserData({
        nombre: info.nombre_dueño || '',
        email: info.email || '',
        telefono: info.telefono || '',
        restaurante: info.nombre_negocio || '',
        plan: info.plan || 'Pro',
      });
    } catch (error) {
      console.error('Error cargando perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGuardarPerfil = async () => {
    setSaving(true);
    setError('');
    try {
      await authService.updatePerfil({
        nombre: userData.nombre,
        email: userData.email,
        telefono: userData.telefono,
      });
      setEditando(false);
      alert('Perfil actualizado correctamente');
    } catch (err: any) {
      setError(err.response?.data?.mensaje || 'Error al actualizar');
    } finally {
      setSaving(false);
    }
  };

  const handleCambiarPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.nueva !== passwordData.confirmar) {
      setError('Las contraseñas no coinciden');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await authService.changePassword({
        actual: passwordData.actual,
        nueva: passwordData.nueva,
      });
      setPasswordData({ actual: '', nueva: '', confirmar: '' });
      alert('Contraseña actualizada correctamente');
    } catch (err: any) {
      setError(err.response?.data?.mensaje || 'Error al cambiar contraseña');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#000000] text-[#F5F5F7] min-h-screen flex items-center justify-center">
        <motion.div className="text-4xl" animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 1 }}>
          👤
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-[#000000] text-[#F5F5F7] min-h-screen">
      <Header />
      <div className="pt-16 pb-20 px-4 max-w-2xl mx-auto">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-24 h-24 rounded-full bg-[#2997FF]/10 border border-[#2997FF]/20 flex items-center justify-center text-4xl mx-auto mb-3">
            👤
          </div>
          <h2 className="text-xl font-bold">{userData.nombre}</h2>
          <p className="text-sm text-[#A1A1A6]">{userData.email}</p>
        </motion.div>

        {error && (
          <motion.div
            className="mb-4 p-4 rounded-apple-lg bg-[#FF453A]/5 border border-[#FF453A]/15 text-[#FF453A] text-[14px] text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            {error}
          </motion.div>
        )}

        <div className="glass rounded-apple-lg p-6 border border-white/[0.06] mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Información personal</h3>
          </div>

          {editando ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[#A1A1A6] mb-1">Nombre completo</label>
                <input
                  type="text"
                  value={userData.nombre}
                  onChange={(e) => setUserData({ ...userData, nombre: e.target.value })}
                  className="w-full px-5 py-3 bg-white/[0.03] border border-white/[0.06] rounded-apple-lg text-[15px] text-[#F5F5F7] placeholder-[#6E6E73] focus:border-[#2997FF]/40 focus:outline-none focus:bg-white/[0.04] transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm text-[#A1A1A6] mb-1">Correo electrónico</label>
                <input
                  type="email"
                  value={userData.email}
                  onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                  className="w-full px-5 py-3 bg-white/[0.03] border border-white/[0.06] rounded-apple-lg text-[15px] text-[#F5F5F7] placeholder-[#6E6E73] focus:border-[#2997FF]/40 focus:outline-none focus:bg-white/[0.04] transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm text-[#A1A1A6] mb-1">Teléfono</label>
                <input
                  type="tel"
                  value={userData.telefono}
                  onChange={(e) => setUserData({ ...userData, telefono: e.target.value })}
                  className="w-full px-5 py-3 bg-white/[0.03] border border-white/[0.06] rounded-apple-lg text-[15px] text-[#F5F5F7] placeholder-[#6E6E73] focus:border-[#2997FF]/40 focus:outline-none focus:bg-white/[0.04] transition-all duration-200"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setEditando(false)}
                  className="flex-1 py-3 rounded-apple-full border border-white/[0.10] text-sm text-[#A1A1A6] hover:border-[#2997FF]/40 hover:text-[#F5F5F7] transition-all duration-200"
                  disabled={saving}
                >
                  Cancelar
                </button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleGuardarPerfil}
                  disabled={saving}
                  className="flex-1 py-3 bg-[#2997FF] text-white rounded-apple-full text-sm font-semibold hover:bg-[#40A9FF] transition-all duration-200 hover:shadow-[0_0_20px_rgba(41,151,255,0.2)] disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : 'Guardar'}
                </motion.button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-white/[0.06]">
                <span className="text-[#A1A1A6]">Nombre</span>
                <span className="text-[#F5F5F7]">{userData.nombre}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/[0.06]">
                <span className="text-[#A1A1A6]">Correo</span>
                <span className="text-[#F5F5F7]">{userData.email}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/[0.06]">
                <span className="text-[#A1A1A6]">Teléfono</span>
                <span className="text-[#F5F5F7]">{userData.telefono || 'No especificado'}</span>
              </div>
              <button
                onClick={() => setEditando(true)}
                className="w-full mt-4 py-3 rounded-apple-full border border-white/[0.10] text-sm text-[#A1A1A6] hover:border-[#2997FF]/40 hover:text-[#F5F5F7] transition-all duration-200"
              >
                Editar perfil
              </button>
            </div>
          )}
        </div>

        <div className="glass rounded-apple-lg p-6 border border-white/[0.06] mb-6">
          <h3 className="font-semibold mb-4">Mi restaurante</h3>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-white/[0.06]">
              <span className="text-[#A1A1A6]">Nombre</span>
              <span className="text-[#F5F5F7]">{userData.restaurante}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-white/[0.06]">
              <span className="text-[#A1A1A6]">Plan actual</span>
              <span className="text-[#2997FF] font-semibold">{userData.plan}</span>
            </div>
            <button
              onClick={() => navigate('/precios')}
              className="w-full mt-4 py-3 bg-[#2997FF] text-white rounded-apple-full text-sm font-semibold hover:bg-[#40A9FF] transition-all duration-200 hover:shadow-[0_0_20px_rgba(41,151,255,0.2)]"
            >
              Actualizar plan
            </button>
          </div>
        </div>

        <div className="glass rounded-apple-lg p-6 border border-white/[0.06]">
          <h3 className="font-semibold mb-4">Cambiar contraseña</h3>
          <form onSubmit={handleCambiarPassword} className="space-y-4">
            <input
              type="password"
              placeholder="Contraseña actual"
              value={passwordData.actual}
              onChange={(e) => setPasswordData({ ...passwordData, actual: e.target.value })}
              className="w-full px-5 py-3 bg-white/[0.03] border border-white/[0.06] rounded-apple-lg text-[15px] text-[#F5F5F7] placeholder-[#6E6E73] focus:border-[#2997FF]/40 focus:outline-none focus:bg-white/[0.04] transition-all duration-200"
              required
            />
            <input
              type="password"
              placeholder="Nueva contraseña"
              value={passwordData.nueva}
              onChange={(e) => setPasswordData({ ...passwordData, nueva: e.target.value })}
              className="w-full px-5 py-3 bg-white/[0.03] border border-white/[0.06] rounded-apple-lg text-[15px] text-[#F5F5F7] placeholder-[#6E6E73] focus:border-[#2997FF]/40 focus:outline-none focus:bg-white/[0.04] transition-all duration-200"
              required
            />
            <input
              type="password"
              placeholder="Confirmar nueva contraseña"
              value={passwordData.confirmar}
              onChange={(e) => setPasswordData({ ...passwordData, confirmar: e.target.value })}
              className="w-full px-5 py-3 bg-white/[0.03] border border-white/[0.06] rounded-apple-lg text-[15px] text-[#F5F5F7] placeholder-[#6E6E73] focus:border-[#2997FF]/40 focus:outline-none focus:bg-white/[0.04] transition-all duration-200"
              required
            />
            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 rounded-apple-full border border-white/[0.10] text-sm text-[#A1A1A6] hover:border-[#2997FF]/40 hover:text-[#F5F5F7] transition-all duration-200 disabled:opacity-50"
            >
              {saving ? 'Actualizando...' : 'Actualizar contraseña'}
            </button>
          </form>
        </div>

        <button
          onClick={() => authService.logout()}
          className="w-full mt-6 py-3 rounded-apple-full bg-[#FF453A]/5 border border-[#FF453A]/15 text-[#FF453A] font-semibold text-sm hover:bg-[#FF453A]/10 transition-all duration-200"
        >
          Cerrar sesión
        </button>
      </div>

      <Footer />
    </div>
  );
}