// src/App.tsx
import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Splash from "./frontend/src/pages/Splash";
import Login from "./frontend/src/pages/FormularioDeAccesoCrumenPosWeb";
import Pantalla from "./frontend/src/pages/Pantalla";
import PrivateRoute from "./frontend/src/components/PrivateRoute";

const App: React.FC = () => {
  const [logueado, setLogueado] = useState(false);

  return (
    <Routes>
      <Route path="/" element={<Splash />} />
      <Route
        path="/login"
        element={<Login onAccesoExitoso={() => setLogueado(true)} />}
      />

      {/* Ruta protegida */}
      <Route
        path="/pantalla"
        element={
          <PrivateRoute isLoggedIn={logueado}>
            <Pantalla />
          </PrivateRoute>
        }
      />

      {/* Redirección por defecto */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;