export const validarCliente = async (numerodecliente: string) => {
  try {
    const response = await fetch(`https://poswebcrumen-api.onrender.com/api/auth/validar-cliente`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ numerodecliente })
      }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al validar cliente:', error);
    return { ok: false };
  }
};

export const validarUsuario = async (nombredeusuario: string, contrasenia: string) => {
  try {
    const response = await fetch('https://poswebcrumen-api.onrender.com/api/auth/validar-usuario', {
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
