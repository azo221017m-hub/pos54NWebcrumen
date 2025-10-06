
console.log('[FETCH] VITE_API_URL:', import.meta.env.VITE_API_URL);


// frontend/src/services/api.ts
export interface Negocio {
  id: number;
  nombre: string;
  numerocliente: string;
  direccion: string;
  telefono: string;
}

export const fetchNegocios = async (): Promise<Negocio[]> => {
  const response = await fetch(import.meta.env.VITE_API_URL + "/api/negocios");
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }

  const data: Negocio[] = await response.json();
  return data;
};

