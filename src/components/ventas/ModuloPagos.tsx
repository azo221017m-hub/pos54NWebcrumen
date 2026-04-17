import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import './ModuloPagos.css';
import { obtenerDescuentos } from '../../services/descuentosService';
import { procesarPagoSimple, procesarPagoMixto, obtenerDetallesPagos } from '../../services/pagosService';
import { negociosService } from '../../services/negociosService';
import type { DatosRecibo } from '../../utils/reciboPagoUtils';
import type { DetallePagoRecibo } from '../../utils/reciboPagoUtils';
import { imprimirRecibo, enviarReciboWhatsApp } from '../../utils/reciboPagoUtils';
import type { Descuento } from '../../types/descuento.types';
import type { DetallePago, TipoDeVenta } from '../../types/ventasWeb.types';
import type { Negocio, ParametrosNegocio } from '../../types/negocio.types';

interface DetalleVentaSimple {
  comensal?: string;
  precio: number;
  cantidad: number;
  nombreproducto?: string;
  moderadores?: string | null;
}

interface ModuloPagosProps {
  onClose: () => void;
  totalCuenta: number;
  ventaId: number | null;
  folioventa?: string;
  formadepago?: string;
  tipodeventa?: TipoDeVenta;
  detallesVenta?: DetalleVentaSimple[];
}

// Constants
const DEFAULT_SEAT = 'A1'; // Default seat identifier when no seat is assigned
const DEFAULT_PRODUCT_NAME = 'Producto'; // Fallback product name for receipt when name is unavailable
const DEFAULT_NEGOCIO_NAME = 'Negocio sin nombre'; // Fallback business name for receipt

// Natural sort function for alphanumeric seat identifiers (e.g., A1, A2, A10)
const naturalSort = (a: string, b: string): number => {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
};

const ModuloPagos: React.FC<ModuloPagosProps> = ({ onClose, totalCuenta, ventaId, folioventa, formadepago, tipodeventa, detallesVenta }) => {
  const [metodoPagoSeleccionado, setMetodoPagoSeleccionado] = useState<'efectivo' | 'transferencia' | 'mixto'>('efectivo');
  const [montoEfectivo, setMontoEfectivo] = useState<string>('');
  const [numeroReferencia, setNumeroReferencia] = useState<string>('');
  const [pagosMixtos, setPagosMixtos] = useState<Array<{ formaPago: string; importe: string; referencia: string }>>([
    { formaPago: 'Efectivo', importe: '', referencia: '' }
  ]);
  
  // Refs for setting focus
  const montoEfectivoRef = useRef<HTMLInputElement>(null);
  const numeroReferenciaRef = useRef<HTMLInputElement>(null);
  
  // Estados para descuentos
  const [descuentos, setDescuentos] = useState<Descuento[]>([]);
  const [descuentoSeleccionado, setDescuentoSeleccionado] = useState<Descuento | null>(null);
  const [cargandoDescuentos, setCargandoDescuentos] = useState(false);
  
  // Estado para procesar pago
  const [procesandoPago, setProcesandoPago] = useState(false);

  // Estado para pantalla de éxito tras procesar pago.
  // Non-null value means payment was completed; holds the receipt data for the action buttons.
  const [datosReciboGuardados, setDatosReciboGuardados] = useState<DatosRecibo | null>(null);

  // Estado para pagos registrados
  const [pagosRegistrados, setPagosRegistrados] = useState<DetallePago[]>([]);
  const [cargandoPagosRegistrados, setCargandoPagosRegistrados] = useState(false);

  // Estado para el efecto de destello del botón cobrar
  const [flashCobrar, setFlashCobrar] = useState(false);
  
  // Ref for the flash timeout to allow cleanup
  const flashTimeoutRef = useRef<number | null>(null);

  // Estado para datos del negocio (para el recibo)
  const [negocioData, setNegocioData] = useState<Negocio | null>(null);
  const [parametrosData, setParametrosData] = useState<ParametrosNegocio | null>(null);

  const cargarDescuentos = useCallback(async () => {
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
  }, []);

  // Cargar descuentos al montar el componente
  useEffect(() => {
    cargarDescuentos();
    
    // Show warning if no ventaId
    if (!ventaId) {
      console.warn('⚠️ ModuloPagos abierto sin ventaId. El usuario debe usar PRODUCIR primero.');
    }
  }, [ventaId, cargarDescuentos]);

  // Cargar datos del negocio para el recibo
  useEffect(() => {
    const cargarDatosNegocio = async () => {
      try {
        const idNegocioStr = localStorage.getItem('idnegocio');
        if (!idNegocioStr) return;
        const idNegocio = parseInt(idNegocioStr, 10);
        if (isNaN(idNegocio)) return;
        const negocioCompleto = await negociosService.obtenerNegocioPorId(idNegocio);
        setNegocioData(negocioCompleto.negocio);
        if (negocioCompleto.parametros) {
          setParametrosData(negocioCompleto.parametros);
        }
      } catch (error) {
        console.error('Error al cargar datos del negocio para el recibo:', error);
      }
    };
    cargarDatosNegocio();
  }, []);

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

  // Load registered payments on mount to check if discounts should be disabled
  useEffect(() => {
    if (folioventa) {
      cargarPagosRegistrados();
    }
  }, [folioventa, cargarPagosRegistrados]);

  // Cargar pagos registrados cuando cambia el método de pago a MIXTO o cuando cambia folioventa
  useEffect(() => {
    if (metodoPagoSeleccionado === 'mixto' && folioventa) {
      cargarPagosRegistrados();
    }
  }, [metodoPagoSeleccionado, folioventa, cargarPagosRegistrados]);

  // Set focus when payment method changes
  useEffect(() => {
    if (metodoPagoSeleccionado === 'efectivo' && montoEfectivoRef.current) {
      montoEfectivoRef.current.focus();
    } else if (metodoPagoSeleccionado === 'transferencia' && numeroReferenciaRef.current) {
      numeroReferenciaRef.current.focus();
    }
  }, [metodoPagoSeleccionado]);

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

  // Calculate subtotals per seat for MESA sales - memoized to avoid recalculation on every render
  const subtotalesPorAsiento = useMemo(() => {
    if (tipodeventa !== 'MESA' || !detallesVenta || detallesVenta.length === 0) {
      return {};
    }

    return detallesVenta.reduce((acc, detalle) => {
      const asiento = detalle.comensal || DEFAULT_SEAT;
      const subtotal = detalle.precio * detalle.cantidad;
      acc[asiento] = (acc[asiento] || 0) + subtotal;
      return acc;
    }, {} as Record<string, number>);
  }, [tipodeventa, detallesVenta]);

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
    const nuevaCantidad = pagosMixtos.length + 1;
    const importeBase = Math.floor((montoACobrar / nuevaCantidad) * 100) / 100;
    const residuo = Math.round((montoACobrar - importeBase * nuevaCantidad) * 100) / 100;
    const nuevosArr = pagosMixtos.map((p, i) => ({
      ...p,
      importe: i === 0 ? (importeBase + residuo).toFixed(2) : importeBase.toFixed(2)
    }));
    nuevosArr.push({ formaPago: 'Efectivo', importe: importeBase.toFixed(2), referencia: '' });
    setPagosMixtos(nuevosArr);
  };

  // Handle click on "Monto a cobrar" label to copy amount to input
  const handleCopiarMonto = () => {
    if (metodoPagoSeleccionado === 'efectivo') {
      // Copy the amount to the input (already without $ sign in the value)
      const montoACopiar = (descuentoSeleccionado ? nuevoTotal : totalCuenta).toFixed(2);
      setMontoEfectivo(montoACopiar);
      
      // Clear any existing timeout
      if (flashTimeoutRef.current !== null) {
        clearTimeout(flashTimeoutRef.current);
      }
      
      // Trigger flash effect on COBRAR button
      setFlashCobrar(true);
      flashTimeoutRef.current = window.setTimeout(() => {
        setFlashCobrar(false);
        flashTimeoutRef.current = null;
      }, 600);
      
      // Focus on the input
      if (montoEfectivoRef.current) {
        montoEfectivoRef.current.focus();
      }
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (flashTimeoutRef.current !== null) {
        clearTimeout(flashTimeoutRef.current);
      }
    };
  }, []);

  const handleEliminarPagoMixto = (index: number) => {
    if (pagosMixtos.length > 1) {
      const nuevos = pagosMixtos.filter((_, i) => i !== index);
      setPagosMixtos(nuevos);
    } else {
      alert('Debe mantener al menos una forma de pago');
    }
  };

  // Helper to build receipt data for the current payment
  const buildDatosRecibo = useCallback((
    fpago: string,
    importePago: number,
    referenciaRecibo?: string | null,
    cambioRecibo?: number,
    detallesPagosMixtos?: DetallePagoRecibo[],
    importeRecibido?: number
  ) => {
    const fecha = new Date();
    const fechaStr = fecha.toLocaleDateString('es-MX') + ' ' + fecha.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
    const items = (detallesVenta || []).map(d => ({
      nombreproducto: d.nombreproducto || DEFAULT_PRODUCT_NAME,
      cantidad: d.cantidad,
      preciounitario: d.precio,
      subtotal: d.precio * d.cantidad,
      moderadores: d.moderadores ?? undefined,
    }));
    const totalAPagar = descuentoSeleccionado ? nuevoTotal : totalCuenta;
    return {
      nombredenegocio: negocioData?.nombreNegocio || DEFAULT_NEGOCIO_NAME,
      rfc: negocioData?.rfcnegocio || undefined,
      direccionfiscal: negocioData?.direccionfiscalnegocio || undefined,
      encabezado: parametrosData?.encabezado || undefined,
      folioventa: folioventa,
      fechadeventa: fechaStr,
      items,
      subtotal: totalCuenta,
      descuentos: descuentoSeleccionado ? montoDescuento : undefined,
      total: totalAPagar,
      formadepago: fpago,
      importedepago: importePago,
      referencia: referenciaRecibo ?? undefined,
      cambio: cambioRecibo,
      detallesPagosMixtos,
      importerecibido: importeRecibido,
      telefonopedidos: parametrosData?.telefonoPedidos || undefined,
      pie: parametrosData?.pie || undefined,
    };
  }, [detallesVenta, descuentoSeleccionado, nuevoTotal, totalCuenta, negocioData, parametrosData, folioventa, montoDescuento]);

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
          descuento,
          detalledescuento: descuentoSeleccionado?.nombre || null
        });

        if (!resultado.success) {
          alert(resultado.message || 'Error al procesar el pago');
          setProcesandoPago(false);
          return;
        }

        const cambio = resultado.data?.cambio || 0;
        
        // Build receipt data
        const montoEfectivoNum = parseFloat(montoEfectivo);
        const datosRecibo = buildDatosRecibo('EFECTIVO', totalAPagar, null, cambio, undefined, !isNaN(montoEfectivoNum) ? montoEfectivoNum : undefined);

        // Show success state — user chooses when to print/send and when to close
        setDatosReciboGuardados(datosRecibo);
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
          descuento,
          detalledescuento: descuentoSeleccionado?.nombre || null
        });

        if (!resultado.success) {
          alert(resultado.message || 'Error al procesar el pago');
          setProcesandoPago(false);
          return;
        }

        // Build receipt data
        const datosRecibo = buildDatosRecibo('TRANSFERENCIA', totalAPagar, numeroReferencia);

        // Show success state — user chooses when to print/send and when to close
        setDatosReciboGuardados(datosRecibo);
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

        // Validate sum of new payments does not exceed amount to charge
        const sumaNuevosPagos = pagosMixtos.reduce((sum, pago) => {
          const importe = Number(pago.importe);
          return sum + (isNaN(importe) ? 0 : importe);
        }, 0);
        if (sumaNuevosPagos > montoACobrar) {
          alert(`La suma de los pagos ($${sumaNuevosPagos.toFixed(2)}) no puede ser mayor al monto a cobrar ($${montoACobrar.toFixed(2)})`);
          setProcesandoPago(false);
          return;
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
          descuento,
          detalledescuento: descuentoSeleccionado?.nombre || null
        });

        if (!resultado.success) {
          alert(resultado.message || 'Error al procesar el pago mixto');
          setProcesandoPago(false);
          return;
        }

        // Build receipt data — combine prior registered payments + new mixto payments
        const todosLosPagos: DetallePagoRecibo[] = [
          ...pagosRegistrados.map(p => ({
            formadepago: p.formadepagodetalle,
            importe: Number(p.totaldepago),
            referencia: p.referencia,
          })),
          ...pagosMixtos.map(p => ({
            formadepago: p.formaPago.toUpperCase(),
            importe: parseFloat(p.importe),
            referencia: p.referencia || null,
          })),
        ];
        const datosRecibo = buildDatosRecibo('MIXTO', totalAPagar, undefined, undefined, todosLosPagos);

        // Show success state — user chooses when to print/send and when to close
        setDatosReciboGuardados(datosRecibo);
      }
    } catch (error) {
      console.error('Error al procesar pago:', error);
      alert('Error al procesar el pago. Por favor intente nuevamente.');
      setProcesandoPago(false);
    }
  };

  // COBRAR disabled: also disable in MIXTO when sum of importes < montoACobrar
  const sumaPagosMixtos = pagosMixtos.reduce((sum, p) => sum + (Number(p.importe) || 0), 0);
  const cobrarDisabled = procesandoPago || !ventaId || (metodoPagoSeleccionado === 'mixto' && sumaPagosMixtos < montoACobrar);

  return (
    <div className="modulo-pagos-overlay">
      <div className="modulo-pagos-container">

        {/* ── PANTALLA DE ÉXITO: PAGO PROCESADO ── */}
        {datosReciboGuardados && (
          <div className="pago-completado-panel">
            <div className="pago-completado-icono">✅</div>
            <h2 className="pago-completado-titulo">PAGO PROCESADO</h2>
            <p className="pago-completado-subtitulo">El pago fue registrado correctamente.</p>
            <div className="pago-completado-botones">
              <button
                className="btn-pago-completado btn-listo"
                onClick={onClose}
              >
                ✔ Listo
              </button>
              {parametrosData?.impresionRecibo === 1 && (
                <button
                  className="btn-pago-completado btn-imprimir"
                  onClick={() => imprimirRecibo(datosReciboGuardados)}
                >
                  🖨 Imprimir
                </button>
              )}
              {parametrosData?.envioWhats === 1 && (
                <button
                  className="btn-pago-completado btn-whatsapp"
                  onClick={() => enviarReciboWhatsApp(datosReciboGuardados)}
                >
                  📲 Enviar WhatsApp
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── FORMULARIO DE PAGO (oculto tras procesar) ── */}
        {!datosReciboGuardados && (
        <div className="modulo-pagos-content">
          {/* Columna Izquierda */}
          <div className="pagos-columna-izquierda">
            {/* Resumen de Cuenta */}
            <div className="pagos-resumen-cuenta">
              <div className="pagos-total-cuenta">
                <span className="pagos-label">Total de Cuenta</span>
                <span className="pagos-monto-grande">${totalCuenta.toFixed(2)}</span>
              </div>

              {/* Subtotales por Asiento - Only for MESA sales */}
              {tipodeventa === 'MESA' && Object.keys(subtotalesPorAsiento).length > 0 && (
                <div style={{ 
                  marginTop: '15px', 
                  padding: '10px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '4px',
                  border: '1px solid #dee2e6'
                }}>
                  <div style={{ 
                    fontSize: '14px', 
                    fontWeight: 'bold', 
                    marginBottom: '8px',
                    color: '#495057'
                  }}>
                    Subtotal por Asiento:
                  </div>
                  {Object.entries(subtotalesPorAsiento)
                    .sort(([a], [b]) => naturalSort(a, b)) // Natural sort for alphanumeric seat identifiers
                    .map(([asiento, subtotal]) => (
                      <div 
                        key={asiento}
                        style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          padding: '4px 0',
                          fontSize: '13px',
                          color: '#212529'
                        }}
                      >
                        <span>Asiento {asiento}:</span>
                        <span style={{ fontWeight: '600' }}>${subtotal.toFixed(2)}</span>
                      </div>
                    ))}
                </div>
              )}
              
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
                disabled={cargandoDescuentos || pagosRegistrados.length > 0}
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
                  </div>
                ) : (
                  <p className="pagos-vacio">No hay pagos registrados</p>
                )}
              </div>
            </div>

            {/* Botón de acción - solo COBRAR */}
            <div className="pagos-botones-accion">
              <button 
                className={`btn-cobrar ${flashCobrar ? 'flash' : ''}`}
                onClick={handleCobrar}
                disabled={cobrarDisabled}
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
                <button 
                  className="btn-monto-cobrar" 
                  onClick={handleCopiarMonto}
                  title="Haz clic para copiar el monto al campo de Total recibido"
                >
                  <span className="btn-monto-cobrar-label">Monto a cobrar</span>
                  <span className="btn-monto-cobrar-valor">
                    ${descuentoSeleccionado ? nuevoTotal.toFixed(2) : totalCuenta.toFixed(2)}
                  </span>
                </button>
                <label className="pagos-label-monto">Total recibido</label>
                <input 
                  ref={montoEfectivoRef}
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
                  ref={numeroReferenciaRef}
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
                        <th>Acción</th>
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
                              className="pagos-input-importe-mixto"
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
                          <td>
                            <button 
                              className="btn-eliminar-pago"
                              onClick={() => handleEliminarPagoMixto(index)}
                              title="Eliminar forma de pago"
                            >
                              ✕
                            </button>
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
        )} {/* end !datosReciboGuardados */}
      </div>
    </div>
  );
};

export default ModuloPagos;
