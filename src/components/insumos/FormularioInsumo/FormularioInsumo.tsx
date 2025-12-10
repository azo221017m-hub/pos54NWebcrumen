import React, { useState, useMemo, useEffect } from 'react';
import type { Insumo, InsumoCreate } from '../../../types/insumo.types';
import type { CuentaContable } from '../../../types/cuentaContable.types';
import type { Proveedor } from '../../../types/proveedor.types';
import { obtenerCuentasContables } from '../../../services/cuentasContablesService';
import { obtenerProveedores } from '../../../services/proveedoresService';
import { Save, X, Package } from 'lucide-react';
import './FormularioInsumo.css';

interface Props {
  insumoEditar: Insumo | null;
  onSubmit: (data: InsumoCreate) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
}

const FormularioInsumo: React.FC<Props> = ({ insumoEditar, onSubmit, onCancel, loading }) => {
  const datosIniciales = useMemo(() => {
    if (insumoEditar) {
      return {
        nombre: insumoEditar.nombre,
        unidad_medida: insumoEditar.unidad_medida,
        stock_actual: insumoEditar.stock_actual,
        stock_minimo: insumoEditar.stock_minimo,
        costo_promedio_ponderado: insumoEditar.costo_promedio_ponderado,
        precio_venta: insumoEditar.precio_venta,
        idinocuidad: insumoEditar.idinocuidad || '',
        id_cuentacontable: insumoEditar.id_cuentacontable || '',
        activo: insumoEditar.activo,
        inventariable: insumoEditar.inventariable,
        usuarioauditoria: insumoEditar.usuarioauditoria || '',
        idnegocio: insumoEditar.idnegocio,
        idproveedor: insumoEditar.idproveedor || null
      };
    }
    return {
      nombre: '',
      unidad_medida: 'kilo',
      stock_actual: 0,
      stock_minimo: 0,
      costo_promedio_ponderado: 0,
      precio_venta: 0,
      idinocuidad: '',
      id_cuentacontable: '',
      activo: 1,
      inventariable: 1,
      usuarioauditoria: localStorage.getItem('usuario') 
        ? JSON.parse(localStorage.getItem('usuario')!).alias 
        : '',
      idnegocio: Number(localStorage.getItem('idnegocio')) || 1,
      idproveedor: null
    };
  }, [insumoEditar]);

  const [formData, setFormData] = useState(datosIniciales);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [cuentasContables, setCuentasContables] = useState<CuentaContable[]>([]);
  const [cargandoCuentas, setCargandoCuentas] = useState(false);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [cargandoProveedores, setCargandoProveedores] = useState(false);

  // Cargar cuentas contables al montar el componente
  useEffect(() => {
    const cargarCuentas = async () => {
      setCargandoCuentas(true);
      try {
        const idnegocio = Number(localStorage.getItem('idnegocio')) || 1;
        const cuentas = await obtenerCuentasContables(idnegocio);
        setCuentasContables(cuentas);
      } catch (error) {
        console.error('Error al cargar cuentas contables:', error);
        setCuentasContables([]);
      } finally {
        setCargandoCuentas(false);
      }
    };

    cargarCuentas();
  }, []);

  // Cargar proveedores al montar el componente
  useEffect(() => {
    const cargarProveedores = async () => {
      setCargandoProveedores(true);
      try {
        const provs = await obtenerProveedores();
        setProveedores(provs);
      } catch (error) {
        console.error('Error al cargar proveedores:', error);
        setProveedores([]);
      } finally {
        setCargandoProveedores(false);
      }
    };

    cargarProveedores();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    let valorFinal: string | number | null = value;
    
    if (type === 'number') {
      valorFinal = value === '' ? 0 : parseFloat(value);
    } else if (type === 'checkbox') {
      valorFinal = (e.target as HTMLInputElement).checked ? 1 : 0;
    } else if (name === 'idproveedor') {
      // Handle idproveedor as nullable number
      valorFinal = value === '' ? null : Number(value);
    }

    setFormData(prev => ({
      ...prev,
      [name]: valorFinal
    }));

    // Limpiar error del campo
    if (errores[name]) {
      setErrores(prev => {
        const nuevos = { ...prev };
        delete nuevos[name];
        return nuevos;
      });
    }
  };

  const validarFormulario = (): boolean => {
    const nuevosErrores: Record<string, string> = {};

    if (!formData.nombre.trim()) {
      nuevosErrores.nombre = 'El nombre es requerido';
    }

    if (!formData.unidad_medida.trim()) {
      nuevosErrores.unidad_medida = 'La unidad de medida es requerida';
    }

    if (formData.stock_actual < 0) {
      nuevosErrores.stock_actual = 'El stock actual no puede ser negativo';
    }

    if (formData.stock_minimo < 0) {
      nuevosErrores.stock_minimo = 'El stock mínimo no puede ser negativo';
    }

    if (formData.costo_promedio_ponderado < 0) {
      nuevosErrores.costo_promedio_ponderado = 'El costo no puede ser negativo';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validarFormulario()) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error en formulario:', error);
    }
  };

  return (
    <div className="formulario-insumo-container">
      <div className="formulario-header">
        <div className="header-icon">
          <Package size={28} />
        </div>
        <div>
          <h2>{insumoEditar ? 'Editar Insumo' : 'Nuevo Insumo'}</h2>
          <p>Complete los datos del insumo</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="formulario-insumo">
        <div className="form-scroll-container">
          {/* Información Básica */}
          <div className="form-section">
            <h3 className="section-title">Información Básica</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="nombre">
                  Nombre <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  className={errores.nombre ? 'error' : ''}
                  placeholder="Ej: Harina de trigo"
                  maxLength={100}
                />
                {errores.nombre && <span className="error-message">{errores.nombre}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="unidad_medida">
                  Unidad de Medida <span className="required">*</span>
                </label>
                <select
                  id="unidad_medida"
                  name="unidad_medida"
                  value={formData.unidad_medida}
                  onChange={handleChange}
                  className={errores.unidad_medida ? 'error' : ''}
                >
                  <option value="kilo">kilo</option>
                  <option value="Litro">Litro</option>
                  <option value="Pieza">Pieza</option>
                </select>
                {errores.unidad_medida && <span className="error-message">{errores.unidad_medida}</span>}
              </div>
            </div>
          </div>

          {/* Stock */}
          <div className="form-section">
            <h3 className="section-title">Control de Stock</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="stock_actual">
                  Stock Actual <span className="required">*</span>
                </label>
                <input
                  type="number"
                  id="stock_actual"
                  name="stock_actual"
                  value={formData.stock_actual}
                  onChange={handleChange}
                  className={errores.stock_actual ? 'error' : ''}
                  step="0.01"
                  min="0"
                />
                {errores.stock_actual && <span className="error-message">{errores.stock_actual}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="stock_minimo">
                  Stock Mínimo <span className="required">*</span>
                </label>
                <input
                  type="number"
                  id="stock_minimo"
                  name="stock_minimo"
                  value={formData.stock_minimo}
                  onChange={handleChange}
                  className={errores.stock_minimo ? 'error' : ''}
                  step="0.01"
                  min="0"
                />
                {errores.stock_minimo && <span className="error-message">{errores.stock_minimo}</span>}
              </div>
            </div>
          </div>

          {/* Precios */}
          <div className="form-section">
            <h3 className="section-title">Costos</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="costo_promedio_ponderado">
                  Costo Promedio Ponderado <span className="required">*</span>
                </label>
                <input
                  type="number"
                  id="costo_promedio_ponderado"
                  name="costo_promedio_ponderado"
                  value={formData.costo_promedio_ponderado}
                  onChange={handleChange}
                  className={errores.costo_promedio_ponderado ? 'error' : ''}
                  step="0.0001"
                  min="0"
                  placeholder="0.00"
                />
                {errores.costo_promedio_ponderado && (
                  <span className="error-message">{errores.costo_promedio_ponderado}</span>
                )}
              </div>

            </div>
          </div>

          {/* Información Adicional */}
          <div className="form-section">
            <h3 className="section-title">Información Adicional</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="idinocuidad">Inocuidad</label>
                <input
                  type="text"
                  id="idinocuidad"
                  name="idinocuidad"
                  value={formData.idinocuidad}
                  onChange={handleChange}
                  placeholder="Ej: Refrigerado"
                  maxLength={50}
                />
              </div>

              <div className="form-group">
                <label htmlFor="id_cuentacontable">Cuenta Contable</label>
                <select
                  id="id_cuentacontable"
                  name="id_cuentacontable"
                  value={formData.id_cuentacontable}
                  onChange={handleChange}
                  disabled={cargandoCuentas}
                >
                  <option value="">Seleccione una cuenta</option>
                  {cuentasContables.map(cuenta => (
                    <option key={cuenta.id_cuentacontable} value={cuenta.id_cuentacontable}>
                      {cuenta.nombrecuentacontable}
                    </option>
                  ))}
                </select>
                {cargandoCuentas && <span className="loading-message">Cargando cuentas...</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="idproveedor">Proveedor</label>
                <select
                  id="idproveedor"
                  name="idproveedor"
                  value={formData.idproveedor || ''}
                  onChange={handleChange}
                  disabled={cargandoProveedores}
                >
                  <option value="">Seleccione un proveedor</option>
                  {proveedores.map(proveedor => (
                    <option key={proveedor.id_proveedor} value={proveedor.id_proveedor}>
                      {proveedor.nombre}
                    </option>
                  ))}
                </select>
                {cargandoProveedores && <span className="loading-message">Cargando proveedores...</span>}
              </div>
            </div>
          </div>

          {/* Estados */}
          <div className="form-section">
            <h3 className="section-title">Estado y Propiedades</h3>
            
            <div className="form-row">
              <div className="form-group-checkbox">
                <input
                  type="checkbox"
                  id="activo"
                  name="activo"
                  checked={formData.activo === 1}
                  onChange={handleChange}
                />
                <label htmlFor="activo">Insumo Activo</label>
              </div>

              <div className="form-group-checkbox">
                <input
                  type="checkbox"
                  id="inventariable"
                  name="inventariable"
                  checked={formData.inventariable === 1}
                  onChange={handleChange}
                />
                <label htmlFor="inventariable">Inventariable</label>
              </div>
            </div>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="form-actions">
          <button
            type="button"
            onClick={onCancel}
            className="btn-cancelar"
            disabled={loading}
          >
            <X size={18} />
            Cancelar
          </button>
          <button
            type="submit"
            className="btn-guardar"
            disabled={loading}
          >
            <Save size={18} />
            {loading ? 'Guardando...' : insumoEditar ? 'Actualizar' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormularioInsumo;
