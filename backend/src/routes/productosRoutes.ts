import { Router } from "express";
import uploadProducto from "../middlewares/uploadProducto";
import { getProductos, createProducto, updateProducto } from "../controllers/productosController";

const router = Router();

router.get("/", getProductos);
router.post("/", uploadProducto.single("imagenProducto"), createProducto);
router.put("/:id", uploadProducto.single("imagenProducto"), updateProducto);

export default router;
