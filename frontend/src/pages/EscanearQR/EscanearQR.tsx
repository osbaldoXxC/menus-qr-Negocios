import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

export function EscanearQR() {
  const navigate = useNavigate();
  const [scanned, setScanned] = useState(false);
  const [menuData, setMenuData] = useState(null);

  const handleSimularEscaneo = () => {
    setScanned(true);
    setMenuData({
      restaurante: "Taquería El Mexa",
      mesa: "Mesa 5",
      menu: [
        { nombre: "Tacos al Pastor", precio: "$120", descripcion: "3 tacos con piña, cebolla y cilantro" },
        { nombre: "Quesadillas", precio: "$90", descripcion: "Quesadillas de queso Oaxaca" },
        { nombre: "Agua de Horchata", precio: "$35", descripcion: "1 litro de agua fresca" }
      ]
    });
  };

  const handleVolverAEscanear = () => {
    setScanned(false);
    setMenuData(null);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />

      <div className="pt-20 pb-24 px-4 min-h-screen flex items-center justify-center">
        <div className="w-full max-w-sm mx-auto">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 text-orange-400 px-3 py-1 rounded-full text-xs font-semibold mb-3">
              <span className="text-sm">📷</span>
              Escanear QR
            </div>
            <h1 className="text-2xl font-bold mb-1">Escanea el QR</h1>
            <p className="text-gray-400 text-xs">Apunta tu cámara al código QR del restaurante</p>
          </div>

          {!scanned ? (
            <>
              <div className="relative bg-gray-900 rounded-2xl overflow-hidden border border-gray-700 mb-5">
                <div className="aspect-square flex flex-col items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                  <div className="relative w-40 h-40">
                    <div className="absolute top-0 left-0 w-10 h-10 border-t-3 border-l-3 border-orange-500"></div>
                    <div className="absolute top-0 right-0 w-10 h-10 border-t-3 border-r-3 border-orange-500"></div>
                    <div className="absolute bottom-0 left-0 w-10 h-10 border-b-3 border-l-3 border-orange-500"></div>
                    <div className="absolute bottom-0 right-0 w-10 h-10 border-b-3 border-r-3 border-orange-500"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-5xl animate-pulse">📷</span>
                    </div>
                  </div>
                  <div className="absolute w-32 h-0.5 bg-orange-500 animate-scan"></div>
                </div>
              </div>

              <button
                onClick={handleSimularEscaneo}
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl font-semibold text-sm hover:shadow-lg transition-all"
              >
                Simular escaneo 📷
              </button>

              <p className="text-center text-gray-500 text-xs mt-3">
                En la versión final, esto abrirá la cámara
              </p>
            </>
          ) : (
            <>
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl overflow-hidden border border-gray-700">
                <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 p-4 text-center border-b border-gray-700">
                  <div className="text-4xl mb-1">🌮</div>
                  <h2 className="text-xl font-bold">{menuData.restaurante}</h2>
                  <p className="text-orange-400 text-xs">{menuData.mesa}</p>
                </div>

                <div className="p-3 space-y-2">
                  <h3 className="font-semibold text-gray-300 text-sm px-2 pt-1">Menú</h3>
                  {menuData.menu.map((item, index) => (
                    <div key={index} className="p-3 rounded-xl bg-black/30 active:bg-black/50 transition cursor-pointer">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-semibold text-sm text-white">{item.nombre}</span>
                        <span className="text-orange-400 font-semibold text-sm">{item.precio}</span>
                      </div>
                      <p className="text-gray-500 text-xs">{item.descripcion}</p>
                      <button className="mt-1 text-orange-400 text-xs hover:text-orange-300 transition">
                        Agregar al pedido +
                      </button>
                    </div>
                  ))}
                </div>

                <div className="p-3 border-t border-gray-700">
                  <button className="w-full py-2.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl font-semibold text-sm">
                    Confirmar pedido 🛒
                  </button>
                </div>
              </div>

              <button
                onClick={handleVolverAEscanear}
                className="w-full mt-3 py-2.5 rounded-xl border border-gray-700 text-gray-400 text-sm hover:border-orange-500 hover:text-orange-500 transition"
              >
                📷 Escanear otro código
              </button>
            </>
          )}
        </div>
      </div>

      <Footer />

      <style>{`
        @keyframes scan {
          0% { top: 30%; opacity: 1; }
          50% { top: 70%; opacity: 1; }
          100% { top: 30%; opacity: 1; }
        }
        .animate-scan {
          position: absolute;
          top: 30%;
          left: 50%;
          transform: translateX(-50%);
          animation: scan 2s ease-in-out infinite;
        }
        .border-t-3 { border-top-width: 3px; }
        .border-l-3 { border-left-width: 3px; }
        .border-r-3 { border-right-width: 3px; }
        .border-b-3 { border-bottom-width: 3px; }
      `}</style>
    </div>
  );
}