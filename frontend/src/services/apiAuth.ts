console.log('[FETCH] VITE_API_URL:', import.meta.env.VITE_API_URL);

// src/config/api.ts
export const validarCliente = async (numerodecliente: string) => {
  console.log('[FETCH] Enviando validar-cliente:', numerodecliente);

  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/validar-cliente`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ numerodecliente }),
    });

    console.log('[FETCH] Respuesta raw validar-cliente:', response);

    // 👇 Solo se hace una vez
    const data = await response.json();
    console.log('[FETCH] JSON validar-cliente:', data);

    return data;
  } catch (error) {
    console.error('[FETCH] Error al validar cliente:', error);
    return { ok: false };
  }
};



export const validarUsuario = async (nombredeusuario: string, contrasenia: string) => {
  console.log('[FETCH] Enviando validar-usuario:', { nombredeusuario, contrasenia });
  try {
    const response =  await fetch(`${import.meta.env.VITE_API_URL}/api/validar-usuario`, {
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