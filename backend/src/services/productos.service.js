import prisma from "../config/prisma.js";
import { ConflictError, NotFoundError } from "../utils/errors.js";
import { pick } from "../utils/pick.js";

// Todo método recibe tenantId como primer parámetro y lo aplica en la
// consulta (DDS 5.3) — mismo patrón que negocios.service.js/usuarios.service.js
// del Sprint 1.

const CAMPOS_CREAR = ["nombre", "descripcion", "codigo", "precio", "stock", "stockMinimo", "categoriaId"];
// Sin stock: solo cambia por movimientos de inventario (RF-007).
const CAMPOS_ACTUALIZAR = ["nombre", "descripcion", "codigo", "precio", "stockMinimo", "categoriaId", "activo"];

async function verificarCategoria(tenantId, categoriaId) {
	const categoria = await prisma.categoriaProducto.findFirst({ where: { id: categoriaId, tenantId } });
	if (!categoria) {
		throw new NotFoundError("Categoría no encontrada.");
	}
}

export async function listar(tenantId, filtros = {}) {
	return prisma.producto.findMany({
		where: { ...filtros, tenantId, activo: true },
		orderBy: { nombre: "asc" },
	});
}

export async function crear(tenantId, datos) {
	await verificarCategoria(tenantId, datos.categoriaId);

	try {
		return await prisma.producto.create({
			data: { ...pick(datos, CAMPOS_CREAR), tenantId },
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

	if (cambios.categoriaId !== undefined) {
		await verificarCategoria(tenantId, cambios.categoriaId);
	}

	return prisma.producto.update({
		where: { id: productoId },
		data: pick(cambios, CAMPOS_ACTUALIZAR),
	});
}

// Usado por la tarjeta [Sprint 2 - 05] (RF-008).
export async function listarAlertasStock(tenantId) {
	const productos = await prisma.producto.findMany({ where: { tenantId, activo: true } });
	return productos.filter((p) => p.stock < p.stockMinimo);
}
