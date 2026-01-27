import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ChefHat, Loader, ArrowLeft } from 'lucide-react';
import ListaRecetas from '../../components/recetas/ListaRecetas/ListaRecetas';
import FormularioReceta from '../../components/recetas/FormularioReceta/FormularioReceta';
import type { Receta, RecetaCreate, RecetaUpdate } from '../../types/receta.types';
import { obtenerRecetas, crearReceta, actualizarReceta, eliminarReceta } from '../../services/recetasService';
import './ConfigRecetas.css';

const ConfigRecetas: React.FC = () => {
  const navigate = useNavigate();
  const [recetas, setRecetas] = useState<Receta[]>([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [recetaEditar, setRecetaEditar] = useState<Receta | null>(null);
  const [idnegocio, setIdnegocio] = useState<number>(1);
  const [mensaje, setMensaje] = useState<{
    tipo: 'success' | 'error' | 'info';
    texto: string;
  } | null>(null);

  const mostrarMensaje = useCallback((tipo: 'success' | 'error' | 'info', texto: string) => {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje(null), 4000);
  }, []);

  useEffect(() => {
    const idnegocioStorage = localStorage.getItem('idnegocio');
    if (idnegocioStorage) {
      setIdnegocio(Number(idnegocioStorage));
    }
  }, []);

  const cargarRecetas = useCallback(async () => {
    console.log('🔷 ConfigRecetas: Cargando recetas...');
    setCargando(true);
    try {
      const data = await obtenerRecetas(idnegocio);
      setRecetas(Array.isArray(data) ? data : []);
      console.log('🔷 ConfigRecetas: Recetas cargadas:', data.length);
    } catch (error) {
      console.error('🔴 ConfigRecetas: Error al cargar recetas:', error);
      mostrarMensaje('error', 'Error al cargar las recetas');
      setRecetas([]);
    } finally {
      setCargando(false);
    }
  }, [idnegocio, mostrarMensaje]);

  useEffect(() => {
    cargarRecetas();
  }, [cargarRecetas]);

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
        const recetaActualizada = await actualizarReceta(recetaEditar.idReceta, data as RecetaUpdate);
        mostrarMensaje('success', 'Receta actualizada exitosamente');
        setMostrarFormulario(false);
        setRecetaEditar(null);
        setRecetas(prev =>
          prev.map(rec =>
            rec.idReceta === recetaActualizada.idReceta ? recetaActualizada : rec
          )
        );
      } else {
        const nuevaReceta = await crearReceta(data as RecetaCreate);
        mostrarMensaje('success', 'Receta creada exitosamente');
        setMostrarFormulario(false);
        setRecetas(prev => [...prev, nuevaReceta]);
      }
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
      const idEliminado = await eliminarReceta(id);
      mostrarMensaje('success', 'Receta eliminada exitosamente');
      setRecetas(prev => prev.filter(rec => rec.idReceta !== idEliminado));
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
          <div className="config-cargando">
            <Loader className="spinner" size={48} />
            <p>Cargando recetas...</p>
          </div>
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
