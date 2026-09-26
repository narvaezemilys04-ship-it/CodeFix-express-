import prisma from "../config/prisma.js";
import { ConflictError, NotFoundError } from "../utils/errors.js";

// Todo método recibe tenantId como primer parámetro y lo aplica en la
// consulta (DDS 5.3) — mismo patrón que negocios.service.js/usuarios.service.js
// del Sprint 1.

export async function listar(tenantId, filtros = {}) {
	return prisma.producto.findMany({
		where: { tenantId, activo: true, ...filtros },
		orderBy: { nombre: "asc" },
	});
}

export async function crear(tenantId, datos) {
	try {
		return await prisma.producto.create({
			data: { tenantId, ...datos },
		});
	} catch (error) {
		if (error.code === "P2002") {
			throw new ConflictError("Ya existe un producto con ese código en este negocio.", "CODIGO_DUPLICADO");
		}
		throw error;
	}
}

export async function actualizar(tenantId, productoId, cambios) {
	const producto = await prisma.producto.findFirst({ where: { id: productoId, tenantId } });
	if (!producto) {
		throw new NotFoundError("Producto no encontrado.");
	}

	return prisma.producto.update({
		where: { id: productoId },
		data: cambios,
	});
}

// Usado por la tarjeta [Sprint 2 - 05] (RF-008).
export async function listarAlertasStock(tenantId) {
	const productos = await prisma.producto.findMany({ where: { tenantId, activo: true } });
	return productos.filter((p) => p.stock < p.stockMinimo);
}
