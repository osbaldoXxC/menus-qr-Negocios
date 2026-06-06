import { useState } from 'react';
import './Register.css';
import { Button } from '../components/Button';

type UserRole = 'comensal' | 'restaurante';

export function Register() {
  const [role, setRole] = useState<UserRole>('comensal');

  return (
    <div className="register-page">
      <div className="register-background"></div>
      
      <div className="register-card">
        <div className="brand-header">
          <div className="logo-animated">🌮</div>
          <h1>Únete a la revolución</h1>
          <p>Descubre o haz descubrir los mejores sabores de México</p>
        </div>

        <div className="role-selector">
          <button
            className={`role-btn ${role === 'comensal' ? 'active-comensal' : ''}`}
            onClick={() => setRole('comensal')}
          >
            <span className="role-icon">🍽️</span>
            <span>Soy Comensal</span>
            <span className="role-badge">Busco comer rico</span>
          </button>
          
          <button
            className={`role-btn ${role === 'restaurante' ? 'active-restaurante' : ''}`}
            onClick={() => setRole('restaurante')}
          >
            <span className="role-icon">🏢</span>
            <span>Soy Restaurante</span>
            <span className="role-badge">Quiero más clientes</span>
          </button>
        </div>

        <form className="register-form">
          {/* Formulario aquí */}
          <Button type="submit" variant="primary" size="lg" className="submit-btn">
            {role === 'comensal' ? '🍽️ Empezar a comer' : '🌮 Registrar restaurante'}
          </Button>
        </form>
      </div>
    </div>
  );
}