import { Router } from "express";
import { auth } from "../middlewares/auth.middleware.js";
import { tenant } from "../middlewares/tenant.middleware.js";
import { role } from "../middlewares/role.middleware.js";
import { listar, crear, actualizar, alertasStock } from "../controllers/productos.controller.js";

const router = Router();

router.use(auth, tenant);

// Montada antes de "/" para no competir con futuras rutas con parámetro.
router.get("/alertas-stock", role("ADMIN"), alertasStock);
router.get("/", role("ADMIN", "VENDEDOR", "CONTADOR"), listar);
router.post("/", role("ADMIN"), crear);
router.patch("/:id", role("ADMIN"), actualizar);

export default router;
