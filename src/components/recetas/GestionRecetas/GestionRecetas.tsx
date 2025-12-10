import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ChefHat, Loader, ArrowLeft } from 'lucide-react';
import ListaRecetas from '../ListaRecetas/ListaRecetas';
import FormularioReceta from '../FormularioReceta/FormularioReceta';
import type { Receta, RecetaCreate, RecetaUpdate } from '../../../types/receta.types';
import { obtenerRecetas, crearReceta, actualizarReceta, eliminarReceta } from '../../../services/recetasService';
import './GestionRecetas.css';

const GestionRecetas: React.FC = () => {
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
    console.log('🔷 GestionRecetas: Cargando recetas...');
    setCargando(true);
    try {
      const data = await obtenerRecetas(idnegocio);
      setRecetas(Array.isArray(data) ? data : []);
      console.log('🔷 GestionRecetas: Recetas cargadas:', data.length);
    } catch (error) {
      console.error('🔴 GestionRecetas: Error al cargar recetas:', error);
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
        const exito = await actualizarReceta(recetaEditar.idReceta, data as RecetaUpdate);
        if (exito) {
          mostrarMensaje('success', 'Receta actualizada exitosamente');
          setMostrarFormulario(false);
          setRecetaEditar(null);
          cargarRecetas();
        } else {
          mostrarMensaje('error', 'Error al actualizar la receta');
        }
      } else {
        const resultado = await crearReceta(data as RecetaCreate);
        if (resultado.success) {
          mostrarMensaje('success', 'Receta creada exitosamente');
          setMostrarFormulario(false);
          cargarRecetas();
        } else {
          mostrarMensaje('error', 'Error al crear la receta');
        }
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
      const exito = await eliminarReceta(id);
      if (exito) {
        mostrarMensaje('success', 'Receta eliminada exitosamente');
        cargarRecetas();
      } else {
        mostrarMensaje('error', 'Error al eliminar la receta');
      }
    } catch (error) {
      console.error('Error al eliminar receta:', error);
      mostrarMensaje('error', 'Error al eliminar la receta');
    }
  };

  const handleCancelar = () => {
    setMostrarFormulario(false);
    setRecetaEditar(null);
  };

  const handleRegresar = () => {
    navigate('/dashboard');
  };

  return (
    <div className="gestion-recetas">
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

      <div className="recetas-header">
        <div className="recetas-header-top">
          <button onClick={handleRegresar} className="btn-regresar" title="Regresar al Dashboard">
            <ArrowLeft size={20} />
            Regresar
          </button>
        </div>
        
        <div className="recetas-header-content">
          <div className="recetas-title">
            <ChefHat size={32} className="recetas-icon" />
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

      <div className="recetas-content">
        {cargando ? (
          <div className="recetas-cargando">
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

export default GestionRecetas;
