import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { comensalService } from '../../services/comensal';

// ── Layout renderers ──────────────────────────────────────────────
function SimpleList({ platillos, colorPrimario }: { platillos: any[]; colorPrimario: string }) {
  return (
    <div className="space-y-1">
      {platillos.map((p: any) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center py-3 px-4 border-b border-white/[0.06]"
        >
          <div>
            <h4 className="font-semibold text-[#F5F5F7]">{p.nombre}</h4>
            <p className="text-xs text-[#A1A1A6]">{p.descripcion?.substring(0, 50)}</p>
          </div>
          <span className="font-bold text-[#F5F5F7]">${p.precio}</span>
        </motion.div>
      ))}
    </div>
  );
}

function PhotoGrid({ platillos, colorPrimario }: { platillos: any[]; colorPrimario: string }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {platillos.map((p: any) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-apple-lg overflow-hidden bg-white/[0.03] border border-white/[0.05] hover:border-[#2997FF]/30 transition"
        >
          <div className="h-28 flex items-center justify-center text-4xl bg-gradient-to-br from-white/[0.03] to-white/[0.06]">
            🍽️
          </div>
          <div className="p-3">
            <h4 className="font-semibold text-sm text-[#F5F5F7] truncate">{p.nombre}</h4>
            <span className="font-bold text-sm text-[#F5F5F7]">${p.precio}</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function DetailedCards({ platillos, colorPrimario }: { platillos: any[]; colorPrimario: string }) {
  return (
    <div className="space-y-4">
      {platillos.map((p: any) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-apple-lg overflow-hidden bg-white/[0.03] border border-white/[0.05]"
        >
          <div className="h-40 flex items-center justify-center text-5xl bg-gradient-to-br from-white/[0.03] to-white/[0.06]">
            🌮
          </div>
          <div className="p-4">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-bold text-[#F5F5F7] text-lg">{p.nombre}</h4>
              <span
                className="px-3 py-1 rounded-apple-full text-sm font-bold text-white"
                style={{ backgroundColor: colorPrimario || '#2997FF' }}
              >
                ${p.precio}
              </span>
            </div>
            <p className="text-[#A1A1A6] text-sm leading-relaxed">
              {p.descripcion || 'Delicioso platillo preparado con ingredientes frescos.'}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ── Layout switcher ───────────────────────────────────────────────
function LayoutRenderer({
  type,
  platillos,
  colorPrimario,
}: {
  type: string;
  platillos: any[];
  colorPrimario: string;
}) {
  switch (type) {
    case 'LISTA_SIMPLE':
      return <SimpleList platillos={platillos} colorPrimario={colorPrimario} />;
    case 'CUADRICULA_FOTOS':
      return <PhotoGrid platillos={platillos} colorPrimario={colorPrimario} />;
    case 'TARJETAS_DETALLADAS':
    default:
      return <DetailedCards platillos={platillos} colorPrimario={colorPrimario} />;
  }
}

// ── Main component ────────────────────────────────────────────────
export function EscanearQR() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [menuData, setMenuData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      cargarMenu();
    }
  }, [id]);

  const cargarMenu = async () => {
    try {
      const data = await comensalService.getMenuByQR(id!);
      setMenuData(data);
    } catch (err: any) {
      setError(err.response?.data?.mensaje || 'Error al cargar el menú');
    } finally {
      setLoading(false);
    }
  };

  const handleSimularEscaneo = () => {
    navigate('/escanear/restaurante-123');
  };

  if (loading) {
    return (
      <div className="bg-[#000000] text-[#F5F5F7] min-h-screen flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="text-5xl"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            📷
          </motion.div>
          <p className="text-[#6E6E73] mt-3">Cargando menú digital...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#000000] text-[#F5F5F7] min-h-screen">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-120px)] pt-20 px-4">
          <div className="text-center">
            <motion.div className="text-5xl mb-4" initial={{ scale: 0 }} animate={{ scale: 1 }}>
              ⚠️
            </motion.div>
            <h2 className="text-xl font-bold mb-2">Error</h2>
            <p className="text-[#A1A1A6] text-sm mb-6">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="btn-apple btn-apple-primary text-sm py-2.5 px-5"
            >
              Volver al inicio
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!menuData) {
    return (
      <div className="bg-[#000000] text-[#F5F5F7] min-h-screen">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-120px)] pt-20 px-4">
          <div className="text-center">
            <div className="relative glass rounded-apple-lg overflow-hidden border border-white/[0.06] mb-6 max-w-sm mx-auto">
              <div className="aspect-square flex flex-col items-center justify-center bg-gradient-to-br from-[#1D1D1F] to-[#000000]">
                <div className="relative w-40 h-40">
                  <div className="absolute top-0 left-0 w-10 h-10 border-t-3 border-l-3 border-[#2997FF]" />
                  <div className="absolute top-0 right-0 w-10 h-10 border-t-3 border-r-3 border-[#2997FF]" />
                  <div className="absolute bottom-0 left-0 w-10 h-10 border-b-3 border-l-3 border-[#2997FF]" />
                  <div className="absolute bottom-0 right-0 w-10 h-10 border-b-3 border-r-3 border-[#2997FF]" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.span className="text-5xl" animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
                      📷
                    </motion.span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleSimularEscaneo}
              className="w-full py-3 bg-[#2997FF] hover:bg-[#40A9FF] rounded-apple-full font-semibold text-sm max-w-sm mx-auto transition-all duration-200"
            >
              Simular escaneo 📷
            </button>

            <p className="text-center text-[#6E6E73] text-xs mt-3">
              Ingresa un ID de restaurante para ver el menú
            </p>
          </div>
        </div>
        <Footer />

        <style>{`
          .border-t-3 { border-top-width: 3px; }
          .border-l-3 { border-left-width: 3px; }
          .border-r-3 { border-right-width: 3px; }
          .border-b-3 { border-bottom-width: 3px; }
        `}</style>
      </div>
    );
  }

  const tema = menuData.restaurante?.tema || {};
  const colorPrimario = tema.color_primario || '#2997FF';
  const colorFondo = tema.color_fondo || '#000000';
  const fuente = tema.fuente_familia || 'sans-serif';
  const layout = tema.layout_type || 'TARJETAS_DETALLADAS';

  return (
    <div
      className="bg-[#000000] text-[#F5F5F7] min-h-screen"
      style={{ fontFamily: fuente }}
    >
      {/* Banner promocional */}
      {tema.banner_promocional_activo && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-3 px-4 font-semibold text-sm text-white"
          style={{ backgroundColor: colorPrimario }}
        >
          {tema.banner_promocional_texto || '¡Promoción especial!'}
        </motion.div>
      )}

      <Header />

      <div className="pt-16 pb-24 px-4 min-h-screen">
        <div className="w-full max-w-2xl mx-auto">
          {/* Portada + Logo + Nombre restaurante */}
          <div className="mb-8">
            {tema.banner_url && (
              <img
                src={tema.banner_url}
                alt="Portada"
                className="w-full h-40 object-cover rounded-t-apple-lg"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
            {tema.logo_url && (
              <img
                src={tema.logo_url}
                alt="Logo"
                className="w-20 h-20 rounded-full mx-auto -mt-10 border-4 object-cover bg-white"
                style={{ borderColor: colorFondo }}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}

            <div
              className="rounded-apple-lg p-6 text-center mt-4 glass border border-white/[0.06]"
            >
              <div className="text-5xl mb-3">🌮</div>
              <h1 className="text-2xl font-bold">{menuData.restaurante?.nombre}</h1>
              {menuData.restaurante?.direccion && (
                <p className="text-sm text-[#A1A1A6] mt-1">{menuData.restaurante.direccion}</p>
              )}
            </div>
          </div>

          {/* Categorías con layout dinámico */}
          <div className="space-y-10">
            {menuData.categorias?.map((categoria: any, idx: number) => (
              <motion.div
                key={categoria.nombre}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-1 h-6 rounded-apple-full"
                    style={{ backgroundColor: colorPrimario }}
                  />
                  <h2 className="text-lg font-bold">{categoria.nombre}</h2>
                </div>
                <LayoutRenderer
                  type={layout}
                  platillos={categoria.platillos || []}
                  colorPrimario={colorPrimario}
                />
              </motion.div>
            ))}
          </div>

          {/* Footer note */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center text-[#6E6E73] text-xs mt-12"
          >
            Menú digital por{' '}
            <span className="text-gradient-apple font-bold">
              MexxicanMX
            </span>
          </motion.p>
        </div>
      </div>

      <Footer />
    </div>
  );
}