import { AppError } from "../utils/errors.js";

// Middleware de 4 parámetros: Express lo reconoce como manejador de errores
// solo si tiene esta firma exacta. Debe montarse al final, después de todas
// las rutas (DDS 4.4).
export function errorHandler(err, req, res, next) {
	if (err instanceof AppError) {
		return res.status(err.status).json({ error: { codigo: err.codigo, mensaje: err.message } });
	}

	console.error(err);
	return res
		.status(500)
		.json({ error: { codigo: "ERROR_INTERNO", mensaje: "Ocurrió un error inesperado." } });
}
