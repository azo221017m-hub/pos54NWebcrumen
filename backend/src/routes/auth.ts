// backend/src/routes/auth.ts
import { Router } from "express";
import { pool } from "../db"; // Asegúrate de tener tu conexión MySQL en db.js
import { RowDataPacket } from "mysql2/promise";

const router = Router();


interface NegocioInsert {
  numerocliente: string;
  nombreNegocio: string;
  rfc: string;
  direccion: string;
  telefono: string;
  usuario: string;
}

router.post("/insertar", async (req, res) => {
  const {
    numerocliente,
    nombreNegocio,
    rfc,
    direccion,
    telefono,
    usuario,
  } = req.body as NegocioInsert;

  // Validar campos obligatorios
  if (!numerocliente || !nombreNegocio || !direccion || !telefono) {
    return res.status(400).json({ ok: false, mensaje: "Campos obligatorios faltantes" });
  }

  try {
    const fechaActual = new Date();
    await pool.query(
      `INSERT INTO tblposcrumenwebnegocio
        (numerocliente, nombreNegocio, rfc, direccion, telefono, estatusCliente, fechaRegistro, fechaActualizacion, usuario)
       VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?)`,
      [numerocliente, nombreNegocio, rfc, direccion, telefono, fechaActual, fechaActual, usuario]
    );

    res.json({ ok: true, mensaje: "Negocio insertado correctamente" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, mensaje: "Error al insertar negocio" });
  }
});



// Interfaz de los datos que devuelve la tabla
interface NegocioBD extends RowDataPacket {
  idNegocio: number;
  nombreNegocio: string;
  numerocliente: string;
  direccion: string;
  telefono: string;
}

// ✅ Endpoint para obtener negocios
router.get("/negocios", async (req, res) => {
  try {
    const [rows] = await pool.query<NegocioBD[]>(
      "SELECT idNegocio, nombreNegocio, numerocliente,direccion, telefono FROM tblposcrumenwebnegocio"
    );

    // Mapear campos a la estructura que React espera
    const negocios = rows.map((n) => ({
      id: n.idNegocio,
      nombre: n.nombreNegocio,
      numerocliente: n.numerocliente,
      direccion: n.direccion,
      telefono: n.telefono,
    }));
console.log("Negocios obtenidos:", negocios);
    res.json(negocios);
  } catch (err) {
    console.error("Error al obtener negocios:", err);
    res.status(500).json({ error: "Error al obtener negocios" });
  }
});

export default router;
