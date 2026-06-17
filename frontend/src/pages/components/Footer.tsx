import { useNavigate } from 'react-router-dom';

export function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="bg-black border-t border-white/[0.08] backdrop-blur-sm">
      <div className="mx-auto max-w-[1400px] px-5 md:px-6 lg:px-8">
        {/* Main grid */}
        <div className="py-12 md:py-16 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="text-2xl">🌮</span>
              <span className="text-[17px] font-semibold text-[#F5F5F7]">MexxicanMX</span>
            </div>
            <p className="text-[13px] text-[#86868B] leading-relaxed max-w-[240px]">
              Motor de descubrimiento gastronómico impulsado por IA. Encuentra tu platillo perfecto.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-[13px] font-semibold text-[#F5F5F7] mb-4 tracking-[-0.01em]">
              Producto
            </h4>
            <ul className="space-y-2.5">
              <li>
                <button
                  onClick={() => navigate('/como-funciona')}
                  className="text-[13px] text-[#A1A1A6] hover:text-[#F5F5F7] transition-colors duration-200"
                >
                  Cómo funciona
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/precios')}
                  className="text-[13px] text-[#A1A1A6] hover:text-[#F5F5F7] transition-colors duration-200"
                >
                  Precios
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/para-restaurantes')}
                  className="text-[13px] text-[#A1A1A6] hover:text-[#F5F5F7] transition-colors duration-200"
                >
                  Para restaurantes
                </button>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-[13px] font-semibold text-[#F5F5F7] mb-4 tracking-[-0.01em]">
              Compañía
            </h4>
            <ul className="space-y-2.5">
              <li>
                <button
                  onClick={() => navigate('/landing')}
                  className="text-[13px] text-[#A1A1A6] hover:text-[#F5F5F7] transition-colors duration-200"
                >
                  Blog
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/landing')}
                  className="text-[13px] text-[#A1A1A6] hover:text-[#F5F5F7] transition-colors duration-200"
                >
                  Contacto
                </button>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-[13px] font-semibold text-[#F5F5F7] mb-4 tracking-[-0.01em]">
              Legal
            </h4>
            <ul className="space-y-2.5">
              <li>
                <button
                  onClick={() => navigate('/landing')}
                  className="text-[13px] text-[#A1A1A6] hover:text-[#F5F5F7] transition-colors duration-200"
                >
                  Privacidad
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/landing')}
                  className="text-[13px] text-[#A1A1A6] hover:text-[#F5F5F7] transition-colors duration-200"
                >
                  Términos
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="py-5 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[12px] text-[#6E6E73]">
            © {new Date().getFullYear()} MexxicanMX. Todos los derechos reservados.
          </p>
          <p className="text-[12px] text-[#6E6E73]">
            Hecho con 🌶️ en México
          </p>
        </div>
      </div>
    </footer>
  );
}