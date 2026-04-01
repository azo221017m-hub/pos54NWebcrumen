import React, { useState, useEffect, useCallback } from 'react';
import { Plus } from 'lucide-react';
import StandardPageLayout from '../../components/StandardPageLayout/StandardPageLayout';
import type { MovimientoConDetalles, MovimientoCreate } from '../../types/movimientos.types';
import {
  obtenerMovimientos,
  crearMovimiento,
  actualizarMovimiento,
  eliminarMovimiento
} from '../../services/movimientosService';
import FormularioMovimiento from '../../components/movimientos/FormularioMovimiento/FormularioMovimiento';
import ListaMovimientos from '../../components/movimientos/ListaMovimientos/ListaMovimientos';
import '../../styles/StandardPageLayout.css';

const MovimientosInventario: React.FC = () => {
  const [movimientos, setMovimientos] = useState<MovimientoConDetalles[]>([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [movimientoEditar, setMovimientoEditar] = useState<MovimientoConDetalles | null>(null);
  const [mensaje, setMensaje] = useState<{
    tipo: 'success' | 'error' | 'info';
    texto: string;
  } | null>(null);
  const privilegio = Number(localStorage.getItem('privilegio') || '0');

  const mostrarMensaje = useCallback((tipo: 'success' | 'error' | 'info', texto: string) => {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje(null), 4000);
  }, []);

  const cargarMovimientos = useCallback(async () => {
    try {
      setCargando(true);
      const data = await obtenerMovimientos();
      setMovimientos(data);
    } catch (error) {
      console.error('Error al cargar movimientos:', error);
      mostrarMensaje('error', 'Error al cargar los movimientos');
      setMovimientos([]);
    } finally {
      setCargando(false);
    }
  }, [mostrarMensaje]);

  useEffect(() => {
    cargarMovimientos();
  }, [cargarMovimientos]);

  const abrirNuevoMovimiento = () => {
    setMovimientoEditar(null);
    setMostrarFormulario(true);
  };

  const abrirEditarMovimiento = async (id: number) => {
    const movimiento = movimientos.find((m) => m.idmovimiento === id);
    if (movimiento) {
      setMovimientoEditar(movimiento);
      setMostrarFormulario(true);
    }
  };

  const handleGuardar = async (data: MovimientoCreate) => {
    try {
      if (movimientoEditar) {
        // Actualizar
        const movimientoActualizado = await actualizarMovimiento(movimientoEditar.idmovimiento, {
          motivomovimiento: data.motivomovimiento,
          observaciones: data.observaciones,
          estatusmovimiento: data.estatusmovimiento
        });
        mostrarMensaje('success', 'Movimiento actualizado correctamente');
        setMostrarFormulario(false);
        setMovimientoEditar(null);
        // Actualizar estado local sin recargar
        setMovimientos(prev =>
          prev.map(mov =>
            mov.idmovimiento === movimientoActualizado.idmovimiento ? movimientoActualizado : mov
          )
        );
      } else {
        // Crear
        const nuevoMovimiento = await crearMovimiento(data);
        mostrarMensaje('success', 'Movimiento creado correctamente');
        setMostrarFormulario(false);
        // Actualizar estado local sin recargar
        setMovimientos(prev => [...prev, nuevoMovimiento]);
      }
    } catch (error) {
      console.error('Error al guardar movimiento:', error);
      const mensaje = error instanceof Error ? error.message : 'Error al guardar el movimiento';
      mostrarMensaje('error', mensaje);
    }
  };

  const handleCancelar = () => {
    setMostrarFormulario(false);
    setMovimientoEditar(null);
  };

  const handleEliminar = async (id: number) => {
    if (privilegio < 5) {
      mostrarMensaje('error', 'No tiene privilegios suficientes para eliminar registros');
      return;
    }
    if (!window.confirm('¿Está seguro de que desea eliminar este movimiento?')) {
      return;
    }

    try {
      await eliminarMovimiento(id);
      mostrarMensaje('success', 'Movimiento eliminado correctamente');
      // Actualizar estado local sin recargar
      setMovimientos(prev => prev.filter(mov => mov.idmovimiento !== id));
    } catch (error) {
      console.error('Error al eliminar movimiento:', error);
      const mensaje = error instanceof Error ? error.message : 'Error al eliminar el movimiento';
      mostrarMensaje('error', mensaje);
    }
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
        headerTitle="Movimientos de Inventario"
        headerSubtitle="Gestiona las entradas y salidas del inventario"
        actionButton={{
          text: 'Nuevo Movimiento',
          icon: <Plus size={20} />,
          onClick: abrirNuevoMovimiento
        }}
        loading={cargando}
        loadingMessage="Cargando movimientos..."
      >
        <ListaMovimientos
          movimientos={movimientos}
          onEditar={abrirEditarMovimiento}
          onEliminar={handleEliminar}
        />
      </StandardPageLayout>

      {/* Formulario Modal */}
      {mostrarFormulario && (
        <FormularioMovimiento
          movimiento={movimientoEditar}
          onGuardar={handleGuardar}
          onCancelar={handleCancelar}
          mensaje={mensaje}
          isEditMode={!!movimientoEditar}
          onAplicar={cargarMovimientos}
        />
      )}
    </>
  );
};

export default MovimientosInventario;
