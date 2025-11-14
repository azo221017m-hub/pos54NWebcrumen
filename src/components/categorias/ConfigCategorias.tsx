// Componente principal para gestión de categorías
import { useState, useEffect } from 'react';
import axios from 'axios';
import CategoriaList from './CategoriaList';
import ModalCategoria from './ModalCategoria';
import '../../styles/categorias/ConfigCategorias.css';
import type { Categoria } from '../../types/categoria';

import type { ScreenType } from '../../types';

interface Props {
  onNavigate?: (screen: ScreenType) => void;
}

export default function ConfigCategorias({ onNavigate }: Props) {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editCategoria, setEditCategoria] = useState<Categoria | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Fetch categorias
  useEffect(() => {
    fetchCategorias();
  }, []);

  const fetchCategorias = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:4000/api/categorias');
      setCategorias(res.data.data || []);
    } catch (err) {
      setMessage('Error al cargar categorías');
    } finally {
      setLoading(false);
    }
  };

  // Abrir modal para agregar/editar
  const handleAdd = () => {
    setEditCategoria(null);
    setShowModal(true);
  };
  const handleEdit = (cat: Categoria) => {
    setEditCategoria(cat);
    setShowModal(true);
  };

  // Guardar categoría (add/edit)
  const handleSave = async (formData: FormData, isEdit: boolean, idEdit?: number) => {
    try {
      setMessage(null);
      if (isEdit && idEdit) {
        await axios.put(`http://localhost:4000/api/categorias/${idEdit}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setMessage('Categoría actualizada');
      } else {
        await axios.post('http://localhost:4000/api/categorias', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setMessage('Categoría creada');
      }
      setShowModal(false);
      fetchCategorias();
    } catch (err) {
      setMessage('Error al guardar categoría');
    }
  };

  // Render
  return (
    <div className="config-screen">
      <div className="config-container">
        <div className="config-header">
          <button className="btn-regresar" onClick={() => onNavigate && onNavigate('tablero-inicial')}>
            ← Regresar a TableroInicial
          </button>
          <h2 style={{ margin: 0 }}>Categorías</h2>
          <button className="btn-add" onClick={handleAdd}>Agregar Categoría</button>
        </div>
        {message && <div className="msg-categorias">{message}</div>}
        {loading ? (
          <div className="loading-categorias">Cargando...</div>
        ) : (
          <CategoriaList categorias={categorias} onEdit={handleEdit} />
        )}
        {showModal && (
          <ModalCategoria
            categoria={editCategoria}
            onClose={() => setShowModal(false)}
            onSave={handleSave}
          />
        )}
      </div>
    </div>
  );
}
