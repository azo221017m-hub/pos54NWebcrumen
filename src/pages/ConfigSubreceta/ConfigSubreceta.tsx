import React, { useState, useEffect, useCallback } from 'react';
import { Plus, ChefHat } from 'lucide-react';
import StandardPageLayout from '../../components/StandardPageLayout/StandardPageLayout';
import ListaSubrecetas from '../../components/subrecetas/ListaSubrecetas/ListaSubrecetas';
import FormularioSubreceta from '../../components/subrecetas/FormularioSubreceta/FormularioSubreceta';
import type { Subreceta, SubrecetaCreate, SubrecetaUpdate } from '../../types/subreceta.types';
import { 
  obtenerSubrecetas,
  crearSubreceta,
  actualizarSubreceta,
  eliminarSubreceta 
} from '../../services/subrecetasService';
import '../../styles/StandardPageLayout.css';

const ConfigSubreceta: React.FC = () => {
  const [subrecetas, setSubrecetas] = useState<Subreceta[]>([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [subrecetaEditar, setSubrecetaEditar] = useState<Subreceta | null>(null);
  const [mensaje, setMensaje] = useState<{
    tipo: 'success' | 'error' | 'info';
    texto: string;
  } | null>(null);

  // Obtener idnegocio del localStorage
  const idnegocio = Number(localStorage.getItem('idnegocio')) || 1;

  const mostrarMensaje = useCallback((tipo: 'success' | 'error' | 'info', texto: string) => {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje(null), 4000);
  }, []);

  const cargarSubrecetas = useCallback(async () => {
    console.log('🔷 ConfigSubreceta: Cargando subrecetas...');
    setCargando(true);
    try {
      const data = await obtenerSubrecetas(idnegocio);
      setSubrecetas(Array.isArray(data) ? data : []);
      console.log('🔷 ConfigSubreceta: Subrecetas cargadas:', data.length);
    } catch (error) {
      console.error('🔴 ConfigSubreceta: Error al cargar subrecetas:', error);
      mostrarMensaje('error', 'Error al cargar las subrecetas');
      setSubrecetas([]);
    } finally {
      setCargando(false);
    }
  }, [idnegocio, mostrarMensaje]);

  useEffect(() => {
    cargarSubrecetas();
  }, [cargarSubrecetas]);

  const handleNuevo = () => {
    setSubrecetaEditar(null);
    setMostrarFormulario(true);
  };

  const handleEditar = (subreceta: Subreceta) => {
    setSubrecetaEditar(subreceta);
    setMostrarFormulario(true);
  };

  const handleGuardar = async (data: SubrecetaCreate | SubrecetaUpdate) => {
    try {
      if (subrecetaEditar) {
        const subrecetaActualizada = await actualizarSubreceta(subrecetaEditar.idSubReceta, data as SubrecetaUpdate);
        setMostrarFormulario(false);
        setSubrecetaEditar(null);
        mostrarMensaje('success', 'Subreceta actualizada exitosamente');
        setSubrecetas(prev =>
          prev.map(sub =>
            sub.idSubReceta === subrecetaActualizada.idSubReceta ? subrecetaActualizada : sub
          )
        );
      } else {
        const nuevaSubreceta = await crearSubreceta(data as SubrecetaCreate);
        setMostrarFormulario(false);
        mostrarMensaje('success', 'Subreceta creada exitosamente');
        setSubrecetas(prev => [...prev, nuevaSubreceta]);
      }
    } catch (error) {
      console.error('Error al guardar subreceta:', error);
      mostrarMensaje('error', 'Error al guardar la subreceta');
    }
  };

  const handleEliminar = async (id: number) => {
    if (!window.confirm('¿Está seguro de eliminar esta subreceta? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      const idEliminado = await eliminarSubreceta(id);
      mostrarMensaje('success', 'Subreceta eliminada exitosamente');
      setSubrecetas(prev => prev.filter(sub => sub.idSubReceta !== idEliminado));
    } catch (error) {
      console.error('Error al eliminar subreceta:', error);
      mostrarMensaje('error', 'Error al eliminar la subreceta');
    }
  };

  const handleCancelar = () => {
    setMostrarFormulario(false);
    setSubrecetaEditar(null);
  };

  const getCantidadIngredientes = (subreceta: Subreceta) => {
    const count = subreceta.detalles?.length || 0;
    return `${count} ingrediente${count !== 1 ? 's' : ''}`;
  };

  const getSubtitle = () => {
    return `${subrecetas.length} subreceta${subrecetas.length !== 1 ? 's' : ''} registrada${subrecetas.length !== 1 ? 's' : ''}`;
  };

  return (
    <>
      {mensaje && (
        <div className={`standard-notification ${mensaje.tipo === 'success' ? 'success' : mensaje.tipo === 'error' ? 'error' : 'info'}`}>
          <p>{mensaje.texto}</p>
          <button onClick={() => setMensaje(null)}>×</button>
        </div>
      )}

      <StandardPageLayout
        headerTitle="Gestión de Subrecetas"
        headerSubtitle={getSubtitle()}
        actionButton={{
          text: 'Nueva Subreceta',
          icon: <Plus size={20} />,
          onClick: handleNuevo
        }}
        loading={cargando}
        loadingMessage="Cargando subrecetas..."
        isEmpty={subrecetas.length === 0}
        emptyIcon={<ChefHat size={80} />}
        emptyMessage="No hay subrecetas registradas"
      >
        <ListaSubrecetas
          subrecetas={subrecetas}
          onEditar={handleEditar}
          onEliminar={handleEliminar}
        />
      </StandardPageLayout>

      {/* Formulario Modal */}
      {mostrarFormulario && (
        <FormularioSubreceta
          subreceta={subrecetaEditar}
          idnegocio={idnegocio}
          onSubmit={handleGuardar}
          onCancel={handleCancelar}
        />
      )}
    </>
  );
};

export default ConfigSubreceta;
