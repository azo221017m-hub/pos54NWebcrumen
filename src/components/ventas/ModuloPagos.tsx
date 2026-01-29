import React, { useState, useEffect, useCallback } from 'react';
import './ModuloPagos.css';
import { obtenerDescuentos } from '../../services/descuentosService';
import { procesarPagoSimple, procesarPagoMixto, obtenerDetallesPagos } from '../../services/pagosService';
import type { Descuento } from '../../types/descuento.types';
import type { DetallePago } from '../../types/ventasWeb.types';

interface ModuloPagosProps {
  onClose: () => void;
  totalCuenta: number;
  ventaId: number | null;
  folioventa?: string;
  formadepago?: string;
}

const ModuloPagos: React.FC<ModuloPagosProps> = ({ onClose, totalCuenta, ventaId, folioventa, formadepago }) => {
  const [metodoPagoSeleccionado, setMetodoPagoSeleccionado] = useState<'efectivo' | 'transferencia' | 'mixto'>('efectivo');
  const [montoEfectivo, setMontoEfectivo] = useState<string>('');
  const [numeroReferencia, setNumeroReferencia] = useState<string>('');
  const [pagosMixtos, setPagosMixtos] = useState<Array<{ formaPago: string; importe: string; referencia: string }>>([
    { formaPago: 'Efectivo', importe: '', referencia: '' }
  ]);
  
  // Estados para descuentos
  const [descuentos, setDescuentos] = useState<Descuento[]>([]);
  const [descuentoSeleccionado, setDescuentoSeleccionado] = useState<Descuento | null>(null);
  const [cargandoDescuentos, setCargandoDescuentos] = useState(false);
  
  // Estado para procesar pago
  const [procesandoPago, setProcesandoPago] = useState(false);

  // Estado para pagos registrados
  const [pagosRegistrados, setPagosRegistrados] = useState<DetallePago[]>([]);
  const [cargandoPagosRegistrados, setCargandoPagosRegistrados] = useState(false);

  // Cargar descuentos al montar el componente
  useEffect(() => {
    cargarDescuentos();
    
    // Show warning if no ventaId
    if (!ventaId) {
      console.warn('⚠️ ModuloPagos abierto sin ventaId. El usuario debe usar PRODUCIR primero.');
    }
  }, [ventaId]);

  // Set default payment method to mixto if sale has MIXTO payment
  useEffect(() => {
    if (formadepago === 'MIXTO') {
      setMetodoPagoSeleccionado('mixto');
    }
  }, [formadepago]);

  const cargarPagosRegistrados = useCallback(async () => {
    if (!folioventa) return;
    
    try {
      setCargandoPagosRegistrados(true);
      const pagos = await obtenerDetallesPagos(folioventa);
      setPagosRegistrados(pagos);
    } catch (error) {
      console.error('Error al cargar pagos registrados:', error);
      setPagosRegistrados([]);
    } finally {
      setCargandoPagosRegistrados(false);
    }
  }, [folioventa]);

  // Cargar pagos registrados cuando cambia el método de pago a MIXTO o cuando cambia folioventa
  useEffect(() => {
    if (metodoPagoSeleccionado === 'mixto' && folioventa) {
      cargarPagosRegistrados();
    }
  }, [metodoPagoSeleccionado, folioventa, cargarPagosRegistrados]);

  const cargarDescuentos = async () => {
    try {
      setCargandoDescuentos(true);
      const descuentosData = await obtenerDescuentos();
      // Filtrar solo descuentos activos (case-insensitive)
      const descuentosActivos = descuentosData.filter(d => d.estatusdescuento.toLowerCase() === 'activo');
      setDescuentos(descuentosActivos);
    } catch (error) {
      console.error('Error al cargar descuentos:', error);
    } finally {
      setCargandoDescuentos(false);
    }
  };

  // Helper para verificar si es descuento de tipo porcentaje
  const esTipoPorcentaje = (tipodescuento: string): boolean => {
    const tipo = tipodescuento.toLowerCase();
    return tipo === 'porcentaje' || tipo === 'porcentual';
  };

  // Helper para verificar si es descuento de tipo monto fijo (efectivo/$)
  const esTipoEfectivo = (tipodescuento: string): boolean => {
    const tipo = tipodescuento.toLowerCase();
    return tipo === 'efectivo' || tipo === 'monto' || tipo === 'fijo';
  };

  // Helper para formatear el valor del descuento para mostrar
  const formatearValorDescuento = (descuento: Descuento): string => {
    const valor = Number(descuento.valor || 0);
    if (esTipoPorcentaje(descuento.tipodescuento)) {
      return `${valor}%`;
    }
    return `$${valor.toFixed(2)}`;
  };

  // Calcular descuento según el tipo y valor
  const calcularDescuento = (descuento: Descuento): number => {
    const valor = Number(descuento.valor || 0);
    if (esTipoPorcentaje(descuento.tipodescuento)) {
      // Para porcentaje: convertir el % del total y descontarlo
      return totalCuenta * (valor / 100);
    } else if (esTipoEfectivo(descuento.tipodescuento)) {
      // Para efectivo: descontar directo el valor al total
      return valor;
    }
    return 0;
  };

  const montoDescuento = descuentoSeleccionado ? calcularDescuento(descuentoSeleccionado) : 0;
  // Prevent negative totals - discount cannot exceed the total amount
  const nuevoTotal = Math.max(0, totalCuenta - montoDescuento);

  // Calculate sum of registered payments for MIXTO
  const sumaPagosRegistrados = pagosRegistrados.reduce((sum, pago) => sum + Number(pago.totaldepago || 0), 0);
  
  // Calculate amount to charge for MIXTO (nuevo total - suma de pagos registrados)
  const montoACobrar = metodoPagoSeleccionado === 'mixto' ? Math.max(0, nuevoTotal - sumaPagosRegistrados) : nuevoTotal;

  const handleSeleccionarDescuento = (id_descuento: string) => {
    if (id_descuento === '') {
      setDescuentoSeleccionado(null);
    } else {
      const descuento = descuentos.find(d => d.id_descuento.toString() === id_descuento);
      setDescuentoSeleccionado(descuento || null);
    }
  };

  const handleCancelarPagar = () => {
    console.log('Cancelando pago y regresando a dashboard...');
    onClose();
  };

  const handleAgregarPagoMixto = () => {
    setPagosMixtos([...pagosMixtos, { formaPago: 'Efectivo', importe: '', referencia: '' }]);
  };

  const handleCobrar = async () => {
    if (!ventaId) {
      alert('Error: No se ha seleccionado una venta para cobrar');
      return;
    }

    if (procesandoPago) {
      return; // Prevent double submission
    }

    console.log('Procesando cobro...');
    
    const totalAPagar = descuentoSeleccionado ? nuevoTotal : totalCuenta;
    const descuento = descuentoSeleccionado ? calcularDescuento(descuentoSeleccionado) : 0;
    
    setProcesandoPago(true);

    try {
      // Validación para efectivo
      if (metodoPagoSeleccionado === 'efectivo') {
        if (!montoEfectivo.trim()) {
          alert('Por favor ingrese el monto recibido');
          setProcesandoPago(false);
          return;
        }
        
        const montoRecibido = parseFloat(montoEfectivo);
        
        if (isNaN(montoRecibido) || montoRecibido < 0) {
          alert('Por favor ingrese un monto válido');
          setProcesandoPago(false);
          return;
        }
        
        if (montoRecibido < totalAPagar) {
          alert('El monto recibido no puede ser menor al total de la cuenta');
          setProcesandoPago(false);
          return;
        }
        
        // Process simple payment - EFECTIVO
        const resultado = await procesarPagoSimple({
          idventa: ventaId,
          formadepago: 'EFECTIVO',
          importedepago: totalAPagar,
          montorecibido: montoRecibido,
          descuento
        });

        if (!resultado.success) {
          alert(resultado.message || 'Error al procesar el pago');
          setProcesandoPago(false);
          return;
        }

        const cambio = resultado.data?.cambio || 0;
        
        alert(`Pago procesado exitosamente${cambio > 0 ? `\nCAMBIO: $${cambio.toFixed(2)}` : ''}`);
        
        // Close modal and return to dashboard
        onClose();
      } 
      // Validación para transferencia
      else if (metodoPagoSeleccionado === 'transferencia') {
        if (!numeroReferencia.trim()) {
          alert('Por favor ingrese el número de referencia');
          setProcesandoPago(false);
          return;
        }
        
        // Process simple payment - TRANSFERENCIA
        const resultado = await procesarPagoSimple({
          idventa: ventaId,
          formadepago: 'TRANSFERENCIA',
          importedepago: totalAPagar,
          referencia: numeroReferencia,
          descuento
        });

        if (!resultado.success) {
          alert(resultado.message || 'Error al procesar el pago');
          setProcesandoPago(false);
          return;
        }

        alert('Pago procesado exitosamente');
        
        // Close modal and return to dashboard
        onClose();
      }
      // Para mixto
      else {
        // Validate mixed payments
        if (pagosMixtos.length === 0) {
          alert('Debe agregar al menos una forma de pago');
          setProcesandoPago(false);
          return;
        }

        // Validate all payments have required fields
        for (const pago of pagosMixtos) {
          if (!pago.formaPago || pago.formaPago === '') {
            alert('Todas las formas de pago deben estar seleccionadas');
            setProcesandoPago(false);
            return;
          }

          if (!pago.importe || pago.importe === '' || parseFloat(pago.importe) <= 0) {
            alert('Todos los importes deben ser mayores a cero');
            setProcesandoPago(false);
            return;
          }

          if (pago.formaPago === 'Transferencia' && !pago.referencia) {
            alert('Debe ingresar el número de referencia para pagos con transferencia');
            setProcesandoPago(false);
            return;
          }
        }

        // Map form data to API format
        const detallesPagos = pagosMixtos.map(pago => ({
          formadepagodetalle: pago.formaPago.toUpperCase() as 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA',
          totaldepago: parseFloat(pago.importe),
          referencia: pago.referencia || null
        }));

        // Process mixed payment
        const resultado = await procesarPagoMixto({
          idventa: ventaId,
          detallesPagos,
          descuento
        });

        if (!resultado.success) {
          alert(resultado.message || 'Error al procesar el pago mixto');
          setProcesandoPago(false);
          return;
        }

        alert(resultado.message || 'Pago procesado exitosamente');
        
        // Close modal and return to dashboard
        onClose();
      }
    } catch (error) {
      console.error('Error al procesar pago:', error);
      alert('Error al procesar el pago. Por favor intente nuevamente.');
      setProcesandoPago(false);
    }
  };

  return (
    <div className="modulo-pagos-overlay">
      <div className="modulo-pagos-container">
        <div className="modulo-pagos-content">
          {/* Columna Izquierda */}
          <div className="pagos-columna-izquierda">
            {/* Resumen de Cuenta */}
            <div className="pagos-resumen-cuenta">
              <div className="pagos-total-cuenta">
                <span className="pagos-label">Total de Cuenta</span>
                <span className="pagos-monto-grande">${totalCuenta.toFixed(2)}</span>
              </div>
              
              {/* Warning if no ventaId */}
              {!ventaId && (
                <div style={{ 
                  backgroundColor: '#fff3cd', 
                  color: '#856404', 
                  padding: '10px', 
                  borderRadius: '4px', 
                  marginTop: '10px',
                  fontSize: '14px',
                  textAlign: 'center'
                }}>
                  ⚠️ Debe usar el botón PRODUCIR antes de procesar el cobro
                </div>
              )}
            </div>

            {/* Sección Descuentos */}
            <div className="pagos-descuentos">
              <label htmlFor="select-descuento" className="pagos-label-descuento">Descuentos</label>
              <select 
                id="select-descuento"
                className="pagos-select-descuento"
                value={descuentoSeleccionado?.id_descuento.toString() || ''}
                onChange={(e) => handleSeleccionarDescuento(e.target.value)}
                disabled={cargandoDescuentos}
              >
                <option value="">
                  {cargandoDescuentos ? 'Cargando...' : 'Seleccionar descuento'}
                </option>
                {descuentos.map((descuento) => (
                  <option key={descuento.id_descuento} value={descuento.id_descuento.toString()}>
                    {descuento.nombre} - {formatearValorDescuento(descuento)}
                  </option>
                ))}
              </select>
              
              {descuentoSeleccionado && (
                <>
                  <div className="descuentos-detalle">
                    <span className="descuento-texto">{descuentoSeleccionado.nombre}</span>
                    <span className="descuento-monto">- ${montoDescuento.toFixed(2)}</span>
                  </div>
                  <div className="pagos-nuevo-total">
                    <span className="pagos-label">Nuevo Total</span>
                    <span className="pagos-monto-grande">${nuevoTotal.toFixed(2)}</span>
                  </div>
                </>
              )}
            </div>

            {/* Botones de forma de pago */}
            <div className="pagos-formas-pago">
              <button 
                className={`btn-forma-pago btn-efectivo ${metodoPagoSeleccionado === 'efectivo' ? 'activo' : ''} ${formadepago === 'MIXTO' ? 'disabled' : ''}`}
                onClick={() => setMetodoPagoSeleccionado('efectivo')}
                disabled={formadepago === 'MIXTO'}
              >
                Efectivo
              </button>
              <button 
                className={`btn-forma-pago btn-transferencia ${metodoPagoSeleccionado === 'transferencia' ? 'activo' : ''} ${formadepago === 'MIXTO' ? 'disabled' : ''}`}
                onClick={() => setMetodoPagoSeleccionado('transferencia')}
                disabled={formadepago === 'MIXTO'}
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
                {cargandoPagosRegistrados ? (
                  <p className="pagos-vacio">Cargando pagos...</p>
                ) : metodoPagoSeleccionado === 'mixto' && pagosRegistrados.length > 0 ? (
                  <div className="pagos-registrados-lista">
                    {pagosRegistrados.map((pago, index) => (
                      <div key={index} className="pago-registrado-item">
                        <span className="pago-forma">{pago.formadepagodetalle}</span>
                        <span className="pago-monto">${Number(pago.totaldepago).toFixed(2)}</span>
                        {pago.referencia && (
                          <span className="pago-referencia">Ref: {pago.referencia}</span>
                        )}
                      </div>
                    ))}
                    <div className="pago-registrado-total">
                      <span>Total Pagado:</span>
                      <span className="pago-total-monto">${sumaPagosRegistrados.toFixed(2)}</span>
                    </div>
                  </div>
                ) : (
                  <p className="pagos-vacio">No hay pagos registrados</p>
                )}
              </div>
            </div>

            {/* Botón de acción - solo COBRAR */}
            <div className="pagos-botones-accion">
              <button 
                className="btn-cobrar" 
                onClick={handleCobrar}
                disabled={procesandoPago || !ventaId}
              >
                {procesandoPago ? 'PROCESANDO...' : 'COBRAR'}
              </button>
            </div>
          </div>

          {/* Columna Derecha */}
          <div className="pagos-columna-derecha">
            {/* Pagos realizados EFECTIVO */}
            {metodoPagoSeleccionado === 'efectivo' && (
              <div className="pagos-panel-efectivo">
                <h4>Pagos realizados EFECTIVO</h4>
                <label className="pagos-label-monto">Monto a cobrar</label>
                <div className="pagos-monto-info">
                  ${descuentoSeleccionado ? nuevoTotal.toFixed(2) : totalCuenta.toFixed(2)}
                </div>
                <label className="pagos-label-monto">Total recibido</label>
                <input 
                  type="number" 
                  className="pagos-input-monto" 
                  placeholder="Ingrese el monto recibido"
                  value={montoEfectivo}
                  onChange={(e) => setMontoEfectivo(e.target.value)}
                  min="0"
                  step="0.01"
                />
                
                {/* Botón CANCELAR */}
                <button className="btn-cancelar-pagar" onClick={handleCancelarPagar}>
                  CANCELAR
                </button>
              </div>
            )}

            {/* Pagos realizados TRANSFERENCIA */}
            {metodoPagoSeleccionado === 'transferencia' && (
              <div className="pagos-panel-transferencia">
                <h4>Pagos realizados TRANSFERENCIA</h4>
                <label className="pagos-label-referencia">Importe a cobrar</label>
                <div className="pagos-monto-info">
                  ${descuentoSeleccionado ? nuevoTotal.toFixed(2) : totalCuenta.toFixed(2)}
                </div>
                <label className="pagos-label-referencia">Número de referencia</label>
                <input 
                  type="text" 
                  className="pagos-input-referencia" 
                  placeholder="Ingrese número de referencia"
                  value={numeroReferencia}
                  onChange={(e) => setNumeroReferencia(e.target.value)}
                />
                
                {/* Botón CANCELAR */}
                <button className="btn-cancelar-pagar" onClick={handleCancelarPagar}>
                  CANCELAR
                </button>
              </div>
            )}

            {/* Pagos realizados MIXTO */}
            {metodoPagoSeleccionado === 'mixto' && (
              <div className="pagos-panel-mixto">
                <h4>Pagos realizados MIXTO</h4>
                
                {/* Show amount to charge */}
                <div className="pagos-monto-cobrar-info">
                  <label className="pagos-label-monto">Monto a cobrar</label>
                  <div className="pagos-monto-info">
                    ${montoACobrar.toFixed(2)}
                  </div>
                  {pagosRegistrados.length > 0 && (
                    <div className="pagos-info-detalle">
                      Total: ${nuevoTotal.toFixed(2)} - Pagado: ${sumaPagosRegistrados.toFixed(2)}
                    </div>
                  )}
                </div>

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
                            <select 
                              className="pagos-select-forma"
                              value={pago.formaPago}
                              onChange={(e) => {
                                const nuevos = [...pagosMixtos];
                                nuevos[index].formaPago = e.target.value;
                                setPagosMixtos(nuevos);
                              }}
                            >
                              <option value="">Seleccione...</option>
                              <option value="Efectivo">Efectivo</option>
                              <option value="Transferencia">Transferencia</option>
                            </select>
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
                              disabled={pago.formaPago !== 'Transferencia'}
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
                
                {/* Botón para agregar forma de pago */}
                <button className="btn-agrega-pago" onClick={handleAgregarPagoMixto}>
                  Agregar forma de pago
                </button>
                
                {/* Botón CANCELAR */}
                <button className="btn-cancelar-pagar" onClick={handleCancelarPagar}>
                  CANCELAR
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModuloPagos;
