import React from 'react';
import type { Anuncio } from '../../../types/anuncio.types';
import { Megaphone, Edit2, Trash2, CalendarDays, Image } from 'lucide-react';
import './ListaAnuncios.css';

interface ListaAnunciosProps {
  anuncios: Anuncio[];
  onEdit: (anuncio: Anuncio) => void;
  onDelete: (idAnuncio: number) => void;
}

const ListaAnuncios: React.FC<ListaAnunciosProps> = ({ anuncios, onEdit, onDelete }) => {
  const anunciosArray = Array.isArray(anuncios) ? anuncios : [];

  const formatFecha = (fecha: string | null) => {
    if (!fecha) return '-';
    const [year, month, day] = fecha.split('-');
    return `${day}/${month}/${year}`;
  };

  const getImagenesCount = (anuncio: Anuncio) => {
    return [
      anuncio.imagen1Anuncio,
      anuncio.imagen2Anuncio,
      anuncio.imagen3Anuncio,
      anuncio.imagen4Anuncio,
      anuncio.imagen5Anuncio
    ].filter(Boolean).length;
  };

  return (
    <div className="lista-anuncios-container">
      <div className="tabla-wrapper">
        <table className="tabla-anuncios">
          <thead>
            <tr>
              <th>ID</th>
              <th>Título</th>
              <th>Detalle</th>
              <th>Imágenes</th>
              <th>Vigencia</th>
              <th>Modificado por</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {anunciosArray.length === 0 ? (
              <tr>
                <td colSpan={7} className="sin-datos">
                  <Megaphone size={32} className="icono-vacio-inline" />
                  No hay anuncios registrados
                </td>
              </tr>
            ) : (
              anunciosArray.map((anuncio) => (
                <tr key={anuncio.idAnuncio}>
                  <td>{anuncio.idAnuncio}</td>
                  <td className="cell-titulo">{anuncio.tituloDeAnuncio}</td>
                  <td className="cell-detalle">
                    {anuncio.detalleAnuncio
                      ? anuncio.detalleAnuncio.length > 60
                        ? anuncio.detalleAnuncio.substring(0, 60) + '...'
                        : anuncio.detalleAnuncio
                      : <span className="sin-dato">—</span>}
                  </td>
                  <td>
                    <span className="badge-imagenes">
                      <Image size={14} />
                      {getImagenesCount(anuncio)} / 5
                    </span>
                  </td>
                  <td>
                    {anuncio.fechaDeVigencia ? (
                      <span className="badge-vigencia">
                        <CalendarDays size={13} />
                        {formatFecha(anuncio.fechaDeVigencia)}
                      </span>
                    ) : (
                      <span className="sin-dato">—</span>
                    )}
                  </td>
                  <td>{anuncio.usuarioauditoria || '-'}</td>
                  <td>
                    <div className="acciones-btns">
                      <button
                        className="btn-accion btn-editar"
                        onClick={() => onEdit(anuncio)}
                        title="Editar anuncio"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        className="btn-accion btn-eliminar"
                        onClick={() => onDelete(anuncio.idAnuncio)}
                        title="Eliminar anuncio"
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

export default ListaAnuncios;
