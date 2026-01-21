# Ejemplos Concretos de Conversión px → rem

## Ejemplo 1: LoginPage.css

### Conversiones Realizadas

#### Headers y Títulos
```css
/* ANTES */
.login-title {
  font-size: 1.75rem;  /* 28px */
  margin: 0 0 0.375rem;
}

.login-subtitle {
  font-size: 0.9375rem;  /* 15px */
}

/* DESPUÉS (calculado con base 10.72px) */
.login-title {
  font-size: 2.612rem;  /* 28px ÷ 10.72 = 2.612 */
  margin: 0 0 0.560rem; /* 6px ÷ 10.72 = 0.560 */
}

.login-subtitle {
  font-size: 1.400rem;  /* 15px ÷ 10.72 = 1.400 */
}
```

#### Cards y Contenedores
```css
/* ANTES */
.login-card {
  padding: 1.5rem 1.75rem;  /* 24px 28px */
  border-radius: 16px;
  max-width: 380px;
}

/* DESPUÉS */
.login-card {
  padding: 2.239rem 2.612rem;  /* 24px 28px */
  border-radius: 1.493rem;     /* 16px */
  max-width: 35.448rem;        /* 380px */
}
```

#### Logos e Iconos
```css
/* ANTES */
.login-logo {
  width: 56px;
  height: 56px;
  margin: 0 auto 0.75rem;
  border-radius: 14px;
}

.logo-icon {
  width: 32px;
  height: 32px;
}

/* DESPUÉS */
.login-logo {
  width: 5.224rem;      /* 56px */
  height: 5.224rem;     /* 56px */
  margin: 0 auto 1.119rem;  /* 12px */
  border-radius: 1.306rem;  /* 14px */
}

.logo-icon {
  width: 2.985rem;      /* 32px */
  height: 2.985rem;     /* 32px */
}
```

#### Inputs y Forms
```css
/* ANTES */
.form-input {
  padding: 0.625rem 0.875rem;  /* 10px 14px */
  border-radius: 8px;
  font-size: 0.9rem;            /* 14.4px */
  border: 2px solid #e2e8f0;
}

/* DESPUÉS */
.form-input {
  padding: 0.933rem 1.306rem;  /* 10px 14px */
  border-radius: 0.746rem;     /* 8px */
  font-size: 1.343rem;         /* 14.4px */
  border: 2px solid #e2e8f0;   /* border mantiene px */
}
```

#### Botones
```css
/* ANTES */
.submit-button {
  padding: 0.875rem;      /* 14px */
  border-radius: 10px;
  font-size: 0.9375rem;   /* 15px */
}

/* DESPUÉS */
.submit-button {
  padding: 1.306rem;      /* 14px */
  border-radius: 0.933rem;  /* 10px */
  font-size: 1.400rem;    /* 15px */
}
```

#### Gaps y Espaciados
```css
/* ANTES */
.login-form {
  gap: 1rem;  /* 16px */
}

.form-group {
  gap: 0.375rem;  /* 6px */
}

/* DESPUÉS */
.login-form {
  gap: 1.493rem;  /* 16px */
}

.form-group {
  gap: 0.560rem;  /* 6px */
}
```

## Ejemplo 2: PageVentas.css

### Headers
```css
/* ANTES */
.ventas-header {
  padding: 0.75rem 1.5rem;  /* 12px 24px */
  gap: 0.75rem;             /* 12px */
}

/* DESPUÉS */
.ventas-header {
  padding: 1.119rem 2.239rem;  /* 12px 24px */
  gap: 1.119rem;               /* 12px */
}
```

### Botones de Acción
```css
/* ANTES */
.btn-back-dashboard {
  gap: 0.4rem;        /* ~6.4px */
  padding: 0.5rem 1rem;   /* 8px 16px */
  border-radius: 6px;
  font-size: 0.875rem;    /* 14px */
}

/* DESPUÉS */
.btn-back-dashboard {
  gap: 0.597rem;          /* 6.4px */
  padding: 0.746rem 1.493rem;  /* 8px 16px */
  border-radius: 0.560rem;     /* 6px */
  font-size: 1.306rem;         /* 14px */
}
```

### Lock Screen
```css
/* ANTES */
.lock-logo-ventas {
  width: 120px;
  height: 120px;
  margin: 0 auto 2rem;  /* 32px */
}

.lock-business-name {
  font-size: 2.5rem;    /* 40px */
  margin-bottom: 1rem;  /* 16px */
}

/* DESPUÉS */
.lock-logo-ventas {
  width: 11.194rem;         /* 120px */
  height: 11.194rem;        /* 120px */
  margin: 0 auto 2.985rem;  /* 32px */
}

.lock-business-name {
  font-size: 3.731rem;      /* 40px */
  margin-bottom: 1.493rem;  /* 16px */
}
```

## Tabla de Referencia Rápida

| Valor Original | rem (base 10.72px) | Valor Calculado |
|---------------|-------------------|----------------|
| 4px           | 0.373rem         | 4px            |
| 6px           | 0.560rem         | 6px            |
| 8px           | 0.746rem         | 8px            |
| 10px          | 0.933rem         | 10px           |
| 12px          | 1.119rem         | 12px           |
| 14px          | 1.306rem         | 14px           |
| 16px          | 1.493rem         | 16px           |
| 18px          | 1.679rem         | 18px           |
| 20px          | 1.866rem         | 20px           |
| 24px          | 2.239rem         | 24px           |
| 28px          | 2.612rem         | 28px           |
| 32px          | 2.985rem         | 32px           |
| 40px          | 3.731rem         | 40px           |
| 48px          | 4.478rem         | 48px           |
| 56px          | 5.224rem         | 56px           |
| 64px          | 5.970rem         | 64px           |
| 120px         | 11.194rem        | 120px          |
| 380px         | 35.448rem        | 380px          |
| 400px         | 37.313rem        | 400px          |

## Fórmula de Conversión

```javascript
function pxToRem(px) {
  const baseSize = 10.72;
  const rem = px / baseSize;
  return rem.toFixed(3) + 'rem';
}

// Uso
console.log(pxToRem(24));  // "2.239rem"
console.log(pxToRem(16));  // "1.493rem"
```

## Propiedades que NO se Convierten

```css
/* Mantener en px */
border: 1px solid #ccc;     /* ✅ */
border: 2px solid #e2e8f0;  /* ✅ */
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);  /* ✅ */

/* Mantener en porcentajes */
width: 100%;    /* ✅ */
height: 100vh;  /* ✅ */
max-width: 95%; /* ✅ */

/* Mantener sin unidades */
opacity: 0.5;     /* ✅ */
line-height: 1.6; /* ✅ */
font-weight: 600; /* ✅ */
```

## Notas Importantes

1. **Redondeo**: Los valores rem se redondean a 3 decimales para precisión
2. **Borders**: Siempre mantener en px (1px, 2px, etc.)
3. **Shadows**: Mantener en px para consistencia
4. **Viewport Units**: No cambiar (vh, vw, %)
5. **Gradientes**: No requieren conversión
6. **Transforms**: Valores numéricos no cambian
7. **Transitions**: Duración en segundos/ms no cambia

## Testing Visual

Después de la conversión, verificar:
- [ ] Todos los espaciados se mantienen proporcionales
- [ ] Los textos son legibles
- [ ] Los botones e inputs tienen tamaño apropiado
- [ ] Los íconos se ven nítidos
- [ ] El layout responsive funciona
- [ ] El zoom del navegador funciona correctamente
