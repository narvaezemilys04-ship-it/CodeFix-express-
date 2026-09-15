export class AppError extends Error {
	constructor(mensaje, { status = 500, codigo = "ERROR_INTERNO" } = {}) {
		super(mensaje);
		this.status = status;
		this.codigo = codigo;
	}
}

export class ValidationError extends AppError {
	constructor(mensaje) {
		super(mensaje, { status: 400, codigo: "VALIDACION" });
	}
}

export class UnauthorizedError extends AppError {
	constructor(mensaje = "No autenticado.") {
		super(mensaje, { status: 401, codigo: "NO_AUTENTICADO" });
	}
}

export class ForbiddenError extends AppError {
	constructor(mensaje = "No autorizado.") {
		super(mensaje, { status: 403, codigo: "NO_AUTORIZADO" });
	}
}

export class NotFoundError extends AppError {
	constructor(mensaje = "Recurso no encontrado.") {
		super(mensaje, { status: 404, codigo: "NO_ENCONTRADO" });
	}
}

export class ConflictError extends AppError {
	constructor(mensaje, codigo = "CONFLICTO") {
		super(mensaje, { status: 409, codigo });
	}
}
