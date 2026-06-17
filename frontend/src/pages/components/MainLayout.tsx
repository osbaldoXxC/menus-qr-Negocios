import { ReactNode, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { authService } from '../../services/auth';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const location = useLocation();
  const [user, setUser] = useState(authService.getCurrentUser());

  useEffect(() => {
    const handleStorageChange = () => setUser(authService.getCurrentUser());
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const rol = user.rol?.toLowerCase() || '';
  const isDashboardUser = user.isAuthenticated && (rol === 'restaurante' || rol === 'super_admin');
  
  // Si estamos en una ruta de dashboard o el usuario es de negocio, usamos Sidebar
  const useSidebar = isDashboardUser && location.pathname.startsWith('/dashboard') || location.pathname === '/perfil' && isDashboardUser || location.pathname === '/admin';

  return (
    <div className={`flex min-h-screen relative overflow-hidden bg-apple-bg dark:bg-apple-dark-bg transition-colors duration-300 ${useSidebar ? 'flex-row' : 'flex-col'}`}>
      {/* Decorative Mesh Gradients */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-apple-blue/5 blur-[120px] dark:bg-apple-blue/10" />
        <div className="absolute top-[20%] -right-[10%] w-[35%] h-[35%] rounded-full bg-apple-accent/5 blur-[100px] dark:bg-apple-accent/10" />
        <div className="absolute -bottom-[10%] left-[20%] w-[30%] h-[30%] rounded-full bg-apple-blue/5 blur-[110px] dark:bg-apple-blue/10" />
      </div>

      {useSidebar ? (
        <Sidebar />
      ) : (
        <Header />
      )}
      
      <main className={`flex-1 relative z-10 w-full transition-all duration-300 ${useSidebar ? 'min-h-screen' : ''}`}>
        <div className="max-w-[1600px] mx-auto min-h-full">
          {children}
        </div>
      </main>
    </div>
  );
}
