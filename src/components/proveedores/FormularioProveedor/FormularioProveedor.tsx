import React, { useState, useMemo } from 'react';
import { X, Save, Truck } from 'lucide-react';
import type { Proveedor, ProveedorCreate, ProveedorUpdate } from '../../../types/proveedor.types';
import './FormularioProveedor.css';

interface Props {
  proveedorEditar: Proveedor | null;
  idnegocio: number;
  onSubmit: (data: ProveedorCreate | ProveedorUpdate) => void;
  onCancel: () => void;
  loading: boolean;
}

const FormularioProveedor: React.FC<Props> = ({ proveedorEditar, idnegocio, onSubmit, onCancel, loading }) => {
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
      idnegocio
    };
  }, [proveedorEditar, idnegocio]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validarFormulario()) {
      return;
    }

    if (proveedorEditar) {
      onSubmit({
        ...formData,
        id_proveedor: proveedorEditar.id_proveedor
      } as ProveedorUpdate);
    } else {
      onSubmit(formData as ProveedorCreate);
    }
  };

  return (
    <div className="formulario-proveedor-overlay" onClick={onCancel}>
      <div className="formulario-proveedor-modal" onClick={(e) => e.stopPropagation()}>
        <div className="formulario-proveedor-header">
          <div className="formulario-header-content">
            <Truck className="formulario-header-icon" />
            <h2>{proveedorEditar ? 'Editar Proveedor' : 'Nuevo Proveedor'}</h2>
          </div>
          <button onClick={onCancel} className="formulario-close-button" type="button">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="formulario-proveedor-form">
          <div className="formulario-proveedor-body">
            {/* Información Básica */}
            <div className="form-section">
              <h3 className="section-title">Información Básica</h3>
              
              {/* Nombre del Proveedor */}
              <div className="form-group full-width">
                <label className="form-label">
                  Nombre del Proveedor <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  placeholder="Ej: Distribuidora ABC S.A. de C.V."
                  className={`form-input ${errores.nombre ? 'error' : ''}`}
                  maxLength={150}
                />
                {errores.nombre && <span className="error-message">{errores.nombre}</span>}
              </div>

              {/* RFC */}
              <div className="form-group">
                <label className="form-label">RFC</label>
                <input
                  type="text"
                  name="rfc"
                  value={formData.rfc}
                  onChange={handleChange}
                  placeholder="Ej: ABC123456789"
                  className={`form-input ${errores.rfc ? 'error' : ''}`}
                  maxLength={20}
                />
                {errores.rfc && <span className="error-message">{errores.rfc}</span>}
              </div>
            </div>

            {/* Información de Contacto */}
            <div className="form-section">
              <h3 className="section-title">Información de Contacto</h3>
              
              {/* Teléfono */}
              <div className="form-group">
                <label className="form-label">Teléfono</label>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  placeholder="Ej: 5512345678"
                  className="form-input"
                  maxLength={30}
                />
              </div>

              {/* Correo Electrónico */}
              <div className="form-group">
                <label className="form-label">Correo Electrónico</label>
                <input
                  type="email"
                  name="correo"
                  value={formData.correo}
                  onChange={handleChange}
                  placeholder="proveedor@ejemplo.com"
                  className={`form-input ${errores.correo ? 'error' : ''}`}
                  maxLength={100}
                />
                {errores.correo && <span className="error-message">{errores.correo}</span>}
              </div>

              {/* Dirección */}
              <div className="form-group full-width">
                <label className="form-label">Dirección</label>
                <textarea
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleChange}
                  placeholder="Dirección completa del proveedor"
                  className="form-textarea"
                  rows={3}
                />
              </div>
            </div>

            {/* Datos Bancarios */}
            <div className="form-section">
              <h3 className="section-title">Datos Bancarios</h3>
              
              {/* Banco */}
              <div className="form-group">
                <label className="form-label">Banco</label>
                <input
                  type="text"
                  name="banco"
                  value={formData.banco}
                  onChange={handleChange}
                  placeholder="Ej: BBVA, Santander, Banorte"
                  className="form-input"
                  maxLength={100}
                />
              </div>

              {/* Número de Cuenta */}
              <div className="form-group">
                <label className="form-label">Número de Cuenta</label>
                <input
                  type="text"
                  name="cuenta"
                  value={formData.cuenta}
                  onChange={handleChange}
                  placeholder="Ej: 1234567890"
                  className="form-input"
                  maxLength={50}
                />
              </div>
            </div>

            {/* Estatus */}
            <div className="form-group">
              <label className="form-label">Estatus</label>
              <div className="toggle-switch-container">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={formData.activo === 1}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      activo: e.target.checked ? 1 : 0 
                    }))}
                  />
                  <span className="toggle-slider"></span>
                </label>
                <span className="toggle-label">
                  {formData.activo === 1 ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>
          </div>

          <div className="formulario-proveedor-actions">
            <button type="button" onClick={onCancel} className="btn-cancelar" disabled={loading}>
              <X size={20} />
              Cancelar
            </button>
            <button type="submit" className="btn-guardar" disabled={loading}>
              <Save size={20} />
              {loading ? 'Guardando...' : proveedorEditar ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormularioProveedor;
