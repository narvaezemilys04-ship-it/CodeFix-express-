import { useState } from "react";
import { Link } from "react-router-dom";
import Button from "../../components/Button.jsx";
import Input from "../../components/Input.jsx";
import { registrarNegocio } from "../../services/auth.service.js";

const CAMPOS_INICIALES = {
	nombre: "",
	nit: "",
	adminNombre: "",
	adminCorreo: "",
	adminContrasena: "",
};

export default function RegisterBusinessPage() {
	const [form, setForm] = useState(CAMPOS_INICIALES);
	const [error, setError] = useState("");
	const [cargando, setCargando] = useState(false);
	const [registroExitoso, setRegistroExitoso] = useState(false);

	function actualizarCampo(campo) {
		return (evento) => setForm((prev) => ({ ...prev, [campo]: evento.target.value }));
	}

	async function manejarEnvio(evento) {
		evento.preventDefault();
		setError("");

		const faltaAlgunCampo = Object.values(form).some((valor) => !valor.trim());
		if (faltaAlgunCampo) {
			setError("Completá todos los campos.");
			return;
		}

		setCargando(true);
		try {
			await registrarNegocio(form);
			setRegistroExitoso(true);
		} catch (err) {
			const mensaje = err.response?.data?.error?.mensaje ?? "No se pudo registrar el negocio.";
			setError(mensaje);
		} finally {
			setCargando(false);
		}
	}

	if (registroExitoso) {
		return (
			<div className="auth-page">
				<div className="auth-form auth-success">
					<h1>¡Negocio registrado!</h1>
					<p>Ya podés iniciar sesión con el correo y la contraseña del administrador.</p>
					<Link to="/login">Ir a iniciar sesión</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="auth-page">
			<form className="auth-form" onSubmit={manejarEnvio}>
				<h1>Registrar negocio</h1>

				<Input id="nombre" label="Nombre del negocio" value={form.nombre} onChange={actualizarCampo("nombre")} />
				<Input id="nit" label="NIT" value={form.nit} onChange={actualizarCampo("nit")} />
				<Input
					id="adminNombre"
					label="Nombre del administrador"
					value={form.adminNombre}
					onChange={actualizarCampo("adminNombre")}
				/>
				<Input
					id="adminCorreo"
					label="Correo del administrador"
					type="email"
					value={form.adminCorreo}
					onChange={actualizarCampo("adminCorreo")}
					autoComplete="email"
				/>
				<Input
					id="adminContrasena"
					label="Contraseña"
					type="password"
					value={form.adminContrasena}
					onChange={actualizarCampo("adminContrasena")}
					autoComplete="new-password"
				/>

				{error && <p className="form-error">{error}</p>}

				<Button type="submit" disabled={cargando}>
					{cargando ? "Registrando..." : "Registrar negocio"}
				</Button>

				<p className="auth-switch">
					¿Ya tenés cuenta? <Link to="/login">Iniciar sesión</Link>
				</p>
			</form>
		</div>
	);
}
