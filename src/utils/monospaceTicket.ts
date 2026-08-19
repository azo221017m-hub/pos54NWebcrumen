// TicketRenderer para tickets de texto plano (monoespaciado, fuente 'Courier New').
// Todas las funciones reciben el ancho de columnas (PrinterProfile.charactersPerLine)
// y NUNCA cortan información: cuando un valor no cabe, se envuelve a una línea
// adicional en vez de truncarse (ver filaProducto).

/** Línea separadora de `ancho` caracteres. */
export const separador = (ancho: number, char: string = '='): string => char.repeat(ancho);

/** Centra un texto en `ancho` columnas. Si es más largo que `ancho`, se devuelve sin cortar
 *  (se dejará envolver por el navegador/impresora en vez de perder información). */
export const centrar = (texto: string, ancho: number): string => {
  if (texto.length >= ancho) return texto;
  const pad = Math.floor((ancho - texto.length) / 2);
  return ' '.repeat(pad) + texto;
};

/**
 * Dos columnas: etiqueta izquierda, valor derecho, dentro de `ancho` columnas.
 * Si no caben en una sola línea (papel angosto), envuelve: etiqueta en su línea,
 * valor alineado a la derecha en la siguiente — nunca se corta el valor.
 */
export const fila2col = (etiqueta: string, valor: string, ancho: number): string => {
  const espacio = ancho - etiqueta.length - valor.length;
  if (espacio > 0) return etiqueta + ' '.repeat(espacio) + valor;
  if (valor.length <= ancho) return `${etiqueta}\n${valor.padStart(ancho)}`;
  return `${etiqueta}\n${valor}`;
};

/** Divide texto en líneas de ≤ maxLen caracteres, respetando palabras completas. */
export const wrapTexto = (texto: string, maxLen: number): string[] => {
  if (texto.length <= maxLen) return [texto];
  const palabras = texto.split(' ');
  const lineas: string[] = [];
  let linea = '';
  for (const p of palabras) {
    if ((linea ? linea + ' ' + p : p).length <= maxLen) {
      linea = linea ? linea + ' ' + p : p;
    } else {
      if (linea) lineas.push(linea);
      // Palabra individual más larga que una línea completa: se reparte en varias
      // líneas de `maxLen` (nunca se descarta el resto del texto).
      let resto = p;
      while (resto.length > maxLen) {
        lineas.push(resto.slice(0, maxLen));
        resto = resto.slice(maxLen);
      }
      linea = resto;
    }
  }
  if (linea) lineas.push(linea);
  return lineas;
};

/**
 * Fila de producto/insumo a `ancho` columnas: nombre (izq) + cantidad + importe (der).
 * Si el nombre no cabe en la columna izquierda junto con cantidad/importe, se envuelve
 * a línea(s) adicionales — nunca se corta el nombre.
 */
export const filaProducto = (nombre: string, cant: string, importe: string, ancho: number): string[] => {
  const colCant = 4;
  const colImporte = Math.max(10, Math.floor(ancho * 0.35));
  const colNombre = ancho - colCant - colImporte;
  const cantImporte = cant.padStart(colCant) + importe.padStart(colImporte);

  if (nombre.length <= colNombre) {
    return [nombre.padEnd(colNombre) + cantImporte];
  }
  const lineasNombre = wrapTexto(nombre, ancho);
  const ultima = ' '.repeat(Math.max(0, ancho - cantImporte.length)) + cantImporte;
  return [...lineasNombre, ultima];
};
