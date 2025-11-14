  // Utilidad para formatear fecha
  function formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
// src/components/ConfigCategorias.tsx
// Componente para gestionar categorías de productos con diseño de minicards

import React, { useState, useEffect } from 'react';

import type { ScreenType } from '../types';

// Sin estilos propios

// Interfaz para las categorías según la tabla tblposcrumenwebcategorias
interface Categoria {
  idCategoria: number; // int(11) AI PK
  nombre: string; // varchar(100)
  imagencategoria?: string; // longblob (base64 string para display)
  descripcion?: string; // text
  estatus: number; // tinyint(1) - 1=activo, 0=inactivo
  fechaRegistroauditoria: string; // Fecha/hora de insert
  usuarioauditoria: string; // valor de usuario desde login
  fechamodificacionauditoria: string; // Fecha/hora de update
  idnegocio: number; // valor de usuario desde login
}

// Props del componente
interface ConfigCategoriasProps {
  onNavigate: (screen: ScreenType) => void;
}

const ConfigCategorias: React.FC<ConfigCategoriasProps> = ({ onNavigate }) => {
  // Estados del componente
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Estados del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    estatus: 1,
    imagencategoria: '' // Para almacenar la ruta de imagen
  });

  // Eliminada función getImageUrl y estados no usados
  // Log de montaje del componente
  useEffect(() => {
    // Simulación de carga de categorías
    setTimeout(() => {
      setCategorias([
        {
          idCategoria: 1,
          nombre: 'Ejemplo',
          descripcion: 'Categoría de ejemplo',
          estatus: 1,
          imagencategoria: '',
          fechaRegistroauditoria: new Date().toISOString(),
          usuarioauditoria: 'admin',
          fechamodificacionauditoria: new Date().toISOString(),
          idnegocio: 1
        }
      ]);
      setLoading(false);
    }, 500);
  }, []);

  // Funciones mínimas para evitar errores
  const abrirModalNuevo = () => {
  setShowModal(true);
  setIsEditing(false);
  setFormData({ nombre: '', descripcion: '', estatus: 1, imagencategoria: '' });
  };
  const cerrarModal = () => setShowModal(false);
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  const guardarCategoria = () => { setShowModal(false); };
  const abrirModalEdicion = (cat: Categoria) => {
    setShowModal(true);
    setIsEditing(true);
    setFormData({
      nombre: cat.nombre,
      descripcion: cat.descripcion || '',
      estatus: cat.estatus,
      imagencategoria: cat.imagencategoria || ''
    });
  };
  const eliminarCategoria = (id: number) => {
    setCategorias(prev => prev.filter(c => c.idCategoria !== id));
  };

  return (
    <div>
      <button onClick={() => onNavigate('tablero-inicial')}>Regresar</button>
      <span>Categorías</span>
      <button onClick={abrirModalNuevo} disabled={loading}>Agregar Categoría</button>
      {loading ? (
        <span>Cargando...</span>
      ) : (
        <>
          {categorias.map((categoria) => (
            <div key={categoria.idCategoria}>
              <span>{categoria.nombre}</span>
              <span>{categoria.estatus === 1 ? 'Activo' : 'Inactivo'}</span>
              <span>{categoria.descripcion}</span>
              <span>{categoria.imagencategoria ? categoria.imagencategoria : 'sin img'}</span>
              <span>ID: {categoria.idCategoria} | Negocio: {categoria.idnegocio}</span>
              <span>Creado: {formatearFecha(categoria.fechaRegistroauditoria)}</span>
              <span>Usuario: {categoria.usuarioauditoria || '-'}</span>
              <button onClick={() => abrirModalEdicion(categoria)} disabled={loading}>Editar</button>
              <button onClick={() => eliminarCategoria(categoria.idCategoria)} disabled={loading}>Eliminar</button>
            </div>
          ))}
          {categorias.length === 0 && (
            <div>
              <span>No hay categorías registradas</span>
              <button onClick={abrirModalNuevo}>Crear primera categoría</button>
            </div>
          )}
        </>
      )}
      {showModal && (
        <div onClick={cerrarModal}>
          <div onClick={e => e.stopPropagation()}>
            <span>{isEditing ? 'Editar Categoría' : 'Nueva Categoría'}</span>
            <button onClick={cerrarModal}>✕</button>
            <div>
              <label htmlFor="nombre">Nombre *</label>
              <input type="text" id="nombre" name="nombre" value={formData.nombre} onChange={handleInputChange} required />
              <label htmlFor="descripcion">Descripción</label>
              <textarea id="descripcion" name="descripcion" value={formData.descripcion} onChange={handleInputChange} />
              <label htmlFor="imagencategoria">Imagen</label>
              <input type="text" id="imagencategoria" name="imagencategoria" value={formData.imagencategoria} onChange={handleInputChange} />
              <label htmlFor="estatus">Estatus</label>
              <select id="estatus" name="estatus" value={formData.estatus} onChange={handleInputChange}>
                <option value={1}>Activo</option>
                <option value={0}>Inactivo</option>
              </select>
            </div>
            <button onClick={cerrarModal}>Cancelar</button>
            <button onClick={guardarCategoria}>{isEditing ? 'Actualizar' : 'Crear'}</button>
          </div>
        </div>
      )}
    </div>
  );
// Código muerto eliminado
};

// (Removed duplicate default export and placeholder component)
export default ConfigCategorias;