import { verificarToken } from "../utils/jwt.js";
import { UnauthorizedError } from "../utils/errors.js";

export function auth(req, res, next) {
	const authHeader = req.headers.authorization;

	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		return next(new UnauthorizedError("Token no proporcionado."));
	}

	const token = authHeader.slice("Bearer ".length);

	try {
		const payload = verificarToken(token);
		req.user = { id: payload.id, rol: payload.rol, tenantId: payload.tenantId };
		next();
	} catch (error) {
		next(new UnauthorizedError("Token inválido o expirado."));
	}
}
