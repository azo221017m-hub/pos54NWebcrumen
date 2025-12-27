import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLogoutMessage } from '../services/sessionService';
import './LoginPage.css';

// Helper function to create a mock JWT token for development
const createMockToken = () => {
  // Create a mock JWT token with a far future expiration
  // This is for development/prototype purposes only
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({
    id: 1,
    alias: 'usuario',
    nombre: 'Usuario',
    idNegocio: 1,
    idRol: 1,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60) // Expires in 1 year
  }));
  const signature = btoa('mock-signature');
  return `${header}.${payload}.${signature}`;
};

export const LoginPage = () => {
  const navigate = useNavigate();
  const [logoutMessage, setLogoutMessage] = useState<string | null>(null);

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
    
    // If no user exists, automatically create mock user for development
    // This simulates an auto-login for prototype/development purposes
    const loginTimer = setTimeout(() => {
      const mockUser = {
        id: 1,
        nombre: 'Usuario',
        alias: 'usuario',
        idNegocio: 1,
        idRol: 1,
        estatus: 1
      };
      
      // Create mock token to prevent 401 errors
      const mockToken = createMockToken();
      
      // Store both user and token
      localStorage.setItem('usuario', JSON.stringify(mockUser));
      localStorage.setItem('token', mockToken);
      
      // Redirect to dashboard
      navigate('/dashboard');
    }, 1500); // Slightly longer delay to show the login screen briefly
    
    return () => clearTimeout(loginTimer);
  }, [navigate]);

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
            <h1 className="login-title">
              {logoutMessage ? 'Sesión Expirada' : 'Iniciando sesión...'}
            </h1>
            <p className="login-subtitle">
              {logoutMessage || 'Por favor espera'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
