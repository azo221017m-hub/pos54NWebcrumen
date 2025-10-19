// src/components/LoginScreen.tsx
// Pantalla de acceso con validación de usuarios y mensajes Toast

import { useState } from 'react'; // Importa hooks de React
import type { LoginData } from '../types'; // Importa tipos
import Toast from './Toast'; // Importa componente Toast
import '../styles/LoginScreenNew.css'; // Importa estilos específicos

// Interfaz para las props del componente
interface LoginScreenProps {
  onLogin: (loginData: LoginData) => Promise<boolean>; // Función de login
  isLoading: boolean; // Estado de carga
}

// Componente de pantalla de login
const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, isLoading }) => {
  // Estado para los datos del formulario
  const [formData, setFormData] = useState<LoginData>({
    usuario: '', // Campo usuario vacío
    password: '' // Campo contraseña vacío
  });

  // Estados para Toast
  const [toast, setToast] = useState<{
    isVisible: boolean;
    message: string;
    type: 'success' | 'error';
  }>({
    isVisible: false,
    message: '',
    type: 'success'
  });

  // Estado para mostrar/ocultar contraseña
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Función para mostrar toast
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({
      isVisible: true,
      message,
      type
    });
  };

  // Función para cerrar toast
  const closeToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  // Función para manejar cambios en los inputs
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target; // Extrae name y value del input
    
    setFormData(prev => ({
      ...prev, // Mantiene los datos anteriores
      [name]: value // Actualiza solo el campo modificado
    }));
    
    console.log(`📝 Campo ${name} actualizado`); // Log de cambio
  };

  // Función para manejar el envío del formulario
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault(); // Previene el comportamiento por defecto del formulario
    
    console.log('🔐 Intentando login...'); // Log de intento
    
    // Validación básica de campos
    if (!formData.usuario.trim()) {
      showToast('El usuario es requerido', 'error');
      console.log('❌ Usuario requerido'); // Log de error
      return;
    }
    
    if (!formData.password.trim()) {
      showToast('La contraseña es requerida', 'error');
      console.log('❌ Contraseña requerida'); // Log de error
      return;
    }

    try {
      // Intenta realizar el login
      console.log('🚀 [LoginScreen] Enviando datos de login:', { usuario: formData.usuario, password: '***' }); // Log de envío
      const success = await onLogin(formData);
      console.log('📋 [LoginScreen] Resultado del login:', success); // Log de resultado
      
      if (!success) {
        // Si falla el login, muestra mensaje de error
        showToast('Usuario o contraseña incorrectos', 'error');
        console.log('❌ [LoginScreen] Credenciales incorrectas'); // Log de error
        
        // Limpia la contraseña por seguridad
        setFormData(prev => ({ ...prev, password: '' }));
      } else {
        console.log('✅ [LoginScreen] Login exitoso, debería navegar automáticamente'); // Log de éxito
        showToast('¡Acceso exitoso! Bienvenido al sistema', 'success');
      }
      
    } catch (error) {
      console.error('💥 [LoginScreen] Error en login:', error); // Log de error
      showToast('Error de conexión. Inténtalo de nuevo.', 'error');
    }
  };

  return (
    <div className="login-screen">
      {/* Contenedor principal del login */}
      <div className="login-container">
        
        {/* Tarjeta del formulario de login */}
        <div className="login-card card">
          
          {/* Header con logo y título */}
          <div className="login-header">
            <div className="login-logo">
              <img 
                src="/logowebposcrumen.svg" 
                alt="POSWEBCrumen Logo" 
                className="login-logo-img"
              />
              <h1 className="login-title">POSWEBCrumen</h1>
            </div>
            <p className="login-subtitle">Accede a tu cuenta</p>
          </div>

          {/* Formulario de login */}
          <form onSubmit={handleSubmit} className="login-form">
            
            {/* Campo de usuario */}
            <div className="form-group">
              <label htmlFor="usuario" className="form-label">
                Usuario
              </label>
              <div className="input-container">
                
                <input
                  type="text"
                  id="usuario"
                  name="usuario"
                  value={formData.usuario}
                  onChange={handleInputChange}
                  className="form-input input-with-icon"
                  placeholder="Ingresa tu usuario"
                  disabled={isLoading} // Deshabilita si está cargando
                  autoComplete="username" // Autocompletado del navegador
                />
              </div>
            </div>

            {/* Campo de contraseña */}
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Contraseña
              </label>
              <div className="input-container">
                
                <input
                  type={showPassword ? 'text' : 'password'} // Alterna entre texto y contraseña
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="form-input input-with-icon"
                  placeholder="Ingresa tu contraseña"
                  disabled={isLoading} // Deshabilita si está cargando
                  autoComplete="current-password" // Autocompletado del navegador
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? '🙈' : '👁️'} {/* Icono para mostrar/ocultar */}
                </button>
              </div>
            </div>

            {/* Botón de envío */}
            <button
              type="submit"
              className="btn-primary login-button"
              disabled={isLoading} // Deshabilita si está cargando
            >
              {isLoading ? (
                <>
                  <span className="spinner"></span> {/* Spinner de carga */}
                  Iniciando sesión...
                </>
              ) : (
                <>
                  <span>🚀</span>
                  Iniciar Sesión
                </>
              )}
            </button>
          </form>

          {/* Footer del formulario */}
          <div className="login-footer">
            <p className="help-text">
              ¿Problemas para acceder? Contacta al administrador
            </p>
          </div>

        </div>
      </div>

      {/* Componente Toast para mensajes */}
      {toast.isVisible && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={closeToast}
        />
      )}
    </div>
  );
};

export default LoginScreen;