import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Header } from '../components/Header';
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
      <div className="bg-[#000000] text-[#F5F5F7] min-h-screen flex items-center justify-center">
        <motion.div
          className="text-4xl"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          📷
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-[#000000] text-[#F5F5F7] min-h-screen">
      <Header />
      <div className="pt-16 pb-20 px-4 flex items-center justify-center min-h-screen">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="text-2xl font-bold mb-6">Código QR de tu restaurante</h1>

          <motion.div
            className="bg-white p-6 rounded-apple-lg inline-block mb-6 shadow-2xl"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            {qrData?.qr_base64 ? (
              <img src={qrData.qr_base64} alt="Código QR" className="w-48 h-48" />
            ) : (
              <div className="w-48 h-48 bg-[#1D1D1F] rounded-apple-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-2">📷</div>
                  <div className="text-xs text-[#A1A1A6]">Código QR</div>
                </div>
              </div>
            )}
          </motion.div>

          <p className="text-[#A1A1A6] text-sm mb-4">Escanea este código para ver el menú</p>
          <p className="text-[#6E6E73] text-xs break-all max-w-sm mx-auto mb-6">{qrData?.url_menu_local}</p>

          {qrData?.qr_base64 && (
            <button
              onClick={() => window.open(qrData?.qr_base64, '_blank')}
              className="btn-apple btn-apple-primary text-sm py-3 px-6"
            >
              📥 Descargar QR
            </button>
          )}
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}