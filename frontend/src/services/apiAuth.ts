// src/config/api.ts
export const API_URL = "https://pos54nwebcrumenbackend.onrender.com";

export const validarCliente = async (numerodecliente: string) => {
  console.log('[CLIENTE] Iniciando validarCliente con:', numerodecliente);
  try {
    const response = await fetch(`${API_URL}/api/auth/validar-cliente`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ numerodecliente })
    });

    console.log('[CLIENTE] Response status:', response.status);

    const data = await response.json();
    console.log('[CLIENTE] Response data:', data);

    return data;
  } catch (error) {
    console.error('[CLIENTE] Error al validar cliente:', error);
    return { ok: false };
  }
};

export const validarUsuario = async (nombredeusuario: string, contrasenia: string) => {
  console.log('[USUARIO] Iniciando validarUsuario con:', { nombredeusuario, contrasenia });
  try {
    const response = await fetch(`${API_URL}/api/auth/validar-usuario`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombredeusuario, contrasenia }),
    });

    console.log('[USUARIO] Response status:', response.status);

    const data = await response.json();
    console.log('[USUARIO] Response data:', data);

    return data;
  } catch (error) {
    console.error('[USUARIO] Error conexión validar-usuario:', error);
    return { ok: false, mensaje: 'Error de conexión con el servidor' };
  }
};
