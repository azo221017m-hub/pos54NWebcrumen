import React, { useMemo } from 'react';
import { CheckCircle } from 'lucide-react';
import type { Gasto } from '../../../types/gastos.types';
import './ListaGastos.css';

interface Props {
  gastos: Gasto[];
}

interface GastoAgrupado {
  fecha: string; // Date formatted as YYYY-MM-DD
  descripcion: string; // descripcionmov
  gastos: Gasto[];
  totalGrupo: number;
}

const ListaGastos: React.FC<Props> = ({ gastos }) => {
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

  const formatearFechaSolo = (fecha: Date | string): string => {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatearHora = (fecha: Date | string): string => {
    const date = new Date(fecha);
    return date.toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const obtenerFechaClave = (fecha: Date | string): string => {
    const date = new Date(fecha);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatearMoneda = (valor: number): string => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(valor);
  };

  // Group gastos by date and description
  const gastosAgrupados = useMemo((): GastoAgrupado[] => {
    const grupos = new Map<string, GastoAgrupado>();

    gastos.forEach((gasto) => {
      const fechaClave = obtenerFechaClave(gasto.fechadeventa);
      const descripcion = gasto.descripcionmov || 'Sin descripción';
      const clave = `${fechaClave}|${descripcion}`;

      if (!grupos.has(clave)) {
        grupos.set(clave, {
          fecha: fechaClave,
          descripcion: descripcion,
          gastos: [],
          totalGrupo: 0
        });
      }

      const grupo = grupos.get(clave)!;
      grupo.gastos.push(gasto);
      grupo.totalGrupo += gasto.totaldeventa;
    });

    // Convert map to array and sort by date (newest first)
    return Array.from(grupos.values()).sort((a, b) => {
      return b.fecha.localeCompare(a.fecha);
    });
  }, [gastos]);

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
      <div className="grupos-gastos">
        {gastosAgrupados.map((grupo) => {
          // Create stable key from the grupo data
          const grupoKey = `${grupo.fecha}-${grupo.descripcion}-${grupo.gastos[0]?.idventa || 0}`;
          return (
          <div key={grupoKey} className="grupo-gasto">
            <div className="grupo-header">
              <div className="grupo-info">
                <h3 className="grupo-fecha">{formatearFechaSolo(grupo.fecha)}</h3>
                <p className="grupo-descripcion">{grupo.descripcion}</p>
              </div>
              <div className="grupo-total">
                {formatearMoneda(grupo.totalGrupo)}
              </div>
            </div>
            <div className="grupo-items">
              {grupo.gastos.map((gasto) => (
                <div 
                  key={gasto.idventa} 
                  className={`gasto-item ${gasto.estatusdepago === 'PAGADO' ? 'gasto-aplicado' : ''}`}
                >
                  <div className="gasto-item-content">
                    <div className="gasto-item-info">
                      <span className="gasto-folio">{gasto.folioventa}</span>
                      <span className="gasto-hora">{formatearHora(gasto.fechadeventa)}</span>
                      <span className="gasto-tipo">{gasto.referencia || 'Sin especificar'}</span>
                      <span className="gasto-usuario">{gasto.usuarioauditoria}</span>
                    </div>
                    <div className="gasto-item-monto">
                      {formatearMoneda(gasto.totaldeventa)}
                      {gasto.estatusdepago === 'PAGADO' && (
                        <span className="gasto-aplicado-badge" title="Aplicado">
                          <CheckCircle size={16} />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
        })}
      </div>
    </div>
  );
};

export default ListaGastos;
