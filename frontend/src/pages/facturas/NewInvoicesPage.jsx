import { useEffect, useMemo, useState } from "react";
import { useInvoices } from "../../hooks/useInvoices";
import { useClients } from "../../hooks/useClients";
import { useProducts } from "../../hooks/useProducts";

import Card from "../../components/Card/Card";
import Button from "../../components/Button/Button";
import Input from "../../components/Input/Input";
import Select from "../../components/Select/Select";

import "./NewInvoicesPage.css";

export default function NewInvoicesPage() {
	const { crearFactura } = useInvoices();
	const { clientes, loading: loadingClientes } = useClients();
	const { productos, loading: loadingProductos } = useProducts();

	const [clienteId, setClienteId] = useState("");
	const [productoId, setProductoId] = useState("");
	const [cantidad, setCantidad] = useState(1);

	const [carrito, setCarrito] = useState([]);
	const [numeroFactura, setNumeroFactura] = useState(null);
	const [guardando, setGuardando] = useState(false);

	/* Preselección del primer cliente */
	useEffect(() => {
		if (!clienteId && clientes.length > 0) {
			setClienteId(String(clientes[0].id));
		}
	}, [clientes, clienteId]);

	/* Preselección del primer producto */
	useEffect(() => {
		if (!productoId && productos.length > 0) {
			setProductoId(String(productos[0].id));
		}
	}, [productos, productoId]);

	const opcionesClientes = clientes.map((cliente) => ({
		value: String(cliente.id),
		label: cliente.nombre,
	}));

	const opcionesProductos = productos.map((producto) => ({
		value: String(producto.id),
		label: producto.nombre,
	}));

	const agregarProducto = () => {
		const productoSeleccionado = productos.find(
			(producto) =>
				String(producto.id) === String(productoId)
		);

		if (!productoSeleccionado) {
			return;
		}

		setCarrito((prev) => [
			...prev,
			{
				productoId: productoSeleccionado.id,
				nombre: productoSeleccionado.nombre,
				cantidad: Number(cantidad),
				precioUnitario: Number(productoSeleccionado.precio),
			},
		]);

		setCantidad(1);
	};

	const eliminarProducto = (index) => {
		setCarrito((prev) =>
			prev.filter((_, i) => i !== index)
		);
	};

	const subtotal = useMemo(() => {
		return carrito.reduce(
			(acc, item) =>
				acc +
				item.cantidad * item.precioUnitario,
			0
		);
	}, [carrito]);

	/* Valor informativo solamente */
	const impuesto = useMemo(() => {
		return subtotal * 0.19;
	}, [subtotal]);

	/* Valor informativo solamente */
	const total = useMemo(() => {
		return subtotal + impuesto;
	}, [subtotal, impuesto]);

	const confirmarFactura = async () => {
		if (!clienteId || carrito.length === 0) {
			return;
		}

		try {
			setGuardando(true);

			const payload = {
				clienteId: Number(clienteId),
				lineas: carrito.map((item) => ({
					productoId: item.productoId,
					cantidad: item.cantidad,
				})),
			};

			const respuesta = await crearFactura(payload);

			setNumeroFactura(
				respuesta?.numeroFactura ||
				respuesta?.numero ||
				respuesta?.factura?.numero
			);

			setCarrito([]);
		} catch (error) {
			console.error(error);
			alert("Error al generar la factura");
		} finally {
			setGuardando(false);
		}
	};

	return (
		<div className="new-invoice-page">
			<div className="page-header">
				<h1>Nueva factura</h1>
			</div>

			<Card>
				<div className="invoice-form">
					<Select
						label="Cliente"
						value={clienteId}
						onChange={(e) =>
							setClienteId(e.target.value)
						}
						options={opcionesClientes}
						disabled={loadingClientes}
					/>

					<div className="invoice-product-row">
						<Select
							label="Producto"
							value={productoId}
							onChange={(e) =>
								setProductoId(e.target.value)
							}
							options={opcionesProductos}
							disabled={loadingProductos}
						/>

						<Input
							label="Cantidad"
							type="number"
							min="1"
							value={cantidad}
							onChange={(e) =>
								setCantidad(
									Number(e.target.value)
								)
							}
						/>

						<Button onClick={agregarProducto}>
							Agregar
						</Button>
					</div>
				</div>
			</Card>

			<Card>
				<h2>Carrito</h2>

				<table className="invoice-table">
					<thead>
						<tr>
							<th>Producto</th>
							<th>Cantidad</th>
							<th>Precio Unitario</th>
							<th>Subtotal</th>
							<th></th>
						</tr>
					</thead>

					<tbody>
						{carrito.map((item, index) => (
							<tr key={`${item.productoId}-${index}`}>
								<td>{item.nombre}</td>
								<td>{item.cantidad}</td>
								<td>
									$
									{item.precioUnitario.toFixed(2)}
								</td>
								<td>
									$
									{(
										item.cantidad *
										item.precioUnitario
									).toFixed(2)}
								</td>
								<td>
									<Button
										variant="danger"
										onClick={() =>
											eliminarProducto(index)
										}
									>
										Quitar
									</Button>
								</td>
							</tr>
						))}
					</tbody>
				</table>

				{carrito.length === 0 && (
					<p>No hay productos agregados.</p>
				)}
			</Card>

			<Card>
				<div className="invoice-summary">
					<div>
						<span>Subtotal:</span>
						<strong>
							${subtotal.toFixed(2)}
						</strong>
					</div>

					<div>
						<span>Impuesto (19%):</span>
						<strong>
							${impuesto.toFixed(2)}
						</strong>
					</div>

					<div className="invoice-total">
						<span>Total:</span>
						<strong>
							${total.toFixed(2)}
						</strong>
					</div>
				</div>

				<Button
					onClick={confirmarFactura}
					disabled={
						guardando || carrito.length === 0
					}
				>
					{guardando
						? "Generando..."
						: "Confirmar factura"}
				</Button>

				{numeroFactura && (
					<div className="invoice-success">
						Factura generada correctamente.
						<br />
						<strong>
							Número: #{numeroFactura}
						</strong>
					</div>
				)}
			</Card>
		</div>
	);
}