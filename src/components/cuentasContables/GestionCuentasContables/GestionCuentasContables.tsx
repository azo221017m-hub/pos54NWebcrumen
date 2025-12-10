import React, { useState, useEffect, useCallback } from 'react';
import type { CuentaContable, CuentaContableCreate, CuentaContableUpdate } from '../../../types/cuentaContable.types';
import {
  obtenerCuentasContables,
  crearCuentaContable,
  actualizarCuentaContable,
  eliminarCuentaContable
} from '../../../services/cuentasContablesService';
import ListaCuentasContables from '../ListaCuentasContables/ListaCuentasContables';
import FormularioCuentaContable from '../FormularioCuentaContable/FormularioCuentaContable';
import { Plus, FileText, Loader } from 'lucide-react';
import './GestionCuentasContables.css';

interface Props {
  idnegocio: number;
}

const GestionCuentasContables: React.FC<Props> = ({ idnegocio }) => {
  const [cuentas, setCuentas] = useState<CuentaContable[]>([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [cuentaEditar, setCuentaEditar] = useState<CuentaContable | null>(null);
  const [mensaje, setMensaje] = useState<{
    tipo: 'success' | 'error' | 'info';
    texto: string;
  } | null>(null);

  const mostrarMensaje = useCallback((tipo: 'success' | 'error' | 'info', texto: string) => {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje(null), 4000);
  }, []);

  const cargarCuentas = useCallback(async () => {
    try {
      console.log('🔷 GestionCuentasContables - Iniciando carga de cuentas...');
      setCargando(true);
      const data = await obtenerCuentasContables(idnegocio);
      console.log('🔷 GestionCuentasContables - Datos recibidos:', data, 'Es array:', Array.isArray(data));
      setCuentas(data);
    } catch (error) {
      console.error('❌ GestionCuentasContables - Error al cargar cuentas:', error);
      mostrarMensaje('error', 'Error al cargar las cuentas contables');
      setCuentas([]);
    } finally {
      setCargando(false);
    }
  }, [idnegocio, mostrarMensaje]);

  useEffect(() => {
    cargarCuentas();
  }, [cargarCuentas]);

  const handleNuevaCuenta = () => {
    setCuentaEditar(null);
    setMostrarFormulario(true);
  };

  const handleEditarCuenta = (cuenta: CuentaContable) => {
    setCuentaEditar(cuenta);
    setMostrarFormulario(true);
  };

  const handleGuardarCuenta = async (cuentaData: CuentaContableCreate) => {
    try {
      if (cuentaEditar) {
        // Actualizar cuenta existente
        const dataUpdate: CuentaContableUpdate = {
          naturalezacuentacontable: cuentaData.naturalezacuentacontable,
          nombrecuentacontable: cuentaData.nombrecuentacontable,
          tipocuentacontable: cuentaData.tipocuentacontable
        };
        await actualizarCuentaContable(cuentaEditar.id_cuentacontable, dataUpdate);
        mostrarMensaje('success', 'Cuenta contable actualizada correctamente');
      } else {
        // Crear nueva cuenta
        await crearCuentaContable(cuentaData);
        mostrarMensaje('success', 'Cuenta contable creada correctamente');
      }
      setMostrarFormulario(false);
      setCuentaEditar(null);
      cargarCuentas();
    } catch (error) {
      console.error('Error al guardar cuenta:', error);
      mostrarMensaje('error', 'Error al guardar la cuenta contable');
    }
  };

  const handleEliminarCuenta = async (id: number) => {
    const cuenta = cuentas.find(c => c.id_cuentacontable === id);
    
    if (!window.confirm(
      `¿Está seguro de eliminar la cuenta "${cuenta?.nombrecuentacontable}"?\n\nEsta acción desactivará la cuenta contable.`
    )) {
      return;
    }

    try {
      await eliminarCuentaContable(id);
      mostrarMensaje('success', 'Cuenta contable eliminada correctamente');
      cargarCuentas();
    } catch (error) {
      console.error('Error al eliminar cuenta:', error);
      mostrarMensaje('error', 'Error al eliminar la cuenta contable');
    }
  };

  const handleCancelarFormulario = () => {
    setMostrarFormulario(false);
    setCuentaEditar(null);
  };

  return (
    <div className="gestion-cuentas-contables">
      {/* Mensaje de Notificación */}
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

      <div className="cuentas-header">
        <div className="cuentas-header-content">
          <div className="cuentas-title">
            <FileText size={32} className="cuentas-icon" />
            <div>
              <h1>Gestión de Cuentas Contables</h1>
              <p>Administra las cuentas contables del sistema</p>
            </div>
          </div>
          <button onClick={handleNuevaCuenta} className="btn-nuevo">
            <Plus size={20} />
            Nueva Cuenta
          </button>
        </div>
      </div>

      <div className="cuentas-content">
        {cargando ? (
          <div className="cuentas-cargando">
            <Loader className="spinner" size={48} />
            <p>Cargando cuentas contables...</p>
          </div>
        ) : (
          <ListaCuentasContables
            cuentas={cuentas}
            onEdit={handleEditarCuenta}
            onDelete={handleEliminarCuenta}
          />
        )}
      </div>

      {mostrarFormulario && (
        <FormularioCuentaContable
          cuenta={cuentaEditar}
          idnegocio={idnegocio}
          onSave={handleGuardarCuenta}
          onCancel={handleCancelarFormulario}
        />
      )}
    </div>
  );
};

export default GestionCuentasContables;
