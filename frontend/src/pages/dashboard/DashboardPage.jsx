import { useAuth } from "../../context/AuthContext.jsx";
import { StatCard } from "../../components/Card/Card.jsx";

export default function DashboardPage() {
	const { usuario } = useAuth();

	return (
		<StatCard label="Bienvenido" value={usuario?.nombre} helper={`Rol: ${usuario?.rol}`} />
	);
}
