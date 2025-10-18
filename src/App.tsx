// src/App.tsx
// Aplicación principal de POSWEBCrumen

import { useState, useEffect } from 'react'; // Importa hooks de React
import type { ScreenType } from './types'; // Importa tipos
import { useAuth } from './hooks/useAuth'; // Importa hook de autenticación

// Importa componentes
import PresentationScreen from './components/PresentationScreen'; // Pantalla de presentación
import LoginScreen from './components/LoginScreen'; // Pantalla de login
import HomeScreen from './components/HomeScreen'; // Pantalla principal
import ConfigNegocios from './components/ConfigNegocios'; // Configuración de negocios
import ConfigUsuarios from './components/ConfigUsuarios'; // Configuración de usuarios
import ConfigRoles from './components/ConfigRoles'; // Configuración de roles
import ConfigClientes from './components/ConfigClientes'; // Configuración de clientes
import ConfigCategorias from './components/ConfigCategorias'; // Configuración de categorías
import ConfigInsumos from './components/ConfigInsumos'; // Configuración de insumos
import FormularioNegocio from './components/FormularioNegocio'; // Formulario completo de negocio
import ConfigProductos from './components/ConfigProductos'; // Configuración de productos

// Workaround: permite pasar props no tipadas al componente cuando el tipo de props
// del componente no incluye onBack (evita error de compilación hasta ajustar tipos)
const ConfigUsuariosAny = ConfigUsuarios as any;
const ConfigRolesAny = ConfigRoles as any;
const ConfigClientesAny = ConfigClientes as any;
const ConfigCategoriasAny = ConfigCategorias as any;
const ConfigInsumosAny = ConfigInsumos as any;
const FormularioNegocioAny = FormularioNegocio as any;
const ConfigProductosAny = ConfigProductos as any;

// Importa estilos
import './styles/global.css'; // Estilos globales
import './App.css'; // Estilos específicos de App

// Componente principal de la aplicación
function App() {
  // Estado para la pantalla actual - siempre inicia con presentation
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('presentation');
  
  // Hook de autenticación
  const { user, isAuthenticated, isLoading, login, logout } = useAuth();

  // Efecto para manejar cambios en el estado de autenticación
  useEffect(() => {
    console.log('🔄 [App] Estado de autenticación cambió:', { 
      isAuthenticated, 
      user: user?.usuario, 
      currentScreen,
      isLoading 
    }); // Log de cambio
    
    // Si está autenticado y no está en una pantalla válida, va al home
    if (isAuthenticated && currentScreen !== 'home' && currentScreen !== 'config-usuarios' && currentScreen !== 'config-negocios') {
      console.log('🏠 [App] Redirigiendo a home - usuario autenticado'); // Log de redirección
      console.log('📱 [App] Cambiando currentScreen de', currentScreen, 'a home'); // Log de cambio de pantalla
      setCurrentScreen('home');
    }
    
    // Si no está autenticado y no está en login o presentación, va a login
    if (!isAuthenticated && !isLoading && currentScreen !== 'login' && currentScreen !== 'presentation') {
      console.log('🔐 [App] Redirigiendo a login - usuario no autenticado'); // Log de redirección
      setCurrentScreen('login');
    }
  }, [isAuthenticated, isLoading, user]); // Removido currentScreen de las dependencias para evitar loops

  // Función para manejar el completado de la presentación
  const handlePresentationComplete = (): void => {
    console.log('🎬 Presentación completada'); // Log de completado
    setCurrentScreen('login'); // Cambia a la pantalla de login
  };

  // Función para manejar la navegación entre pantallas
  const handleNavigate = (screen: ScreenType): void => {
    console.log('🧭 Navegando a pantalla:', screen); // Log de navegación
    setCurrentScreen(screen); // Cambia la pantalla actual
  };

  // Función para regresar al home desde pantallas de configuración
  const handleBackToHome = (): void => {
    console.log('🏠 Regresando al home'); // Log de regreso
    setCurrentScreen('home'); // Cambia al home
  };

  // Función para manejar logout
  const handleLogout = (): void => {
    console.log('🚪 Cerrando sesión desde App'); // Log de logout
    logout(); // Ejecuta logout
    setCurrentScreen('login'); // Cambia a login
  };

  // Renderiza la pantalla actual según el estado
  const renderCurrentScreen = (): React.ReactElement => {
    // Si está cargando la autenticación, muestra un loader
    if (isLoading) {
      return (
        <div className="loading-screen fullscreen center-content">
          <div className="loading-content">
            <div className="spinner"></div>
            <p>Cargando POSWEBCrumen...</p>
          </div>
        </div>
      );
    }

    // Switch para renderizar la pantalla correspondiente
    switch (currentScreen) {
      case 'presentation':
        console.log('🎬 Renderizando pantalla de presentación'); // Log de renderizado
        return <PresentationScreen onComplete={handlePresentationComplete} />;

      case 'login':
        console.log('🔐 Renderizando pantalla de login'); // Log de renderizado
        return <LoginScreen onLogin={login} isLoading={isLoading} />;

      case 'home':
        if (!isAuthenticated || !user) {
          console.log('❌ Usuario no autenticado, redirigiendo a login'); // Log de error
          setCurrentScreen('login');
          return <div></div>; // Componente vacío temporal
        }
        console.log('🏠 Renderizando pantalla principal'); // Log de renderizado
        return (
          <HomeScreen 
            user={user} 
            onNavigate={handleNavigate}
            onLogout={handleLogout}
          />
        );

      case 'config-usuarios':
        if (!isAuthenticated || !user) {
          console.log('❌ Usuario no autenticado, redirigiendo a login'); // Log de error
          setCurrentScreen('login');
          return <div></div>; // Componente vacío temporal
        }
        console.log('👥 Renderizando configuración de usuarios'); // Log de renderizado
        return <ConfigUsuariosAny currentUser={user} onBack={handleBackToHome} />;

      case 'config-negocios':
        if (!isAuthenticated || !user) {
          console.log('❌ Usuario no autenticado, redirigiendo a login'); // Log de error
          setCurrentScreen('login');
          return <div></div>; // Componente vacío temporal
        }
        console.log('🏢 Renderizando configuración de negocios'); // Log de renderizado
        return <ConfigNegocios onBack={handleBackToHome} />;

      case 'config-roles':
        if (!isAuthenticated || !user) {
          console.log('❌ Usuario no autenticado, redirigiendo a login'); // Log de error
          setCurrentScreen('login');
          return <div></div>; // Componente vacío temporal
        }
        console.log('👥 Renderizando configuración de roles'); // Log de renderizado
        return <ConfigRolesAny currentUser={user} onBack={handleBackToHome} />;

      case 'config-clientes':
        if (!isAuthenticated || !user) {
          console.log('❌ Usuario no autenticado, redirigiendo a login'); // Log de error
          setCurrentScreen('login');
          return <div></div>; // Componente vacío temporal
        }
        console.log('👥 Renderizando configuración de clientes'); // Log de renderizado
        return <ConfigClientesAny currentUser={user} onBack={handleBackToHome} />;

      case 'config-categorias':
        if (!isAuthenticated || !user) {
          console.log('❌ Usuario no autenticado, redirigiendo a login'); // Log de error
          setCurrentScreen('login');
          return <div></div>; // Componente vacío temporal
        }
        console.log('🏷️ Renderizando configuración de categorías'); // Log de renderizado
        return <ConfigCategoriasAny onNavigate={handleNavigate} currentUser={user} />;

      case 'config-insumos':
        if (!isAuthenticated || !user) {
          console.log('❌ Usuario no autenticado, redirigiendo a login'); // Log de error
          setCurrentScreen('login');
          return <div></div>; // Componente vacío temporal
        }
        console.log('📦 Renderizando configuración de insumos'); // Log de renderizado
        return <ConfigInsumosAny onNavigate={handleNavigate} currentUser={user} />;

      case 'config-productos':
        if (!isAuthenticated || !user) {
          console.log('❌ Usuario no autenticado, redirigiendo a login'); // Log de error
          setCurrentScreen('login');
          return <div></div>; // Componente vacío temporal
        }
        console.log('📦 Renderizando configuración de productos'); // Log de renderizado
        return <ConfigProductosAny user={user} onNavigate={handleNavigate} />;

      case 'formulario-negocio':
        if (!isAuthenticated || !user) {
          console.log('❌ Usuario no autenticado, redirigiendo a login'); // Log de error
          setCurrentScreen('login');
          return <div></div>; // Componente vacío temporal
        }
        console.log('🏢 Renderizando formulario de negocio completo'); // Log de renderizado
        return <FormularioNegocioAny currentUser={user} onBack={handleBackToHome} />;

      default:
        console.log('❓ Pantalla desconocida, redirigiendo a presentación'); // Log de error
        setCurrentScreen('presentation');
        return <div></div>; // Componente vacío temporal
    }
  };

  return (
    <div className="app-container">
      {renderCurrentScreen()}
    </div>
  );
}

export default App;
