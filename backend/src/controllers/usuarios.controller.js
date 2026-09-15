import { validarCrearUsuario, validarActualizarUsuario } from "../validators/usuarios.validator.js";
import { listarUsuarios, crearUsuario, actualizarUsuario } from "../services/usuarios.service.js";
import { ValidationError } from "../utils/errors.js";

export async function listar(req, res, next) {
	try {
		const usuarios = await listarUsuarios(req.tenantId);
		res.status(200).json({ usuarios });
	} catch (error) {
		next(error);
	}
}

export async function crear(req, res, next) {
	try {
		const errores = validarCrearUsuario(req.body);
		if (errores.length > 0) {
			throw new ValidationError(errores.join(" "));
		}
		const usuario = await crearUsuario(req.tenantId, req.body);
		res.status(201).json({ usuario });
	} catch (error) {
		next(error);
	}
}

export async function actualizar(req, res, next) {
	try {
		const errores = validarActualizarUsuario(req.body);
		if (errores.length > 0) {
			throw new ValidationError(errores.join(" "));
		}
		const usuarioId = Number(req.params.id);
		const usuario = await actualizarUsuario(req.tenantId, usuarioId, req.body);
		res.status(200).json({ usuario });
	} catch (error) {
		next(error);
	}
}
