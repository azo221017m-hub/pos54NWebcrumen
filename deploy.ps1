# Script de Despliegue a Producción
# Para Windows PowerShell

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "   DESPLIEGUE A PRODUCCIÓN - POS    " -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Variables de producción
$FRONTEND_URL = "https://pos54nwebcrumen.onrender.com"
$BACKEND_URL = "https://pos54nwebcrumenbackend.onrender.com"

Write-Host "URLs de Producción:" -ForegroundColor Yellow
Write-Host "  Frontend: $FRONTEND_URL" -ForegroundColor White
Write-Host "  Backend:  $BACKEND_URL" -ForegroundColor White
Write-Host ""

# Compilar Backend
Write-Host "[1/4] Compilando Backend..." -ForegroundColor Green
Set-Location backend
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Error al compilar el backend" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Backend compilado exitosamente" -ForegroundColor Green
Write-Host ""

# Compilar Frontend
Write-Host "[2/4] Compilando Frontend..." -ForegroundColor Green
Set-Location ..\frontend
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Error al compilar el frontend" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Frontend compilado exitosamente" -ForegroundColor Green
Write-Host ""

# Verificar archivos generados
Write-Host "[3/4] Verificando archivos generados..." -ForegroundColor Green
if (Test-Path "dist") {
    Write-Host "✓ Carpeta dist/ creada" -ForegroundColor Green
    $distSize = (Get-ChildItem dist -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
    Write-Host "  Tamaño total: $([math]::Round($distSize, 2)) MB" -ForegroundColor White
} else {
    Write-Host "✗ No se encontró la carpeta dist/" -ForegroundColor Red
    exit 1
}

Set-Location ..\backend
if (Test-Path "dist") {
    Write-Host "✓ Backend dist/ creada" -ForegroundColor Green
} else {
    Write-Host "✗ No se encontró la carpeta dist/ del backend" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Instrucciones finales
Write-Host "[4/4] Próximos pasos:" -ForegroundColor Green
Write-Host ""
Write-Host "BACKEND (Render.com):" -ForegroundColor Cyan
Write-Host "  1. Subir carpeta 'backend/dist' a Render" -ForegroundColor White
Write-Host "  2. Verificar variables de entorno:" -ForegroundColor White
Write-Host "     - FRONTEND_URL=$FRONTEND_URL" -ForegroundColor Gray
Write-Host "     - NODE_ENV=production" -ForegroundColor Gray
Write-Host "     - DB_HOST, DB_USER, DB_PASSWORD, DB_NAME" -ForegroundColor Gray
Write-Host "  3. Comando Start: npm start" -ForegroundColor White
Write-Host ""

Write-Host "FRONTEND (Render.com):" -ForegroundColor Cyan
Write-Host "  1. Subir carpeta 'frontend/dist' a Render" -ForegroundColor White
Write-Host "  2. Verificar variables de entorno:" -ForegroundColor White
Write-Host "     - VITE_API_URL=$BACKEND_URL/api" -ForegroundColor Gray
Write-Host "  3. Configurar como sitio estático" -ForegroundColor White
Write-Host ""

Write-Host "VERIFICACIÓN:" -ForegroundColor Cyan
Write-Host "  Backend Health: $BACKEND_URL/api/health" -ForegroundColor White
Write-Host "  Frontend:       $FRONTEND_URL" -ForegroundColor White
Write-Host ""

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  ✓ BUILD COMPLETADO EXITOSAMENTE  " -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan

Set-Location ..
