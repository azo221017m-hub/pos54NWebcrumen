export const validarCliente = async (numerodecliente: string) => {
  try {
    const response = await fetch('http://localhost:3000/api/auth/validar-cliente', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ numerodecliente }),
    });
    return await response.json();
  } catch (error) {
    console.error('[CLIENTE] Error conexión validar-cliente:', error);
    return { ok: false, mensaje: 'Error de conexión con el servidor' };
  }
};

export const validarUsuario = async (nombredeusuario: string, contrasenia: string) => {
  try {
    const response = await fetch('http://localhost:3000/api/auth/validar-usuario', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombredeusuario, contrasenia }),
    });
    return await response.json();
  } catch (error) {
    console.error('[CLIENTE] Error conexión validar-usuario:', error);
    return { ok: false, mensaje: 'Error de conexión con el servidor' };
  }
};
