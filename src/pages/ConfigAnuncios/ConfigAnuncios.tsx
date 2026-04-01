import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Megaphone } from 'lucide-react';
import type { Anuncio, AnuncioCreate, AnuncioUpdate } from '../../types/anuncio.types';
import {
  obtenerAnuncios,
  crearAnuncio,
  actualizarAnuncio,
  eliminarAnuncio
} from '../../services/anunciosService';
import StandardPageLayout from '../../components/StandardPageLayout/StandardPageLayout';
import ListaAnuncios from '../../components/anuncios/ListaAnuncios/ListaAnuncios';
import FormularioAnuncio from '../../components/anuncios/FormularioAnuncio/FormularioAnuncio';
import FeedbackToast, { showSuccessToast, showErrorToast } from '../../components/FeedbackToast';

const ConfigAnuncios: React.FC = () => {
  const [anuncios, setAnuncios] = useState<Anuncio[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [anuncioSeleccionado, setAnuncioSeleccionado] = useState<Anuncio | null>(null);
  const privilegio = Number(localStorage.getItem('privilegio') || '0');

  const cargarAnuncios = useCallback(async () => {
    try {
      setCargando(true);
      const data = await obtenerAnuncios();
      setAnuncios(data);
    } catch (error) {
      console.error('Error al cargar anuncios:', error);
      showErrorToast('Error al cargar los anuncios');
      setAnuncios([]);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarAnuncios();
  }, [cargarAnuncios]);

  const handleNuevo = () => {
    setAnuncioSeleccionado(null);
    setMostrarFormulario(true);
  };

  const handleEditar = (anuncio: Anuncio) => {
    setAnuncioSeleccionado(anuncio);
    setMostrarFormulario(true);
  };

  const handleEliminar = async (id: number) => {
    if (privilegio < 5) {
      showErrorToast('No tiene privilegios suficientes para eliminar registros');
      return;
    }
    const anuncio = anuncios.find(a => a.idAnuncio === id);
    if (!window.confirm(`¿Está seguro de eliminar el anuncio "${anuncio?.tituloDeAnuncio}"?`)) {
      return;
    }
    try {
      await eliminarAnuncio(id);
      showSuccessToast('Anuncio eliminado exitosamente');
      setAnuncios(prev => prev.filter(a => a.idAnuncio !== id));
    } catch (error) {
      console.error('Error al eliminar anuncio:', error);
      showErrorToast('Error al eliminar el anuncio');
    }
  };

  const handleSubmit = async (data: AnuncioCreate | AnuncioUpdate) => {
    setGuardando(true);
    try {
      if ('idAnuncio' in data) {
        const actualizado = await actualizarAnuncio(data.idAnuncio, data);
        showSuccessToast('Anuncio actualizado exitosamente');
        setMostrarFormulario(false);
        setAnuncioSeleccionado(null);
        setAnuncios(prev =>
          prev.map(a => a.idAnuncio === actualizado.idAnuncio ? actualizado : a)
        );
      } else {
        const nuevo = await crearAnuncio(data);
        showSuccessToast('Anuncio creado exitosamente');
        setMostrarFormulario(false);
        setAnuncios(prev => [nuevo, ...prev]);
      }
    } catch (error) {
      console.error('Error al guardar anuncio:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error al guardar el anuncio';
      showErrorToast(errorMessage);
    } finally {
      setGuardando(false);
    }
  };

  const handleCancelar = () => {
    setMostrarFormulario(false);
    setAnuncioSeleccionado(null);
  };

  return (
    <>
      {/* FeedbackToast: mensajes tipo toast al frente del formulario */}
      <FeedbackToast />

      <StandardPageLayout
        headerTitle="GESTIÓN DE ANUNCIOS"
        headerSubtitle={`${anuncios.length} anuncio${anuncios.length !== 1 ? 's' : ''} registrado${anuncios.length !== 1 ? 's' : ''}`}
        actionButton={{
          text: 'Nuevo Anuncio',
          icon: <Plus size={20} />,
          onClick: handleNuevo
        }}
        loading={cargando}
        loadingMessage="Cargando anuncios..."
        isEmpty={anuncios.length === 0}
        emptyIcon={<Megaphone size={80} />}
        emptyMessage="No hay anuncios registrados."
      >
        <ListaAnuncios
          anuncios={anuncios}
          onEditar={handleEditar}
          onEliminar={handleEliminar}
        />
      </StandardPageLayout>

      {/* Formulario Modal */}
      {mostrarFormulario && (
        <FormularioAnuncio
          anuncioEditar={anuncioSeleccionado}
          onSubmit={handleSubmit}
          onCancel={handleCancelar}
          loading={guardando}
        />
      )}
    </>
  );
};

export default ConfigAnuncios;
