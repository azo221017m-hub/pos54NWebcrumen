import React from 'react';
import { Edit2, Trash2, Package, CheckCircle, XCircle, Image as ImageIcon, Utensils } from 'lucide-react';
import type { ProductoWeb } from '../../../types/productoWeb.types';
import './ListaProductosWeb.css';

interface Props {
  productos: ProductoWeb[];
  onEditar: (producto: ProductoWeb) => void;
  onEliminar: (id: number) => void;
  onToggleMenuDia?: (id: number, currentValue: number) => void;
}

const ListaProductosWeb: React.FC<Props> = ({ productos, onEditar, onEliminar, onToggleMenuDia }) => {
  const productosArray = Array.isArray(productos) ? productos : [];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(value);
  };

  const getTipoClass = (tipo: string) => {
    switch (tipo) {
      case 'Directo': return 'badge-directo';
      case 'Inventario': return 'badge-inventario';
      case 'Receta': return 'badge-receta';
      default: return '';
    }
  };

  return (
    <div className="lista-productos-container">
      <div className="tabla-wrapper">
        <table className="tabla-productos-web">
          <thead>
            <tr>
              <th>Imagen</th>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Tipo</th>
              <th>Precio</th>
              <th>Costo</th>
              <th>Menú Día</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productosArray.length === 0 ? (
              <tr>
                <td colSpan={9} className="sin-datos">
                  <Package size={32} className="icono-vacio-inline" />
                  No hay productos registrados
                </td>
              </tr>
            ) : (
              productosArray.map((producto) => (
                <tr key={producto.idProducto}>
                  <td>
                    {producto.imagenProducto ? (
                      <img
                        src={`data:image/jpeg;base64,${producto.imagenProducto}`}
                        alt={producto.nombre}
                        className="producto-img-thumb"
                      />
                    ) : (
                      <div className="producto-img-placeholder-sm">
                        <ImageIcon size={20} />
                      </div>
                    )}
                  </td>
                  <td className="cell-nombre">{producto.nombre}</td>
                  <td>{producto.nombreCategoria || '-'}</td>
                  <td>
                    <span className={`badge ${getTipoClass(producto.tipoproducto)}`}>
                      {producto.tipoproducto}
                    </span>
                  </td>
                  <td>{formatCurrency(producto.precio)}</td>
                  <td>{formatCurrency(producto.costoproducto)}</td>
                  <td>
                    {onToggleMenuDia ? (
                      <label className="checkbox-menudia-container">
                        <input
                          type="checkbox"
                          checked={producto.menudia === 1}
                          onChange={() => onToggleMenuDia(producto.idProducto, producto.menudia)}
                          className="checkbox-menudia-input"
                        />
                        <span className="checkbox-menudia-custom">
                          <Utensils size={13} className="checkbox-menudia-icon" />
                        </span>
                      </label>
                    ) : (
                      producto.menudia === 1 ? (
                        <span className="badge badge-menudia">🍽️ Sí</span>
                      ) : '-'
                    )}
                  </td>
                  <td>
                    {producto.estatus === 1 ? (
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
                        onClick={() => onEditar(producto)}
                        title="Editar producto"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        className="btn-accion btn-eliminar"
                        onClick={() => onEliminar(producto.idProducto)}
                        title="Eliminar producto"
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

export default ListaProductosWeb;
