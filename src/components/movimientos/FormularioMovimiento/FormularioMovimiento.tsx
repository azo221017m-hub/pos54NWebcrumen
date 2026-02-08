import React, { useState, useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';
import type {
  MovimientoConDetalles,
  MovimientoCreate,
  DetalleMovimientoCreate,
  MotivoMovimiento,
  UltimaCompraData
} from '../../../types/movimientos.types';
import type { Insumo } from '../../../types/insumo.types';
import type { Proveedor } from '../../../types/proveedor.types';
import { obtenerInsumos } from '../../../services/insumosService';
import { obtenerProveedores } from '../../../services/proveedoresService';
import { obtenerUltimaCompra } from '../../../services/movimientosService';
import './FormularioMovimiento.css';

interface Props {
  movimiento: MovimientoConDetalles | null;
  onGuardar: (data: MovimientoCreate) => Promise<void>;
  onCancelar: () => void;
}

const FormularioMovimiento: React.FC<Props> = ({ movimiento, onGuardar, onCancelar }) => {
  const idnegocio = Number(localStorage.getItem('idnegocio')) || 1;
  
  // Estado del formulario
  const [motivomovimiento, setMotivoMovimiento] = useState<MotivoMovimiento>('COMPRA');
  const [observaciones, setObservaciones] = useState('');
  const [detalles, setDetalles] = useState<DetalleMovimientoCreate[]>([]);
  const [guardando, setGuardando] = useState(false);
  
  // Estado para insumos
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [cargandoInsumos, setCargandoInsumos] = useState(false);
  
  // Estado para proveedores
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [cargandoProveedores, setCargandoProveedores] = useState(false);
  
  // Estado para datos de última compra por detalle
  const [ultimasCompras, setUltimasCompras] = useState<Map<number, UltimaCompraData>>(new Map());

  // Cargar insumos disponibles
  useEffect(() => {
    const cargarInsumos = async () => {
      setCargandoInsumos(true);
      try {
        const data = await obtenerInsumos(idnegocio);
        setInsumos(data);
      } catch (error) {
        console.error('Error al cargar insumos:', error);
      } finally {
        setCargandoInsumos(false);
      }
    };
    cargarInsumos();
  }, [idnegocio]);
  
  // Cargar proveedores disponibles
  useEffect(() => {
    const cargarProveedores = async () => {
      setCargandoProveedores(true);
      try {
        const data = await obtenerProveedores();
        setProveedores(data);
      } catch (error) {
        console.error('Error al cargar proveedores:', error);
      } finally {
        setCargandoProveedores(false);
      }
    };
    cargarProveedores();
  }, []);

  // Cargar datos si es edición
  useEffect(() => {
    if (movimiento) {
      setMotivoMovimiento(movimiento.motivomovimiento);
      setObservaciones(movimiento.observaciones || '');
      setDetalles(
        movimiento.detalles.map((d) => ({
          idinsumo: d.idinsumo,
          nombreinsumo: d.nombreinsumo,
          tipoinsumo: d.tipoinsumo,
          cantidad: d.cantidad,
          unidadmedida: d.unidadmedida,
          costo: d.costo,
          precio: d.precio,
          observaciones: d.observaciones,
          proveedor: d.proveedor
        }))
      );
    }
  }, [movimiento]);

  const agregarDetalle = () => {
    const nuevoDetalle: DetalleMovimientoCreate = {
      idinsumo: 0,
      nombreinsumo: '',
      tipoinsumo: 'INVENTARIO',
      cantidad: 0,
      unidadmedida: '',
      costo: 0,
      precio: 0,
      observaciones: '',
      proveedor: ''
    };
    setDetalles([...detalles, nuevoDetalle]);
  };

  const eliminarDetalle = (index: number) => {
    setDetalles(detalles.filter((_, i) => i !== index));
  };

  const actualizarDetalle = async (index: number, campo: keyof DetalleMovimientoCreate, valor: any) => {
    const nuevosDetalles = [...detalles];
    
    if (campo === 'idinsumo') {
      const insumoSeleccionado = insumos.find((i) => i.id_insumo === Number(valor));
      if (insumoSeleccionado) {
        nuevosDetalles[index] = {
          ...nuevosDetalles[index],
          idinsumo: insumoSeleccionado.id_insumo,
          nombreinsumo: insumoSeleccionado.nombre,
          unidadmedida: insumoSeleccionado.unidad_medida,
          tipoinsumo: 'INVENTARIO',
          costo: insumoSeleccionado.costo_promedio_ponderado || 0,
          proveedor: insumoSeleccionado.idproveedor || '',
          // Temporary field to hold stock_actual as fallback
          stockActual: insumoSeleccionado.stock_actual
        } as any;
        
        // Populate with insumo data: Existencia, Costo Promedio Ponderado, and Proveedor
        const nuevasUltimasCompras = new Map(ultimasCompras);
        nuevasUltimasCompras.set(index, {
          existencia: insumoSeleccionado.stock_actual,
          costoUltimoPonderado: insumoSeleccionado.costo_promedio_ponderado,
          unidadMedida: insumoSeleccionado.unidad_medida,
          cantidadUltimaCompra: 0,
          proveedorUltimaCompra: '',
          costoUltimaCompra: 0
        });
        
        // Fetch last purchase data
        try {
          const ultimaCompraData = await obtenerUltimaCompra(insumoSeleccionado.id_insumo);
          
          // Merge data, but keep the existencia from insumo if API returns existencia
          // This ensures we use the fresh stock_actual from the API call
          const datosCompletos = {
            ...nuevasUltimasCompras.get(index)!,
            ...ultimaCompraData,
            // Always use the existencia from API response since it's the most current
            existencia: ultimaCompraData.existencia
          };
          
          nuevasUltimasCompras.set(index, datosCompletos);
          setUltimasCompras(nuevasUltimasCompras);
        } catch (error) {
          console.error('Error al obtener última compra:', error);
          // Still set state with basic insumo data even if ultima compra fails
          setUltimasCompras(nuevasUltimasCompras);
        }
      }
    } else {
      (nuevosDetalles[index] as any)[campo] = valor;
    }
    
    setDetalles(nuevosDetalles);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (detalles.length === 0) {
      alert('Debe agregar al menos un insumo');
      return;
    }

    const movimientoData: MovimientoCreate = {
      tipomovimiento: motivomovimiento === 'COMPRA' || motivomovimiento === 'AJUSTE_MANUAL' || motivomovimiento === 'DEVOLUCION' || motivomovimiento === 'INV_INICIAL' ? 'ENTRADA' : 'SALIDA',
      motivomovimiento,
      fechamovimiento: new Date().toISOString(),
      observaciones,
      estatusmovimiento: 'PENDIENTE',
      detalles
    };

    setGuardando(true);
    try {
      await onGuardar(movimientoData);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="formulario-movimiento-overlay">
      <div className="formulario-movimiento-container">
        <div className="formulario-movimiento-header">
          <h2>{movimiento ? 'Editar Movimiento' : 'SUMATORIA DE MOVIMIENTO de INVENTARIO'}</h2>
          <button 
            className="btn-cerrar" 
            onClick={onCancelar} 
            disabled={guardando}
            aria-label="Cerrar formulario"
          >
            <X size={28} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="formulario-movimiento">
          {/* Header con motivo y botones */}
          <div className="formulario-header-section">
            <div className="motivo-section">
              <label>motivo de Movimiento</label>
              <select
                value={motivomovimiento}
                onChange={(e) => setMotivoMovimiento(e.target.value as MotivoMovimiento)}
                disabled={guardando}
                required
              >
                <option value="COMPRA">COMPRA</option>
                <option value="AJUSTE_MANUAL">AJUSTE_MANUAL</option>
                <option value="MERMA">MERMA</option>
                <option value="CANCELACION">CANCELACION</option>
                <option value="DEVOLUCION">DEVOLUCION</option>
                <option value="INV_INICIAL">INV_INICIAL</option>
                <option value="CONSUMO">CONSUMO</option>
              </select>
              <button type="button" className="btn-add-insumo" onClick={agregarDetalle}>
                + INSUMO
              </button>
              
              {/* Observaciones moved here */}
              <div className="observaciones-inline">
                <label>Observaciones</label>
                <input
                  type="text"
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  placeholder="Observaciones generales del movimiento..."
                  disabled={guardando}
                />
              </div>
            </div>

            <div className="botones-accion">
              <button type="button" className="btn-pendiente" disabled>
                PENDIENTE
              </button>
              <button type="submit" className="btn-procesar" disabled={guardando}>
                {guardando ? 'GUARDANDO...' : 'PROCESAR'}
              </button>
            </div>
          </div>

          {/* Tabla de insumos */}
          <div className="tabla-insumos-container">
            <table className="tabla-insumos">
              <thead>
                <tr>
                  <th>INSUMO</th>
                  <th>CANT.</th>
                  <th>COSTO</th>
                  <th>PROVEEDOR</th>
                  <th>U.M.</th>
                  <th>EXIST.</th>
                  <th>COSTO POND.</th>
                  <th>CANT. ÚLT.</th>
                  <th>PROV. ÚLT.</th>
                  <th>COSTO ÚLT.</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {detalles.map((detalle, index) => {
                  const ultimaCompra = ultimasCompras.get(index);
                  return (
                  <tr key={index}>
                    <td>
                      <select
                        value={detalle.idinsumo}
                        onChange={(e) => actualizarDetalle(index, 'idinsumo', e.target.value)}
                        disabled={guardando || cargandoInsumos}
                        required
                      >
                        <option value={0}>Seleccione...</option>
                        {insumos.map((insumo) => (
                          <option key={insumo.id_insumo} value={insumo.id_insumo}>
                            {insumo.nombre}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        type="number"
                        step="0.001"
                        value={detalle.cantidad}
                        onChange={(e) => actualizarDetalle(index, 'cantidad', Number(e.target.value))}
                        disabled={guardando}
                        required
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        step="0.01"
                        value={detalle.costo || 0}
                        onChange={(e) => actualizarDetalle(index, 'costo', Number(e.target.value))}
                        disabled={guardando}
                      />
                    </td>
                    <td>
                      {/* Note: proveedor stores name directly, consistent with existing insumo.idproveedor field */}
                      <select
                        value={detalle.proveedor || ''}
                        onChange={(e) => actualizarDetalle(index, 'proveedor', e.target.value)}
                        disabled={guardando || cargandoProveedores}
                      >
                        <option value="">Seleccione...</option>
                        {proveedores.map((proveedor) => (
                          <option key={proveedor.id_proveedor} value={proveedor.nombre}>
                            {proveedor.nombre}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input 
                        type="text" 
                        value={ultimaCompra?.unidadMedida || detalle.unidadmedida || ''} 
                        disabled 
                        className="campo-solo-lectura" 
                      />
                    </td>
                    <td>
                      <input 
                        type="text" 
                        value={ultimaCompra?.existencia ?? (detalle as any).stockActual ?? ''} 
                        disabled 
                        className="campo-solo-lectura" 
                      />
                    </td>
                    <td>
                      <input 
                        type="text" 
                        value={ultimaCompra?.costoUltimoPonderado ?? ''} 
                        disabled 
                        className="campo-solo-lectura" 
                      />
                    </td>
                    <td>
                      <input 
                        type="text" 
                        value={ultimaCompra?.cantidadUltimaCompra ?? ''} 
                        disabled 
                        className="campo-solo-lectura" 
                      />
                    </td>
                    <td>
                      <input 
                        type="text" 
                        value={ultimaCompra?.proveedorUltimaCompra || ''} 
                        disabled 
                        className="campo-solo-lectura" 
                      />
                    </td>
                    <td>
                      <input 
                        type="text" 
                        value={ultimaCompra?.costoUltimaCompra ?? ''} 
                        disabled 
                        className="campo-solo-lectura" 
                      />
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn-eliminar-detalle"
                        onClick={() => eliminarDetalle(index)}
                        disabled={guardando}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormularioMovimiento;
