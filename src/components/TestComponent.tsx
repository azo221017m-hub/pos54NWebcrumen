// src/components/TestComponent.tsx
// Componente de prueba para debugging de navegación

import React from 'react';
import type { ScreenType } from '../types';

interface TestComponentProps {
  onNavigate: (screen: ScreenType) => void;
}

const TestComponent: React.FC<TestComponentProps> = ({ onNavigate }) => {
  console.log('🧪 [TestComponent] Componente de prueba renderizado');
  
  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
      <h1>🧪 Componente de Prueba</h1>
      <p>Si ves esto, la navegación está funcionando correctamente.</p>
      <button 
        onClick={() => onNavigate('tablero-inicial')}
        style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}
      >
        ← Regresar al Tablero
      </button>
    </div>
  );
};

export default TestComponent;