import { Router } from "express";
import { registrar } from "../controllers/negocios.controller.js";

const router = Router();

router.post("/", registrar);

export default router;
