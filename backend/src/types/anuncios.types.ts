export interface Anuncio {
  idAnuncio: number;
  tituloDeAnuncio: string;
  detalleAnuncio: string | null;
  imagen1Anuncio: string | null;
  imagen2Anuncio: string | null;
  imagen3Anuncio: string | null;
  imagen4Anuncio: string | null;
  imagen5Anuncio: string | null;
  fechaDeVigencia: string | null;
  usuarioauditoria: string | null;
  fechamodificacionauditoria: string | null;
}

export interface AnuncioCreate {
  tituloDeAnuncio: string;
  detalleAnuncio?: string;
  imagen1Anuncio?: string;
  imagen2Anuncio?: string;
  imagen3Anuncio?: string;
  imagen4Anuncio?: string;
  imagen5Anuncio?: string;
  fechaDeVigencia?: string;
}

export interface AnuncioUpdate {
  tituloDeAnuncio?: string;
  detalleAnuncio?: string;
  imagen1Anuncio?: string;
  imagen2Anuncio?: string;
  imagen3Anuncio?: string;
  imagen4Anuncio?: string;
  imagen5Anuncio?: string;
  fechaDeVigencia?: string;
}
