import { validarRegistroNegocio } from "../validators/negocios.validator.js";
import {
	registrarNegocioConAdmin,
	NitDuplicadoError,
	CorreoDuplicadoError,
} from "../services/negocios.service.js";

export async function registrar(req, res) {
	const errores = validarRegistroNegocio(req.body);
	if (errores.length > 0) {
		return res.status(400).json({ error: { codigo: "VALIDACION", mensaje: errores.join(" ") } });
	}

	try {
		const { negocio, usuario } = await registrarNegocioConAdmin(req.body);
		return res.status(201).json({
			negocio,
			usuario: {
				id: usuario.id,
				nombre: usuario.nombre,
				correo: usuario.correo,
				rol: usuario.rol,
				activo: usuario.activo,
			},
		});
	} catch (error) {
		if (error instanceof NitDuplicadoError) {
			return res.status(409).json({ error: { codigo: "NIT_DUPLICADO", mensaje: error.message } });
		}
		if (error instanceof CorreoDuplicadoError) {
			return res.status(409).json({ error: { codigo: "CORREO_DUPLICADO", mensaje: error.message } });
		}
		console.error(error);
		return res
			.status(500)
			.json({ error: { codigo: "ERROR_INTERNO", mensaje: "No se pudo registrar el negocio." } });
	}
}
