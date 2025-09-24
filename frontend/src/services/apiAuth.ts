// src/config/api.ts
export const API_URL = "https://pos54nwebcrumenbackend.onrender.com";

export const resp = await validarCliente('12345'); // número de cliente de prueba
console.log('[TEST] Respuesta validarCliente:', resp);

  
export const validarUsuario = async (nombredeusuario: string, contrasenia: string) => {
  console.log('[FETCH] Enviando validar-usuario:', { nombredeusuario, contrasenia });
  try {
    const response = await fetch(`${API_URL}/api/auth/validar-usuario`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombredeusuario, contrasenia }),
    });

    console.log('[FETCH] Respuesta raw validar-usuario:', response);

    const data = await response.json();
    console.log('[FETCH] JSON validar-usuario:', data);
    return data;
  } catch (error) {
    console.error('[FETCH] Error al validar usuario:', error);
    return { ok: false, mensaje: 'Error de conexión con el servidor' };
  }
};