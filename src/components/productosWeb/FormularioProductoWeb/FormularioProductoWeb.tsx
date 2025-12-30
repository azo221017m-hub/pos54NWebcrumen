import React, { useState, useEffect, useMemo, useRef } from 'react';
import { X, Save, Package, Upload, ImageIcon } from 'lucide-react';
import type { ProductoWeb, ProductoWebCreate, ProductoWebUpdate, TipoProducto } from '../../../types/productoWeb.types';
import type { Categoria } from '../../../types/categoria.types';
import type { Receta } from '../../../types/receta.types';
import type { Insumo } from '../../../types/insumo.types';
import { obtenerCategorias } from '../../../services/categoriasService';
import { obtenerRecetas } from '../../../services/recetasService';
import { obtenerInsumos } from '../../../services/insumosService';
import { verificarNombreProducto } from '../../../services/productosWebService';
import './FormularioProductoWeb.css';

interface Props {
  productoEditar: ProductoWeb | null;
  idnegocio: number;
  onSubmit: (data: ProductoWebCreate | ProductoWebUpdate) => void;
  onCancel: () => void;
  loading: boolean;
}

const FormularioProductoWeb: React.FC<Props> = ({ productoEditar, idnegocio, onSubmit, onCancel, loading }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const datosIniciales = useMemo(() => {
    if (productoEditar) {
      return {
        idCategoria: productoEditar.idCategoria,
        idreferencia: productoEditar.idreferencia,
        nombre: productoEditar.nombre,
        descripcion: productoEditar.descripcion,
        precio: productoEditar.precio,
        estatus: productoEditar.estatus,
        imagenProducto: productoEditar.imagenProducto,
        tipoproducto: productoEditar.tipoproducto as TipoProducto,
        costoproducto: productoEditar.costoproducto,
        usuarioauditoria: productoEditar.usuarioauditoria || '',
        idnegocio: productoEditar.idnegocio
      };
    }
    return {
      idCategoria: 0,
      idreferencia: null as number | null,
      nombre: '',
      descripcion: '',
      precio: 0,
      estatus: 1,
      imagenProducto: null as string | null,
      tipoproducto: 'Directo' as TipoProducto,
      costoproducto: 0,
      usuarioauditoria: localStorage.getItem('usuario') 
        ? JSON.parse(localStorage.getItem('usuario')!).alias 
        : '',
      idnegocio
    };
  }, [productoEditar, idnegocio]);

  const [formData, setFormData] = useState(datosIniciales);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [recetas, setRecetas] = useState<Receta[]>([]);
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [cargandoCategorias, setCargandoCategorias] = useState(true);
  const [cargandoRecetas, setCargandoRecetas] = useState(true);
  const [cargandoInsumos, setCargandoInsumos] = useState(true);
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [mostrarCategoriasDropdown, setMostrarCategoriasDropdown] = useState(false);
  const [verificandoNombre, setVerificandoNombre] = useState(false);
  const [nombreExiste, setNombreExiste] = useState(false);
  const [previewImagen, setPreviewImagen] = useState<string | null>(null);

  // Cargar datos al montar
  useEffect(() => {
    const cargarDatos = async () => {
      // Cargar categorías
      setCargandoCategorias(true);
      try {
        const categoriasData = await obtenerCategorias();
        setCategorias(categoriasData);
      } catch (error) {
        console.error('Error al cargar categorías:', error);
      } finally {
        setCargandoCategorias(false);
      }

      // Cargar recetas
      setCargandoRecetas(true);
      try {
        const recetasData = await obtenerRecetas(idnegocio);
        setRecetas(recetasData);
      } catch (error) {
        console.error('Error al cargar recetas:', error);
      } finally {
        setCargandoRecetas(false);
      }

      // Cargar insumos
      setCargandoInsumos(true);
      try {
        const insumosData = await obtenerInsumos(idnegocio);
        setInsumos(insumosData);
      } catch (error) {
        console.error('Error al cargar insumos:', error);
      } finally {
        setCargandoInsumos(false);
      }
    };

    cargarDatos();
  }, [idnegocio]);

  // Establecer preview de imagen si estamos editando
  useEffect(() => {
    if (productoEditar?.imagenProducto) {
      setPreviewImagen(`data:image/jpeg;base64,${productoEditar.imagenProducto}`);
    }
  }, [productoEditar]);

  // Filtrar categorías por búsqueda
  const categoriasFiltradas = useMemo(() => {
    if (!categoriaFiltro.trim()) return categorias;
    return categorias.filter(cat => 
      cat.nombre.toLowerCase().includes(categoriaFiltro.toLowerCase())
    );
  }, [categorias, categoriaFiltro]);

  // Obtener nombre de categoría seleccionada
  const categoriaSeleccionada = useMemo(() => {
    return categorias.find(cat => cat.idCategoria === formData.idCategoria);
  }, [categorias, formData.idCategoria]);

  // Obtener costo según tipo de producto
  const costoCalculado = useMemo(() => {
    if (formData.tipoproducto === 'Inventario' && formData.idreferencia) {
      const insumo = insumos.find(i => i.id_insumo === formData.idreferencia);
      return Number(insumo?.costo_promedio_ponderado ?? 0);
    }
    if (formData.tipoproducto === 'Receta' && formData.idreferencia) {
      const receta = recetas.find(r => r.idReceta === formData.idreferencia);
      return Number(receta?.costoReceta ?? 0);
    }
    return 0;
  }, [formData.tipoproducto, formData.idreferencia, insumos, recetas]);

  // Verificar nombre duplicado
  useEffect(() => {
    const verificar = async () => {
      if (!formData.nombre.trim()) {
        setNombreExiste(false);
        return;
      }

      setVerificandoNombre(true);
      try {
        const existe = await verificarNombreProducto(
          formData.nombre, 
          idnegocio, 
          productoEditar?.idProducto
        );
        setNombreExiste(existe);
      } catch (error) {
        console.error('Error al verificar nombre:', error);
      } finally {
        setVerificandoNombre(false);
      }
    };

    const timeoutId = setTimeout(verificar, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.nombre, idnegocio, productoEditar?.idProducto]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    let valorFinal: string | number | null = value;
    
    if (type === 'number') {
      valorFinal = value === '' ? 0 : parseFloat(value);
    }

    // Si cambia el tipo de producto, resetear referencia
    if (name === 'tipoproducto') {
      setFormData(prev => ({
        ...prev,
        tipoproducto: value as TipoProducto,
        idreferencia: null,
        costoproducto: 0
      }));
      return;
    }

    // Si cambia la referencia, actualizar costo
    if (name === 'idreferencia') {
      const idRef = value ? Number(value) : null;
      let nuevoCosto = 0;
      
      if (formData.tipoproducto === 'Inventario' && idRef) {
        const insumo = insumos.find(i => i.id_insumo === idRef);
        nuevoCosto = Number(insumo?.costo_promedio_ponderado ?? 0);
      } else if (formData.tipoproducto === 'Receta' && idRef) {
        const receta = recetas.find(r => r.idReceta === idRef);
        nuevoCosto = Number(receta?.costoReceta ?? 0);
      }

      setFormData(prev => ({
        ...prev,
        idreferencia: idRef,
        costoproducto: nuevoCosto
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: valorFinal
    }));

    // Limpiar error del campo
    if (errores[name]) {
      setErrores(prev => {
        const nuevos = { ...prev };
        delete nuevos[name];
        return nuevos;
      });
    }
  };

  const handleCategoriaSelect = (idCategoria: number) => {
    setFormData(prev => ({ ...prev, idCategoria }));
    setMostrarCategoriasDropdown(false);
    setCategoriaFiltro('');
    if (errores.idCategoria) {
      setErrores(prev => {
        const nuevos = { ...prev };
        delete nuevos.idCategoria;
        return nuevos;
      });
    }
  };

  const handleImagenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamaño (4MB)
    if (file.size > 4 * 1024 * 1024) {
      setErrores(prev => ({ ...prev, imagenProducto: 'La imagen debe ser menor a 4MB' }));
      return;
    }

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      setErrores(prev => ({ ...prev, imagenProducto: 'El archivo debe ser una imagen' }));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Extraer solo el base64 (sin el prefijo data:image/xxx;base64,)
      const base64 = result.split(',')[1];
      setFormData(prev => ({ ...prev, imagenProducto: base64 }));
      setPreviewImagen(result);
      setErrores(prev => {
        const nuevos = { ...prev };
        delete nuevos.imagenProducto;
        return nuevos;
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, imagenProducto: null }));
    setPreviewImagen(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validarFormulario = (): boolean => {
    const nuevosErrores: Record<string, string> = {};

    if (!formData.nombre.trim()) {
      nuevosErrores.nombre = 'El nombre es requerido';
    } else if (nombreExiste) {
      nuevosErrores.nombre = 'Ya existe un producto con este nombre';
    }

    if (!formData.idCategoria || formData.idCategoria === 0) {
      nuevosErrores.idCategoria = 'La categoría es requerida';
    }

    if (formData.precio < 0) {
      nuevosErrores.precio = 'El precio no puede ser negativo';
    } else if (!formData.precio) {
      nuevosErrores.precio = 'El precio no puede ser cero';
    }

    if (formData.tipoproducto === 'Inventario' && !formData.idreferencia) {
      nuevosErrores.idreferencia = 'Debe seleccionar un insumo';
    } else if (formData.tipoproducto === 'Inventario' && formData.idreferencia) {
      const insumoSeleccionado = insumos.find(i => i.id_insumo === formData.idreferencia);
      if (insumoSeleccionado && !insumoSeleccionado.costo_promedio_ponderado) {
        nuevosErrores.idreferencia = 'El insumo seleccionado no tiene un costo válido';
      }
    }

    if (formData.tipoproducto === 'Receta' && !formData.idreferencia) {
      nuevosErrores.idreferencia = 'Debe seleccionar una receta';
    } else if (formData.tipoproducto === 'Receta' && formData.idreferencia) {
      const recetaSeleccionada = recetas.find(r => r.idReceta === formData.idreferencia);
      if (recetaSeleccionada && !recetaSeleccionada.costoReceta) {
        nuevosErrores.idreferencia = 'La receta seleccionada no tiene un costo válido';
      }
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validarFormulario()) {
      return;
    }

    const dataToSubmit = {
      ...formData,
      costoproducto: costoCalculado || formData.costoproducto
    };

    if (productoEditar) {
      onSubmit({
        ...dataToSubmit,
        idProducto: productoEditar.idProducto
      } as ProductoWebUpdate);
    } else {
      onSubmit(dataToSubmit as ProductoWebCreate);
    }
  };

  return (
    <div className="formulario-producto-web-overlay" onClick={onCancel}>
      <div className="formulario-producto-web-modal" onClick={(e) => e.stopPropagation()}>
        <div className="formulario-producto-web-header">
          <div className="formulario-header-content">
            <Package className="formulario-header-icon" />
            <h2>{productoEditar ? 'Editar Producto' : 'Nuevo Producto'}</h2>
          </div>
          <button onClick={onCancel} className="formulario-close-button" type="button">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="formulario-producto-web-form">
          <div className="formulario-producto-web-body">
            {/* Categoría */}
            <div className="form-group full-width">
              <label className="form-label">
                Categoría <span className="required">*</span>
              </label>
              <div className="categoria-selector">
                <input
                  type="text"
                  value={categoriaFiltro || categoriaSeleccionada?.nombre || ''}
                  onChange={(e) => {
                    setCategoriaFiltro(e.target.value);
                    setMostrarCategoriasDropdown(true);
                  }}
                  onFocus={() => setMostrarCategoriasDropdown(true)}
                  placeholder={cargandoCategorias ? 'Cargando...' : 'Buscar categoría...'}
                  className={`form-input ${errores.idCategoria ? 'error' : ''}`}
                  disabled={cargandoCategorias}
                />
                {mostrarCategoriasDropdown && (
                  <div className="categoria-dropdown">
                    {categoriasFiltradas.length === 0 ? (
                      <div className="categoria-no-results">Sin resultados</div>
                    ) : (
                      categoriasFiltradas.map(cat => (
                        <div 
                          key={cat.idCategoria}
                          className={`categoria-option ${formData.idCategoria === cat.idCategoria ? 'selected' : ''}`}
                          onClick={() => handleCategoriaSelect(cat.idCategoria)}
                        >
                          {cat.nombre}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
              {errores.idCategoria && <span className="error-message">{errores.idCategoria}</span>}
            </div>

            {/* Tipo de Producto */}
            <div className="form-group">
              <label className="form-label">
                Tipo de Producto <span className="required">*</span>
              </label>
              <select
                name="tipoproducto"
                value={formData.tipoproducto}
                onChange={handleChange}
                className="form-select"
              >
                <option value="Directo">Directo</option>
                <option value="Inventario">Inventario</option>
                <option value="Receta">Receta</option>
                <option value="Materia Prima">Materia Prima</option>
              </select>
            </div>

            {/* Nombre del Producto */}
            <div className="form-group full-width">
              <label className="form-label">
                Nombre del Producto <span className="required">*</span>
              </label>
              <div className="input-with-status">
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  placeholder="Ingrese el nombre del producto"
                  className={`form-input ${errores.nombre || nombreExiste ? 'error' : ''}`}
                  maxLength={150}
                />
                {verificandoNombre && <span className="input-status checking">Verificando...</span>}
                {!verificandoNombre && nombreExiste && <span className="input-status error">Nombre en uso</span>}
                {!verificandoNombre && formData.nombre && !nombreExiste && <span className="input-status success">Disponible</span>}
              </div>
              {errores.nombre && <span className="error-message">{errores.nombre}</span>}
            </div>

            {/* Detalle de Producto */}
            <div className="form-section">
              <h3 className="section-title">Detalle del Producto</h3>
              
              {/* Descripción */}
              <div className="form-group full-width">
                <label className="form-label">Descripción</label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  placeholder="Descripción del producto"
                  className="form-textarea"
                  rows={3}
                />
              </div>

              {/* Imagen del Producto */}
              <div className="form-group full-width">
                <label className="form-label">Imagen del Producto</label>
                <div className="imagen-upload-container">
                  {previewImagen ? (
                    <div className="imagen-preview">
                      <img src={previewImagen} alt="Preview" />
                      <button 
                        type="button" 
                        className="btn-remove-image"
                        onClick={handleRemoveImage}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div 
                      className="imagen-placeholder"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <ImageIcon size={48} />
                      <span>Haz clic para seleccionar una imagen</span>
                      <small>Máximo 4MB</small>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImagenChange}
                    className="hidden-file-input"
                  />
                  {!previewImagen && (
                    <button 
                      type="button" 
                      className="btn-upload"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload size={18} />
                      Seleccionar Imagen
                    </button>
                  )}
                </div>
                {errores.imagenProducto && <span className="error-message">{errores.imagenProducto}</span>}
              </div>
            </div>

            {/* Precio */}
            <div className="form-group">
              <label className="form-label">
                Precio <span className="required">*</span>
              </label>
              <input
                type="number"
                name="precio"
                value={formData.precio}
                onChange={handleChange}
                step="0.01"
                min="0"
                placeholder="0.00"
                className={`form-input ${errores.precio ? 'error' : ''}`}
              />
              {errores.precio && <span className="error-message">{errores.precio}</span>}
            </div>

            {/* Campos condicionales para Inventario */}
            {formData.tipoproducto === 'Inventario' && (
              <div className="form-section conditional-section">
                <h3 className="section-title">Información de Inventario</h3>
                
                <div className="form-group">
                  <label className="form-label">
                    Insumo <span className="required">*</span>
                  </label>
                  <select
                    name="idreferencia"
                    value={formData.idreferencia || ''}
                    onChange={handleChange}
                    className={`form-select ${errores.idreferencia ? 'error' : ''}`}
                    disabled={cargandoInsumos}
                  >
                    <option value="">Seleccione un insumo</option>
                    {insumos.map(insumo => (
                      <option key={insumo.id_insumo} value={insumo.id_insumo}>
                        {insumo.nombre}
                      </option>
                    ))}
                  </select>
                  {errores.idreferencia && <span className="error-message">{errores.idreferencia}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Costo</label>
                  <input
                    type="text"
                    value={`$${costoCalculado.toFixed(2)}`}
                    className="form-input readonly"
                    readOnly
                  />
                  <small className="form-help">Costo promedio ponderado del insumo</small>
                </div>
              </div>
            )}

            {/* Campos condicionales para Receta */}
            {formData.tipoproducto === 'Receta' && (
              <div className="form-section conditional-section">
                <h3 className="section-title">Información de Receta</h3>
                
                <div className="form-group">
                  <label className="form-label">
                    Receta/Insumo <span className="required">*</span>
                  </label>
                  <select
                    name="idreferencia"
                    value={formData.idreferencia || ''}
                    onChange={handleChange}
                    className={`form-select ${errores.idreferencia ? 'error' : ''}`}
                    disabled={cargandoRecetas}
                  >
                    <option value="">Seleccione una receta</option>
                    {recetas.map(receta => (
                      <option key={receta.idReceta} value={receta.idReceta}>
                        {receta.nombreReceta}
                      </option>
                    ))}
                  </select>
                  {errores.idreferencia && <span className="error-message">{errores.idreferencia}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Costo</label>
                  <input
                    type="text"
                    value={`$${costoCalculado.toFixed(2)}`}
                    className="form-input readonly"
                    readOnly
                  />
                  <small className="form-help">Costo de la receta</small>
                </div>
              </div>
            )}

            {/* Estatus */}
            <div className="form-group">
              <label className="form-label">Estatus</label>
              <div className="toggle-switch-container">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={formData.estatus === 1}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      estatus: e.target.checked ? 1 : 0 
                    }))}
                  />
                  <span className="toggle-slider"></span>
                </label>
                <span className="toggle-label">
                  {formData.estatus === 1 ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>
          </div>

          <div className="formulario-producto-web-actions">
            <button type="button" onClick={onCancel} className="btn-cancelar" disabled={loading}>
              <X size={20} />
              Cancelar
            </button>
            <button type="submit" className="btn-guardar" disabled={loading || nombreExiste}>
              <Save size={20} />
              {loading ? 'Guardando...' : productoEditar ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormularioProductoWeb;
