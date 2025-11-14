import { Request, Response } from "express";
import pool from "../config/database";
import { ApiResponse } from "../types/index";
import path from "path";

// GET /api/productos
export async function getProductos(req: Request, res: Response) {
  try {
    const [rows] = await pool.execute(
      "SELECT * FROM tblposcrumenwebproductos WHERE estatus = 1"
    );
    res.json({ success: true, data: rows });
    console.log("📡 Productos listados");
  } catch (error) {
    console.log("❌ Error al listar productos", error);
    res.status(500).json({ success: false, error });
  }
}

// POST /api/productos
export async function createProducto(req: Request, res: Response) {
  try {
    const {
      idCategoria,
      idreferencia,
      nombre,
      descripcion,
      precio,
      estatus = 1,
      idmoderador,
      usuarioauditoria,
      idnegocio,
      porcentajeGanancia,
    } = req.body;
    let precioFinal = precio;
    if (porcentajeGanancia) {
      precioFinal = Number(precio) * (1 + Number(porcentajeGanancia) / 100);
    }
    let imagenProducto = null;
    if (req.file) {
      imagenProducto = path.join("uploads/productos", req.file.filename);
    }
    const now = new Date();
    const [result] = await pool.execute(
      `INSERT INTO tblposcrumenwebproductos 
      (idCategoria, idreferencia, nombre, descripcion, precio, estatus, imagenProducto, idmoderador, fechaRegistroauditoria, usuarioauditoria, fechamodificacionauditoria, idnegocio)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        idCategoria,
        idreferencia,
        nombre,
        descripcion,
        precioFinal,
        estatus,
        imagenProducto,
        idmoderador,
        now,
        usuarioauditoria,
        now,
        idnegocio,
      ]
    );
    res.json({ success: true, message: "Producto creado", data: result });
    console.log("✅ Producto creado");
  } catch (error) {
    console.log("❌ Error al crear producto", error);
    res.status(500).json({ success: false, error });
  }
}

// PUT /api/productos/:id
export async function updateProducto(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const {
      idCategoria,
      idreferencia,
      nombre,
      descripcion,
      precio,
      estatus,
      idmoderador,
      usuarioauditoria,
      idnegocio,
      porcentajeGanancia,
    } = req.body;
    let precioFinal = precio;
    if (porcentajeGanancia) {
      precioFinal = Number(precio) * (1 + Number(porcentajeGanancia) / 100);
    }
    let imagenProducto = req.body.imagenProducto;
    if (req.file) {
      imagenProducto = path.join("uploads/productos", req.file.filename);
    }
    const now = new Date();
    const [result] = await pool.execute(
      `UPDATE tblposcrumenwebproductos SET 
      idCategoria=?, idreferencia=?, nombre=?, descripcion=?, precio=?, estatus=?, imagenProducto=?, idmoderador=?, usuarioauditoria=?, fechamodificacionauditoria=?, idnegocio=?
      WHERE idProducto=?`,
      [
        idCategoria,
        idreferencia,
        nombre,
        descripcion,
        precioFinal,
        estatus,
        imagenProducto,
        idmoderador,
        usuarioauditoria,
        now,
        idnegocio,
        id,
      ]
    );
    res.json({ success: true, message: "Producto actualizado", data: result });
    console.log("✅ Producto actualizado");
  } catch (error) {
    console.log("❌ Error al actualizar producto", error);
    res.status(500).json({ success: false, error });
  }
}
