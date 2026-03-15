// Tipos para Anuncios (tblposcrumenwebanuncios)

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
}

export interface AnuncioCreate {
  tituloDeAnuncio: string;
  detalleAnuncio: string | null;
  imagen1Anuncio: string | null;
  imagen2Anuncio: string | null;
  imagen3Anuncio: string | null;
  imagen4Anuncio: string | null;
  imagen5Anuncio: string | null;
  fechaDeVigencia: string | null;
}

export interface AnuncioUpdate extends AnuncioCreate {
  idAnuncio: number;
}
