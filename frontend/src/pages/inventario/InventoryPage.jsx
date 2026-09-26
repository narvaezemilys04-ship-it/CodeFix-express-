import { useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useInventory } from "../../hooks/useInventory.js";
import { useProducts } from "../../hooks/useProducts.js";
import Table from "../../components/Table/Table.jsx";
import Modal from "../../components/Modal/Modal.jsx";
import Select from "../../components/Select/Select.jsx";
import Button from "../../components/Button/Button.jsx";
import Input from "../../components/Input/Input.jsx";
import "./InventoryPage.css";

const TIPOS_ADMIN = [
	{ value: "ENTRADA", label: "Entrada" },
	{ value: "SALIDA", label: "Salida" },
	{ value: "AJUSTE", label: "Ajuste" },
];
const TIPOS_VENDEDOR = [{ value: "SALIDA", label: "Salida" }];

export default function InventoryPage() {
	const { usuario } = useAuth();
	// VENDEDOR no tiene permiso para GET /inventario/movimientos (DDS 4.2) —
	// evitamos el 403 automático no cargando el historial para ese rol.
	const puedeVerHistorial = usuario?.rol !== "VENDEDOR";
	const { movimientos, cargando, error, registrar } = useInventory({ cargarAlInicio: puedeVerHistorial });
	const { productos } = useProducts();

	const tiposDisponibles = usuario?.rol === "VENDEDOR" ? TIPOS_VENDEDOR : TIPOS_ADMIN;

	const [modalAbierto, setModalAbierto] = useState(false);
	const [form, setForm] = useState({ productoId: "", tipo: tiposDisponibles[0].value, cantidad: "", motivo: "" });
	const [errorForm, setErrorForm] = useState("");

	function abrirModal() {
		setForm({
			productoId: productos[0] ? String(productos[0].id) : "",
			tipo: tiposDisponibles[0].value,
			cantidad: "",
			motivo: "",
		});
		setErrorForm("");
		setModalAbierto(true);
	}

	function actualizarCampo(campo) {
		return (evento) => setForm((prev) => ({ ...prev, [campo]: evento.target.value }));
	}

	async function manejarGuardar(evento) {
		evento.preventDefault();
		setErrorForm("");
		try {
			await registrar({
				productoId: Number(form.productoId),
				tipo: form.tipo,
				cantidad: Number(form.cantidad),
				motivo: form.tipo === "AJUSTE" ? form.motivo : undefined,
			});
			setModalAbierto(false);
		} catch (err) {
			setErrorForm(err.response?.data?.error?.mensaje ?? "No se pudo registrar el movimiento.");
		}
	}

	const opcionesProductos = productos.map((p) => ({ value: p.id, label: p.nombre }));

	return (
		<div>
			<div className="inventory-toolbar">
				<h1>Inventario</h1>
				<Button onClick={abrirModal}>+ Nuevo movimiento</Button>
			</div>

			{puedeVerHistorial ? (
				<>
					{error && <p className="form-error">{error}</p>}
					{cargando ? (
						<p>Cargando...</p>
					) : (
						<Table>
							<thead>
								<tr>
									<th>Producto</th>
									<th>Tipo</th>
									<th>Cantidad</th>
									<th>Stock anterior</th>
									<th>Stock nuevo</th>
									<th>Fecha</th>
								</tr>
							</thead>
							<tbody>
								{movimientos.map((m) => (
									<tr key={m.id}>
										<td>{productos.find((p) => p.id === m.productoId)?.nombre ?? m.productoId}</td>
										<td>{m.tipo}</td>
										<td>{m.cantidad}</td>
										<td>{m.stockAnterior}</td>
										<td>{m.stockNuevo}</td>
										<td>{new Date(m.fechaMovimiento).toLocaleString()}</td>
									</tr>
								))}
							</tbody>
						</Table>
					)}
				</>
			) : (
				<p className="text-muted">Como VENDEDOR podés registrar salidas, pero no ver el historial completo.</p>
			)}

			<Modal open={modalAbierto} onClose={() => setModalAbierto(false)} title="Nuevo movimiento">
				<form className="inventory-form" onSubmit={manejarGuardar}>
					<Select
						id="productoId"
						label="Producto"
						value={form.productoId}
						onChange={actualizarCampo("productoId")}
						options={opcionesProductos}
					/>
					<Select id="tipo" label="Tipo" value={form.tipo} onChange={actualizarCampo("tipo")} options={tiposDisponibles} />
					<Input
						id="cantidad"
						label="Cantidad"
						type="number"
						value={form.cantidad}
						onChange={actualizarCampo("cantidad")}
					/>
					{form.tipo === "AJUSTE" && (
						<Input id="motivo" label="Motivo" value={form.motivo} onChange={actualizarCampo("motivo")} />
					)}
					{errorForm && <p className="form-error">{errorForm}</p>}
					<Button type="submit">Guardar</Button>
				</form>
			</Modal>
		</div>
	);
}
