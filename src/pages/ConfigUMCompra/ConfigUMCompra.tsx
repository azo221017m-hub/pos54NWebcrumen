import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Scale } from 'lucide-react';
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
      {/* Mensajes */}
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
        <button 
          className="btn-volver" 
          onClick={() => navigate('/dashboard')}
          title="Volver al Dashboard"
        >
          <ArrowLeft size={20} />
          Volver al Dashboard
        </button>
        
        <div className="config-header-content">
          <div className="config-title">
            <Scale size={32} className="config-icon" />
            <div>
              <h1>Configuración de Unidades de Medida</h1>
              <p>Administra las unidades de medida de compra</p>
            </div>
          </div>
          {vista === 'lista' && (
            <button className="btn-nuevo" onClick={handleNuevaUnidad}>
              <Plus size={20} />
              Nueva Unidad
            </button>
          )}
        </div>
      </div>

      {/* Contenedor fijo sin scroll */}
      <div className="config-container">
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
