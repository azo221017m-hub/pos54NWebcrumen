import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLogoutMessage } from '../services/sessionService';
import { authService } from '../services/authService';
import { rolesService } from '../services/rolesService';
import { verificarTurnoAbierto } from '../services/turnosService';
import './LoginPage.css';

type LoginMode = 'selection' | 'cliente' | 'negocio';

export const LoginPage = () => {
  const navigate = useNavigate();
  const [logoutMessage, setLogoutMessage] = useState<string | null>(null);
  const [loginMode, setLoginMode] = useState<LoginMode>('selection');
  const [alias, setAlias] = useState('');
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    
    // If both user and token exist, redirect based on privilege
    if (usuarioData && token) {
      const privilegio = localStorage.getItem('privilegio');
      if (privilegio === '2') {
        navigate('/ventas');
      } else {
        navigate('/dashboard');
      }
      return;
    }
  }, [navigate]);

  const handleModeSelect = (mode: 'cliente' | 'negocio') => {
    setError(null);
    setAlias('');
    setTelefono('');
    setPassword('');
    setLoginMode(mode);
  };

  const handleBackToSelection = () => {
    setError(null);
    setAlias('');
    setTelefono('');
    setPassword('');
    setLoginMode('selection');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const loginIdentifier = loginMode === 'cliente' ? telefono : alias;

    try {
      const response = await authService.login(loginIdentifier, password);

      if (response.success && response.data) {
        // Limpiar cualquier sesión anterior antes de guardar la nueva
        authService.clearAuthData();
        
        // Guardar token y datos del usuario
        authService.saveAuthData(response.data.token, response.data.usuario);

        // Obtener el rol del usuario para conocer el privilegio
        let privilegio = '0';
        try {
          const rol = await rolesService.obtenerRolPorId(response.data.usuario.idRol);
          privilegio = String(rol.privilegio);
          localStorage.setItem('privilegio', privilegio);
        } catch (rolError) {
          console.error('Error al obtener rol del usuario:', rolError);
          // If role fetch fails, clear auth and notify user to avoid undefined behavior
          authService.clearAuthData();
          setError('Error al obtener perfil de acceso. Por favor, intenta de nuevo.');
          return;
        }

        // Redirigir según el privilegio
        if (privilegio === '2') {
          // Privilegio 2: verificar turno abierto
          try {
            const turno = await verificarTurnoAbierto();
            if (turno) {
              // Hay turno abierto: ir a PageVentas
              navigate('/ventas');
            } else {
              // No hay turno abierto: mostrar mensaje y cerrar sesión
              authService.clearAuthData();
              setError('Solicité Abrir Turno');
            }
          } catch (turnoError) {
            console.error('Error al verificar turno:', turnoError);
            authService.clearAuthData();
            setError('Error al verificar turno. Solicite soporte.');
          }
        } else {
          // Otros privilegios: ir al dashboard
          navigate('/dashboard');
        }
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
      // Ignorar errores de extensiones del navegador
      const errorMessage = err?.message || err?.toString() || '';
      if (
        errorMessage.includes('message channel closed') ||
        errorMessage.includes('listener indicated an asynchronous response') ||
        errorMessage.includes('Extension context invalidated')
      ) {
        // No mostrar error, es solo una extensión del navegador
        return;
      }
      
      console.error('Error en login:', err);
      setError('Error de conexión. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-background">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      {/* Header superior */}
      <div className="login-top-bar">
        <div className="login-title-top">
          <img src="/logowebposcrumen.svg" alt="Logo Poscrumen" className="logo-image-top" />
          <h1 className="title-text">Accede a la Nube y Administra tu Negocio</h1>
          <p className="subtitle-text">
            {logoutMessage || (loginMode === 'selection'
              ? 'Selecciona tu tipo de acceso para continuar.'
              : loginMode === 'cliente'
                ? 'Ingresa tu teléfono y contraseña para acceder.'
                : 'Ingresa tus credenciales y presiona ACCEDER para continuar.')}
          </p>
        </div>
        {loginMode !== 'selection' && (
          <div className="login-button-top">
            <button
              type="submit"
              form="login-form"
              className={`submit-button-top ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  Accediendo...
                </>
              ) : (
                'Acceder'
              )}
            </button>
          </div>
        )}
      </div>

      {/* Selección de modo */}
      {loginMode === 'selection' && (
        <div className="login-mode-selection">
          <button
            className="mode-button mode-button-cliente"
            onClick={() => handleModeSelect('cliente')}
          >
            <svg className="mode-button-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
            </svg>
            <span className="mode-button-label">Acceso Cliente</span>
          </button>
          <button
            className="mode-button mode-button-negocio"
            onClick={() => handleModeSelect('negocio')}
          >
            <svg className="mode-button-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/>
            </svg>
            <span className="mode-button-label">Acceso Negocio</span>
          </button>
        </div>
      )}

      {/* Formulario centrado */}
      {loginMode !== 'selection' && (
        <div className="login-container">
          <div className="login-card">
            <form id="login-form" className="login-form" onSubmit={handleSubmit}>
              {error && (
                <div className="error-message">
                  <svg className="error-icon" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              {loginMode === 'cliente' ? (
                <div className="form-group">
                  <label className="form-label" htmlFor="telefono">
                    <svg className="label-icon" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                    </svg>
                    Teléfono
                  </label>
                  <input
                    id="telefono"
                    type="tel"
                    className="form-input"
                    placeholder="Ingresa tu teléfono"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    disabled={isLoading}
                    required
                    autoComplete="tel"
                  />
                </div>
              ) : (
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
              )}

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
                    type="password"
                    className="form-input"
                    placeholder="Ingresa tu contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    required
                    autoComplete="current-password"
                  />
                </div>
              </div>
            </form>

            <div className="login-back">
              <button className="back-button" onClick={handleBackToSelection} disabled={isLoading}>
                ← Volver
              </button>
            </div>

            <div className="login-footer">
              <p className="version-text">Ver 26.04MRZ-900p</p>
            </div>
          </div>
        </div>
      )}

      {loginMode === 'selection' && (
        <div className="login-footer">
          <p className="version-text">Ver 26.04MRZ-900p</p>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
