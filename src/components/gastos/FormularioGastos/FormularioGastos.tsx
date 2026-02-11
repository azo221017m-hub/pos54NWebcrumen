import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Gasto, GastoCreate } from '../../../types/gastos.types';
import type { CuentaContable } from '../../../types/cuentaContable.types';
import { obtenerCuentasContables } from '../../../services/cuentasContablesService';
import './FormularioGastos.css';

interface Props {
  gasto: Gasto | null;
  onGuardar: (data: GastoCreate) => Promise<void>;
  onCancelar: () => void;
}

const FormularioGastos: React.FC<Props> = ({ gasto, onGuardar, onCancelar }) => {
  const [importegasto, setImporteGasto] = useState<string>('');
  const [tipodegasto, setTipoDeGasto] = useState<string>('');
  const [descripcionmov, setDescripcionMov] = useState<string>('');
  const [cuentasGasto, setCuentasGasto] = useState<CuentaContable[]>([]);
  const [cargandoCuentas, setCargandoCuentas] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string>('');

  // Cargar cuentas de gasto al montar el componente
  useEffect(() => {
    const cargarCuentasGasto = async () => {
      try {
        setCargandoCuentas(true);
        const cuentas = await obtenerCuentasContables('GASTO');
        setCuentasGasto(cuentas);
      } catch (error) {
        console.error('Error al cargar tipos de gasto (cuentas contables):', error);
        setError('Error al cargar tipos de gasto');
      } finally {
        setCargandoCuentas(false);
      }
    };

    cargarCuentasGasto();
  }, []);

  // Cargar datos del gasto en caso de edición
  useEffect(() => {
    if (gasto) {
      setImporteGasto(gasto.subtotal.toString());
      setTipoDeGasto(gasto.referencia || '');
      setDescripcionMov(gasto.descripcionmov || '');
    } else {
      setImporteGasto('');
      setTipoDeGasto('');
      setDescripcionMov('');
    }
  }, [gasto]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validaciones
    const importeNum = parseFloat(importegasto);
    if (isNaN(importeNum) || importeNum <= 0) {
      setError('El importe debe ser mayor a 0');
      return;
    }

    if (!tipodegasto.trim()) {
      setError('El tipo de gasto es requerido');
      return;
    }

    setGuardando(true);
    try {
      await onGuardar({
        importegasto: importeNum,
        tipodegasto: tipodegasto.trim(),
        descripcionmov: descripcionmov.trim() || undefined
      });
    } catch (error: any) {
      console.error('Error al guardar gasto:', error);
      setError(error?.response?.data?.message || 'Error al guardar el gasto');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="modal-overlay-gastos">
      <div className="modal-content-gastos">
        {/* Header */}
        <div className="modal-header-gastos">
          <h2>{gasto ? 'Editar Gasto' : 'Nuevo Gasto'}</h2>
          <button
            type="button"
            className="btn-close-gastos"
            onClick={onCancelar}
            disabled={guardando}
          >
            <X size={24} />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="form-gastos">
          {error && (
            <div className="error-message-gastos">
              {error}
            </div>
          )}

          <div className="form-group-gastos">
            <label htmlFor="tipodegasto">Tipo de Gasto *</label>
            <select
              id="tipodegasto"
              value={tipodegasto}
              onChange={(e) => setTipoDeGasto(e.target.value)}
              disabled={guardando || cargandoCuentas}
              required
              autoFocus
            >
              <option value="">Seleccione un tipo de gasto</option>
              {cuentasGasto.map((cuenta) => (
                <option key={cuenta.id_cuentacontable} value={cuenta.nombrecuentacontable}>
                  {cuenta.nombrecuentacontable}
                </option>
              ))}
            </select>
            {cargandoCuentas && (
              <small className="texto-ayuda-gastos">Cargando tipos de gasto...</small>
            )}
            {!cargandoCuentas && cuentasGasto.length === 0 && (
              <small className="texto-ayuda-gastos">
                No hay tipos de gasto configurados. Configure cuentas contables primero.
              </small>
            )}
          </div>

          <div className="form-group-gastos">
            <label htmlFor="descripcionmov">Descripción</label>
            <textarea
              id="descripcionmov"
              value={descripcionmov}
              onChange={(e) => setDescripcionMov(e.target.value)}
              placeholder="Descripción del gasto (opcional)"
              rows={3}
              disabled={guardando}
              className="textarea-gastos"
            />
            <small className="texto-ayuda-gastos">
              Agregue detalles adicionales sobre este gasto
            </small>
          </div>

          <div className="form-group-gastos">
            <label htmlFor="importegasto">Importe del Gasto *</label>
            <input
              type="number"
              id="importegasto"
              value={importegasto}
              onChange={(e) => setImporteGasto(e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0.01"
              disabled={guardando}
              required
            />
          </div>

          {/* Botones */}
          <div className="form-actions-gastos">
            <button
              type="button"
              className="btn-cancelar-gastos"
              onClick={onCancelar}
              disabled={guardando}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-guardar-gastos"
              disabled={guardando}
            >
              {guardando ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormularioGastos;
