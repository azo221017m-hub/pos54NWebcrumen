import React, { useState, useEffect } from 'react';
import './ModuloPagos.css';
import { obtenerDescuentos } from '../../services/descuentosService';
import type { Descuento } from '../../types/descuento.types';

interface ModuloPagosProps {
  onClose: () => void;
  totalCuenta: number;
}

const ModuloPagos: React.FC<ModuloPagosProps> = ({ onClose, totalCuenta }) => {
  const [metodoPagoSeleccionado, setMetodoPagoSeleccionado] = useState<'efectivo' | 'transferencia' | 'mixto'>('efectivo');
  const [montoEfectivo, setMontoEfectivo] = useState<string>('');
  const [numeroReferencia, setNumeroReferencia] = useState<string>('');
  const [pagosMixtos, setPagosMixtos] = useState<Array<{ formaPago: string; importe: string; referencia: string }>>([
    { formaPago: 'Efectivo', importe: '', referencia: '' }
  ]);
  
  // Estados para descuentos
  const [descuentos, setDescuentos] = useState<Descuento[]>([]);
  const [mostrarDescuentos, setMostrarDescuentos] = useState(false);
  const [descuentoSeleccionado, setDescuentoSeleccionado] = useState<Descuento | null>(null);
  const [cargandoDescuentos, setCargandoDescuentos] = useState(false);

  // Cargar descuentos al montar el componente
  useEffect(() => {
    cargarDescuentos();
  }, []);

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

  // Helper para verificar si es descuento de tipo monto fijo
  const esTipoMontoFijo = (tipodescuento: string): boolean => {
    const tipo = tipodescuento.toLowerCase();
    return tipo === 'monto' || tipo === 'fijo';
  };

  // Helper para formatear el valor del descuento para mostrar
  const formatearValorDescuento = (descuento: Descuento): string => {
    if (esTipoPorcentaje(descuento.tipodescuento)) {
      return `${descuento.valor}%`;
    }
    return `$${descuento.valor.toFixed(2)}`;
  };

  // Calcular descuento según el tipo y valor
  const calcularDescuento = (descuento: Descuento): number => {
    if (esTipoPorcentaje(descuento.tipodescuento)) {
      return totalCuenta * (descuento.valor / 100);
    } else if (esTipoMontoFijo(descuento.tipodescuento)) {
      return descuento.valor;
    }
    return 0;
  };

  const montoDescuento = descuentoSeleccionado ? calcularDescuento(descuentoSeleccionado) : 0;
  const nuevoTotal = totalCuenta - montoDescuento;

  const handleSeleccionarDescuento = (descuento: Descuento) => {
    setDescuentoSeleccionado(descuento);
    setMostrarDescuentos(false);
  };

  const handleCobrar = () => {
    console.log('Procesando cobro...');
    // Aquí se implementaría la lógica de cobro
    alert('Cobro procesado exitosamente');
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
              <button 
                className="btn-descuentos"
                onClick={() => setMostrarDescuentos(!mostrarDescuentos)}
                disabled={cargandoDescuentos}
              >
                {cargandoDescuentos ? 'Cargando...' : 'Descuentos'}
              </button>
              
              {/* Modal de selección de descuentos */}
              {mostrarDescuentos && (
                <div className="descuentos-lista-modal">
                  <div className="descuentos-lista-header">
                    <h4>Seleccionar Descuento</h4>
                    <button 
                      className="descuentos-lista-cerrar"
                      onClick={() => setMostrarDescuentos(false)}
                    >
                      ✕
                    </button>
                  </div>
                  <div className="descuentos-lista-contenido">
                    {descuentos.length === 0 ? (
                      <p className="descuentos-vacio">No hay descuentos disponibles</p>
                    ) : (
                      descuentos.map((descuento) => (
                        <button
                          key={descuento.id_descuento}
                          className="descuento-item"
                          onClick={() => handleSeleccionarDescuento(descuento)}
                        >
                          <span className="descuento-item-nombre">{descuento.nombre}</span>
                          <span className="descuento-item-valor">
                            {formatearValorDescuento(descuento)}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
              
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
                  <button 
                    className="btn-quitar-descuento"
                    onClick={() => setDescuentoSeleccionado(null)}
                  >
                    Quitar Descuento
                  </button>
                </>
              )}
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
                />
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
              </div>
            )}

            {/* Pagos realizados MIXTO */}
            {metodoPagoSeleccionado === 'mixto' && (
              <div className="pagos-panel-mixto">
                <h4>Pagos realizados MIXTO</h4>
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
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModuloPagos;
