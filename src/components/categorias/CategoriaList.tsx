// Listado de categorías
//
import type { Categoria } from '../../types/categoria';

interface Props {
  categorias: Categoria[];
  onEdit: (cat: Categoria) => void;
}

export default function CategoriaList({ categorias, onEdit }: Props) {
  return (
    <div className="categoria-list">
      <div className="grid-categorias">
        {categorias.length === 0 ? (
          <div>No hay categorías registradas.</div>
        ) : (
          categorias.map(cat => (
            <div key={cat.idCategoria} className="card-categoria">
              <div className="img-categoria">
                {cat.imagencategoria ? (
                  <img src={`http://localhost:4000${cat.imagencategoria}`} alt={cat.nombre} style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div className="img-placeholder">sin img</div>
                )}
              </div>
              <div className="info-categoria">
                <h4>{cat.nombre}</h4>
                <p>{cat.descripcion}</p>
                <span className={cat.estatus === 1 ? 'activo' : 'inactivo'}>{cat.estatus === 1 ? 'Activo' : 'Inactivo'}</span>
                <button className="btn-edit" onClick={() => onEdit(cat)}>Editar</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
