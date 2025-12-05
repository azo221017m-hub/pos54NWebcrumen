import React from 'react';
import type { Proveedor } from '../../../types/proveedor.types';
import { Edit, Trash2, Truck, Phone, Mail, MapPin, Building2, CreditCard, CheckCircle, XCircle } from 'lucide-react';
import './ListaProveedores.css';

interface Props {
  proveedores: Proveedor[];
  onEdit: (proveedor: Proveedor) => void;
  onDelete: (id: number) => void;
}

const ListaProveedores: React.FC<Props> = ({ proveedores, onEdit, onDelete }) => {
  const proveedoresArray = Array.isArray(proveedores) ? proveedores : [];
  
  if (proveedoresArray.length === 0) {
    return (
      <div className="lista-proveedores-vacia">
        <Truck size={64} className="icono-vacio" />
        <h3>No hay proveedores registrados</h3>
        <p>Comienza agregando un nuevo proveedor</p>
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
            <div className="proveedor-header-info">
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
            <div className="proveedor-info-principal">
              {proveedor.telefono && (
                <div className="info-item">
                  <Phone size={16} />
                  <span>{proveedor.telefono}</span>
                </div>
              )}
              {proveedor.correo && (
                <div className="info-item">
                  <Mail size={16} />
                  <span>{proveedor.correo}</span>
                </div>
              )}
              {proveedor.direccion && (
                <div className="info-item">
                  <MapPin size={16} />
                  <span className="info-truncate">{proveedor.direccion}</span>
                </div>
              )}
            </div>

            <div className="proveedor-datos-bancarios">
              {proveedor.banco && (
                <div className="dato-bancario">
                  <Building2 size={16} />
                  <div className="dato-content">
                    <span className="dato-label">Banco</span>
                    <span className="dato-value">{proveedor.banco}</span>
                  </div>
                </div>
              )}
              {proveedor.cuenta && (
                <div className="dato-bancario">
                  <CreditCard size={16} />
                  <div className="dato-content">
                    <span className="dato-label">Cuenta</span>
                    <span className="dato-value">{proveedor.cuenta}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="proveedor-card-footer">
            <button
              className="btn-accion btn-editar"
              onClick={() => onEdit(proveedor)}
              title="Editar proveedor"
            >
              <Edit size={16} />
              Editar
            </button>
            <button
              className="btn-accion btn-eliminar"
              onClick={() => onDelete(proveedor.id_proveedor)}
              title="Eliminar proveedor"
            >
              <Trash2 size={16} />
              Eliminar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ListaProveedores;
