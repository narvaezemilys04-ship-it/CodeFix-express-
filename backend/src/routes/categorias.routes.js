import { Router } from "express";
import { auth } from "../middlewares/auth.middleware.js";
import { tenant } from "../middlewares/tenant.middleware.js";
import { role } from "../middlewares/role.middleware.js";
import { crear, listar } from "../controllers/categorias.controller.js";

const router = Router();

router.use(auth, tenant);

router.get("/", role("ADMIN", "VENDEDOR", "CONTADOR"), listar);
router.post("/", role("ADMIN"), crear);

export default router;
