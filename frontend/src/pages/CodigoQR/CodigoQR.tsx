import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { restauranteService } from '../../services/restaurante';
import { getPublicMenuUrl } from '../../utils/menuUtils';

export function CodigoQR() {
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
      <div className="bg-apple-bg dark:bg-apple-dark-bg text-apple-text dark:text-apple-dark-text min-h-screen flex items-center justify-center">
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

  const menuUrl = getPublicMenuUrl(qrData?.id, qrData?.url_menu || qrData?.url_menu_local);

  const handleDescargarQR = () => {
    if (!qrData?.qr_base64) return;
    const a = document.createElement('a');
    a.href = qrData.qr_base64;
    a.download = 'codigo-qr-restaurante.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="bg-transparent text-apple-text dark:text-apple-dark-text min-h-[calc(100vh-64px)]">
      <div className="pt-16 pb-20 px-4 flex items-center justify-center min-h-[80vh]">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="text-2xl font-bold mb-6">Código QR de tu restaurante</h1>

          <motion.div
            className="bg-white p-6 rounded-apple-lg inline-block mb-6 shadow-apple-2xl dark:shadow-none dark:border dark:border-apple-dark-border"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            {qrData?.qr_base64 ? (
              <img src={qrData.qr_base64} alt="Código QR" className="w-48 h-48" />
            ) : (
              <div className="w-48 h-48 bg-apple-bg-secondary dark:bg-[#1D1D1F] rounded-apple-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-2">📷</div>
                  <div className="text-xs text-apple-text-secondary dark:text-[#A1A1A6]">Código QR</div>
                </div>
              </div>
            )}
          </motion.div>

          <p className="text-apple-text-secondary dark:text-[#A1A1A6] text-sm mb-2 font-medium">Escanea este código para ver el menú</p>
          <p className="text-apple-text-tertiary dark:text-[#6E6E73] text-xs font-semibold break-all max-w-sm mx-auto mb-8 bg-apple-bg-secondary dark:bg-[#1D1D1F] p-3 rounded-xl border border-apple-border dark:border-apple-dark-border select-all">
            {menuUrl || 'Cargando URL...'}
          </p>

          {qrData?.qr_base64 && (
            <button
              onClick={handleDescargarQR}
              className="px-8 py-3.5 bg-apple-blue text-white rounded-full text-sm font-bold hover:bg-apple-blue-hover transition-all duration-200 shadow-apple-glow active:scale-95 flex items-center gap-2 mx-auto cursor-pointer"
            >
              <span>📥</span>
              <span>Descargar QR</span>
            </button>
          )}
        </motion.div>
      </div>
    </div>
  );
}