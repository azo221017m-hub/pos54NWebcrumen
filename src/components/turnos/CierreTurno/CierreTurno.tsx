import React, { useState, useEffect } from 'react';
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

const CierreTurno: React.FC = () => {
  // ID de turno (en producción, esto debería generarse dinámicamente o recibirse como prop)
  const idTurno = '202601230737451234567890';

  // Estado para el retiro de fondo
  const [retiroFondo, setRetiroFondo] = useState<string>('');

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

  // Estado para el total del arqueo
  const [totalArqueo, setTotalArqueo] = useState<number>(0);

  // Estado para el estatus del cierre
  const [estatusCierre, setEstatusCierre] = useState<EstatusCierre>('sin_novedades');

  // Valores de las denominaciones
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
  };

  // Calcular el total del arqueo cada vez que cambian las denominaciones
  useEffect(() => {
    const total = (Object.keys(denominaciones) as Array<keyof Denominaciones>).reduce((acc, key) => {
      return acc + (denominaciones[key] * valoresDenominaciones[key]);
    }, 0);
    setTotalArqueo(total);
  }, [denominaciones]);

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
      idTurno,
      retiroFondo: parseFloat(retiroFondo) || 0,
      totalArqueo,
      detalleDenominaciones: denominaciones,
      estatusCierre
    };
    
    console.log('Datos del cierre de turno:', datosFormulario);
  };

  // Manejador para cancelar
  const handleCancelar = () => {
    setRetiroFondo('');
    setDenominaciones({
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
    setEstatusCierre('sin_novedades');
  };

  // Simular validación de cuentas pendientes (en producción, esto vendría de una API)
  useEffect(() => {
    // Ejemplo: si el total del arqueo es menor a 100, hay cuentas pendientes
    if (totalArqueo > 0 && totalArqueo < 100) {
      setEstatusCierre('cuentas_pendientes');
    } else if (totalArqueo >= 100) {
      setEstatusCierre('sin_novedades');
    }
  }, [totalArqueo]);

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
    <div className="cierre-turno-container">
      <div className="cierre-turno-card">
        {/* Encabezado */}
        <div className="turno-header">
          <div className="header-text">
            <h2>Usted está CERRANDO el turno</h2>
          </div>
          <div className="header-id">
            <span className="id-label">ID:</span>
            <span className="id-value">{idTurno}</span>
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
            <span className={`estatus-mensaje ${estatusCierre === 'sin_novedades' ? 'estatus-ok' : 'estatus-error'}`}>
              {estatusCierre === 'sin_novedades' ? 'Cierre sin novedades' : 'Existen Cuentas Pendientes'}
            </span>
          </div>

          {/* Botones de acción */}
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
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
