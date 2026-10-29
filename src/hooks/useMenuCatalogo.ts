import { useQuery, useQueryClient } from '@tanstack/react-query';
import { obtenerProductosWeb } from '../services/productosWebService';
import { obtenerCategorias } from '../services/categoriasService';
import { obtenerModeradores } from '../services/moderadoresService';
import { obtenerCatModeradores } from '../services/catModeradoresService';
import { obtenerDescuentos } from '../services/descuentosService';

/**
 * Catálogo de venta (categorías, platillos, modificadores y descuentos).
 *
 * MODO ONLINE. Todo el catálogo se lee directamente de la API en cada consulta;
 * no hay copia local en IndexedDB ni sincronización por versiones. React Query
 * mantiene la respuesta en memoria durante la sesión (ver config/queryClient.ts)
 * para que navegar entre pasos del flujo de venta no vuelva a descargar el
 * catálogo completo -incluyendo las fotos en base64- en cada montaje.
 *
 * Si el dispositivo pierde la conexión, estas consultas fallan: el sistema
 * requiere estar en línea para operar.
 */

export const MENU_CATALOGO_QUERY_KEYS = {
  productosWeb: ['productos-web'] as const,
  categorias: ['categorias'] as const,
  moderadores: ['moderadores-catalogo'] as const,
  catModeradores: ['cat-moderadores-catalogo'] as const,
  descuentos: ['descuentos-catalogo'] as const
};

/** Negocio de la sesión; lo exige el endpoint de moderadores. */
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

export const useProductosWebCatalogo = () =>
  useQuery({
    queryKey: MENU_CATALOGO_QUERY_KEYS.productosWeb,
    queryFn: obtenerProductosWeb
  });

export const useCategoriasCatalogo = () =>
  useQuery({
    queryKey: MENU_CATALOGO_QUERY_KEYS.categorias,
    queryFn: obtenerCategorias
  });

export const useModeradoresCatalogo = () =>
  useQuery({
    queryKey: MENU_CATALOGO_QUERY_KEYS.moderadores,
    queryFn: () => {
      const idnegocio = idNegocioSesion();
      return idnegocio ? obtenerModeradores(idnegocio) : Promise.resolve([]);
    }
  });

export const useCatModeradoresCatalogo = () =>
  useQuery({
    queryKey: MENU_CATALOGO_QUERY_KEYS.catModeradores,
    queryFn: obtenerCatModeradores
  });

export const useDescuentosCatalogo = () =>
  useQuery({
    queryKey: MENU_CATALOGO_QUERY_KEYS.descuentos,
    queryFn: obtenerDescuentos
  });

// Usado por las pantallas de administración (ConfigProductosWeb/ConfigCategorias) tras un
// create/update/delete, para que el catálogo cacheado en las pantallas de venta no quede obsoleto.
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
