import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Plus } from 'lucide-react';
import StandardPageLayout from '../../components/StandardPageLayout/StandardPageLayout';
import ListaAnuncios from '../../components/anuncios/ListaAnuncios/ListaAnuncios';
import FormularioAnuncio from '../../components/anuncios/FormularioAnuncio/FormularioAnuncio';
import type { Anuncio, AnuncioCreate, AnuncioUpdate } from '../../types/anuncio.types';
import {
  obtenerAnuncios,
  crearAnuncio,
  actualizarAnuncio,
  eliminarAnuncio
} from '../../services/anunciosService';
import '../../styles/StandardPageLayout.css';

const ConfigAnuncios: React.FC = () => {
  const [anuncios, setAnuncios] = useState<Anuncio[]>([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [anuncioEditar, setAnuncioEditar] = useState<Anuncio | undefined>(undefined);
  const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null);

  const mostrarMensaje = (tipo: 'success' | 'error', texto: string) => {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje(null), 4000);
  };

  const extraerMensajeError = (error: unknown, fallback: string): string => {
    if (axios.isAxiosError(error) && error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error instanceof Error) {
      return error.message;
    }
    return fallback;
  };

  const cargarAnuncios = useCallback(async () => {
    try {
      setCargando(true);
      const data = await obtenerAnuncios();
      setAnuncios(data);
    } catch (error) {
      console.error('Error al cargar anuncios:', error);
      setAnuncios([]);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarAnuncios();
  }, [cargarAnuncios]);

  const handleCrearAnuncio = async (anuncio: AnuncioCreate | AnuncioUpdate) => {
    try {
      const nuevoAnuncio = await crearAnuncio(anuncio as AnuncioCreate);
      mostrarMensaje('success', 'Anuncio creado exitosamente');
      setMostrarFormulario(false);
      setAnuncios(prev => [nuevoAnuncio, ...prev]);
    } catch (error) {
      console.error('Error al crear anuncio:', error);
      mostrarMensaje('error', extraerMensajeError(error, 'Error al crear el anuncio'));
    }
  };

  const handleActualizarAnuncio = async (anuncio: AnuncioCreate | AnuncioUpdate) => {
    if (!anuncioEditar) return;
    try {
      const anuncioActualizado = await actualizarAnuncio(anuncioEditar.idAnuncio, anuncio as AnuncioUpdate);
      mostrarMensaje('success', 'Anuncio actualizado exitosamente');
      setMostrarFormulario(false);
      setAnuncioEditar(undefined);
      setAnuncios(prev =>
        prev.map(a => a.idAnuncio === anuncioActualizado.idAnuncio ? anuncioActualizado : a)
      );
    } catch (error) {
      console.error('Error al actualizar anuncio:', error);
      mostrarMensaje('error', extraerMensajeError(error, 'Error al actualizar el anuncio'));
    }
  };

  const handleEliminarAnuncio = async (idAnuncio: number) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este anuncio?')) return;
    try {
      await eliminarAnuncio(idAnuncio);
      mostrarMensaje('success', 'Anuncio eliminado exitosamente');
      setAnuncios(prev => prev.filter(a => a.idAnuncio !== idAnuncio));
    } catch (error) {
      console.error('Error al eliminar anuncio:', error);
      mostrarMensaje('error', extraerMensajeError(error, 'Error al eliminar el anuncio'));
    }
  };

  const handleEditarAnuncio = (anuncio: Anuncio) => {
    setAnuncioEditar(anuncio);
    setMostrarFormulario(true);
  };

  const handleCancelar = () => {
    setMostrarFormulario(false);
    setAnuncioEditar(undefined);
  };

  const handleNuevoAnuncio = () => {
    setAnuncioEditar(undefined);
    setMostrarFormulario(true);
  };

  return (
    <>
      {mensaje && (
        <div className={`standard-notification ${mensaje.tipo}`}>
          <div className="notification-content">
            <p className="notification-message">{mensaje.texto}</p>
          </div>
          <button className="btn-close" onClick={() => setMensaje(null)}>×</button>
        </div>
      )}

      <StandardPageLayout
        headerTitle="Gestión de Anuncios"
        headerSubtitle="Administra los anuncios del sistema"
        actionButton={{
          text: 'Nuevo Anuncio',
          icon: <Plus size={20} />,
          onClick: handleNuevoAnuncio
        }}
        loading={cargando}
        loadingMessage="Cargando anuncios..."
        isEmpty={anuncios.length === 0}
        emptyMessage="No hay anuncios registrados."
      >
        <ListaAnuncios
          anuncios={anuncios}
          onEdit={handleEditarAnuncio}
          onDelete={handleEliminarAnuncio}
        />

        {mostrarFormulario && (
          <FormularioAnuncio
            anuncioInicial={anuncioEditar}
            onSubmit={anuncioEditar ? handleActualizarAnuncio : handleCrearAnuncio}
            onCancel={handleCancelar}
          />
        )}
      </StandardPageLayout>
    </>
  );
};

export default ConfigAnuncios;
