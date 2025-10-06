import React, { useEffect, useState } from "react";
// Después
import { fetchNegocios } from "../services/api";
import type { Negocio } from "../services/api";

export const TablaNegocio: React.FC = () => {
  const [negocios, setNegocios] = useState<Negocio[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargarNegocios = async () => {
      setLoading(true);
      try {
        const data = await fetchNegocios();
        setNegocios(data);
      } catch (err) {
        if (err instanceof Error) setError(err.message);
        else setError("Error desconocido al cargar negocios");
      } finally {
        setLoading(false);
      }
    };

    cargarNegocios();
  }, []);

  if (loading) return <p>Cargando negocios...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-3">📋 Negocios</h2>
      {negocios.length === 0 ? (
        <p>No hay negocios registrados.</p>
      ) : (
        <table className="border-collapse border border-gray-300 w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">ID</th>
              <th className="border p-2">Nombre</th>
              <th className="border p-2">NumClient</th>
                <th className="border p-2">Dirección</th>
              <th className="border p-2">Teléfono</th>
            </tr>
          </thead>
          <tbody>
            {negocios.map((n) => (
              <tr key={n.id} className="hover:bg-gray-50">
                <td className="border p-2 text-center">{n.id}</td>
                <td className="border p-2">{n.nombre}</td>
                <td className="border p-2">{n.numerocliente}</td>
                <td className="border p-2">{n.direccion}</td>
                <td className="border p-2">{n.telefono}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
 
    </div>
  );
};
