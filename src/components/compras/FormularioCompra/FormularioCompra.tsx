import React, { useState, useMemo, useEffect } from 'react';
import { X, Save, ShoppingCart, Plus, Trash2 } from 'lucide-react';
import type { 
  Compra, 
  CompraCreate, 
  CompraUpdate,
  DetalleCompraCreate,
  TipoDeCompra,
  EstadoDeCompra,
  EstatusDePago
} from '../../../types/compras.types';
import type { CuentaContable } from '../../../types/cuentaContable.types';
import type { Insumo } from '../../../types/insumo.types';
import { obtenerCuentasContables } from '../../../services/cuentasContablesService';
import { obtenerInsumos } from '../../../services/insumosService';
import './FormularioCompra.css';

interface Props {
  compraEditar: Compra | null;
  onSubmit: (data: CompraCreate | CompraUpdate) => void;
  onCancel: () => void;
  loading: boolean;
}

const FormularioCompra: React.FC<Props> = ({ compraEditar, onSubmit, onCancel, loading }) => {
  const [cuentasContables, setCuentasContables] = useState<CuentaContable[]>([]);
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [cargandoDatos, setCargandoDatos] = useState(true);

  const datosIniciales = useMemo(() => {
    if (compraEditar) {
      return {
        tipodecompra: compraEditar.tipodecompra,
        estadodecompra: compraEditar.estadodecompra,
        estatusdepago: compraEditar.estatusdepago,
        fechaprogramadacompra: compraEditar.fechaprogramadacompra 
          ? new Date(compraEditar.fechaprogramadacompra).toISOString().slice(0, 16) 
          : '',
        direcciondeentrega: compraEditar.direcciondeentrega || '',
        contactodeentrega: compraEditar.contactodeentrega || '',
        telefonodeentrega: compraEditar.telefonodeentrega || '',
        referencia: compraEditar.referencia || '',
        detalledescuento: compraEditar.detalledescuento || ''
      };
    }
    return {
      tipodecompra: '' as TipoDeCompra,
      estadodecompra: 'ESPERAR' as EstadoDeCompra,
      estatusdepago: 'PENDIENTE' as EstatusDePago,
      fechaprogramadacompra: '',
      direcciondeentrega: '',
      contactodeentrega: '',
      telefonodeentrega: '',
      referencia: '',
      detalledescuento: ''
    };
  }, [compraEditar]);

  const [formData, setFormData] = useState(datosIniciales);
  const [detalles, setDetalles] = useState<DetalleCompraCreate[]>([]);
  const [errores, setErrores] = useState<Record<string, string>>({});

  // Cargar cuentas contables de tipo COMPRA e insumos
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setCargandoDatos(true);
        
        // Obtener cuentas contables
        const cuentas = await obtenerCuentasContables();
        // Filtrar solo las de naturaleza COMPRA
        const cuentasCompra = cuentas.filter(c => c.naturalezacuentacontable === 'COMPRA');
        setCuentasContables(cuentasCompra);
        
        // Obtener usuario del localStorage para idnegocio
        const usuarioStr = localStorage.getItem('usuario');
        if (usuarioStr) {
          const usuario = JSON.parse(usuarioStr);
          const insumosData = await obtenerInsumos(usuario.idNegocio);
          setInsumos(insumosData);
        }
      } catch (error) {
        console.error('Error al cargar datos:', error);
      } finally {
        setCargandoDatos(false);
      }
    };
    
    cargarDatos();
  }, []);

  // Filtrar insumos según el tipo de compra seleccionado
  const insumosFiltrados = useMemo(() => {
    if (!formData.tipodecompra) return [];
    
    // Buscar la cuenta contable que corresponde al tipo de compra seleccionado
    const cuentaSeleccionada = cuentasContables.find(
      c => c.tipocuentacontable === formData.tipodecompra
    );
    
    if (!cuentaSeleccionada) return [];
    
    // Filtrar insumos que tienen esta cuenta contable
    return insumos.filter(
      i => i.id_cuentacontable === cuentaSeleccionada.id_cuentacontable
    );
  }, [formData.tipodecompra, cuentasContables, insumos]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errores[name]) {
      setErrores(prev => {
        const nuevos = { ...prev };
        delete nuevos[name];
        return nuevos;
      });
    }
  };

  const agregarDetalle = () => {
    setDetalles(prev => [...prev, {
      idproducto: 0,
      nombreproducto: '',
      cantidad: 1,
      preciounitario: 0,
      costounitario: 0,
      observaciones: ''
    }]);
  };

  const actualizarDetalle = (index: number, campo: string, valor: any) => {
    setDetalles(prev => {
      const nuevos = [...prev];
      nuevos[index] = { ...nuevos[index], [campo]: valor };
      return nuevos;
    });
  };

  const eliminarDetalle = (index: number) => {
    setDetalles(prev => prev.filter((_, i) => i !== index));
  };

  const validarFormulario = (): boolean => {
    const nuevosErrores: Record<string, string> = {};

    // Si es una nueva compra, validar que tenga detalles
    if (!compraEditar && detalles.length === 0) {
      nuevosErrores.detalles = 'Debe agregar al menos un artículo';
    }

    // Validar que los detalles tengan datos mínimos
    if (detalles.length > 0) {
      let hayErrorDetalle = false;
      detalles.forEach((detalle, index) => {
        if (!detalle.nombreproducto.trim()) {
          nuevosErrores[`detalle_${index}_nombre`] = 'El nombre del artículo es requerido';
          hayErrorDetalle = true;
        }
        if (detalle.cantidad <= 0) {
          nuevosErrores[`detalle_${index}_cantidad`] = 'La cantidad debe ser mayor a 0';
          hayErrorDetalle = true;
        }
        if (detalle.preciounitario < 0) {
          nuevosErrores[`detalle_${index}_precio`] = 'El precio no puede ser negativo';
          hayErrorDetalle = true;
        }
      });
      if (hayErrorDetalle) {
        nuevosErrores.detalles = 'Hay errores en los detalles de la compra';
      }
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validarFormulario()) {
      return;
    }

    if (compraEditar) {
      // Para actualizar solo enviamos los cambios de la compra principal
      onSubmit({
        ...formData,
        fechaprogramadacompra: formData.fechaprogramadacompra || null
      } as CompraUpdate);
    } else {
      // Para crear incluimos los detalles
      onSubmit({
        ...formData,
        fechaprogramadacompra: formData.fechaprogramadacompra || null,
        detalles
      } as CompraCreate);
    }
  };

  return (
    <div className="formulario-compra-overlay" onClick={onCancel}>
      <div className="formulario-compra-modal" onClick={(e) => e.stopPropagation()}>
        <div className="formulario-compra-header">
          <div className="formulario-header-content">
            <ShoppingCart className="formulario-header-icon" />
            <h2>{compraEditar ? 'Editar Compra' : 'Nueva Compra'}</h2>
          </div>
          <button onClick={onCancel} className="formulario-close-button" type="button">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="formulario-compra-form">
          <div className="formulario-compra-body">
            {/* Información General */}
            <div className="form-section">
              <h3 className="section-title">Información General</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Tipo de Compra</label>
                  <select
                    name="tipodecompra"
                    value={formData.tipodecompra}
                    onChange={handleChange}
                    className="form-input"
                    disabled={cargandoDatos}
                  >
                    <option value="">Seleccione un tipo</option>
                    {cuentasContables.map(cuenta => (
                      <option key={cuenta.id_cuentacontable} value={cuenta.tipocuentacontable}>
                        {cuenta.tipocuentacontable}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Estado de Compra</label>
                  <select
                    name="estadodecompra"
                    value={formData.estadodecompra}
                    onChange={handleChange}
                    className="form-input"
                  >
                    <option value="ESPERAR">Esperar</option>
                    <option value="RECIBIDA">Recibida</option>
                    <option value="GENERADA">Generada</option>
                    <option value="CANCELADA">Cancelada</option>
                    <option value="DEVUELTA">Devuelta</option>
                    <option value="ELIMINADA">Eliminada</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Estatus de Pago</label>
                  <select
                    name="estatusdepago"
                    value={formData.estatusdepago}
                    onChange={handleChange}
                    className="form-input"
                  >
                    <option value="PENDIENTE">Pendiente</option>
                    <option value="PAGADO">Pagado</option>
                    <option value="ESPERAR">Esperar</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Fecha Programada</label>
                  <input
                    type="datetime-local"
                    name="fechaprogramadacompra"
                    value={formData.fechaprogramadacompra}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Referencia</label>
                  <input
                    type="text"
                    name="referencia"
                    value={formData.referencia}
                    onChange={handleChange}
                    placeholder="Ej: REF-123"
                    className="form-input"
                    maxLength={45}
                  />
                </div>
              </div>
            </div>

            {/* Detalles de Compra - Solo para nuevas compras */}
            {!compraEditar && (
              <div className="form-section">
                <div className="section-header">
                  <h3 className="section-title">Artículos</h3>
                  <button
                    type="button"
                    onClick={agregarDetalle}
                    className="btn-add-detalle"
                  >
                    <Plus size={16} />
                    Agregar Artículo
                  </button>
                </div>

                {errores.detalles && (
                  <span className="error-message">{errores.detalles}</span>
                )}

                {detalles.map((detalle, index) => (
                  <div key={index} className="detalle-item">
                    <div className="detalle-header">
                      <span className="detalle-numero">Artículo #{index + 1}</span>
                      <button
                        type="button"
                        onClick={() => eliminarDetalle(index)}
                        className="btn-delete-detalle"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="detalle-fields">
                      <div className="form-group">
                        <label className="form-label">Nombre de Artículo</label>
                        <select
                          value={detalle.nombreproducto}
                          onChange={(e) => {
                            const insumoSeleccionado = insumosFiltrados.find(
                              i => i.nombre === e.target.value
                            );
                            actualizarDetalle(index, 'nombreproducto', e.target.value);
                            if (insumoSeleccionado) {
                              actualizarDetalle(index, 'idproducto', insumoSeleccionado.id_insumo);
                              actualizarDetalle(index, 'preciounitario', insumoSeleccionado.precio_venta);
                              actualizarDetalle(index, 'costounitario', insumoSeleccionado.costo_promedio_ponderado);
                            }
                          }}
                          className={`form-input ${errores[`detalle_${index}_nombre`] ? 'error' : ''}`}
                          disabled={!formData.tipodecompra || cargandoDatos}
                        >
                          <option value="">Seleccione un artículo</option>
                          {insumosFiltrados.map(insumo => (
                            <option key={insumo.id_insumo} value={insumo.nombre}>
                              {insumo.nombre}
                            </option>
                          ))}
                        </select>
                        {errores[`detalle_${index}_nombre`] && (
                          <span className="error-message">{errores[`detalle_${index}_nombre`]}</span>
                        )}
                        {!formData.tipodecompra && (
                          <span className="info-message">Seleccione primero un tipo de compra</span>
                        )}
                      </div>

                      <div className="form-group">
                        <label className="form-label">Cantidad</label>
                        <input
                          type="number"
                          value={detalle.cantidad}
                          onChange={(e) => actualizarDetalle(index, 'cantidad', parseFloat(e.target.value) || 0)}
                          min="0"
                          step="0.01"
                          className={`form-input ${errores[`detalle_${index}_cantidad`] ? 'error' : ''}`}
                        />
                        {errores[`detalle_${index}_cantidad`] && (
                          <span className="error-message">{errores[`detalle_${index}_cantidad`]}</span>
                        )}
                      </div>

                      <div className="form-group">
                        <label className="form-label">Precio Unitario</label>
                        <input
                          type="number"
                          value={detalle.preciounitario}
                          onChange={(e) => actualizarDetalle(index, 'preciounitario', parseFloat(e.target.value) || 0)}
                          min="0"
                          step="0.01"
                          className={`form-input ${errores[`detalle_${index}_precio`] ? 'error' : ''}`}
                        />
                        {errores[`detalle_${index}_precio`] && (
                          <span className="error-message">{errores[`detalle_${index}_precio`]}</span>
                        )}
                      </div>

                      <div className="form-group">
                        <label className="form-label">Costo Unitario</label>
                        <input
                          type="number"
                          value={detalle.costounitario}
                          onChange={(e) => actualizarDetalle(index, 'costounitario', parseFloat(e.target.value) || 0)}
                          min="0"
                          step="0.01"
                          className="form-input"
                        />
                      </div>

                      <div className="form-group full-width">
                        <label className="form-label">Observaciones</label>
                        <input
                          type="text"
                          value={detalle.observaciones || ''}
                          onChange={(e) => actualizarDetalle(index, 'observaciones', e.target.value)}
                          placeholder="Observaciones opcionales"
                          className="form-input"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Descuento */}
            <div className="form-section">
              <div className="form-group full-width">
                <label className="form-label">Detalle de Descuento</label>
                <textarea
                  name="detalledescuento"
                  value={formData.detalledescuento}
                  onChange={handleChange}
                  placeholder="Descripción del descuento aplicado"
                  className="form-input"
                  rows={2}
                  maxLength={100}
                />
              </div>
            </div>
          </div>

          <div className="formulario-compra-footer">
            <button 
              type="button" 
              onClick={onCancel} 
              className="btn-cancelar"
              disabled={loading}
            >
              <X size={16} />
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn-guardar"
              disabled={loading}
            >
              <Save size={16} />
              {loading ? 'Guardando...' : (compraEditar ? 'Actualizar' : 'Guardar')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormularioCompra;
