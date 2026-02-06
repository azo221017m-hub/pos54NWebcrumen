import React, { useState, useMemo } from 'react';
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
import './FormularioCompra.css';

interface Props {
  compraEditar: Compra | null;
  onSubmit: (data: CompraCreate | CompraUpdate) => void;
  onCancel: () => void;
  loading: boolean;
}

const FormularioCompra: React.FC<Props> = ({ compraEditar, onSubmit, onCancel, loading }) => {
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
      tipodecompra: 'DOMICILIO' as TipoDeCompra,
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
      nuevosErrores.detalles = 'Debe agregar al menos un producto';
    }

    // Validar que los detalles tengan datos mínimos
    if (detalles.length > 0) {
      let hayErrorDetalle = false;
      detalles.forEach((detalle, index) => {
        if (!detalle.nombreproducto.trim()) {
          nuevosErrores[`detalle_${index}_nombre`] = 'El nombre del producto es requerido';
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
                  >
                    <option value="DOMICILIO">Domicilio</option>
                    <option value="LLEVAR">Llevar</option>
                    <option value="MESA">Mesa</option>
                    <option value="ONLINE">Online</option>
                    <option value="MOVIMIENTO">Movimiento</option>
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

            {/* Información de Entrega */}
            <div className="form-section">
              <h3 className="section-title">Información de Entrega</h3>
              
              <div className="form-row">
                <div className="form-group full-width">
                  <label className="form-label">Dirección de Entrega</label>
                  <textarea
                    name="direcciondeentrega"
                    value={formData.direcciondeentrega}
                    onChange={handleChange}
                    placeholder="Dirección completa"
                    className="form-input"
                    rows={2}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Contacto</label>
                  <input
                    type="text"
                    name="contactodeentrega"
                    value={formData.contactodeentrega}
                    onChange={handleChange}
                    placeholder="Nombre del contacto"
                    className="form-input"
                    maxLength={150}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Teléfono</label>
                  <input
                    type="tel"
                    name="telefonodeentrega"
                    value={formData.telefonodeentrega}
                    onChange={handleChange}
                    placeholder="Teléfono de contacto"
                    className="form-input"
                    maxLength={20}
                  />
                </div>
              </div>
            </div>

            {/* Detalles de Compra - Solo para nuevas compras */}
            {!compraEditar && (
              <div className="form-section">
                <div className="section-header">
                  <h3 className="section-title">Productos</h3>
                  <button
                    type="button"
                    onClick={agregarDetalle}
                    className="btn-add-detalle"
                  >
                    <Plus size={16} />
                    Agregar Producto
                  </button>
                </div>

                {errores.detalles && (
                  <span className="error-message">{errores.detalles}</span>
                )}

                {detalles.map((detalle, index) => (
                  <div key={index} className="detalle-item">
                    <div className="detalle-header">
                      <span className="detalle-numero">Producto #{index + 1}</span>
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
                        <label className="form-label">Nombre del Producto</label>
                        <input
                          type="text"
                          value={detalle.nombreproducto}
                          onChange={(e) => actualizarDetalle(index, 'nombreproducto', e.target.value)}
                          placeholder="Nombre del producto"
                          className={`form-input ${errores[`detalle_${index}_nombre`] ? 'error' : ''}`}
                        />
                        {errores[`detalle_${index}_nombre`] && (
                          <span className="error-message">{errores[`detalle_${index}_nombre`]}</span>
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
