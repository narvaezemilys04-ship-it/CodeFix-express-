import { validarMovimiento } from "../validators/inventario.validator.js";
import { registrarMovimiento, listarMovimientos } from "../services/inventario.service.js";
import { ValidationError, ForbiddenError } from "../utils/errors.js";

export async function registrar(req, res, next) {
	try {
		const errores = validarMovimiento(req.body);
		if (errores.length > 0) {
			throw new ValidationError(errores.join(" "));
		}
		// VENDEDOR solo puede registrar salidas (ventas); ENTRADA/AJUSTE son
		// exclusivos de ADMIN (DDS 4.2).
		if (req.user.rol === "VENDEDOR" && req.body.tipo !== "SALIDA") {
			throw new ForbiddenError("Como VENDEDOR solo podés registrar salidas de inventario.");
		}
		const movimiento = await registrarMovimiento(req.tenantId, req.body);
		res.status(201).json({ movimiento });
	} catch (error) {
		next(error);
	}
}

export async function listar(req, res, next) {
	try {
		const movimientos = await listarMovimientos(req.tenantId);
		res.status(200).json({ movimientos });
	} catch (error) {
		next(error);
	}
}
