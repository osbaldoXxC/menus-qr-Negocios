import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Footer } from '../components/Footer';

export function CuestionarioIA() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [respuestas, setRespuestas] = useState({
    sabor_antojo: '',
    dieta: 'ninguna',
    alergias: [] as string[],
    ocasion: 'Solo'
  });

  const alergiasComunes = [
    '🥜 Cacahuate', '🍤 Camarón', '🥛 Lacteos', '🌾 Gluten', '🥚 Huevo'
  ];

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Guardar respuestas y navegar al feed
      localStorage.setItem('cuestionario', JSON.stringify(respuestas));
      navigate('/descubrir');
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const toggleAlergia = (alergia: string) => {
    setRespuestas(prev => ({
      ...prev,
      alergias: prev.alergias.includes(alergia)
        ? prev.alergias.filter(a => a !== alergia)
        : [...prev.alergias, alergia]
    }));
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="fixed top-0 left-0 right-0 bg-black/90 backdrop-blur-md z-50 border-b border-gray-800">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌮</span>
            <span className="font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              MexxicanMX
            </span>
          </div>
          <div className="text-sm text-gray-500">Paso {step} de 3</div>
        </div>
      </nav>

      <div className="pt-20 pb-20 px-4 min-h-screen flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="w-full bg-gray-800 rounded-full h-1 mb-8">
            <div 
              className="bg-gradient-to-r from-orange-500 to-red-500 h-1 rounded-full transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            ></div>
          </div>

          {step === 1 && (
            <div className="animate-fadeIn">
              <div className="text-center mb-8">
                <div className="text-5xl mb-3">🤤</div>
                <h2 className="text-2xl font-bold mb-2">¿Qué antojo tienes?</h2>
                <p className="text-gray-400 text-sm">Describe lo que se te antoja comer</p>
              </div>
              <textarea
                value={respuestas.sabor_antojo}
                onChange={(e) => setRespuestas({ ...respuestas, sabor_antojo: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:border-orange-500 focus:outline-none transition"
                placeholder="Ej: Quiero algo caldosito y muy picante para revivir el alma..."
              />
            </div>
          )}

          {step === 2 && (
            <div className="animate-fadeIn">
              <div className="text-center mb-8">
                <div className="text-5xl mb-3">🥗</div>
                <h2 className="text-2xl font-bold mb-2">Preferencias alimenticias</h2>
                <p className="text-gray-400 text-sm">¿Tienes algún tipo de dieta?</p>
              </div>
              <div className="space-y-3">
                {['ninguna', 'vegetariana', 'vegana', 'sin gluten', 'keto'].map((dieta) => (
                  <button
                    key={dieta}
                    onClick={() => setRespuestas({ ...respuestas, dieta })}
                    className={`w-full p-4 rounded-xl border transition-all ${
                      respuestas.dieta === dieta
                        ? 'border-orange-500 bg-orange-500/10 text-orange-400'
                        : 'border-gray-800 text-gray-400'
                    }`}
                  >
                    {dieta.charAt(0).toUpperCase() + dieta.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-fadeIn">
              <div className="text-center mb-8">
                <div className="text-5xl mb-3">⚠️</div>
                <h2 className="text-2xl font-bold mb-2">Alergias e intolerancias</h2>
                <p className="text-gray-400 text-sm">Selecciona las que tengas (opcional)</p>
              </div>
              <div className="flex flex-wrap gap-2 mb-8">
                {alergiasComunes.map((alergia) => (
                  <button
                    key={alergia}
                    onClick={() => toggleAlergia(alergia)}
                    className={`px-4 py-2 rounded-full text-sm transition-all ${
                      respuestas.alergias.includes(alergia)
                        ? 'bg-red-500/80 text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    {alergia}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-900/50 border border-gray-800">
                <span className="text-xl">🤖</span>
                <p className="text-xs text-gray-400">
                  La IA usará esta información para recomendarte platillos seguros y deliciosos
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <button
                onClick={handlePrev}
                className="flex-1 py-3 rounded-xl border border-gray-700 font-semibold hover:border-orange-500 transition"
              >
                Atrás
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={step === 1 && !respuestas.sabor_antojo}
              className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                step === 1 && !respuestas.sabor_antojo
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-orange-500 to-red-500 hover:shadow-lg'
              }`}
            >
              {step === 3 ? 'Descubrir platillos' : 'Continuar'}
            </button>
          </div>
        </div>
      </div>

      <Footer />

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
      `}</style>
    </div>
  );
}