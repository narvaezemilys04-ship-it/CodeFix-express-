import "./Badge.css";

// variant: "success" | "warning" | "danger" | "neutral"
// Ej.: Activo/Completada -> success, En proceso/Bajo stock -> warning,
// Anulada -> danger, Inactivo -> neutral (ver mapas de pantalla).
export default function Badge({ children, variant = "neutral" }) {
	return <span className={`badge badge-${variant}`}>{children}</span>;
}
