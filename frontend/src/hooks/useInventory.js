import { useCallback, useEffect, useState } from "react";
import { listarMovimientos, registrarMovimiento } from "../services/inventory.service.js";

// cargarAlInicio en false evita el GET automático para roles que no tienen
// permiso de listar (VENDEDOR solo puede registrar salidas, DDS 4.2) y
// recibirían un 403 innecesario apenas entran a la página.
export function useInventory({ cargarAlInicio = true } = {}) {
	const [movimientos, setMovimientos] = useState([]);
	const [cargando, setCargando] = useState(cargarAlInicio);
	const [error, setError] = useState("");

	const refrescar = useCallback(async () => {
		setCargando(true);
		setError("");
		try {
			setMovimientos(await listarMovimientos());
		} catch (err) {
			setError(err.response?.data?.error?.mensaje ?? "No se pudieron cargar los movimientos.");
		} finally {
			setCargando(false);
		}
	}, []);

	useEffect(() => {
		if (cargarAlInicio) refrescar();
	}, [cargarAlInicio, refrescar]);

	async function registrar(datos) {
		await registrarMovimiento(datos);
		await refrescar();
	}

	return { movimientos, cargando, error, registrar };
}
