import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Package } from 'lucide-react';
import type { MovimientoConDetalles, MovimientoCreate } from '../../types/movimientos.types';
import {
  obtenerMovimientos,
  crearMovimiento,
  actualizarMovimiento
} from '../../services/movimientosService';
import ListaMovimientos from '../../components/movimientos/ListaMovimientos/ListaMovimientos';
import FormularioMovimiento from '../../components/movimientos/FormularioMovimiento/FormularioMovimiento';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import './MovimientosInventario.css';

const MovimientosInventario: React.FC = () => {
  const navigate = useNavigate();
  const [movimientos, setMovimientos] = useState<MovimientoConDetalles[]>([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [movimientoEditar, setMovimientoEditar] = useState<MovimientoConDetalles | null>(null);
  const [mensaje, setMensaje] = useState<{
    tipo: 'success' | 'error' | 'info';
    texto: string;
  } | null>(null);

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
        await actualizarMovimiento(movimientoEditar.idmovimiento, {
          motivomovimiento: data.motivomovimiento,
          observaciones: data.observaciones,
          estatusmovimiento: data.estatusmovimiento
        });
        mostrarMensaje('success', 'Movimiento actualizado correctamente');
      } else {
        // Crear
        await crearMovimiento(data);
        mostrarMensaje('success', 'Movimiento creado correctamente');
      }
      setMostrarFormulario(false);
      setMovimientoEditar(null);
      cargarMovimientos();
    } catch (error: any) {
      console.error('Error al guardar movimiento:', error);
      const mensaje = error?.response?.data?.message || 'Error al guardar el movimiento';
      mostrarMensaje('error', mensaje);
    }
  };

  const handleCancelar = () => {
    setMostrarFormulario(false);
    setMovimientoEditar(null);
  };

  return (
    <div className="movimientos-inventario-page">
      {/* Header */}
      <header className="page-header">
        <div className="header-content">
          <button className="btn-volver" onClick={() => navigate('/dashboard')}>
            <ArrowLeft size={20} />
            Volver
          </button>

          <div className="header-info">
            <div className="header-icon">
              <Package size={32} />
            </div>
            <div className="header-text">
              <h1>Movimientos de Inventario</h1>
              <p>Gestiona las entradas y salidas del inventario</p>
            </div>
          </div>

          <button className="btn-nuevo" onClick={abrirNuevoMovimiento}>
            <Plus size={20} />
            Nuevo Movimiento
          </button>
        </div>
      </header>

      {/* Mensajes */}
      {mensaje && (
        <div className={`mensaje mensaje-${mensaje.tipo}`}>
          {mensaje.texto}
        </div>
      )}

      {/* Contenido */}
      <main className="page-content">
        {cargando ? (
          <LoadingSpinner size={48} message="Cargando movimientos..." />
        ) : (
          <ListaMovimientos
            movimientos={movimientos}
            onEditar={abrirEditarMovimiento}
          />
        )}
      </main>

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
    </div>
  );
};

export default MovimientosInventario;
