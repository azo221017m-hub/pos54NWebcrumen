# Blueprint: POSWEBCrumen27

## Visión General

Una aplicación de punto de venta (POS) basada en la web construida con React, Vite, TypeScript y MySQL. Incluye un manejo seguro de sesiones mediante tokens JWT y sigue las mejores prácticas de arquitectura y seguridad.

## Características Implementadas

### v0.1: Configuración Inicial y Pantalla de Presentación

*   **Stack Tecnológico:** React, Vite, TypeScript.
*   **Estilo:** CSS personalizado con una paleta de colores verdes.
*   **Enrutamiento:** `react-router-dom` para la navegación.
*   **Componentes:**
    *   `PantallaPresentacion`: Una pantalla de bienvenida con el logotipo del sistema y frases animadas.

## Plan Actual

### v0.2: Autenticación de Usuario

*   **Backend:** Conexión al backend en `https://pos54nwebcrumenbackend.onrender.com`.
*   **Componentes:**
    *   `PantallaDeAcceso`: Un formulario de inicio de sesión de dos pasos:
        1.  Validación de cliente.
        2.  Validación de usuario y contraseña.
    *   `TableroInicial`: La página a la que se redirige a los usuarios después de un inicio de sesión exitoso.
*   **Seguridad:**
    *   Bloqueo de la cuenta después de 4 intentos fallidos.
    *   Creación de un token JWT al iniciar sesión.
    *   La sesión expira después de 3 minutos de inactividad.
*   **Servicios:**
    *   `api.ts`: Un servicio para centralizar todas las llamadas a la API del backend.
