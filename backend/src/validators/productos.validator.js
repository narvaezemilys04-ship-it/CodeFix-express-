export function validarCrearProducto(body) {
	const errores = [];
	const { nombre, precio, codigo, categoriaId } = body ?? {};

	if (!nombre || typeof nombre !== "string" || !nombre.trim()) {
		errores.push("El nombre del producto es obligatorio.");
	}
	if (!codigo || typeof codigo !== "string" || !codigo.trim()) {
		errores.push("El código del producto es obligatorio.");
	}
	if (precio === undefined || precio === null || typeof precio !== "number" || precio < 0) {
		errores.push("El precio debe ser un número mayor o igual a 0.");
	}
	if (!categoriaId || typeof categoriaId !== "number") {
		errores.push("La categoría del producto es obligatoria.");
	}

	return errores;
}

export function validarActualizarProducto(body) {
	const errores = [];
	const { precio } = body ?? {};

	if (precio !== undefined && (typeof precio !== "number" || precio < 0)) {
		errores.push("El precio debe ser un número mayor o igual a 0.");
	}

	return errores;
}
