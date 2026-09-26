import { useCallback, useEffect, useState } from "react";
import {
	listarProductos,
	crearProducto,
	actualizarProducto,
	listarCategorias,
	crearCategoria,
} from "../services/products.service.js";

// Estado local por página, sin store global (DDS 6.2): cada mutación
// refresca la lista consultando de nuevo al backend.
export function useProducts() {
	const [productos, setProductos] = useState([]);
	const [categorias, setCategorias] = useState([]);
	const [cargando, setCargando] = useState(true);
	const [error, setError] = useState("");

	const refrescar = useCallback(async () => {
		setCargando(true);
		setError("");
		try {
			const [listaProductos, listaCategorias] = await Promise.all([listarProductos(), listarCategorias()]);
			setProductos(listaProductos);
			setCategorias(listaCategorias);
		} catch (err) {
			setError(err.response?.data?.error?.mensaje ?? "No se pudieron cargar los productos.");
		} finally {
			setCargando(false);
		}
	}, []);

	useEffect(() => {
		refrescar();
	}, [refrescar]);

	async function crear(datos) {
		await crearProducto(datos);
		await refrescar();
	}

	async function actualizar(id, cambios) {
		await actualizarProducto(id, cambios);
		await refrescar();
	}

	async function crearNuevaCategoria(datos) {
		await crearCategoria(datos);
		await refrescar();
	}

	return { productos, categorias, cargando, error, crear, actualizar, crearNuevaCategoria };
}
