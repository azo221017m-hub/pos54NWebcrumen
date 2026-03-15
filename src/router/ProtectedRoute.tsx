import { Navigate } from 'react-router-dom';
import { authService } from '../services/authService';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Componente de protección de rutas.
 * Verifica que el usuario esté autenticado (token y datos en localStorage).
 * Si no hay sesión activa, redirige al login.
 */
const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
