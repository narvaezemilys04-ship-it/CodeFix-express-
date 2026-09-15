import { useAuth } from "../../context/AuthContext.jsx";

export default function DashboardPage() {
	const { usuario } = useAuth();

	return (
		<div className="card stat-card">
			<span className="stat-card-label">Bienvenido</span>
			<span className="stat-card-value">{usuario?.nombre}</span>
			<span className="stat-card-label">Rol: {usuario?.rol}</span>
		</div>
	);
}
