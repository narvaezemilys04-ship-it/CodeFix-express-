import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "8h";

export function firmarToken(payload) {
	if (!JWT_SECRET) {
		throw new Error("JWT_SECRET no está configurado en las variables de entorno.");
	}
	return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verificarToken(token) {
	if (!JWT_SECRET) {
		throw new Error("JWT_SECRET no está configurado en las variables de entorno.");
	}
	return jwt.verify(token, JWT_SECRET);
}
