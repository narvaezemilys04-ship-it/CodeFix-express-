import { UnauthorizedError } from "../utils/errors.js";

// Debe montarse siempre DESPUÉS de auth.middleware: depende de req.user.
export function tenant(req, res, next) {
	if (!req.user?.tenantId) {
		return next(new UnauthorizedError("No se pudo resolver el negocio (tenant) del usuario."));
	}
	req.tenantId = req.user.tenantId;
	next();
}
