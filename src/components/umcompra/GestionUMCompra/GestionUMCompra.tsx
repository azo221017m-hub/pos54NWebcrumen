import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Scale } from 'lucide-react';
import { ListaUMCompra } from '../ListaUMCompra/ListaUMCompra';
import { FormularioUMCompra } from '../FormularioUMCompra/FormularioUMCompra';
import type { UMCompra, UMCompraFormData } from '../../../types/umcompra.types';
import {
  obtenerUMCompras,
  crearUMCompra,
  actualizarUMCompra,
  eliminarUMCompra,
  validarNombreUnico
} from '../../../services/umcompraService';
import './GestionUMCompra.css';

type Vista = 'lista' | 'formulario';

export const GestionUMCompra: React.FC = () => {
  const [unidades, setUnidades] = useState<UMCompra[]>([]);
  const [vista, setVista] = useState<Vista>('lista');
  const [umEditar, setUmEditar] = useState<UMCompra | null>(null);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null);

  // Contador total
  const totalUnidades = unidades.length;

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

  const mostrarMensaje = (tipo: 'success' | 'error', texto: string) => {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje(null), 5000);
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
    <div className="gestion-umcompra-container">
      {/* Mensajes */}
      {mensaje && (
        <div className={`mensaje-alerta ${mensaje.tipo}`}>
          {mensaje.texto}
        </div>
      )}

      {/* Vista Lista - Siempre renderizada, controlada por CSS */}
      <div style={{ display: vista === 'lista' ? 'block' : 'none' }}>
        {/* Header con contador */}
        <div className="gestion-umcompra-header">
          <div className="header-info">
            <div className="header-title">
              <Scale size={32} />
              <h2>Gestión de Unidades de Medida</h2>
            </div>
            <div className="header-contadores">
              <div className="contador total">
                <span className="contador-numero">{totalUnidades}</span>
                <span className="contador-label">Total Unidades</span>
              </div>
            </div>
          </div>
          <button className="btn-nueva-unidad" onClick={handleNuevaUnidad}>
            <Plus size={20} />
            Nueva Unidad
          </button>
        </div>

        {/* Lista de unidades */}
        <div className="umcompra-scroll-container">
          <ListaUMCompra
            unidades={unidades}
            onEditar={handleEditarUnidad}
            onEliminar={handleEliminarUnidad}
            loading={loading}
          />
        </div>
      </div>

      {/* Vista Formulario - Siempre renderizada, controlada por CSS */}
      <div style={{ display: vista === 'formulario' ? 'block' : 'none' }}>
        {/* Header del formulario */}
        <div className="gestion-umcompra-header">
          <div className="header-info">
            <h2>{umEditar ? 'Editar Unidad de Medida' : 'Nueva Unidad de Medida'}</h2>
          </div>
        </div>

        {/* Formulario */}
        <FormularioUMCompra
          umEditar={umEditar}
          onSubmit={handleSubmitFormulario}
          onCancelar={handleCancelarFormulario}
          loading={loading}
        />
      </div>
    </div>
  );
};
