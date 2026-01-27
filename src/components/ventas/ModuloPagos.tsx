import React, { useState } from 'react';
import './ModuloPagos.css';

interface ModuloPagosProps {
  onClose: () => void;
  totalCuenta: number;
}

const ModuloPagos: React.FC<ModuloPagosProps> = ({ onClose, totalCuenta }) => {
  const [metodoPagoSeleccionado, setMetodoPagoSeleccionado] = useState<'efectivo' | 'transferencia' | 'mixto'>('efectivo');
  const [montoEfectivo, setMontoEfectivo] = useState<string>('');
  const [numeroReferencia, setNumeroReferencia] = useState<string>('');
  const [pagosMixtos, setPagosMixtos] = useState<Array<{ formaPago: string; importe: string; referencia: string }>>([
    { formaPago: '', importe: '', referencia: '' },
    { formaPago: '', importe: '', referencia: '' }
  ]);

  // Calcular descuento (ejemplo: 10%)
  const descuento = totalCuenta * 0.10;
  const nuevoTotal = totalCuenta - descuento;

  const handleMontoRapido = (monto: number) => {
    setMontoEfectivo(monto.toString());
  };

  const handleCobrar = () => {
    console.log('Procesando cobro...');
    // Aquí se implementaría la lógica de cobro
    alert('Cobro procesado exitosamente');
  };

  const handleAgregarPagoMixto = () => {
    setPagosMixtos([...pagosMixtos, { formaPago: '', importe: '', referencia: '' }]);
  };

  return (
    <div className="modulo-pagos-overlay" onClick={onClose}>
      <div className="modulo-pagos-container" onClick={(e) => e.stopPropagation()}>
        <div className="modulo-pagos-content">
          {/* Columna Izquierda */}
          <div className="pagos-columna-izquierda">
            {/* Resumen de Cuenta */}
            <div className="pagos-resumen-cuenta">
              <div className="pagos-total-cuenta">
                <span className="pagos-label">Total de Cuenta</span>
                <span className="pagos-monto-grande">${totalCuenta.toFixed(2)}</span>
              </div>
            </div>

            {/* Sección Descuentos */}
            <div className="pagos-descuentos">
              <button className="btn-descuentos">Descuentos</button>
              <div className="descuentos-detalle">
                <span className="descuento-texto">descuento amigo 10%</span>
                <span className="descuento-monto">- ${descuento.toFixed(2)}</span>
              </div>
              <div className="pagos-nuevo-total">
                <span className="pagos-label">Nuevo Total</span>
                <span className="pagos-monto-grande">${nuevoTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Botones de forma de pago */}
            <div className="pagos-formas-pago">
              <button 
                className={`btn-forma-pago btn-efectivo ${metodoPagoSeleccionado === 'efectivo' ? 'activo' : ''}`}
                onClick={() => setMetodoPagoSeleccionado('efectivo')}
              >
                Efectivo
              </button>
              <button 
                className={`btn-forma-pago btn-transferencia ${metodoPagoSeleccionado === 'transferencia' ? 'activo' : ''}`}
                onClick={() => setMetodoPagoSeleccionado('transferencia')}
              >
                Transferencia
              </button>
              <button 
                className={`btn-forma-pago btn-mixto ${metodoPagoSeleccionado === 'mixto' ? 'activo' : ''}`}
                onClick={() => setMetodoPagoSeleccionado('mixto')}
              >
                Mixto
              </button>
            </div>

            {/* Área de pagos realizados */}
            <div className="pagos-realizados-area">
              <h3>Pagos realizados</h3>
              <div className="pagos-realizados-contenido">
                {/* Aquí se mostrarían los pagos realizados */}
                <p className="pagos-vacio">No hay pagos registrados</p>
              </div>
            </div>

            {/* Botón COBRAR */}
            <button className="btn-cobrar" onClick={handleCobrar}>
              COBRAR
            </button>
          </div>

          {/* Columna Derecha */}
          <div className="pagos-columna-derecha">
            {/* Pagos realizados EFECTIVO */}
            {metodoPagoSeleccionado === 'efectivo' && (
              <div className="pagos-panel-efectivo">
                <h4>Pagos realizados EFECTIVO</h4>
                <div className="pagos-montos-rapidos">
                  <button className="btn-monto-rapido" onClick={() => handleMontoRapido(50)}>$50</button>
                  <button className="btn-monto-rapido" onClick={() => handleMontoRapido(100)}>$100</button>
                  <button className="btn-monto-rapido" onClick={() => handleMontoRapido(150)}>$150</button>
                  <button className="btn-monto-rapido" onClick={() => handleMontoRapido(200)}>$200</button>
                  <button className="btn-monto-rapido" onClick={() => handleMontoRapido(250)}>$250</button>
                  <button className="btn-monto-rapido" onClick={() => handleMontoRapido(300)}>$300</button>
                </div>
                <input 
                  type="number" 
                  className="pagos-input-monto" 
                  placeholder="Monto manual"
                  value={montoEfectivo}
                  onChange={(e) => setMontoEfectivo(e.target.value)}
                />
              </div>
            )}

            {/* Pagos realizados TRANSFERENCIA */}
            {metodoPagoSeleccionado === 'transferencia' && (
              <div className="pagos-panel-transferencia">
                <h4>Pagos realizados TRANSFERENCIA</h4>
                <label className="pagos-label-referencia">Número de referencia</label>
                <input 
                  type="text" 
                  className="pagos-input-referencia" 
                  value={numeroReferencia}
                  onChange={(e) => setNumeroReferencia(e.target.value)}
                />
              </div>
            )}

            {/* Pagos realizados MIXTO */}
            {metodoPagoSeleccionado === 'mixto' && (
              <div className="pagos-panel-mixto">
                <h4>Pagos realizados MIXTO</h4>
                <button className="btn-agrega-pago" onClick={handleAgregarPagoMixto}>
                  Agrega Pago
                </button>
                <div className="pagos-tabla-mixto">
                  <table>
                    <thead>
                      <tr>
                        <th>Forma de Pago</th>
                        <th>Importe</th>
                        <th>Referencia</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagosMixtos.map((pago, index) => (
                        <tr key={index}>
                          <td>
                            <input 
                              type="text" 
                              placeholder="Forma"
                              value={pago.formaPago}
                              onChange={(e) => {
                                const nuevos = [...pagosMixtos];
                                nuevos[index].formaPago = e.target.value;
                                setPagosMixtos(nuevos);
                              }}
                            />
                          </td>
                          <td>
                            <input 
                              type="number" 
                              placeholder="Importe"
                              value={pago.importe}
                              onChange={(e) => {
                                const nuevos = [...pagosMixtos];
                                nuevos[index].importe = e.target.value;
                                setPagosMixtos(nuevos);
                              }}
                            />
                          </td>
                          <td>
                            <input 
                              type="text" 
                              placeholder="Referencia"
                              value={pago.referencia}
                              onChange={(e) => {
                                const nuevos = [...pagosMixtos];
                                nuevos[index].referencia = e.target.value;
                                setPagosMixtos(nuevos);
                              }}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModuloPagos;
