import { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Crown, AlertCircle } from 'lucide-react';

interface Mensaje {
  id: string;
  conversacion_id: string;
  remitente_tipo: 'restaurante' | 'admin';
  mensaje: string;
  leido: boolean;
  created_at: string;
}

export function Soporte() {
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [plan, setPlan] = useState('');
  const [conversacionId, setConversacionId] = useState<string | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const token = localStorage.getItem('access_token');
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

  useEffect(() => {
    // Primero, verificar si es plan premium
    const getRestauranteInfo = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/restaurant/info`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setPlan(data.plan || 'basico');
          if (data.plan === 'premium' || data.plan === 'prueba') {
            fetchConversacion();
          } else {
            setLoading(false);
          }
        }
      } catch (err) {
        console.error(err);
        setError('Error de conexión.');
        setLoading(false);
      }
    };
    
    getRestauranteInfo();
  }, []);

  const fetchConversacion = async () => {
    try {
      // 1. Obtener conversación actual (o crearla implícitamente al enviar el 1er msj, o tener un endpoint)
      // Como no tenemos GET /support directo a los mensajes, usamos el history de admin? No, en restaurante.
      // El backend tiene router.get('/conversations/:restaurante_id/messages', getMessages);
      // Wait, el router.get('/conversations/:restaurante_id/messages') está protegido por roles, el restaurante mismo puede leer?
      // supportRoutes dice: "router.get('/conversations/:restaurante_id/messages', getMessages);"
      // Pero el restaurante no se pasa a sí mismo su ID. Wait!
      // En el controlador, el req.user.id es el restaurante_id si el rol es restaurante.
      // Asumiremos que el backend usa token. 
      // Por simplicidad, usemos el fetch para traer los mensajes.
      const resId = JSON.parse(atob(token!.split('.')[1])).id; // parse JWT to get ID just for the url if needed

      const res = await fetch(`${API_BASE_URL}/support/conversations/${resId}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error('Error al obtener mensajes');
      }

      const data = await res.json();
      setMensajes(data.mensajes || []);
      setConversacionId(data.conversacion?.id || null);
    } catch (err: any) {
      setError(err.message || 'No se pudo cargar el chat');
    } finally {
      setLoading(false);
    }
  };

  const enviarMensaje = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoMensaje.trim()) return;

    const texto = nuevoMensaje;
    setNuevoMensaje('');
    
    // Add optimistic message
    const tempMsg: Mensaje = {
      id: Date.now().toString(),
      conversacion_id: conversacionId || '',
      remitente_tipo: 'restaurante',
      mensaje: texto,
      leido: false,
      created_at: new Date().toISOString()
    };
    
    setMensajes(prev => [...prev, tempMsg]);

    try {
      const res = await fetch(`${API_BASE_URL}/support/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ mensaje: texto })
      });

      if (!res.ok) {
        throw new Error('Error al enviar mensaje');
      }
      
      const data = await res.json();
      if (data.mensaje_obj) {
        setMensajes(prev => prev.map(m => m.id === tempMsg.id ? data.mensaje_obj : m));
      }
      
      // Auto-scroll
      setTimeout(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }, 100);
    } catch (err) {
      console.error(err);
      setError('Error al enviar. Intenta de nuevo.');
      setNuevoMensaje(texto); // restore
      setMensajes(prev => prev.filter(m => m.id !== tempMsg.id));
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [mensajes]);

  if (loading) {
    return <div className="p-8">Cargando chat de soporte...</div>;
  }

  const isPremium = plan === 'premium' || plan === 'prueba';

  if (!isPremium) {
    return (
      <div className="p-8 max-w-2xl mx-auto mt-10">
        <div className="bg-white dark:bg-apple-dark-bg-secondary p-8 rounded-3xl shadow-sm text-center space-y-4 border border-apple-border dark:border-apple-dark-border">
          <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Crown size={32} />
          </div>
          <h2 className="text-2xl font-bold">Soporte Prioritario Premium</h2>
          <p className="text-apple-text-secondary">
            Esta función es exclusiva para clientes Premium. Actualiza tu plan para tener contacto directo y prioritario con nuestro equipo técnico.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto h-[calc(100vh-80px)] flex flex-col">
      <div className="flex items-center gap-3 mb-6 bg-white dark:bg-apple-dark-bg-secondary p-4 rounded-2xl shadow-sm border border-apple-border dark:border-apple-dark-border">
        <div className="bg-blue-100 text-blue-600 p-2 rounded-xl">
          <MessageSquare size={24} />
        </div>
        <div>
          <h1 className="text-xl font-bold">Soporte Técnico</h1>
          <p className="text-xs text-apple-text-secondary flex items-center gap-1">
            <Crown size={12} className="text-yellow-500" /> Soporte Premium Activo
          </p>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 text-red-500 p-3 rounded-xl mb-4 text-sm flex items-center gap-2">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <div className="flex-1 bg-white dark:bg-apple-dark-bg-secondary rounded-2xl shadow-sm border border-apple-border dark:border-apple-dark-border flex flex-col overflow-hidden relative">
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4"
        >
          {mensajes.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-apple-text-secondary">
              <MessageSquare size={48} className="mb-4 opacity-20" />
              <p>Envía un mensaje para iniciar el chat con soporte.</p>
            </div>
          ) : (
            mensajes.map(msg => {
              const isMine = msg.remitente_tipo === 'restaurante';
              return (
                <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                  <div 
                    className={`max-w-[80%] p-3 px-4 rounded-2xl text-sm ${
                      isMine 
                        ? 'bg-apple-blue text-white rounded-br-sm' 
                        : 'bg-apple-bg dark:bg-apple-dark-bg border border-apple-border dark:border-apple-dark-border rounded-bl-sm'
                    }`}
                  >
                    <p>{msg.mensaje}</p>
                    <span className={`text-[10px] block mt-1 ${isMine ? 'text-white/70' : 'text-apple-text-tertiary'}`}>
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <form onSubmit={enviarMensaje} className="p-4 bg-apple-bg dark:bg-apple-dark-bg border-t border-apple-border dark:border-apple-dark-border flex gap-2">
          <input
            type="text"
            value={nuevoMensaje}
            onChange={(e) => setNuevoMensaje(e.target.value)}
            placeholder="Escribe tu duda o problema aquí..."
            className="flex-1 px-4 py-3 rounded-xl border border-apple-border dark:border-apple-dark-border bg-white dark:bg-apple-dark-bg-secondary focus:border-apple-blue outline-none"
          />
          <button 
            type="submit"
            disabled={!nuevoMensaje.trim()}
            className="bg-apple-blue text-white w-12 h-12 flex items-center justify-center rounded-xl disabled:opacity-50 transition-colors"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}
