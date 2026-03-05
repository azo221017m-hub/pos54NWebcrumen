import React from 'react';
import { Edit2, Trash2, Truck, CheckCircle, XCircle } from 'lucide-react';
import type { Proveedor } from '../../../types/proveedor.types';
import './ListaProveedores.css';

interface Props {
  proveedores: Proveedor[];
  onEditar: (proveedor: Proveedor) => void;
  onEliminar: (id: number) => void;
}

const ListaProveedores: React.FC<Props> = ({ proveedores, onEditar, onEliminar }) => {
  const proveedoresArray = Array.isArray(proveedores) ? proveedores : [];

  return (
    <div className="lista-proveedores-container">
      <div className="tabla-wrapper">
        <table className="tabla-proveedores">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>RFC</th>
              <th>Teléfono</th>
              <th>Correo</th>
              <th>Banco</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {proveedoresArray.length === 0 ? (
              <tr>
                <td colSpan={8} className="sin-datos">
                  <Truck size={32} className="icono-vacio-inline" />
                  No hay proveedores registrados
                </td>
              </tr>
            ) : (
              proveedoresArray.map((proveedor) => (
                <tr key={proveedor.id_proveedor}>
                  <td>{proveedor.id_proveedor}</td>
                  <td className="cell-nombre">{proveedor.nombre}</td>
                  <td>{proveedor.rfc || '-'}</td>
                  <td>{proveedor.telefono || '-'}</td>
                  <td>{proveedor.correo || '-'}</td>
                  <td>{proveedor.banco || '-'}</td>
                  <td>
                    {proveedor.activo === 1 ? (
                      <span className="badge badge-activo">
                        <CheckCircle size={13} /> Activo
                      </span>
                    ) : (
                      <span className="badge badge-inactivo">
                        <XCircle size={13} /> Inactivo
                      </span>
                    )}
                  </td>
                  <td>
                    <div className="acciones-btns">
                      <button
                        className="btn-accion btn-editar"
                        onClick={() => onEditar(proveedor)}
                        title="Editar proveedor"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        className="btn-accion btn-eliminar"
                        onClick={() => onEliminar(proveedor.id_proveedor)}
                        title="Eliminar proveedor"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ListaProveedores;
