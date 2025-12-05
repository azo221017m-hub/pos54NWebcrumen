import React from 'react';
import { Edit2, Trash2, Package, DollarSign, CheckCircle, XCircle, Image as ImageIcon } from 'lucide-react';
import type { ProductoWeb } from '../../../types/productoWeb.types';
import './ListaProductosWeb.css';

interface Props {
  productos: ProductoWeb[];
  onEditar: (producto: ProductoWeb) => void;
  onEliminar: (id: number) => void;
}

const ListaProductosWeb: React.FC<Props> = ({ productos, onEditar, onEliminar }) => {
  const productosArray = Array.isArray(productos) ? productos : [];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(value);
  };

  const getTipoProductoClass = (tipo: string) => {
    switch (tipo) {
      case 'Directo': return 'tipo-directo';
      case 'Inventario': return 'tipo-inventario';
      case 'Receta': return 'tipo-receta';
      default: return '';
    }
  };

  if (productosArray.length === 0) {
    return (
      <div className="lista-productos-vacia">
        <Package size={64} className="icono-vacio" />
        <h3>No hay productos registrados</h3>
        <p>Crea tu primer producto para comenzar</p>
      </div>
    );
  }

  return (
    <div className="lista-productos-web">
      {productosArray.map((producto) => (
        <div key={producto.idProducto} className="producto-card">
          <div className="producto-card-header">
            <div className="producto-imagen-container">
              {producto.imagenProducto ? (
                <img 
                  src={`data:image/jpeg;base64,${producto.imagenProducto}`}
                  alt={producto.nombre}
                  className="producto-imagen"
                />
              ) : (
                <div className="producto-imagen-placeholder">
                  <ImageIcon size={32} />
                </div>
              )}
            </div>
            <div className="producto-info">
              <h3 className="producto-nombre">{producto.nombre}</h3>
              <span className="producto-categoria">{producto.nombreCategoria || 'Sin categoría'}</span>
            </div>
            <div className="producto-badges">
              <span className={`badge badge-tipo ${getTipoProductoClass(producto.tipoproducto)}`}>
                {producto.tipoproducto}
              </span>
              {producto.estatus === 1 ? (
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

          <div className="producto-card-body">
            {producto.descripcion && (
              <p className="producto-descripcion">{producto.descripcion}</p>
            )}

            <div className="producto-stats">
              <div className="stat-item precio">
                <DollarSign size={18} />
                <div className="stat-info">
                  <span className="stat-label">Precio</span>
                  <span className="stat-value">{formatCurrency(producto.precio)}</span>
                </div>
              </div>

              <div className="stat-item costo">
                <DollarSign size={18} />
                <div className="stat-info">
                  <span className="stat-label">Costo</span>
                  <span className="stat-value">{formatCurrency(producto.costoproducto)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="producto-card-footer">
            <button
              className="btn-editar"
              onClick={() => onEditar(producto)}
              title="Editar producto"
            >
              <Edit2 size={18} />
              Editar
            </button>
            <button
              className="btn-eliminar"
              onClick={() => onEliminar(producto.idProducto)}
              title="Eliminar producto"
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

export default ListaProductosWeb;
