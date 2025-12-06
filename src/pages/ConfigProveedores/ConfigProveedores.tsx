import React from 'react';
import GestionProveedores from '../../components/proveedores/GestionProveedores/GestionProveedores';
import './ConfigProveedores.css';

export const ConfigProveedores: React.FC = () => {
  return (
    <div className="config-proveedores-page">
      <GestionProveedores />
    </div>
  );
};

export default ConfigProveedores;
