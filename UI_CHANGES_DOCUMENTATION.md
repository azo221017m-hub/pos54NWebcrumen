# UI Changes Documentation

## Image Upload Component for Categories

### Before (URL Input)

The previous implementation used a simple text input field where users had to enter a URL:

```
┌─────────────────────────────────────────────────────┐
│ URL de Imagen                                       │
│ ┌─────────────────────────────────────────────────┐│
│ │ https://ejemplo.com/imagen.jpg                  ││
│ └─────────────────────────────────────────────────┘│
│ Ingresa la URL de una imagen para la categoría     │
└─────────────────────────────────────────────────────┘
```

**Limitations:**
- Required hosting images externally
- No preview before saving
- No validation of image URLs
- Users needed to copy/paste URLs manually

### After (Image Upload Component)

The new implementation provides an intuitive file selection interface:

#### State 1: No Image Selected
```
┌─────────────────────────────────────────────────────┐
│ Imagen de Categoría                                 │
│ ┌──────────────────────────────┐                   │
│ │  📤  Seleccionar imagen      │                   │
│ └──────────────────────────────┘                   │
│ Formatos aceptados: PNG, JPG, GIF, WebP (máx. 2MB) │
└─────────────────────────────────────────────────────┘
```

#### State 2: Image Selected (with circular preview)
```
┌─────────────────────────────────────────────────────┐
│ Imagen de Categoría                                 │
│  ┌────┐                                             │
│  │ 🖼️ │  ❌  (Preview: 50x50px circular)          │
│  └────┘                                             │
│ Formatos aceptados: PNG, JPG, GIF, WebP (máx. 2MB) │
└─────────────────────────────────────────────────────┘
```

**Features:**
- ✅ File picker dialog for easy image selection
- ✅ Circular preview showing selected image (50x50 pixels)
- ✅ Remove button (❌) to clear selection
- ✅ Automatic base64 conversion for database storage
- ✅ File type validation (PNG, JPG, GIF, WebP)
- ✅ File size validation (max 2MB)
- ✅ User-friendly error messages

#### Error State Example
```
┌─────────────────────────────────────────────────────┐
│ Imagen de Categoría                                 │
│ ┌──────────────────────────────┐                   │
│ │  📤  Seleccionar imagen      │                   │
│ └──────────────────────────────┘                   │
│ ⚠️ La imagen no debe superar 2MB                    │
│ Formatos aceptados: PNG, JPG, GIF, WebP (máx. 2MB) │
└─────────────────────────────────────────────────────┘
```

## User Audit Trail Changes

### Before

Form components sent hardcoded values:
```typescript
// FormularioCategoria.tsx (Line 134)
const dataToSubmit = {
  ...formData,
  usuarioauditoria: 'admin'  // ❌ Hardcoded value
};
```

**Security Issue:** Any user could potentially modify the audit trail by changing this value.

### After

Backend extracts user from authentication context:
```typescript
// categorias.controller.ts (Lines 106-108)
const idnegocio = req.user?.idNegocio;
const usuarioauditoria = req.user?.alias;  // ✅ From JWT token

if (!idnegocio || !usuarioauditoria) {
  res.status(400).json({ mensaje: 'El usuario no está autenticado' });
  return;
}
```

**Security Improvement:** 
- User identity is verified through JWT authentication
- Cannot be spoofed by client-side code
- Ensures accurate audit trail for compliance

## Database Impact

### usuarioauditoria Field
When a user with alias "jperez" creates a category, the database will store:

```sql
INSERT INTO tblposcrumenwebcategorias (
  nombre, 
  descripcion, 
  usuarioauditoria,      -- Now stores "jperez" from authenticated user
  fechaRegistroauditoria
) VALUES (
  'Bebidas',
  'Categoría de bebidas',
  'jperez',              -- ✅ Authenticated user alias
  NOW()
);
```

### imagencategoria Field
When a user uploads an image, it's stored as base64:

```sql
UPDATE tblposcrumenwebcategorias 
SET imagencategoria = 'data:image/png;base64,iVBORw0KGgoAAAANSUh...'
WHERE idCategoria = 1;
```

The base64 string is automatically:
- Generated by the FileReader API in the browser
- Sent to the backend in the request body
- Stored as text/longtext in MySQL
- Retrieved and displayed directly in img src attributes

## Component Reusability

The ImageUpload component is designed to be reusable across the application:

```tsx
// Usage in any form:
<ImageUpload
  value={formData.imagen}
  onChange={(base64) => setFormData({ ...formData, imagen: base64 })}
  previewSize={50}       // Customizable size
  shape="circle"         // or "square"
  label="Select Image"   // Customizable label
/>
```

**Potential future uses:**
- Product images in ProductosWeb form
- User profile pictures
- Business logos in Negocios form
- Any other form requiring image uploads

## Browser Compatibility

The implementation uses standard Web APIs that are supported in all modern browsers:

- **FileReader API**: Supported in all modern browsers
- **Base64 Encoding**: Native browser support
- **File Input**: Standard HTML5 element
- **React Hooks**: useState, useRef

## Performance Considerations

### Base64 vs. File Upload
- **Pros**: Simple implementation, no need for separate file server
- **Cons**: ~33% larger than binary (base64 overhead)
- **Recommendation**: Fine for small images (< 2MB limit enforced)

### Future Optimization Options
1. Image compression before base64 conversion
2. Lazy loading of images in lists
3. Thumbnail generation for list views
4. CDN integration for production
