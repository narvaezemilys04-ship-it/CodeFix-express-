import { useState } from "react";
import { Link } from "react-router-dom";
import Button from "../../components/Button.jsx";
import Input from "../../components/Input.jsx";
import { login } from "../../services/auth.service.js";

export default function LoginPage() {
	const [correo, setCorreo] = useState("");
	const [contrasena, setContrasena] = useState("");
	const [error, setError] = useState("");
	const [cargando, setCargando] = useState(false);
	const [sesion, setSesion] = useState(null);

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
			setSesion(data);
		} catch (err) {
			const mensaje = err.response?.data?.error?.mensaje ?? "No se pudo iniciar sesión.";
			setError(mensaje);
		} finally {
			setCargando(false);
		}
	}

	if (sesion) {
		return (
			<div className="auth-page">
				<div className="auth-form auth-success">
					<h1>¡Bienvenido, {sesion.usuario.nombre}!</h1>
					<p>Sesión iniciada correctamente como {sesion.usuario.rol}.</p>
					<p className="auth-note">
						(La redirección al panel y la persistencia de sesión se conectan en la próxima tarjeta,
						con el contexto de autenticación.)
					</p>
				</div>
			</div>
		);
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
					¿No tenés una cuenta? <Link to="/registro-negocio">Registrá tu negocio</Link>
				</p>
			</form>
		</div>
	);
}
