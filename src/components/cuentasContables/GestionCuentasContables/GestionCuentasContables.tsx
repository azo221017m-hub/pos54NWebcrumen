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
          tipocuentacontable: cuentaData.tipocuentacontable,
          usuarioauditoria: cuentaData.usuarioauditoria
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
    if (!window.confirm('¿Está seguro de eliminar esta cuenta contable?')) {
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
      <div className="gestion-header">
        <div className="header-info">
          <FileText size={32} className="header-icon" />
          <div>
            <h2>Cuentas Contables</h2>
            <p>Gestiona las cuentas contables del sistema</p>
          </div>
        </div>
        <button className="btn-nueva-cuenta" onClick={handleNuevaCuenta}>
          <Plus size={20} />
          Nueva Cuenta
        </button>
      </div>

      {mensaje && (
        <div className={`mensaje-alerta ${mensaje.tipo}`}>
          {mensaje.texto}
        </div>
      )}

      {cargando ? (
        <div className="loading-container">
          <Loader size={48} className="spinner" />
          <p>Cargando cuentas contables...</p>
        </div>
      ) : (
        <ListaCuentasContables
          cuentas={cuentas}
          onEdit={handleEditarCuenta}
          onDelete={handleEliminarCuenta}
        />
      )}

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
