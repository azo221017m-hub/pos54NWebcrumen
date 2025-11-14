// src/hooks/useAuth.ts
// Hook personalizado para manejo de autenticación en POSWEBCrumen

import { useState, useEffect } from 'react'; // Importa hooks de React
import type { Usuario, LoginData, AuthContextType } from '../types'; // Importa tipos
import apiService from '../services/api'; // Importa servicio de API

// Hook personalizado para autenticación
export const useAuth = (): AuthContextType => {
  // Estado para el usuario autenticado
  const [user, setUser] = useState<Usuario | null>(null);
  
  // Estado para indicar si está autenticado
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  
  // Estado para indicar si está cargando
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Efecto para cargar datos de autenticación al iniciar
  useEffect(() => {
    console.log('🔍 Inicializando sistema de autenticación...'); // Log de inicialización
    setIsLoading(false); // Termina la carga inmediatamente
  }, []);

  // Función para realizar login
  const login = async (loginData: LoginData): Promise<boolean> => {
    try {
      console.log('🔐 [useAuth] Intentando login...'); // Log de intento
      setIsLoading(true); // Inicia la carga
      
      // Llama a la API para autenticarse
      const response = await apiService.login(loginData);
      console.log('📡 [useAuth] Respuesta completa del login:', response); // Log de respuesta completa
      
      if (response.success && response.data?.user) {
        // Login exitoso
        const userData = response.data.user;
        console.log('👤 [useAuth] Datos del usuario recibidos:', userData); // Log de datos del usuario

        const { authorization } = response.data as { user: Usuario; authorization?: { idNegocio: number; usuarioAuditoria: string } };
        console.log('🔍 [useAuth] Contenido de authorization:', authorization);

        let idNegocioFinal = authorization?.idNegocio ?? userData.idNegocio;
        let usuarioAuditoriaFinal = authorization?.usuarioAuditoria ?? userData.usuarioauditoria;

        console.log('🔍 [useAuth] idNegocio obtenido:', idNegocioFinal);

        if (!idNegocioFinal || idNegocioFinal === 0) {
          idNegocioFinal = 1; // Valor por defecto si no viene del backend
          console.warn('⚠️ [useAuth] idNegocio no válido recibido, se fuerza a 1');
        } else {
          console.log('✅ [useAuth] idNegocio válido recibido:', idNegocioFinal);
        }

        const userWithAudit: Usuario = {
          ...userData,
          idNegocio: idNegocioFinal,
          usuarioauditoria: usuarioAuditoriaFinal,
        };

        setUser(userWithAudit); // Establece el usuario con datos de auditoría
        console.log('👤 [useAuth] Usuario con auditoría establecido:', userWithAudit);

        setIsAuthenticated(true); // Marca como autenticado
        console.log('🔓 [useAuth] isAuthenticated establecido a: true'); // Log de autenticación

        console.log('✅ [useAuth] Login exitoso para:', userData.alias); // Log de éxito
        console.log('🛠️ Estado del usuario después del login:', userData);
        console.log('🔄 [useAuth] Estado final - isAuthenticated:', true, 'user:', userData.alias); // Log de estado
        setIsLoading(false); // Termina la carga
        return true; // Retorna éxito
        
      } else {
        // Login fallido
        console.log('❌ [useAuth] Login fallido:', response.message); // Log de fallo
        console.log('📄 [useAuth] Respuesta completa:', response); // Log de respuesta completa
        setIsLoading(false); // Termina la carga
        return false; // Retorna fallo
      }
      
    } catch (error) {
      console.error('💥 [useAuth] Error en login:', error); // Log de error
      setIsLoading(false); // Termina la carga
      return false; // Retorna fallo
    }
  };

  // Función para realizar logout
  const logout = (): void => {
    console.log('🚪 Cerrando sesión...'); // Log de logout
    
    // Limpia el estado
    setUser(null); // Remueve el usuario
    setIsAuthenticated(false); // Marca como no autenticado
    
    console.log('✅ Sesión cerrada exitosamente'); // Log de éxito
  };

  // Retorna el contexto de autenticación
  return {
    user, // Usuario actual
    isAuthenticated, // Estado de autenticación
    isLoading, // Estado de carga
    login, // Función de login
    logout, // Función de logout
  };
};

// Función para mostrar alerta de usuario logueado
export const showAlert = (user: Usuario): void => {
  console.log('🔍 [useAuth] Datos del usuario logueado:', user);
  alert(`Usuario logueado:\nAlias: ${user.alias}\nNombre: ${user.nombre}\nID Negocio: ${user.idNegocio}`);
};