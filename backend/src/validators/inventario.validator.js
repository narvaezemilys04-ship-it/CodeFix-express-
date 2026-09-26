const TIPOS_VALIDOS = ["ENTRADA", "SALIDA", "AJUSTE"];

export function validarMovimiento(body) {
	const errores = [];
	const { productoId, cantidad, tipo, motivo } = body ?? {};

	if (!productoId || typeof productoId !== "number") {
		errores.push("El producto es obligatorio.");
	}
	if (!tipo || !TIPOS_VALIDOS.includes(tipo)) {
		errores.push(`El tipo debe ser uno de: ${TIPOS_VALIDOS.join(", ")}.`);
	}
	if (cantidad === undefined || cantidad === null || typeof cantidad !== "number" || cantidad <= 0) {
		errores.push("La cantidad debe ser un número mayor a 0.");
	}
	if (tipo === "AJUSTE" && (!motivo || typeof motivo !== "string" || !motivo.trim())) {
		errores.push("El motivo es obligatorio para un ajuste de inventario.");
	}

	return errores;
}
