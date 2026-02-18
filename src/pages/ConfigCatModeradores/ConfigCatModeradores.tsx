import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Users, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import StandardPageLayout from '../../components/StandardPageLayout/StandardPageLayout';
import StandardCard from '../../components/StandardCard/StandardCard';
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

  const obtenerCantidadModeradores = (moderadores: string): number => {
    if (!moderadores || moderadores === '' || moderadores === '0') {
      return 0;
    }
    if (moderadores.includes(',')) {
      return moderadores.split(',').filter(id => id.trim() !== '0' && id.trim() !== '').length;
    }
    return 1;
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
        <div className="standard-cards-grid">
          {catModeradores.map((catModerador) => {
            const cantidadModeradores = obtenerCantidadModeradores(catModerador.moderadores);
            
            return (
              <StandardCard
                key={catModerador.idmodref}
                title={catModerador.nombremodref}
                fields={[
                  {
                    label: 'Estado',
                    value: (
                      <span style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: catModerador.estatus === 1 ? '#10b981' : '#ef4444',
                        fontWeight: 600
                      }}>
                        {catModerador.estatus === 1 ? <CheckCircle size={14} /> : <XCircle size={14} />}
                        {catModerador.estatus === 1 ? 'Activo' : 'Inactivo'}
                      </span>
                    )
                  },
                  {
                    label: 'Moderadores',
                    value: (
                      <span style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: '#8b5cf6',
                        fontWeight: 600
                      }}>
                        <Users size={14} />
                        {cantidadModeradores} moderador{cantidadModeradores !== 1 ? 'es' : ''}
                      </span>
                    )
                  },
                  {
                    label: 'Usuario',
                    value: catModerador.usuarioauditoria
                  },
                  {
                    label: 'Fecha Registro',
                    value: catModerador.fechaRegistroauditoria
                      ? new Date(catModerador.fechaRegistroauditoria).toLocaleDateString('es-MX')
                      : 'N/A'
                  }
                ]}
                actions={[
                  {
                    label: 'Editar',
                    icon: <Edit size={16} />,
                    onClick: () => handleEditar(catModerador),
                    variant: 'edit'
                  },
                  {
                    label: 'Eliminar',
                    icon: <Trash2 size={16} />,
                    onClick: () => handleEliminar(catModerador.idmodref),
                    variant: 'delete'
                  }
                ]}
              />
            );
          })}
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
      </StandardPageLayout>
    </>
  );
};

export default ConfigCatModeradores;
