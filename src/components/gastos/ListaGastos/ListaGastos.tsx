import React, { useMemo } from 'react';
import { CheckCircle } from 'lucide-react';
import type { Gasto } from '../../../types/gastos.types';
import './ListaGastos.css';

interface Props {
  gastos: Gasto[];
}

interface GastoAgrupado {
  descripcion: string; // descripcionmov
  gastos: Gasto[];
  totalGrupo: number;
}

const ListaGastos: React.FC<Props> = ({ gastos }) => {
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

  const formatearMoneda = (valor: number): string => {
    // Validate that valor is a valid number
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

  // Helper function to safely parse and validate numeric values
  const parseTotal = (value: any): number => {
    const parsed = parseFloat(value);
    return isNaN(parsed) || !isFinite(parsed) ? 0 : parsed;
  };

  // Group gastos by description only (not by date)
  const gastosAgrupados = useMemo((): GastoAgrupado[] => {
    const grupos = new Map<string, GastoAgrupado>();

    gastos.forEach((gasto) => {
      const descripcion = gasto.descripcionmov || 'Sin descripción';

      if (!grupos.has(descripcion)) {
        grupos.set(descripcion, {
          descripcion: descripcion,
          gastos: [],
          totalGrupo: 0
        });
      }

      const grupo = grupos.get(descripcion)!;
      grupo.gastos.push(gasto);
      
      // Validate totaldeventa before adding - fix NaN issue
      grupo.totalGrupo += parseTotal(gasto.totaldeventa);
    });

    // Convert map to array and sort by description
    return Array.from(grupos.values()).sort((a, b) => {
      return a.descripcion.localeCompare(b.descripcion);
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
          const grupoKey = `${grupo.descripcion}-${grupo.gastos[0]?.idventa || 0}`;
          return (
          <div key={grupoKey} className="grupo-gasto">
            {/* Tree-like parent node - description with total */}
            <div className="grupo-descripcion-row">
              <div className="grupo-descripcion-info">
                <span className="grupo-descripcion-titulo">{grupo.descripcion}</span>
                <span className="grupo-cantidad">{grupo.gastos.length} {grupo.gastos.length === 1 ? 'registro' : 'registros'}</span>
              </div>
              <div className="grupo-total">
                {formatearMoneda(grupo.totalGrupo)}
              </div>
            </div>
            {/* Tree-like child nodes - indented records */}
            <div className="grupo-items">
              {grupo.gastos.map((gasto) => (
                <div 
                  key={gasto.idventa} 
                  className={`gasto-item ${gasto.estatusdepago === 'PAGADO' ? 'gasto-aplicado' : ''}`}
                >
                  <div className="gasto-item-content">
                    <div className="gasto-item-info">
                      <span className="gasto-folio">{gasto.folioventa}</span>
                      <span className="gasto-fecha">{formatearFechaSolo(gasto.fechadeventa)}</span>
                      <span className="gasto-hora">{formatearHora(gasto.fechadeventa)}</span>
                      <span className="gasto-tipo">{gasto.referencia || 'Sin especificar'}</span>
                      <span className="gasto-usuario">{gasto.usuarioauditoria}</span>
                    </div>
                    <div className="gasto-item-monto">
                      {formatearMoneda(parseTotal(gasto.totaldeventa))}
                      {gasto.estatusdepago === 'PAGADO' && (
                        <span className="gasto-aplicado-badge" title="Aplicado">
                          <CheckCircle size={16} />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}}
            </div>
          </div>
        );
        })}
      </div>
    </div>
  );
};

export default ListaGastos;
