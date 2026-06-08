import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-4xl animate-pulse">👤</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="fixed top-0 left-0 right-0 bg-black/90 backdrop-blur-md z-50 border-b border-gray-800">
        <div className="px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-2xl">←</button>
          <span className="font-bold">Mi Perfil</span>
        </div>
      </nav>

      <div className="pt-16 pb-20 px-4 max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center text-4xl mx-auto mb-3">
            👤
          </div>
          <h2 className="text-xl font-bold">{userData.nombre}</h2>
          <p className="text-sm text-gray-500">{userData.email}</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-800 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Información personal</h3>
          </div>

          {editando ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Nombre completo</label>
                <input
                  type="text"
                  value={userData.nombre}
                  onChange={(e) => setUserData({ ...userData, nombre: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-orange-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Correo electrónico</label>
                <input
                  type="email"
                  value={userData.email}
                  onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-orange-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Teléfono</label>
                <input
                  type="tel"
                  value={userData.telefono}
                  onChange={(e) => setUserData({ ...userData, telefono: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-orange-500 focus:outline-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setEditando(false)}
                  className="flex-1 py-2 rounded-xl border border-gray-700 text-sm"
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleGuardarPerfil}
                  disabled={saving}
                  className="flex-1 py-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl text-sm font-semibold disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-800">
                <span className="text-gray-400">Nombre</span>
                <span className="text-white">{userData.nombre}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-800">
                <span className="text-gray-400">Correo</span>
                <span className="text-white">{userData.email}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-800">
                <span className="text-gray-400">Teléfono</span>
                <span className="text-white">{userData.telefono || 'No especificado'}</span>
              </div>
              <button
                onClick={() => setEditando(true)}
                className="w-full mt-4 py-2 rounded-xl border border-gray-700 text-sm hover:border-orange-500 transition"
              >
                Editar perfil
              </button>
            </div>
          )}
        </div>

        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-800 mb-6">
          <h3 className="font-semibold mb-4">Mi restaurante</h3>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-gray-800">
              <span className="text-gray-400">Nombre</span>
              <span className="text-white">{userData.restaurante}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-800">
              <span className="text-gray-400">Plan actual</span>
              <span className="text-orange-400 font-semibold">{userData.plan}</span>
            </div>
            <button
              onClick={() => navigate('/precios')}
              className="w-full mt-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-sm font-semibold"
            >
              Actualizar plan
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-800">
          <h3 className="font-semibold mb-4">Cambiar contraseña</h3>
          <form onSubmit={handleCambiarPassword} className="space-y-4">
            <input
              type="password"
              placeholder="Contraseña actual"
              value={passwordData.actual}
              onChange={(e) => setPasswordData({ ...passwordData, actual: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none"
              required
            />
            <input
              type="password"
              placeholder="Nueva contraseña"
              value={passwordData.nueva}
              onChange={(e) => setPasswordData({ ...passwordData, nueva: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none"
              required
            />
            <input
              type="password"
              placeholder="Confirmar nueva contraseña"
              value={passwordData.confirmar}
              onChange={(e) => setPasswordData({ ...passwordData, confirmar: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none"
              required
            />
            <button
              type="submit"
              disabled={saving}
              className="w-full py-2 rounded-xl border border-gray-700 text-sm hover:border-orange-500 transition disabled:opacity-50"
            >
              {saving ? 'Actualizando...' : 'Actualizar contraseña'}
            </button>
          </form>
        </div>

        <button
          onClick={() => authService.logout()}
          className="w-full mt-6 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 font-semibold text-sm hover:bg-red-500/20 transition"
        >
          Cerrar sesión
        </button>
      </div>

      <Footer />
    </div>
  );
}