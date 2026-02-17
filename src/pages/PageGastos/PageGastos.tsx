import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Receipt } from 'lucide-react';
import type { Gasto, GastoCreate } from '../../types/gastos.types';
import {
  obtenerGastos,
  crearGasto,
  actualizarGasto
} from '../../services/gastosService';
import ListaGastos from '../../components/gastos/ListaGastos/ListaGastos';
import FormularioGastos from '../../components/gastos/FormularioGastos/FormularioGastos';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import './PageGastos.css';

const PageGastos: React.FC = () => {
  const navigate = useNavigate();
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
    } catch (error: any) {
      console.error('Error al guardar gasto:', error);
      const mensaje = error?.response?.data?.message || 'Error al guardar el gasto';
      mostrarMensaje('error', mensaje);
    }
  };

  const handleCancelar = () => {
    setMostrarFormulario(false);
    setGastoEditar(null);
  };

  return (
    <div className="page-gastos">
      {/* Header */}
      <header className="page-header-gastos">
        <div className="header-content-gastos">
          <button className="btn-volver-gastos" onClick={() => navigate('/dashboard')}>
            <ArrowLeft size={20} />
            Volver
          </button>

          <div className="header-info-gastos">
            <div className="header-icon-gastos">
              <Receipt size={32} />
            </div>
            <div className="header-text-gastos">
              <h1>Gastos</h1>
              <p>Registra y gestiona los gastos del negocio</p>
            </div>
          </div>

          <button className="btn-nuevo-gastos" onClick={abrirNuevoGasto}>
            <Plus size={20} />
            Nuevo Gasto
          </button>
        </div>
      </header>

      {/* Mensajes */}
      {mensaje && (
        <div className={`mensaje-gastos mensaje-${mensaje.tipo}`}>
          {mensaje.texto}
        </div>
      )}

      {/* Contenido */}
      <main className="page-content-gastos">
        {cargando ? (
          <LoadingSpinner size={48} message="Cargando gastos..." />
        ) : (
          <ListaGastos
            gastos={gastos}
          />
        )}
      </main>

      {/* Formulario Modal */}
      {mostrarFormulario && (
        <FormularioGastos
          gasto={gastoEditar}
          onGuardar={handleGuardar}
          onCancelar={handleCancelar}
        />
      )}
    </div>
  );
};

export default PageGastos;
