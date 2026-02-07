import React from 'react';
import { Edit, Trash2, CheckCircle, Clock } from 'lucide-react';
import type { MovimientoConDetalles } from '../../../types/movimientos.types';
import './ListaMovimientos.css';

interface Props {
  movimientos: MovimientoConDetalles[];
  onEditar: (id: number) => void;
  onEliminar: (id: number) => void;
  onProcesar: (id: number) => void;
}

const ListaMovimientos: React.FC<Props> = ({ movimientos, onEditar, onEliminar, onProcesar }) => {
  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleString('es-MX', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTipoClase = (tipo: string) => {
    return tipo === 'ENTRADA' ? 'tipo-entrada' : 'tipo-salida';
  };

  const getEstatusClase = (estatus: string) => {
    return estatus === 'PROCESADO' ? 'estatus-procesado' : 'estatus-pendiente';
  };

  return (
    <div className="lista-movimientos-container">
      <div className="tabla-wrapper">
        <table className="tabla-movimientos">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tipo</th>
              <th>Motivo</th>
              <th>Fecha</th>
              <th>Usuario</th>
              <th>Estatus</th>
              <th>Detalles</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {movimientos.length === 0 ? (
              <tr>
                <td colSpan={8} className="sin-datos">
                  No hay movimientos registrados
                </td>
              </tr>
            ) : (
              movimientos.map((movimiento) => (
                <tr key={movimiento.idmovimiento}>
                  <td>{movimiento.idmovimiento}</td>
                  <td>
                    <span className={`badge-tipo ${getTipoClase(movimiento.tipomovimiento)}`}>
                      {movimiento.tipomovimiento}
                    </span>
                  </td>
                  <td>{movimiento.motivomovimiento}</td>
                  <td>{formatearFecha(movimiento.fechamovimiento)}</td>
                  <td>{movimiento.usuarioauditoria}</td>
                  <td>
                    <span className={`badge-estatus ${getEstatusClase(movimiento.estatusmovimiento)}`}>
                      {movimiento.estatusmovimiento === 'PROCESADO' ? (
                        <>
                          <CheckCircle size={14} /> PROCESADO
                        </>
                      ) : (
                        <>
                          <Clock size={14} /> PENDIENTE
                        </>
                      )}
                    </span>
                  </td>
                  <td>
                    <span className="num-detalles">
                      {movimiento.detalles?.length || 0} insumo(s)
                    </span>
                  </td>
                  <td>
                    <div className="acciones-btns">
                      {movimiento.estatusmovimiento === 'PENDIENTE' && (
                        <>
                          <button
                            className="btn-accion btn-procesar"
                            onClick={() => onProcesar(movimiento.idmovimiento)}
                            title="Procesar"
                          >
                            <CheckCircle size={16} />
                          </button>
                          <button
                            className="btn-accion btn-editar"
                            onClick={() => onEditar(movimiento.idmovimiento)}
                            title="Editar"
                          >
                            <Edit size={16} />
                          </button>
                        </>
                      )}
                      <button
                        className="btn-accion btn-eliminar"
                        onClick={() => onEliminar(movimiento.idmovimiento)}
                        title="Eliminar"
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

export default ListaMovimientos;
