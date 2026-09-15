import { validarLogin } from "../validators/auth.validator.js";
import { login, CredencialesInvalidasError } from "../services/auth.service.js";

export async function iniciarSesion(req, res) {
	const errores = validarLogin(req.body);
	if (errores.length > 0) {
		return res.status(400).json({ error: { codigo: "VALIDACION", mensaje: errores.join(" ") } });
	}

	const { correo, contrasena } = req.body;

	try {
		const resultado = await login(correo, contrasena);
		return res.status(200).json(resultado);
	} catch (error) {
		if (error instanceof CredencialesInvalidasError) {
			return res.status(401).json({ error: { codigo: "CREDENCIALES_INVALIDAS", mensaje: error.message } });
		}
		console.error(error);
		return res
			.status(500)
			.json({ error: { codigo: "ERROR_INTERNO", mensaje: "No se pudo iniciar sesión." } });
	}
}
