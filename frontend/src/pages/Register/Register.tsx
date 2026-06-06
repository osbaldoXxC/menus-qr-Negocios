import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

type UserRole = 'comensal' | 'restaurante';

export function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [role, setRole] = useState<UserRole>('comensal');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nombre: '',
    restauranteNombre: '',
  });
  const [aceptaTerminos, setAceptaTerminos] = useState(false);

  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'restaurante') {
      setRole('restaurante');
    } else if (roleParam === 'comensal') {
      setRole('comensal');
    }
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Registro:', { role, ...formData });
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      
      <div className="flex items-center justify-center min-h-screen px-4 pt-20 pb-20">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="text-4xl mb-3">🌮</div>
            <h1 className="text-2xl font-semibold text-white mb-2">Crear cuenta</h1>
            <p className="text-sm text-gray-500">
              {role === 'comensal' ? 'Descubre los mejores sabores' : 'Registra tu restaurante'}
            </p>
          </div>

          <div className="flex gap-2 mb-8 bg-white/5 rounded-xl p-1">
            <button
              onClick={() => setRole('comensal')}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
                role === 'comensal' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'
              }`}
            >
              Comensal
            </button>
            <button
              onClick={() => setRole('restaurante')}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
                role === 'restaurante' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'
              }`}
            >
              Restaurante
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="w-full px-0 py-3 bg-transparent border-b border-white/10 text-white text-base placeholder-gray-600 focus:border-white/30 focus:outline-none transition"
                placeholder={role === 'comensal' ? 'Nombre completo' : 'Nombre del contacto'}
                required
              />
            </div>

            {role === 'restaurante' && (
              <div>
                <input
                  type="text"
                  value={formData.restauranteNombre}
                  onChange={(e) => setFormData({ ...formData, restauranteNombre: e.target.value })}
                  className="w-full px-0 py-3 bg-transparent border-b border-white/10 text-white text-base placeholder-gray-600 focus:border-white/30 focus:outline-none transition"
                  placeholder="Nombre del restaurante"
                  required
                />
              </div>
            )}

            <div>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-0 py-3 bg-transparent border-b border-white/10 text-white text-base placeholder-gray-600 focus:border-white/30 focus:outline-none transition"
                placeholder="Correo electrónico"
                required
              />
            </div>

            <div>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-0 py-3 bg-transparent border-b border-white/10 text-white text-base placeholder-gray-600 focus:border-white/30 focus:outline-none transition"
                placeholder="Contraseña"
                required
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="terminos"
                checked={aceptaTerminos}
                onChange={(e) => setAceptaTerminos(e.target.checked)}
                className="w-4 h-4 rounded border-white/20 bg-transparent checked:bg-white checked:border-white"
              />
              <label htmlFor="terminos" className="text-xs text-gray-500">
                Acepto los <a href="#" className="text-gray-300 hover:text-white">términos</a> y{' '}
                <a href="#" className="text-gray-300 hover:text-white">política de privacidad</a>
              </label>
            </div>

            <button
              type="submit"
              disabled={!aceptaTerminos}
              className={`w-full py-3 mt-4 rounded-full font-medium text-sm transition-all ${
                aceptaTerminos ? 'bg-white text-black hover:bg-gray-200' : 'bg-white/20 text-gray-500 cursor-not-allowed'
              }`}
            >
              {role === 'comensal' ? 'Comenzar' : 'Registrar restaurante'}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-black text-gray-600">o</span>
            </div>
          </div>

          <button className="w-full py-3 rounded-full border border-white/10 text-sm text-gray-300 hover:bg-white/5 transition">
            Continuar con Google
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}