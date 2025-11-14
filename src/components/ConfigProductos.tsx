// src/components/ConfigProductos.tsx
// Componente para gestión de productos con categorías e imágenes

import { useState, useEffect } from 'react'; // Importa hooks de React
import type { 
  Producto, 
  CreateProductoData, 
  Categoria, 
  Usuario, 
  ScreenType 
} from '../types'; // Importa tipos
import { 
  getProductosByNegocio, 
  createProducto, 
  updateProducto, 
  deleteProducto,
  getCategorias
} from '../services/api'; // Importa servicios API
import '../styles/ConfigScreens.css'; // Importa estilos
import Toast from './Toast'; // Importa componente de notificaciones

// Interfaz para las props del componente
interface ConfigProductosProps {
  user: Usuario; // Usuario autenticado
  onNavigate: (screen: ScreenType) => void; // Función de navegación
}

// Tipos para el formulario de productos
type TipoProducto = 'Producto' | 'Platillo';

// Componente principal de configuración de productos
const ConfigProductos: React.FC<ConfigProductosProps> = ({ user, onNavigate }) => {
  // Estados para el manejo de datos
  const [productos, setProductos] = useState<Producto[]>([]); // Lista de productos
  const [categorias, setCategorias] = useState<Categoria[]>([]); // Lista de categorías
  const [loading, setLoading] = useState<boolean>(true); // Estado de carga
  const [showForm, setShowForm] = useState<boolean>(false); // Mostrar formulario
  const [editingProducto, setEditingProducto] = useState<Producto | null>(null); // Producto en edición
  const [tipoProducto, setTipoProducto] = useState<TipoProducto>('Producto'); // Tipo de producto

  // Estados para el toast de notificaciones
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
  }>({
    show: false,
    message: '',
    type: 'info'
  });

  // Estados para el formulario
  const [formData, setFormData] = useState<CreateProductoData>({
    idCategoria: 0,
    idReceta: undefined,
    nombre: '',
    descripcion: '',
    precio: 0,
    existencia: 0,
    estatus: 1,
    usuario: user.usuario,
    idNegocio: user.idNegocio,
    imagenProducto: undefined
  });

  // Estado para la vista previa de imagen
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Efecto para cargar datos al montar el componente
  useEffect(() => {
    console.log('📦 Cargando configuración de productos para:', user.nombre); // Log de carga
    loadProductos(); // Carga productos
    loadCategorias(); // Carga categorías
  }, [user]);

  // Función para cargar productos
  const loadProductos = async (): Promise<void> => {
    try {
      console.log('📦 Cargando productos...'); // Log de carga
      setLoading(true);
      
      // Cargar productos del negocio del usuario
      const response = await getProductosByNegocio(user.idNegocio);
      
      if (response.success) {
        setProductos(response.data || []);
        console.log(`✅ ${response.data?.length || 0} productos cargados`); // Log de éxito
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('❌ Error cargando productos:', error); // Log de error
      showToast('Error cargando productos', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Función para cargar categorías
  const loadCategorias = async (): Promise<void> => {
    try {
      console.log('📂 Cargando categorías...'); // Log de carga
      
      const response = await getCategorias();
      
      if (response.success) {
        setCategorias(response.data || []);
        console.log(`✅ ${response.data?.length || 0} categorías cargadas`); // Log de éxito
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('❌ Error cargando categorías:', error); // Log de error
      showToast('Error cargando categorías', 'error');
    }
  };

  // Función para mostrar toast
  const showToast = (message: string, type: 'success' | 'error' | 'info'): void => {
    setToast({ show: true, message, type });
  };

  // Función para cerrar toast
  const closeToast = (): void => {
    setToast({ show: false, message: '', type: 'info' });
  };

  // Función para manejar cambios en el formulario
  const handleInputChange = (field: keyof CreateProductoData, value: any): void => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Función para manejar cambio de imagen
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        showToast('Por favor selecciona un archivo de imagen válido', 'error');
        return;
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showToast('La imagen no debe superar los 5MB', 'error');
        return;
      }

      setFormData(prev => ({
        ...prev,
        imagenProducto: file
      }));

      // Crear vista previa
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Función para limpiar el formulario
  const clearForm = (): void => {
    setFormData({
      idCategoria: 0,
      idReceta: undefined,
      nombre: '',
      descripcion: '',
      precio: 0,
      existencia: 0,
      estatus: 1,
      usuario: user.usuario,
      idNegocio: user.idNegocio,
      imagenProducto: undefined
    });
    setImagePreview(null);
    setEditingProducto(null);
    setTipoProducto('Producto');
  };

  // Función para manejar el envío del formulario
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    try {
      console.log('📦 Enviando formulario de producto...'); // Log de envío
      
      // Validar datos requeridos
      if (!formData.idCategoria || !formData.nombre || !formData.descripcion) {
        showToast('Por favor completa todos los campos requeridos', 'error');
        return;
      }

      // Crear FormData para envío con imagen
      const submitData = new FormData();
      submitData.append('idCategoria', formData.idCategoria.toString());
      if (formData.idReceta) {
        submitData.append('idReceta', formData.idReceta.toString());
      }
      submitData.append('nombre', formData.nombre);
      submitData.append('descripcion', formData.descripcion);
      submitData.append('precio', formData.precio.toString());
      submitData.append('existencia', formData.existencia.toString());
      submitData.append('estatus', formData.estatus?.toString() || '1');
      submitData.append('usuario', formData.usuario || user.usuario);
      submitData.append('idNegocio', formData.idNegocio.toString());
      
      if (formData.imagenProducto) {
        submitData.append('imagenProducto', formData.imagenProducto);
      }

      let response;
      if (editingProducto) {
        // Actualizar producto existente
        response = await updateProducto(editingProducto.idProducto, submitData);
      } else {
        // Crear nuevo producto
        response = await createProducto(submitData);
      }

      if (response.success) {
        showToast(
          editingProducto ? 'Producto actualizado exitosamente' : 'Producto creado exitosamente',
          'success'
        );
        clearForm();
        setShowForm(false);
        loadProductos(); // Recargar la lista
      } else {
        throw new Error(response.message);
      }

    } catch (error) {
      console.error('❌ Error al guardar producto:', error); // Log de error
      showToast('Error al guardar el producto', 'error');
    }
  };

  // Función para editar un producto
  const handleEdit = (producto: Producto): void => {
    setEditingProducto(producto);
    setFormData({
      idCategoria: producto.idCategoria,
      idReceta: producto.idReceta,
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio: producto.precio,
      existencia: producto.existencia,
      estatus: producto.estatus,
      usuario: user.usuario,
      idNegocio: producto.idNegocio,
      imagenProducto: undefined
    });
    setImagePreview(null); // No mostrar preview de imagen existente por ahora
    setShowForm(true);
  };

  // Función para eliminar un producto
  const handleDelete = async (id: number): Promise<void> => {
    if (!confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      return;
    }

    try {
      console.log('📦 Eliminando producto...'); // Log de eliminación
      
      const response = await deleteProducto(id, { usuario: user.usuario });
      
      if (response.success) {
        showToast('Producto eliminado exitosamente', 'success');
        loadProductos(); // Recargar la lista
      } else {
        throw new Error(response.message);
      }

    } catch (error) {
      console.error('❌ Error eliminando producto:', error); // Log de error
      showToast('Error eliminando el producto', 'error');
    }
  };

  // Función para formatear precio
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(price);
  };

  return (
    <div className="config-screen">
      {/* Header de la pantalla */}
      <div className="config-header">
        <div className="header-left">
          <button 
            className="back-button"
            onClick={() => onNavigate('home')}
            title="Regresar al inicio"
          >
            ←
          </button>
          <div>
            <h1>📦 Configuración de Productos</h1>
            <p>Gestiona los productos de tu negocio</p>
          </div>
        </div>
        <div className="header-actions">
          <button 
            className="primary-button"
            onClick={() => {
              clearForm();
              setShowForm(true);
            }}
          >
            + Nuevo Producto
          </button>
        </div>
      </div>

      {/* Formulario de producto */}
      {showForm && (
        <div className="form-section">
          <div className="form-header">
            <h2>{editingProducto ? '✏️ Editar Producto' : '📦 Nuevo Producto'}</h2>
            <button 
              className="close-button"
              onClick={() => {
                setShowForm(false);
                clearForm();
              }}
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="config-form">
            <div className="form-grid">
              
              {/* Tipo de Producto - Botones de opción */}
              <div className="form-group full-width">
                <label className="form-label">Tipo de Producto</label>
                <div className="tipo-producto-buttons">
                  <button
                    type="button"
                    className={`tipo-button ${tipoProducto === 'Producto' ? 'active' : ''}`}
                    onClick={() => setTipoProducto('Producto')}
                  >
                    📦 Producto
                  </button>
                  <button
                    type="button"
                    className={`tipo-button ${tipoProducto === 'Platillo' ? 'active' : ''}`}
                    onClick={() => setTipoProducto('Platillo')}
                  >
                    🍽️ Platillo
                  </button>
                </div>
              </div>

              {/* Categoría */}
              <div className="form-group">
                <label className="form-label">Categoría *</label>
                <select
                  className="form-input"
                  value={formData.idCategoria}
                  onChange={(e) => handleInputChange('idCategoria', Number(e.target.value))}
                  required
                >
                  <option value={0}>Selecciona una categoría</option>
                  {categorias.map(categoria => (
                    <option key={categoria.idCategoria} value={categoria.idCategoria}>
                      {categoria.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Nombre */}
              <div className="form-group">
                <label className="form-label">Nombre del Producto *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.nombre}
                  onChange={(e) => handleInputChange('nombre', e.target.value)}
                  placeholder="Ej: Hamburguesa Clásica"
                  required
                />
              </div>

              {/* Precio */}
              <div className="form-group">
                <label className="form-label">Precio *</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.precio}
                  onChange={(e) => handleInputChange('precio', Number(e.target.value))}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  required
                />
              </div>

              {/* Existencia */}
              <div className="form-group">
                <label className="form-label">Existencia *</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.existencia}
                  onChange={(e) => handleInputChange('existencia', Number(e.target.value))}
                  min="0"
                  placeholder="0"
                  required
                />
              </div>

              {/* Descripción */}
              <div className="form-group full-width">
                <label className="form-label">Descripción *</label>
                <textarea
                  className="form-input"
                  value={formData.descripcion}
                  onChange={(e) => handleInputChange('descripcion', e.target.value)}
                  placeholder="Describe el producto..."
                  rows={3}
                  required
                />
              </div>

              {/* Imagen del producto */}
              <div className="form-group full-width">
                <label className="form-label">Imagen del Producto</label>
                <div className="image-upload-container">
                  <input
                    type="file"
                    id="imagen-producto"
                    className="image-input"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  <label htmlFor="imagen-producto" className="image-upload-label">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Vista previa" className="image-preview" />
                    ) : (
                      <div className="upload-placeholder">
                        <span className="upload-icon">📷</span>
                        <span>Seleccionar imagen</span>
                        <small>Máximo 5MB - JPG, PNG, GIF</small>
                      </div>
                    )}
                  </label>
                </div>
              </div>

            </div>

            {/* Botones del formulario */}
            <div className="form-actions">
              <button 
                type="button" 
                className="secondary-button"
                onClick={() => {
                  setShowForm(false);
                  clearForm();
                }}
              >
                Cancelar
              </button>
              <button type="submit" className="primary-button">
                {editingProducto ? 'Actualizar Producto' : 'Crear Producto'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de productos */}
      <div className="data-section">
        <div className="section-header">
          <h2>📦 Lista de Productos ({productos.length})</h2>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Cargando productos...</p>
          </div>
        ) : productos.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📦</span>
            <h3>No hay productos registrados</h3>
            <p>Crea tu primer producto para comenzar</p>
            <button 
              className="primary-button"
              onClick={() => {
                clearForm();
                setShowForm(true);
              }}
            >
              + Crear Primer Producto
            </button>
          </div>
        ) : (
          <div className="productos-grid">
            {productos.map(producto => (
              <div key={producto.idProducto} className="producto-card">
                <div className="producto-header">
                  <div className="producto-image">
                    {producto.imagenProducto ? (
                      <img 
                        src={`/api/productos/${producto.idProducto}/imagen`} 
                        alt={producto.nombre}
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="no-image">📦</div>
                    )}
                  </div>
                  <div className="producto-status">
                    <span className={`status-badge ${producto.estatus === 1 ? 'active' : 'inactive'}`}>
                      {producto.estatus === 1 ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>

                <div className="producto-content">
                  <h3 className="producto-nombre">{producto.nombre}</h3>
                  <p className="producto-descripcion">{producto.descripcion}</p>
                  
                  <div className="producto-details">
                    <div className="detail-item">
                      <span className="detail-label">Precio:</span>
                      <span className="detail-value price">{formatPrice(producto.precio)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Existencia:</span>
                      <span className="detail-value">{producto.existencia}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Categoría:</span>
                      <span className="detail-value">
                        {categorias.find(c => c.idCategoria === producto.idCategoria)?.nombre || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="producto-actions">
                  <button 
                    className="edit-button"
                    onClick={() => handleEdit(producto)}
                    title="Editar producto"
                  >
                    ✏️
                  </button>
                  <button 
                    className="delete-button"
                    onClick={() => handleDelete(producto.idProducto)}
                    title="Eliminar producto"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Toast de notificaciones */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type === 'info' ? 'success' : toast.type} // Convertir 'info' a 'success'
          onClose={closeToast}
        />
      )}
    </div>
  );
};

export default ConfigProductos;