import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import DashboardLayout from "../layouts/DashboardLayout.jsx";
import LoginPage from "../pages/auth/LoginPage.jsx";
import RegisterBusinessPage from "../pages/auth/RegisterBusinessPage.jsx";
import DashboardPage from "../pages/dashboard/DashboardPage.jsx";
import UsersPage from "../pages/usuarios/UsersPage.jsx";

function RutaPorDefecto() {
	const { estaAutenticado } = useAuth();
	return <Navigate to={estaAutenticado ? "/dashboard" : "/login"} replace />;
}

export default function AppRoutes() {
	return (
		<Routes>
			<Route path="/login" element={<LoginPage />} />
			<Route path="/registro-negocio" element={<RegisterBusinessPage />} />

			{/* Autenticadas: cualquier rol */}
			<Route element={<ProtectedRoute />}>
				<Route element={<DashboardLayout />}>
					<Route path="/dashboard" element={<DashboardPage />} />
				</Route>
			</Route>

			{/* Autenticadas: solo ADMIN */}
			<Route element={<ProtectedRoute rolesPermitidos={["ADMIN"]} />}>
				<Route element={<DashboardLayout />}>
					<Route path="/usuarios" element={<UsersPage />} />
				</Route>
			</Route>

			<Route path="*" element={<RutaPorDefecto />} />
		</Routes>
	);
}

import ClientsPage from "../pages/clientes/ClientsPage";
<Route
  path="/clientes"
  element={
    <ProtectedRoute
      roles={["ADMIN", "VENDEDOR"]}
    >
      <ClientsPage />
    </ProtectedRoute>
  }
/>
import NewInvoicesPage from "../pages/facturas/NewInvoicesPage";