import React from 'react';
import type { Cliente } from '../../../types/cliente.types';
import { Edit, Trash2, User } from 'lucide-react';
import './ListaClientes.css';

interface Props {
  clientes: Cliente[];
  onEdit: (cliente: Cliente) => void;
  onDelete: (id: number) => void;
}

const ListaClientes: React.FC<Props> = ({ clientes, onEdit, onDelete }) => {
  const clientesArray = Array.isArray(clientes) ? clientes : [];

  const getCategoriaClass = (categoria: string) => {
    switch (categoria) {
      case 'VIP': return 'badge-vip';
      case 'FRECUENTE': return 'badge-frecuente';
      case 'RECURRENTE': return 'badge-recurrente';
      case 'NUEVO': return 'badge-nuevo';
      case 'INACTIVO': return 'badge-cat-inactivo';
      default: return 'badge-nuevo';
    }
  };

  return (
    <div className="lista-clientes-container">
      <div className="tabla-wrapper">
        <table className="tabla-clientes">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Teléfono</th>
              <th>Email</th>
              <th>Puntos</th>
              <th>Seguimiento</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clientesArray.length === 0 ? (
              <tr>
                <td colSpan={9} className="sin-datos">
                  <User size={32} className="icono-vacio-inline" />
                  No hay clientes registrados
                </td>
              </tr>
            ) : (
              clientesArray.map((cliente) => (
                <tr key={cliente.idCliente}>
                  <td>{cliente.idCliente}</td>
                  <td className="cell-nombre">
                    {cliente.nombre}
                    {cliente.referencia && (
                      <span className="cell-sub">{cliente.referencia}</span>
                    )}
                  </td>
                  <td>
                    <span className={`badge ${getCategoriaClass(cliente.categoriacliente)}`}>
                      {cliente.categoriacliente}
                    </span>
                  </td>
                  <td>{cliente.telefono || '-'}</td>
                  <td>{cliente.email || '-'}</td>
                  <td>{cliente.puntosfidelidad || 0}</td>
                  <td>
                    <span className="text-seguimiento">
                      {cliente.estatus_seguimiento.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td>
                    {cliente.estatus === 1 ? (
                      <span className="badge badge-activo">Activo</span>
                    ) : (
                      <span className="badge badge-inactivo">Inactivo</span>
                    )}
                  </td>
                  <td>
                    <div className="acciones-btns">
                      <button
                        className="btn-accion btn-editar"
                        onClick={() => onEdit(cliente)}
                        title="Editar cliente"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className="btn-accion btn-eliminar"
                        onClick={() => onDelete(cliente.idCliente)}
                        title="Eliminar cliente"
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

export default ListaClientes;
