import Card from "../../components/Card/Card.jsx";

export default function UsersPage() {
	return (
		<Card>
			<h2>Usuarios</h2>
			<p className="text-muted">
				Ruta protegida solo para el rol ADMIN. La gestión visual de usuarios (listar, crear, activar/desactivar)
				se implementa en una tarjeta aparte, aún no planificada en el Kanban.
			</p>
		</Card>
	);
}
