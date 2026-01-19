import type { Negocio } from '../../../types/negocio.types';
import './ListaNegocios.css';
import { Building2, Phone, MapPin, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';

interface ListaNegociosProps {
  negocios: Negocio[];
  onEditar: (negocio: Negocio) => void;
  onEliminar: (id: number) => void;
  loading?: boolean;
}

export const ListaNegocios = ({ negocios, onEditar, onEliminar, loading }: ListaNegociosProps) => {
  // Helper function to validate if logotipo is a valid image data URI
  const isValidImageDataUri = (logotipo: string | null | undefined): boolean => {
    if (!logotipo || typeof logotipo !== 'string') {
      return false;
    }
    // Check if it's a valid data URI starting with data:image/
    return logotipo.trim().startsWith('data:image/');
  };

  if (loading) {
    return (
      <div className="lista-loading">
        <div className="spinner"></div>
        <p>Cargando negocios...</p>
      </div>
    );
  }

  if (negocios.length === 0) {
    return (
      <div className="lista-vacia">
        <Building2 size={64} className="icono-vacio" />
        <h3>No hay negocios registrados</h3>
        <p>Crea tu primer negocio para comenzar</p>
      </div>
    );
  }

  return (
    <div className="lista-negocios">
      {negocios.map((negocio) => (
        <div key={negocio.idNegocio} className="negocio-card">
          <div className="card-header">
            <div className="card-logo">
              {isValidImageDataUri(negocio.logotipo) ? (
                <img src={negocio.logotipo!} alt={negocio.nombreNegocio} />
              ) : (
                <Building2 size={40} />
              )}
            </div>
            <div className="card-badge">
              {negocio.estatusnegocio === 1 ? (
                <span className="badge-activo">
                  <CheckCircle size={16} />
                  Activo
                </span>
              ) : (
                <span className="badge-inactivo">
                  <XCircle size={16} />
                  Inactivo
                </span>
              )}
            </div>
          </div>

          <div className="card-body">
            <h3 className="card-titulo">{negocio.nombreNegocio}</h3>
            <p className="card-numero">#{negocio.numeronegocio}</p>

            <div className="card-info">
              <div className="info-item">
                <Building2 size={18} />
                <span>RFC: {negocio.rfcnegocio}</span>
              </div>

              <div className="info-item">
                <Phone size={18} />
                <span>{negocio.telefonocontacto}</span>
              </div>

              <div className="info-item">
                <MapPin size={18} />
                <span className="info-truncate">{negocio.direccionfiscalnegocio}</span>
              </div>
            </div>

            <div className="card-contacto">
              <strong>Contacto:</strong> {negocio.contactonegocio}
            </div>
          </div>

          <div className="card-footer">
            <button
              className="btn-accion btn-editar"
              onClick={() => {
                console.log('✏️ Editando negocio:', negocio);
                onEditar(negocio);
              }}
              title="Editar negocio"
            >
              <Edit size={16} />
              Editar
            </button>
            <button
              className="btn-accion btn-eliminar"
              onClick={() => {
                if (negocio.idNegocio) {
                  console.log('🗑️ Eliminando negocio:', negocio);
                  onEliminar(negocio.idNegocio);
                }
              }}
              title="Eliminar negocio"
            >
              <Trash2 size={16} />
              Eliminar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
