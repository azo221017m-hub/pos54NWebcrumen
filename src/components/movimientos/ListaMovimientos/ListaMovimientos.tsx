import React from 'react';
import { Edit, CheckCircle, Clock, Trash2 } from 'lucide-react';
import type { MovimientoConDetalles } from '../../../types/movimientos.types';
import './ListaMovimientos.css';

interface Props {
  movimientos: MovimientoConDetalles[];
  onEditar: (id: number) => void;
  onEliminar: (id: number) => void;
}

const ListaMovimientos: React.FC<Props> = ({ movimientos, onEditar, onEliminar }) => {
  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleString('es-MX', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get color class based on motivo (using tipomovimiento logic)
  const getMotivoClase = (motivo: string) => {
    // ENTRADA types: COMPRA, AJUSTE_MANUAL, INV_INICIAL (green)
    const entradaMotivos = ['COMPRA', 'AJUSTE_MANUAL', 'INV_INICIAL'];
    // SALIDA types: MERMA, CONSUMO (red)
    const salidaMotivos = ['MERMA', 'CONSUMO'];
    
    if (entradaMotivos.includes(motivo)) {
      return 'motivo-entrada';
    } else if (salidaMotivos.includes(motivo)) {
      return 'motivo-salida';
    }
    return '';
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
              <th>Observaciones</th>
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
                <td colSpan={7} className="sin-datos">
                  No hay movimientos registrados
                </td>
              </tr>
            ) : (
              movimientos.map((movimiento) => (
                <tr key={movimiento.idmovimiento}>
                  <td>{movimiento.observaciones || '-'}</td>
                  <td>
                    <span className={`badge-motivo ${getMotivoClase(movimiento.motivomovimiento)}`}>
                      {movimiento.motivomovimiento}
                    </span>
                  </td>
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
                            className="btn-accion btn-editar"
                            onClick={() => onEditar(movimiento.idmovimiento)}
                            title="Editar"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            className="btn-accion btn-eliminar"
                            onClick={() => onEliminar(movimiento.idmovimiento)}
                            title="Eliminar"
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
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
