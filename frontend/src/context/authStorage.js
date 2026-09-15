// Puente entre el interceptor de Axios (fuera del árbol de React) y AuthContext.
// El token vive en memoria (nunca en localStorage, DDS 7.1) como una variable
// de módulo simple; AuthContext se suscribe con onClear() para enterarse
// cuando el interceptor limpia la sesión por un 401.
let token = null;
let listeners = [];

export function getToken() {
	return token;
}

export function setToken(nuevoToken) {
	token = nuevoToken;
}

export function clear() {
	token = null;
	listeners.forEach((listener) => listener());
}

export function onClear(listener) {
	listeners.push(listener);
	return () => {
		listeners = listeners.filter((l) => l !== listener);
	};
}
