import { ForbiddenError } from "../utils/errors.js";

// Debe montarse siempre DESPUÉS de auth.middleware: depende de req.user.
export function role(...rolesPermitidos) {
	return (req, res, next) => {
		if (!req.user || !rolesPermitidos.includes(req.user.rol)) {
			return next(new ForbiddenError("No tenés permisos para acceder a este recurso."));
		}
		next();
	};
}
