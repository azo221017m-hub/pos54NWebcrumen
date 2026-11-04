import { Navigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { clienteWebService } from '../services/clienteWebService';

/** idNegocio reservado del superusuario (ver backend/src/middlewares/auth.ts) */
const ID_NEGOCIO_SUPERUSUARIO = 99999;

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** La ruta también la usa un cliente web del portal (solo /ventas para armar su pedido) */
  permitirCliente?: boolean;
  /** Ruta de "Configuración Sistema": solo el superusuario (idNegocio 99999) */
  soloSuperUsuario?: boolean;
}

const esSuperUsuario = (): boolean => {
  try {
    const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');
    return usuario?.idNegocio === ID_NEGOCIO_SUPERUSUARIO;
  } catch {
    return false;
  }
};

/**
 * Componente de protección de rutas.
 * Verifica que el usuario esté autenticado (token y datos en localStorage).
 * Si no hay sesión activa, redirige al login.
 * Además aplica el perfil de la sesión: un cliente web solo entra a las rutas
 * marcadas con permitirCliente, y las de Configuración Sistema exigen superusuario.
 * El backend aplica las mismas reglas; esto solo evita mostrar pantallas vacías.
 */
const ProtectedRoute = ({ children, permitirCliente = false, soloSuperUsuario = false }: ProtectedRouteProps) => {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  const esCliente = clienteWebService.isClienteMode();

  if (esCliente && !permitirCliente) {
    return <Navigate to="/clientes" replace />;
  }

  if (soloSuperUsuario && (esCliente || !esSuperUsuario())) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
