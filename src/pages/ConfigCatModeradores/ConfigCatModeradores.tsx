import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Users } from 'lucide-react';
import StandardPageLayout from '../../components/StandardPageLayout/StandardPageLayout';
import ListaCatModeradores from '../../components/catModeradores/ListaCatModeradores/ListaCatModeradores';
import type { CatModerador, CatModeradorCreate, CatModeradorUpdate } from '../../types/catModerador.types';
import { obtenerCatModeradores, crearCatModerador, actualizarCatModerador, eliminarCatModerador } from '../../services/catModeradoresService';
import FormularioCatModerador from '../../components/catModeradores/FormularioCatModerador/FormularioCatModerador';
import './ConfigCatModeradores.css';

const ConfigCatModeradores: React.FC = () => {
  const [catModeradores, setCatModeradores] = useState<CatModerador[]>([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [catModeradorSeleccionada, setCatModeradorSeleccionada] = useState<CatModerador | null>(null);
  const [mensaje, setMensaje] = useState<{
    tipo: 'success' | 'error' | 'info';
    texto: string;
  } | null>(null);

  const idnegocio = Number(localStorage.getItem('idnegocio')) || 1;
  const privilegio = Number(localStorage.getItem('privilegio') || '0');

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
    if (privilegio < 5) {
      mostrarMensaje('error', 'No tiene privilegios suficientes para eliminar registros');
      return;
    }
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
    <>
      {/* Mensaje de Notificación */}
      {mensaje && (
        <div className={`standard-notification ${mensaje.tipo}`}>
          <div className="notification-content">
            <p className="notification-message">{mensaje.texto}</p>
          </div>
          <button className="btn-close" onClick={() => setMensaje(null)}>×</button>
        </div>
      )}

      <StandardPageLayout
        headerTitle="Categoría Moderadores"
        headerSubtitle="Gestión de categorías de moderadores"
        actionButton={{
          text: 'Nueva Categoría',
          icon: <Plus size={20} />,
          onClick: handleNuevo
        }}
        loading={cargando}
        loadingMessage="Cargando categorías moderador..."
        isEmpty={catModeradores.length === 0}
        emptyIcon={<Users size={64} />}
        emptyMessage="No hay categorías moderador registradas."
      >
        <ListaCatModeradores
          catModeradores={catModeradores}
          onEditar={handleEditar}
          onEliminar={handleEliminar}
        />
      </StandardPageLayout>

      {/* Formulario Modal */}
      {mostrarFormulario && (
        <FormularioCatModerador
          catModerador={catModeradorSeleccionada}
          idnegocio={idnegocio}
          onSubmit={handleSubmit}
          onCancel={handleCancelar}
        />
      )}
    </>
  );
};

export default ConfigCatModeradores;
