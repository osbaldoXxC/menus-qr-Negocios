export function Footer() {
  return (
    <footer className="bg-black border-t border-gray-800 py-12 px-4 relative z-10">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8 text-center md:text-left">
          <div>
            <div className="flex items-center gap-2 justify-center md:justify-start mb-4">
              <span className="text-2xl">🌮</span>
              <span className="font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                MexxicanMX
              </span>
            </div>
            <p className="text-gray-500 text-sm">Descubre los mejores sabores de México con IA</p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Producto</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><a href="/como-funciona" className="hover:text-orange-500 transition">Cómo funciona</a></li>
              <li><a href="/precios" className="hover:text-orange-500 transition">Precios</a></li>
              <li><a href="/para-restaurantes" className="hover:text-orange-500 transition">Para restaurantes</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Compañía</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><a href="#" className="hover:text-orange-500 transition">Blog</a></li>
              <li><a href="#" className="hover:text-orange-500 transition">Prensa</a></li>
              <li><a href="#" className="hover:text-orange-500 transition">Contacto</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><a href="#" className="hover:text-orange-500 transition">Términos</a></li>
              <li><a href="#" className="hover:text-orange-500 transition">Privacidad</a></li>
              <li><a href="#" className="hover:text-orange-500 transition">Cookies</a></li>
            </ul>
          </div>
        </div>
        <div className="text-center text-gray-600 text-sm pt-8 border-t border-gray-800">
          © 2024 MexxicanMX - Motor de Descubrimiento Gastronómico con IA
        </div>
      </div>
    </footer>
  );
}