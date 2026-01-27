import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Users, Loader } from 'lucide-react';
import type { CatModerador, CatModeradorCreate, CatModeradorUpdate } from '../../types/catModerador.types';
import { obtenerCatModeradores, crearCatModerador, actualizarCatModerador, eliminarCatModerador } from '../../services/catModeradoresService';
import ListaCatModeradores from '../../components/catModeradores/ListaCatModeradores/ListaCatModeradores';
import FormularioCatModerador from '../../components/catModeradores/FormularioCatModerador/FormularioCatModerador';
import './ConfigCatModeradores.css';

const ConfigCatModeradores: React.FC = () => {
  const navigate = useNavigate();
  const [catModeradores, setCatModeradores] = useState<CatModerador[]>([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [catModeradorSeleccionada, setCatModeradorSeleccionada] = useState<CatModerador | null>(null);
  const [mensaje, setMensaje] = useState<{
    tipo: 'success' | 'error' | 'info';
    texto: string;
  } | null>(null);

  const idnegocio = Number(localStorage.getItem('idnegocio')) || 1;

  const mostrarMensaje = useCallback((tipo: 'success' | 'error' | 'info', texto: string) => {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje(null), 4000);
  }, []);

  const cargarCatModeradores = useCallback(async () => {
    try {
      setCargando(true);
      const data = await obtenerCatModeradores();
      setCatModeradores(data);
    } catch (error) {
      console.error('Error al cargar categorías moderador:', error);
      mostrarMensaje('error', 'Error al cargar las categorías moderador');
    } finally {
      setCargando(false);
    }
  }, [mostrarMensaje]);

  useEffect(() => {
    cargarCatModeradores();
  }, [cargarCatModeradores]);

  const handleNuevo = () => {
    setCatModeradorSeleccionada(null);
    setMostrarFormulario(true);
  };

  const handleEditar = (catModerador: CatModerador) => {
    setCatModeradorSeleccionada(catModerador);
    setMostrarFormulario(true);
  };

  const handleEliminar = async (id: number) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta categoría moderador?')) {
      return;
    }

    try {
      const idEliminado = await eliminarCatModerador(id);
      mostrarMensaje('success', 'Categoría moderador eliminada exitosamente');
      setCatModeradores(prev => prev.filter(cm => cm.idmodref !== idEliminado));
    } catch (error) {
      console.error('Error al eliminar categoría moderador:', error);
      mostrarMensaje('error', 'Error al eliminar la categoría moderador');
    }
  };

  const handleSubmit = async (data: CatModeradorCreate | CatModeradorUpdate) => {
    try {
      if ('idmodref' in data) {
        const catModeradorActualizada = await actualizarCatModerador(data);
        mostrarMensaje('success', 'Categoría moderador actualizada exitosamente');
        setCatModeradores(prev =>
          prev.map(cm =>
            cm.idmodref === catModeradorActualizada.idmodref ? catModeradorActualizada : cm
          )
        );
      } else {
        const nuevaCatModerador = await crearCatModerador(data);
        mostrarMensaje('success', 'Categoría moderador creada exitosamente');
        setCatModeradores(prev => [...prev, nuevaCatModerador]);
      }
      setMostrarFormulario(false);
      setCatModeradorSeleccionada(null);
    } catch (error) {
      console.error('Error al guardar categoría moderador:', error);
      mostrarMensaje('error', 'Error al guardar la categoría moderador');
    }
  };

  const handleCancelar = () => {
    setMostrarFormulario(false);
    setCatModeradorSeleccionada(null);
  };

  return (
    <div className="config-cat-moderadores-page">
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
            <Users size={32} className="config-icon" />
            <div>
              <h1>Categoría Moderadores</h1>
              <p>Gestión de categorías de moderadores</p>
            </div>
          </div>
          <button onClick={handleNuevo} className="btn-nuevo">
            <Plus size={20} />
            Nueva Categoría
          </button>
        </div>
      </div>

      {/* Contenedor fijo con Lista */}
      <div className="config-container">
        {cargando ? (
          <div className="config-cargando">
            <Loader className="spinner" size={48} />
            <p>Cargando categorías moderador...</p>
          </div>
        ) : (
          <ListaCatModeradores
            catModeradores={catModeradores}
            onEditar={handleEditar}
            onEliminar={handleEliminar}
          />
        )}
      </div>

      {/* Formulario Modal */}
      {mostrarFormulario && (
        <FormularioCatModerador
          catModerador={catModeradorSeleccionada}
          idnegocio={idnegocio}
          onSubmit={handleSubmit}
          onCancel={handleCancelar}
        />
      )}
    </div>
  );
};

export default ConfigCatModeradores;
