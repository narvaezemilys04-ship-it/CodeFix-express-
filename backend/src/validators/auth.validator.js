export function validarLogin(body) {
	const errores = [];
	const { correo, contrasena } = body ?? {};

	if (!correo || typeof correo !== "string" || !correo.trim()) {
		errores.push("El correo es obligatorio.");
	}
	if (!contrasena || typeof contrasena !== "string" || !contrasena.trim()) {
		errores.push("La contraseña es obligatoria.");
	}

	return errores;
}
