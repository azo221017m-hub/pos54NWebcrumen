import React, { useState, useMemo } from 'react';
import type { Proveedor, ProveedorCreate } from '../../../types/proveedor.types';
import { Save, X, Truck } from 'lucide-react';
import './FormularioProveedor.css';

interface Props {
  proveedorEditar: Proveedor | null;
  onSubmit: (data: ProveedorCreate) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
}

const FormularioProveedor: React.FC<Props> = ({ proveedorEditar, onSubmit, onCancel, loading }) => {
  const datosIniciales = useMemo(() => {
    if (proveedorEditar) {
      return {
        nombre: proveedorEditar.nombre,
        rfc: proveedorEditar.rfc || '',
        telefono: proveedorEditar.telefono || '',
        correo: proveedorEditar.correo || '',
        direccion: proveedorEditar.direccion || '',
        banco: proveedorEditar.banco || '',
        cuenta: proveedorEditar.cuenta || '',
        activo: proveedorEditar.activo,
        usuarioauditoria: proveedorEditar.usuarioauditoria || '',
        idnegocio: proveedorEditar.idnegocio
      };
    }
    return {
      nombre: '',
      rfc: '',
      telefono: '',
      correo: '',
      direccion: '',
      banco: '',
      cuenta: '',
      activo: 1,
      usuarioauditoria: localStorage.getItem('usuario') 
        ? JSON.parse(localStorage.getItem('usuario')!).alias 
        : '',
      idnegocio: Number(localStorage.getItem('idnegocio')) || 1
    };
  }, [proveedorEditar]);

  const [formData, setFormData] = useState(datosIniciales);
  const [errores, setErrores] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    let valorFinal: string | number = value;
    
    if (type === 'number') {
      valorFinal = value === '' ? 0 : parseFloat(value);
    }

    setFormData(prev => ({
      ...prev,
      [name]: valorFinal
    }));

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

    if (formData.correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo)) {
      nuevosErrores.correo = 'Correo electrónico inválido';
    }

    if (formData.rfc && formData.rfc.length > 0 && (formData.rfc.length < 12 || formData.rfc.length > 13)) {
      nuevosErrores.rfc = 'El RFC debe tener 12 o 13 caracteres';
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
    <div className="formulario-proveedor-container">
      <div className="formulario-header">
        <div className="header-icon">
          <Truck size={28} />
        </div>
        <div>
          <h2>{proveedorEditar ? 'Editar Proveedor' : 'Nuevo Proveedor'}</h2>
          <p>Complete los datos del proveedor</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="formulario-proveedor">
        <div className="form-scroll-container">
          {/* Información Básica */}
          <div className="form-section">
            <h3 className="section-title">Información Básica</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="nombre">
                  Nombre del Proveedor <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  className={errores.nombre ? 'error' : ''}
                  placeholder="Ej: Distribuidora ABC S.A. de C.V."
                  maxLength={150}
                />
                {errores.nombre && <span className="error-message">{errores.nombre}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="rfc">RFC</label>
                <input
                  type="text"
                  id="rfc"
                  name="rfc"
                  value={formData.rfc}
                  onChange={handleChange}
                  className={errores.rfc ? 'error' : ''}
                  placeholder="Ej: ABC123456789"
                  maxLength={20}
                />
                {errores.rfc && <span className="error-message">{errores.rfc}</span>}
              </div>
            </div>
          </div>

          {/* Contacto */}
          <div className="form-section">
            <h3 className="section-title">Información de Contacto</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="telefono">Teléfono</label>
                <input
                  type="tel"
                  id="telefono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  placeholder="Ej: 5512345678"
                  maxLength={30}
                />
              </div>

              <div className="form-group">
                <label htmlFor="correo">Correo Electrónico</label>
                <input
                  type="email"
                  id="correo"
                  name="correo"
                  value={formData.correo}
                  onChange={handleChange}
                  className={errores.correo ? 'error' : ''}
                  placeholder="proveedor@ejemplo.com"
                  maxLength={100}
                />
                {errores.correo && <span className="error-message">{errores.correo}</span>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="direccion">Dirección</label>
              <textarea
                id="direccion"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                placeholder="Dirección completa del proveedor"
                rows={2}
              />
            </div>
          </div>

          {/* Datos Bancarios */}
          <div className="form-section">
            <h3 className="section-title">Datos Bancarios</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="banco">Banco</label>
                <input
                  type="text"
                  id="banco"
                  name="banco"
                  value={formData.banco}
                  onChange={handleChange}
                  placeholder="Ej: BBVA, Santander, Banorte"
                  maxLength={100}
                />
              </div>

              <div className="form-group">
                <label htmlFor="cuenta">Número de Cuenta</label>
                <input
                  type="text"
                  id="cuenta"
                  name="cuenta"
                  value={formData.cuenta}
                  onChange={handleChange}
                  placeholder="Ej: 1234567890"
                  maxLength={50}
                />
              </div>
            </div>
          </div>

          {/* Estado */}
          <div className="form-section">
            <h3 className="section-title">Estado</h3>
            
            <div className="form-group-checkbox">
              <input
                type="checkbox"
                id="activo"
                name="activo"
                checked={formData.activo === 1}
                onChange={(e) => setFormData(prev => ({ ...prev, activo: e.target.checked ? 1 : 0 }))}
              />
              <label htmlFor="activo">Proveedor Activo</label>
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
            {loading ? 'Guardando...' : proveedorEditar ? 'Actualizar' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormularioProveedor;
