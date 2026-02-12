import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ChefHat, ArrowLeft } from 'lucide-react';
import ListaRecetas from '../../components/recetas/ListaRecetas/ListaRecetas';
import FormularioReceta from '../../components/recetas/FormularioReceta/FormularioReceta';
import type { Receta, RecetaCreate, RecetaUpdate } from '../../types/receta.types';
import {
  useRecetasQuery,
  useCrearRecetaMutation,
  useActualizarRecetaMutation,
  useEliminarRecetaMutation
} from '../../hooks/queries/useRecetas';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import './ConfigRecetas.css';

const ConfigRecetas: React.FC = () => {
  const navigate = useNavigate();
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [recetaEditar, setRecetaEditar] = useState<Receta | null>(null);
  const [mensaje, setMensaje] = useState<{
    tipo: 'success' | 'error' | 'info';
    texto: string;
  } | null>(null);

  const mostrarMensaje = useCallback((tipo: 'success' | 'error' | 'info', texto: string) => {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje(null), 4000);
  }, []);

  // Get idnegocio from localStorage usuario
  const idnegocio = useMemo(() => {
    const usuarioStr = localStorage.getItem('usuario');
    if (usuarioStr) {
      try {
        const usuario = JSON.parse(usuarioStr);
        return usuario.idnegocio || 1;
      } catch {
        return 1;
      }
    }
    return 1;
  }, []);

  // TanStack Query hooks
  const { data: recetas = [], isLoading: cargando } = useRecetasQuery(idnegocio);
  const crearMutation = useCrearRecetaMutation();
  const actualizarMutation = useActualizarRecetaMutation();
  const eliminarMutation = useEliminarRecetaMutation();

  const handleNuevo = () => {
    setRecetaEditar(null);
    setMostrarFormulario(true);
  };

  const handleEditar = (receta: Receta) => {
    setRecetaEditar(receta);
    setMostrarFormulario(true);
  };

  const handleGuardar = async (data: RecetaCreate | RecetaUpdate) => {
    try {
      if (recetaEditar) {
        await actualizarMutation.mutateAsync({ id: recetaEditar.idReceta, data: data as RecetaUpdate });
        mostrarMensaje('success', 'Receta actualizada exitosamente');
      } else {
        await crearMutation.mutateAsync(data as RecetaCreate);
        mostrarMensaje('success', 'Receta creada exitosamente');
      }
      setMostrarFormulario(false);
      setRecetaEditar(null);
    } catch (error) {
      console.error('Error al guardar receta:', error);
      mostrarMensaje('error', 'Error al guardar la receta');
    }
  };

  const handleEliminar = async (id: number) => {
    const receta = recetas.find(r => r.idReceta === id);
    
    if (!window.confirm(
      `¿Está seguro de eliminar la receta "${receta?.nombreReceta}"?\n\nEsta acción desactivará la receta.`
    )) {
      return;
    }

    try {
      await eliminarMutation.mutateAsync(id);
      mostrarMensaje('success', 'Receta eliminada exitosamente');
    } catch (error) {
      console.error('Error al eliminar receta:', error);
      mostrarMensaje('error', 'Error al eliminar la receta');
    }
  };

  const handleCancelar = () => {
    setMostrarFormulario(false);
    setRecetaEditar(null);
  };

  return (
    <div className="config-recetas-page">
      {/* Mensaje de Notificación */}
      {mensaje && (
        <div className={`mensaje-notificacion mensaje-${mensaje.tipo}`}>
          <div className="mensaje-contenido">
            <span className="mensaje-texto">{mensaje.texto}</span>
            <button
              className="mensaje-cerrar"
              onClick={() => setMensaje(null)}
              aria-label="Cerrar mensaje"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Header con botones */}
      <div className="config-header">
        <button className="btn-volver" onClick={() => navigate('/dashboard')}>
          <ArrowLeft size={20} />
          Volver al Dashboard
        </button>
        
        <div className="config-header-content">
          <div className="config-title">
            <ChefHat size={32} className="config-icon" />
            <div>
              <h1>Gestión de Recetas</h1>
              <p>{recetas.length} receta{recetas.length !== 1 ? 's' : ''} registrada{recetas.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <button onClick={handleNuevo} className="btn-nuevo">
            <Plus size={20} />
            Nueva Receta
          </button>
        </div>
      </div>

      {/* Contenedor fijo con Lista */}
      <div className="config-container">
        {cargando ? (
          <LoadingSpinner size={48} message="Cargando recetas..." />
        ) : (
          <ListaRecetas
            recetas={recetas}
            onEditar={handleEditar}
            onEliminar={handleEliminar}
          />
        )}
      </div>

      {/* Formulario Modal */}
      {mostrarFormulario && (
        <FormularioReceta
          receta={recetaEditar}
          idnegocio={idnegocio}
          onSubmit={handleGuardar}
          onCancel={handleCancelar}
        />
      )}
    </div>
  );
};

export default ConfigRecetas;
