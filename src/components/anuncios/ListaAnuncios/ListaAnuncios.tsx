import React from 'react';
import { Edit2, Trash2, Calendar, Image } from 'lucide-react';
import type { Anuncio } from '../../../types/anuncio.types';
import './ListaAnuncios.css';

interface Props {
  anuncios: Anuncio[];
  onEditar: (anuncio: Anuncio) => void;
  onEliminar: (id: number) => void;
}

const ListaAnuncios: React.FC<Props> = ({ anuncios, onEditar, onEliminar }) => {
  const contarImagenes = (anuncio: Anuncio): number => {
    return [
      anuncio.imagen1Anuncio,
      anuncio.imagen2Anuncio,
      anuncio.imagen3Anuncio,
      anuncio.imagen4Anuncio,
      anuncio.imagen5Anuncio
    ].filter(Boolean).length;
  };

  const formatearFecha = (fecha: string | null): string => {
    if (!fecha) return '—';
    const [year, month, day] = fecha.split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="lista-anuncios">
      <table className="tabla-anuncios">
        <thead>
          <tr>
            <th>ID</th>
            <th>Título</th>
            <th>Detalle</th>
            <th>Imágenes</th>
            <th>Vigencia</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {anuncios.map((anuncio) => (
            <tr key={anuncio.idAnuncio}>
              <td className="col-id">{anuncio.idAnuncio}</td>
              <td className="col-titulo">{anuncio.tituloDeAnuncio}</td>
              <td className="col-detalle">
                <span className="detalle-texto">
                  {anuncio.detalleAnuncio || '—'}
                </span>
              </td>
              <td className="col-imagenes">
                <span className="badge-imagenes">
                  <Image size={14} />
                  {contarImagenes(anuncio)}
                </span>
              </td>
              <td className="col-vigencia">
                <span className="vigencia-fecha">
                  <Calendar size={14} />
                  {formatearFecha(anuncio.fechaDeVigencia)}
                </span>
              </td>
              <td className="col-acciones">
                <button
                  className="btn-editar"
                  onClick={() => onEditar(anuncio)}
                  title="Editar anuncio"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  className="btn-eliminar"
                  onClick={() => onEliminar(anuncio.idAnuncio)}
                  title="Eliminar anuncio"
                >
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ListaAnuncios;
