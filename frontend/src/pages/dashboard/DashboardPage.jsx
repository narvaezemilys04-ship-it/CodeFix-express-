import { useAuth } from "../../context/AuthContext.jsx";
import { StatCard } from "../../components/Card/Card.jsx";
import IndicadoresResumen from "./IndicadoresResumen";

export default function DashboardPage() {
	const { usuario } = useAuth();

	return (
		<div>
			<StatCard label="Bienvenido" value={usuario?.nombre} helper={`Rol: ${usuario?.rol}`} />
			{usuario?.rol === "ADMIN" && (
    <IndicadoresResumen />
  )}

  <AlertasStockWidget />
		</div>
	);
}
