export function validarCrearCategoria(body) {
	const errores = [];
	const { nombre } = body ?? {};

	if (!nombre || typeof nombre !== "string" || !nombre.trim()) {
		errores.push("El nombre de la categoría es obligatorio.");
	}

	return errores;
}
