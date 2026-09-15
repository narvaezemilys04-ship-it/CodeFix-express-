import "./Table.css";

// Envuelve <thead>/<tbody> como children porque las columnas cambian por
// módulo (productos, facturas, inventario...); este componente solo aporta
// el contenedor con scroll horizontal y el estilo de tabla del sistema.
export default function Table({ children }) {
	return (
		<div className="table-scroll">
			<table className="data-table">{children}</table>
		</div>
	);
}
