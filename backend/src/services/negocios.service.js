import prisma from "../config/prisma.js";
import { hashPassword } from "../utils/hash.js";

export class NitDuplicadoError extends Error {}
export class CorreoDuplicadoError extends Error {}

export async function registrarNegocioConAdmin({
	nombre,
	nit,
	tarifaIvaDefault,
	adminNombre,
	adminCorreo,
	adminContrasena,
}) {
	const contraseñaHash = await hashPassword(adminContrasena);

	try {
		return await prisma.$transaction(async (tx) => {
			const negocio = await tx.negocio.create({
				data: {
					nombre,
					nit,
					...(tarifaIvaDefault !== undefined ? { tarifaIvaDefault } : {}),
				},
			});

			const usuario = await tx.usuario.create({
				data: {
					tenantId: negocio.id,
					nombre: adminNombre,
					correo: adminCorreo,
					contraseñaHash,
					rol: "ADMIN",
				},
			});

			return { negocio, usuario };
		});
	} catch (error) {
		if (error.code === "P2002") {
			const indiceViolado = error.meta?.driverAdapterError?.cause?.constraint?.index ?? error.meta?.target;
			const campo = String(indiceViolado ?? "").toLowerCase();
			if (campo.includes("nit")) {
				throw new NitDuplicadoError("Ya existe un negocio registrado con ese NIT.");
			}
			if (campo.includes("correo")) {
				throw new CorreoDuplicadoError("Ya existe un usuario registrado con ese correo.");
			}
		}
		throw error;
	}
}
