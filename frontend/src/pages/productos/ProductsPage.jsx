import { useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useProducts } from "../../hooks/useProducts.js";
import Table from "../../components/Table/Table.jsx";
import Badge from "../../components/Badge/Badge.jsx";
import Modal from "../../components/Modal/Modal.jsx";
import Select from "../../components/Select/Select.jsx";
import Button from "../../components/Button/Button.jsx";
import Input from "../../components/Input/Input.jsx";
import "./ProductsPage.css";

const CAMPOS_INICIALES = { nombre: "", codigo: "", precio: "", categoriaId: "", stock: "", stockMinimo: "" };

export default function ProductsPage() {
	const { usuario } = useAuth();
	const { productos, categorias, cargando, error, crear, actualizar } = useProducts();
	const [modalAbierto, setModalAbierto] = useState(false);
	const [productoEditando, setProductoEditando] = useState(null);
	const [form, setForm] = useState(CAMPOS_INICIALES);
	const [errorForm, setErrorForm] = useState("");

	const puedeEditar = usuario?.rol === "ADMIN";

	function abrirCrear() {
		setProductoEditando(null);
		// Preselecciona la primera categoría: un <select> sin ninguna <option>
		// que matchee el value queda vacío en el estado de React aunque el
		// navegador muestre visualmente una opción por defecto (bug real
		// encontrado probando en el navegador, no a simple vista).
		setForm({ ...CAMPOS_INICIALES, categoriaId: categorias[0] ? String(categorias[0].id) : "" });
		setErrorForm("");
		setModalAbierto(true);
	}

	function abrirEditar(producto) {
		setProductoEditando(producto);
		setForm({
			nombre: producto.nombre,
			codigo: producto.codigo,
			precio: String(producto.precio),
			categoriaId: String(producto.categoriaId),
			stock: String(producto.stock),
			stockMinimo: String(producto.stockMinimo),
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
			if (productoEditando) {
				await actualizar(productoEditando.id, {
					precio: Number(form.precio),
					categoriaId: Number(form.categoriaId),
				});
			} else {
				await crear({
					nombre: form.nombre,
					codigo: form.codigo,
					precio: Number(form.precio),
					categoriaId: Number(form.categoriaId),
					stock: Number(form.stock) || 0,
					stockMinimo: Number(form.stockMinimo) || 5,
				});
			}
			setModalAbierto(false);
		} catch (err) {
			setErrorForm(err.response?.data?.error?.mensaje ?? "No se pudo guardar el producto.");
		}
	}

	async function alternarActivo(producto) {
		await actualizar(producto.id, { activo: !producto.activo });
	}

	const opcionesCategorias = categorias.map((c) => ({ value: c.id, label: c.nombre }));

	return (
		<div>
			<div className="products-toolbar">
				<h1>Productos</h1>
				{puedeEditar && <Button onClick={abrirCrear}>+ Nuevo producto</Button>}
			</div>

			{error && <p className="form-error">{error}</p>}

			{cargando ? (
				<p>Cargando...</p>
			) : (
				<Table>
					<thead>
						<tr>
							<th>Nombre</th>
							<th>Código</th>
							<th>Categoría</th>
							<th>Precio</th>
							<th>Stock</th>
							<th>Estado</th>
							{puedeEditar && <th></th>}
						</tr>
					</thead>
					<tbody>
						{productos.map((p) => (
							<tr key={p.id}>
								<td>{p.nombre}</td>
								<td>{p.codigo}</td>
								<td>{categorias.find((c) => c.id === p.categoriaId)?.nombre ?? "—"}</td>
								<td>${Number(p.precio).toLocaleString()}</td>
								<td>{p.stock}</td>
								<td>
									<Badge variant={p.activo ? "success" : "neutral"}>{p.activo ? "Activo" : "Inactivo"}</Badge>
								</td>
								{puedeEditar && (
									<td className="products-table-actions">
										<Button variant="secondary" onClick={() => abrirEditar(p)}>
											Editar
										</Button>
										<Button variant="secondary" onClick={() => alternarActivo(p)}>
											{p.activo ? "Desactivar" : "Activar"}
										</Button>
									</td>
								)}
							</tr>
						))}
					</tbody>
				</Table>
			)}

			<Modal
				open={modalAbierto}
				onClose={() => setModalAbierto(false)}
				title={productoEditando ? "Editar producto" : "Nuevo producto"}
			>
				<form className="products-form" onSubmit={manejarGuardar}>
					<Input
						id="nombre"
						label="Nombre"
						value={form.nombre}
						onChange={actualizarCampo("nombre")}
						disabled={Boolean(productoEditando)}
					/>
					<Input
						id="codigo"
						label="Código"
						value={form.codigo}
						onChange={actualizarCampo("codigo")}
						disabled={Boolean(productoEditando)}
					/>
					<Select
						id="categoriaId"
						label="Categoría"
						value={form.categoriaId}
						onChange={actualizarCampo("categoriaId")}
						options={opcionesCategorias}
					/>
					<Input id="precio" label="Precio" type="number" value={form.precio} onChange={actualizarCampo("precio")} />
					{!productoEditando && (
						<>
							<Input
								id="stock"
								label="Stock inicial"
								type="number"
								value={form.stock}
								onChange={actualizarCampo("stock")}
							/>
							<Input
								id="stockMinimo"
								label="Stock mínimo"
								type="number"
								value={form.stockMinimo}
								onChange={actualizarCampo("stockMinimo")}
							/>
						</>
					)}
					{errorForm && <p className="form-error">{errorForm}</p>}
					<Button type="submit">Guardar</Button>
				</form>
			</Modal>
		</div>
	);
}
