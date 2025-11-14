// Modal para formulario de categoría
import { useState } from 'react';
import type { Categoria } from '../../types/categoria';

interface Props {
  categoria: Categoria | null;
  onClose: () => void;
  onSave: (formData: FormData, isEdit: boolean, idEdit?: number) => void;
}

export default function ModalCategoria({ categoria, onClose, onSave }: Props) {
  const [nombre, setNombre] = useState(categoria?.nombre || '');
  const [descripcion, setDescripcion] = useState(categoria?.descripcion || '');
  const [estatus, setEstatus] = useState(categoria?.estatus ?? 1);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>(categoria?.imagencategoria ? `http://localhost:4000${categoria.imagencategoria}` : '');
  const [usuarioauditoria] = useState('admin');
  const [idnegocio] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : '');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!nombre.trim()) {
      setError('El nombre es obligatorio');
      return;
    }
    const formData = new FormData();
    formData.append('nombre', nombre);
    formData.append('descripcion', descripcion);
    formData.append('estatus', String(estatus));
    formData.append('usuarioauditoria', usuarioauditoria);
    formData.append('idnegocio', String(idnegocio));
    if (file) formData.append('imagencategoria', file);
    onSave(formData, !!categoria, categoria?.idCategoria);
  };

  return (
    <div className="modal-categoria-overlay">
      <div className="modal-categoria">
        <h3>{categoria ? 'Editar Categoría' : 'Agregar Categoría'}</h3>
        <form onSubmit={handleSubmit} className="form-categoria">
          <div className="form-group">
            <label>Nombre *</label>
            <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} maxLength={100} required />
          </div>
          <div className="form-group">
            <label>Imagen</label>
            <input type="file" accept="image/*" onChange={handleFileChange} />
            {preview && (
              <img src={preview} alt="preview" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', marginTop: 8 }} />
            )}
          </div>
          <div className="form-group">
            <label>Descripción</label>
            <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)} rows={3} style={{ resize: 'none' }} />
          </div>
          <div className="form-group">
            <label>Estatus</label>
            <input type="checkbox" checked={estatus === 1} onChange={e => setEstatus(e.target.checked ? 1 : 0)} /> Activo
          </div>
          {error && <div className="error-categoria">{error}</div>}
          <div className="form-actions">
            <button type="button" onClick={onClose}>Cancelar</button>
            <button type="submit">{categoria ? 'Actualizar' : 'Crear'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
