import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
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
import './ConfigUMCompra.css';

type Vista = 'lista' | 'formulario';

export const ConfigUMCompra: React.FC = () => {
  const navigate = useNavigate();
  const [unidades, setUnidades] = useState<UMCompra[]>([]);
  const [vista, setVista] = useState<Vista>('lista');
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
    setVista('formulario');
  };

  const handleEditarUnidad = (um: UMCompra) => {
    setUmEditar(um);
    setVista('formulario');
  };

  const handleEliminarUnidad = async (id: number) => {
    try {
      setLoading(true);
      await eliminarUMCompra(id);
      mostrarMensaje('success', 'Unidad de medida eliminada correctamente');
      await cargarUnidades();
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
        // Actualizar
        await actualizarUMCompra(umEditar.idUmCompra!, data);
        mostrarMensaje('success', 'Unidad de medida actualizada correctamente');
      } else {
        // Crear
        await crearUMCompra(data);
        mostrarMensaje('success', 'Unidad de medida creada correctamente');
      }

      await cargarUnidades();
      setVista('lista');
      setUmEditar(null);
    } catch (error) {
      console.error('Error al guardar unidad:', error);
      mostrarMensaje('error', 'Error al guardar la unidad de medida');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelarFormulario = () => {
    setVista('lista');
    setUmEditar(null);
  };

  return (
    <div className="config-umcompra-page">
      {/* Header with back button and new unit button */}
      <div className="config-umcompra-header">
        <button 
          className="btn-back" 
          onClick={() => navigate('/dashboard')}
          title="Volver al Dashboard"
        >
          <ArrowLeft size={20} />
          Volver
        </button>
        <h1>Configuración de Unidades de Medida</h1>
        <button className="btn-nueva-unidad" onClick={handleNuevaUnidad}>
          <Plus size={20} />
          Nueva Unidad
        </button>
      </div>

      {/* Messages */}
      {mensaje && (
        <div className={`mensaje-alerta ${mensaje.tipo}`}>
          {mensaje.texto}
        </div>
      )}

      {/* Fixed container for content */}
      <div className="config-umcompra-container">
        {vista === 'lista' ? (
          <ListaUMCompra
            unidades={unidades}
            onEditar={handleEditarUnidad}
            onEliminar={handleEliminarUnidad}
            loading={loading}
          />
        ) : (
          <FormularioUMCompra
            umEditar={umEditar}
            onSubmit={handleSubmitFormulario}
            onCancelar={handleCancelarFormulario}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
};
