import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import type { Gasto } from '../../../types/gastos.types';
import './ListaGastos.css';

interface Props {
  gastos: Gasto[];
  onEditar: (id: number) => void;
  onEliminar: (id: number) => void;
}

const ListaGastos: React.FC<Props> = ({ gastos, onEditar, onEliminar }) => {
  const formatearFecha = (fecha: Date | string): string => {
    const date = new Date(fecha);
    return date.toLocaleString('es-MX', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatearMoneda = (valor: number): string => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(valor);
  };

  if (gastos.length === 0) {
    return (
      <div className="sin-gastos">
        <p>No hay gastos registrados</p>
        <p className="texto-secundario">Haz clic en "Nuevo Gasto" para agregar uno</p>
      </div>
    );
  }

  return (
    <div className="lista-gastos">
      <div className="tabla-gastos-container">
        <table className="tabla-gastos">
          <thead>
            <tr>
              <th>Folio</th>
              <th>Tipo de Gasto</th>
              <th>Importe</th>
              <th>Fecha</th>
              <th>Usuario</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {gastos.map((gasto) => (
              <tr key={gasto.idventa}>
                <td className="folio-cell">{gasto.folioventa}</td>
                <td className="tipo-cell">{gasto.referencia || 'Sin especificar'}</td>
                <td className="importe-cell">{formatearMoneda(gasto.subtotal)}</td>
                <td className="fecha-cell">{formatearFecha(gasto.fechadeventa)}</td>
                <td className="usuario-cell">{gasto.usuarioauditoria}</td>
                <td className="acciones-cell">
                  <button
                    className="btn-accion btn-editar"
                    onClick={() => onEditar(gasto.idventa)}
                    title="Editar gasto"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    className="btn-accion btn-eliminar"
                    onClick={() => onEliminar(gasto.idventa)}
                    title="Eliminar gasto"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Versión móvil - tarjetas */}
      <div className="tarjetas-gastos">
        {gastos.map((gasto) => (
          <div key={gasto.idventa} className="tarjeta-gasto">
            <div className="tarjeta-header">
              <span className="tarjeta-folio">{gasto.folioventa}</span>
              <span className="tarjeta-importe">{formatearMoneda(gasto.subtotal)}</span>
            </div>
            <div className="tarjeta-body">
              <div className="tarjeta-row">
                <span className="tarjeta-label">Tipo:</span>
                <span className="tarjeta-value">{gasto.referencia || 'Sin especificar'}</span>
              </div>
              <div className="tarjeta-row">
                <span className="tarjeta-label">Fecha:</span>
                <span className="tarjeta-value">{formatearFecha(gasto.fechadeventa)}</span>
              </div>
              <div className="tarjeta-row">
                <span className="tarjeta-label">Usuario:</span>
                <span className="tarjeta-value">{gasto.usuarioauditoria}</span>
              </div>
            </div>
            <div className="tarjeta-actions">
              <button
                className="btn-accion btn-editar"
                onClick={() => onEditar(gasto.idventa)}
                title="Editar gasto"
              >
                <Edit2 size={18} />
                Editar
              </button>
              <button
                className="btn-accion btn-eliminar"
                onClick={() => onEliminar(gasto.idventa)}
                title="Eliminar gasto"
              >
                <Trash2 size={18} />
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListaGastos;
