// src/pages/Pantalla.tsx
import React, { useState } from "react";
import HeaderMenu from "../pages/HeaderMenu";
import ClienteForm from "../components/ClienteForm";

const Pantalla: React.FC = () => {
  const [mostrarClienteForm, setMostrarClienteForm] = useState(false);

  const handleClientesClick = () => {
    setMostrarClienteForm(true);
  };

  const handleSubmit = (datos: any) => {
    console.log("Guardar datos del cliente:", datos);
    setMostrarClienteForm(false);
  };

  const handleCancel = () => {
    setMostrarClienteForm(false);
  };

  return (
    <div>
      <HeaderMenu onClientesClick={handleClientesClick} />

      <div style={{ paddingTop: "80px" }}>
        {/* Se muestra ClienteForm solo si mostrarClienteForm es true */}
        {mostrarClienteForm && (
          <ClienteForm visible={mostrarClienteForm} onSubmit={handleSubmit} onCancel={handleCancel} />
        )}
      </div>
    </div>
  );
};

export default Pantalla;
