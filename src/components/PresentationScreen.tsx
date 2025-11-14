// src/components/PresentationScreen.tsx
// Pantalla de presentación con logotipo animado y frases rotativas

import { useState, useEffect } from 'react'; // Importa hooks de React
import '../styles/PresentationScreen.css'; // Importa estilos específicos

// Interfaz para las props del componente
interface PresentationScreenProps {
  onComplete: () => void; // Función que se ejecuta al completar la presentación
}

// Componente de pantalla de presentación
const PresentationScreen: React.FC<PresentationScreenProps> = ({ onComplete }) => {
  // Estado para el índice de la frase actual
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState<number>(0);
  
  // Estado para controlar la visibilidad de la frase
  const [showPhrase, setShowPhrase] = useState<boolean>(true);

  // Frases que se mostrarán una tras otra
  const phrases: string[] = [
    'Bienvenido a POSWEBCrumen', // Frase 1: Bienvenida
    'Tu solución completa Digital', // Frase 2: Descripción
    'Gestiona tu negocio de manera eficiente', // Frase 3: Beneficio
    'Control total de ventas e inventari0', // Frase 4: Características
    'Iniciando tu experiencia...' // Frase 5: Transición
  ];

  // Efecto para manejar la rotación de frases
  useEffect(() => {
    console.log('🎬 Pantalla de presentación iniciada'); // Log de inicio
    
    // Timer para cambiar las frases cada 2 segundos
    const phraseTimer = setInterval(() => {
      setShowPhrase(false); // Oculta la frase actual
      
      // Después de 300ms, cambia a la siguiente frase
      setTimeout(() => {
        setCurrentPhraseIndex((prevIndex) => {
          const nextIndex = prevIndex + 1;
          
          // Si llegamos al final de las frases
          if (nextIndex >= phrases.length) {
            console.log('✅ Presentación completada, llamando a onComplete'); // Log de completado
            clearInterval(phraseTimer); // Limpia el timer
            
            // Después de un segundo, llama a onComplete para ir al login
            setTimeout(() => {
              onComplete(); // Llama a onComplete para que App.tsx maneje el login
            }, 1000);
            
            return prevIndex; // Mantiene el índice actual
          }
          
          return nextIndex; // Avanza al siguiente índice
        });
        
        setShowPhrase(true); // Muestra la nueva frase
      }, 300); // Delay de 300ms para la transición
      
    }, 2000); // Cambio cada 2 segundos

    // Limpia el timer al desmontar el componente
    return () => {
      clearInterval(phraseTimer);
      console.log('🧹 Timer de presentación limpiado'); // Log de limpieza
    };
  }, [onComplete, phrases.length]);

  // Renderizado - solo presentación
  return (
    <div className="presentation-screen fullscreen">
      {/* Contenedor principal de la presentación */}
      <div className="presentation-content">
        
        {/* Logotipo animado con efecto de pulso */}
        <div className="logo-container">
          <img 
            src="/logocrumenpos.svg" 
            alt="POSWEBCrumen Logo" 
            className="presentation-logo"
          />
        </div>

        {/* Contenedor de frases con animación de fade */}
        <div className="phrases-container">
          <h2 
            className={`phrase ${showPhrase ? 'fade-in' : 'fade-out'}`}
            key={currentPhraseIndex} // Key para forzar re-render
          >
            {phrases[currentPhraseIndex]} {/* Muestra la frase actual */}
          </h2>
        </div>

        {/* Indicador de progreso */}
        <div className="progress-container">
          <div className="progress-dots">
            {phrases.map((_, index) => (
              <div
                key={index}
                className={`progress-dot ${index <= currentPhraseIndex ? 'active' : ''}`}
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default PresentationScreen;