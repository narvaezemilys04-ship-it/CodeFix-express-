import prisma from "../config/prisma.js";
import { comparePassword } from "../utils/hash.js";
import { firmarToken } from "../utils/jwt.js";

export class CredencialesInvalidasError extends Error {}

export async function login(correo, contrasena) {
	// Única consulta que NO filtra por tenantId: el tenant todavía no se conoce
	// en este punto del flujo (DDS 5.2.1). El correo es único a nivel de toda
	// la plataforma (DDS 3.2), por eso alcanza con buscar por correo.
	const usuario = await prisma.usuario.findUnique({ where: { correo } });

	if (!usuario || !usuario.activo) {
		throw new CredencialesInvalidasError("Correo o contraseña incorrectos.");
	}

	const contrasenaValida = await comparePassword(contrasena, usuario.contraseñaHash);
	if (!contrasenaValida) {
		throw new CredencialesInvalidasError("Correo o contraseña incorrectos.");
	}

	const token = firmarToken({ id: usuario.id, rol: usuario.rol, tenantId: usuario.tenantId });

	return {
		token,
		usuario: {
			id: usuario.id,
			nombre: usuario.nombre,
			correo: usuario.correo,
			rol: usuario.rol,
			tenantId: usuario.tenantId,
		},
	};
}
