import React from 'react';
import { Edit2, Trash2, Truck, Phone, Mail, MapPin, Building2, CreditCard, CheckCircle, XCircle } from 'lucide-react';
import type { Proveedor } from '../../../types/proveedor.types';
import './ListaProveedores.css';

interface Props {
  proveedores: Proveedor[];
  onEditar: (proveedor: Proveedor) => void;
  onEliminar: (id: number) => void;
}

const ListaProveedores: React.FC<Props> = ({ proveedores, onEditar, onEliminar }) => {
  const proveedoresArray = Array.isArray(proveedores) ? proveedores : [];
  
  if (proveedoresArray.length === 0) {
    return (
      <div className="lista-proveedores-vacia">
        <Truck size={64} className="icono-vacio" />
        <h3>No hay proveedores registrados</h3>
        <p>Crea tu primer proveedor para comenzar</p>
      </div>
    );
  }

  return (
    <div className="lista-proveedores">
      {proveedoresArray.map((proveedor) => (
        <div key={proveedor.id_proveedor} className="proveedor-card">
          <div className="proveedor-card-header">
            <div className="proveedor-icon">
              <Truck size={24} />
            </div>
            <div className="proveedor-info">
              <h3 className="proveedor-nombre">{proveedor.nombre}</h3>
              {proveedor.rfc && (
                <span className="proveedor-rfc">RFC: {proveedor.rfc}</span>
              )}
            </div>
            <div className="proveedor-badges">
              {proveedor.activo === 1 ? (
                <span className="badge badge-activo">
                  <CheckCircle size={14} />
                  Activo
                </span>
              ) : (
                <span className="badge badge-inactivo">
                  <XCircle size={14} />
                  Inactivo
                </span>
              )}
            </div>
          </div>

          <div className="proveedor-card-body">
            <div className="proveedor-stats">
              {proveedor.telefono && (
                <div className="stat-item contacto">
                  <Phone size={18} />
                  <div className="stat-info">
                    <span className="stat-label">Teléfono</span>
                    <span className="stat-value">{proveedor.telefono}</span>
                  </div>
                </div>
              )}
              {proveedor.correo && (
                <div className="stat-item contacto">
                  <Mail size={18} />
                  <div className="stat-info">
                    <span className="stat-label">Correo</span>
                    <span className="stat-value">{proveedor.correo}</span>
                  </div>
                </div>
              )}
              {proveedor.direccion && (
                <div className="stat-item direccion">
                  <MapPin size={18} />
                  <div className="stat-info">
                    <span className="stat-label">Dirección</span>
                    <span className="stat-value">{proveedor.direccion}</span>
                  </div>
                </div>
              )}
              {proveedor.banco && (
                <div className="stat-item banco">
                  <Building2 size={18} />
                  <div className="stat-info">
                    <span className="stat-label">Banco</span>
                    <span className="stat-value">{proveedor.banco}</span>
                  </div>
                </div>
              )}
              {proveedor.cuenta && (
                <div className="stat-item cuenta">
                  <CreditCard size={18} />
                  <div className="stat-info">
                    <span className="stat-label">Cuenta</span>
                    <span className="stat-value">{proveedor.cuenta}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="proveedor-card-footer">
            <button
              className="btn-editar"
              onClick={() => onEditar(proveedor)}
              title="Editar proveedor"
            >
              <Edit2 size={18} />
              Editar
            </button>
            <button
              className="btn-eliminar"
              onClick={() => onEliminar(proveedor.id_proveedor)}
              title="Eliminar proveedor"
            >
              <Trash2 size={18} />
              Eliminar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ListaProveedores;
