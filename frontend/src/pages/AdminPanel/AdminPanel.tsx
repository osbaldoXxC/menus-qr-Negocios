import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Footer } from '../components/Footer';
import { adminService } from '../../services/admin';

export function AdminPanel() {
  const navigate = useNavigate();
  const [restaurantes, setRestaurantes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'restaurantes' | 'pagos' | 'analytics'>('restaurantes');

  useEffect(() => {
    cargarRestaurantes();
  }, []);

  const cargarRestaurantes = async () => {
    try {
      const data = await adminService.getRestaurantes();
      setRestaurantes(data);
    } catch (error) {
      console.error('Error cargando restaurantes:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleEstado = async (id: string, estadoActual: string) => {
    const nuevoEstado = estadoActual === 'activo' ? false : true;
    const motivo = nuevoEstado ? '' : 'Bloqueado por administrador';
    try {
      await adminService.changeRestauranteStatus(id, nuevoEstado, motivo);
      await cargarRestaurantes();
    } catch (error) {
      console.error('Error cambiando estado:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-4xl animate-pulse">👑</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="fixed top-0 left-0 right-0 bg-black/90 backdrop-blur-md z-50 border-b border-gray-800">
        <div className="px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate('/')} className="text-2xl">←</button>
          <span className="font-bold">Panel Admin</span>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-sm text-gray-400">Super Admin</span>
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
              👑
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-16 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-2 mb-6 bg-gray-900/50 rounded-xl p-1">
            {[
              { id: 'restaurantes', label: '🏢 Restaurantes' },
              { id: 'pagos', label: '💰 Pagos' },
              { id: 'analytics', label: '📊 Analytics' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                  selectedTab === tab.id
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                    : 'text-gray-400'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {selectedTab === 'restaurantes' && (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-3 text-center">
                  <div className="text-2xl font-bold text-orange-500">{restaurantes.length}</div>
                  <div className="text-xs text-gray-500">Total</div>
                </div>
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-3 text-center">
                  <div className="text-2xl font-bold text-green-500">{restaurantes.filter(r => r.estado === 'activo').length}</div>
                  <div className="text-xs text-gray-500">Activos</div>
                </div>
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-3 text-center">
                  <div className="text-2xl font-bold text-red-500">{restaurantes.filter(r => r.estado === 'inactivo').length}</div>
                  <div className="text-xs text-gray-500">Inactivos</div>
                </div>
              </div>

              {restaurantes.map((rest) => (
                <div key={rest.id} className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-4 border border-gray-800">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold">{rest.nombre_negocio}</h3>
                      <p className="text-xs text-gray-500 mt-1">{rest.email}</p>
                      <div className="flex gap-3 mt-2 text-xs">
                        <span className="text-gray-500">Plan: {rest.plan}</span>
                        <span className="text-gray-500">Último pago: {rest.ultimo_pago}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                        rest.estado === 'activo' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {rest.estado === 'activo' ? 'Activo' : 'Bloqueado'}
                      </span>
                      <button
                        onClick={() => toggleEstado(rest.id, rest.estado)}
                        className={`block mt-2 text-xs ${
                          rest.estado === 'activo' 
                            ? 'text-red-400 hover:text-red-300' 
                            : 'text-green-400 hover:text-green-300'
                        }`}
                      >
                        {rest.estado === 'activo' ? 'Bloquear' : 'Activar'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedTab === 'pagos' && (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">💰</div>
              <h3 className="text-lg font-semibold mb-2">Gestión de pagos</h3>
              <p className="text-gray-500 text-sm">Próximamente</p>
            </div>
          )}

          {selectedTab === 'analytics' && (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">📊</div>
              <h3 className="text-lg font-semibold mb-2">Analytics global</h3>
              <p className="text-gray-500 text-sm">Próximamente</p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}