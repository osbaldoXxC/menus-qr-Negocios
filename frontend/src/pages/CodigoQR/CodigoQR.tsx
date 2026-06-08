import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Footer } from '../components/Footer';
import { restauranteService } from '../../services/restaurante';

export function CodigoQR() {
  const navigate = useNavigate();
  const [qrData, setQrData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarQR();
  }, []);

  const cargarQR = async () => {
    try {
      const data = await restauranteService.getQR();
      setQrData(data);
    } catch (error) {
      console.error('Error cargando QR:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-4xl animate-pulse">📷</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="fixed top-0 left-0 right-0 bg-black/90 backdrop-blur-md z-50 border-b border-gray-800">
        <div className="px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate('/dashboard/restaurante')} className="text-2xl">←</button>
          <span className="font-bold">Mi Código QR</span>
        </div>
      </nav>

      <div className="pt-16 pb-20 px-4 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="bg-white p-6 rounded-2xl inline-block mb-6">
            {qrData?.qr_base64 ? (
              <img src={qrData.qr_base64} alt="Código QR" className="w-48 h-48" />
            ) : (
              <div className="w-48 h-48 bg-black flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-2">📷</div>
                  <div className="text-xs text-white">Código QR</div>
                </div>
              </div>
            )}
          </div>
          <p className="text-gray-400 text-sm mb-4">Escanea este código para ver el menú</p>
          <p className="text-gray-500 text-xs break-all">{qrData?.url_menu_local}</p>
          <button 
            onClick={() => window.open(qrData?.qr_base64, '_blank')}
            className="mt-6 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-full text-sm font-semibold"
          >
            📥 Descargar QR
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}