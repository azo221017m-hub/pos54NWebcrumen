import React, { useState, useEffect, useCallback } from 'react';
import { Plus } from 'lucide-react';
import StandardPageLayout from '../../components/StandardPageLayout/StandardPageLayout';
import type { Gasto, GastoCreate } from '../../types/gastos.types';
import {
  obtenerGastos,
  crearGasto,
  actualizarGasto
} from '../../services/gastosService';
import FormularioGastos from '../../components/gastos/FormularioGastos/FormularioGastos';
import ListaGastos from '../../components/gastos/ListaGastos/ListaGastos';
import '../../styles/StandardPageLayout.css';

const PageGastos: React.FC = () => {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [gastoEditar, setGastoEditar] = useState<Gasto | null>(null);
  const [mensaje, setMensaje] = useState<{
    tipo: 'success' | 'error' | 'info';
    texto: string;
  } | null>(null);

  const mostrarMensaje = useCallback((tipo: 'success' | 'error' | 'info', texto: string) => {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje(null), 4000);
  }, []);

  const cargarGastos = useCallback(async () => {
    try {
      setCargando(true);
      const data = await obtenerGastos();
      setGastos(data);
    } catch (error) {
      console.error('Error al cargar gastos:', error);
      mostrarMensaje('error', 'Error al cargar los gastos');
      setGastos([]);
    } finally {
      setCargando(false);
    }
  }, [mostrarMensaje]);

  useEffect(() => {
    cargarGastos();
  }, [cargarGastos]);

  const abrirNuevoGasto = () => {
    setGastoEditar(null);
    setMostrarFormulario(true);
  };

  const handleGuardar = async (data: GastoCreate) => {
    try {
      if (gastoEditar) {
        // Actualizar
        const gastoActualizado = await actualizarGasto(gastoEditar.idventa, data);
        mostrarMensaje('success', 'Gasto actualizado correctamente');
        setMostrarFormulario(false);
        setGastoEditar(null);
        // Actualizar estado local sin recargar
        setGastos(prev =>
          prev.map(gasto =>
            gasto.idventa === gastoActualizado.idventa ? gastoActualizado : gasto
          )
        );
      } else {
        // Crear
        const nuevoGasto = await crearGasto(data);
        mostrarMensaje('success', 'Gasto creado correctamente');
        setMostrarFormulario(false);
        // Actualizar estado local sin recargar
        setGastos(prev => [...prev, nuevoGasto]);
      }
    } catch (error) {
      console.error('Error al guardar gasto:', error);
      const mensaje = error instanceof Error ? error.message : 'Error al guardar el gasto';
      mostrarMensaje('error', mensaje);
    }
  };

  const handleCancelar = () => {
    setMostrarFormulario(false);
    setGastoEditar(null);
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
        headerTitle="Gastos"
        headerSubtitle="Registra y gestiona los gastos del negocio"
        actionButton={{
          text: 'Nuevo Gasto',
          icon: <Plus size={20} />,
          onClick: abrirNuevoGasto
        }}
        loading={cargando}
        loadingMessage="Cargando gastos..."
      >
        <ListaGastos gastos={gastos} />
      </StandardPageLayout>

      {/* Formulario Modal */}
      {mostrarFormulario && (
        <FormularioGastos
          gasto={gastoEditar}
          onGuardar={handleGuardar}
          onCancelar={handleCancelar}
        />
      )}
    </>
  );
};

export default PageGastos;
