import React, { useState } from 'react';
import './IniciaTurno.css';

function IniciaTurno() {
  // Estado para los valores del formulario
  const [fondoCaja, setFondoCaja] = useState('');
  const [usaObjetivo, setUsaObjetivo] = useState(false);
  const [objetivoVenta, setObjetivoVenta] = useState('');
  
  // ID de turno (se puede generar o recibir como prop)
  const idTurno = '202601230737451234567890';
  
  // Frase personalizada (normalmente vendría del usuario logueado)
  const frasePersonalizada = 'FRASE PERSONALIZADA del Usuario que hizo login';

  // Manejador para iniciar turno
  const handleIniciarTurno = (e) => {
    e.preventDefault();
    
    const datosFormulario = {
      fondoCaja: fondoCaja,
      usaObjetivo: usaObjetivo,
      objetivoVenta: usaObjetivo ? objetivoVenta : null,
      idTurno: idTurno
    };
    
    console.log('Datos del formulario:', datosFormulario);
  };

  // Manejador para cancelar
  const handleCancelar = () => {
    setFondoCaja('');
    setUsaObjetivo(false);
    setObjetivoVenta('');
  };

  // Manejador para el checkbox de objetivo
  const handleCheckboxChange = (e) => {
    setUsaObjetivo(e.target.checked);
    if (!e.target.checked) {
      setObjetivoVenta('');
    }
  };

  return (
    <div className="inicia-turno-container">
      <div className="inicia-turno-card">
        {/* Encabezado */}
        <div className="turno-header">
          <div className="header-text">
            <h2>Usted está por iniciar el turno</h2>
          </div>
          <div className="header-id">
            <span className="id-label">ID:</span>
            <span className="id-value">{idTurno}</span>
          </div>
        </div>

        <form onSubmit={handleIniciarTurno}>
          {/* Campo: Fondo de Caja */}
          <div className="form-group">
            <label htmlFor="fondoCaja" className="form-label">
              Ingrese importe de Fondo de Caja
            </label>
            <input
              type="number"
              id="fondoCaja"
              className="form-input"
              value={fondoCaja}
              onChange={(e) => setFondoCaja(e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0"
              required
            />
          </div>

          {/* Objetivo de venta */}
          <div className="form-group">
            <div className="objetivo-container">
              <div className="objetivo-checkbox-wrapper">
                <input
                  type="checkbox"
                  id="usaObjetivo"
                  className="form-checkbox"
                  checked={usaObjetivo}
                  onChange={handleCheckboxChange}
                />
                <label htmlFor="usaObjetivo" className="checkbox-label">
                  ¿Quiere trabajar con Objetivo de venta?
                </label>
              </div>
              <div className="objetivo-input-wrapper">
                <input
                  type="number"
                  id="objetivoVenta"
                  className="form-input objetivo-input"
                  value={objetivoVenta}
                  onChange={(e) => setObjetivoVenta(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  disabled={!usaObjetivo}
                />
              </div>
            </div>
          </div>

          {/* Frase personalizada */}
          <div className="frase-personalizada">
            <p>{frasePersonalizada}</p>
          </div>

          {/* Botones de acción */}
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              Iniciar TURNO
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

export default IniciaTurno;
