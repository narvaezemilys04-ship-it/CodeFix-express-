import prisma from "../config/prisma.js";
import { hashPassword } from "../utils/hash.js";
import { ConflictError, NotFoundError } from "../utils/errors.js";

// Todo método recibe tenantId como primer parámetro y lo aplica en la
// consulta (DDS 5.3): ningún ADMIN puede ver o tocar usuarios de otro negocio.

export async function listarUsuarios(tenantId) {
	return prisma.usuario.findMany({
		where: { tenantId },
		select: { id: true, nombre: true, correo: true, rol: true, activo: true, creadoEn: true },
		orderBy: { creadoEn: "asc" },
	});
}

export async function crearUsuario(tenantId, { nombre, correo, contrasena, rol }) {
	const contraseñaHash = await hashPassword(contrasena);

	try {
		const usuario = await prisma.usuario.create({
			data: { tenantId, nombre, correo, contraseñaHash, rol },
		});
		return sanear(usuario);
	} catch (error) {
		if (error.code === "P2002") {
			throw new ConflictError("Ya existe un usuario registrado con ese correo.", "CORREO_DUPLICADO");
		}
		throw error;
	}
}

export async function actualizarUsuario(tenantId, usuarioId, cambios) {
	const usuario = await prisma.usuario.findFirst({ where: { id: usuarioId, tenantId } });
	if (!usuario) {
		throw new NotFoundError("Usuario no encontrado.");
	}

	const actualizado = await prisma.usuario.update({
		where: { id: usuarioId },
		data: {
			...(cambios.rol !== undefined ? { rol: cambios.rol } : {}),
			...(cambios.activo !== undefined ? { activo: cambios.activo } : {}),
		},
	});

	return sanear(actualizado);
}

function sanear(usuario) {
	const { contraseñaHash, ...resto } = usuario;
	return resto;
}
