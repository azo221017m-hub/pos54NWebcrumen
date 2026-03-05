import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Scale } from 'lucide-react';
import StandardPageLayout from '../../components/StandardPageLayout/StandardPageLayout';
import { ListaUMCompra } from '../../components/umcompra/ListaUMCompra/ListaUMCompra';
import { FormularioUMCompra } from '../../components/umcompra/FormularioUMCompra/FormularioUMCompra';
import type { UMCompra, UMCompraFormData } from '../../types/umcompra.types';
import {
  obtenerUMCompras,
  crearUMCompra,
  actualizarUMCompra,
  eliminarUMCompra,
  validarNombreUnico
} from '../../services/umcompraService';
import '../../styles/StandardPageLayout.css';

export const ConfigUMCompra: React.FC = () => {
  const [unidades, setUnidades] = useState<UMCompra[]>([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [umEditar, setUmEditar] = useState<UMCompra | null>(null);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null);

  const cargarUnidades = useCallback(async () => {
    try {
      setLoading(true);
      const data = await obtenerUMCompras();
      setUnidades(data);
    } catch (error) {
      console.error('Error al cargar unidades:', error);
      mostrarMensaje('error', 'Error al cargar las unidades de medida');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarUnidades();
  }, [cargarUnidades]);

  useEffect(() => {
    if (mensaje) {
      const timer = setTimeout(() => setMensaje(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [mensaje]);

  const mostrarMensaje = (tipo: 'success' | 'error', texto: string) => {
    setMensaje({ tipo, texto });
  };

  const handleNuevaUnidad = () => {
    setUmEditar(null);
    setMostrarFormulario(true);
  };

  const handleEditarUnidad = (um: UMCompra) => {
    setUmEditar(um);
    setMostrarFormulario(true);
  };

  const handleEliminarUnidad = async (id: number) => {
    try {
      setLoading(true);
      const idEliminado = await eliminarUMCompra(id);
      mostrarMensaje('success', 'Unidad de medida eliminada correctamente');
      setUnidades(prev => prev.filter(u => u.idUmCompra !== idEliminado));
    } catch (error) {
      console.error('Error al eliminar unidad:', error);
      mostrarMensaje('error', 'Error al eliminar la unidad de medida');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitFormulario = async (data: UMCompraFormData) => {
    try {
      setLoading(true);

      // Validar nombre único
      const nombreUnico = await validarNombreUnico(
        data.nombreUmCompra,
        umEditar?.idUmCompra
      );

      if (!nombreUnico) {
        mostrarMensaje('error', 'El nombre de la unidad de medida ya existe');
        setLoading(false);
        return;
      }

      if (umEditar) {
        const umActualizada = await actualizarUMCompra(umEditar.idUmCompra!, data);
        mostrarMensaje('success', 'Unidad de medida actualizada correctamente');
        setUnidades(prev =>
          prev.map(u =>
            u.idUmCompra === umActualizada.idUmCompra ? umActualizada : u
          )
        );
      } else {
        const nuevaUM = await crearUMCompra(data);
        mostrarMensaje('success', 'Unidad de medida creada correctamente');
        setUnidades(prev => [...prev, nuevaUM]);
      }

      setMostrarFormulario(false);
      setUmEditar(null);
    } catch (error) {
      console.error('Error al guardar unidad:', error);
      mostrarMensaje('error', 'Error al guardar la unidad de medida');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelarFormulario = () => {
    setMostrarFormulario(false);
    setUmEditar(null);
  };

  return (
    <>
      {mensaje && (
        <div className={`standard-notification ${mensaje.tipo === 'success' ? 'success' : 'error'}`}>
          <p>{mensaje.texto}</p>
          <button onClick={() => setMensaje(null)}>×</button>
        </div>
      )}

      <StandardPageLayout
        headerTitle="Configuración de Unidades de Medida"
        headerSubtitle="Administra las unidades de medida de compra"
        actionButton={{
          text: 'Nueva Unidad',
          icon: <Plus size={20} />,
          onClick: handleNuevaUnidad
        }}
        loading={loading}
        loadingMessage="Cargando unidades de medida..."
        isEmpty={unidades.length === 0}
        emptyIcon={<Scale size={80} />}
        emptyMessage="No hay unidades de medida registradas"
      >
        <ListaUMCompra
          unidades={unidades}
          onEditar={handleEditarUnidad}
          onEliminar={handleEliminarUnidad}
          loading={loading}
        />
      </StandardPageLayout>

      {/* Formulario Modal */}
      {mostrarFormulario && (
        <FormularioUMCompra
          umEditar={umEditar}
          onSubmit={handleSubmitFormulario}
          onCancelar={handleCancelarFormulario}
          loading={loading}
        />
      )}
    </>
  );
};
