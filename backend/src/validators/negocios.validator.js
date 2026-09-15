export function validarRegistroNegocio(body) {
	const errores = [];
	const { nombre, nit, adminNombre, adminCorreo, adminContrasena } = body ?? {};

	if (!nombre || typeof nombre !== "string" || !nombre.trim()) {
		errores.push("El nombre del negocio es obligatorio.");
	}
	if (!nit || typeof nit !== "string" || !nit.trim()) {
		errores.push("El NIT del negocio es obligatorio.");
	}
	if (!adminNombre || typeof adminNombre !== "string" || !adminNombre.trim()) {
		errores.push("El nombre del administrador es obligatorio.");
	}
	if (!adminCorreo || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminCorreo)) {
		errores.push("El correo del administrador no es válido.");
	}
	if (!adminContrasena || typeof adminContrasena !== "string" || adminContrasena.length < 8) {
		errores.push("La contraseña del administrador debe tener al menos 8 caracteres.");
	}

	return errores;
}
