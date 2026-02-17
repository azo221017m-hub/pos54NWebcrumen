import React, { useState, useEffect, useMemo } from 'react';
import { X, Save, Users } from 'lucide-react';
import type { CatModerador, CatModeradorCreate, CatModeradorUpdate } from '../../../types/catModerador.types';
import type { Moderador } from '../../../types/moderador.types';
import { obtenerModeradores } from '../../../services/moderadoresService';
import './FormularioCatModerador.css';

interface Props {
  catModerador: CatModerador | null;
  idnegocio: number;
  onSubmit: (data: CatModeradorCreate | CatModeradorUpdate) => void;
  onCancel: () => void;
}

const FormularioCatModerador: React.FC<Props> = ({ catModerador, idnegocio, onSubmit, onCancel }) => {
  const initialState = useMemo(() => {
    if (catModerador) {
      return {
        nombremodref: catModerador.nombremodref,
        estatus: catModerador.estatus
      };
    }
    return {
      nombremodref: '',
      estatus: 1
    };
  }, [catModerador]);

  const [formData, setFormData] = useState(initialState);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [moderadores, setModeradores] = useState<Moderador[]>([]);
  const [cargandoModeradores, setCargandoModeradores] = useState(true);
  
  // Estado para manejar los moderadores seleccionados (array de IDs)
  const [moderadoresSeleccionados, setModeradoresSeleccionados] = useState<number[]>(() => {
    if (catModerador && catModerador.moderadores) {
      const idsValue = catModerador.moderadores;
      
      if (typeof idsValue === 'string') {
        if (idsValue.includes(',')) {
          return idsValue.split(',').map(id => Number(id.trim())).filter(id => id > 0);
        }
        const numId = Number(idsValue);
        return numId > 0 ? [numId] : [];
      }
      
      return [];
    }
    return [];
  });

  // Cargar moderadores al montar el componente
  useEffect(() => {
    const cargarModeradores = async () => {
      setCargandoModeradores(true);
      try {
        const data = await obtenerModeradores(idnegocio);
        setModeradores(data);
      } catch (error) {
        console.error('Error al cargar moderadores:', error);
        setModeradores([]);
      } finally {
        setCargandoModeradores(false);
      }
    };

    cargarModeradores();
  }, [idnegocio]);

  const validarFormulario = (): boolean => {
    const nuevosErrores: Record<string, string> = {};

    if (!formData.nombremodref.trim()) {
      nuevosErrores.nombremodref = 'El nombre es requerido';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  // Función para manejar el toggle de checkboxes de moderadores
  const handleModeradorToggle = (idModerador: number) => {
    setModeradoresSeleccionados(prev => {
      if (prev.includes(idModerador)) {
        return prev.filter(id => id !== idModerador);
      } else {
        return [...prev, idModerador];
      }
    });
  };

  // Función para seleccionar/deseleccionar todos
  const handleToggleTodos = () => {
    if (moderadoresSeleccionados.length === moderadores.length) {
      setModeradoresSeleccionados([]);
    } else {
      setModeradoresSeleccionados(moderadores.map(m => m.idmoderador));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validarFormulario()) {
      return;
    }

    // Convertir array de IDs a string separado por comas
    const moderadoresString = moderadoresSeleccionados.length > 0 
      ? moderadoresSeleccionados.join(',') 
      : '';

    const dataToSubmit = {
      ...formData,
      moderadores: moderadoresString,
      idnegocio
    };

    if (catModerador) {
      await onSubmit({
        ...dataToSubmit,
        idmodref: catModerador.idmodref
      } as CatModeradorUpdate);
    } else {
      await onSubmit(dataToSubmit as CatModeradorCreate);
    }
  };

  return (
    <div className="cat-moderador-modal-overlay" onClick={onCancel}>
      <div className="cat-moderador-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="cat-moderador-header">
          <div className="cat-moderador-header-content">
            <Users className="cat-moderador-header-icon" />
            <h2>{catModerador ? 'Editar Categoría Moderador' : 'Nueva Categoría Moderador'}</h2>
          </div>
          <button onClick={onCancel} className="cat-moderador-close-button">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="cat-moderador-form">
          <div className="cat-moderador-form-body">
            <div className="cat-moderador-form-grid">
              <div className="cat-moderador-form-group full-width">
                <label className="cat-moderador-label">
                  Nombre de la Categoría *
                </label>
                <input
                  type="text"
                  value={formData.nombremodref}
                  onChange={(e) => setFormData({ ...formData, nombremodref: e.target.value })}
                  className={'cat-moderador-input' + (errores.nombremodref ? ' error' : '')}
                  placeholder="Ej: Moderadores VIP"
                />
                {errores.nombremodref && (
                  <span className="cat-moderador-error-message">{errores.nombremodref}</span>
                )}
              </div>

              <div className="cat-moderador-form-group full-width">
                <label className="cat-moderador-label">
                  Moderadores
                  {moderadoresSeleccionados.length > 0 && (
                    <span className="cat-moderador-selected-count">
                      ({moderadoresSeleccionados.length} seleccionado{moderadoresSeleccionados.length > 1 ? 's' : ''})
                    </span>
                  )}
                </label>
                
                {cargandoModeradores ? (
                  <div className="cat-moderador-loading-moderadores">
                    Cargando moderadores...
                  </div>
                ) : moderadores.length === 0 ? (
                  <div className="cat-moderador-no-moderadores">
                    No hay moderadores disponibles
                  </div>
                ) : (
                  <>
                    <div className="cat-moderador-checklist-header">
                      <button
                        type="button"
                        onClick={handleToggleTodos}
                        className="cat-moderador-toggle-all-btn"
                      >
                        {moderadoresSeleccionados.length === moderadores.length 
                          ? 'Deseleccionar todos' 
                          : 'Seleccionar todos'}
                      </button>
                    </div>
                    
                    <div className="cat-moderador-moderadores-checklist">
                      {moderadores.map((moderador) => (
                        <label 
                          key={moderador.idmoderador} 
                          className="cat-moderador-checklist-item"
                        >
                          <input
                            type="checkbox"
                            checked={moderadoresSeleccionados.includes(moderador.idmoderador)}
                            onChange={() => handleModeradorToggle(moderador.idmoderador)}
                            className="cat-moderador-checkbox"
                          />
                          <span className="cat-moderador-checkbox-label">
                            {moderador.nombremoderador}
                          </span>
                        </label>
                      ))}
                    </div>
                  </>
                )}
                
                <small className="cat-moderador-help-text">
                  Selecciona uno o más moderadores para esta categoría
                </small>
              </div>

              <div className="cat-moderador-form-group">
                <label className="cat-moderador-label">
                  Estado
                </label>
                <select
                  value={formData.estatus}
                  onChange={(e) => setFormData({ ...formData, estatus: Number(e.target.value) })}
                  className="cat-moderador-select"
                >
                  <option value={1}>Activo</option>
                  <option value={0}>Inactivo</option>
                </select>
              </div>
            </div>
          </div>

          <div className="cat-moderador-form-actions">
            <button type="button" onClick={onCancel} className="btn-cancelar">
              <X size={20} />
              Cancelar
            </button>
            <button type="submit" className="btn-guardar">
              <Save size={20} />
              {catModerador ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormularioCatModerador;
