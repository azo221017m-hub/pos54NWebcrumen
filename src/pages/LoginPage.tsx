import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

export const LoginPage = () => {
  const navigate = useNavigate();

  // Automatically redirect to dashboard on mount
  useEffect(() => {
    // Set a mock user in localStorage for the dashboard
    const mockUser = {
      id: 1,
      nombre: 'Usuario',
      alias: 'usuario',
      idNegocio: 1,
      idRol: 1,
      estatus: 1
    };
    localStorage.setItem('usuario', JSON.stringify(mockUser));
    
    // Redirect to dashboard
    navigate('/dashboard');
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
            <h1 className="login-title">Redirigiendo...</h1>
            <p className="login-subtitle">Por favor espera</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
