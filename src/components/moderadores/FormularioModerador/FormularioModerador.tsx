import React, { useState, useMemo } from 'react';
import type { Moderador, ModeradorCreate } from '../../../types/moderador.types';
import { X, Save } from 'lucide-react';
import './FormularioModerador.css';

interface Props {
  moderador: Moderador | null;
  idnegocio: number;
  onSave: (moderador: ModeradorCreate) => void;
  onCancel: () => void;
}

const FormularioModerador: React.FC<Props> = ({ moderador, idnegocio, onSave, onCancel }) => {
  const initialState = useMemo(() => {
    if (moderador) {
      return {
        nombremoderador: moderador.nombremoderador,
        estatus: moderador.estatus
      };
    }
    return {
      nombremoderador: '',
      estatus: 1
    };
  }, [moderador]);

  const [formData, setFormData] = useState(initialState);
  const [errores, setErrores] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'estatus' ? parseInt(value) : value
    }));
    // Limpiar error del campo
    if (errores[name]) {
      setErrores(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validarFormulario = (): boolean => {
    const nuevosErrores: Record<string, string> = {};

    if (!formData.nombremoderador.trim()) {
      nuevosErrores.nombremoderador = 'El nombre del moderador es obligatorio';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      return;
    }

    const usuarioData = localStorage.getItem('usuario');
    let usuario = 'Admin';
    try {
      if (usuarioData) {
        usuario = JSON.parse(usuarioData).alias || 'Admin';
      }
    } catch (error) {
      console.error('Error parsing usuario from localStorage:', error);
      usuario = 'Admin';
    }

    const moderadorData: ModeradorCreate = {
      ...formData,
      usuarioauditoria: usuario,
      idnegocio
    };

    onSave(moderadorData);
  };

  return (
    <div className="formulario-moderador-overlay">
      <div className="formulario-moderador-container">
        <div className="formulario-header">
          <h2>{moderador ? 'Editar Moderador' : 'Nuevo Moderador'}</h2>
          <button className="btn-cerrar" onClick={onCancel}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="formulario-moderador">
          <div className="scroll-container">
            {/* Nombre del Moderador */}
            <div className="form-group">
              <label htmlFor="nombremoderador">
                Opción de Modificación <span className="required">*</span>
              </label>
              <input
                type="text"
                id="nombremoderador"
                name="nombremoderador"
                value={formData.nombremoderador}
                onChange={handleChange}
                className={`form-control ${errores.nombremoderador ? 'error' : ''}`}
                placeholder="Ej: Sin picante, Extra queso, Sin cebolla"
                maxLength={150}
                required
              />
              {errores.nombremoderador && (
                <span className="error-message">{errores.nombremoderador}</span>
              )}
              <small className="form-help-text" style={{ display: 'block', marginTop: '0.5rem', color: '#666', fontSize: '0.875rem' }}>
                Los moderadores son opciones de modificación para productos (ej: ingredientes, preparación)
              </small>
            </div>

            {/* Estatus */}
            <div className="form-group">
              <label htmlFor="estatus">
                Estatus <span className="required">*</span>
              </label>
              <select
                id="estatus"
                name="estatus"
                value={formData.estatus}
                onChange={handleChange}
                className="form-control"
                required
              >
                <option value={1}>Activo</option>
                <option value={0}>Inactivo</option>
              </select>
            </div>
          </div>

          <div className="formulario-footer">
            <button type="button" className="btn btn-cancelar" onClick={onCancel}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-guardar">
              <Save size={18} />
              {moderador ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormularioModerador;
