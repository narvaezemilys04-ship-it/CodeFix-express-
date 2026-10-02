import { validarCrearCategoria } from "../validators/categorias.validator.js";
import { crearCategoria, listarCategorias } from "../services/categorias.service.js";
import { ValidationError } from "../utils/errors.js";

export async function crear(req, res, next) {
	try {
		const errores = validarCrearCategoria(req.body);
		if (errores.length > 0) {
			throw new ValidationError(errores.join(" "));
		}
		const categoria = await crearCategoria(req.tenantId, req.body);
		res.status(201).json({ categoria });
	} catch (error) {
		next(error);
	}
}

export async function listar(req, res, next) {
	try {
		const categorias = await listarCategorias(req.tenantId);
		res.status(200).json({ categorias });
	} catch (error) {
		next(error);
	}
}
