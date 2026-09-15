export default function UsersPage() {
	return (
		<div className="card">
			<h2>Usuarios</h2>
			<p className="auth-note">
				Ruta protegida solo para el rol ADMIN. La gestión visual de usuarios (listar, crear, activar/desactivar)
				se implementa en una tarjeta aparte, aún no planificada en el Kanban.
			</p>
		</div>
	);
}
