/**
 * Utilidades para evaluar y clasificar márgenes de ganancia
 */

import { 
  MARGEN_CONFIG, 
  ClasificacionMargen, 
  AlertaMargen, 
  ResultadoEvaluacionMargen 
} from '../config/margen.config';

/**
 * Evalúa el porcentaje de margen y retorna la clasificación con alertas si aplica
 * 
 * @param porcentajeMargen - Porcentaje de margen calculado (0-100+)
 * @returns Objeto con clasificación, descripción, color, nivel de alerta y sugerencias
 * 
 * @example
 * const resultado = evaluarMargen(35);
 * // {
 * //   clasificacion: 'BAJO',
 * //   descripcion: 'Requiere revisión',
 * //   color: '#f59e0b',
 * //   nivelAlerta: 'MEDIA',
 * //   alertas: [...]
 * // }
 */
export function evaluarMargen(porcentajeMargen: number): ResultadoEvaluacionMargen {
  const { RANGOS, UMBRAL_ALERTAS, ALERTAS } = MARGEN_CONFIG;

  let clasificacion: ClasificacionMargen;
  let descripcion: string;
  let color: string;
  let nivelAlerta: string;

  // Clasificar según rangos
  if (porcentajeMargen < RANGOS.CRITICO.MAX) {
    clasificacion = RANGOS.CRITICO.LABEL;
    descripcion = RANGOS.CRITICO.DESCRIPCION;
    color = RANGOS.CRITICO.COLOR;
    nivelAlerta = RANGOS.CRITICO.NIVEL_ALERTA;
  } else if (porcentajeMargen >= RANGOS.BAJO.MIN && porcentajeMargen < RANGOS.BAJO.MAX) {
    clasificacion = RANGOS.BAJO.LABEL;
    descripcion = RANGOS.BAJO.DESCRIPCION;
    color = RANGOS.BAJO.COLOR;
    nivelAlerta = RANGOS.BAJO.NIVEL_ALERTA;
  } else if (porcentajeMargen >= RANGOS.SALUDABLE.MIN && porcentajeMargen <= RANGOS.SALUDABLE.MAX) {
    clasificacion = RANGOS.SALUDABLE.LABEL;
    descripcion = RANGOS.SALUDABLE.DESCRIPCION;
    color = RANGOS.SALUDABLE.COLOR;
    nivelAlerta = RANGOS.SALUDABLE.NIVEL_ALERTA;
  } else if (porcentajeMargen > RANGOS.MUY_BUENO.MIN && porcentajeMargen <= RANGOS.MUY_BUENO.MAX) {
    clasificacion = RANGOS.MUY_BUENO.LABEL;
    descripcion = RANGOS.MUY_BUENO.DESCRIPCION;
    color = RANGOS.MUY_BUENO.COLOR;
    nivelAlerta = RANGOS.MUY_BUENO.NIVEL_ALERTA;
  } else {
    // porcentajeMargen > 70
    clasificacion = RANGOS.REVISAR_COSTEO.LABEL;
    descripcion = RANGOS.REVISAR_COSTEO.DESCRIPCION;
    color = RANGOS.REVISAR_COSTEO.COLOR;
    nivelAlerta = RANGOS.REVISAR_COSTEO.NIVEL_ALERTA;
  }

  // Generar alertas si el margen está por debajo del umbral
  const alertas: AlertaMargen[] = [];
  
  if (porcentajeMargen < UMBRAL_ALERTAS) {
    // Agregar todas las sugerencias de mejora
    alertas.push(
      {
        codigo: ALERTAS.RECETAS_MAL_COSTADAS.codigo,
        mensaje: ALERTAS.RECETAS_MAL_COSTADAS.mensaje,
        descripcion: ALERTAS.RECETAS_MAL_COSTADAS.descripcion,
        accion: ALERTAS.RECETAS_MAL_COSTADAS.accion
      },
      {
        codigo: ALERTAS.MERMAS_NO_REGISTRADAS.codigo,
        mensaje: ALERTAS.MERMAS_NO_REGISTRADAS.mensaje,
        descripcion: ALERTAS.MERMAS_NO_REGISTRADAS.descripcion,
        accion: ALERTAS.MERMAS_NO_REGISTRADAS.accion
      },
      {
        codigo: ALERTAS.PRECIO_VENTA_BAJO.codigo,
        mensaje: ALERTAS.PRECIO_VENTA_BAJO.mensaje,
        descripcion: ALERTAS.PRECIO_VENTA_BAJO.descripcion,
        accion: ALERTAS.PRECIO_VENTA_BAJO.accion
      },
      {
        codigo: ALERTAS.INSUMOS_SOBRECOSTO.codigo,
        mensaje: ALERTAS.INSUMOS_SOBRECOSTO.mensaje,
        descripcion: ALERTAS.INSUMOS_SOBRECOSTO.descripcion,
        accion: ALERTAS.INSUMOS_SOBRECOSTO.accion
      }
    );
  }

  // Si el margen es muy alto (>70%), agregar alerta de revisión de costeo
  if (porcentajeMargen > RANGOS.MUY_BUENO.MAX) {
    alertas.push({
      codigo: 'COST001',
      mensaje: 'Verificar costeo de productos',
      descripcion: 'Un margen superior al 70% puede indicar errores en el registro de costos',
      accion: 'Revisar y validar los costos de los productos vendidos'
    });
  }

  return {
    clasificacion,
    descripcion,
    color,
    nivelAlerta,
    alertas
  };
}

/**
 * Calcula el margen bruto y porcentaje de margen, con validaciones
 * 
 * @param ventas - Total de ventas
 * @param costoVenta - Costo total de venta
 * @returns Objeto con margen bruto y porcentaje, maneja división por cero
 */
export function calcularMargen(ventas: number, costoVenta: number) {
  // Validar que los valores sean números válidos
  const ventasValidas = Number(ventas) || 0;
  const costoVentaValido = Number(costoVenta) || 0;

  // Calcular margen bruto
  const margenBruto = ventasValidas - costoVentaValido;

  // Calcular porcentaje de margen (validar división por cero)
  const porcentajeMargen = ventasValidas > 0 
    ? (margenBruto / ventasValidas) * 100 
    : 0;

  return {
    margenBruto,
    porcentajeMargen: Number(porcentajeMargen.toFixed(2))
  };
}

/**
 * Función completa que calcula y evalúa el margen en un solo paso
 * 
 * @param ventas - Total de ventas
 * @param costoVenta - Costo total de venta
 * @returns Objeto completo con cálculos, clasificación y alertas
 */
export function calcularYEvaluarMargen(ventas: number, costoVenta: number) {
  const { margenBruto, porcentajeMargen } = calcularMargen(ventas, costoVenta);
  const evaluacion = evaluarMargen(porcentajeMargen);

  return {
    ventas: Number(ventas) || 0,
    costoVenta: Number(costoVenta) || 0,
    margenBruto,
    porcentajeMargen,
    clasificacion: evaluacion.clasificacion,
    descripcion: evaluacion.descripcion,
    color: evaluacion.color,
    nivelAlerta: evaluacion.nivelAlerta,
    alertas: evaluacion.alertas
  };
}
