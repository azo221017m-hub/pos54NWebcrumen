/**
 * Configuración de rangos de margen bruto para clasificación financiera
 * Estos valores son configurables y pueden ajustarse según la industria o política del negocio
 */

export const MARGEN_CONFIG = {
  // Rangos de clasificación del margen (%)
  RANGOS: {
    CRITICO: {
      MAX: 30,
      LABEL: 'CRÍTICO',
      DESCRIPCION: 'Margen muy bajo (riesgoso)',
      COLOR: '#ef4444', // red-500
      NIVEL_ALERTA: 'ALTA'
    },
    BAJO: {
      MIN: 30,
      MAX: 40,
      LABEL: 'BAJO',
      DESCRIPCION: 'Requiere revisión',
      COLOR: '#f59e0b', // amber-500
      NIVEL_ALERTA: 'MEDIA'
    },
    SALUDABLE: {
      MIN: 40,
      MAX: 50,
      LABEL: 'SALUDABLE',
      DESCRIPCION: 'Margen adecuado',
      COLOR: '#10b981', // green-500
      NIVEL_ALERTA: 'NINGUNA'
    },
    MUY_BUENO: {
      MIN: 50,
      MAX: 70,
      LABEL: 'MUY BUENO',
      DESCRIPCION: 'Margen excelente',
      COLOR: '#3b82f6', // blue-500
      NIVEL_ALERTA: 'NINGUNA'
    },
    REVISAR_COSTEO: {
      MIN: 70,
      LABEL: 'REVISAR COSTEO',
      DESCRIPCION: 'Posible error en costos',
      COLOR: '#8b5cf6', // purple-500
      NIVEL_ALERTA: 'ALTA'
    }
  },

  // Umbral para mostrar alertas/sugerencias
  UMBRAL_ALERTAS: 40,

  // Sugerencias predefinidas según problemas comunes
  ALERTAS: {
    RECETAS_MAL_COSTADAS: {
      codigo: 'REC001',
      mensaje: 'Recetas mal costadas',
      descripcion: 'Revisar costos de las recetas y actualizar precios de insumos',
      accion: 'Actualizar costeo de recetas en el sistema'
    },
    MERMAS_NO_REGISTRADAS: {
      codigo: 'MER001',
      mensaje: 'Mermas no registradas',
      descripcion: 'Las mermas pueden estar afectando el margen real',
      accion: 'Registrar mermas y desperdicios en el sistema'
    },
    PRECIO_VENTA_BAJO: {
      codigo: 'PVB001',
      mensaje: 'Precio de venta bajo',
      descripcion: 'Los precios de venta pueden no estar cubriendo los costos adecuadamente',
      accion: 'Revisar y ajustar precios de venta'
    },
    INSUMOS_SOBRECOSTO: {
      codigo: 'INS001',
      mensaje: 'Insumos con sobrecosto',
      descripcion: 'Algunos insumos pueden tener costos elevados',
      accion: 'Negociar con proveedores o buscar alternativas'
    }
  }
} as const;

export type ClasificacionMargen = 
  | 'CRÍTICO'
  | 'BAJO'
  | 'SALUDABLE'
  | 'MUY BUENO'
  | 'REVISAR COSTEO';

export interface AlertaMargen {
  codigo: string;
  mensaje: string;
  descripcion: string;
  accion: string;
}

export interface ResultadoEvaluacionMargen {
  clasificacion: ClasificacionMargen;
  descripcion: string;
  color: string;
  nivelAlerta: string;
  alertas: AlertaMargen[];
}
