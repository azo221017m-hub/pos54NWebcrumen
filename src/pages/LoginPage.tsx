import { useState, useEffect, useCallback, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './LoginPage.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface UsuarioLogueado {
  id: number;
  nombre: string;
  alias: string;
  idNegocio: number;
  idRol: number;
  estatus: number;
}

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [advertencia, setAdvertencia] = useState('');
  const [intentosRestantes, setIntentosRestantes] = useState<number | null>(null);
  const [bloqueado, setBloqueado] = useState(false);
  const [showUserPopup, setShowUserPopup] = useState(false);
  const [usuarioLogueado, setUsuarioLogueado] = useState<UsuarioLogueado | null>(null);
  const navigate = useNavigate();

  // Handle escape key to close popup
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && showUserPopup) {
      setShowUserPopup(false);
      navigate('/dashboard');
    }
  }, [showUserPopup, navigate]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setAdvertencia('');
    setIntentosRestantes(null);
    setBloqueado(false);
    setIsLoading(true);

    try {
      // Llamar a la API de autenticación real
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email: email, // alias del usuario
        password: password
      });

      if (response.data.success) {
        // Guardar token y datos del usuario
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('usuario', JSON.stringify(response.data.data.usuario));
        
        // Mostrar popup con datos del usuario
        setUsuarioLogueado(response.data.data.usuario);
        setShowUserPopup(true);
      } else {
        setError(response.data.message || 'Error al iniciar sesión');
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        const errorData = err.response.data;
        
        // Manejar cuenta bloqueada
        if (errorData.bloqueado || err.response.status === 403) {
          setBloqueado(true);
          setError(errorData.message || 'Cuenta bloqueada temporalmente');
        } 
        // Manejar intentos restantes
        else if (errorData.intentosRestantes !== undefined) {
          setError(errorData.message || 'Usuario o contraseña incorrectos');
          setIntentosRestantes(errorData.intentosRestantes);
          
          if (errorData.advertencia) {
            setAdvertencia(errorData.advertencia);
          }
        } 
        // Error genérico
        else {
          setError(errorData.message || 'Usuario o contraseña incorrectos');
        }
      } else {
        setError('Error de conexión con el servidor. Verifica que el backend esté ejecutándose.');
      }
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
            <h1 className="login-title">Bienvenido</h1>
            <p className="login-subtitle">Ingresa tus credenciales para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {/* Mensaje de advertencia (cuenta próxima a bloquearse) */}
            {advertencia && !bloqueado && (
              <div className="warning-message" style={{
                backgroundColor: '#fff3cd',
                color: '#856404',
                padding: '12px 16px',
                borderRadius: '8px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                border: '1px solid #ffeaa7'
              }}>
                <svg style={{ width: '20px', height: '20px', flexShrink: 0 }} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="12" y1="9" x2="12" y2="13" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="12" y1="17" x2="12.01" y2="17" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <span>{advertencia}</span>
              </div>
            )}

            {/* Mensaje de cuenta bloqueada */}
            {bloqueado && (
              <div className="blocked-message" style={{
                backgroundColor: '#f8d7da',
                color: '#721c24',
                padding: '16px',
                borderRadius: '8px',
                marginBottom: '16px',
                border: '1px solid #f5c6cb'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <svg style={{ width: '24px', height: '24px', flexShrink: 0 }} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" strokeWidth="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" strokeWidth="2"/>
                    <line x1="12" y1="15" x2="12" y2="15" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <strong>Cuenta Bloqueada</strong>
                </div>
                <p style={{ margin: '0', fontSize: '14px' }}>
                  {error}
                </p>
                <p style={{ margin: '8px 0 0 0', fontSize: '13px', opacity: 0.9 }}>
                  Tu cuenta se desbloqueará automáticamente en 30 minutos desde el último intento fallido.
                </p>
              </div>
            )}

            {/* Mensaje de error estándar */}
            {error && !bloqueado && (
              <div className="error-message">
                <svg className="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                  <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                {error}
              </div>
            )}

            {/* Contador de intentos restantes */}
            {intentosRestantes !== null && intentosRestantes > 0 && !bloqueado && (
              <div style={{
                backgroundColor: intentosRestantes === 1 ? '#fff3cd' : '#d1ecf1',
                color: intentosRestantes === 1 ? '#856404' : '#0c5460',
                padding: '10px 14px',
                borderRadius: '6px',
                marginBottom: '16px',
                fontSize: '14px',
                textAlign: 'center',
                border: `1px solid ${intentosRestantes === 1 ? '#ffeaa7' : '#bee5eb'}`
              }}>
                {intentosRestantes === 1 ? '⚠️' : 'ℹ️'} Te {intentosRestantes === 1 ? 'queda' : 'quedan'} <strong>{intentosRestantes}</strong> {intentosRestantes === 1 ? 'intento' : 'intentos'}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                <svg className="label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="12" cy="7" r="4" strokeWidth="2"/>
                </svg>
                Usuario o Email
              </label>
              <input
                type="text"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                placeholder="Ingresa tu usuario o email"
                required
                autoComplete="username"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                <svg className="label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" strokeWidth="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" strokeWidth="2"/>
                </svg>
                Contraseña
              </label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input"
                  placeholder="Ingresa tu contraseña"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" strokeWidth="2" strokeLinecap="round"/>
                      <line x1="1" y1="1" x2="23" y2="23" strokeWidth="2"/>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeWidth="2"/>
                      <circle cx="12" cy="12" r="3" strokeWidth="2"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="form-options">
              <label className="checkbox-label">
                <input type="checkbox" className="checkbox-input" />
                <span className="checkbox-text">Recordarme</span>
              </label>
              <a href="#" className="forgot-link">¿Olvidaste tu contraseña?</a>
            </div>

            <button
              type="submit"
              className={`submit-button ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  Ingresando...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>

          <div className="login-footer">
            <p className="footer-text">
              ¿No tienes una cuenta? <a href="#" className="footer-link">Contacta al administrador</a>
            </p>
            <p className="version-text">Ver 12.25.18-55</p>
          </div>
        </div>
      </div>

      {/* Popup de datos del usuario logueado */}
      {showUserPopup && usuarioLogueado && (
        <div 
          className="user-popup-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="popup-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowUserPopup(false);
              navigate('/dashboard');
            }
          }}
        >
          <div className="user-popup">
            <div className="user-popup-header">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="user-popup-icon" aria-hidden="true">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeWidth="2" strokeLinecap="round"/>
                <polyline points="22 4 12 14.01 9 11.01" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <h3 id="popup-title">¡Bienvenido!</h3>
            </div>
            <div className="user-popup-body">
              <p className="user-popup-subtitle">Has iniciado sesión correctamente</p>
              <div className="user-popup-data">
                <div className="user-data-row">
                  <span className="data-label">Nombre:</span>
                  <span className="data-value">{usuarioLogueado.nombre}</span>
                </div>
                <div className="user-data-row">
                  <span className="data-label">ID Usuario:</span>
                  <span className="data-value">{usuarioLogueado.id}</span>
                </div>
                <div className="user-data-row">
                  <span className="data-label">Alias:</span>
                  <span className="data-value">{usuarioLogueado.alias}</span>
                </div>
                <div className="user-data-row">
                  <span className="data-label">ID Negocio:</span>
                  <span className="data-value">{usuarioLogueado.idNegocio}</span>
                </div>
                <div className="user-data-row">
                  <span className="data-label">Estatus:</span>
                  <span className={`data-value status-badge ${usuarioLogueado.estatus === 1 ? 'active' : 'inactive'}`}>
                    {usuarioLogueado.estatus === 1 ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                <div className="user-data-row">
                  <span className="data-label">ID Rol:</span>
                  <span className="data-value">{usuarioLogueado.idRol}</span>
                </div>
              </div>
            </div>
            <button 
              className="user-popup-btn"
              onClick={() => {
                setShowUserPopup(false);
                navigate('/dashboard');
              }}
              autoFocus
            >
              Continuar al Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
