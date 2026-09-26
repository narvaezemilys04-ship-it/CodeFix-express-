import prisma from "../config/prisma.js";
import { ConflictError, NotFoundError } from "../utils/errors.js";

// Todo método recibe tenantId como primer parámetro y lo aplica en la
// consulta (DDS 5.3) — mismo patrón que negocios.service.js del Sprint 1.

export async function registrarMovimiento(tenantId, datos) {
	const { productoId, tipo, cantidad, motivo, observaciones } = datos;

	return prisma.$transaction(async (tx) => {
		const producto = await tx.producto.findFirst({ where: { id: productoId, tenantId } });
		if (!producto) {
			throw new NotFoundError("Producto no encontrado.");
		}

		const stockAnterior = producto.stock;
		let stockNuevo;

		if (tipo === "ENTRADA") {
			stockNuevo = stockAnterior + cantidad;
		} else if (tipo === "SALIDA") {
			stockNuevo = stockAnterior - cantidad;
			if (stockNuevo < 0) {
				throw new ConflictError(
					`El producto no tiene existencias suficientes (disponible: ${stockAnterior}, solicitado: ${cantidad}).`,
					"STOCK_INSUFICIENTE",
				);
			}
		} else {
			// AJUSTE: la cantidad representa el nuevo valor absoluto de stock
			// tras un conteo físico, no un delta.
			stockNuevo = cantidad;
		}

		const movimiento = await tx.movimientoInventario.create({
			data: { tenantId, productoId, tipo, cantidad, stockAnterior, stockNuevo, motivo, observaciones },
		});

		await tx.producto.update({
			where: { id: productoId },
			data: { stock: stockNuevo },
		});

		return movimiento;
	});
}

export async function listarMovimientos(tenantId, filtros = {}) {
	return prisma.movimientoInventario.findMany({
		where: { tenantId, ...filtros },
		orderBy: { fechaMovimiento: "desc" },
	});
}
