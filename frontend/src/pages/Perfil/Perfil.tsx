import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { authService } from '../../services/auth';
import { restauranteService } from '../../services/restaurante';
import { User, Mail, Phone, Store, CreditCard, Lock, LogOut, ChevronRight } from 'lucide-react';

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
    plan: 'Estándar',
    estado: 'Activo',
    dias_restantes: 0,
    expira_en: '',
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
        plan: info.stats?.nombre_plan || info.plan || 'Estándar',
        estado: info.suscripcion_activa ? 'Activo' : 'Inactivo',
        dias_restantes: info.stats?.dias_restantes || 0,
        expira_en: info.stats?.expira_en ? new Date(info.stats.expira_en).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A',
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
      <div className="min-h-[60vh] flex items-center justify-center">
        <motion.div 
          className="text-4xl" 
          animate={{ scale: [1, 1.2, 1], rotate: 360 }} 
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
        >
          👤
        </motion.div>
      </div>
    );
  }

  return (
    <div className="py-8 sm:py-12 px-4 sm:px-6 lg:px-12 max-w-4xl mx-auto min-h-screen">
      <motion.div
        className="mb-8 sm:mb-12 flex flex-col md:flex-row items-center gap-6 sm:gap-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="w-24 h-24 sm:w-32 sm:h-32 shrink-0 rounded-[2rem] sm:rounded-[2.5rem] bg-apple-blue/10 border border-apple-blue/20 flex items-center justify-center text-4xl sm:text-5xl shadow-apple-md">
          👤
        </div>
        <div className="text-center md:text-left min-w-0 w-full">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3 break-words">{userData.nombre}</h1>
          <div className="flex flex-col sm:flex-row flex-wrap items-center md:items-start justify-center md:justify-start gap-3 sm:gap-4">
            <span className="flex items-center justify-center md:justify-start gap-1.5 text-apple-text-secondary font-medium break-all sm:break-words w-full sm:w-auto">
              <Mail size={16} className="shrink-0" /> 
              <span className="break-all sm:break-words">{userData.email}</span>
            </span>
            {userData.telefono && (
              <span className="flex items-center justify-center md:justify-start gap-1.5 text-apple-text-secondary font-medium w-full sm:w-auto">
                <Phone size={16} className="shrink-0" /> 
                <span>{userData.telefono}</span>
              </span>
            )}
          </div>
        </div>
      </motion.div>

      {error && (
        <motion.div
          className="mb-8 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-[14px] text-center font-bold"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          {error}
        </motion.div>
      )}

      <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
        {/* Información Personal */}
        <motion.div
          className="p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] bg-apple-bg-secondary dark:bg-apple-dark-bg-secondary border border-apple-border dark:border-apple-dark-border shadow-apple-sm flex flex-col"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-8 gap-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <User size={20} className="text-apple-blue shrink-0" />
              Datos del Dueño
            </h3>
            {!editando && (
              <button
                onClick={() => setEditando(true)}
                className="text-apple-blue font-bold text-sm hover:underline shrink-0"
              >
                Editar
              </button>
            )}
          </div>

          {editando ? (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-apple-text-tertiary ml-1">Nombre</label>
                <input
                  type="text"
                  value={userData.nombre}
                  onChange={(e) => setUserData({ ...userData, nombre: e.target.value })}
                  className="w-full px-5 py-3 bg-apple-bg dark:bg-apple-dark-bg border border-apple-border dark:border-apple-dark-border rounded-2xl focus:ring-2 focus:ring-apple-blue outline-none transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-apple-text-tertiary ml-1">Email</label>
                <input
                  type="email"
                  value={userData.email}
                  onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                  className="w-full px-5 py-3 bg-apple-bg dark:bg-apple-dark-bg border border-apple-border dark:border-apple-dark-border rounded-2xl focus:ring-2 focus:ring-apple-blue outline-none transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-apple-text-tertiary ml-1">Teléfono</label>
                <input
                  type="tel"
                  value={userData.telefono}
                  onChange={(e) => setUserData({ ...userData, telefono: e.target.value })}
                  className="w-full px-5 py-3 bg-apple-bg dark:bg-apple-dark-bg border border-apple-border dark:border-apple-dark-border rounded-2xl focus:ring-2 focus:ring-apple-blue outline-none transition-all"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setEditando(false)}
                  className="flex-1 py-3 rounded-xl border border-apple-border dark:border-apple-dark-border font-bold text-sm hover:bg-apple-bg transition-all"
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleGuardarPerfil}
                  disabled={saving}
                  className="flex-1 py-3 bg-apple-blue text-white rounded-xl font-bold text-sm shadow-apple-glow hover:bg-apple-blue-hover transition-all disabled:opacity-50"
                >
                  {saving ? '...' : 'Guardar'}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center py-3 border-b border-apple-border dark:border-apple-dark-border gap-1">
                <span className="text-apple-text-secondary font-medium whitespace-nowrap">Nombre</span>
                <span className="font-bold text-left sm:text-right break-words">{userData.nombre}</span>
              </div>
              <div className="flex flex-col sm:flex-row justify-between sm:items-center py-3 border-b border-apple-border dark:border-apple-dark-border gap-1">
                <span className="text-apple-text-secondary font-medium whitespace-nowrap">Correo</span>
                <span className="font-bold text-left sm:text-right break-all sm:break-words">{userData.email}</span>
              </div>
              <div className="flex flex-col sm:flex-row justify-between sm:items-center py-3 border-b border-apple-border dark:border-apple-dark-border gap-1">
                <span className="text-apple-text-secondary font-medium whitespace-nowrap">Teléfono</span>
                <span className="font-bold text-left sm:text-right">{userData.telefono || '—'}</span>
              </div>
            </div>
          )}
        </motion.div>

        {/* Restaurante & Plan */}
        <motion.div
          className="p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] bg-apple-bg-secondary dark:bg-apple-dark-bg-secondary border border-apple-border dark:border-apple-dark-border shadow-apple-sm flex flex-col"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-xl font-bold flex items-center gap-2 mb-8">
            <Store size={20} className="text-apple-blue shrink-0" />
            Negocio
          </h3>
          
          <div className="space-y-4 sm:space-y-6 mb-8 sm:mb-10">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center py-3 border-b border-apple-border dark:border-apple-dark-border gap-1">
              <span className="text-apple-text-secondary font-medium whitespace-nowrap">Nombre</span>
              <span className="font-bold text-left sm:text-right break-words">{userData.restaurante}</span>
            </div>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center py-3 border-b border-apple-border dark:border-apple-dark-border gap-1">
              <span className="text-apple-text-secondary font-medium whitespace-nowrap">Plan Actual</span>
              <span className="px-3 py-1 bg-apple-blue/10 text-apple-blue rounded-full text-xs font-black uppercase tracking-widest w-fit">{userData.plan}</span>
            </div>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center py-3 border-b border-apple-border dark:border-apple-dark-border gap-1">
              <span className="text-apple-text-secondary font-medium whitespace-nowrap">Estado</span>
              <span className="font-bold text-left sm:text-right">{userData.estado}</span>
            </div>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center py-3 border-b border-apple-border dark:border-apple-dark-border gap-1">
              <span className="text-apple-text-secondary font-medium whitespace-nowrap">Días restantes</span>
              <span className="font-bold text-left sm:text-right">{userData.dias_restantes} días</span>
            </div>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center py-3 border-b border-apple-border dark:border-apple-dark-border gap-1">
              <span className="text-apple-text-secondary font-medium whitespace-nowrap">Fecha de vencimiento</span>
              <span className="font-bold text-left sm:text-right">{userData.expira_en}</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/precios')}
            className="w-full flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-apple-bg dark:bg-apple-dark-bg border border-apple-border dark:border-apple-dark-border hover:border-apple-blue transition-all group mt-auto"
          >
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <div className="p-3 bg-apple-blue/10 rounded-xl text-apple-blue shrink-0">
                <CreditCard size={20} />
              </div>
              <div className="text-left min-w-0">
                <p className="font-bold text-sm truncate">Mejorar Plan</p>
                <p className="text-xs text-apple-text-tertiary truncate">Obtén más funciones</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-apple-text-tertiary group-hover:text-apple-blue transition-colors shrink-0 ml-2" />
          </button>
        </motion.div>

        {/* Seguridad */}
        <motion.div
          className="p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] bg-apple-bg-secondary dark:bg-apple-dark-bg-secondary border border-apple-border dark:border-apple-dark-border shadow-apple-sm flex flex-col"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-xl font-bold flex items-center gap-2 mb-8">
            <Lock size={20} className="text-apple-blue shrink-0" />
            Seguridad
          </h3>
          
          <form onSubmit={handleCambiarPassword} className="space-y-4">
            <input
              type="password"
              placeholder="Contraseña actual"
              value={passwordData.actual}
              onChange={(e) => setPasswordData({ ...passwordData, actual: e.target.value })}
              className="w-full px-5 py-3 bg-apple-bg dark:bg-apple-dark-bg border border-apple-border dark:border-apple-dark-border rounded-2xl focus:ring-2 focus:ring-apple-blue outline-none transition-all"
              required
            />
            <input
              type="password"
              placeholder="Nueva contraseña"
              value={passwordData.nueva}
              onChange={(e) => setPasswordData({ ...passwordData, nueva: e.target.value })}
              className="w-full px-5 py-3 bg-apple-bg dark:bg-apple-dark-bg border border-apple-border dark:border-apple-dark-border rounded-2xl focus:ring-2 focus:ring-apple-blue outline-none transition-all"
              required
            />
            <input
              type="password"
              placeholder="Confirmar nueva contraseña"
              value={passwordData.confirmar}
              onChange={(e) => setPasswordData({ ...passwordData, confirmar: e.target.value })}
              className="w-full px-5 py-3 bg-apple-bg dark:bg-apple-dark-bg border border-apple-border dark:border-apple-dark-border rounded-2xl focus:ring-2 focus:ring-apple-blue outline-none transition-all"
              required
            />
            <button
              type="submit"
              disabled={saving}
              className="w-full py-4 mt-2 rounded-2xl border-2 border-dashed border-apple-border dark:border-apple-dark-border font-bold text-apple-text-secondary hover:border-apple-blue hover:text-apple-blue transition-all disabled:opacity-50"
            >
              {saving ? 'Actualizando...' : 'Actualizar contraseña'}
            </button>
          </form>
        </motion.div>

        {/* Sesión */}
        <motion.div
          className="p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] bg-apple-bg-secondary dark:bg-apple-dark-bg-secondary border border-apple-border dark:border-apple-dark-border shadow-apple-sm flex flex-col justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <LogOut size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2">Cerrar Sesión</h3>
            <p className="text-apple-text-secondary text-sm mb-8 font-medium">¿Seguro que quieres salir de tu cuenta?</p>
            
            <button
              onClick={() => authService.logout()}
              className="w-full py-4 bg-red-500 text-white rounded-2xl font-bold shadow-lg shadow-red-500/20 hover:bg-red-600 active:scale-95 transition-all"
            >
              Salir ahora
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}