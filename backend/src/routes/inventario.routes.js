import { Router } from "express";
import { auth } from "../middlewares/auth.middleware.js";
import { tenant } from "../middlewares/tenant.middleware.js";
import { role } from "../middlewares/role.middleware.js";
import { registrar, listar } from "../controllers/inventario.controller.js";

const router = Router();

router.use(auth, tenant);

router.post("/movimientos", role("ADMIN", "VENDEDOR"), registrar);
router.get("/movimientos", role("ADMIN", "CONTADOR"), listar);

export default router;
