import "./Card.css";

export default function Card({ children, className = "" }) {
	return <div className={["card", className].filter(Boolean).join(" ")}>{children}</div>;
}

// Variante especializada para los indicadores del dashboard (ver mapas de pantalla).
export function StatCard({ label, value, helper }) {
	return (
		<Card className="stat-card">
			{label && <span className="stat-card-label">{label}</span>}
			{value && <span className="stat-card-value">{value}</span>}
			{helper && <span className="stat-card-label">{helper}</span>}
		</Card>
	);
}
