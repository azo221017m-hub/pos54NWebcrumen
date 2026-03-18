import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLogoutMessage } from '../services/sessionService';
import { authService } from '../services/authService';
import { rolesService } from '../services/rolesService';
import { verificarTurnoAbierto } from '../services/turnosService';
import { config } from '../config/api.config';
import './LoginPage.css';

type ServerStatus = 'waiting' | 'loading' | 'active';

export const LoginPage = () => {
  const navigate = useNavigate();
  const [logoutMessage, setLogoutMessage] = useState<string | null>(null);
  const [alias, setAlias] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serverStatus, setServerStatus] = useState<ServerStatus>('waiting');

  // Ping the backend to wake it up while the login page is displayed
  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const ping = async () => {
      if (cancelled) return;
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        try {
          const res = await fetch(`${config.apiUrl}/health`, { signal: controller.signal });
          if (!cancelled && res.ok) {
            setServerStatus('active');
            return;
          }
        } finally {
          clearTimeout(timeoutId);
        }
      } catch {
        // ignore errors, retry
      }
      if (!cancelled) {
        timer = setTimeout(ping, 3000);
      }
    };

    // Brief pause to show "waiting" state, then start polling
    timer = setTimeout(() => {
      if (!cancelled) {
        setServerStatus('loading');
        ping();
      }
    }, 600);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

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

    if (usuarioData && token) {
      const isClienteMode = localStorage.getItem('clienteMode') === 'true';
      if (isClienteMode) {
        navigate('/clientes');
        return;
      }
      const privilegio = localStorage.getItem('privilegio');
      if (privilegio === '2') {
        navigate('/ventas');
      } else {
        navigate('/dashboard');
      }
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
              navigate('/ventas');
            } else {
              authService.clearAuthData();
              setError('Solicité Abrir Turno');
            }
          } catch (turnoError) {
            console.error('Error al verificar turno:', turnoError);
            authService.clearAuthData();
            setError('Error al verificar turno. Solicite soporte.');
          }
        } else {
          navigate('/dashboard');
        }
      } else {
        setError(response.message || 'Error al iniciar sesión');

        if (response.advertencia) {
          setError(`${response.message}. ${response.advertencia}`);
        }

        if (response.bloqueado) {
          setError(`Cuenta bloqueada. ${response.message}`);
        }
      }
    } catch (err: any) {
      const errorMessage = err?.message || err?.toString() || '';
      if (
        errorMessage.includes('message channel closed') ||
        errorMessage.includes('listener indicated an asynchronous response') ||
        errorMessage.includes('Extension context invalidated')
      ) {
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
      {/* Animated background */}
      <div className="login-background">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
        <div className="cloud cloud-1"></div>
        <div className="cloud cloud-2"></div>
        <div className="cloud cloud-3"></div>
      </div>

      {/* Top bar: server status badge (while not active) or ACCEDER button (when active) */}
      <div className="login-topbar">
        {serverStatus !== 'active' ? (
          <div className={`server-status-badge server-status-${serverStatus}`}>
            {serverStatus === 'waiting' && <span>😴 Servidor CRUMEN54N en espera.</span>}
            {serverStatus === 'loading' && <span>👁️ Cargando sistema CRUMEN54N.</span>}
          </div>
        ) : (
          <button
            type="submit"
            form="login-form"
            className={`acceder-topbar-btn ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Accediendo...
              </>
            ) : (
              'ACCEDER'
            )}
          </button>
        )}
      </div>

      {/* Centered header */}
      <div className="login-header">
        <img src="/logowebposcrumen54n.svg" alt="Logo Poscrumen" className="logo-image" />
        <h1 className="title-text">Accede a la Nube y Administra tu Negocio</h1>
        <p className="subtitle-text">
          {logoutMessage || 'Ingresa tus credenciales y presiona ACCEDER para continuar.'}
        </p>
      </div>

      {/* Login form */}
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
        </div>
      </div>

      {/* Footer */}
      <div className="login-footer">
        <p className="footer-text">Hecho en Texcoco</p>
      </div>
    </div>
  );
};

export default LoginPage;
