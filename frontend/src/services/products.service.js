import api from "../api/api.js";

export async function listarProductos() {
	const { data } = await api.get("/productos");
	return data.productos;
}

export async function crearProducto(datos) {
	const { data } = await api.post("/productos", datos);
	return data.producto;
}

export async function actualizarProducto(id, cambios) {
	const { data } = await api.patch(`/productos/${id}`, cambios);
	return data.producto;
}

export async function listarCategorias() {
	const { data } = await api.get("/categorias");
	return data.categorias;
}

export async function crearCategoria(datos) {
	const { data } = await api.post("/categorias", datos);
	return data.categoria;
}
