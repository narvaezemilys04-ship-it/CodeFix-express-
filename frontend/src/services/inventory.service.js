import api from "../api/api.js";

export async function listarMovimientos() {
	const { data } = await api.get("/inventario/movimientos");
	return data.movimientos;
}

export async function registrarMovimiento(datos) {
	const { data } = await api.post("/inventario/movimientos", datos);
	return data.movimiento;
}

export async function listarAlertasStock() {
	const { data } = await api.get("/productos/alertas-stock");
	return data.productos;
}
