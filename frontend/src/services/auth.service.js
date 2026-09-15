import api from "./api.js";

export async function registrarNegocio(datos) {
	const { data } = await api.post("/negocios", datos);
	return data;
}

export async function login(credenciales) {
	const { data } = await api.post("/auth/login", credenciales);
	return data;
}
