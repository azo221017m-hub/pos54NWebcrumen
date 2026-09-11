import { useQuery, useQueryClient } from '@tanstack/react-query';
import { obtenerProductosWeb } from '../services/productosWebService';
import { obtenerCategorias } from '../services/categoriasService';
import { obtenerModeradores } from '../services/moderadoresService';
import { obtenerCatModeradores } from '../services/catModeradoresService';
import { obtenerDescuentos } from '../services/descuentosService';
import {
  leerColeccion,
  leerVersionLocal,
  soportaIndexedDB,
  type NombreColeccion
} from '../services/catalogoDB';
import { sincronizarCatalogo } from '../services/catalogoSyncService';
import type { ProductoWeb } from '../types/productoWeb.types';
import type { Categoria } from '../types/categoria.types';
import type { Moderador } from '../types/moderador.types';
import type { CatModerador } from '../types/catModerador.types';
import type { Descuento } from '../types/descuento.types';

/**
 * Catálogo de venta (categorías, platillos, modificadores y descuentos).
 *
 * Desde la incorporación de la PWA offline, estos hooks leen de IndexedDB en vez
 * de pegarle a la API en cada montaje de pantalla. React Query sigue siendo la
 * caché en memoria; la copia local de IndexedDB es la que permite abrir el POS
 * al instante y operar sin conexión. La sincronización con MySQL la orquesta
 * `useCatalogoSync` (montado en App), disparada por eventos, no por polling.
 *
 * Si el navegador no soporta IndexedDB, o si la copia local falla, se cae de
 * vuelta a los servicios HTTP de siempre: el comportamiento anterior se conserva.
 */

export const MENU_CATALOGO_QUERY_KEYS = {
  productosWeb: ['productos-web'] as const,
  categorias: ['categorias'] as const,
  moderadores: ['moderadores-catalogo'] as const,
  catModeradores: ['cat-moderadores-catalogo'] as const,
  descuentos: ['descuentos-catalogo'] as const
};

/** Negocio de la sesión, usado para particionar la copia local. */
const idNegocioSesion = (): number | null => {
  try {
    const usuarioRaw = localStorage.getItem('usuario');
    if (usuarioRaw) {
      const usuario = JSON.parse(usuarioRaw) as { idNegocio?: number | string };
      const id = Number(usuario?.idNegocio);
      if (Number.isFinite(id) && id > 0) return id;
    }
    const idPlano = Number(localStorage.getItem('idnegocio'));
    return Number.isFinite(idPlano) && idPlano > 0 ? idPlano : null;
  } catch {
    return null;
  }
};

/**
 * Lee una colección del catálogo local. Si todavía no hay copia local (primer
 * arranque), espera a la primera sincronización; si ésta falla, usa la API.
 */
const leerCatalogo = async <T>(
  coleccion: NombreColeccion,
  respaldoApi: () => Promise<T[]>
): Promise<T[]> => {
  const idnegocio = idNegocioSesion();

  if (!idnegocio || !soportaIndexedDB()) {
    return respaldoApi();
  }

  try {
    const versionLocal = await leerVersionLocal(idnegocio);

    // Sin copia local: hay que poblarla antes de poder mostrar algo.
    if (versionLocal === 0) {
      const sincronizado = await sincronizarCatalogo(idnegocio);
      if (!sincronizado) return respaldoApi();
    }

    return await leerColeccion<T>(coleccion, idnegocio);
  } catch (error) {
    console.warn(`[Catalogo] fallo al leer "${coleccion}" de IndexedDB, usando API:`, error);
    return respaldoApi();
  }
};

export const useProductosWebCatalogo = () =>
  useQuery({
    queryKey: MENU_CATALOGO_QUERY_KEYS.productosWeb,
    queryFn: () => leerCatalogo<ProductoWeb>('productos', obtenerProductosWeb)
  });

export const useCategoriasCatalogo = () =>
  useQuery({
    queryKey: MENU_CATALOGO_QUERY_KEYS.categorias,
    queryFn: () => leerCatalogo<Categoria>('categorias', obtenerCategorias)
  });

export const useModeradoresCatalogo = () =>
  useQuery({
    queryKey: MENU_CATALOGO_QUERY_KEYS.moderadores,
    queryFn: () =>
      // El respaldo HTTP necesita el idnegocio explícito; se resuelve aquí y no
      // desde el estado del componente, para que no dependa del orden de montaje.
      leerCatalogo<Moderador>('moderadores', () => {
        const idnegocio = idNegocioSesion();
        return idnegocio ? obtenerModeradores(idnegocio) : Promise.resolve([]);
      })
  });

export const useCatModeradoresCatalogo = () =>
  useQuery({
    queryKey: MENU_CATALOGO_QUERY_KEYS.catModeradores,
    queryFn: () => leerCatalogo<CatModerador>('catModeradores', obtenerCatModeradores)
  });

export const useDescuentosCatalogo = () =>
  useQuery({
    queryKey: MENU_CATALOGO_QUERY_KEYS.descuentos,
    queryFn: () => leerCatalogo<Descuento>('descuentos', obtenerDescuentos)
  });

// Usado por las pantallas de administración (ConfigProductosWeb/ConfigCategorias) tras un
// create/update/delete, para que el catálogo cacheado en las pantallas de venta no quede obsoleto.
// La copia de IndexedDB se actualiza por su cuenta al llegar el evento `catalogo_update`;
// estas invalidaciones sólo refrescan la caché en memoria de React Query.
export const useInvalidateMenuCatalogo = () => {
  const queryClient = useQueryClient();
  return {
    invalidateProductosWeb: () => queryClient.invalidateQueries({ queryKey: MENU_CATALOGO_QUERY_KEYS.productosWeb }),
    invalidateCategorias: () => queryClient.invalidateQueries({ queryKey: MENU_CATALOGO_QUERY_KEYS.categorias }),
    invalidateModeradores: () => queryClient.invalidateQueries({ queryKey: MENU_CATALOGO_QUERY_KEYS.moderadores }),
    invalidateCatModeradores: () => queryClient.invalidateQueries({ queryKey: MENU_CATALOGO_QUERY_KEYS.catModeradores }),
    invalidateDescuentos: () => queryClient.invalidateQueries({ queryKey: MENU_CATALOGO_QUERY_KEYS.descuentos })
  };
};
