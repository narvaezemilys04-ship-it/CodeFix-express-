import { createContext, useContext, useEffect, useReducer } from "react";
import { setToken, clear, onClear } from "./authStorage.js";

const AuthContext = createContext(null);

const estadoInicial = {
	usuario: null,
	token: null,
};

function reducer(estado, accion) {
	switch (accion.type) {
		case "LOGIN":
			return { usuario: accion.payload.usuario, token: accion.payload.token };
		case "LOGOUT":
			return estadoInicial;
		default:
			return estado;
	}
}

export function AuthProvider({ children }) {
	const [estado, dispatch] = useReducer(reducer, estadoInicial);

	// Si el interceptor de Axios limpia la sesión por un 401, este contexto
	// se entera acá y actualiza su propio estado (dispara el redirect vía
	// ProtectedRoute, que lee `estaAutenticado`).
	useEffect(() => {
		return onClear(() => dispatch({ type: "LOGOUT" }));
	}, []);

	function login({ usuario, token }) {
		setToken(token);
		dispatch({ type: "LOGIN", payload: { usuario, token } });
	}

	function logout() {
		clear();
	}

	const value = {
		usuario: estado.usuario,
		token: estado.token,
		estaAutenticado: Boolean(estado.token),
		login,
		logout,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	const contexto = useContext(AuthContext);
	if (!contexto) {
		throw new Error("useAuth debe usarse dentro de un AuthProvider.");
	}
	return contexto;
}
