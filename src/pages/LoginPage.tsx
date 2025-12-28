import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLogoutMessage } from '../services/sessionService';
import { authService } from '../services/authService';
import { SessionInfoModal } from '../components/common/SessionInfoModal';
import './LoginPage.css';

interface SessionData {
  alias: string;
  idNegocio: number;
}

export const LoginPage = () => {
  const navigate = useNavigate();
  const [logoutMessage, setLogoutMessage] = useState<string | null>(null);
  const [alias, setAlias] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [sessionData, setSessionData] = useState<SessionData | null>(null);

  // Check for logout message and if user is already logged in
  useEffect(() => {
    // Check for logout message from session expiration
    const message = getLogoutMessage();
    if (message) {
      setLogoutMessage(message);
    }

    // Check if there's already a valid user in localStorage
    const usuarioData = localStorage.getItem('usuario');
    const token = localStorage.getItem('token');
    
    // If both user and token exist, redirect to dashboard (already logged in)
    if (usuarioData && token) {
      navigate('/dashboard');
      return;
    }
  }, [navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await authService.login(alias, password);

      if (response.success && response.data) {
        // Guardar token y datos del usuario
        authService.saveAuthData(response.data.token, response.data.usuario);
        
        // Mostrar modal con información de sesión
        setSessionData({
          alias: response.data.usuario.alias,
          idNegocio: response.data.usuario.idNegocio
        });
        setShowSessionModal(true);
      } else {
        // Mostrar mensaje de error
        setError(response.message || 'Error al iniciar sesión');
        
        // Mostrar advertencia si quedan pocos intentos
        if (response.advertencia) {
          setError(`${response.message}. ${response.advertencia}`);
        }
        
        // Si la cuenta está bloqueada
        if (response.bloqueado) {
          setError(`Cuenta bloqueada. ${response.message}`);
        }
      }
    } catch (err: any) {
      console.error('Error en login:', err);
      setError('Error de conexión. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseSessionModal = () => {
    setShowSessionModal(false);
    // Redirigir al dashboard después de cerrar el modal
    navigate('/dashboard');
  };

  return (
    <>
      {showSessionModal && sessionData && (
        <SessionInfoModal
          isOpen={showSessionModal}
          onClose={handleCloseSessionModal}
          alias={sessionData.alias}
          idNegocio={sessionData.idNegocio}
        />
      )}
    <div className="login-page">
      <div className="login-background">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="login-logo">
              <svg viewBox="0 0 100 100" className="logo-icon">
                <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2"/>
                <path d="M 30 50 L 45 35 L 70 60 L 45 65 Z" fill="currentColor"/>
                <circle cx="50" cy="50" r="8" fill="currentColor"/>
              </svg>
            </div>
            <h1 className="login-title">
              {logoutMessage ? 'Sesión Expirada' : 'Iniciar Sesión'}
            </h1>
            <p className="login-subtitle">
              {logoutMessage || 'Ingresa tus credenciales para continuar'}
            </p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            {error && (
              <div className="error-message">
                <svg className="error-icon" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                </svg>
                <span>{error}</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="alias">
                <svg className="label-icon" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                </svg>
                Usuario
              </label>
              <input
                id="alias"
                type="text"
                className="form-input"
                placeholder="Ingresa tu usuario"
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
                disabled={isLoading}
                required
                autoComplete="username"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">
                <svg className="label-icon" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                </svg>
                Contraseña
              </label>
              <div className="password-input-wrapper">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd"/>
                      <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z"/>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className={`submit-button ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  Iniciando sesión...
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                  Ingresar
                </>
              )}
            </button>
          </form>

          <div className="login-footer">
            <p className="version-text">Ver 25.27.2210</p>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default LoginPage;
