import React, { useState, useEffect, useCallback } from 'react';
import { Plus, ChefHat, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import StandardPageLayout from '../../components/StandardPageLayout/StandardPageLayout';
import StandardCard from '../../components/StandardCard/StandardCard';
import FormularioReceta from '../../components/recetas/FormularioReceta/FormularioReceta';
import type { Receta, RecetaCreate, RecetaUpdate } from '../../types/receta.types';
import { obtenerRecetas, crearReceta, actualizarReceta, eliminarReceta } from '../../services/recetasService';
import './ConfigRecetas.css';

const ConfigRecetas: React.FC = () => {
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
        headerTitle="GESTIÓN DE RECETAS"
        headerSubtitle={`${recetas.length} receta${recetas.length !== 1 ? 's' : ''} registrada${recetas.length !== 1 ? 's' : ''}`}
        actionButton={{
          text: 'Nueva Receta',
          icon: <Plus size={20} />,
          onClick: handleNuevo
        }}
        loading={cargando}
        loadingMessage="Cargando recetas..."
        isEmpty={recetas.length === 0}
        emptyIcon={<ChefHat size={80} />}
        emptyMessage="No hay recetas registradas."
      >
        <div className="standard-cards-grid">
          {recetas.map((receta) => (
            <StandardCard
              key={receta.idReceta}
              title={receta.nombreReceta}
              fields={[
                {
                  label: 'Costo',
                  value: `$${receta.costoReceta.toFixed(2)}`
                },
                {
                  label: 'Ingredientes',
                  value: receta.detalles ? `${receta.detalles.length} ingrediente${receta.detalles.length !== 1 ? 's' : ''}` : '0 ingredientes'
                },
                {
                  label: 'Instrucciones',
                  value: receta.archivoInstrucciones || 'Sin archivo'
                },
                {
                  label: 'Estado',
                  value: (
                    <span style={{ 
                      color: receta.estatus === 1 ? '#10b981' : '#ef4444',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      {receta.estatus === 1 ? <CheckCircle size={16} /> : <XCircle size={16} />}
                      {receta.estatus === 1 ? 'Activa' : 'Inactiva'}
                    </span>
                  )
                },
                {
                  label: 'Usuario',
                  value: receta.usuarioauditoria
                }
              ]}
              actions={[
                {
                  label: 'Editar',
                  icon: <Edit size={18} />,
                  onClick: () => handleEditar(receta),
                  variant: 'edit'
                },
                {
                  label: 'Eliminar',
                  icon: <Trash2 size={18} />,
                  onClick: () => handleEliminar(receta.idReceta),
                  variant: 'delete'
                }
              ]}
            />
          ))}
        </div>
      </StandardPageLayout>

      {/* Formulario Modal */}
      {mostrarFormulario && (
        <FormularioReceta
          receta={recetaEditar}
          idnegocio={idnegocio}
          onSubmit={handleGuardar}
          onCancel={handleCancelar}
        />
      )}
    </>
  );
};

export default ConfigRecetas;
