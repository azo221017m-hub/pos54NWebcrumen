export interface UMCompra {
  idUmCompra?: number;
  nombreUmCompra: string;
  valor: number;
  umMatPrima?: string;
  valorConvertido: number;
  fechaRegistroauditoria?: string;
  usuarioauditoria?: string;
  fehamodificacionauditoria?: string;
  idnegocio?: number;
}

export interface UMCompraResponse {
  success: boolean;
  message?: string;
  data?: UMCompra | UMCompra[] | { idUmCompra: number } | { esUnico: boolean };
  error?: string;
}

export interface UMCompraFormData {
  nombreUmCompra: string;
  valor: number;
  umMatPrima?: string;
  valorConvertido: number;
  idnegocio?: number;
  usuarioauditoria?: string;
}
