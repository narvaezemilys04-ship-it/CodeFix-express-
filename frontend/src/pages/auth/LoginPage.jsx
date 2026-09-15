import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import Button from "../../components/Button/Button.jsx";
import Input from "../../components/Input/Input.jsx";
import { login } from "../../services/auth.service.js";
import { useAuth } from "../../context/AuthContext.jsx";

export default function LoginPage() {
	const { estaAutenticado, login: iniciarSesionEnContexto } = useAuth();
	const navigate = useNavigate();
	const [correo, setCorreo] = useState("");
	const [contrasena, setContrasena] = useState("");
	const [error, setError] = useState("");
	const [cargando, setCargando] = useState(false);

	async function manejarEnvio(evento) {
		evento.preventDefault();
		setError("");

		if (!correo.trim() || !contrasena.trim()) {
			setError("Completá correo y contraseña.");
			return;
		}

		setCargando(true);
		try {
			const data = await login({ correo, contrasena });
			iniciarSesionEnContexto(data);
			navigate("/dashboard", { replace: true });
		} catch (err) {
			const mensaje =
				err.response?.data?.error?.mensaje ?? "No se pudo iniciar sesión.";
			setError(mensaje);
		} finally {
			setCargando(false);
		}
	}

	if (estaAutenticado) {
		return <Navigate to="/dashboard" replace />;
	}

	return (
		<div className="auth-page">
			<form className="auth-form" onSubmit={manejarEnvio}>
				<h1>Iniciar sesión</h1>

				<Input
					id="correo"
					label="Correo"
					type="email"
					value={correo}
					onChange={(evento) => setCorreo(evento.target.value)}
					autoComplete="email"
				/>
				<Input
					id="contrasena"
					label="Contraseña"
					type="password"
					value={contrasena}
					onChange={(evento) => setContrasena(evento.target.value)}
					autoComplete="current-password"
				/>

				{error && <p className="form-error">{error}</p>}

				<Button type="submit" disabled={cargando}>
					{cargando ? "Ingresando..." : "Ingresar"}
				</Button>

				<p className="auth-switch">
					¿No tenés una cuenta?{" "}
					<Link to="/registro-negocio">Registrá tu negocio</Link>
				</p>
			</form>
		</div>
	);
}
