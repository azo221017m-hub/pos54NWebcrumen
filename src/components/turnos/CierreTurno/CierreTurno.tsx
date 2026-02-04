import React, { useState, useMemo, useEffect } from 'react';
import type { Turno } from '../../../types/turno.types';
import { X } from 'lucide-react';
import { verificarComandasAbiertas } from '../../../services/turnosService';
import './CierreTurno.css';

// Tipos para las denominaciones
interface Denominaciones {
  billete1000: number;
  billete500: number;
  billete200: number;
  billete100: number;
  billete50: number;
  billete20: number;
  moneda10: number;
  moneda5: number;
  moneda1: number;
  moneda050: number;
}

type EstatusCierre = 'sin_novedades' | 'cuentas_pendientes';

// Valores de las denominaciones (constante fuera del componente)
const valoresDenominaciones = {
  billete1000: 1000,
  billete500: 500,
  billete200: 200,
  billete100: 100,
  billete50: 50,
  billete20: 20,
  moneda10: 10,
  moneda5: 5,
  moneda1: 1,
  moneda050: 0.50
} as const;

interface CierreTurnoProps {
  turno: Turno;
  onCancel: () => void;
  onSubmit?: (datosFormulario: {
    idTurno: string;
    retiroFondo: number;
    totalArqueo: number;
    detalleDenominaciones: Denominaciones;
    estatusCierre: EstatusCierre;
  }) => void;
}

const CierreTurno: React.FC<CierreTurnoProps> = ({ turno, onCancel, onSubmit }) => {
  // Clave de turno desde props
  const claveTurno = turno.claveturno;

  // Estado para el retiro de fondo
  const [retiroFondo, setRetiroFondo] = useState<string>('');

  // Estado para comandas abiertas
  const [comandasAbiertas, setComandasAbiertas] = useState<number>(0);
  const [loadingComandas, setLoadingComandas] = useState<boolean>(true);

  // Estado para las denominaciones
  const [denominaciones, setDenominaciones] = useState<Denominaciones>({
    billete1000: 0,
    billete500: 0,
    billete200: 0,
    billete100: 0,
    billete50: 0,
    billete20: 0,
    moneda10: 0,
    moneda5: 0,
    moneda1: 0,
    moneda050: 0
  });

  // Efecto para verificar comandas abiertas al montar
  useEffect(() => {
    const verificarComandas = async () => {
      try {
        setLoadingComandas(true);
        const resultado = await verificarComandasAbiertas(claveTurno);
        setComandasAbiertas(resultado.comandasAbiertas);
      } catch (error) {
        console.error('Error al verificar comandas abiertas:', error);
        // En caso de error, asumir 0 comandas abiertas
        setComandasAbiertas(0);
      } finally {
        setLoadingComandas(false);
      }
    };

    verificarComandas();
  }, [claveTurno]);

  // Calcular el total del arqueo cada vez que cambian las denominaciones (usando useMemo)
  const totalArqueo = useMemo(() => {
    return (Object.keys(denominaciones) as Array<keyof Denominaciones>).reduce((acc, key) => {
      return acc + (denominaciones[key] * valoresDenominaciones[key]);
    }, 0);
  }, [denominaciones]);

  // Calcular el estatus del cierre basado en comandas abiertas (usando useMemo)
  const estatusCierre = useMemo<EstatusCierre>(() => {
    // Si hay comandas abiertas, no puede cerrar turno
    if (comandasAbiertas > 0) {
      return 'cuentas_pendientes';
    }
    // Si no hay comandas abiertas, puede cerrar sin novedades
    return 'sin_novedades';
  }, [comandasAbiertas]);

  // Manejador para sumar/restar denominaciones
  const handleDenominacionChange = (tipo: keyof Denominaciones, operacion: 'sumar' | 'restar') => {
    setDenominaciones(prev => ({
      ...prev,
      [tipo]: operacion === 'sumar' 
        ? prev[tipo] + 1 
        : Math.max(0, prev[tipo] - 1)
    }));
  };

  // Manejador para cerrar turno
  const handleCerrarTurno = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const datosFormulario = {
      idTurno: claveTurno,
      retiroFondo: parseFloat(retiroFondo) || 0,
      totalArqueo,
      detalleDenominaciones: denominaciones,
      estatusCierre
    };
    
    console.log('Datos del cierre de turno:', datosFormulario);
    
    // Llamar a onSubmit si está definido
    if (onSubmit) {
      onSubmit(datosFormulario);
    }
  };

  // Manejador para cancelar
  const handleCancelar = () => {
    onCancel();
  };

  // Renderizar una fila de denominación
  const renderDenominacionRow = (tipo: keyof Denominaciones, etiqueta: string) => (
    <div key={tipo} className="denominacion-row">
      <button 
        type="button"
        className="btn-denominacion btn-restar"
        onClick={() => handleDenominacionChange(tipo, 'restar')}
      >
        -
      </button>
      <div className="denominacion-info">
        <span className="denominacion-label">{etiqueta}</span>
        <span className="denominacion-count">{denominaciones[tipo]}</span>
      </div>
      <button 
        type="button"
        className="btn-denominacion btn-sumar"
        onClick={() => handleDenominacionChange(tipo, 'sumar')}
      >
        +
      </button>
    </div>
  );

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content-cierre" onClick={(e) => e.stopPropagation()}>
        {/* Botón de cerrar modal */}
        <button
          type="button"
          onClick={onCancel}
          className="btn-cerrar-modal-cierre"
          aria-label="Cerrar"
        >
          <X size={24} />
        </button>

        {/* Encabezado */}
        <div className="turno-header">
          <div className="header-text">
            <h2>Usted está CERRANDO el turno</h2>
          </div>
          <div className="header-id">
            <span className="id-label">ID:</span>
            <span className="id-value">{claveTurno}</span>
          </div>
        </div>

        <form onSubmit={handleCerrarTurno}>
          {/* Retiro de fondo de caja */}
          <div className="form-group">
            <label htmlFor="retiroFondo" className="form-label">
              Cuánto retira de Fondo de Caja
            </label>
            <input
              type="number"
              id="retiroFondo"
              className="form-input"
              value={retiroFondo}
              onChange={(e) => setRetiroFondo(e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0"
            />
          </div>

          {/* Arqueo de caja */}
          <div className="arqueo-display">
            <span className="arqueo-label">Arqueo de caja</span>
            <span className="arqueo-monto">${totalArqueo.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>

          {/* Panel de conteo de efectivo */}
          <div className="conteo-panel">
            <div className="conteo-header">
              <h3>Conteo de Efectivo</h3>
            </div>
            <div className="denominaciones-grid">
              {/* Billetes */}
              <div className="denominaciones-seccion">
                <h4 className="seccion-titulo">Billetes</h4>
                {renderDenominacionRow('billete1000', 'Billetes de 1000')}
                {renderDenominacionRow('billete500', 'Billetes de 500')}
                {renderDenominacionRow('billete200', 'Billetes de 200')}
                {renderDenominacionRow('billete100', 'Billetes de 100')}
                {renderDenominacionRow('billete50', 'Billetes de 50')}
                {renderDenominacionRow('billete20', 'Billetes de 20')}
              </div>

              {/* Monedas */}
              <div className="denominaciones-seccion">
                <h4 className="seccion-titulo">Monedas</h4>
                {renderDenominacionRow('moneda10', 'Monedas de 10')}
                {renderDenominacionRow('moneda5', 'Monedas de 5')}
                {renderDenominacionRow('moneda1', 'Monedas de 1')}
                {renderDenominacionRow('moneda050', 'Monedas de 0.50')}
              </div>
            </div>
          </div>

          {/* Estatus del cierre */}
          <div className="estatus-cierre">
            <span className="estatus-label">Estatus del cierre:</span>
            {loadingComandas ? (
              <span className="estatus-mensaje estatus-loading">Verificando comandas...</span>
            ) : comandasAbiertas > 0 ? (
              <span className="estatus-mensaje estatus-error">
                NO PUEDE CERRAR TURNO, Existen comandas abiertas
              </span>
            ) : (
              <span className="estatus-mensaje estatus-ok">
                Cierre sin novedades
              </span>
            )}
          </div>

          {/* Botones de acción */}
          <div className="form-actions">
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={comandasAbiertas > 0 || loadingComandas}
            >
              Cerrar TURNO
            </button>
            <button type="button" className="btn btn-secondary" onClick={handleCancelar}>
              CANCELAR
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CierreTurno;
