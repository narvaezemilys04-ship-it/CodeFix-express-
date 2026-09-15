import { Router } from "express";
import { auth } from "../middlewares/auth.middleware.js";
import { tenant } from "../middlewares/tenant.middleware.js";
import { role } from "../middlewares/role.middleware.js";
import { listar, crear, actualizar } from "../controllers/usuarios.controller.js";

const router = Router();

router.use(auth, tenant, role("ADMIN"));

router.get("/", listar);
router.post("/", crear);
router.patch("/:id", actualizar);

export default router;
