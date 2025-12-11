import React, { useState, useMemo, useEffect } from 'react';
import { Save, X, Tag } from 'lucide-react';
import type { Categoria, CategoriaCreate, CategoriaUpdate } from '../../../types/categoria.types';
import type { ModeradorRef } from '../../../types/moderadorRef.types';
import { obtenerModeradoresRef } from '../../../services/moderadoresRefService';
import './FormularioCategoria.css';

interface Props {
  categoria: Categoria | null;
  idnegocio: number;
  onSubmit: (data: CategoriaCreate | CategoriaUpdate) => void;
  onCancel: () => void;
}

const FormularioCategoria: React.FC<Props> = ({ categoria, idnegocio, onSubmit, onCancel }) => {
  const initialState = useMemo(() => {
    if (categoria) {
      return {
        nombre: categoria.nombre,
        imagencategoria: categoria.imagencategoria || '',
        descripcion: categoria.descripcion || '',
        estatus: categoria.estatus,
        idmoderadordef: categoria.idmoderadordef || 0,
        orden: categoria.orden || 0
      };
    }
    return {
      nombre: '',
      imagencategoria: '',
      descripcion: '',
      estatus: 1,
      idmoderadordef: 0,
      orden: 0
    };
  }, [categoria]);

  const [formData, setFormData] = useState(initialState);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [moderadores, setModeradores] = useState<ModeradorRef[]>([]);
  const [cargandoModeradores, setCargandoModeradores] = useState(true);
  
  // Estado para manejar los moderadores seleccionados (array de IDs)
  const [moderadoresSeleccionados, setModeradoresSeleccionados] = useState<number[]>(() => {
    if (categoria && categoria.idmoderadordef) {
      // Si idmoderadordef contiene IDs separados por comas, convertir a array
      const idsValue = categoria.idmoderadordef;
      
      if (typeof idsValue === 'string') {
        if (idsValue.includes(',')) {
          return idsValue.split(',').map(id => Number(id.trim())).filter(id => id > 0);
        }
        const numId = Number(idsValue);
        return numId > 0 ? [numId] : [];
      }
      
      // Si es un número
      return idsValue > 0 ? [idsValue] : [];
    }
    return [];
  });

  // Cargar moderadores de referencia al montar el componente
  useEffect(() => {
    const cargarModeradores = async () => {
      setCargandoModeradores(true);
      try {
        const data = await obtenerModeradoresRef(idnegocio);
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

    if (!formData.nombre.trim()) {
      nuevosErrores.nombre = 'El nombre es requerido';
    }

    if (formData.orden < 0) {
      nuevosErrores.orden = 'El orden debe ser mayor o igual a 0';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  // Función para manejar el toggle de checkboxes de moderadores
  const handleModeradorToggle = (idModerador: number) => {
    setModeradoresSeleccionados(prev => {
      if (prev.includes(idModerador)) {
        // Si ya está seleccionado, lo quitamos
        return prev.filter(id => id !== idModerador);
      } else {
        // Si no está seleccionado, lo agregamos
        return [...prev, idModerador];
      }
    });
  };

  // Función para seleccionar/deseleccionar todos
  const handleToggleTodos = () => {
    if (moderadoresSeleccionados.length === moderadores.length) {
      // Si todos están seleccionados, deseleccionar todos
      setModeradoresSeleccionados([]);
    } else {
      // Seleccionar todos
      setModeradoresSeleccionados(moderadores.map(m => m.idmoderadorref));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validarFormulario()) {
      return;
    }

    // Convertir array de IDs a string separado por comas
    const moderadoresString = moderadoresSeleccionados.length > 0 
      ? moderadoresSeleccionados.join(',') 
      : '0';

    const dataToSubmit = {
      ...formData,
      idmoderadordef: moderadoresString // Será string "1,2,3" o "0"
    };

    if (categoria) {
      onSubmit({
        ...dataToSubmit,
        idCategoria: categoria.idCategoria
      } as CategoriaUpdate);
    } else {
      onSubmit(dataToSubmit as CategoriaCreate);
    }
  };

  return (
    <div className="categoria-modal-overlay" onClick={onCancel}>
      <div className="categoria-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="categoria-header">
          <div className="categoria-header-content">
            <Tag className="categoria-header-icon" />
            <h2>{categoria ? 'Editar Categoría' : 'Nueva Categoría'}</h2>
          </div>
          <button onClick={onCancel} className="categoria-close-button">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="categoria-form">
          <div className="categoria-form-grid">
            <div className="categoria-form-group full-width">
              <label className="categoria-label">
                Nombre de la Categoría *
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className={'categoria-input' + (errores.nombre ? ' error' : '')}
                placeholder="Ej: Bebidas, Comida, Postres"
              />
              {errores.nombre && (
                <span className="categoria-error-message">{errores.nombre}</span>
              )}
            </div>

            <div className="categoria-form-group full-width">
              <label className="categoria-label">
                Descripción
              </label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                className="categoria-textarea"
                placeholder="Describe la categoría..."
                rows={3}
              />
            </div>

            <div className="categoria-form-group full-width">
              <label className="categoria-label">
                URL de Imagen
              </label>
              <input
                type="text"
                value={formData.imagencategoria}
                onChange={(e) => setFormData({ ...formData, imagencategoria: e.target.value })}
                className="categoria-input"
                placeholder="https://ejemplo.com/imagen.jpg"
              />
              <small className="categoria-help-text">
                Ingresa la URL de una imagen para la categoría
              </small>
            </div>

            <div className="categoria-form-group">
              <label className="categoria-label">
                Orden de Visualización *
              </label>
              <input
                type="number"
                value={formData.orden}
                onChange={(e) => setFormData({ ...formData, orden: Number(e.target.value) })}
                className={'categoria-input' + (errores.orden ? ' error' : '')}
                min="0"
                placeholder="0"
              />
              {errores.orden && (
                <span className="categoria-error-message">{errores.orden}</span>
              )}
              <small className="categoria-help-text">
                Define el orden en que se mostrará la categoría
              </small>
            </div>

            <div className="categoria-form-group full-width">
              <label className="categoria-label">
                Moderadores
                {moderadoresSeleccionados.length > 0 && (
                  <span className="categoria-selected-count">
                    ({moderadoresSeleccionados.length} seleccionado{moderadoresSeleccionados.length > 1 ? 's' : ''})
                  </span>
                )}
              </label>
              
              {cargandoModeradores ? (
                <div className="categoria-loading-moderadores">
                  Cargando moderadores...
                </div>
              ) : moderadores.length === 0 ? (
                <div className="categoria-no-moderadores">
                  No hay moderadores disponibles
                </div>
              ) : (
                <>
                  <div className="categoria-checklist-header">
                    <button
                      type="button"
                      onClick={handleToggleTodos}
                      className="categoria-toggle-all-btn"
                    >
                      {moderadoresSeleccionados.length === moderadores.length 
                        ? 'Deseleccionar todos' 
                        : 'Seleccionar todos'}
                    </button>
                  </div>
                  
                  <div className="categoria-moderadores-checklist">
                    {moderadores.map((moderador) => (
                      <label 
                        key={moderador.idmoderadorref} 
                        className="categoria-checklist-item"
                      >
                        <input
                          type="checkbox"
                          checked={moderadoresSeleccionados.includes(moderador.idmoderadorref)}
                          onChange={() => handleModeradorToggle(moderador.idmoderadorref)}
                          className="categoria-checkbox"
                        />
                        <span className="categoria-checkbox-label">
                          {moderador.nombremodref}
                        </span>
                      </label>
                    ))}
                  </div>
                </>
              )}
              
              <small className="categoria-help-text">
                Selecciona uno o más moderadores para esta categoría (opcional)
              </small>
            </div>

            <div className="categoria-form-group">
              <label className="categoria-label">
                Estado
              </label>
              <select
                value={formData.estatus}
                onChange={(e) => setFormData({ ...formData, estatus: Number(e.target.value) })}
                className="categoria-select"
              >
                <option value={1}>Activo</option>
                <option value={0}>Inactivo</option>
              </select>
            </div>
          </div>

          <div className="categoria-form-actions">
            <button type="button" onClick={onCancel} className="btn-cancelar">
              <X size={20} />
              Cancelar
            </button>
            <button type="submit" className="btn-guardar">
              <Save size={20} />
              {categoria ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormularioCategoria;
