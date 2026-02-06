import React from 'react';
import { Edit2, Trash2, ShoppingCart, Calendar, DollarSign, Package, MapPin, Phone, User } from 'lucide-react';
import type { CompraWithDetails } from '../../../types/compras.types';
import './ListaCompras.css';

interface Props {
  compras: CompraWithDetails[];
  onEditar: (compra: CompraWithDetails) => void;
  onEliminar: (id: number) => void;
}

const ListaCompras: React.FC<Props> = ({ compras, onEditar, onEliminar }) => {
  const comprasArray = Array.isArray(compras) ? compras : [];
  
  if (comprasArray.length === 0) {
    return (
      <div className="lista-compras-vacia">
        <ShoppingCart size={64} className="icono-vacio" />
        <h3>No hay compras registradas</h3>
        <p>Crea tu primera compra para comenzar</p>
      </div>
    );
  }

  const formatearFecha = (fecha: string | Date | null): string => {
    if (!fecha) return 'N/A';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatearMoneda = (cantidad: number): string => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(cantidad);
  };

  const getEstadoBadgeClass = (estado: string): string => {
    switch (estado) {
      case 'RECIBIDA':
        return 'badge-recibida';
      case 'ESPERAR':
        return 'badge-esperar';
      case 'GENERADA':
        return 'badge-generada';
      case 'CANCELADA':
        return 'badge-cancelada';
      case 'DEVUELTA':
        return 'badge-devuelta';
      case 'ELIMINADA':
        return 'badge-eliminada';
      default:
        return 'badge-default';
    }
  };

  const getEstatusPagoBadgeClass = (estatus: string): string => {
    switch (estatus) {
      case 'PAGADO':
        return 'badge-pagado';
      case 'PENDIENTE':
        return 'badge-pendiente';
      case 'ESPERAR':
        return 'badge-esperar';
      default:
        return 'badge-default';
    }
  };

  return (
    <div className="lista-compras">
      {comprasArray.map((compra) => (
        <div key={compra.idcompra} className="compra-card">
          <div className="compra-card-header">
            <div className="compra-icon">
              <ShoppingCart size={24} />
            </div>
            <div className="compra-info">
              <h3 className="compra-folio">{compra.foliocompra}</h3>
              <span className="compra-tipo">{compra.tipodecompra}</span>
            </div>
            <div className="compra-badges">
              <span className={`badge ${getEstadoBadgeClass(compra.estadodecompra)}`}>
                {compra.estadodecompra}
              </span>
              <span className={`badge ${getEstatusPagoBadgeClass(compra.estatusdepago)}`}>
                {compra.estatusdepago}
              </span>
            </div>
          </div>

          <div className="compra-card-body">
            <div className="compra-stats">
              <div className="stat-item">
                <Calendar size={18} />
                <div className="stat-info">
                  <span className="stat-label">Fecha de Orden</span>
                  <span className="stat-value">{formatearFecha(compra.fechaordendecompra)}</span>
                </div>
              </div>

              {compra.fechaprogramadacompra && (
                <div className="stat-item">
                  <Calendar size={18} />
                  <div className="stat-info">
                    <span className="stat-label">Fecha Programada</span>
                    <span className="stat-value">{formatearFecha(compra.fechaprogramadacompra)}</span>
                  </div>
                </div>
              )}

              <div className="stat-item">
                <Package size={18} />
                <div className="stat-info">
                  <span className="stat-label">Productos</span>
                  <span className="stat-value">{compra.detalles?.length || 0} items</span>
                </div>
              </div>

              <div className="stat-item total">
                <DollarSign size={18} />
                <div className="stat-info">
                  <span className="stat-label">Total</span>
                  <span className="stat-value total-amount">{formatearMoneda(compra.totaldeventa)}</span>
                </div>
              </div>

              {compra.direcciondeentrega && (
                <div className="stat-item direccion">
                  <MapPin size={18} />
                  <div className="stat-info">
                    <span className="stat-label">Dirección</span>
                    <span className="stat-value">{compra.direcciondeentrega}</span>
                  </div>
                </div>
              )}

              {compra.contactodeentrega && (
                <div className="stat-item">
                  <User size={18} />
                  <div className="stat-info">
                    <span className="stat-label">Contacto</span>
                    <span className="stat-value">{compra.contactodeentrega}</span>
                  </div>
                </div>
              )}

              {compra.telefonodeentrega && (
                <div className="stat-item">
                  <Phone size={18} />
                  <div className="stat-info">
                    <span className="stat-label">Teléfono</span>
                    <span className="stat-value">{compra.telefonodeentrega}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Mostrar detalles de productos */}
            {compra.detalles && compra.detalles.length > 0 && (
              <div className="compra-detalles">
                <h4>Productos:</h4>
                <ul className="detalles-list">
                  {compra.detalles.slice(0, 3).map((detalle) => (
                    <li key={detalle.iddetallecompra}>
                      <span className="detalle-nombre">{detalle.nombreproducto}</span>
                      <span className="detalle-cantidad">x{detalle.cantidad}</span>
                      <span className="detalle-precio">{formatearMoneda(detalle.total)}</span>
                    </li>
                  ))}
                  {compra.detalles.length > 3 && (
                    <li className="detalle-mas">
                      + {compra.detalles.length - 3} productos más
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>

          <div className="compra-card-footer">
            <div className="compra-metadata">
              <span className="metadata-item">
                Usuario: {compra.usuarioauditoria}
              </span>
            </div>
            <div className="compra-actions">
              <button
                className="btn-editar"
                onClick={() => onEditar(compra)}
                title="Editar compra"
              >
                <Edit2 size={18} />
                Editar
              </button>
              <button
                className="btn-eliminar"
                onClick={() => onEliminar(compra.idcompra)}
                title="Eliminar compra"
              >
                <Trash2 size={18} />
                Eliminar
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ListaCompras;
