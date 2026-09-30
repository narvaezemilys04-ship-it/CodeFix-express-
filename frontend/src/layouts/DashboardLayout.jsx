import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Button from "../components/Button/Button.jsx";
import "./DashboardLayout.css";

function itemClase({ isActive }) {
	return `app-sidebar-item${isActive ? " is-active" : ""}`;
}

export default function DashboardLayout() {
	const { usuario, logout } = useAuth();

	return (
		<div className="app-layout">
			<aside className="app-sidebar">
				<NavLink to="/dashboard" className={itemClase}>
					<span>Inicio</span>
				</NavLink>

				{usuario?.rol === "ADMIN" && (
					<NavLink to="/usuarios" className={itemClase}>
						<span>Usuarios</span>
					</NavLink>
				)}

				{["ADMIN", "VENDEDOR"].includes(usuario?.rol) && (
					<NavLink to="/clientes" className={itemClase}>
						<span>Clientes</span>
					</NavLink>
				)}
			</aside>

			<div className="app-main">
				<header className="app-topbar">
					<span>
						Hola, {usuario?.nombre} ({usuario?.rol})
					</span>
					<Button variant="secondary" onClick={logout}>
						Cerrar sesión
					</Button>
				</header>

				<main className="app-content">
					<Outlet />
				</main>
			</div>
		</div>
	);
}

{["ADMIN", "VENDEDOR"].includes(usuario?.rol) && (
	<NavLink
		to="/facturas/nueva"
		className={itemClase}
	>
		<span>Nueva factura</span>
	</NavLink>
)}