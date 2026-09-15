import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

// Esta protección es solo de experiencia de usuario: el control de acceso
// real ocurre siempre en el backend (RF-020, DDS 6.1).
export default function ProtectedRoute({ rolesPermitidos }) {
	const { usuario, estaAutenticado } = useAuth();
	const location = useLocation();

	if (!estaAutenticado) {
		return <Navigate to="/login" replace state={{ from: location }} />;
	}

	if (rolesPermitidos && !rolesPermitidos.includes(usuario.rol)) {
		return <Navigate to="/dashboard" replace />;
	}

	return <Outlet />;
}
