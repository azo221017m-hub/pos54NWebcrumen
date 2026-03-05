import React from 'react';
import { CheckCircle } from 'lucide-react';
import type { Gasto } from '../../../types/gastos.types';
import './ListaGastos.css';

interface Props {
  gastos: Gasto[];
}

const ListaGastos: React.FC<Props> = ({ gastos }) => {
  const formatearFecha = (fecha: Date | string): string => {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const formatearHora = (fecha: Date | string): string => {
    const date = new Date(fecha);
    return date.toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatearMoneda = (valor: number): string => {
    if (typeof valor !== 'number' || isNaN(valor) || !isFinite(valor)) {
      return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
      }).format(0);
    }
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(valor);
  };

  const parseTotal = (value: any): number => {
    const parsed = parseFloat(value);
    return isNaN(parsed) || !isFinite(parsed) ? 0 : parsed;
  };

  return (
    <div className="lista-gastos-container">
      <div className="tabla-wrapper">
        <table className="tabla-gastos">
          <thead>
            <tr>
              <th>Folio</th>
              <th>Fecha</th>
              <th>Hora</th>
              <th>Descripción</th>
              <th>Tipo</th>
              <th>Usuario</th>
              <th>Estatus</th>
              <th>Monto</th>
            </tr>
          </thead>
          <tbody>
            {gastos.length === 0 ? (
              <tr>
                <td colSpan={8} className="sin-datos">
                  No hay gastos registrados
                </td>
              </tr>
            ) : (
              gastos.map((gasto) => (
                <tr
                  key={gasto.idventa}
                  className={gasto.estatusdepago === 'PAGADO' ? 'fila-aplicada' : ''}
                >
                  <td className="col-folio">{gasto.folioventa}</td>
                  <td>{formatearFecha(gasto.fechadeventa)}</td>
                  <td>{formatearHora(gasto.fechadeventa)}</td>
                  <td>{gasto.descripcionmov || 'Sin descripción'}</td>
                  <td>{gasto.referencia || 'Sin especificar'}</td>
                  <td>{gasto.usuarioauditoria}</td>
                  <td>
                    {gasto.estatusdepago === 'PAGADO' ? (
                      <span className="badge-estatus estatus-pagado">
                        <CheckCircle size={14} /> PAGADO
                      </span>
                    ) : (
                      <span className="badge-estatus estatus-pendiente">
                        {gasto.estatusdepago || 'PENDIENTE'}
                      </span>
                    )}
                  </td>
                  <td className="col-monto">{formatearMoneda(parseTotal(gasto.totaldeventa))}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ListaGastos;
