import type { Negocio } from '../../../types/negocio.types';
import './ListaNegocios.css';
import { Building2, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';

interface ListaNegociosProps {
  negocios: Negocio[];
  onEditar: (negocio: Negocio) => void;
  onEliminar: (id: number) => void;
  loading?: boolean;
}

// Helper function to validate if logotipo is a valid image data URI
const isValidImageDataUri = (logotipo: string | null | undefined): logotipo is string => {
  if (!logotipo || typeof logotipo !== 'string') {
    return false;
  }
  // Check if it's a valid Base64 data URI with proper format
  // Supports common image types: jpeg, png, gif, webp, bmp, svg+xml
  return /^data:image\/(jpeg|png|gif|webp|bmp|svg\+xml);base64,/.test(logotipo.trim());
};

export const ListaNegocios = ({ negocios, onEditar, onEliminar, loading }: ListaNegociosProps) => {
  if (loading) {
    return (
      <div className="lista-loading">
        <div className="spinner"></div>
        <p>Cargando negocios...</p>
      </div>
    );
  }

  return (
    <div className="lista-negocios-container">
      <div className="tabla-wrapper">
        <table className="tabla-negocios">
          <thead>
            <tr>
              <th>Logo</th>
              <th>Nombre</th>
              <th>RFC</th>
              <th>Teléfono</th>
              <th>Contacto</th>
              <th>Dirección</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {negocios.length === 0 ? (
              <tr>
                <td colSpan={8} className="sin-datos">
                  <Building2 size={32} className="icono-vacio-inline" />
                  No hay negocios registrados
                </td>
              </tr>
            ) : (
              negocios.map((negocio) => (
                <tr key={negocio.idNegocio}>
                  <td>
                    {isValidImageDataUri(negocio.logotipo) ? (
                      <img src={negocio.logotipo} alt={negocio.nombreNegocio} className="negocio-logo-thumb" />
                    ) : (
                      <div className="negocio-logo-placeholder">
                        <Building2 size={20} />
                      </div>
                    )}
                  </td>
                  <td className="cell-nombre">
                    {negocio.nombreNegocio}
                    {negocio.numeronegocio && (
                      <span className="cell-sub">#{negocio.numeronegocio}</span>
                    )}
                  </td>
                  <td>{negocio.rfcnegocio || '-'}</td>
                  <td>{negocio.telefonocontacto || '-'}</td>
                  <td>{negocio.contactonegocio || '-'}</td>
                  <td className="cell-direccion">{negocio.direccionfiscalnegocio || '-'}</td>
                  <td>
                    {negocio.estatusnegocio === 1 ? (
                      <span className="badge badge-activo">
                        <CheckCircle size={13} /> Activo
                      </span>
                    ) : (
                      <span className="badge badge-inactivo">
                        <XCircle size={13} /> Inactivo
                      </span>
                    )}
                  </td>
                  <td>
                    <div className="acciones-btns">
                      <button
                        className="btn-accion btn-editar"
                        onClick={() => onEditar(negocio)}
                        title="Editar negocio"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className="btn-accion btn-eliminar"
                        onClick={() => {
                          if (negocio.idNegocio) onEliminar(negocio.idNegocio);
                        }}
                        title="Eliminar negocio"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
