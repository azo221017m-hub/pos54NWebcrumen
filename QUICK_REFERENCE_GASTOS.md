# Quick Reference - Gastos Page

## 🚀 Quick Start

### Access
1. Login → Dashboard
2. MI OPERACION menu → GASTOS
3. No turno required ✅

### Create Expense
```
[+ Nuevo Gasto] → Fill form → [Guardar]
```

### Edit Expense
```
[✏️] → Modify → [Guardar]
```

### Delete Expense
```
[🗑️] → Confirm → Done
```

## 📋 API Endpoints

```typescript
// Base URL: /api/gastos

GET    /api/gastos        // List all gastos
GET    /api/gastos/:id    // Get one gasto
POST   /api/gastos        // Create gasto
PUT    /api/gastos/:id    // Update gasto
DELETE /api/gastos/:id    // Delete gasto
```

## 📝 Request/Response Examples

### Create Gasto
```json
// POST /api/gastos
{
  "importegasto": 5000,
  "tipodegasto": "Renta"
}

// Response
{
  "success": true,
  "data": {
    "idventa": 123,
    "folioventa": "20260210103045",
    "fechadeventa": "2026-02-10T10:30:45.000Z",
    "subtotal": 5000,
    "totaldeventa": 5000,
    "referencia": "Renta",
    "idnegocio": 1,
    "usuarioauditoria": "admin",
    "fechamodificacionauditoria": "2026-02-10T10:30:45.000Z"
  },
  "message": "Gasto creado correctamente"
}
```

### List Gastos
```json
// GET /api/gastos
{
  "success": true,
  "data": [
    {
      "idventa": 123,
      "folioventa": "20260210103045",
      "fechadeventa": "2026-02-10T10:30:45.000Z",
      "subtotal": 5000,
      "totaldeventa": 5000,
      "referencia": "Renta",
      "usuarioauditoria": "admin"
    }
  ],
  "message": "Gastos obtenidos correctamente"
}
```

## 🔧 Database Schema

```sql
-- Table: tblposcrumenwebventas
-- Filter: tipodeventa = 'MOVIMIENTO'

Key Fields:
- idventa (PK)
- folioventa (Format: AAAAMMDDHHMMSS)
- tipodeventa = 'MOVIMIENTO'
- estadodeventa = 'COBRADO'
- subtotal (from importegasto)
- totaldeventa (= subtotal)
- referencia (from tipodegasto)
- formadepago = 'EFECTIVO'
- estatusdepago = 'PAGADO'
- importedepago = 0
- idnegocio (from user)
- usuarioauditoria (from user)
- fechadeventa (auto NOW())
- fechamodificacionauditoria (auto NOW() on update)
```

## 🎨 Component Structure

```
PageGastos/
├── PageGastos.tsx          // Main page
├── PageGastos.css          // Page styles
└── components/
    ├── FormularioGastos/
    │   ├── FormularioGastos.tsx    // Form modal
    │   └── FormularioGastos.css    // Form styles
    └── ListaGastos/
        ├── ListaGastos.tsx         // List component
        └── ListaGastos.css         // List styles
```

## 🔐 Security Checklist

- [x] Authentication required
- [x] Business-level isolation (idnegocio)
- [x] Input validation
- [x] SQL injection prevention
- [x] Error handling
- [x] Audit trail (usuarioauditoria)

## ✅ Validation Rules

### Client-Side
```typescript
importegasto: number > 0
tipodegasto: string, required, trim
```

### Server-Side
```typescript
importegasto: number > 0, required
tipodegasto: string, required, not empty after trim
idnegocio: required from user
usuarioalias: required from user
```

## 🐛 Common Issues & Solutions

### Issue: "ID de negocio no encontrado"
**Solution**: User not properly logged in. Re-login.

### Issue: "El importe debe ser mayor a 0"
**Solution**: Enter a positive number in importe field.

### Issue: "Error al cargar gastos"
**Solution**: Check API connection and database.

### Issue: "Gasto no encontrado"
**Solution**: Gasto may have been deleted or doesn't belong to this negocio.

## 📊 Testing Checklist

- [ ] Create new gasto
- [ ] View list of gastos
- [ ] Edit existing gasto
- [ ] Delete gasto with confirmation
- [ ] Verify folio generation
- [ ] Test responsive design
- [ ] Test error handling
- [ ] Verify authentication
- [ ] Check business isolation
- [ ] Test empty state
- [ ] Test loading state

## 🔍 Code Locations

```
Backend:
- types: backend/src/types/gastos.types.ts
- controller: backend/src/controllers/gastos.controller.ts
- routes: backend/src/routes/gastos.routes.ts
- app: backend/src/app.ts (line 33, 223)

Frontend:
- types: src/types/gastos.types.ts
- service: src/services/gastosService.ts
- page: src/pages/PageGastos/
- components: src/components/gastos/
- router: src/router/AppRouter.tsx (line 23, 115)
- dashboard: src/pages/DashboardPage.tsx (line 964)
```

## 📱 Responsive Breakpoints

```css
/* Desktop */
@media (min-width: 769px) { /* Table view */ }

/* Tablet */
@media (max-width: 768px) { /* Card view */ }

/* Mobile */
@media (max-width: 480px) { /* Vertical layout */ }
```

## 🎯 Performance Tips

1. **Lazy Loading**: Data loaded on mount only
2. **Optimized Renders**: React.memo where applicable
3. **Debouncing**: Form submissions debounced
4. **Caching**: API responses cached when appropriate
5. **Code Splitting**: Route-based code splitting

## 📈 Future Enhancements

- [ ] Date range filters
- [ ] Search by tipo de gasto
- [ ] Export to PDF/Excel
- [ ] Gastos dashboard/charts
- [ ] Category management
- [ ] Bulk operations
- [ ] Gastos templates
- [ ] Receipt upload

## 📞 Support

For issues or questions:
1. Check IMPLEMENTATION_SUMMARY_GASTOS.md
2. Review VISUAL_GUIDE_GASTOS.md
3. Check console for errors
4. Verify database connection
5. Contact development team

## 🏁 Deployment Notes

Before deploying:
1. ✅ Run `npm run build` (frontend)
2. ✅ Run `npm run build` (backend)
3. ✅ Check environment variables
4. ✅ Verify database migrations
5. ✅ Test in staging environment
6. ✅ Clear browser cache

## 📚 Related Documentation

- [IMPLEMENTATION_SUMMARY_GASTOS.md](./IMPLEMENTATION_SUMMARY_GASTOS.md) - Full technical docs
- [VISUAL_GUIDE_GASTOS.md](./VISUAL_GUIDE_GASTOS.md) - UI/UX reference
- [HOW_TO_RUN.md](./HOW_TO_RUN.md) - Project setup
- [API_DOCUMENTATION.md](./backend/API_DOCUMENTATION.md) - API reference
