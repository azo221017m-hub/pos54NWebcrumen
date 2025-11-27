import React from 'react';
import type { Cliente } from '../../../types/cliente.types';
import { Edit, Trash2, User, Star, Phone, Mail, MapPin, Calendar, TrendingUp } from 'lucide-react';
import './ListaClientes.css';

interface Props {
  clientes: Cliente[];
  onEdit: (cliente: Cliente) => void;
  onDelete: (id: number) => void;
}

const ListaClientes: React.FC<Props> = ({ clientes, onEdit, onDelete }) => {
  // Validación defensiva
  const clientesArray = Array.isArray(clientes) ? clientes : [];
  
  if (clientesArray.length === 0) {
    return (
      <div className="lista-clientes-vacia">
        <User size={64} className="icono-vacio" />
        <h3>No hay clientes registrados</h3>
        <p>Comienza agregando un nuevo cliente</p>
      </div>
    );
  }

  const getCategoriaColor = (categoria: string) => {
    switch (categoria) {
      case 'VIP': return 'categoria-vip';
      case 'FRECUENTE': return 'categoria-frecuente';
      case 'RECURRENTE': return 'categoria-recurrente';
      case 'NUEVO': return 'categoria-nuevo';
      case 'INACTIVO': return 'categoria-inactivo';
      default: return 'categoria-nuevo';
    }
  };

  const getSeguimientoColor = (estatus: string) => {
    switch (estatus) {
      case 'CERRADO': return 'seguimiento-cerrado';
      case 'EN_NEGOCIACIÓN': return 'seguimiento-negociacion';
      case 'EN_PROSPECCIÓN': return 'seguimiento-prospeccion';
      case 'PERDIDO': return 'seguimiento-perdido';
      default: return 'seguimiento-ninguno';
    }
  };

  const formatFecha = (fecha: Date | string | null | undefined) => {
    if (!fecha) return 'No especificado';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const renderEstrellas = (satisfaccion: number | null | undefined) => {
    if (!satisfaccion) return null;
    return (
      <div className="estrellas">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            size={14}
            className={i <= satisfaccion ? 'estrella-activa' : 'estrella-inactiva'}
            fill={i <= satisfaccion ? 'currentColor' : 'none'}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="lista-clientes">
      {clientesArray.map((cliente) => (
        <div key={cliente.idCliente} className="cliente-card">
          <div className="cliente-card-header">
            <div className="cliente-icon">
              <User size={24} />
            </div>
            <div className="cliente-header-info">
              <h3 className="cliente-nombre">{cliente.nombre}</h3>
              {cliente.referencia && (
                <span className="cliente-referencia">{cliente.referencia}</span>
              )}
            </div>
            <div className="cliente-badges">
              <span className={`badge ${getCategoriaColor(cliente.categoriacliente)}`}>
                {cliente.categoriacliente}
              </span>
              {cliente.estatus === 1 ? (
                <span className="badge badge-success">Activo</span>
              ) : (
                <span className="badge badge-inactive">Inactivo</span>
              )}
            </div>
          </div>

          <div className="cliente-card-body">
            <div className="cliente-info-principal">
              {cliente.telefono && (
                <div className="info-item">
                  <Phone size={16} />
                  <span>{cliente.telefono}</span>
                </div>
              )}
              {cliente.email && (
                <div className="info-item">
                  <Mail size={16} />
                  <span>{cliente.email}</span>
                </div>
              )}
              {cliente.direccion && (
                <div className="info-item">
                  <MapPin size={16} />
                  <span className="info-truncate">{cliente.direccion}</span>
                </div>
              )}
              {cliente.cumple && (
                <div className="info-item">
                  <Calendar size={16} />
                  <span>Cumpleaños: {formatFecha(cliente.cumple)}</span>
                </div>
              )}
            </div>

            <div className="cliente-stats">
              <div className="stat-box">
                <div className="stat-icon">
                  <TrendingUp size={20} />
                </div>
                <div className="stat-content">
                  <span className="stat-label">Puntos</span>
                  <span className="stat-value">{cliente.puntosfidelidad || 0}</span>
                </div>
              </div>

              {cliente.satisfaccion && (
                <div className="stat-box">
                  <div className="stat-icon">
                    <Star size={20} />
                  </div>
                  <div className="stat-content">
                    <span className="stat-label">Satisfacción</span>
                    {renderEstrellas(cliente.satisfaccion)}
                  </div>
                </div>
              )}
            </div>

            <div className="cliente-seguimiento">
              <div className="seguimiento-header">
                <span className="seguimiento-label">Seguimiento:</span>
                <span className={`seguimiento-badge ${getSeguimientoColor(cliente.estatus_seguimiento)}`}>
                  {cliente.estatus_seguimiento.replace('_', ' ')}
                </span>
              </div>
              {cliente.responsable_seguimiento && (
                <div className="seguimiento-info">
                  <span>Responsable: {cliente.responsable_seguimiento}</span>
                </div>
              )}
              {cliente.medio_contacto && (
                <div className="seguimiento-info">
                  <span>Medio: {cliente.medio_contacto}</span>
                </div>
              )}
              {cliente.fechaultimoseguimiento && (
                <div className="seguimiento-info">
                  <span>Último seguimiento: {formatFecha(cliente.fechaultimoseguimiento)}</span>
                </div>
              )}
            </div>

            {cliente.comentarios && (
              <div className="cliente-comentarios">
                <p>{cliente.comentarios}</p>
              </div>
            )}
          </div>

          <div className="cliente-card-footer">
            <button
              className="btn-accion btn-editar"
              onClick={() => onEdit(cliente)}
              title="Editar cliente"
            >
              <Edit size={16} />
              Editar
            </button>
            <button
              className="btn-accion btn-eliminar"
              onClick={() => onDelete(cliente.idCliente)}
              title="Eliminar cliente"
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

export default ListaClientes;
