import { useState, useEffect } from 'react';
import type { Rol } from '../../../types/rol.types';
import BarraPrivilegios from '../BarraPrivilegios/BarraPrivilegios';
import './FormularioRol.css';
import { Shield, FileText, Check, X } from 'lucide-react';

interface FormularioRolProps {
  rolEditar?: Rol | null;
  rolesExistentes?: Rol[]; // Para validar nombres duplicados
  onSubmit: (data: Rol) => Promise<void>;
  onCancel: () => void;
}

export const FormularioRol = ({ rolEditar, rolesExistentes = [], onSubmit, onCancel }: FormularioRolProps) => {
  const [loading, setLoading] = useState(false);
  const [nivelPrivilegio, setNivelPrivilegio] = useState<number>(1);
  const [errorNombre, setErrorNombre] = useState<string>('');
  
  const [formData, setFormData] = useState<Rol>({
    nombreRol: '',
    descripcion: '',
    privilegio: '1',
    estatus: 1,
  });

  useEffect(() => {
    if (rolEditar) {
      setFormData(rolEditar);
      // Parsear el nivel de privilegio desde el string
      const nivel = parseInt(rolEditar.privilegio) || 1;
      setNivelPrivilegio(nivel);
    }
  }, [rolEditar]);

  const validarNombreUnico = (nombre: string): boolean => {
    const nombreNormalizado = nombre.trim().toLowerCase();
    const nombreDuplicado = rolesExistentes.some(
      rol => rol.nombreRol.trim().toLowerCase() === nombreNormalizado && 
             rol.idRol !== rolEditar?.idRol
    );
    
    if (nombreDuplicado) {
      setErrorNombre('Ya existe un rol con este nombre');
      return false;
    }
    
    setErrorNombre('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar nombre único
    if (!validarNombreUnico(formData.nombreRol)) {
      return;
    }
    
    setLoading(true);
    try {
      // Guardar el nivel de privilegio como string
      const dataToSubmit = {
        ...formData,
        privilegio: nivelPrivilegio.toString()
      };
      await onSubmit(dataToSubmit);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof Rol, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    
    // Validar nombre en tiempo real
    if (field === 'nombreRol' && typeof value === 'string') {
      validarNombreUnico(value);
    }
  };

  return (
    <div className="formulario-rol-overlay" onClick={onCancel}>
      <div className="formulario-rol-modal" onClick={(e) => e.stopPropagation()}>
        <div className="formulario-rol-container">
      <div className="formulario-header">
        <h2>{rolEditar ? 'Editar Rol' : 'Nuevo Rol'}</h2>
        <p>Complete la información del rol de usuario</p>
      </div>

      <form onSubmit={handleSubmit} className="formulario-rol">
        {/* Sección: Información General */}
        <div className="form-section">
          <div className="section-header">
            <Shield size={24} />
            <h3>Información General</h3>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="nombreRol">Nombre del Rol *</label>
              <input
                id="nombreRol"
                type="text"
                value={formData.nombreRol}
                onChange={(e) => handleChange('nombreRol', e.target.value)}
                required
                placeholder="Ej: Administrador, Cajero, Mesero"
                maxLength={100}
                className={errorNombre ? 'input-error' : ''}
              />
              {errorNombre && (
                <span className="error-message">{errorNombre}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="estatus">Estatus *</label>
              <select
                id="estatus"
                value={formData.estatus}
                onChange={(e) => handleChange('estatus', parseInt(e.target.value))}
                required
              >
                <option value={1}>Activo</option>
                <option value={0}>Inactivo</option>
              </select>
            </div>
          </div>

          <div className="form-group full-width">
            <label htmlFor="descripcion">Descripción *</label>
            <textarea
              id="descripcion"
              value={formData.descripcion}
              onChange={(e) => handleChange('descripcion', e.target.value)}
              required
              placeholder="Describe las responsabilidades y alcance del rol"
              rows={3}
            />
          </div>
        </div>

        {/* Sección: Nivel de Privilegio */}
        <div className="form-section">
          <div className="section-header">
            <FileText size={24} />
            <h3>Nivel de Privilegio</h3>
          </div>

          <BarraPrivilegios
            valor={nivelPrivilegio}
            onChange={setNivelPrivilegio}
            disabled={loading}
          />
          
          <small className="form-hint">
            Selecciona el nivel de privilegio del rol (1 = Básico, 5 = Total)
          </small>
        </div>

        {/* Botones de Acción */}
        <div className="form-actions">
          <button
            type="button"
            className="btn-cancelar"
            onClick={onCancel}
            disabled={loading}
          >
            <X size={20} />
            Cancelar
          </button>
          <button
            type="submit"
            className="btn-guardar"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner-small"></div>
                Guardando...
              </>
            ) : (
              <>
                <Check size={20} />
                {rolEditar ? 'Actualizar' : 'Crear'} Rol
              </>
            )}
          </button>
        </div>
        </form>
      </div>
      </div>
    </div>
  );
};
