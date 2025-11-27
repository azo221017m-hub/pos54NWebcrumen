import React from 'react';
import type { CuentaContable } from '../../../types/cuentaContable.types';
import { Edit2, Trash2, FileText, Tag } from 'lucide-react';
import './ListaCuentasContables.css';

interface Props {
  cuentas: CuentaContable[];
  onEdit: (cuenta: CuentaContable) => void;
  onDelete: (id: number) => void;
}

const ListaCuentasContables: React.FC<Props> = ({ cuentas, onEdit, onDelete }) => {
  console.log('🟢 ListaCuentasContables - Props recibido:', cuentas, 'Es array:', Array.isArray(cuentas));
  const cuentasArray = Array.isArray(cuentas) ? cuentas : [];
  
  if (cuentasArray.length === 0) {
    return (
      <div className="lista-cuentas-vacia">
        <FileText size={64} className="icono-vacio" />
        <h3>No hay cuentas contables registradas</h3>
        <p>Comienza agregando una nueva cuenta contable</p>
      </div>
    );
  }

  const getNaturalezaColor = (naturaleza: string) => {
    return naturaleza === 'COMPRA' ? 'naturaleza-compra' : 'naturaleza-gasto';
  };

  return (
    <div className="lista-cuentas-contables">
      {cuentasArray.map((cuenta) => (
        <div key={cuenta.id_cuentacontable} className="cuenta-card">
          <div className="cuenta-card-header">
            <div className="cuenta-title-section">
              <h3 className="cuenta-nombre">{cuenta.nombrecuentacontable}</h3>
              <span className={`naturaleza-badge ${getNaturalezaColor(cuenta.naturalezacuentacontable)}`}>
                <Tag size={14} />
                {cuenta.naturalezacuentacontable}
              </span>
            </div>
            <div className="cuenta-acciones">
              <button
                className="btn-accion btn-editar"
                onClick={() => onEdit(cuenta)}
                title="Editar"
              >
                <Edit2 size={18} />
              </button>
              <button
                className="btn-accion btn-eliminar"
                onClick={() => onDelete(cuenta.id_cuentacontable)}
                title="Eliminar"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>

          <div className="cuenta-card-body">
            <div className="cuenta-info-row">
              <span className="info-label">Tipo de Cuenta:</span>
              <span className="info-value">{cuenta.tipocuentacontable}</span>
            </div>

            {cuenta.usuarioauditoria && (
              <div className="cuenta-info-row">
                <span className="info-label">Usuario:</span>
                <span className="info-value usuario">{cuenta.usuarioauditoria}</span>
              </div>
            )}
          </div>

          <div className="cuenta-card-footer">
            {cuenta.fechaRegistroauditoria && (
              <span className="fecha-registro">
                Registrada: {new Date(cuenta.fechaRegistroauditoria).toLocaleDateString('es-MX')}
              </span>
            )}
            {cuenta.fechamodificacionauditoria && (
              <span className="fecha-modificacion">
                Modificada: {new Date(cuenta.fechamodificacionauditoria).toLocaleDateString('es-MX')}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ListaCuentasContables;
