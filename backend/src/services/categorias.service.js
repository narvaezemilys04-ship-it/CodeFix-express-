import prisma from "../config/prisma.js";
import { ConflictError } from "../utils/errors.js";

// Todo método recibe tenantId como primer parámetro y lo aplica en la
// consulta (DDS 5.3) — mismo patrón que negocios.service.js/usuarios.service.js
// del Sprint 1.

export async function crearCategoria(tenantId, datos) {
	try {
		return await prisma.categoriaProducto.create({
			data: { tenantId, ...datos },
		});
	} catch (error) {
		if (error.code === "P2002") {
			throw new ConflictError("Ya existe una categoría con ese nombre.", "CATEGORIA_DUPLICADA");
		}
		throw error;
	}
}

export async function listarCategorias(tenantId) {
	return prisma.categoriaProducto.findMany({ where: { tenantId } });
}
