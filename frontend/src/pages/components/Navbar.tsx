import { useNavigate } from 'react-router-dom';

export function Navbar() {
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/landing')}>
            <span className="text-3xl">🌮</span>
            <span className="text-2xl font-bold text-gradient-apple">
              MexxicanMX
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-[#A1A1A6] hover:text-[#F5F5F7] transition-colors">Características</a>
            <a href="#how-it-works" className="text-[#A1A1A6] hover:text-[#F5F5F7] transition-colors">Cómo funciona</a>
            <a href="#restaurants" className="text-[#A1A1A6] hover:text-[#F5F5F7] transition-colors">Para restaurantes</a>
            <button
              onClick={() => navigate('/login')}
              className="px-5 py-2.5 text-[14px] font-medium border border-white/[0.10] text-[#F5F5F7] rounded-full hover:border-[#2997FF]/40 hover:text-white transition-all duration-200"
            >
              Iniciar sesión
            </button>
            <button
              onClick={() => navigate('/register')}
              className="px-5 py-2.5 text-[14px] font-medium bg-[#2997FF] text-white rounded-full hover:bg-[#40A9FF] transition-all duration-200 hover:shadow-[0_0_20px_rgba(41,151,255,0.25)]"
            >
              Registrarse
            </button>
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden p-2 rounded-lg text-[#A1A1A6] hover:text-[#F5F5F7] hover:bg-white/[0.04] transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
}