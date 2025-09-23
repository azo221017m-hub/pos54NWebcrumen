import React, { useState } from 'react';
import CargaCrumenPosWeb from './frontend/src/components/CargaCrumenPosWeb';
import PInicioCrumenPosWeb from './frontend/src/components/PInicioCrumenPosWeb';

function App() {
  const [cargando, setCargando] = useState(true);

  const handleCargaTerminada = () => {
    // Espera 2 segundos antes de mostrar la pantalla de inicio
    setTimeout(() => {
      setCargando(false);
    });
  };

  return (
    <>
      {cargando ? (
        <CargaCrumenPosWeb onTerminado={handleCargaTerminada} />
      ) : (
        <PInicioCrumenPosWeb onEntrarVenta={() => console.log('Entrando a venta')} />

      )}
    </>
  );
}

export default App;
