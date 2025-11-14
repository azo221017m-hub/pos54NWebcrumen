// src/App.tsx
// Aplicación principal de POSWEBCrumen

import { useState, useEffect } from 'react'; // Importa hooks de React
import type { ScreenType } from './types'; // Importa tipos
import { useAuth } from './hooks/useAuth'; // Importa hook de autenticación

// Importa componentes
import PresentationScreen from './components/PresentationScreen'; // Pantalla de presentación
import LoginScreen from './components/LoginScreen'; // Pantalla de login
import TableroInicial from './components/TableroInicial'; // Nuevo tablero inicial
import ConfigMesas from './components/ConfigMesas'; // Configuración de mesas
import ConfigCategorias from './components/categorias/ConfigCategorias'; // Configuración de categorías
import ConfigDescuentos from './components/ConfigDescuentos'; // Configuración de descuentos
import ConfigRoldeUsuario from './components/ConfigRoldeUsuario'; // Configuración de roles de usuario
import ConfigUsuarios from './components/ConfigUsuarios'; // Configuración de usuarios del sistema
import ConfigUMedida from './components/ConfigUMedida'; // Configuración de unidades de medida
import ConfigInsumos from './components/ConfigInsumos'; // Configuración de insumos
import ConfigCuentaContable from './components/ConfigCuentaContable'; // Configuración de cuentas contables
import ConfigProveedores from './components/ConfigProveedores'; // Configuración de proveedores
import ConfigClientes from './components/ConfigClientes'; // Configuración de clientes
import ConfigNegocios from './components/ConfigNegocios'; // Configuración de negocios
import ConfigModeradores from './components/ConfigModeradores'; // Import ConfigModeradores
import ConfigCategoriaModeradores from './components/ConfigCategoriaModeradores'; // Configuración de categorías de moderadores


// Workaround: permite pasar props no tipadas al componente cuando el tipo de props
// del componente no incluye onBack (evita error de compilación hasta ajustar tipos)

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
      user: user?.alias, 
      currentScreen,
      isLoading 
    }); // Log de cambio
    
    // Si está autenticado y viene de login o presentation, va al tablero-inicial
    if (isAuthenticated && user && (currentScreen === 'login' || currentScreen === 'presentation')) {
      console.log('📊 [App] Redirigiendo a tablero-inicial - usuario autenticado'); // Log de redirección
      console.log('📱 [App] Cambiando currentScreen de', currentScreen, 'a tablero-inicial'); // Log de cambio de pantalla
      setTimeout(() => {
        setCurrentScreen('tablero-inicial');
      }, 100); // Pequeño delay para permitir que el toast se muestre
    }
    
    // Si no está autenticado y no está en login o presentación, va a login
    if (!isAuthenticated && !isLoading && currentScreen !== 'login' && currentScreen !== 'presentation') {
      console.log('🔐 [App] Redirigiendo a login - usuario no autenticado'); // Log de redirección
      setCurrentScreen('login');
    }
  }, [isAuthenticated, isLoading, user, currentScreen]);

  // Efecto para manejar eventos personalizados de navegación
  useEffect(() => {
    const handleNavigateToHome = (): void => {
      console.log('🏠 Evento navigateToHome recibido'); // Log del evento
      setCurrentScreen('tablero-inicial'); // Regresar al tablero inicial
    };

    // Agregar event listener
    window.addEventListener('navigateToHome', handleNavigateToHome);

    // Cleanup: remover event listener
    return () => {
      window.removeEventListener('navigateToHome', handleNavigateToHome);
    };
  }, []); // Sin dependencias porque solo se configura una vez

  // Función para manejar el completado de la presentación (solo presentación, no login)
  const handlePresentationComplete = (): void => {
    console.log('🎬 [handlePresentationComplete] Presentación completada, ir a login');
    setCurrentScreen('login'); // Ir al login real
  };

  // Función para manejar la navegación entre pantallas
  const handleNavigate = (screen: ScreenType): void => {
    console.log('🧭 [App] Navegando a pantalla:', screen); // Log de navegación
    console.log('🧭 [App] currentScreen antes:', currentScreen);
    setCurrentScreen(screen); // Cambia la pantalla actual
    console.log('🧭 [App] setCurrentScreen ejecutado con:', screen);
  };

  // Función para regresar al TableroInicial desde pantallas de configuración
  // Nota: la función fue removida porque no se usa actualmente; llamar directamente
  // setCurrentScreen('tablero-inicial') donde sea necesario o reinstaurar la
  // función cuando se agregue su uso.

  // Función para manejar logout integrada inline donde se usa

  // Renderiza la pantalla actual según el estado
  const renderCurrentScreen = (): React.ReactElement => {
    console.log('🎯🎯🎯 [App] renderCurrentScreen EJECUTADO con currentScreen:', currentScreen); // Log súper prominente
    console.log('🔐🔐🔐 [App] Auth state:', { isAuthenticated, isLoading, user: user?.alias }); // Log de auth
    
    // Si está cargando la autenticación, muestra un loader
    if (isLoading) {
      return (
        <div className="loading-screen fullscreen center-content">
          <div className="loading-content">
            <img 
              src="/logocrumenpos.svg" 
              alt="Logo Crumen POS" 
              className="loading-logo"
            />
            <div className="spinner"></div>
            <p>PosWebCrumen Cargando</p>
          </div>
        </div>
      );
    }

    // Switch para renderizar la pantalla correspondiente
    console.log('🔍 [App] Evaluando switch con currentScreen:', currentScreen);
    switch (currentScreen) {
      case 'presentation':
        console.log('🎬 Renderizando pantalla de presentación'); // Log de renderizado
        return <PresentationScreen onComplete={handlePresentationComplete} />;

      case 'login':
        console.log('🔐 Renderizando pantalla de login directa'); // Log de renderizado
        return (
          <LoginScreen
            onLogin={async (loginData) => {
              console.log('🔐 [App] Manejando login directamente:', loginData.usuario);
              try {
                const success = await login(loginData);
                console.log(`📋 [App] Resultado del login: ${success}`);
                if (success) {
                  return {
                    success: true,
                    idnegocio: user?.idNegocio?.toString() || '',
                    usuario: user?.alias || '',
                  };
                } else {
                  return { success: false, idnegocio: '', usuario: '' };
                }
              } catch (error) {
                console.error('💥 [App] Error en login:', error);
                return { success: false, idnegocio: '', usuario: '' };
              }
            }}
            isLoading={isLoading}
            idnegocio={user?.idNegocio?.toString() || ''} // Pass idnegocio
            usuario={user?.alias || ''} // Pass usuario
          />
        );

      case 'home':
        if (!isAuthenticated || !user) {
          console.log('❌ Usuario no autenticado, redirigiendo a login'); // Log de error
          setCurrentScreen('login');
          return <div></div>; // Componente vacío temporal
        }
        console.log('🏠 Renderizando pantalla principal'); // Log de renderizado
        // Usar TableroInicial como reemplazo para HomeScreen (componente HomeScreen no existe)
        return (
          <TableroInicial 
            user={user} 
            onNavigate={handleNavigate}
            onLogout={() => {
              logout();
              setCurrentScreen('presentation');
            }}
          />
        );
      case 'tablero-inicial':
        if (!isAuthenticated || !user) {
          console.log('❌ Usuario no autenticado, redirigiendo a login'); // Log de error
          setCurrentScreen('login');
          return <div></div>; // Componente vacío temporal
        }
        console.log('📊 Renderizando tablero inicial'); // Log de renderizado
        return (
          <TableroInicial 
            user={user} 
            onNavigate={handleNavigate}
            onLogout={() => {
              logout();
              setCurrentScreen('presentation');
            }}
          />
        );

      case 'config-categorias':
        if (!isAuthenticated || !user) {
          console.log('❌ Usuario no autenticado, redirigiendo a login'); // Log de error
          setCurrentScreen('login');
          return <div></div>; // Componente vacío temporal
        }
        console.log('🏷️ Renderizando configuración de categorías'); // Log de renderizado
  return <ConfigCategorias onNavigate={handleNavigate} />;

      case 'config-mesas':
        if (!isAuthenticated || !user) {
          console.log('❌ Usuario no autenticado, redirigiendo a login'); // Log de error
          setCurrentScreen('login');
          return <div></div>; // Componente vacío temporal
        }
        console.log('🪑 Renderizando configuración de mesas'); // Log de renderizado
        return <ConfigMesas onNavigate={handleNavigate} />;


      case 'config-descuentos':
        if (!isAuthenticated || !user) {
          console.log('❌ Usuario no autenticado, redirigiendo a login'); // Log de error
          setCurrentScreen('login');
          return <div></div>; // Componente vacío temporal
        }
        console.log('💰 Renderizando configuración de descuentos'); // Log de renderizado
        return <ConfigDescuentos onNavigate={handleNavigate} />;

      case 'config-roles':
        if (!isAuthenticated || !user) {
          console.log('❌ Usuario no autenticado, redirigiendo a login'); // Log de error
          setCurrentScreen('login');
          return <div></div>; // Componente vacío temporal
        }
        console.log('👤 Renderizando configuración de roles de usuario'); // Log de renderizado
        return <ConfigRoldeUsuario onNavigate={handleNavigate} />;

      case 'config-usuarios':
        if (!isAuthenticated || !user) {
          console.log('❌ Usuario no autenticado, redirigiendo a login'); // Log de error
          setCurrentScreen('login');
          return <div></div>; // Componente vacío temporal
        }
        console.log('👥 Renderizando configuración de usuarios del sistema'); // Log de renderizado
        return <ConfigUsuarios onNavigate={handleNavigate} />;

      case 'config-umedida':
        if (!isAuthenticated || !user) {
          console.log('❌ Usuario no autenticado, redirigiendo a login'); // Log de error
          setCurrentScreen('login');
          return <div></div>; // Componente vacío temporal
        }
        console.log('📏 Renderizando configuración de unidades de medida'); // Log de renderizado
        return <ConfigUMedida onNavigate={handleNavigate} />;

      case 'config-insumos':
        if (!isAuthenticated || !user) {
          console.log('❌ Usuario no autenticado, redirigiendo a login'); // Log de error
          setCurrentScreen('login');
          return <div></div>; // Componente vacío temporal
        }
        console.log('📦 Renderizando configuración de insumos'); // Log de renderizado
        return <ConfigInsumos onNavigate={handleNavigate} />;

      case 'config-cuenta-contable':
        if (!isAuthenticated || !user) {
          console.log('❌ Usuario no autenticado, redirigiendo a login'); // Log de error
          setCurrentScreen('login');
          return <div></div>; // Componente vacío temporal
        }
        console.log('💰 Renderizando configuración de cuentas contables'); // Log de renderizado
        return <ConfigCuentaContable onNavigate={handleNavigate} />;

      case 'config-proveedores':
        if (!isAuthenticated || !user) {
          console.log('❌ Usuario no autenticado, redirigiendo a login'); // Log de error
          setCurrentScreen('login');
          return <div></div>; // Componente vacío temporal
        }
        console.log('🏪 Renderizando configuración de proveedores'); // Log de renderizado
        return <ConfigProveedores onNavigate={handleNavigate} />;

      case 'config-clientes':
        if (!isAuthenticated || !user) {
          console.log('❌ Usuario no autenticado, redirigiendo a login'); // Log de error
          setCurrentScreen('login');
          return <div></div>; // Componente vacío temporal
        }
        console.log('👥 Renderizando configuración de clientes'); // Log de renderizado
        return <ConfigClientes onNavigate={handleNavigate} />;

      case 'config-negocios':
        if (!isAuthenticated || !user) {
          console.log('❌ Usuario no autenticado, redirigiendo a login'); // Log de error
          setCurrentScreen('login');
          return <div></div>; // Componente vacío temporal
        }
        console.log('🏢 Renderizando configuración de negocios'); // Log de renderizado
        return <ConfigNegocios onNavigate={handleNavigate} />;

      case 'config-moderadores':
        console.log('🛠 Renderizando pantalla de ConfigModeradores'); // Log de renderizado
        return <ConfigModeradores onBack={() => setCurrentScreen('tablero-inicial')} />;
      case 'config-categoria-moderadores':
        console.log('🎭 Renderizando configuración de categorías de moderadores'); // Log de renderizado
        return <ConfigCategoriaModeradores onBack={() => setCurrentScreen('tablero-inicial')} />;



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